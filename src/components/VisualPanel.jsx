import React, { useState, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Sparkles } from "lucide-react";

export default function VisualPanel({
  lesson,
  activeTab = "scheme",
  onTabChange,
  onTeacherFocus,
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNode, setActiveNode] = useState(null);

  const frames = lesson?.video?.frames || [];

  useEffect(() => {
    setCurrentFrame(0);
    setIsPlaying(false);
    setActiveNode(null);
  }, [lesson]);

  useEffect(() => {
    let timer = null;
    if (isPlaying && frames.length > 0) {
      timer = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, frames.length]);

  const curFrameData = frames[currentFrame] || { num: 1, text: "" };
  const progressPct =
    frames.length > 0 ? ((currentFrame + 1) / frames.length) * 100 : 0;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* ── TAB BAR ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          background: "#faf9f6",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { id: "scheme", label: "Şəkil / Sxem" },
            { id: "video", label: "Video İzah" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: "pointer",
                border: "none",
                background: activeTab === id ? "#18181b" : "transparent",
                color: activeTab === id ? "#ffffff" : "#6b7280",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <span
          style={{
            fontSize: "11.5px",
            fontWeight: "700",
            letterSpacing: "0.06em",
            color: "#9ca3af",
            fontFamily: "monospace",
          }}
        >
          {activeTab === "video"
            ? lesson?.video?.duration || "02:05"
            : lesson?.visualLabel || "VİZUAL LÖVHƏ"}
        </span>
      </div>

      {/* ── CONTENT ── */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {activeTab === "scheme" ? (
          /* ─── DIAGRAM / SCHEME ─── */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#fcfbf8",
                border: "1px dashed #e5e3dc",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                minHeight: "160px",
              }}
            >
              {/* Node flow */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                {lesson?.diagram?.nodes?.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <div
                      onClick={() => {
                        setActiveNode(node.id);
                        if (onTeacherFocus) onTeacherFocus("visual");
                      }}
                      style={{
                        padding: "10px 16px",
                        background:
                          node.type === "accent"
                            ? "#fff5f3"
                            : node.type === "primary"
                              ? "#18181b"
                              : node.type === "dashed"
                                ? "#f9fafb"
                                : "#ffffff",
                        border:
                          node.type === "accent"
                            ? "1.5px solid #ea580c"
                            : node.type === "primary"
                              ? "1.5px solid #18181b"
                              : node.type === "dashed"
                                ? "1.5px dashed #d1d5db"
                                : activeNode === node.id
                                  ? "1.5px solid #ea580c"
                                  : "1.5px solid #e5e3dc",
                        color:
                          node.type === "accent"
                            ? "#ea580c"
                            : node.type === "primary"
                              ? "#ffffff"
                              : "#111827",
                        borderRadius: "10px",
                        textAlign: "center",
                        cursor: "pointer",
                        boxShadow:
                          activeNode === node.id
                            ? "0 0 0 3px rgba(234,88,12,0.2)"
                            : "0 1px 4px rgba(0,0,0,0.04)",
                        transition: "all 0.18s ease",
                        minWidth: "80px",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "700" }}>
                        {node.label}
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          marginTop: "2px",
                          color:
                            node.type === "primary" ? "#9ca3af" : "#6b7280",
                          fontWeight: "500",
                        }}
                      >
                        {node.sub}
                      </div>
                    </div>

                    {i < lesson.diagram.nodes.length - 1 && (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            position: "relative",
                            width: "28px",
                            height: "2px",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: i === 0 ? "#18181b" : "#d1d5db",
                              borderTop:
                                i === 1 ? "2px dashed #c4c4c4" : "none",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              right: "-2px",
                              top: "-4px",
                              borderTop: "5px solid transparent",
                              borderBottom: "5px solid transparent",
                              borderLeft: `6px solid ${i === 0 ? "#18181b" : "#9ca3af"}`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {activeNode && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "7px 14px",
                    background: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e5e3dc",
                    fontSize: "12px",
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    animation: "fadeIn 0.25s ease",
                  }}
                >
                  <Sparkles size={13} color="#ea580c" />
                  <span>
                    Seçilmiş qovşaq: <strong>{activeNode.toUpperCase()}</strong>
                    . AI Müəllim izah edir...
                  </span>
                </div>
              )}
            </div>

            <p style={{ margin: 0, fontSize: "11.5px", color: "#9ca3af" }}>
              {lesson?.visualCaption || "Canlı vizual izah"}
            </p>
          </div>
        ) : (
          /* ─── VIDEO SIMULATION ─── */
          <div
            style={{
              flex: 1,
              background: "#18191d",
              borderRadius: "12px",
              padding: "18px",
              color: "#ffffff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "inset 0 2px 12px rgba(0,0,0,0.45)",
              minHeight: "160px",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontFamily: "monospace",
                fontSize: "10.5px",
                color: "#6b7280",
                letterSpacing: "0.08em",
                marginBottom: "12px",
                flexShrink: 0,
              }}
            >
              <span>{lesson?.video?.title || "DƏRS VİDEO SİMULYASİYASI"}</span>
              <span>
                Kadr {curFrameData.num} / {frames.length || 3}
              </span>
            </div>

            {/* Step text */}
            <div
              style={{
                flex: 1,
                fontSize: "14.5px",
                lineHeight: "1.65",
                fontWeight: "500",
                color: "#f1f5f9",
                padding: "4px 0",
              }}
            >
              {curFrameData.text}
            </div>

            {/* Controls */}
            <div style={{ flexShrink: 0, marginTop: "14px" }}>
              {/* Progress bar */}
              <div
                style={{
                  width: "100%",
                  height: "3px",
                  background: "#2e3440",
                  borderRadius: "2px",
                  marginBottom: "12px",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const fraction = (e.clientX - rect.left) / rect.width;
                  setCurrentFrame(
                    Math.min(
                      frames.length - 1,
                      Math.max(0, Math.floor(fraction * frames.length)),
                    ),
                  );
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, #ea580c, #f97316)",
                    borderRadius: "2px",
                    transition: "width 0.35s ease",
                  }}
                />
              </div>

              {/* Playback buttons */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "#ea580c",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isPlaying ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} fill="#fff" />
                  )}
                </button>

                <button
                  onClick={() => setCurrentFrame((p) => Math.max(0, p - 1))}
                  disabled={currentFrame === 0}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: currentFrame === 0 ? "default" : "pointer",
                    color: currentFrame === 0 ? "#374151" : "#d1d5db",
                    padding: "4px",
                  }}
                >
                  <SkipBack size={17} />
                </button>

                <button
                  onClick={() =>
                    setCurrentFrame((p) => Math.min(frames.length - 1, p + 1))
                  }
                  disabled={currentFrame >= frames.length - 1}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor:
                      currentFrame >= frames.length - 1 ? "default" : "pointer",
                    color:
                      currentFrame >= frames.length - 1 ? "#374151" : "#d1d5db",
                    padding: "4px",
                  }}
                >
                  <SkipForward size={17} />
                </button>

                <span
                  style={{
                    fontSize: "11px",
                    color: "#4b5563",
                    marginLeft: "auto",
                    fontFamily: "monospace",
                  }}
                >
                  {isPlaying ? "● Oxunur" : "▸ Durduruldu"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
