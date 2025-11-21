# Code Review Command

Perform a comprehensive code review following project standards.

## Instructions

1. **Review Against Coding Standards:**
   - Check file naming conventions (PascalCase for components, camelCase for utilities)
   - Verify component structure matches template in CODING_STANDARDS.md
   - Check import order (React → third-party → local → types → styles)
   - Verify consistent formatting (2 spaces, single quotes, semicolons)

2. **TypeScript Quality:**
   - Check for `any` types (should use proper types or `unknown`)
   - Verify explicit return types on functions
   - Check for proper interface/type usage
   - Look for missing null/undefined checks

3. **Component Quality:**
   - Verify components follow single responsibility principle
   - Check for proper prop typing
   - Look for missing error boundaries
   - Check for proper state management
   - Verify hooks follow rules of hooks

4. **Code Duplication:**
   - Identify repeated code that should be extracted
   - Look for similar functions that could be unified
   - Check for copy-paste patterns

5. **Performance Issues:**
   - Check for missing useMemo/useCallback
   - Look for expensive operations in render
   - Check for large dependency arrays in useEffect
   - Identify unnecessary re-renders

6. **Error Handling:**
   - Verify try-catch blocks where needed
   - Check for proper error messages
   - Look for unhandled promise rejections
   - Verify error boundaries in React

7. **Testing:**
   - Check if critical functionality has tests
   - Verify test coverage for edge cases
   - Look for missing integration tests

8. **Documentation:**
   - Check for missing JSDoc comments on complex functions
   - Verify README is up to date
   - Look for unclear variable/function names
   - Check for commented-out code (should be removed)

9. **Accessibility:**
   - Check for semantic HTML
   - Verify ARIA attributes where needed
   - Check for keyboard navigation support
   - Verify alt text on images

10. **Generate Report:**
    - List all issues found with priority
    - Provide specific locations
    - Suggest improvements
    - Highlight positive patterns

## Output Format

```markdown
# Code Review Report

## Summary
- Files Reviewed: X
- Issues Found: X
- Blockers: X
- Suggestions: X

## Blocking Issues

### 1. [Issue Title]
**Priority:** High
**Location:** `path/to/file.ts:123`
**Issue:** [Description]
**Fix:** [How to resolve]

## Suggestions

[Non-blocking improvements]

## Positive Patterns

[Good practices observed]

## Overall Assessment

[Summary and recommendation: Approve / Request Changes / Needs Discussion]
```
