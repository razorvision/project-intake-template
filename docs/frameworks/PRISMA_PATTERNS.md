---
layout: default
title: Prisma Patterns
parent: Frameworks
nav_order: 7
---

# Prisma Patterns

This guide covers patterns, configurations, and gotchas for Prisma ORM projects.

## Table of Contents

- [Overview](#overview)
- [Schema Change Workflow](#schema-change-workflow)
- [Migration Best Practices](#migration-best-practices)
- [Connection Patterns](#connection-patterns)
- [Singleton Client Pattern](#singleton-client-pattern)
- [Query Patterns](#query-patterns)
- [Common Gotchas](#common-gotchas)
- [Commands Reference](#commands-reference)

---

## Overview

### When to Use This Guide

- Setting up Prisma in a new project
- Managing database schema changes
- Troubleshooting connection issues
- Optimizing database queries

### What Prisma Provides

- Type-safe database client
- Schema-as-code
- Migrations management
- Query builder with relations

---

## Schema Change Workflow

### The Standard Workflow

When you modify `prisma/schema.prisma`:

```
1. Edit schema.prisma
        ↓
2. Generate client (npx prisma generate)
        ↓
3. Push/Migrate to database
        ↓
4. Restart dev server
```

### Development: Push Workflow

For rapid iteration during development:

```bash
# After editing schema.prisma
npx prisma db push
```

This:
- Syncs schema to database
- Regenerates Prisma Client
- Does NOT create migration files

**Use when:**
- Prototyping
- Local development
- Schema is in flux

### Production: Migration Workflow

For production-ready changes:

```bash
# Create migration
npx prisma migrate dev --name add_user_roles

# Apply to production
npx prisma migrate deploy
```

This:
- Creates migration SQL files
- Tracks migration history
- Safe for production

**Use when:**
- Schema is stable
- Deploying to production
- Need rollback capability

### Quick Reference

| Situation | Command |
|-----------|--------|
| Schema changed, need client | `npx prisma generate` |
| Schema changed, sync to dev DB | `npx prisma db push` |
| Create production migration | `npx prisma migrate dev --name <name>` |
| Apply migrations in production | `npx prisma migrate deploy` |
| Reset database (dev only) | `npx prisma migrate reset` |

---

## Migration Best Practices

### Naming Conventions

Use descriptive migration names:

```bash
# Good
npx prisma migrate dev --name add_user_email_verification
npx prisma migrate dev --name create_posts_table
npx prisma migrate dev --name add_index_to_users_email

# Bad
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
npx prisma migrate dev --name changes
```

### Safe Schema Changes

**Safe (no data loss):**
- Adding new tables
- Adding nullable columns
- Adding indexes
- Adding new enum values at the end

**Requires caution:**
- Renaming columns (Prisma sees as drop + add)
- Changing column types
- Making columns required
- Removing enum values

### Handling Risky Changes

**Renaming a column:**
```sql
-- In migration file, manually change:
-- DROP COLUMN old_name
-- ADD COLUMN new_name
-- To:
ALTER TABLE "User" RENAME COLUMN "old_name" TO "new_name";
```

**Making column required:**
```sql
-- First, update existing null values
UPDATE "User" SET "email" = 'unknown@example.com' WHERE "email" IS NULL;
-- Then alter column
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
```

### Migration Review Checklist

Before applying migrations:

- [ ] Migration name is descriptive
- [ ] No unintended data loss
- [ ] Indexes added for frequently queried columns
- [ ] Foreign keys have appropriate ON DELETE behavior
- [ ] Migration tested locally

---

## Connection Patterns

### Connection String Structure

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA&options
```

### Common Connection Strings

**Local Development:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp?schema=public"
```

**Neon (Serverless):**
```env
DATABASE_URL="postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Supabase:**
```env
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

**PlanetScale (MySQL):**
```env
DATABASE_URL="mysql://user:pass@aws.connect.psdb.cloud/mydb?sslaccept=strict"
```

### Connection Options

| Option | Purpose | Example |
|--------|---------|--------|
| `sslmode=require` | Force SSL | Required for most cloud DBs |
| `connection_limit=5` | Pool size | Limit connections in serverless |
| `pool_timeout=10` | Pool timeout | Seconds to wait for connection |
| `connect_timeout=10` | Connect timeout | Initial connection timeout |

### Serverless Considerations

For serverless environments (Vercel, AWS Lambda):

```env
# Add connection pooling
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=1"
```

Or use a connection pooler (PgBouncer, Neon pooling).

---

## Singleton Client Pattern

### The Problem

In development, hot reloading creates multiple Prisma Client instances, exhausting database connections.

### The Solution

**Create `src/lib/prisma.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### Usage

```typescript
import { prisma } from '@/lib/prisma';
// or
import prisma from '@/lib/prisma';

// Use in API routes, server components, etc.
const users = await prisma.user.findMany();
```

### With Logging (Development)

```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});
```

---

## Query Patterns

### Basic CRUD

```typescript
// Create
const user = await prisma.user.create({
  data: { email: 'test@example.com', name: 'Test' }
});

// Read
const user = await prisma.user.findUnique({
  where: { id: 'user-id' }
});

// Update
const user = await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'New Name' }
});

// Delete
await prisma.user.delete({
  where: { id: 'user-id' }
});
```

### Relations

```typescript
// Include relations
const userWithPosts = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: {
    posts: true,
    profile: true
  }
});

// Select specific fields
const userEmail = await prisma.user.findUnique({
  where: { id: 'user-id' },
  select: {
    email: true,
    posts: {
      select: { title: true }
    }
  }
});
```

### Filtering

```typescript
// Multiple conditions
const users = await prisma.user.findMany({
  where: {
    AND: [
      { email: { contains: '@company.com' } },
      { createdAt: { gte: new Date('2024-01-01') } }
    ]
  }
});

// OR conditions
const users = await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: 'admin' } },
      { role: 'ADMIN' }
    ]
  }
});
```

### Pagination

```typescript
const pageSize = 10;
const page = 1;

const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});

// Get total count for pagination
const total = await prisma.user.count();
```

### Transactions

```typescript
// Interactive transaction
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { ... } });
  const profile = await tx.profile.create({ 
    data: { userId: user.id, ... } 
  });
  return { user, profile };
});

// Batch transaction
const [users, posts] = await prisma.$transaction([
  prisma.user.findMany(),
  prisma.post.findMany()
]);
```

---

## Common Gotchas

### 1. "Can't reach database server"

**Causes:**
- Database not running
- Wrong connection string
- Network/firewall issues

**Solutions:**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### 2. "Prisma Client not generated"

**Cause:** Schema changed but client not regenerated.

**Solution:**
```bash
npx prisma generate
```

### 3. "Record not found" After Create

**Cause:** Using stale client instance.

**Solution:** Use singleton pattern (see above).

### 4. "Too many connections"

**Cause:** Multiple client instances in development.

**Solutions:**
- Use singleton pattern
- Add connection limit: `?connection_limit=5`
- Use connection pooler

### 5. Schema Drift in Team

**Cause:** Different team members have different schema states.

**Solution:**
```bash
# Reset and re-apply migrations
npx prisma migrate reset

# Or pull schema from database
npx prisma db pull
```

### 6. Migration Conflicts

**Cause:** Multiple devs creating migrations simultaneously.

**Solution:**
- Coordinate migration creation
- Use `prisma migrate resolve` for conflicts
- Consider squashing migrations periodically

### 7. Enum Changes Not Reflecting

**Cause:** Enum values cached in client.

**Solution:**
```bash
npx prisma generate
# Restart dev server
```

---

## Commands Reference

### Schema & Client

```bash
# Generate client from schema
npx prisma generate

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

### Database Sync

```bash
# Push schema to database (dev)
npx prisma db push

# Pull schema from database
npx prisma db pull

# Seed database
npx prisma db seed
```

### Migrations

```bash
# Create migration (dev)
npx prisma migrate dev --name <name>

# Apply migrations (production)
npx prisma migrate deploy

# Reset database and migrations
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Resolve migration issues
npx prisma migrate resolve --applied <migration>
```

### Utilities

```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Execute raw SQL
npx prisma db execute --file ./script.sql
```

---

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Project guidelines
- [Next.js Patterns](NEXTJS_PATTERNS.md) - Framework integration
- [NextAuth Patterns](NEXTAUTH_PATTERNS.md) - Auth with Prisma adapter
- [Coding Standards](../guides/CODING_STANDARDS.md) - Code quality

### External Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

---

**Last Updated:** 2024-12-08
**Maintained By:** Development Team
