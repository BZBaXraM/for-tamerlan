# Contributing to EduAI

Thank you for your interest in contributing to EduAI! 🎉

## How to Contribute

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/edu-ai.git
cd edu-ai

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/edu-ai.git
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` — new features
- `fix/` — bug fixes
- `docs/` — documentation updates
- `refactor/` — code refactoring

### 3. Make Changes

- Follow existing code style
- Add comments for complex logic
- Test your changes locally

### 4. Test

```bash
# Frontend
npm run build

# Backend (Silero TTS)
cd silero-server
bash start.sh
# Test in browser: http://localhost:3000
```

### 5. Commit

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "Add: explanation for TypeScript keyword"
```

Commit message prefixes:
- `Add:` — new feature
- `Fix:` — bug fix
- `Update:` — update existing feature
- `Refactor:` — code refactoring
- `Docs:` — documentation only

### 6. Push and Open PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub with:
- Clear title and description
- What was changed and why
- Screenshots (if UI changes)

## Development Guidelines

### Code Style

**JavaScript/React:**
- Use functional components with hooks
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for complex functions

**Python:**
- Follow PEP 8
- Use type hints
- Add docstrings for functions

### Adding New Explanations

To add text selection explanations, edit `src/components/SelectionTooltip.jsx`:

```javascript
function buildExplanation(selected) {
  const t = selected.toLowerCase()
  
  // Add your keyword
  if (t.includes('your_keyword')) {
    return {
      emoji: '📘',
      title: 'Your Keyword nədir?',
      body: 'Detailed explanation in Azerbaijani...',
      tip: '💡 Praktik məsləhət: ...',
      code: 'const example = "code";'
    }
  }
  // ...
}
```

### Adding New Lessons

Edit `src/utils/lessonData.js`:

```javascript
export const DEFAULT_LESSONS = {
  your_lesson: {
    title: 'Lesson Title',
    lessonText: 'Lesson content in Azerbaijani...',
    teacherSpeech: {
      visual: 'What teacher says at visual position',
      text: 'What teacher says at text position',
      ring: 'What teacher says at ring position'
    },
    // ...
  }
}
```

### Improving TTS

To add support for other languages in Silero server, edit `silero-server/server.py`:

```python
# Change speaker
SPEAKER = "aze_gamat"  # Current: Azerbaijani
# See available speakers: https://github.com/snakers4/silero-models
```

## Testing

### Manual Testing Checklist

Before submitting PR, verify:

- [ ] Frontend builds without errors (`npm run build`)
- [ ] Silero server starts successfully
- [ ] Sound plays when clicking "Səs açıq"
- [ ] Text selection explanations work
- [ ] 3D character animations are smooth
- [ ] Chat sidebar responds correctly
- [ ] No console errors (F12)

### Browser Testing

Test in at least 2 browsers:
- Chrome/Edge (Chromium)
- Firefox or Safari

## Reporting Issues

When opening an issue, include:

1. **Description** — What's wrong?
2. **Steps to reproduce** — How to trigger the bug?
3. **Expected behavior** — What should happen?
4. **Actual behavior** — What actually happens?
5. **Screenshots** — If applicable
6. **Environment:**
   - OS (macOS, Windows, Linux)
   - Browser and version
   - Node.js version (`node -v`)
   - Python version (`python --version`)

## Questions?

- Open a GitHub Discussion
- Check existing issues
- Read documentation in `README.md`

---

**Thank you for contributing!** 🙏
