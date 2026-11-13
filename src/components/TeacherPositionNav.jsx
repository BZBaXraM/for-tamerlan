import React from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function TeacherPositionNav({
  focusPosition = "visual",
  onFocusChange,
  speechText = "",
  isSpeaking = false,
  onToggleSpeech,
}) {
  const positions = [
    { id: "visual", label: "01. Şəkil & Video" },
    { id: "text", label: "02. Mətn qaydası" },
    { id: "ring", label: "03. Dairəvi model" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        userSelect: "none",
      }}
    >
      {/* ── SPEECH BUBBLE ── */}
      {speechText && (
        <div
          onClick={onToggleSpeech}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            background: "#18181b",
            color: "#ffffff",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "12.5px",
            fontWeight: "500",
            boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
            cursor: "pointer",
            maxWidth: "460px",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {isSpeaking ? (
            <Volume2
              size={15}
              color="#fb923c"
              style={{ flexShrink: 0, animation: "speakPulse 1.2s infinite" }}
            />
          ) : (
            <VolumeX size={15} color="#6b7280" style={{ flexShrink: 0 }} />
          )}
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {speechText}
          </span>
        </div>
      )}

      {/* ── POSITION PILL ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          borderRadius: "24px",
          padding: "5px 10px 5px 14px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.08)",
          gap: "6px",
        }}
      >
        <span
          style={{
            fontSize: "11.5px",
            fontWeight: "600",
            color: "#6b7280",
            marginRight: "2px",
            whiteSpace: "nowrap",
          }}
        >
          AI Müəllim mövqeyi:
        </span>

        {positions.map(({ id, label }) => {
          const isActive = focusPosition === id;
          return (
            <button
              key={id}
              onClick={() => onFocusChange(id)}
              style={{
                padding: "5px 14px",
                borderRadius: "18px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: isActive ? "none" : "1px solid #e5e3dc",
                background: isActive ? "#18181b" : "#ffffff",
                color: isActive ? "#ffffff" : "#374151",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
