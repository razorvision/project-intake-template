# Add Test Command

Create tests for existing code following project testing standards.

## Instructions

Ask the user for:
1. File path to test
2. Test type (unit, integration, e2e)
3. Specific functionality to test
4. Test framework (Vitest, Jest, Playwright)

Then analyze the code and create comprehensive tests.

## Test File Naming

- **Unit tests:** `[filename].test.ts`
- **Integration tests:** `[feature].integration.test.ts`
- **E2E tests:** `[feature].e2e.test.ts`

## Unit Test Template (Vitest/Jest)

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks, clear storage, etc.
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ComponentName />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('displays correct initial state', () => {
      render(<ComponentName initialValue="test" />);
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<ComponentName className="custom" />);
      expect(container.firstChild).toHaveClass('custom');
    });
  });

  describe('User Interactions', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      render(<ComponentName onClick={handleClick} />);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('updates state on input change', async () => {
      render(<ComponentName />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'new value' } });

      await waitFor(() => {
        expect(input).toHaveValue('new value');
      });
    });

    it('submits form with correct data', async () => {
      const handleSubmit = vi.fn();
      render(<ComponentName onSubmit={handleSubmit} />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          email: 'test@example.com'
        });
      });
    });
  });

  describe('Data Fetching', () => {
    it('shows loading state', () => {
      render(<ComponentName />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('displays data after successful fetch', async () => {
      const mockData = { id: 1, name: 'Test' };
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
      } as Response);

      render(<ComponentName />);

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
    });

    it('handles fetch errors', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<ComponentName />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data', () => {
      render(<ComponentName data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('handles null values', () => {
      render(<ComponentName value={null} />);
      expect(screen.queryByText('null')).not.toBeInTheDocument();
    });

    it('handles undefined props', () => {
      render(<ComponentName value={undefined} />);
      // Should render with default behavior
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ComponentName />);
      expect(screen.getByLabelText('Main content')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<ComponentName />);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter' });
      // Assert expected behavior
    });
  });
});
```

## Integration Test Template

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '@/server';
import { db } from '@/db';

describe('User API Integration', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Setup: Create test user, get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = response.body.token;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await db.delete(users).where(eq(users.email, 'test@example.com'));
  });

  describe('POST /api/users', () => {
    it('creates a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.data).toMatchObject(userData);
      testUserId = response.body.data.id;
    });

    it('returns 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid' })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('returns 409 for duplicate email', async () => {
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'newuser@example.com',
          name: 'Duplicate'
        })
        .expect(409);
    });
  });

  describe('GET /api/users/:id', () => {
    it('retrieves user by id', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.id).toBe(testUserId);
    });

    it('returns 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

## E2E Test Template (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('completes registration successfully', async ({ page }) => {
    // Fill form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('shows validation errors', async ({ page }) => {
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toContainText('Email is required');
  });

  test('handles server errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/register', route => {
      route.fulfill({ status: 500, body: 'Server error' });
    });

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toBeVisible();
  });
});
```

## Test Coverage Goals

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

## Testing Best Practices

1. **AAA Pattern:** Arrange, Act, Assert
2. **Test behavior, not implementation**
3. **One assertion per test** (when possible)
4. **Descriptive test names:** "should X when Y"
5. **Mock external dependencies**
6. **Test edge cases and error paths**
7. **Keep tests fast and isolated**

## Confirm with User

After generating tests, show:
- Test file path
- Number of test cases created
- Coverage areas (rendering, interactions, errors, edge cases)
- Ask if they want additional test scenarios
