/**
 * voiceService.js
 * ───────────────
 * Priority chain for Azerbaijani TTS:
 *
 *  1. Silero TTS server (localhost:8765)
 *     → model: v5_cis_base, speaker: aze_gamat
 *     → returns WAV audio — natural, properly pronounced Azerbaijani
 *
 *  2. Web Speech API fallback
 *     → used when Silero server is not running
 *     → browser built-in, quality varies by OS
 *
 * Public API:
 *   speakLessonText(text, options)
 *   stopLessonSpeech()
 *   checkSileroAvailable()   → Promise<boolean>
 */

const SILERO_URL   = 'http://localhost:8765/tts'
const SILERO_HEALTH = 'http://localhost:8765/health'

// ── Internal state ────────────────────────────────────────────────────────────
let activeAudio      = null   // HTMLAudioElement (Silero)
let activeUtterance  = null   // SpeechSynthesisUtterance (Web Speech fallback)
let lipSyncInterval  = null
let sileroAvailable  = null   // null = untested, true/false = cached result

// ── Lip-sync helper ───────────────────────────────────────────────────────────
function startLipSync(onLipSync) {
  let t = 0
  lipSyncInterval = setInterval(() => {
    t += 0.15
    // Compound sine for natural mouth movement
    const open = (Math.sin(t * 11) * 0.5 + 0.5) * (Math.sin(t * 5.5) * 0.35 + 0.65)
    onLipSync(open)
  }, 50)
}

function stopLipSync() {
  if (lipSyncInterval) {
    clearInterval(lipSyncInterval)
    lipSyncInterval = null
  }
}

function cleanup() {
  stopLipSync()
  activeAudio     = null
  activeUtterance = null
}

// ── Check if Silero server is running ─────────────────────────────────────────
export async function checkSileroAvailable() {
  if (sileroAvailable !== null) return sileroAvailable
  try {
    const res = await fetch(SILERO_HEALTH, {
      method: 'GET',
      signal: AbortSignal.timeout(1500),
    })
    sileroAvailable = res.ok
  } catch {
    sileroAvailable = false
  }
  return sileroAvailable
}

// Reset cached availability (call when toggling server)
export function resetSileroCache() {
  sileroAvailable = null
}

// ── Silero TTS ────────────────────────────────────────────────────────────────
async function trySilero(text, { onStart, onEnd, onError, onLipSync }) {
  try {
    console.log('[voiceService] 🎤 Sending to Silero:', text.substring(0, 50))
    const response = await fetch(SILERO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speaker: 'aze_gamat', sample_rate: 24000 }),
      signal: AbortSignal.timeout(12000), // 12 s max (first call loads model)
    })

    if (!response.ok) {
      throw new Error(`Silero HTTP ${response.status}`)
    }
    console.log('[voiceService] ✅ Silero response OK, size:', response.headers.get('content-length'))

    const blob  = await response.blob()
    console.log('[voiceService] 🔊 Got audio blob, size:', blob.size, 'bytes')
    const url   = URL.createObjectURL(blob)
    const audio = new Audio(url)
    activeAudio = audio

    audio.onplay = () => {
      console.log('[voiceService] ▶️ Audio started playing')
      onStart?.()
      if (onLipSync) startLipSync(onLipSync)
    }

    audio.onended = () => {
      console.log('[voiceService] ⏹ Audio ended')
      URL.revokeObjectURL(url)
      cleanup()
      onEnd?.()
    }

    audio.onerror = (e) => {
      console.error('[voiceService] ❌ Audio playback error:', e)
      URL.revokeObjectURL(url)
      cleanup()
      onError?.(String(e))
    }

    console.log('[voiceService] 🚀 Calling audio.play()...')
    await audio.play()
    console.log('[voiceService] ✅ audio.play() succeeded')
    return true

  } catch (err) {
    cleanup()
    // Mark server as unavailable so next call skips the check
    sileroAvailable = false
    console.warn('[voiceService] ⚠️ Silero unavailable, falling back to Web Speech:', err.message)
    return false
  }
}

// ── Web Speech API fallback ───────────────────────────────────────────────────
function tryWebSpeech(text, { onStart, onEnd, onError, onLipSync }) {
  console.log('[voiceService] 🔄 Trying Web Speech API fallback')
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.error('[voiceService] ❌ SpeechSynthesis not supported')
    onError?.('SpeechSynthesis not supported')
    return false
  }

  const utter = new SpeechSynthesisUtterance(text)
  activeUtterance = utter

  // Try to find an Azerbaijani or at least Turkish voice (closest phonology)
  const voices = window.speechSynthesis.getVoices()
  const azVoice = voices.find(v => v.lang.toLowerCase().startsWith('az'))
    || voices.find(v => v.lang.toLowerCase().startsWith('tr')) // Turkish fallback
  if (azVoice) utter.voice = azVoice
  utter.lang  = 'az-AZ'
  utter.rate  = 0.94
  utter.pitch = 1.05

  utter.onstart = () => {
    onStart?.()
    if (onLipSync) startLipSync(onLipSync)
  }

  utter.onend = () => {
    cleanup()
    onEnd?.()
  }

  utter.onerror = (e) => {
    cleanup()
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      onError?.(e.error)
    }
  }

  try {
    console.log('[voiceService] 🗣 Web Speech: speaking...')
    window.speechSynthesis.speak(utter)
    return true
  } catch (err) {
    console.error('[voiceService] ❌ Web Speech error:', err.message)
    cleanup()
    onError?.(err.message)
    return false
  }
}

// ── Main public function ──────────────────────────────────────────────────────
/**
 * Speak text in Azerbaijani.
 * Uses Silero TTS if the local server is running; falls back to Web Speech API.
 *
 * @param {string} text
 * @param {object} opts
 * @param {function} [opts.onLipSync]  - called with mouthOpen 0–1 at 50 ms intervals
 * @param {function} [opts.onStart]
 * @param {function} [opts.onEnd]
 * @param {function} [opts.onError]
 * @param {boolean}  [opts.forceSilero] - skip availability check, try Silero directly
 */
export async function speakLessonText(text, {
  onLipSync  = null,
  onStart    = null,
  onEnd      = null,
  onError    = null,
  forceSilero = false,
} = {}) {
  console.log('[voiceService] 📣 speakLessonText called, text length:', text?.length)
  stopLessonSpeech()

  if (!text?.trim()) {
    console.warn('[voiceService] ⚠️ Empty text, skipping')
    return
  }

  const opts = { onStart, onEnd, onError, onLipSync }

  // Try Silero first (check availability unless already known)
  const useSilero = forceSilero || (await checkSileroAvailable())
  console.log('[voiceService] useSilero:', useSilero, '(cached:', sileroAvailable, ')')

  if (useSilero) {
    const ok = await trySilero(text, opts)
    if (ok) return
  }

  // Fallback: Web Speech API
  tryWebSpeech(text, opts)
}

// ── Stop all speech ───────────────────────────────────────────────────────────
export function stopLessonSpeech() {
  // Stop Silero audio
  if (activeAudio) {
    try { activeAudio.pause() } catch {}
    activeAudio = null
  }

  // Stop Web Speech
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }

  cleanup()
}
