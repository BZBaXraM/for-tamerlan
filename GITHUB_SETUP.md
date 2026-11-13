# 📦 Подготовка к публикации на GitHub

## ✅ Созданные файлы

### Основные документы
- ✅ **README.md** — Полная документация (на английском)
- ✅ **BAŞLANĞIC.md** — Краткий старт (на азербайджанском)
- ✅ **LICENSE** — MIT License
- ✅ **.gitignore** — Исключения для Git (node_modules, venv, logs, cache)

### Документация для разработчиков
- ✅ **CONTRIBUTING.md** — Как контрибьютить в проект
- ✅ **CHANGELOG.md** — История изменений
- ✅ **STATUS.md** — Текущий статус и функции (на азербайджанском)
- ✅ **DEBUG.md** — Руководство по отладке
- ✅ **ИСПРАВЛЕНО.md** — Что было исправлено
- ✅ **КАК_ПРОТЕСТИРОВАТЬ.md** — Инструкция по тестированию

### Скрипты запуска
- ✅ **start-all.sh** — Запуск всех серверов одной командой
- ✅ **stop-all.sh** — Остановка всех серверов

### CI/CD
- ✅ **.github/workflows/build.yml** — GitHub Actions (автоматическая сборка)

---

## 🚀 Публикация на GitHub

### 1. Инициализация Git

```bash
cd /Users/baxram/template-project/edu-ai

# Инициализация (если еще не сделано)
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "Initial commit: EduAI v1.0.0 — Interactive 3D AI Teacher with Silero TTS"
```

### 2. Создание репозитория на GitHub

1. Перейди на https://github.com/new
2. Название: **edu-ai**
3. Описание: **Interactive 3D AI Teacher with Azerbaijani Silero TTS**
4. Visibility: **Public** (или Private, если хочешь)
5. **НЕ** создавай README, .gitignore, LICENSE (уже есть локально)
6. Нажми **Create repository**

### 3. Привязка к удаленному репозиторию

```bash
# Замени YOUR_USERNAME на свой GitHub username
git remote add origin https://github.com/YOUR_USERNAME/edu-ai.git

# Проверка
git remote -v
```

### 4. Push на GitHub

```bash
# Push всех файлов
git branch -M main
git push -u origin main
```

**Готово!** Твой проект на GitHub: `https://github.com/YOUR_USERNAME/edu-ai`

---

## 📝 Что нужно обновить после публикации

### В README.md (строки с YOUR_USERNAME):

```bash
# Найди и замени YOUR_USERNAME на свой username:
sed -i '' 's/YOUR_USERNAME/YOUR_REAL_USERNAME/g' README.md
sed -i '' 's/YOUR_USERNAME/YOUR_REAL_USERNAME/g' CONTRIBUTING.md
sed -i '' 's/YOUR_USERNAME/YOUR_REAL_USERNAME/g' CHANGELOG.md
sed -i '' 's/YOUR_USERNAME/YOUR_REAL_USERNAME/g' BAŞLANĞIC.md

# Commit изменений
git add .
git commit -m "Update GitHub username links"
git push
```

### Обновить контакты в README.md:

Найди секцию **Contact** и обнови:
```markdown
- **Email:** your.email@example.com
- **GitHub:** [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
```

---

## 🎨 Добавление скриншотов (опционально)

Если хочешь лучшие скриншоты:

1. Запусти приложение:
   ```bash
   bash start-all.sh
   ```

2. Открой http://localhost:3000

3. Сделай скриншоты:
   - Главный экран с 3D моделью
   - Tooltip с объяснением текста
   - Chat sidebar
   - Разные позиции модели (visual/text/ring)

4. Сохрани в корень проекта:
   ```
   screenshot-1.png
   screenshot-2.png
   screenshot-3.png
   ```

5. Обнови README.md:
   ```markdown
   ![Main Interface](screenshot-1.png)
   ![Text Selection](screenshot-2.png)
   ![AI Chat](screenshot-3.png)
   ```

6. Commit:
   ```bash
   git add screenshot-*.png README.md
   git commit -m "Add screenshots to README"
   git push
   ```

---

## 🌐 GitHub Pages (опционально)

Если хочешь хостить статическую версию:

```bash
# Build production
npm run build

# Создай ветку gh-pages
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
echo "eduai.yourdomain.com" > CNAME  # опционально, если есть домен
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Вернись на main
git checkout main
```

Включи GitHub Pages в Settings → Pages → Source: `gh-pages` branch

**⚠️ Важно:** Silero TTS не будет работать на GitHub Pages (нужен backend). Только Web Speech API fallback.

---

## 🏷️ Release (опционально)

Создай первый релиз:

1. На GitHub: Releases → Draft a new release
2. Tag: `v1.0.0`
3. Title: `EduAI v1.0.0 — Initial Release`
4. Description:
   ```markdown
   ## 🎉 First Release
   
   Interactive 3D AI Teacher with Azerbaijani Silero TTS.
   
   ### Features
   - 3D animated teacher with natural walking
   - High-quality Azerbaijani TTS (Silero v5_cis_base)
   - Text selection explanations (20+ keywords)
   - AI chat assistant
   - PDF upload support
   
   ### Installation
   See [README.md](https://github.com/YOUR_USERNAME/edu-ai#readme)
   ```
5. Нажми **Publish release**

---

## 📊 GitHub Actions Badge (опционально)

После первого push CI/CD запустится автоматически. Проверь:
1. GitHub → Actions tab
2. Должен появиться workflow "Build and Test"
3. Badge в README.md будет показывать статус сборки ✅

---

## 🔒 Приватность

**Что НЕ попадет на GitHub (благодаря .gitignore):**
- ✅ `node_modules/` — библиотеки (скачаются через npm install)
- ✅ `silero-server/venv/` — Python окружение (создастся через setup.sh)
- ✅ `*.log` — логи серверов
- ✅ `.DS_Store` — системные файлы macOS
- ✅ `SC_HTML_urok_01_*.pdf` — PDF файлы (если не хочешь их публиковать)

**Что ПОПАДЕТ на GitHub:**
- ✅ Исходный код (src/, silero-server/server.py)
- ✅ Конфигурация (package.json, requirements.txt, vite.config.js)
- ✅ Документация (README.md, CONTRIBUTING.md, и т.д.)
- ✅ Скрипты (start-all.sh, stop-all.sh, setup.sh, start.sh)

---

## 📧 После публикации

1. **Добавь topics на GitHub:**
   - Settings → Topics → Add: `react`, `threejs`, `tts`, `azerbaijani`, `education`, `ai`, `3d`, `silero`

2. **Обнови описание:**
   - Settings → Description: "Interactive 3D AI Teacher with Azerbaijani TTS"
   - Website: (если есть demo)

3. **Создай Demo (опционально):**
   - Deploy на Vercel, Netlify, или Railway
   - Обнови README.md с ссылкой на demo

4. **Расскажи о проекте:**
   - Twitter/X, LinkedIn, Reddit (r/reactjs, r/threejs)
   - Azerbaijani programming communities

---

## ✅ Checklist перед публикацией

- [ ] Все серверы запускаются (`bash start-all.sh`)
- [ ] Звук работает (test-tts.html)
- [ ] Нет ошибок в консоли браузера
- [ ] README.md актуален
- [ ] .gitignore настроен
- [ ] Чувствительные данные НЕ в коде (API keys, passwords)
- [ ] Замени YOUR_USERNAME на реальный username
- [ ] Обнови контакты (email)

---

**Готово! Теперь можешь публиковать на GitHub.** 🚀

```bash
git add .
git commit -m "Add GitHub documentation and scripts"
git push
```
