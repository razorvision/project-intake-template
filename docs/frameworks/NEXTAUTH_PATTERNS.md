---
layout: default
title: NextAuth.js Patterns
parent: Frameworks
nav_order: 4
---

# NextAuth.js Patterns

This guide covers patterns, configurations, and gotchas for NextAuth.js (Auth.js) authentication.

## Table of Contents

- [Overview](#overview)
- [Session Strategies](#session-strategies)
- [Configuration Patterns](#configuration-patterns)
- [Rate Limiting](#rate-limiting)
- [TypeScript Extensions](#typescript-extensions)
- [Common Providers](#common-providers)
- [Protected Routes](#protected-routes)
- [Common Gotchas](#common-gotchas)
- [Commands Reference](#commands-reference)

---

## Overview

### When to Use This Guide

- Setting up authentication in Next.js
- Configuring OAuth providers
- Implementing session management
- Securing API routes

### Versions Covered

- NextAuth.js v5 (Auth.js)
- NextAuth.js v4 (notes where different)

---

## Session Strategies

### JWT Strategy (Recommended)

**Best for:**
- Serverless deployments
- Stateless architecture
- Simple setups

**Configuration:**
```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ... providers
});
```

**Pros:**
- No database session table needed
- Works well with serverless
- Scales horizontally

**Cons:**
- Can't invalidate sessions server-side
- Token size increases with data
- Logout only affects client

### Database Strategy

**Best for:**
- Need to invalidate sessions
- Session data is large
- Compliance requirements

**Configuration:**
```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
  },
  // ... providers
});
```

**Pros:**
- Can revoke sessions server-side
- Session data in database
- More control over sessions

**Cons:**
- Database call per request
- Requires database adapter
- More complex setup

---

## Configuration Patterns

### Basic Setup (v5)

**File: `src/lib/auth.ts`**
```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

**File: `src/app/api/auth/[...nextauth]/route.ts`**
```typescript
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

### Environment Variables

```env
# Required
AUTH_SECRET=your-secret-key-generate-with-openssl

# For v4 compatibility or explicit URL
NEXTAUTH_URL=http://localhost:3000

# OAuth providers (if using)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Generate secret:**
```bash
openssl rand -base64 32
```

---

## Rate Limiting

### Why Rate Limit Auth Routes

- Prevent brute force attacks
- Protect against credential stuffing
- Reduce abuse

### Implementation Pattern

**File: `src/lib/rate-limit.ts`**
```typescript
type RateLimitStore = Map<string, { count: number; resetTime: number }>;

const store: RateLimitStore = new Map();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // Every minute

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  AUTH_LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },     // 5 per 15 min
  AUTH_REGISTER: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  API_GENERAL: { maxAttempts: 100, windowMs: 60 * 1000 },      // 100 per min
};

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return { 
      allowed: true, 
      remaining: config.maxAttempts - 1,
      resetIn: config.windowMs 
    };
  }

  if (record.count >= config.maxAttempts) {
    return { 
      allowed: false, 
      remaining: 0,
      resetIn: record.resetTime - now 
    };
  }

  record.count++;
  return { 
    allowed: true, 
    remaining: config.maxAttempts - record.count,
    resetIn: record.resetTime - now 
  };
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
```

**Usage in Auth Route:**
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

async function rateLimitedHandler(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
) {
  // Only rate limit credential submissions
  if (request.method === 'POST') {
    const ip = getClientIP(request);
    const result = checkRateLimit(`auth:${ip}`, RATE_LIMITS.AUTH_LOGIN);
    
    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(result.resetIn / 1000)),
          },
        }
      );
    }
  }
  
  return handler(request);
}

export async function GET(request: NextRequest) {
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  return rateLimitedHandler(request, handlers.POST);
}
```

---

## TypeScript Extensions

### Extending Session Type

**File: `src/types/next-auth.d.ts`**
```typescript
import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
  }
}
```

### Using Extended Types

```typescript
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  
  if (session?.user) {
    // TypeScript knows about session.user.id
    console.log(session.user.id);
    console.log(session.user.role);
  }
}
```

---

## Common Providers

### Credentials Provider

```typescript
import Credentials from 'next-auth/providers/credentials';

Credentials({
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    // Validate and return user or null
  },
})
```

### GitHub Provider

```typescript
import GitHub from 'next-auth/providers/github';

GitHub({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
})
```

### Google Provider

```typescript
import Google from 'next-auth/providers/google';

Google({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
})
```

### Multiple Providers

```typescript
export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({ /* ... */ }),
    GitHub({ /* ... */ }),
    Google({ /* ... */ }),
  ],
});
```

---

## Protected Routes

### Server Component Protection

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return <div>Welcome, {session.user?.name}</div>;
}
```

### API Route Protection

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Protected logic here
  return NextResponse.json({ data: 'secret' });
}
```

### Middleware Protection

**File: `src/middleware.ts`**
```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnAuth = req.nextUrl.pathname.startsWith('/login') || 
                   req.nextUrl.pathname.startsWith('/register');

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Client-Side Protection

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedComponent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

---

## Common Gotchas

### 1. Callback URL Mismatch

**Symptoms:**
- OAuth redirects fail
- "Callback URL mismatch" errors

**Causes:**
- Wrong port (not 3000)
- HTTP vs HTTPS mismatch
- Wrong `NEXTAUTH_URL`

**Solution:**
```env
NEXTAUTH_URL=http://localhost:3000
```
And ensure OAuth provider callback URLs match exactly.

### 2. Session is Null in Client Component

**Cause:** Missing SessionProvider.

**Solution:**
```typescript
// src/app/layout.tsx
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

### 3. TypeScript Error: Property 'id' Missing

**Cause:** Session type not extended.

**Solution:** Add type declaration file (see [TypeScript Extensions](#typescript-extensions)).

### 4. Infinite Redirect Loop

**Causes:**
- Middleware too broad
- Protected page redirects to protected page

**Solution:**
```typescript
// Exclude auth pages from middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'],
};
```

### 5. CSRF Token Missing

**Cause:** Usually a cookie issue.

**Solutions:**
- Check `NEXTAUTH_URL` matches actual URL
- Ensure cookies are enabled
- Check for HTTPS in production

### 6. Credentials Provider: User Always Null

**Cause:** `authorize` returning wrong format.

**Solution:** Return object with at least `id` property:
```typescript
return {
  id: user.id,        // Required
  email: user.email,
  name: user.name,
};
```

### 7. Session Not Persisting Across Pages

**Causes:**
- Cookies not working (domain mismatch)
- Session strategy mismatch

**Solution:**
- Check cookie settings
- Ensure consistent session strategy
- Verify `AUTH_SECRET` is set

---

## Commands Reference

### Environment Setup

```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Or using Node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Common Operations

```typescript
// Server-side: Get session
import { auth } from '@/lib/auth';
const session = await auth();

// Server-side: Sign in
import { signIn } from '@/lib/auth';
await signIn('credentials', { email, password });

// Server-side: Sign out
import { signOut } from '@/lib/auth';
await signOut();

// Client-side: Get session
import { useSession } from 'next-auth/react';
const { data: session, status } = useSession();

// Client-side: Sign in
import { signIn } from 'next-auth/react';
await signIn('credentials', { email, password, redirectTo: '/dashboard' });

// Client-side: Sign out
import { signOut } from 'next-auth/react';
await signOut({ redirectTo: '/' });
```

---

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Project guidelines
- [Next.js Patterns](NEXTJS_PATTERNS.md) - Framework integration
- [Prisma Patterns](PRISMA_PATTERNS.md) - Database adapter
- [Coding Standards](../guides/CODING_STANDARDS.md) - Code quality

### External Resources

- [Auth.js Documentation](https://authjs.dev)
- [NextAuth.js v5 Migration](https://authjs.dev/getting-started/migrating-to-v5)
- [Auth.js Prisma Adapter](https://authjs.dev/reference/adapter/prisma)

---

**Last Updated:** 2024-12-08
**Maintained By:** Development Team
