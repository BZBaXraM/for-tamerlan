import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Plus,
  Clock,
  Search,
  ChevronRight,
  User,
  Bot,
} from "lucide-react";

export default function ChatSidebar({
  isOpen,
  onClose,
  chatHistory = [],
  currentMessages = [],
  onSelectChat,
  onNewChat,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, isOpen]);

  const defaultArchivedChats = [
    {
      id: "chat_1",
      title: "HTML5 Semantik Teqlər və SEO",
      date: "Bugün, 14:15",
      preview:
        "Semantik teqlər (<article>, <section>) axtarış motorlarına səhifəni daha dəqiq anlamağa kömək edir.",
    },
    {
      id: "chat_2",
      title: "CSS Flexbox və Grid Müqayisəsi",
      date: "Dünən, 18:40",
      preview:
        "Bir ölçülü düzülüş üçün Flexbox, iki ölçülü mürəkkəb layout üçün CSS Grid istifadə edilir.",
    },
    {
      id: "chat_3",
      title: "Sistem Dizaynı: Redis Keş",
      date: "2 gün əvvəl",
      preview:
        "Redis hit müddəti ~2ms, indeksli sorğu isə verilənlər bazasını sürətləndirir.",
    },
    {
      id: "chat_4",
      title: "Veb Təhlükəsizliyi: JWT",
      date: "Keçən həftə",
      preview:
        "Stateless sessiya idarəsi və mikroservislər arası təhlükəsiz əlaqə protokolu.",
    },
  ];

  const chatsToShow = (
    chatHistory.length > 0 ? chatHistory : defaultArchivedChats
  ).filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.preview || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.18)",
            zIndex: 90,
            backdropFilter: "blur(2px)",
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* Sidebar Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "368px",
          background: "#ffffff",
          borderLeft: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.14)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#faf9f6",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={17} color="#18181b" />
            <h2
              style={{
                fontSize: "14.5px",
                fontWeight: "700",
                margin: 0,
                color: "#111827",
              }}
            >
              Söhbət Tarixçəsi
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={onNewChat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "5px 10px",
                borderRadius: "20px",
                border: "1px solid #e5e3dc",
                background: "#ffffff",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                color: "#374151",
              }}
            >
              <Plus size={13} />
              <span>Yeni</span>
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "5px",
                borderRadius: "8px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#6b7280",
                display: "flex",
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#f5f4f0",
              borderRadius: "10px",
              padding: "6px 12px",
            }}
          >
            <Search size={13} color="#9ca3af" />
            <input
              type="text"
              placeholder="Keçmiş söhbətlərdə axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "12.5px",
                width: "100%",
                color: "#1f2937",
              }}
            />
          </div>
        </div>

        {/* ── CURRENT SESSION MESSAGES ── */}
        {currentMessages.length > 0 && (
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              maxHeight: "280px",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                color: "#9ca3af",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Cari Söhbət
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {currentMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: msg.sender === "user" ? "#18181b" : "#ea580c",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {msg.sender === "user" ? (
                      <User size={12} />
                    ) : (
                      <Bot size={12} />
                    )}
                  </div>
                  <div
                    style={{
                      background: msg.sender === "user" ? "#f3f4f6" : "#fff7ed",
                      padding: "7px 11px",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                      color: "#1f2937",
                      lineHeight: "1.5",
                      maxWidth: "88%",
                      animation: "fadeInUp 0.2s ease",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* ── ARCHIVED CHATS ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          <div
            style={{
              fontSize: "10.5px",
              fontWeight: "700",
              letterSpacing: "0.08em",
              color: "#9ca3af",
              textTransform: "uppercase",
              padding: "0 6px 8px 6px",
            }}
          >
            Əvvəlki Mövzular
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {chatsToShow.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat && onSelectChat(chat)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "#faf9f6",
                  border: "1px solid rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f0efe9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#faf9f6")
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "3px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {chat.title}
                  </div>
                  <ChevronRight size={13} color="#9ca3af" />
                </div>

                <div
                  style={{
                    fontSize: "11.5px",
                    color: "#6b7280",
                    lineHeight: "1.4",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: "6px",
                  }}
                >
                  {chat.preview}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "10.5px",
                    color: "#9ca3af",
                  }}
                >
                  <Clock size={11} />
                  <span>{chat.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
