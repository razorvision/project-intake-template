# Debug Command

Help debug issues in the codebase using systematic troubleshooting.

## Instructions

Ask the user for:
1. Description of the problem/bug
2. Steps to reproduce
3. Expected vs actual behavior
4. Any error messages or logs
5. Recent changes that might be related

Then follow the debugging workflow.

## Debugging Workflow

### 1. Reproduce the Issue

- Follow the exact steps provided
- Verify the issue occurs consistently
- Note any variations in behavior
- Check if issue exists in different environments

### 2. Gather Information

**Check error logs:**
```bash
# Browser console (F12)
# Check for JavaScript errors, network failures, warnings

# Server logs
tail -f server.log
npm run dev # Check terminal output

# Database logs (if applicable)
# Check for query errors, connection issues
```

**Review recent changes:**
```bash
# Git history
git log --oneline -10
git diff HEAD~5

# Check recent commits
git show [commit-hash]
```

**Check environment:**
- Node version: `node --version`
- Package versions: Check `package.json`
- Environment variables: Verify `.env` values
- Dependencies: `npm list`

### 3. Isolate the Problem

**Use binary search approach:**
1. Identify the last working state
2. Identify the first broken state
3. Find commits between them: `git bisect`

**Narrow down scope:**
- Is it frontend or backend?
- Is it a specific component/function?
- Does it happen on all data or specific cases?
- Is it environment-specific?

### 4. Add Debugging Output

**Console logging:**
```typescript
// Log function entry and arguments
console.log('fetchUser called with:', userId);

// Log intermediate values
console.log('Query result:', result);

// Log control flow
console.log('Taking branch A');

// Log before errors
console.log('About to call risky operation');
```

**Debugger statements:**
```typescript
function problematicFunction(data: Data) {
  debugger; // Execution will pause here in dev tools

  const processed = processData(data);

  debugger; // Pause again to inspect 'processed'

  return processed;
}
```

**React DevTools:**
- Inspect component props and state
- Track re-renders
- Check component hierarchy

**Network tab:**
- Check API request/response
- Verify headers, status codes
- Look for failed requests

### 5. Common Issue Patterns

**Async/Promise Issues:**
```typescript
// ❌ Forgotten await
const user = getUserAsync(); // Returns Promise
console.log(user.name); // Undefined!

// ✅ Fixed
const user = await getUserAsync();
console.log(user.name); // Works!

// ❌ Unhandled rejection
asyncFunction(); // Error silently swallowed

// ✅ Fixed
asyncFunction().catch(error => {
  console.error('Error:', error);
});
```

**State/Closure Issues:**
```typescript
// ❌ Stale closure
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count); // Always logs 0!
    }, 1000);
  }, []); // Missing dependency

  // ✅ Fixed
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1); // Use functional update
    }, 1000);
  }, []);
}
```

**Race Conditions:**
```typescript
// ❌ Race condition
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults(query).then(setResults); // Can complete out of order!
  }, [query]);

  // ✅ Fixed with abort
  useEffect(() => {
    const controller = new AbortController();

    fetchResults(query, controller.signal)
      .then(setResults)
      .catch(err => {
        if (err.name !== 'AbortError') throw err;
      });

    return () => controller.abort();
  }, [query]);
}
```

**Type Errors:**
```typescript
// ❌ Type mismatch
interface User {
  id: string;
  name: string;
}

const user = JSON.parse(jsonString); // type is 'any'
console.log(user.name); // No type checking!

// ✅ Fixed with validation
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string()
});

const user = UserSchema.parse(JSON.parse(jsonString));
console.log(user.name); // Type-safe!
```

**Null/Undefined:**
```typescript
// ❌ Unchecked null
const user = users.find(u => u.id === userId);
console.log(user.name); // Error if not found!

// ✅ Fixed
const user = users.find(u => u.id === userId);
if (!user) {
  throw new Error('User not found');
}
console.log(user.name); // Safe
```

**Infinite Loops:**
```typescript
// ❌ Infinite re-render
function Component() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([...data, newItem]); // References 'data', triggers effect
  }, [data]); // Infinite loop!

  // ✅ Fixed
  useEffect(() => {
    setData(current => [...current, newItem]); // Functional update
  }, []); // Only run once
}
```

### 6. Test Hypothesis

**Create minimal reproduction:**
```typescript
// Isolate the problematic code
// Remove unrelated functionality
// Test with simple, known inputs
// Verify the issue still occurs
```

**Test fixes:**
```typescript
// Apply potential fix
// Run automated tests
// Manually verify the fix
// Check for regressions
```

### 7. Root Cause Analysis

Ask "Why?" five times:
1. Why did the error occur?
2. Why did that condition exist?
3. Why wasn't it handled?
4. Why wasn't it caught in testing?
5. Why didn't the process prevent this?

## Debugging Tools

**Browser DevTools:**
- Console: Errors, warnings, logs
- Debugger: Breakpoints, step through
- Network: API calls, timing
- React DevTools: Component state/props
- Redux DevTools: State changes

**Server-Side:**
- Node debugger: `node --inspect`
- VS Code debugger: Launch config
- Logging: Winston, Pino
- APM tools: New Relic, DataDog

**Database:**
- Query profiling
- Slow query logs
- Database GUI tools

## Debugging Checklist

- [ ] Reproduced the issue
- [ ] Collected error messages and logs
- [ ] Reviewed recent code changes
- [ ] Isolated the problematic code
- [ ] Added debugging output
- [ ] Tested hypothesis
- [ ] Identified root cause
- [ ] Implemented fix
- [ ] Verified fix works
- [ ] Added test to prevent regression
- [ ] Documented the issue and solution

## Output Format

```markdown
# Debug Report

## Issue Description
[What was wrong]

## Root Cause
[Why it happened]

## Steps to Reproduce
1. Step 1
2. Step 2
3. Observe issue

## Fix Applied
[Description of the fix]

**Code changes:**
\`\`\`typescript
// Before
[problematic code]

// After
[fixed code]
\`\`\`

## Testing
- [x] Manual verification
- [x] Automated tests added
- [x] Regression testing

## Prevention
[How to avoid similar issues in the future]
```

## Confirm with User

After debugging:
- Explain the root cause clearly
- Show the fix
- Ask if issue is resolved
- Suggest tests to prevent recurrence
- Recommend process improvements if applicable
