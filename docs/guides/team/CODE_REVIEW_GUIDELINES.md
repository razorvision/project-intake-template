# Code Review Guidelines

Best practices for giving and receiving code reviews.

## Table of Contents

- [Review Philosophy](#review-philosophy)
- [Reviewer Responsibilities](#reviewer-responsibilities)
- [Author Responsibilities](#author-responsibilities)
- [Review Checklist](#review-checklist)
- [Giving Feedback](#giving-feedback)
- [Response Time Expectations](#response-time-expectations)
- [Approval Process](#approval-process)

---

## Review Philosophy

### Core Principles

1. **Be kind** - There's a person behind every PR
2. **Be constructive** - Focus on improvement, not criticism  
3. **Be specific** - Vague feedback isn't actionable
4. **Be timely** - Don't block teammates unnecessarily
5. **Be humble** - You might be wrong; ask questions

### Goals of Code Review

- **Catch bugs** - Find issues before production
- **Share knowledge** - Spread understanding across team
- **Maintain quality** - Enforce standards consistently
- **Mentor** - Help teammates grow
- **Document decisions** - Create searchable history

### What Code Review Is NOT

- A gatekeeping exercise
- A chance to show off
- A place for style wars (automate with linters)
- A substitute for testing
- A blame assignment opportunity

---

## Reviewer Responsibilities

### Before Reviewing

1. **Understand the context** - Read the PR description and linked issues
2. **Check the scope** - Is this PR sized appropriately?
3. **Set aside time** - Don't rush through reviews

### During Review

1. **Start with the big picture** - Architecture before details
2. **Run the code** - Check out the branch for complex changes
3. **Look for what's missing** - Tests, docs, error handling
4. **Consider edge cases** - What could go wrong?
5. **Check for security issues** - Input validation, auth, data exposure

### Types of Comments

| Prefix | Meaning | Action Required |
|--------|---------|----------------|
| `nit:` | Minor nitpick | Optional fix |
| `suggestion:` | Consider this approach | Author decides |
| `question:` | Need clarification | Must respond |
| `issue:` | Must be addressed | Required fix |
| `praise:` | Good job! | None |

**Examples:**

```
nit: Consider naming this `userCount` instead of `cnt` for clarity.

suggestion: This could use `useMemo` to avoid recalculating on every render.

question: Why are we catching and ignoring this error? Should we log it?

issue: This SQL query is vulnerable to injection. Please use parameterized queries.

praise: Great refactor! This is much more readable than before.
```

---

## Author Responsibilities

### Before Submitting

- [ ] Self-review your changes (read the diff!)
- [ ] Tests pass locally and in CI
- [ ] PR description explains what and why
- [ ] Linked to relevant issues
- [ ] Reasonable PR size (< 500 lines ideally)
- [ ] No console.logs or debug code
- [ ] No unrelated changes

### PR Description Template

```markdown
## Summary
[What this PR does and why]

## Changes
- [Change 1]
- [Change 2]

## Testing
- [How you tested this]
- [Any manual testing needed]

## Screenshots (if UI change)
[Before/after screenshots]

## Related
Closes #123
```

### Responding to Feedback

1. **Respond to all comments** - Even if just "✅" or "Done"
2. **Ask for clarification** - If feedback is unclear
3. **Explain your reasoning** - If you disagree
4. **Be open to change** - Consider other perspectives
5. **Don't take it personally** - Feedback is about the code

### Addressing Comments

```
✅ Fixed in abc1234

🤔 I see your point, but I kept it this way because [reason]. WDYT?

❓ Could you clarify what you mean by "extract this"?

👍 Great suggestion! Updated.
```

---

## Review Checklist

### Functionality

- [ ] Code does what the PR description says
- [ ] Edge cases handled (null, empty, max values)
- [ ] Error cases handled gracefully
- [ ] No obvious bugs or logic errors
- [ ] Works for all user types (if applicable)

### Code Quality

- [ ] Code is readable and well-organized
- [ ] Functions/components are focused (single responsibility)
- [ ] Naming is clear and consistent
- [ ] No unnecessary complexity
- [ ] No code duplication (DRY)
- [ ] Comments explain "why" not "what" (for complex logic)

### Security

- [ ] No secrets or credentials in code
- [ ] User input is validated
- [ ] SQL queries use parameters (no injection risk)
- [ ] Auth/permissions checked where needed
- [ ] Sensitive data not logged or exposed

### Testing

- [ ] New code has tests
- [ ] Tests are meaningful (not just coverage)
- [ ] Edge cases tested
- [ ] Existing tests still pass

### Performance

- [ ] No obvious performance issues
- [ ] Database queries are efficient
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Large lists virtualized if needed

### TypeScript

- [ ] Types are specific (no `any` without good reason)
- [ ] Function parameters and returns typed
- [ ] No type assertions without comment explaining why

### Documentation

- [ ] README updated if needed
- [ ] API changes documented
- [ ] Complex logic has explanatory comments
- [ ] Breaking changes noted

---

## Giving Feedback

### Effective Feedback Formula

```
[Observation] + [Impact/Reason] + [Suggestion]
```

**Bad:**
> This is wrong.

**Good:**
> This function modifies the input array directly [observation], which can cause unexpected bugs for callers who don't expect mutation [impact]. Consider using `.map()` or spreading to create a new array [suggestion].

### Feedback Examples

**Instead of:**
> Don't use `any`

**Write:**
> Using `any` here bypasses TypeScript's type checking. Could we define an interface for this API response? It'll help catch bugs and provide autocomplete.

**Instead of:**
> This is confusing

**Write:**
> I had to read this function a few times to understand it. Would it help to extract the date logic into a `formatDate` helper? That would also make it testable.

**Instead of:**
> Why did you do it this way?

**Write:**
> I'm curious about the approach here. I might have expected [alternative]. Is there a reason you went this route? (Not saying it's wrong, just want to understand!)

### Asking Questions vs Making Demands

| Demanding | Questioning |
|-----------|------------|
| "Change this to X" | "What do you think about X?" |
| "This is inefficient" | "Could this be a performance concern at scale?" |
| "Don't do this" | "Is there a reason for doing it this way?" |

---

## Response Time Expectations

### Review Turnaround

| PR Size | Initial Review | Follow-up |
|---------|---------------|----------|
| Small (< 100 lines) | Same day | 2-4 hours |
| Medium (100-500 lines) | Within 24 hours | Same day |
| Large (500+ lines) | Within 48 hours | Within 24 hours |

### When Reviews Are Delayed

**As a reviewer:**
- Let the author know if you can't review soon
- Suggest another reviewer if you're blocked

**As an author:**
- Ping politely after 24 hours: "Hey, any chance you could take a look?"
- Ask for alternative reviewer if urgent

---

## Approval Process

### Approval Requirements

- **Minimum 1 approval** required for merge
- **All conversations resolved** before merge
- **CI passing** (tests, lint, build)
- **Branch up to date** with base branch

### Approval Types

| Type | Meaning | When to Use |
|------|---------|-------------|
| **Approve** | Good to merge | No blocking issues |
| **Comment** | Feedback only | Questions or optional suggestions |
| **Request Changes** | Must address | Blocking issues found |

### When to Request Changes

- Security vulnerabilities
- Bugs that will affect users
- Missing tests for critical code
- Breaking changes without migration
- Significantly wrong approach

### When to Approve with Comments

- Minor suggestions (can be addressed in follow-up PR)
- Style preferences (should be automated anyway)
- "Nice to have" improvements
- Questions that don't block merge

---

## Special Cases

### Urgent/Hotfix PRs

- Mark PR as urgent in title: `[URGENT] Fix critical bug`
- Ping team directly for immediate review
- Smaller review bar acceptable for hotfixes
- Must still have tests and not break things
- Follow up with proper fix if needed

### Large Refactors

- Break into smaller PRs if possible
- Provide architecture overview
- Consider pairing/mob review
- Allow more review time

### New Team Members

- More thorough reviews (educational)
- Explain the "why" not just the "what"
- Be extra kind and encouraging
- Pair on first few PRs

---

## Related Documentation

- [Code Quality Policy](../development/CODE_QUALITY_POLICY.md) - PR standards
- [Branch Strategy](BRANCH_STRATEGY.md) - Git workflow
- [Documentation Guidelines](DOCUMENTATION_GUIDELINES.md) - PR descriptions
