# Security Review Command

Perform a comprehensive security review of the codebase.

## Instructions

1. **Check for Secrets in Code:**
   - Search for hardcoded API keys, passwords, tokens
   - Look for patterns like: `API_KEY = "sk-"`, `password = "..."`, `token = "..."`
   - Check for AWS keys, database credentials, JWT secrets

2. **Review Environment Variable Usage:**
   - Verify `.env` is in `.gitignore`
   - Check that all secrets use environment variables
   - Ensure `.env.example` documents all required variables

3. **Input Validation:**
   - Check for user input validation (Zod, Joi, Yup)
   - Look for unvalidated data in database queries
   - Check API endpoints for validation middleware

4. **SQL Injection Prevention:**
   - Search for string concatenation in SQL queries
   - Verify parameterized queries or ORM usage
   - Check for raw SQL execution

5. **XSS Prevention:**
   - Look for `dangerouslySetInnerHTML` usage
   - Check for unsanitized HTML output
   - Verify proper escaping in templates

6. **Authentication & Authorization:**
   - Review password hashing (bcrypt with 10+ rounds)
   - Check JWT implementation (expiration, secret management)
   - Verify protected route middleware
   - Check session configuration (secure, httpOnly, sameSite)

7. **API Security:**
   - Check for rate limiting on endpoints
   - Review CORS configuration
   - Verify security headers (helmet)
   - Check for API key validation

8. **Dependency Security:**
   - Run `npm audit` and report vulnerabilities
   - Check for outdated critical packages
   - Verify lock file is committed

9. **MCP Security (if using):**
   - Review `.mcp.json` configuration
   - Check for pinned versions
   - Verify no credentials in MCP config
   - Check filesystem access is scoped to project

10. **Generate Report:**
    - List all security issues found with severity (Critical/High/Medium/Low)
    - Provide specific file locations and line numbers
    - Suggest fixes for each issue
    - Prioritize by severity

## Output Format

```markdown
# Security Review Report

## Summary
- Critical Issues: X
- High Priority: X
- Medium Priority: X
- Low Priority: X

## Critical Issues

### 1. [Issue Title]
**Severity:** Critical
**Location:** `path/to/file.ts:123`
**Description:** [Detailed description]
**Recommendation:** [How to fix]

## High Priority Issues

[Continue for each severity level]

## Recommendations

[Overall security recommendations]
```
