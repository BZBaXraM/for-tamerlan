import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function LessonTextPanel({
  lesson,
  onTeacherFocus,
  onPillSelect,
}) {
  const [selectedPill, setSelectedPill] = useState(
    lesson?.ringWidget?.activePill || "auth",
  );

  useEffect(() => {
    setSelectedPill(
      lesson?.ringWidget?.activePill ||
        lesson?.ringWidget?.pills?.[0]?.id ||
        "",
    );
  }, [lesson]);

  const ringData = lesson?.ringWidget || {};
  const activePillData =
    ringData.pills?.find((p) => p.id === selectedPill) ||
    ringData.pills?.[0] ||
    {};

  const handlePillClick = (pill) => {
    setSelectedPill(pill.id);
    if (onPillSelect) onPillSelect(pill);
    if (onTeacherFocus) onTeacherFocus("ring");
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── BADGE ── */}
      <div style={{ marginBottom: "8px", flexShrink: 0 }}>
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: "800",
            letterSpacing: "0.1em",
            color: "#ea580c",
            textTransform: "uppercase",
          }}
        >
          {lesson?.badge || "DƏRS 01 · TƏLİM İZAHI"}
        </span>
      </div>

      {/* ── TITLE ── */}
      <h1
        style={{
          fontSize: "22px",
          fontWeight: "800",
          color: "#111827",
          margin: "0 0 14px 0",
          letterSpacing: "-0.03em",
          lineHeight: "1.25",
          flexShrink: 0,
        }}
      >
        {lesson?.title || "Mövzu Başlığı"}
      </h1>

      {/* ── PARAGRAPHS ── */}
      <div
        style={{
          fontSize: "13.5px",
          lineHeight: "1.7",
          color: "#374151",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "14px",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {lesson?.paragraphs?.slice(0, 3).map((p, idx) => (
          <p key={idx} style={{ margin: 0 }}>
            {p}
          </p>
        ))}
      </div>

      {/* ── CODE / PERFORMANCE SNIPPET ── */}
      {lesson?.codeSnippet && (
        <div
          style={{
            background: "#f8f7f3",
            borderLeft: "3px solid #18181b",
            padding: "9px 13px",
            borderRadius: "0 8px 8px 0",
            fontFamily: "'Fira Code', 'Consolas', monospace",
            fontSize: "12.5px",
            fontWeight: "600",
            color: "#111827",
            flexShrink: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lesson.codeSnippet}
        </div>
      )}

      {/* ── RING WIDGET (bottom-right) ── */}
      <div
        style={{
          position: "absolute",
          bottom: "18px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* Circle */}
        <div
          onClick={() => onTeacherFocus && onTeacherFocus("ring")}
          style={{
            width: "172px",
            height: "172px",
            borderRadius: "50%",
            background: "#ffffff",
            border: "1.5px solid #e5e3dc",
            boxShadow: "0 8px 28px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            textAlign: "center",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            boxSizing: "border-box",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.04)";
            e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1.0)";
            e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)";
          }}
        >
          <div
            style={{
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "0.1em",
              color: "#9ca3af",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            {ringData.title || "ARXİTEKTURA HALQASI"}
          </div>

          <div
            style={{
              fontSize: "15px",
              fontWeight: "800",
              color: "#111827",
              marginBottom: "5px",
              letterSpacing: "-0.01em",
            }}
          >
            {activePillData.title || ringData.centerTag || "JWT / TLS"}
          </div>

          <div
            style={{
              fontSize: "10px",
              lineHeight: "1.4",
              color: "#6b7280",
              padding: "0 4px",
            }}
          >
            {activePillData.desc || ringData.description}
          </div>
        </div>

        {/* Pill buttons below the circle */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginTop: "-10px",
            zIndex: 12,
          }}
        >
          {ringData.pills?.map((pill) => {
            const isActive = selectedPill === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => handlePillClick(pill)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "10.5px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "#ea580c" : "#ffffff",
                  color: isActive ? "#ffffff" : "#374151",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  transition: "all 0.15s ease",
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
