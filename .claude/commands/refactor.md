# Refactor Code Command

Refactor code following best practices while maintaining functionality.

## Instructions

Ask the user for:
1. File(s) or directory to refactor
2. Refactoring goals (extract functions, reduce complexity, improve types, etc.)
3. Keep existing tests passing? (yes/no - default yes)

Then analyze the code and suggest improvements.

## Refactoring Checklist

### 1. Code Smells to Address

- **Long functions** (>50 lines) → Extract smaller functions
- **Duplicated code** → Extract to shared utilities
- **Large classes** → Split into smaller, focused classes
- **Long parameter lists** (>3 params) → Use objects
- **Magic numbers** → Extract to named constants
- **Nested conditionals** (>2 levels) → Early returns or extract functions
- **Large switch statements** → Strategy pattern or lookup tables
- **Comments explaining code** → Rename variables/functions instead

### 2. Extract Functions

**Before:**
```typescript
function processUser(user: User) {
  // Validate
  if (!user.email || !user.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (user.age < 0 || user.age > 120) {
    throw new Error('Invalid age');
  }

  // Transform
  const normalized = {
    ...user,
    email: user.email.toLowerCase(),
    name: user.name.trim()
  };

  // Save
  db.insert(users).values(normalized);
}
```

**After:**
```typescript
function validateUser(user: User): void {
  validateEmail(user.email);
  validateAge(user.age);
}

function validateEmail(email: string): void {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email');
  }
}

function validateAge(age: number): void {
  if (age < 0 || age > 120) {
    throw new Error('Invalid age');
  }
}

function normalizeUser(user: User): User {
  return {
    ...user,
    email: user.email.toLowerCase(),
    name: user.name.trim()
  };
}

function processUser(user: User): void {
  validateUser(user);
  const normalized = normalizeUser(user);
  db.insert(users).values(normalized);
}
```

### 3. Reduce Complexity

**Before (Cyclomatic Complexity: 8):**
```typescript
function getDiscount(user: User, amount: number): number {
  if (user.isPremium) {
    if (amount > 1000) {
      return 0.2;
    } else if (amount > 500) {
      return 0.15;
    } else {
      return 0.1;
    }
  } else {
    if (amount > 1000) {
      return 0.1;
    } else if (amount > 500) {
      return 0.05;
    } else {
      return 0;
    }
  }
}
```

**After (Cyclomatic Complexity: 3):**
```typescript
const DISCOUNT_TIERS = {
  premium: [
    { threshold: 1000, rate: 0.2 },
    { threshold: 500, rate: 0.15 },
    { threshold: 0, rate: 0.1 }
  ],
  regular: [
    { threshold: 1000, rate: 0.1 },
    { threshold: 500, rate: 0.05 },
    { threshold: 0, rate: 0 }
  ]
} as const;

function getDiscount(user: User, amount: number): number {
  const tiers = user.isPremium ? DISCOUNT_TIERS.premium : DISCOUNT_TIERS.regular;
  const tier = tiers.find(t => amount >= t.threshold);
  return tier?.rate ?? 0;
}
```

### 4. Improve Type Safety

**Before:**
```typescript
function formatUser(user: any) {
  return `${user.name} (${user.email})`;
}
```

**After:**
```typescript
interface User {
  name: string;
  email: string;
}

function formatUser(user: User): string {
  return `${user.name} (${user.email})`;
}
```

### 5. Extract Constants

**Before:**
```typescript
if (user.age >= 18 && user.age <= 65) {
  // Process
}

if (amount > 1000) {
  applyDiscount(amount * 0.1);
}
```

**After:**
```typescript
const MIN_WORKING_AGE = 18;
const MAX_WORKING_AGE = 65;
const LARGE_ORDER_THRESHOLD = 1000;
const LARGE_ORDER_DISCOUNT = 0.1;

if (user.age >= MIN_WORKING_AGE && user.age <= MAX_WORKING_AGE) {
  // Process
}

if (amount > LARGE_ORDER_THRESHOLD) {
  applyDiscount(amount * LARGE_ORDER_DISCOUNT);
}
```

### 6. Use Early Returns

**Before:**
```typescript
function processOrder(order: Order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.isValid) {
        // Process order (30 lines)
      } else {
        throw new Error('Invalid order');
      }
    } else {
      throw new Error('No items');
    }
  } else {
    throw new Error('No order');
  }
}
```

**After:**
```typescript
function processOrder(order: Order): void {
  if (!order) {
    throw new Error('No order');
  }

  if (order.items.length === 0) {
    throw new Error('No items');
  }

  if (!order.isValid) {
    throw new Error('Invalid order');
  }

  // Process order (30 lines at indent level 1)
}
```

### 7. Replace Nested Ternaries

**Before:**
```typescript
const status = user.isActive
  ? user.isPremium
    ? 'premium-active'
    : 'regular-active'
  : user.isPremium
    ? 'premium-inactive'
    : 'regular-inactive';
```

**After:**
```typescript
function getUserStatus(user: User): string {
  const tier = user.isPremium ? 'premium' : 'regular';
  const state = user.isActive ? 'active' : 'inactive';
  return `${tier}-${state}`;
}

const status = getUserStatus(user);
```

### 8. Simplify Boolean Logic

**Before:**
```typescript
if (user.isActive === true && user.isVerified === true) {
  // ...
}

if (user.isPremium === false) {
  // ...
}
```

**After:**
```typescript
if (user.isActive && user.isVerified) {
  // ...
}

if (!user.isPremium) {
  // ...
}
```

### 9. Use Object Destructuring

**Before:**
```typescript
function formatAddress(address: Address) {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}
```

**After:**
```typescript
function formatAddress(address: Address): string {
  const { street, city, state, zip } = address;
  return `${street}, ${city}, ${state} ${zip}`;
}
```

### 10. Replace Callbacks with Promises/Async-Await

**Before:**
```typescript
function fetchUser(id: string, callback: (err: Error | null, user?: User) => void) {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results[0]);
    }
  });
}
```

**After:**
```typescript
async function fetchUser(id: string): Promise<User> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
```

## Refactoring Process

1. **Read and understand** the current code
2. **Ensure tests exist** (create if missing)
3. **Run tests** to establish baseline
4. **Identify code smells** and improvement opportunities
5. **Make small, incremental changes**
6. **Run tests after each change**
7. **Commit frequently** with clear messages
8. **Document** significant changes

## Refactoring Metrics

- **Cyclomatic Complexity:** Target < 10 per function
- **Function Length:** Target < 50 lines
- **Parameter Count:** Target ≤ 3
- **Nesting Depth:** Target ≤ 3 levels
- **Duplicated Lines:** Target 0%

## Output Format

```markdown
# Refactoring Report

## Summary
- Files refactored: X
- Functions extracted: X
- Lines reduced: X
- Complexity reduced: X → X

## Changes Made

### 1. [File/Function Name]

**Before:**
- Cyclomatic complexity: 12
- Lines: 85
- Issues: Long function, nested conditionals

**After:**
- Cyclomatic complexity: 4
- Lines: 35
- Improvements: Extracted 3 helper functions, early returns

**Code:**
\`\`\`typescript
// Show key changes
\`\`\`

## Test Status

✅ All tests passing (X/X)

## Recommendations

[Any additional improvements suggested]
```

## Confirm with User

After refactoring:
- Show summary of changes
- Confirm tests still pass
- Ask if they want to continue with additional refactoring
- Suggest documenting patterns for team
