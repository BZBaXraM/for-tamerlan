# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Text selection voice feedback** — Teacher speaks explanation aloud when tooltip appears (if sound enabled)

---

## [1.0.0] - 2024-11-13

### Added
- **3D Animated Teacher** — Realistic female character with natural walking animations
- **Silero TTS Integration** — High-quality Azerbaijani speech synthesis (aze_gamat speaker)
- **Text Selection Explanations** — 20+ programming keywords with intelligent tooltips
- **Interactive UI** — Modern interface with lesson panels, chat sidebar, and position navigation
- **Lesson System** — HTML & CSS, System Design lessons with teacherSpeech
- **PDF Upload** — Upload and parse custom lesson PDFs
- **AI Chat Assistant** — Ask questions about programming topics
- **Web Speech API Fallback** — Automatic fallback when Silero unavailable
- **Status Indicators** — Silero availability badge, sound toggle button
- **Responsive Design** — Works on desktop and tablet

### Technical Implementation
- **Frontend:** React 18 + Three.js + React Three Fiber + Vite
- **Backend:** FastAPI + PyTorch + Silero TTS v5_cis_base
- **3D Animations:** Procedural walking, idle gestures (wave, nod, tilt, eyebrow raise)
- **Voice Service:** Priority chain (Silero → Web Speech), automatic health checks
- **Selection Tooltip:** Viewport-level positioning, typewriter effect, structured content

### Fixed
- Dancing animation replaced with natural human-like walking (X-axis leg swing only)
- Tooltip clipping inside stage container (moved to viewport level with `position:fixed`)
- Auto-speech on mount disabled (user controls sound via toggle button)
- Syntax error in App.jsx (merged useEffect blocks separated)
- Silero model download 404 error (corrected URL to CIS-wide model)

### Developer Experience
- `test-tts.html` — Simple TTS test page without React
- Detailed logging in `voiceService.js` and `App.jsx` for debugging
- Setup scripts: `setup.sh`, `start.sh` for Silero server
- Documentation: `README.md`, `STATUS.md`, `DEBUG.md`, `BAŞLANĞIC.md`

---

## [0.1.0] - 2024-11-05

### Added
- Initial project setup
- Basic 3D character model
- React + Vite configuration
- PDF.js integration

---

## Version History

- **v1.0.0** (2024-11-13) — Full release with Silero TTS and text explanations
- **v0.1.0** (2024-11-05) — Initial prototype

---

[Unreleased]: https://github.com/YOUR_USERNAME/edu-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/YOUR_USERNAME/edu-ai/releases/tag/v1.0.0
[0.1.0]: https://github.com/YOUR_USERNAME/edu-ai/releases/tag/v0.1.0
