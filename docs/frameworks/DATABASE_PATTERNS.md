# Database Patterns Guide

Advanced patterns for database operations with Prisma and PostgreSQL.

## Table of Contents

- [Schema Design](#schema-design)
- [Query Patterns](#query-patterns)
- [Transactions](#transactions)
- [Soft Deletes](#soft-deletes)
- [Audit Trails](#audit-trails)
- [Seeding](#seeding)
- [Performance](#performance)

---

## Schema Design

### Base Model Pattern

```prisma
// Common fields for all models
model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Model-specific fields
  email     String   @unique
  name      String?
}
```

### ID Strategies

| Strategy | Pros | Cons | Use When |
|----------|------|------|----------|
| `cuid()` | URL-safe, sortable | Longer | Default choice |
| `uuid()` | Standard format | Not sortable | Interop needed |
| `autoincrement()` | Short, fast | Predictable, leak info | Internal only |
| `nanoid` | Short, URL-safe | Custom function | Short URLs needed |

### Relationships

```prisma
// One-to-Many
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}

// Many-to-Many (explicit)
model Post {
  id    String     @id @default(cuid())
  tags  PostTag[]
}

model Tag {
  id    String     @id @default(cuid())
  name  String     @unique
  posts PostTag[]
}

model PostTag {
  postId String
  tagId  String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([postId, tagId])
}

// Self-referential
model Category {
  id       String     @id @default(cuid())
  name     String
  parentId String?
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
}
```

### Indexes

```prisma
model Post {
  id        String   @id @default(cuid())
  authorId  String
  status    String
  createdAt DateTime @default(now())
  title     String
  
  // Single column index
  @@index([authorId])
  
  // Composite index (order matters!)
  @@index([status, createdAt(sort: Desc)])
  
  // Unique constraint
  @@unique([authorId, title])
}
```

---

## Query Patterns

### Pagination

```typescript
// Offset pagination (simple but slow for large offsets)
async function getUsers(page: number, limit: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ])

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Cursor pagination (better for large datasets)
async function getUsersCursor(cursor?: string, limit: number = 10) {
  const users = await prisma.user.findMany({
    take: limit + 1, // Fetch one extra to check if there's more
    ...(cursor && {
      skip: 1, // Skip the cursor
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: 'desc' },
  })

  const hasMore = users.length > limit
  const data = hasMore ? users.slice(0, -1) : users
  const nextCursor = hasMore ? data[data.length - 1].id : null

  return { data, nextCursor, hasMore }
}
```

### Filtering and Search

```typescript
async function searchUsers(params: {
  search?: string
  role?: string
  status?: string
  createdAfter?: Date
}) {
  const { search, role, status, createdAfter } = params

  return prisma.user.findMany({
    where: {
      // AND conditions
      ...(role && { role }),
      ...(status && { status }),
      ...(createdAfter && { createdAt: { gte: createdAfter } }),
      
      // Search across multiple fields
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  })
}
```

### Select and Include

```typescript
// Select specific fields (reduces data transfer)
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Include relation data
    posts: {
      select: {
        id: true,
        title: true,
      },
      take: 5,
    },
  },
})

// Include relations (returns all fields)
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    posts: true,
    profile: true,
  },
})
```

---

## Transactions

### Sequential Transactions

```typescript
async function transferCredits(fromId: string, toId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    // Deduct from sender
    const sender = await tx.user.update({
      where: { id: fromId },
      data: { credits: { decrement: amount } },
    })

    if (sender.credits < 0) {
      throw new Error('Insufficient credits')
    }

    // Add to receiver
    await tx.user.update({
      where: { id: toId },
      data: { credits: { increment: amount } },
    })

    // Log the transfer
    return tx.transfer.create({
      data: {
        fromUserId: fromId,
        toUserId: toId,
        amount,
      },
    })
  })
}
```

### Batch Transactions

```typescript
// Multiple operations as single transaction
const [users, posts, comments] = await prisma.$transaction([
  prisma.user.findMany(),
  prisma.post.findMany(),
  prisma.comment.count(),
])
```

### Handling Conflicts

```typescript
async function upsertUser(data: UserInput) {
  return prisma.user.upsert({
    where: { email: data.email },
    create: data,
    update: {
      name: data.name,
      updatedAt: new Date(),
    },
  })
}
```

---

## Soft Deletes

### Schema

```prisma
model Post {
  id        String    @id @default(cuid())
  title     String
  deletedAt DateTime?
  
  @@index([deletedAt])
}
```

### Implementation

```typescript
// Soft delete
async function softDeletePost(id: string) {
  return prisma.post.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

// Query non-deleted only
async function getActivePosts() {
  return prisma.post.findMany({
    where: { deletedAt: null },
  })
}

// Restore
async function restorePost(id: string) {
  return prisma.post.update({
    where: { id },
    data: { deletedAt: null },
  })
}

// Hard delete (permanent)
async function hardDeletePost(id: string) {
  return prisma.post.delete({
    where: { id },
  })
}
```

### Middleware for Auto-Filtering

```typescript
// prisma.ts - Add soft delete filtering
prisma.$use(async (params, next) => {
  // Filter soft-deleted records on read
  if (params.model === 'Post') {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args = params.args || {}
      params.args.where = params.args.where || {}
      params.args.where.deletedAt = null
    }
  }
  return next(params)
})
```

---

## Audit Trails

### Audit Log Schema

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  userId     String?
  action     String   // CREATE, UPDATE, DELETE
  entityType String   // User, Post, etc.
  entityId   String
  oldData    Json?
  newData    Json?
  metadata   Json?    // IP address, user agent, etc.
  
  @@index([entityType, entityId])
  @@index([userId])
  @@index([createdAt])
}
```

### Audit Logging Implementation

```typescript
async function createAuditLog(data: {
  userId?: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entityType: string
  entityId: string
  oldData?: unknown
  newData?: unknown
  metadata?: unknown
}) {
  return prisma.auditLog.create({
    data: {
      ...data,
      oldData: data.oldData as any,
      newData: data.newData as any,
      metadata: data.metadata as any,
    },
  })
}

// Usage
async function updateUser(id: string, data: UpdateUserInput, actorId: string) {
  const oldUser = await prisma.user.findUnique({ where: { id } })
  
  const newUser = await prisma.user.update({
    where: { id },
    data,
  })

  await createAuditLog({
    userId: actorId,
    action: 'UPDATE',
    entityType: 'User',
    entityId: id,
    oldData: oldUser,
    newData: newUser,
  })

  return newUser
}
```

---

## Seeding

### Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data (development only)
  if (process.env.NODE_ENV === 'development') {
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  }

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create sample data
  await prisma.post.createMany({
    data: [
      { title: 'First Post', authorId: admin.id, status: 'PUBLISHED' },
      { title: 'Draft Post', authorId: admin.id, status: 'DRAFT' },
    ],
  })

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

### package.json Config

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### Running Seeds

```bash
# Run seed
npx prisma db seed

# Reset database and seed
npx prisma migrate reset
```

---

## Performance

### Query Optimization

```typescript
// Bad: N+1 queries
const users = await prisma.user.findMany()
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } })
}

// Good: Single query with include
const users = await prisma.user.findMany({
  include: { posts: true },
})

// Good: Separate query with IN clause
const users = await prisma.user.findMany()
const posts = await prisma.post.findMany({
  where: { authorId: { in: users.map(u => u.id) } },
})
```

### Connection Pooling

```typescript
// Use connection pooler URL for serverless
// Neon: Use pooler connection string
// PlanetScale: Use @planetscale/database driver

// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Pooler URL
  directUrl = env("DIRECT_URL")  // Direct URL for migrations
}
```

### Singleton Pattern

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

---

## Related Documentation

- [Prisma Patterns](PRISMA_PATTERNS.md) - Basic Prisma patterns
- [API Patterns](../guides/development/API_PATTERNS.md) - API design with database
- [Testing Guide](../guides/development/TESTING_GUIDE.md) - Testing database code
