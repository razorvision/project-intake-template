# Next.js Patterns

This guide covers patterns, configurations, and gotchas for Next.js projects, with a focus on the App Router (Next.js 13+).

## Table of Contents

- [Overview](#overview)
- [Port Management](#port-management)
- [Cache Management](#cache-management)
- [Environment Variables](#environment-variables)
- [App Router Patterns](#app-router-patterns)
- [API Routes](#api-routes)
- [Common Gotchas](#common-gotchas)
- [Commands Reference](#commands-reference)

---

## Overview

### When to Use This Guide

- Starting a new Next.js project
- Troubleshooting Next.js issues
- Setting up development environment
- Understanding App Router patterns

### Versions Covered

- Next.js 13+ (App Router)
- React 18+
- TypeScript

---

## Port Management

### The Rule

**Always use port 3000 for development.**

### Why This Matters

Authentication systems (NextAuth, OAuth providers) rely on callback URLs. If you use a different port:

- OAuth callbacks fail
- NextAuth sessions break
- Redirect loops occur
- Cookies don't work correctly

### Configuration

**In package.json:**
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "dev:clean": "rm -rf .next && next dev -p 3000"
  }
}
```

**In CLAUDE.md:**
```markdown
## Port Management

Always use port 3000. If the port is in use:

1. Find the process: `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Mac/Linux)
2. Kill it before starting dev server
```

### If Port 3000 is Occupied

**Windows (PowerShell):**
```powershell
# Find process
netstat -ano | findstr :3000

# Kill by PID
taskkill /F /PID <PID>
```

**macOS/Linux:**
```bash
# Find and kill
lsof -ti :3000 | xargs kill -9
```

**Never do this:**
```bash
# DON'T use alternate ports
next dev -p 3001  # This will break auth!
```

---

## Cache Management

### The Problem

Next.js caches aggressively. After pulling changes or switching branches, you may see:

- Stale pages
- Old styles
- Cached API responses
- Build errors from old artifacts

### The Solution

**Clear the cache when:**
- Pulling new changes
- Switching branches
- Seeing stale content
- Experiencing mysterious errors

**Command:**
```bash
rm -rf .next && npx prisma generate && npm run dev
```

**Or create a script:**
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "dev:clean": "rm -rf .next && next dev -p 3000",
    "dev:fresh": "rm -rf .next node_modules/.cache && next dev -p 3000"
  }
}
```

### What to Clear

| Directory | When to Clear | Command |
|-----------|--------------|--------|
| `.next/` | Most cache issues | `rm -rf .next` |
| `node_modules/.cache` | Persistent issues | `rm -rf node_modules/.cache` |
| `node_modules/` | Dependency issues | `rm -rf node_modules && npm install` |

---

## Environment Variables

### Structure

Next.js has specific rules for environment variables:

| Prefix | Available In | Example |
|--------|-------------|--------|
| `NEXT_PUBLIC_` | Client + Server | `NEXT_PUBLIC_API_URL` |
| (none) | Server only | `DATABASE_URL` |

### File Priority

```
.env.local           # Local overrides (git-ignored)
.env.development     # Development defaults
.env.production      # Production defaults
.env                 # All environments
```

### Template (.env.example)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Public (client-accessible)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Accessing Variables

**Server-side (API routes, Server Components):**
```typescript
const dbUrl = process.env.DATABASE_URL;
```

**Client-side (only NEXT_PUBLIC_):**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Security Rules

- Never prefix secrets with `NEXT_PUBLIC_`
- Never commit `.env.local`
- Always commit `.env.example` with placeholders
- Use different secrets per environment

---

## App Router Patterns

### Directory Structure

```
src/app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page (/)
├── globals.css         # Global styles
├── (auth)/             # Route group (no URL impact)
│   ├── login/
│   │   └── page.tsx    # /login
│   └── register/
│       └── page.tsx    # /register
├── dashboard/
│   ├── layout.tsx      # Dashboard layout
│   ├── page.tsx        # /dashboard
│   └── settings/
│       └── page.tsx    # /dashboard/settings
└── api/
    └── [...]/route.ts  # API routes
```

### Server vs Client Components

**Default: Server Components**
```tsx
// This is a Server Component by default
export default function Page() {
  // Can use async/await directly
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Client Components (when needed):**
```tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**When to use Client Components:**
- useState, useEffect, or other hooks
- Event handlers (onClick, onChange)
- Browser APIs
- Third-party libraries requiring client

### Data Fetching

**Server Component (recommended):**
```tsx
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store' // or 'force-cache' for static
  });
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <main>{/* use data */}</main>;
}
```

**With Revalidation:**
```tsx
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // Revalidate every hour
});
```

---

## API Routes

### Structure (App Router)

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Dynamic Routes

```typescript
// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id }
  });
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(user);
}
```

### Error Handling Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = schema.parse(body);
    
    // Process
    const result = await processData(validated);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Common Gotchas

### 1. "Module not found" After Installing Package

**Cause:** TypeScript or Next.js cache stale.

**Solution:**
```bash
rm -rf .next node_modules/.cache
npm run dev
```

### 2. Environment Variable Undefined

**Cause:** Missing `NEXT_PUBLIC_` prefix for client-side variable.

**Solution:**
```env
# Server only
API_SECRET=secret

# Client accessible
NEXT_PUBLIC_API_URL=http://api.example.com
```

### 3. Hydration Mismatch Errors

**Cause:** Server and client render different content.

**Solutions:**
- Use `useEffect` for browser-only code
- Ensure consistent rendering
- Check for `typeof window !== 'undefined'` usage

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ClientOnlyComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <div>{/* Browser-only content */}</div>;
}
```

### 4. API Route Returns HTML Instead of JSON

**Cause:** Route file named incorrectly or wrong export.

**Solution:**
- File must be `route.ts` (not `page.tsx`)
- Export named functions (`GET`, `POST`, etc.)
- Don't export `default`

### 5. Static Page Shows Old Data

**Cause:** Page is statically generated and cached.

**Solutions:**
```typescript
// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Or use revalidation
export const revalidate = 60; // seconds

// Or fetch with no-store
fetch(url, { cache: 'no-store' });
```

### 6. Middleware Not Running

**Cause:** Middleware file in wrong location.

**Solution:** Must be at `src/middleware.ts` or `middleware.ts` (project root).

### 7. Auth Callback URL Mismatch

**Cause:** Running on wrong port or URL.

**Solution:**
- Always use port 3000
- Ensure `NEXTAUTH_URL` matches actual URL
- Check OAuth provider callback URL configuration

---

## Commands Reference

### Development

```bash
# Start dev server
npm run dev

# Clean start
rm -rf .next && npm run dev

# With specific port (not recommended)
next dev -p 3000
```

### Building

```bash
# Production build
npm run build

# Start production server
npm start

# Analyze bundle
BUNDLE_ANALYZE=true npm run build
```

### Debugging

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for lint errors
npm run lint

# Clear all caches
rm -rf .next node_modules/.cache
```

---

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Project guidelines
- [Prisma Patterns](PRISMA_PATTERNS.md) - Database integration
- [NextAuth Patterns](NEXTAUTH_PATTERNS.md) - Authentication
- [Coding Standards](../guides/CODING_STANDARDS.md) - Code quality

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

---

**Last Updated:** 2024-12-08
**Maintained By:** Development Team
