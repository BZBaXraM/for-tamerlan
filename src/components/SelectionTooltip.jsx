import React, { useEffect, useState, useRef } from 'react'
import { X, BookOpen, Lightbulb, ChevronRight, Loader } from 'lucide-react'

/**
 * SelectionTooltip — full explanation card above teacher's head.
 *
 * Layout (inside the 310px teacher stage div):
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │  📖  Seçilmiş mətn: "DOM"                           │
 *   │  ─────────────────────────────────────────────────  │
 *   │  DOM (Document Object Model) — brauzerin HTML        │
 *   │  sənədini ağac strukturuna çevirdiyi interfeysidir.  │
 *   │                                                     │
 *   │  💡 Praktik misal:                                   │
 *   │  document.getElementById('btn') — DOM-dan element    │
 *   │  seçir və onunla işləmək imkanı verir.               │
 *   └─────────────────────────────────────────────────────┘
 *                         ▼
 *                      👩‍🏫
 */

// ─────────────────────────────────────────────────────────────
// Full Azerbaijani explanation engine
// ─────────────────────────────────────────────────────────────
function buildExplanation(selected) {
  const s = selected.trim()
  const low = s.toLowerCase()

  // Helper: truncate displayed selected text
  const displayText = s.length > 60 ? s.slice(0, 57) + '...' : s

  // ── HTML / CSS / Web ─────────────────────────────────────
  if (low.includes('<!doctype') || low.includes('doctype')) return {
    emoji: '📄', label: 'DOCTYPE Teqi',
    title: '<!DOCTYPE html> nədir?',
    body: 'DOCTYPE brauzərə hansı HTML standartından istifadə etdiyini bildirir. Bu sətir olmadan brauzer "quirks mode"a keçir — köhnə, uyğunsuz davranış rejimi.',
    tip: 'Hər HTML faylın ən başında mütləq yazılmalıdır.',
    code: '<!DOCTYPE html>\n<html lang="az">...</html>'
  }

  if (low.includes('<html') || (low.includes('html') && low.includes('lang'))) return {
    emoji: '🌐', label: 'HTML Teqi',
    title: '<html> elementi',
    body: 'Bütün veb səhifənin kök (root) elementidir. lang atributu ekran oxuyucularına və axtarış motorlarına dilin azərbaycan olduğunu bildirir.',
    tip: 'lang="az" — axtarış motorları üçün çox vacibdir (SEO +15%).',
    code: '<html lang="az">\n  <head>...</head>\n  <body>...</body>\n</html>'
  }

  if (low.includes('<head') || low === 'head') return {
    emoji: '🧠', label: 'HTML Strukturu',
    title: '<head> bölməsi',
    body: 'İstifadəçiyə görünməyən meta-məlumatlar burada saxlanılır: səhifə başlığı, charset, viewport, CSS bağlantıları, SEO teqləri.',
    tip: 'Brauzer <head> içini oxuyur, amma ekranda göstərmir.',
    code: '<head>\n  <meta charset="UTF-8">\n  <title>Səhifə adı</title>\n  <link rel="stylesheet" href="style.css">\n</head>'
  }

  if (low.includes('dom') || low.includes('document object')) return {
    emoji: '🌳', label: 'Veb Texnologiyası',
    title: 'DOM — Document Object Model',
    body: 'DOM brauzerin HTML sənədini yaddaşda ağac şəklində təmsil etməsidir. Hər HTML elementi bir "node" (düyün) olur. JavaScript bu ağac üzərindən elementləri tapır, dəyişdirir, əlavə edir.',
    tip: 'DOM dəyişdirildikdə brauzer avtomatik ekranı yeniləyir.',
    code: '// DOM-dan element seçmək:\nconst btn = document.getElementById("myBtn")\nbtn.textContent = "Yeni mətn"\nbtn.style.color = "red"'
  }

  if (low.includes('<body') || low === 'body') return {
    emoji: '👁️', label: 'HTML Strukturu',
    title: '<body> bölməsi',
    body: 'İstifadəçinin gördüyü bütün məzmun: mətnlər, şəkillər, düymələr, formlar — hamısı <body> içindədir. Brauzer bu hissəni render edib ekranda göstərir.',
    tip: '<body> bir səhifədə yalnız bir dəfə olur.',
    code: '<body>\n  <h1>Başlıq</h1>\n  <p>Paraqraf mətni.</p>\n  <button>Klikla</button>\n</body>'
  }

  if (low.match(/^h[1-6]$/) || low.includes('<h1') || low.includes('<h2') || low.includes('başlıq')) return {
    emoji: '📌', label: 'HTML Teqləri',
    title: 'Başlıq teqləri: <h1>–<h6>',
    body: '<h1> ən böyük, <h6> ən kiçik başlıqdır. h1 — səhifənin əsas mövzusu. Axtarış motorları h1-ə xüsusi əhəmiyyət verir. Bir səhifədə yalnız bir <h1> olmalıdır.',
    tip: 'SEO üçün: hər səhifədə tək h1, lazım qədər h2–h3.',
    code: '<h1>Əsas başlıq (1 dəfə)</h1>\n<h2>Alt bölmə başlığı</h2>\n<h3>Daha kiçik bölmə</h3>'
  }

  if (low.includes('css') || low.includes('style') || low.includes('selector')) return {
    emoji: '🎨', label: 'CSS',
    title: 'CSS — Cascading Style Sheets',
    body: 'CSS HTML elementlərinin görünüşünü idarə edir: rənglər, ölçülər, yerləşmə, animasiyalar. "Cascading" — qaydalar ardıcıl tətbiq olunur, daha spesifik qaydalar üstün gəlir.',
    tip: 'Selector spesifikliyi: inline > id > class > element.',
    code: '/* Selector: element */\np { color: #333; font-size: 16px; }\n\n/* Class selector */\n.card { border-radius: 8px; padding: 16px; }\n\n/* ID selector */\n#header { background: #18181b; }'
  }

  if (low.includes('flexbox') || low.includes('flex') || low.includes('display: flex')) return {
    emoji: '📐', label: 'CSS Layout',
    title: 'CSS Flexbox',
    body: 'Flexbox bir ölçülü layout sistemidir (sıra və ya sütun). Elementləri rahatlıqla hizalamaq, boşluq vermək, sıralamaq üçün istifadə olunur. Responsive dizayn üçün əla alətdir.',
    tip: 'justify-content — üfüqi, align-items — şaquli hizalama.',
    code: '.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 16px;\n}'
  }

  if (low.includes('grid') || low.includes('display: grid')) return {
    emoji: '⬜', label: 'CSS Layout',
    title: 'CSS Grid',
    body: 'Grid iki ölçülü layout sistemidir (sıra + sütun eyni anda). Mürəkkəb səhifə quruluşları üçün idealdır. Flexbox-dan fərqli olaraq həm horizontal, həm vertical nəzarət verir.',
    tip: 'grid-template-columns: repeat(3, 1fr) — 3 bərabər sütun.',
    code: '.layout {\n  display: grid;\n  grid-template-columns: 1fr 2fr;\n  gap: 20px;\n}'
  }

  // ── JavaScript ───────────────────────────────────────────
  if (low.includes('function') || low.includes('const') || low.includes('let') || low.includes('var')) return {
    emoji: '⚡', label: 'JavaScript',
    title: 'JavaScript dəyişənlər və funksiyalar',
    body: '`const` — dəyişməyən dəyər (tövsiyə edilir). `let` — dəyişə bilən dəyər. `var` — köhnə üsul, istifadə etməyin. Funksiyalar kodu bloklar halında paketləyir və təkrar istifadəyə imkan verir.',
    tip: '`const` ilə başlayın, lazım gəldikdə `let`-ə keçin.',
    code: 'const ad = "Əli"          // dəyişmir\nlet yaş = 25               // dəyişə bilər\n\nfunction salam(ad) {\n  return `Salam, ${ad}!`\n}'
  }

  if (low.includes('async') || low.includes('await') || low.includes('promise')) return {
    emoji: '⏳', label: 'JavaScript',
    title: 'Async / Await — asinxron proqramlaşdırma',
    body: 'Server sorğuları, fayl oxuma kimi vaxt alan əməliyyatlar asinxron icra olunur. `async` funksiyanı asinxron edir, `await` nəticəni gözləyir. Proqram bloklanmır.',
    tip: 'Həmişə try/catch ilə sarın — xəta idarəetməsi üçün.',
    code: 'async function məlumatAl() {\n  try {\n    const cavab = await fetch("/api/data")\n    const json = await cavab.json()\n    return json\n  } catch (xəta) {\n    console.error(xəta)\n  }\n}'
  }

  // ── API / Backend ────────────────────────────────────────
  if (low.includes('api') || low.includes('rest') || low.includes('endpoint')) return {
    emoji: '🌐', label: 'Veb Arxitekturası',
    title: 'API — Application Programming Interface',
    body: 'API müştəri (brauzer) ilə server arasında danışıq dili təyin edir. REST API HTTP metodlarından (GET, POST, PUT, DELETE) istifadə edir. JSON formatında məlumat mübadiləsi aparılır.',
    tip: 'GET — oxu, POST — yarat, PUT — yenilə, DELETE — sil.',
    code: '// Məlumat almaq (GET)\nconst res = await fetch("/api/users")\nconst users = await res.json()\n\n// Yeni istifadəçi əlavə etmək (POST)\nawait fetch("/api/users", {\n  method: "POST",\n  body: JSON.stringify({ ad: "Əli" })\n})'
  }

  if (low.includes('http') || low.includes('https') || low.includes('request') || low.includes('sorğu')) return {
    emoji: '📡', label: 'Şəbəkə Protokolu',
    title: 'HTTP / HTTPS — sorğu-cavab protokolu',
    body: 'HTTP brauzer ilə server arasında məlumat ötürülməsi protokoludur. HTTPS — şifrələnmiş versiyası (TLS/SSL). Hər sorğunun status kodu var: 200 (uğurlu), 404 (tapılmadı), 500 (server xətası).',
    tip: 'HTTPS olmadan şifrələr açıq ötürülür — həmişə HTTPS!',
    code: 'GET /api/users HTTP/1.1\nHost: example.com\nAuthorization: Bearer <token>\n\n← HTTP/1.1 200 OK\n← Content-Type: application/json\n← [{"id":1,"ad":"Əli"}]'
  }

  if (low.includes('redis') || low.includes('cache') || low.includes('keş')) return {
    emoji: '⚡', label: 'Sistem Dizaynı',
    title: 'Redis — sürətli keş verilənlər bazası',
    body: 'Redis məlumatları diskdə yox, RAM-da saxlayır. Bu səbəbdən oxuma ~0.1–2ms çəkir, PostgreSQL-dən 100x sürətlidir. Tez-tez istifadə olunan məlumatları (sessiyalar, API cavabları) keşləmək üçün idealdır.',
    tip: 'Keş strategiyası: əvvəl Redis yoxla, tapılmadıqda DB-dən al.',
    code: '// Keş yoxla\nconst cached = await redis.get("user:123")\nif (cached) return JSON.parse(cached)\n\n// DB-dən al və keşlə (60 saniyə)\nconst user = await db.findUser(123)\nawait redis.setex("user:123", 60, JSON.stringify(user))\nreturn user'
  }

  if (low.includes('jwt') || low.includes('token') || low.includes('bearer')) return {
    emoji: '🔐', label: 'Təhlükəsizlik',
    title: 'JWT — JSON Web Token',
    body: 'JWT istifadəçinin kimliyini təsdiqləyən rəqəmsal imzalanmış məlumat paketidir. 3 hissəsindən ibarətdir: Header (alqoritm), Payload (məlumat), Signature (imza). Server yalnız imzanı yoxlayır — verilənlər bazasına müraciət lazım deyil.',
    tip: 'JWT-ni localStorage-da saxlamayın — httpOnly cookie daha təhlükəsizdir.',
    code: '// Token strukturu:\n// eyJhbGciOiJIUzI1NiJ9  ← Header (base64)\n// .eyJ1c2VySWQiOjF9      ← Payload (base64)\n// .SflKxwRJSMeKKF2QT4   ← Signature\n\n// Header-da göndərmək:\nAuthorization: Bearer <jwt_token>'
  }

  if (low.includes('sql') || low.includes('select') || low.includes('postgres') || low.includes('verilənlər bazası')) return {
    emoji: '🗄️', label: 'Verilənlər Bazası',
    title: 'SQL — strukturlu sorğu dili',
    body: 'SQL verilənlər bazasından məlumat almaq, əlavə etmək, dəyişmək, silmək üçün standart dildir. SELECT — seçmək, INSERT — əlavə etmək, UPDATE — yeniləmək, DELETE — silmək.',
    tip: 'İndeksləmə sorğu sürətini 100x artıra bilər — WHERE sütunlarını indeksləyin.',
    code: 'SELECT id, ad, email\nFROM istifadəçilər\nWHERE aktiv = true\nORDER BY yaradılma_tarixi DESC\nLIMIT 10;'
  }

  if (low.includes('responsive') || low.includes('mobile') || low.includes('viewport') || low.includes('media')) return {
    emoji: '📱', label: 'Responsive Dizayn',
    title: 'Responsive Dizayn — uyğunlaşan səhifə',
    body: 'Media query-lər ekran ölçüsünə görə fərqli CSS tətbiq edir. Mobil-first yanaşma: əvvəl kiçik ekran üçün dizayn, sonra böyük ekrana genişləndir.',
    tip: 'Breakpoint-lər: 640px (sm), 768px (md), 1024px (lg), 1280px (xl).',
    code: '/* Mobil (default) */\n.kart { font-size: 14px; padding: 12px; }\n\n/* Tablet+ */\n@media (min-width: 768px) {\n  .kart { font-size: 16px; padding: 20px; }\n}\n\n/* Desktop+ */\n@media (min-width: 1024px) {\n  .kart { font-size: 18px; }\n}'
  }

  if (low.includes('git') || low.includes('commit') || low.includes('branch') || low.includes('merge')) return {
    emoji: '🔀', label: 'Git',
    title: 'Git — versiya idarəetmə sistemi',
    body: 'Git kodun tarixçəsini saxlayır, komanda ilə işi asanlaşdırır. Branch — ayrı iş xətti. Commit — dəyişiklikləri qeyd etmək. Merge — branch-ları birləşdirmək. Pull Request — kodu nəzərdən keçirmək üçün sorğu.',
    tip: 'Hər tapşırıq üçün ayrı branch açın: `git checkout -b feature/login`',
    code: 'git init                    # repo yarat\ngit add .                   # dəyişiklikləri seç\ngit commit -m "İlk commit"  # qeyd et\ngit push origin main        # serverə göndər'
  }

  if (low.includes('react') || low.includes('component') || low.includes('props') || low.includes('state')) return {
    emoji: '⚛️', label: 'React',
    title: 'React — UI kitabxanası',
    body: 'React interfeysi kiçik, təkrar istifadə edilə bilən komponentlərə bölür. Props — valideyndən uşağa məlumat. State — komponentin öz daxili vəziyyəti. useState dəyər dəyişdikdə komponenti yenidən render edir.',
    tip: 'Komponent adı mütləq böyük hərflə başlamalıdır: `<Button />`',
    code: 'function Salam({ ad }) {           // props\n  const [bəyən, setBəyən] = useState(0) // state\n  return (\n    <div>\n      <h1>Salam, {ad}!</h1>\n      <button onClick={() => setBəyən(b => b+1)}>\n        ❤️ {bəyən}\n      </button>\n    </div>\n  )\n}'
  }

  // ── Generic explanation for any selected text ────────────
  const wordCount = s.split(/\s+/).length
  if (wordCount === 1) return {
    emoji: '📖', label: 'Anlayış İzahı',
    title: `"${displayText}" — izah`,
    body: `Bu anlayış proqramlaşdırma və veb texnologiyaları sahəsindən gəlir. Daha dəqiq izah üçün aşağıdakı sual qutusuna bu sözü yazın — müəllim ətraflı cavab verəcək.`,
    tip: 'Sual qutusu sizi gözləyir! ↓',
    code: null
  }

  return {
    emoji: '💬', label: 'Seçilmiş Mətn',
    title: `Seçdiyiniz parça haqqında`,
    body: `"${displayText}" — bu hissəni daha yaxşı başa düşmək istəyirsinizsə, aşağıdakı sual qutusuna kopyalayın. AI müəllim sizi addım-addım izah edəcək.`,
    tip: 'Hər anlayışı ayrıca seçsəniz daha dəqiq izah alarsınız.',
    code: null
  }
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function SelectionTooltip({ hint, onDismiss, onSpeak }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedBody, setDisplayedBody] = useState('')
  const typingRef = useRef(null)
  const cardRef = useRef(null)

  // Build explanation and start typewriter when hint changes
  useEffect(() => {
    if (hint) {
      const exp = buildExplanation(hint.text)
      setExplanation(exp)
      setExiting(false)
      setVisible(true)
      setIsTyping(true)
      setDisplayedBody('')

      // Speak the explanation (title + body, skip code)
      const speechText = `${exp.title}. ${exp.body}${exp.tip ? ` ${exp.tip}` : ''}`
      console.log('[SelectionTooltip] Speaking explanation:', speechText.substring(0, 50) + '...')
      onSpeak?.(speechText)

      let i = 0
      const full = exp.body
      clearInterval(typingRef.current)
      typingRef.current = setInterval(() => {
        i += 2
        setDisplayedBody(full.slice(0, i))
        if (i >= full.length) {
          clearInterval(typingRef.current)
          setIsTyping(false)
        }
      }, 18)

      return () => clearInterval(typingRef.current)
    } else if (visible) {
      clearInterval(typingRef.current)
      setExiting(true)
      const t = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(t)
    }
  }, [hint])

  if (!visible || !explanation) return null

  const dismiss = () => {
    clearInterval(typingRef.current)
    setExiting(true)
    setTimeout(() => { setVisible(false); onDismiss?.() }, 300)
  }

  // position: fixed, centered horizontally, sitting just above the teacher stage.
  // The teacher stage is 310px tall + 68px input bar = 378px from bottom.
  // We place the card bottom edge at viewport_height - 378px - 16px gap.
  // The card grows UPWARD from that anchor so it's always fully visible.
  return (
    <div
      ref={cardRef}
      data-tooltip="1"
      style={{
        position: 'fixed',
        // Anchor: just above the teacher's head area
        // Teacher stage starts at: 100vh - 310px(stage) - 68px(bar)
        // Head is roughly at top 30% of the stage → ~93px from stage top
        // So head is at: 100vh - 310 - 68 + 93 = 100vh - 285px from bottom
        bottom: 'calc(310px + 68px + 24px)',   // above stage + input + gap
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'auto',
        width: 'min(520px, calc(100vw - 32px))',
        // Cards grow upward — overflow is always visible
        maxHeight: 'calc(100vh - 310px - 68px - 60px)',
        overflowY: 'auto',
        animation: exiting
          ? 'ttExit 0.28s ease forwards'
          : 'ttEnter 0.38s cubic-bezier(0.34, 1.4, 0.64, 1) forwards'
      }}
    >
      {/* ── CARD ── */}
      <div style={{
        background: '#18181b',
        borderRadius: '16px',
        border: '1px solid rgba(234,88,12,0.35)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px',
          background: 'rgba(234,88,12,0.12)',
          borderBottom: '1px solid rgba(234,88,12,0.2)'
        }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{explanation.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: '10px', fontWeight: '700', color: '#fb923c',
              letterSpacing: '0.1em', textTransform: 'uppercase'
            }}>
              {explanation.label}
            </span>
            <div style={{
              fontSize: '13.5px', fontWeight: '700', color: '#f9fafb',
              lineHeight: 1.3, marginTop: '1px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {explanation.title}
            </div>
          </div>
          <button onClick={dismiss} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
            color: '#9ca3af', padding: '5px', borderRadius: '8px',
            display: 'flex', flexShrink: 0,
            transition: 'background 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body — typewriter */}
        <div style={{ padding: '12px 14px', borderBottom: explanation.tip || explanation.code ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: '1.65',
            color: '#e5e7eb',
            minHeight: '44px'
          }}>
            {displayedBody}
            {isTyping && (
              <span style={{
                display: 'inline-block', width: '2px', height: '13px',
                background: '#fb923c', marginLeft: '2px', verticalAlign: 'middle',
                animation: 'cursorBlink 0.7s step-end infinite'
              }} />
            )}
          </p>
        </div>

        {/* Tip */}
        {explanation.tip && !isTyping && (
          <div style={{
            padding: '8px 14px',
            display: 'flex', alignItems: 'flex-start', gap: '7px',
            borderBottom: explanation.code ? '1px solid rgba(255,255,255,0.06)' : 'none',
            animation: 'ttFadeIn 0.4s ease 0.1s both'
          }}>
            <Lightbulb size={13} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.5 }}>
              <strong style={{ color: '#fbbf24' }}>Məsləhət: </strong>
              {explanation.tip}
            </span>
          </div>
        )}

        {/* Code block */}
        {explanation.code && !isTyping && (
          <div style={{
            padding: '10px 14px',
            animation: 'ttFadeIn 0.4s ease 0.2s both'
          }}>
            <pre style={{
              margin: 0,
              fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              fontSize: '11.5px',
              lineHeight: '1.6',
              color: '#86efac',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '8px',
              padding: '10px 12px',
              overflowX: 'auto',
              whiteSpace: 'pre',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {explanation.code}
            </pre>
          </div>
        )}

        {/* Footer hint */}
        {!isTyping && (
          <div style={{
            padding: '7px 14px',
            display: 'flex', alignItems: 'center', gap: '5px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            animation: 'ttFadeIn 0.3s ease 0.3s both'
          }}>
            <BookOpen size={11} color="#6b7280" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              Ətraflı sual üçün aşağıdakı qutuya yazın
            </span>
            <ChevronRight size={11} color="#6b7280" style={{ marginLeft: 'auto' }} />
          </div>
        )}
      </div>

      {/* Tail pointing down toward teacher head */}
      <div style={{
        position: 'absolute',
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '11px solid rgba(234,88,12,0.35)',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '9px solid #18181b'
      }} />

      <style>{`
        @keyframes ttEnter {
          from { opacity: 0; transform: translateX(-50%) translateY(-14px) scale(0.93); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes ttExit {
          from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          to   { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.95); }
        }
        @keyframes ttFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
