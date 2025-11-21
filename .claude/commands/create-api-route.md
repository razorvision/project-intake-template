# Create API Route Command

Create a new API route/endpoint following project standards.

## Instructions

Ask the user for:
1. Route path (e.g., `/api/users`, `/api/posts/:id`)
2. HTTP methods (GET, POST, PUT, PATCH, DELETE)
3. Request body schema (for POST/PUT/PATCH)
4. Response schema
5. Authentication required? (yes/no)
6. Rate limiting needed? (yes/no)

Then create the route following these standards:

## API Route Template (Express)

```typescript
/**
 * [Resource] API Routes
 * Base path: /api/[resource]
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import { rateLimit } from '@/middleware/rateLimit';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Request validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().min(0).max(120).optional(),
});

const updateUserSchema = createUserSchema.partial();

const paramsSchema = z.object({
  id: z.string().uuid(),
});

// GET /api/users - List all users
router.get(
  '/users',
  authenticate, // Add if auth required
  rateLimit({ max: 100, windowMs: 15 * 60 * 1000 }),
  async (req, res) => {
    try {
      const allUsers = await db.select().from(users);

      res.json({
        data: allUsers,
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch users',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }
);

// GET /api/users/:id - Get single user
router.get(
  '/users/:id',
  authenticate,
  validateRequest({ params: paramsSchema }),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      res.json({
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        error: {
          message: 'Failed to fetch user',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }
);

// POST /api/users - Create new user
router.post(
  '/users',
  authenticate,
  rateLimit({ max: 10, windowMs: 15 * 60 * 1000 }),
  validateRequest({ body: createUserSchema }),
  async (req, res) => {
    try {
      const userData = req.body;

      // Check if user exists
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existing) {
        return res.status(409).json({
          error: {
            message: 'User already exists',
            code: 'USER_EXISTS'
          }
        });
      }

      // Create user
      const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning();

      res.status(201).json({
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        error: {
          message: 'Failed to create user',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }
);

// PUT /api/users/:id - Update user (full)
router.put(
  '/users/:id',
  authenticate,
  validateRequest({
    params: paramsSchema,
    body: createUserSchema
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;

      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      res.json({
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: {
          message: 'Failed to update user',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }
);

// PATCH /api/users/:id - Update user (partial)
router.patch(
  '/users/:id',
  authenticate,
  validateRequest({
    params: paramsSchema,
    body: updateUserSchema
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      res.json({
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: {
          message: 'Failed to update user',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }
);

// DELETE /api/users/:id - Delete user
router.delete(
  '/users/:id',
  authenticate,
  validateRequest({ params: paramsSchema }),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [deletedUser] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      if (!deletedUser) {
        return res.status(404).json({
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      res.json({
        data: deletedUser,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        error: {
          message: 'Failed to delete user',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }
);

export default router;
```

## File Location

- Place in: `server/routes/[resource].ts`
- Register in: `server/index.ts`

```typescript
// server/index.ts
import userRoutes from './routes/users';
app.use('/api', userRoutes);
```

## Also Create

1. **Integration Tests** → `tests/integration/[resource].test.ts`
```typescript
import request from 'supertest';
import app from '@/server';

describe('User API', () => {
  describe('GET /api/users', () => {
    it('returns list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/users', () => {
    it('creates a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.data.email).toBe(userData.email);
    });
  });
});
```

2. **Type Definitions** → Update `src/types/api.ts`
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiError {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}
```

## Response Format Standards

**Success:**
```json
{
  "data": { /* resource data */ },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { /* optional */ }
  }
}
```

## Confirm with User

After generating files, show:
- Route paths created
- HTTP methods implemented
- Security middleware applied
- Test files created
- Ask if they want to add any additional validation or business logic
