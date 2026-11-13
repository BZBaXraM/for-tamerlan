import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { UploadCloud, MessageSquare, Volume2, VolumeX } from 'lucide-react'

import StudioScene from './components/StudioScene'
import VisualPanel from './components/VisualPanel'
import LessonTextPanel from './components/LessonTextPanel'
import TeacherPositionNav from './components/TeacherPositionNav'
import ChatSidebar from './components/ChatSidebar'
import PromptInputBar from './components/PromptInputBar'
import PdfUploadModal from './components/PdfUploadModal'
import SelectionTooltip from './components/SelectionTooltip'

import { DEFAULT_LESSONS } from './utils/lessonData'
import { speakLessonText, stopLessonSpeech, checkSileroAvailable, resetSileroCache } from './utils/voiceService'

export default function App() {
  const [currentLessonId, setCurrentLessonId] = useState('html')
  const [activeLesson, setActiveLesson] = useState(DEFAULT_LESSONS.html)
  const [visualTab, setVisualTab] = useState('scheme')

  const [focusPosition, setFocusPosition] = useState('visual')
  const [isWalking, setIsWalking] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false) // silent by default
  const [speechText, setSpeechText] = useState('')

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [sileroReady, setSileroReady] = useState(null) // null=checking, true, false

  // Text-selection tooltip state
  const [selectionHint, setSelectionHint] = useState(null) // { text, hint }

  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Salam! Mən sizin interaktiv AI müəlliminizəm. Hər hansı sualınız olduqda aşağıdan yaza bilərsiniz.'
    }
  ])

  // ── speak only when sound is explicitly enabled ──────────────────
  const speakText = useCallback((text, force = false) => {
    console.log('[App] speakText called, text length:', text?.length, 'soundEnabled:', soundEnabled, 'force:', force)
    setSpeechText(text)
    if (!text || (!soundEnabled && !force)) {
      console.log('[App] Skipping speech: no text or sound disabled')
      return
    }
    console.log('[App] Starting speech...')
    setIsSpeaking(true)
    speakLessonText(text, {
      lang: 'az',
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    })
  }, [soundEnabled])

  const speakCurrentFocus = useCallback((pos, customText, force = false) => {
    const text = customText ?? (
      pos === 'visual' ? activeLesson?.teacherSpeech?.visual :
      pos === 'text'   ? activeLesson?.teacherSpeech?.text   :
      pos === 'ring'   ? activeLesson?.teacherSpeech?.ring   : ''
    ) ?? ''
    console.log('[App] speakCurrentFocus:', pos, 'force:', force, 'text length:', text?.length)
    speakText(text, force)
  }, [activeLesson, speakText])

  const handleFocusChange = (pos) => {
    setFocusPosition(pos)
    speakCurrentFocus(pos)
  }

  const handleSelectPreset = (presetKey) => {
    const lesson = DEFAULT_LESSONS[presetKey]
    if (!lesson) return
    setActiveLesson(lesson)
    setCurrentLessonId(presetKey)
    stopLessonSpeech()
    setIsSpeaking(false)
    setFocusPosition('visual')
    setSpeechText('')
  }

  const handleLessonLoaded = (newLesson) => {
    setActiveLesson(newLesson)
    setCurrentLessonId('uploaded')
    stopLessonSpeech()
    setIsSpeaking(false)
    setFocusPosition('visual')
    setSpeechText('')
  }

  const handleSendMessage = ({ text, attachments }) => {
    const userMsg = {
      sender: 'user',
      text: text || (attachments.length > 0 ? `[${attachments.length} fayl]` : ''),
      attachments
    }
    setChatMessages(prev => [...prev, userMsg])

    setTimeout(() => {
      let aiReply = ''
      const lower = (text || '').toLowerCase()
      if (lower.includes('html') || lower.includes('teq') || lower.includes('tag')) {
        aiReply = 'HTML teqləri səhifənin skeletini təşkil edir. Hər bir teq brauzerə elementin növünü bildirir.'
        setFocusPosition('text')
      } else if (lower.includes('redis') || lower.includes('keş') || lower.includes('cache')) {
        aiReply = 'Redis yaddaşda işlədiyi üçün sorğuları mikrosaniyələrdə icra edir — verilənlər bazasının yükünü 90% azaldır.'
        setFocusPosition('visual')
      } else if (lower.includes('jwt') || lower.includes('token') || lower.includes('auth')) {
        aiReply = 'JWT istifadəçinin kimliyini yoxlamaq üçün rəqəmsal imzalanmış JSON obyektidir.'
        setFocusPosition('ring')
      } else {
        aiReply = `Əla sual! "${text || 'Fayl'}" haqqında: hər element bir-biri ilə əlaqəli işləyir. Sol sxemə baxın.`
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiReply }])
      speakText(aiReply)
    }, 600)
  }

  const toggleSound = () => {
    console.log('[App] toggleSound clicked, current soundEnabled:', soundEnabled)
    if (soundEnabled) {
      console.log('[App] Disabling sound')
      stopLessonSpeech()
      setIsSpeaking(false)
      setSoundEnabled(false)
    } else {
      console.log('[App] Enabling sound, will speak focus position:', focusPosition)
      setSoundEnabled(true)
      // Immediately speak current focus position when turning sound ON (force=true bypasses soundEnabled check)
      setTimeout(() => {
        console.log('[App] Calling speakCurrentFocus with force=true')
        speakCurrentFocus(focusPosition, null, true)
      }, 100)
    }
  }

  // ── Check Silero TTS on mount, retry every 8 s until found ─────────
  useEffect(() => {
    let timer
    const check = async () => {
      const ok = await checkSileroAvailable()
      setSileroReady(ok)
      if (!ok) timer = setTimeout(check, 8000)
    }
    check()
    return () => clearTimeout(timer)
  }, [])

  // ── PDF TEXT SELECTION → full explanation above head ─────────────
  useEffect(() => {
    const handleMouseUp = () => {
      // ── PDF TEXT SELECTION — small delay so selection is committed
      setTimeout(() => {
        const selection = window.getSelection()
        const selected = selection?.toString()?.trim()
        if (!selected || selected.length < 3) {
          if (!document.querySelector('[data-tooltip]')?.contains(document.activeElement)) {
            setSelectionHint(null)
          }
          return
        }
        setSelectionHint({ text: selected })
        setFocusPosition('text')
      }, 80)
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#f4f3ef',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#111827'
      }}
    >
      {/* ── TOP NAV ─────────────────────────────────────── */}
      <header style={{
        height: '52px',
        padding: '0 20px',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 40,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: '#18181b', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '900', fontSize: '14px'
          }}>E</div>
          <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#111827', letterSpacing: '-0.02em' }}>EduAI</span>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>· İnteraktiv Müəllim</span>
          <div style={{ width: '1px', height: '18px', background: '#e5e5e5', margin: '0 4px' }} />
          <div style={{ display: 'flex', gap: '4px' }}>
            {[{ key: 'html', label: 'HTML & CSS 01' }, { key: 'system_design', label: 'Sistem Dizaynı 06' }].map(({ key, label }) => (
              <button key={key} onClick={() => handleSelectPreset(key)} style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                border: currentLessonId === key ? '1.5px solid #18181b' : '1.5px solid transparent',
                background: currentLessonId === key ? '#18181b' : '#f0eff0',
                color: currentLessonId === key ? '#fff' : '#4b5563',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setIsUploadModalOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 13px', borderRadius: '20px',
            border: '1.5px solid #ea580c', background: '#fff7ed',
            color: '#ea580c', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
          }}>
            <UploadCloud size={14} /><span>PDF Yüklə</span>
          </button>

          {/* Sound toggle — shows clearly when ON/OFF */}
          <button onClick={toggleSound} title={soundEnabled ? 'Səsi söndür' : 'Səsi aç'} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 12px', borderRadius: '20px',
            border: '1.5px solid #e5e3dc',
            background: soundEnabled ? '#ecfdf5' : '#fff',
            color: soundEnabled ? '#059669' : '#6b7280',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{soundEnabled ? 'Səs açıq' : 'Səssiz'}</span>
          </button>

          {/* Silero TTS status badge */}
          <div title={
            sileroReady === null ? 'Silero TTS yoxlanılır...' :
            sileroReady ? 'Silero TTS aktiv — keyfiyyətli Azərbaycan nitqi' :
            'Silero TTS tapılmadı. Başlatmaq üçün: bash silero-server/start.sh'
          } style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '20px',
            border: '1.5px solid',
            borderColor: sileroReady === null ? '#e5e3dc' : sileroReady ? '#bbf7d0' : '#fde68a',
            background: sileroReady === null ? '#f9fafb' : sileroReady ? '#f0fdf4' : '#fffbeb',
            fontSize: '11.5px', fontWeight: '600', userSelect: 'none',
            color: sileroReady === null ? '#9ca3af' : sileroReady ? '#15803d' : '#92400e',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
              background: sileroReady === null ? '#d1d5db' : sileroReady ? '#22c55e' : '#f59e0b',
              animation: sileroReady === null ? 'statusPulse 1.4s ease-in-out infinite' : 'none'
            }} />
            <span>
              {sileroReady === null ? 'TTS...' : sileroReady ? 'Silero AI' : 'TTS yoxdur'}
            </span>
          </div>

          <button onClick={() => setIsChatOpen(!isChatOpen)} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 14px', borderRadius: '20px',
            border: isChatOpen ? 'none' : '1.5px solid #e5e3dc',
            background: isChatOpen ? '#18181b' : '#fff',
            color: isChatOpen ? '#fff' : '#374151',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <MessageSquare size={14} /><span>Tarixçə</span>
          </button>
        </div>
      </header>

      {/* ── MAIN PANELS ─────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        padding: '16px 20px 0 20px',
        minHeight: 0,
        maxHeight: 'calc(100vh - 52px - 320px - 68px)',
        overflow: 'hidden'
      }}>
        <VisualPanel
          lesson={activeLesson}
          activeTab={visualTab}
          onTabChange={setVisualTab}
          onTeacherFocus={handleFocusChange}
        />
        <LessonTextPanel
          lesson={activeLesson}
          onTeacherFocus={handleFocusChange}
          onPillSelect={(pill) => speakText(`${pill.title}: ${pill.desc}`)}
        />
      </div>

      {/* ── TEACHER STAGE ───────────────────────────────── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '310px',
        flexShrink: 0,
        zIndex: 15,
        background: 'linear-gradient(to bottom, rgba(244,243,239,0) 0%, rgba(244,243,239,0.35) 60%, rgba(244,243,239,0) 100%)'
      }}>
        <Canvas
          shadows
          camera={{ position: [0, 0.55, 2.9], fov: 32 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <StudioScene
            modelType="realistic"
            wireframe={false}
            expression="smile"
            smileIntensity={0.9}
            headTilt={0.0}
            idleAnimation={true}
            isWalking={isWalking}
            walkSpeed={0.85}
            turntable={false}
            cameraPreset="full"
            focusPosition={focusPosition}
            isSpeaking={isSpeaking}
            floorStyle="invisible"
          />
        </Canvas>

        {/* Position nav pill */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 20
        }}>
          <TeacherPositionNav
            focusPosition={focusPosition}
            onFocusChange={handleFocusChange}
            speechText={speechText}
            isSpeaking={isSpeaking}
            onToggleSpeech={toggleSound}
          />
        </div>
      </div>

      {/* ── BOTTOM INPUT BAR ─────────────────────────────── */}
      <div style={{
        height: '68px', padding: '0 20px 14px 20px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 30, background: 'rgba(244,243,239,0.96)',
        backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.05)',
        flexShrink: 0
      }}>
        <PromptInputBar
          onSendMessage={handleSendMessage}
          isListening={isListening}
          setIsListening={setIsListening}
        />
      </div>

      {/* ── SELECTION TOOLTIP — fixed, above teacher's head, never clipped ── */}
      <SelectionTooltip 
        hint={selectionHint} 
        onDismiss={() => setSelectionHint(null)}
        onSpeak={(text) => {
          // Speak explanation text when tooltip appears
          // Only if sound is enabled
          if (soundEnabled) {
            console.log('[App] SelectionTooltip triggered speech')
            speakText(text, true) // force=true to bypass soundEnabled check (since we already checked)
          } else {
            console.log('[App] SelectionTooltip speech skipped (sound disabled)')
          }
        }}
      />

      <ChatSidebar
        onClose={() => setIsChatOpen(false)}
        currentMessages={chatMessages}
        onSelectChat={(chat) => {
          setChatMessages([
            { sender: 'user', text: `Keçmiş mövzu: ${chat.title}` },
            { sender: 'ai', text: chat.preview }
          ])
          speakText(chat.preview)
        }}
        onNewChat={() => setChatMessages([{ sender: 'ai', text: 'Yeni söhbət. Hansı mövzu üzrə sualınız var?' }])}
      />

      <PdfUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onLessonLoaded={handleLessonLoaded}
        onSelectPreset={handleSelectPreset}
      />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes tooltipFloat {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes waveHand {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(20deg); }
          30%  { transform: rotate(-10deg); }
          45%  { transform: rotate(16deg); }
          60%  { transform: rotate(-6deg); }
          75%  { transform: rotate(10deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::selection { background: rgba(234,88,12,0.18); color: inherit; }
      `}</style>
    </div>
  )
}
