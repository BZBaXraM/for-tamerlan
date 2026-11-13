# 🚀 Sürətli Başlanğıc

## Tələblər

- **Node.js** 18+ yuxarı
- **Python** 3.9+ yuxarı
- **Git**

## Quraşdırma (5 dəqiqə)

### 1. Layihəni endirin

```bash
git clone https://github.com/YOUR_USERNAME/edu-ai.git
cd edu-ai
```

### 2. Frontend quraşdırın

```bash
npm install
```

### 3. Silero TTS server quraşdırın

```bash
cd silero-server
bash setup.sh
cd ..
```

⚠️ **İlk dəfə model yüklənəcək (~120 MB, 2-3 dəqiqə)**

## İşə Salma

### Terminal 1: Backend (Silero TTS)

```bash
cd silero-server
bash start.sh
```

✅ Görməlisiniz: `Uvicorn running on http://0.0.0.0:8765`

### Terminal 2: Frontend (React)

```bash
npm run dev
```

✅ Görməlisiniz: `Local: http://localhost:3000/`

## Brauzer

Açın: **http://localhost:3000**

1. **F12** basın (Developer Tools)
2. **"Səssiz"** düyməsinə basın → **"Səs açıq"** olacaq 🟢
3. **Qadın modeli danışmalıdır!** 🎤

## Test

```bash
open test-tts.html
```

Basın:
1. **"1️⃣ Check Health"** → ✅ göstərməlidir
2. **"2️⃣ Test Silero TTS"** → **səs eşitməlisiniz**

## Problem?

### Səs yoxdur

```bash
# Silero server işləyir?
curl http://localhost:8765/health

# Əgər xəta varsa:
cd silero-server
bash start.sh
```

### Port məşğuldur

```bash
# Portları təmizləyin
lsof -ti:3000 | xargs kill -9
lsof -ti:8765 | xargs kill -9

# Yenidən başladın
npm run dev
cd silero-server && bash start.sh
```

## Ətraflı

- **README.md** — tam təlimat (ingilis dilində)
- **STATUS.md** — xüsusiyyətlər siyahısı
- **DEBUG.md** — ətraflı problemlərin həlli

---

**Uğurlar! 🎉**
