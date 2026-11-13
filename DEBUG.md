# 🐛 Debug: Почему не слышно звук

## Проблема
После нажатия на "Səs açıq" модель не говорит.

## Что исправлено

### 1. Добавлено автоматическое воспроизведение при включении звука
```javascript
// Теперь когда ты нажимаешь "Səs açıq", модель сразу начинает говорить
toggleSound() → speakCurrentFocus(focusPosition, null, force=true)
```

### 2. Добавлено подробное логирование
- `voiceService.js` — все этапы TTS (Silero → Web Speech)
- `App.jsx` — когда вызывается speakText

## Как проверить

### Способ 1: Простой тест (БЕЗ React)
```bash
open /Users/baxram/template-project/edu-ai/test-tts.html
```

Нажми кнопки по порядку:
1. **"1️⃣ Check Health"** — должен показать `✅ Health OK`
2. **"2️⃣ Test Silero TTS"** — должен воспроизвести азербайджанскую речь
3. **"3️⃣ Test Web Speech"** — fallback вариант (хуже качество)

**Если Silero работает** — услышишь: "Salam! Mən AI müəlliminizəm. HTML və CSS haqqında danışaq."

---

### Способ 2: Основное приложение
```bash
# Убедись что оба сервера запущены:
lsof -i:8765  # Silero TTS
lsof -i:3000  # Vite

# Открой в браузере
open http://localhost:3000
```

**Шаги:**
1. Открой **Developer Tools** (F12 или Cmd+Option+I)
2. Перейди на вкладку **Console**
3. Нажми кнопку **"Səssiz"** → должна стать **"Səs açıq"**
4. **Смотри в консоль** — там будут логи:

```
[App] toggleSound clicked, current soundEnabled: false
[App] Enabling sound, will speak focus position: visual
[App] Calling speakCurrentFocus with force=true
[App] speakCurrentFocus: visual force: true text length: 127
[App] speakText called, text length: 127 soundEnabled: false force: true
[App] Starting speech...
[voiceService] 📣 speakLessonText called, text length: 127
[voiceService] useSilero: true (cached: true)
[voiceService] 🎤 Sending to Silero: Salam! Bu HTML və CSS dərsinə xoş gəlmisiniz...
[voiceService] ✅ Silero response OK, size: 114644
[voiceService] 🔊 Got audio blob, size: 114644 bytes
[voiceService] 🚀 Calling audio.play()...
[voiceService] ▶️ Audio started playing
[voiceService] ✅ audio.play() succeeded
```

---

## Что искать в консоли

### ✅ Всё работает:
```
[voiceService] ✅ Silero response OK
[voiceService] 🔊 Got audio blob, size: 114644 bytes
[voiceService] ▶️ Audio started playing
```

### ❌ Silero не работает:
```
[voiceService] ⚠️ Silero unavailable, falling back to Web Speech
[voiceService] 🔄 Trying Web Speech API fallback
```
**Решение:** Перезапусти Silero server
```bash
cd /Users/baxram/template-project/edu-ai/silero-server
bash start.sh
```

### ❌ Браузер блокирует autoplay:
```
NotAllowedError: play() failed because the user didn't interact with the document first
```
**Решение:** В Chrome/Safari нужно **сначала кликнуть** что-то на странице, потом включить звук

---

## Быстрые решения

### Звук не слышен вообще
1. **Проверь громкость системы** — может быть выключена
2. **Проверь что Silero server запущен:**
   ```bash
   curl http://localhost:8765/health
   # Должен вернуть: {"status":"ok","language":"aze","speaker":"aze_gamat"}
   ```
3. **Открой test-tts.html** и нажми "Test Silero TTS"

### Silero не работает, но Web Speech работает
- Перезапусти Silero server:
  ```bash
  lsof -ti:8765 | xargs kill -9
  cd /Users/baxram/template-project/edu-ai/silero-server
  bash start.sh
  ```
- В браузере обнови страницу (Cmd+R)

### Web Speech на английском вместо азербайджанского
- Это fallback метод, качество хуже
- Убедись что Silero server запущен для высокого качества

---

## Логи серверов

### Silero TTS
```bash
tail -f /Users/baxram/template-project/edu-ai/silero-server/server.log
```

### Vite dev
```bash
tail -f /Users/baxram/template-project/edu-ai/vite.log
```

---

## Контакты для отладки

**Статус badge в navbar показывает:**
- 🟢 **Silero AI** — Silero TTS работает (отлично!)
- 🟡 **TTS yoxdur** — Silero не найден, используется Web Speech (плохо)

Если badge **🟡**, значит Silero server не запущен.
