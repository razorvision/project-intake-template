# Documentation Assets

This folder contains images, screenshots, and other media used in documentation.

## Structure

```
assets/
├── screenshots/     # UI and terminal screenshots
│   ├── github-labels.png
│   ├── project-board.png
│   ├── claude-code-mcp.png
│   └── ...
└── README.md        # This file
```

## Screenshot Guidelines

### Naming Convention

Use kebab-case with descriptive names:
- `github-labels-after-setup.png`
- `project-board-kanban-view.png`
- `claude-code-slash-command.png`
- `terminal-mcp-servers.png`

### Recommended Dimensions

| Type | Width | Notes |
|------|-------|-------|
| Full screen | 1200-1400px | For dashboards, project boards |
| Focused area | 600-800px | For specific UI elements |
| Terminal | 800px | For CLI output |
| GIF | 800px max | Keep file size under 5MB |

### Optimization

Before committing, optimize images:

```bash
# Using ImageOptim (Mac)
imageoptim docs/assets/screenshots/*.png

# Using pngquant (cross-platform)
pngquant --quality=65-80 docs/assets/screenshots/*.png
```

### Embedding in Markdown

```markdown
# Relative path from doc location
![GitHub Labels](../assets/screenshots/github-labels.png)

# With alt text for accessibility
![Screenshot showing 40+ GitHub labels organized by category](../assets/screenshots/github-labels.png)

# Clickable image linking to full size
[![Project Board](../assets/screenshots/project-board-thumb.png)](../assets/screenshots/project-board.png)
```

## Current Screenshots

| Screenshot | Description | Used In |
|------------|-------------|---------|
| `github-labels.png` | Labels page after setup script | README.md |
| `github-repo-main.png` | Repository main page | README.md |
| `github-issue-templates.png` | Issue template chooser | TEMPLATE_USAGE.md |
| `github-pr-template.png` | PR creation page | BRANCH_STRATEGY.md |

## Video Assets

| File | Description |
|------|-------------|
| `VIDEO_SCRIPT.md` | Complete 8-10 minute walkthrough script with recording tips |

## Creating Screenshots

### Automated (Playwright Script)

```bash
# Run the screenshot capture script
node scripts/capture-screenshots.cjs

# This captures GitHub pages automatically
# Edit the script to add more screenshots
```

### Manual

1. Capture with your preferred tool
2. Crop to relevant area
3. Optimize file size
4. Save with descriptive name
5. Update this README if adding new screenshots
