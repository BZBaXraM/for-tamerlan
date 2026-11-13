# Silero TTS Server — Azerbaijani

Локальный сервер для синтеза речи на азербайджанском языке.
Использует модель **Silero v5_cis_base**, голос **aze_gamat**.

## Первый запуск (однократно)

```bash
bash silero-server/setup.sh
```

Скачивает зависимости (~500 МБ torch) в изолированное виртуальное окружение.

## Запуск сервера

```bash
bash silero-server/start.sh
```

При первом запуске скачает модель (~120 МБ) в `~/.cache/silero_edu/`.
Последующие запуски мгновенные.

Сервер работает на **http://localhost:8765**.

## API

```
GET  /health  → { "status": "ok", "language": "aze", "speaker": "aze_gamat" }
POST /tts     → audio/wav
  body: { "text": "Salam dünya!" }
```

## Как работает интеграция

Фронтенд (`src/utils/voiceService.js`) при каждом произнесении текста:

1. Проверяет доступность сервера (`/health`)
2. Если доступен → отправляет текст на `/tts`, получает WAV, воспроизводит
3. Если недоступен → использует браузерный Web Speech API как запасной вариант

Статус сервера отображается в навбаре: 🟢 **Silero AI** (работает) / 🟡 **TTS yoxdur** (не запущен).
