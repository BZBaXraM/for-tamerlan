# 🎓 EduAI — Interactive 3D AI Teacher

[![Build Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/edu-ai/build.yml?branch=main)](https://github.com/YOUR_USERNAME/edu-ai/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.9-blue)](https://www.python.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Interactive web application with a 3D animated female character who teaches programming in Azerbaijani language. Features natural human-like animations, high-quality Azerbaijani text-to-speech (Silero TTS), and intelligent text selection explanations.

![EduAI Screenshot](WhatsApp%20Image%202026-11-03%20at%2001.43.50.jpeg)

---

## ✨ Features

- **🎭 Realistic 3D Character** — Female teacher with natural walking animations (no dancing!)
- **🗣️ Azerbaijani TTS** — High-quality speech synthesis using Silero v5_cis_base (aze_gamat speaker)
- **📖 Smart Text Explanations** — Select any programming term to get instant explanation above teacher's head
- **🎨 Modern UI** — Clean, responsive interface with lesson panels and interactive chat
- **💬 AI Chat Assistant** — Ask questions about HTML, CSS, React, Redis, JWT, and more
- **📄 PDF Support** — Upload and explain PDF lessons

### Supported Programming Topics

Text selection automatically explains 20+ keywords:
- **Frontend:** DOM, HTML, CSS, JavaScript, React, Redux, Hook, Component
- **Backend:** API, REST, JSON, Node.js, Express
- **Database:** Redis, Memcached, SQL
- **Security:** JWT, Token, Authentication
- **Architecture:** Microservices, Docker, Kubernetes

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.9+ (for Silero TTS backend)
- **Git** (to clone repository)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/edu-ai.git
cd edu-ai

# 2. Install frontend dependencies
npm install

# 3. Setup Silero TTS server
cd silero-server
bash setup.sh
cd ..
```

**One-command start (recommended):**
```bash
bash start-all.sh
```

This will:
- Install dependencies (if needed)
- Start Silero TTS server (port 8765)
- Start Vite dev server (port 3000)
- Open browser automatically

**Stop all servers:**
```bash
bash stop-all.sh
```

### Running the Application

**Terminal 1: Start Silero TTS Server**
```bash
cd silero-server
bash start.sh
```

**Terminal 2: Start Frontend Dev Server**
```bash
npm run dev
```

Open in browser: **http://localhost:3000**

---

## 📋 Detailed Setup

### Frontend Setup

```bash
# Install dependencies
npm install

# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Backend (Silero TTS) Setup

```bash
cd silero-server

# One-time setup (creates venv, installs dependencies, downloads model)
bash setup.sh

# Start server (runs on http://localhost:8765)
bash start.sh

# Check server health
curl http://localhost:8765/health
# → {"status":"ok","language":"aze","speaker":"aze_gamat"}
```

**First run downloads the Silero model (~120 MB) to `~/.cache/silero_edu/`**

---

## 🧪 Testing

### Quick TTS Test (without React)

```bash
# Open test page in browser
open test-tts.html
```

Click buttons:
1. **"1️⃣ Check Health"** → Verify Silero server is running
2. **"2️⃣ Test Silero TTS"** → Test high-quality Azerbaijani speech
3. **"3️⃣ Test Web Speech"** → Test browser fallback

### Main Application Test

1. Open http://localhost:3000
2. Press **F12** (Developer Tools → Console)
3. Click **"Səssiz"** button → becomes **"Səs açıq"** 🟢
4. Teacher should start speaking immediately!

**Check console logs:**
```
[voiceService] 🎤 Sending to Silero: Salam! Bu HTML və CSS dərsinə...
[voiceService] ✅ Silero response OK, size: 114644
[voiceService] 🔊 Got audio blob, size: 114644 bytes
[voiceService] ▶️ Audio started playing
```

---

## 🏗️ Project Structure

```
edu-ai/
├── src/
│   ├── components/
│   │   ├── RealisticHumanTeacher.jsx    # 3D character + animations
│   │   ├── SelectionTooltip.jsx         # Text explanation tooltip
│   │   ├── StudioScene.jsx              # 3D scene setup
│   │   ├── VisualPanel.jsx              # Video/diagram panel
│   │   ├── LessonTextPanel.jsx          # Lesson text display
│   │   ├── ChatSidebar.jsx              # AI chat interface
│   │   └── ...
│   ├── utils/
│   │   ├── voiceService.js              # Silero + Web Speech TTS
│   │   └── lessonData.js                # Lesson content
│   └── App.jsx                          # Main application
│
├── silero-server/
│   ├── server.py                        # FastAPI TTS server
│   ├── requirements.txt                 # Python dependencies
│   ├── setup.sh                         # Installation script
│   ├── start.sh                         # Server start script
│   └── README.md                        # Server documentation
│
├── public/
│   └── models/                          # 3D model files (.glb)
│
├── package.json                         # Node.js dependencies
├── vite.config.js                       # Vite configuration
├── index.html                           # HTML entry point
└── README.md                            # This file
```

---

## 🔧 Configuration

### Frontend (Vite)

Default configuration in `vite.config.js`:
- Dev server: http://localhost:3000
- Hot Module Replacement (HMR) enabled
- React plugin with Fast Refresh

### Backend (Silero TTS)

Server configuration in `silero-server/server.py`:
```python
PORT        = 8765
SAMPLE_RATE = 24000       # 24 kHz audio quality
SPEAKER     = "aze_gamat" # Azerbaijani speaker
```

Change speaker or port by editing `server.py` and restarting server.

---

## 📖 Usage

### 1. Enable Sound

Click **"Səssiz"** button in navbar → becomes **"Səs açıq"** 🟢

Teacher will start speaking immediately.

### 2. Navigate Lessons

Click lesson buttons in top navbar:
- **HTML & CSS 01**
- **Sistem Dizaynı 06**

Or upload custom PDF: **"PDF Yüklə"** button

### 3. Change Focus Position

Click bottom navigation buttons:
- **📊 Visual** — Explain diagram/video
- **📖 Text** — Explain lesson text
- **💍 Ring** — Explain ring widget

Teacher walks to selected position and explains content.

### 4. Get Text Explanations

Select any programming term in the lesson text → Explanation card appears above teacher's head with:
- 📘 **Title** — What is this?
- 💡 **Explanation** — Detailed description in Azerbaijani
- 🎯 **Tip** — Practical usage tip
- 💻 **Code example** — (if applicable)

**🔊 Teacher will speak the explanation aloud** (if sound is enabled).

### 5. Chat with AI

Click **chat icon** in top-right → sidebar opens

Ask questions like:
- "HTML teqləri necə işləyir?"
- "Redis nədir?"
- "JWT nə üçün lazımdır?"

---

## 🐛 Troubleshooting

### No Sound

**Problem:** Teacher doesn't speak when clicking "Səs açıq"

**Solutions:**
1. Check system volume is not muted
2. Verify Silero server is running:
   ```bash
   curl http://localhost:8765/health
   ```
3. Check browser console (F12) for errors
4. Try test-tts.html for isolated test

### Silero Server Not Running

**Problem:** Status badge shows 🟡 "TTS yoxdur"

**Solution:**
```bash
cd silero-server
bash start.sh
```

Refresh browser (Cmd+R or F5)

### Browser Blocks Autoplay

**Problem:** Console error: `NotAllowedError: play() failed`

**Solution:** Click ANYWHERE on page first, then enable sound. Chrome/Safari require user interaction before playing audio.

### Model Download Failed

**Problem:** Server error: "Failed to download model"

**Solution:**
```bash
# Manual download
mkdir -p ~/.cache/silero_edu
cd ~/.cache/silero_edu
curl -O https://models.silero.ai/models/tts/ru/v5_cis_base.pt
```

Restart Silero server.

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use`

**Solution:**
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 8765 (backend)
lsof -ti:8765 | xargs kill -9

# Restart servers
npm run dev
cd silero-server && bash start.sh
```

---

## 🎯 Status Indicators

### Navbar Status Badge

- 🟢 **Silero AI** — TTS working perfectly (high quality)
- 🟡 **TTS yoxdur** — Silero unavailable, using Web Speech fallback (lower quality)

### Sound Button

- 🔊 **"Səs açıq"** (green) — Sound enabled, teacher speaking
- 🔇 **"Səssiz"** (gray) — Sound disabled, teacher silent

---

## 📚 Tech Stack

### Frontend
- **React 18** — UI framework
- **Three.js + React Three Fiber** — 3D rendering
- **@react-three/drei** — 3D helpers (OrbitControls, useGLTF, etc.)
- **Vite** — Build tool (fast HMR)
- **Lucide React** — Icon library
- **PDF.js** — PDF parsing

### Backend
- **FastAPI** — Python web framework
- **PyTorch** — Deep learning (Silero model)
- **Silero TTS v5_cis_base** — Neural TTS model
- **soundfile** — Audio file I/O
- **uvicorn** — ASGI server

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Silero Models** — https://github.com/snakers4/silero-models
- **Ready Player Me** / **Mixamo** — 3D character models
- **React Three Fiber** — https://docs.pmnd.rs/react-three-fiber

---

## 📧 Contact

For questions or issues, please open a GitHub issue or contact:
- **Email:** your.email@example.com
- **GitHub:** [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

---

## 🎉 Demo

**Live Demo:** [Coming soon]

**Screenshots:**

![Main Interface](WhatsApp%20Image%202026-11-03%20at%2001.43.49.jpeg)
![Teaching Interaction](WhatsApp%20Image%202026-11-03%20at%2001.43.50.jpeg)

---

**Made with ❤️ for Azerbaijani developers learning programming**
# for-tamerlan
