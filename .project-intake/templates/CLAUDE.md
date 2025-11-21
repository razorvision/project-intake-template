# {{PROJECT_NAME}} - Claude Code Configuration

This file provides context to Claude Code about your project's structure, conventions, and workflows.

## Tech Stack

### Frontend
- **Framework:** {{FRONTEND_FRAMEWORK}} (e.g., React 18.x, Vue 3.x, Angular 16.x)
- **Build Tool:** {{BUILD_TOOL}} (e.g., Vite 5.x, Webpack 5.x, Turbopack)
- **Styling:** {{STYLING_SOLUTION}} (e.g., Tailwind CSS 3.x, CSS Modules, styled-components)
- **Routing:** {{ROUTING_LIBRARY}} (e.g., React Router 6.x, Vue Router 4.x)
- **State Management:** {{STATE_MANAGEMENT}} (e.g., Context API, Redux Toolkit, Zustand, Pinia)
- **UI Components:** {{UI_LIBRARY}} (e.g., shadcn/ui, Material-UI, Chakra UI)
- **Forms:** {{FORMS_LIBRARY}} (e.g., React Hook Form, Formik, VeeValidate)
- **Data Fetching:** {{DATA_FETCHING}} (e.g., TanStack Query, SWR, Apollo Client)

### Backend
- **Framework:** {{BACKEND_FRAMEWORK}} (e.g., Express 4.x, Fastify 4.x, NestJS 10.x)
- **Database:** {{DATABASE}} (e.g., PostgreSQL 16.x, MySQL 8.x, MongoDB 7.x)
- **ORM/Query Builder:** {{ORM}} (e.g., Drizzle, Prisma 5.x, TypeORM, Mongoose)
- **Authentication:** {{AUTH_SOLUTION}} (e.g., JWT, Passport.js, NextAuth.js)
- **Validation:** {{VALIDATION_LIBRARY}} (e.g., Zod, Joi, Yup)

### Development Tools
- **Package Manager:** {{PACKAGE_MANAGER}} (npm, pnpm, yarn, bun)
- **TypeScript:** {{TYPESCRIPT_VERSION}} (e.g., 5.3.x)
- **Linting:** ESLint {{ESLINT_VERSION}}
- **Formatting:** Prettier {{PRETTIER_VERSION}}
- **Testing:** {{TESTING_FRAMEWORK}} (e.g., Vitest, Jest, Playwright)
- **Pre-commit Hooks:** Husky + lint-staged

### Environment
- **Node.js:** {{NODE_VERSION}} or higher
- **Deployment:** {{DEPLOYMENT_PLATFORM}} (e.g., Vercel, Netlify, AWS, Docker)

## Project Structure

```
{{PROJECT_ROOT}}/
├── src/                    # Source code
│   ├── components/        # Reusable UI components
│   │   └── ui/           # Base components (buttons, inputs, etc.)
│   ├── pages/            # Route-level page components
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # Global styles
│   └── App.tsx           # Main application component
├── server/               # Backend code (if applicable)
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware
│   ├── db/              # Database configuration
│   │   ├── schema.ts   # Database schema
│   │   └── migrations/ # Migration files
│   └── services/        # Business logic
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
├── public/              # Static assets
├── .github/             # GitHub configuration
│   ├── workflows/      # GitHub Actions
│   └── ISSUE_TEMPLATE/ # Issue templates
└── docs/                # Documentation

Key directories:
- `/src/components/` - Reusable components following atomic design
- `/src/pages/` - One component per route
- `/src/lib/` - Pure utility functions (no React dependencies)
- `/src/hooks/` - React hooks for shared logic
- `/server/routes/` - API endpoints organized by resource
```

## Commands

### Development
```bash
# Install dependencies
{{PACKAGE_MANAGER}} install

# Start development server
{{PACKAGE_MANAGER}} run dev
# Runs on http://localhost:{{DEV_PORT}}

# Start backend server (if separate)
{{PACKAGE_MANAGER}} run server
# Runs on http://localhost:{{API_PORT}}

# Build for production
{{PACKAGE_MANAGER}} run build

# Start production server
{{PACKAGE_MANAGER}} run start
```

### Testing
```bash
# Run all tests
{{PACKAGE_MANAGER}} test

# Run tests in watch mode
{{PACKAGE_MANAGER}} test:watch

# Run tests with coverage
{{PACKAGE_MANAGER}} test:coverage

# Run specific test file
{{PACKAGE_MANAGER}} test src/components/Button.test.tsx

# Run end-to-end tests
{{PACKAGE_MANAGER}} test:e2e
```

### Code Quality
```bash
# Lint code
{{PACKAGE_MANAGER}} run lint

# Fix linting issues
{{PACKAGE_MANAGER}} run lint:fix

# Format code
{{PACKAGE_MANAGER}} run format

# Type check
{{PACKAGE_MANAGER}} run typecheck
```

### Database (if applicable)
```bash
# Generate migration
{{PACKAGE_MANAGER}} run db:generate

# Run migrations
{{PACKAGE_MANAGER}} run db:migrate

# Reset database
{{PACKAGE_MANAGER}} run db:reset

# Seed database
{{PACKAGE_MANAGER}} run db:seed

# Open database studio
{{PACKAGE_MANAGER}} run db:studio
```

### GitHub CLI
```bash
# Create pull request
gh pr create --title "feat: Add feature" --body "Description"

# List open issues
gh issue list --label "priority: high"

# View project board
gh project view {{PROJECT_NUMBER}} --owner {{OWNER}} --web
```

## Code Style & Conventions

### General Principles
- **Write self-documenting code** - Clear names over comments
- **Keep functions small** - Single responsibility principle
- **Use TypeScript strictly** - Avoid `any`, prefer `unknown` with type guards
- **Follow DRY principle** - Don't repeat yourself
- **Prefer composition over inheritance** - Use hooks and composition

### File Naming
- **React Components:** PascalCase - `UserDashboard.tsx`
- **Pages:** PascalCase - `About.tsx`, `Index.tsx`
- **Utilities:** camelCase - `formatDate.ts`
- **Hooks:** camelCase with `use` prefix - `useAuth.ts`
- **Contexts:** PascalCase with Context suffix - `AuthContext.tsx`
- **Types:** PascalCase - `User.ts`
- **Constants:** SCREAMING_SNAKE_CASE - `API_ENDPOINTS.ts`

### Component Structure
```typescript
/**
 * Component description
 *
 * @example
 * <ComponentName prop1="value" />
 */

// 1. Imports (ordered: React → third-party → local → types → styles)
import { useState, useEffect } from 'react';
import { ExternalLibrary } from 'external-library';
import { LocalComponent } from '@/components/LocalComponent';
import type { ComponentProps } from '@/types';

// 2. Type definitions
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// 3. Component definition
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 4. State
  const [state, setState] = useState<Type>(initialValue);

  // 5. Hooks
  const customHook = useCustomHook();

  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 7. Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // 8. Helper functions
  const helperFunction = () => {
    // Helper logic
  };

  // 9. Early returns
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  // 10. Main render
  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
}
```

### Import Order
```typescript
// 1. React and core libraries
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Third-party UI libraries
import { Button } from '@/components/ui/button';

// 3. Local components (use @ alias)
import { Header } from '@/components/Header';

// 4. Utilities and helpers (use @ alias)
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date';

// 5. Types (use @ alias, type imports)
import type { User } from '@/types/user';

// 6. Styles (if any)
import './Component.css';
```

### TypeScript Conventions
```typescript
// ✅ Good: Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Good: Use type for unions/intersections
type Status = 'pending' | 'success' | 'error';

// ✅ Good: Explicit return types
function getUser(id: string): Promise<User> {
  return api.get(`/users/${id}`);
}

// ✅ Good: Const assertions for literal types
const STATUSES = ['pending', 'success', 'error'] as const;
type Status = typeof STATUSES[number];

// ❌ Bad: Using 'any'
function processData(data: any) { } // Avoid

// ✅ Good: Use 'unknown' with type guards
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string
  }
}
```

### Formatting
- **Indentation:** 2 spaces (not tabs)
- **Line length:** Max 100 characters
- **Quotes:** Single quotes for strings, double for JSX attributes
- **Semicolons:** Always use semicolons
- **Trailing commas:** Yes (easier diffs)
- **Arrow functions:** Use arrow functions for callbacks

### Naming Conventions
- **Variables:** camelCase - `const userName = 'John';`
- **Functions:** camelCase - `function getUserName() {}`
- **Classes:** PascalCase - `class UserService {}`
- **Interfaces:** PascalCase - `interface UserData {}`
- **Types:** PascalCase - `type UserId = string;`
- **Constants:** SCREAMING_SNAKE_CASE - `const API_URL = '...';`
- **Boolean variables:** Use `is`, `has`, `should` prefix - `isLoading`, `hasError`
- **Event handlers:** Use `handle` prefix - `handleClick`, `handleSubmit`

## Repository Etiquette

### Branch Naming
Follow these conventions for branch names:

**Format:** `<prefix>/<description>`

**Prefixes:**
- `feature/` - New features - `feature/add-user-dashboard`
- `bugfix/` - Bug fixes - `bugfix/fix-login-error`
- `hotfix/` - Critical production fixes - `hotfix/security-patch`
- `docs/` - Documentation only - `docs/update-readme`
- `refactor/` - Code refactoring - `refactor/simplify-api`
- `test/` - Test additions - `test/add-unit-tests`
- `chore/` - Maintenance tasks - `chore/update-deps`

**Rules:**
- Use lowercase
- Use hyphens (not underscores or spaces)
- Be descriptive but concise (max ~40 characters)
- Examples: `feature/add-dark-mode`, `bugfix/fix-navbar-collapse`

### Commit Message Format
Follow Conventional Commits specification:

**Format:** `<type>(<scope>): <description>`

**Types:**
- `feat:` - New feature - `feat: Add user registration`
- `fix:` - Bug fix - `fix: Resolve login timeout`
- `docs:` - Documentation - `docs: Update API documentation`
- `style:` - Formatting - `style: Format with Prettier`
- `refactor:` - Code restructuring - `refactor: Simplify auth logic`
- `test:` - Add/update tests - `test: Add login tests`
- `chore:` - Maintenance - `chore: Update dependencies`
- `perf:` - Performance - `perf: Optimize image loading`

**Rules:**
- Use imperative mood: "Add feature" not "Added feature"
- No period at end
- Capitalize first letter
- Keep summary under 72 characters

**Examples:**
```bash
git commit -m "feat: Add dark mode toggle"
git commit -m "fix: Resolve navigation menu bug"
git commit -m "docs: Update installation instructions"
```

### Pull Request Process
1. **Always create PRs** - Never commit directly to `main`
2. **Use PR template** - Fill out all sections
3. **Link related issues** - Use "Closes #123" syntax
4. **Request reviews** - At least one approval required
5. **Address feedback** - Respond to all review comments
6. **Keep PRs focused** - One feature/fix per PR
7. **Update documentation** - Include docs changes in same PR
8. **Ensure tests pass** - All CI checks must be green
9. **Squash commits** - Before merging (if many small commits)

### Pre-commit Hook
This project has a pre-commit hook that **blocks direct commits to main**.

If you see this error:
```
❌ ERROR: Direct commits to 'main' branch are not allowed!
```

Create a feature branch instead:
```bash
git checkout -b feature/my-feature
git add .
git commit -m "feat: Add my feature"
```

**Emergency bypass (not recommended):**
```bash
git commit --no-verify
```

## Custom Tools & Scripts

### GitHub CLI (gh)
This project uses GitHub CLI for issue and PR management:
```bash
# Installed and authenticated
gh --version

# Common commands
gh issue list --label "priority: high"
gh pr create --title "feat: Add feature"
gh pr merge --squash --delete-branch
```

### Playwright
Browser automation and testing:
```bash
npx playwright test
npx playwright test --ui
npx playwright codegen
```

### Database Tools (if applicable)
```bash
# Drizzle Studio (database GUI)
{{PACKAGE_MANAGER}} run db:studio

# Prisma Studio
npx prisma studio
```

## API Conventions

### REST Endpoint Naming
```
GET    /api/users          # List all users
GET    /api/users/:id      # Get single user
POST   /api/users          # Create user
PUT    /api/users/:id      # Update user (full)
PATCH  /api/users/:id      # Update user (partial)
DELETE /api/users/:id      # Delete user

# Nested resources
GET    /api/users/:id/posts       # Get user's posts
POST   /api/users/:id/posts       # Create post for user
```

### Response Format
```typescript
// Success response
{
  "data": { /* resource data */ },
  "message": "Success message"
}

// Error response
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { /* additional context */ }
  }
}
```

## Environment Variables

Required environment variables are documented in `.env.example`.

**Never commit `.env` files** to version control.

```env
# Example structure
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your-secret-key
API_KEY=your-api-key
```

## Security Guidelines

- **Never commit secrets** - Use environment variables
- **Validate all inputs** - Use Zod or similar library
- **Sanitize user input** - Prevent XSS attacks
- **Use parameterized queries** - Prevent SQL injection
- **Hash passwords** - Use bcrypt with 10+ salt rounds
- **Implement rate limiting** - Protect API endpoints
- **Use HTTPS** - Always in production
- **Keep dependencies updated** - Run `npm audit` regularly

## Testing Philosophy

- **Write tests for critical paths** - Authentication, payments, data integrity
- **Test behavior, not implementation** - Focus on what, not how
- **Keep tests simple and readable** - Tests are documentation
- **Mock external dependencies** - APIs, databases, services
- **Use descriptive test names** - Should read like specifications

## Common Patterns

### Error Handling
```typescript
// ✅ Good: Consistent error handling
try {
  const data = await api.post('/endpoint', payload);
  return { data, error: null };
} catch (error) {
  console.error('Error:', error);
  return { data: null, error: error.message };
}
```

### Data Fetching
```typescript
// ✅ Good: Use TanStack Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.get('/users'),
});
```

### Form Handling
```typescript
// ✅ Good: Use React Hook Form
const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => {
  // Handle form submission
};
```

## Documentation

- **README.md** - Project overview, setup, basic usage
- **CONTRIBUTING.md** - Contribution guidelines
- **API.md** - API endpoint documentation (if applicable)
- **ARCHITECTURE.md** - System design and decisions
- **CHANGELOG.md** - Version history

## Need Help?

- Check existing documentation first
- Search closed issues for similar problems
- Ask in team chat or discussions
- Open an issue with clear description

---

**Last Updated:** {{LAST_UPDATED}}
**Maintained By:** {{MAINTAINER}}
