#!/bin/bash
echo "🔍 Проверка файлов для GitHub..."
echo ""

files=(
  "README.md"
  ".gitignore"
  "LICENSE"
  "CONTRIBUTING.md"
  "CHANGELOG.md"
  "start-all.sh"
  "stop-all.sh"
  ".github/workflows/build.yml"
)

all_ok=true

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    size=$(du -h "$file" | cut -f1)
    echo "✅ $file ($size)"
  else
    echo "❌ $file — НЕ НАЙДЕН"
    all_ok=false
  fi
done

echo ""
if [ "$all_ok" = true ]; then
  echo "🎉 Все ключевые файлы на месте!"
  echo ""
  echo "Готово к публикации на GitHub:"
  echo "  1. git init"
  echo "  2. git add ."
  echo "  3. git commit -m 'Initial commit: EduAI v1.0.0'"
  echo "  4. git remote add origin https://github.com/YOUR_USERNAME/edu-ai.git"
  echo "  5. git push -u origin main"
else
  echo "⚠️ Некоторые файлы отсутствуют!"
fi
