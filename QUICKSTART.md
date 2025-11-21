# Quick Start Guide

Get your project management infrastructure up and running in 5 minutes.

## Step 1: Copy Files (1 minute)

```bash
# Navigate to your repository
cd /path/to/your/repo

# Copy the .github directory
cp -r /path/to/pm-package/.github/* ./.github/

# Make the setup script executable
chmod +x /path/to/pm-package/setup-labels.sh
```

## Step 2: Run Setup Script (2 minutes)

```bash
# Run the automated setup
/path/to/pm-package/setup-labels.sh
```

This creates:
- ✅ 20 labels (priority, type, status, phase, client, effort, epic)
- ✅ 3 milestones (Phase 1, 2, 3)

## Step 3: Create Project Board (2 minutes)

1. Go to your repo on GitHub
2. Click **Projects** tab → **New project**
3. Select **Board** view
4. Name it "Main Board" or "Development Board"
5. Add columns: Backlog → Ready → In Progress → In Review → Done

**Optional:** Follow [PROJECT_VIEWS_GUIDE.md](/.github/PROJECT_VIEWS_GUIDE.md) for 8 recommended views

## Step 4: Daily Workflow Commands

Add these to your daily routine:

```bash
# Morning standup: Check project board
gh project view [NUMBER] --owner [OWNER] --web

# Check PRs needing review
gh pr list

# Check issues needing attention
gh issue list --label "status: needs-review"
```

Replace `[NUMBER]` and `[OWNER]` with your project details.

## Step 5: Create Your First Issue

```bash
# Create a new issue (uses templates automatically)
gh issue create

# Or via GitHub web UI
# Click Issues → New Issue → Choose template
```

---

## Common Customizations

### Change Phase Labels to Sprints

```bash
# Delete phase labels
gh label delete "phase: 1" "phase: 2" "phase: 3"

# Create sprint labels
gh label create "sprint-1" --color "d876e3"
gh label create "sprint-2" --color "d876e3"
# etc.
```

### Add Environment Labels

```bash
gh label create "env: production" --color "d73a4a"
gh label create "env: staging" --color "fbca04"
gh label create "env: development" --color "0e8a16"
```

### Add Platform Labels (Mobile/Desktop)

```bash
gh label create "platform: ios" --color "000000"
gh label create "platform: android" --color "3DDC84"
gh label create "platform: web" --color "0066cc"
```

---

## Troubleshooting

### "gh: command not found"

Install GitHub CLI: https://cli.github.com/

### "Label already exists" errors

This is normal if re-running the script. Existing labels are preserved.

### Can't create milestones

Check repo permissions. You need admin or write access.

### Project board not showing issues

Link the project to your repository:
1. Project Settings → Manage access
2. Link repository

---

## What's Next?

- 📖 Read [PROJECT_MANAGEMENT_GUIDE.md](/.github/PROJECT_MANAGEMENT_GUIDE.md) for complete workflows
- 📊 Set up advanced views with [PROJECT_VIEWS_GUIDE.md](/.github/PROJECT_VIEWS_GUIDE.md)
- 📝 Review issue templates in `.github/ISSUE_TEMPLATE/`
- 🔄 Try the weekly status report template

---

**Need Help?** Review the full [README.md](README.md) for detailed instructions.
