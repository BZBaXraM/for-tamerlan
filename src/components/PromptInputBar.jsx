import React, { useState, useRef } from "react";
import { Send, Image as ImageIcon, Video, Mic, MicOff, X } from "lucide-react";
import { createSpeechRecognizer } from "../utils/speechHelper";

export default function PromptInputBar({
  onSendMessage,
  isListening,
  setIsListening,
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const recognizerRef = useRef(null);

  const toggleListening = () => {
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
    } else {
      const recognizer = createSpeechRecognizer({
        lang: "az",
        onResult: (transcript) => {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false),
      });
      if (recognizer?.supported) {
        recognizerRef.current = recognizer;
        setIsListening(true);
        recognizer.start();
      } else {
        alert("Brauzeriniz nitqi tanıma dəstəkləmir.");
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachments((prev) => [
      ...prev,
      { type: "image", name: file.name, url: URL.createObjectURL(file), file },
    ]);
    e.target.value = "";
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachments((prev) => [
      ...prev,
      { type: "video", name: file.name, url: URL.createObjectURL(file), file },
    ]);
    e.target.value = "";
  };

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;
    onSendMessage({ text: text.trim(), attachments });
    setText("");
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 || attachments.length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            paddingLeft: "6px",
            flexWrap: "wrap",
          }}
        >
          {attachments.map((att, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "#ffffff",
                border: "1px solid #e5e3dc",
                borderRadius: "20px",
                padding: "3px 10px",
                fontSize: "11.5px",
                color: "#374151",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              {att.type === "image" ? (
                <ImageIcon size={12} color="#ea580c" />
              ) : (
                <Video size={12} color="#3b82f6" />
              )}
              <span
                style={{
                  maxWidth: "130px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {att.name}
              </span>
              <button
                onClick={() =>
                  setAttachments(attachments.filter((_, idx) => idx !== i))
                }
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                }}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main input pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#ffffff",
          borderRadius: "28px",
          padding: "5px 6px 5px 14px",
          border: isListening
            ? "1.5px solid #ea580c"
            : "1.5px solid rgba(0,0,0,0.1)",
          boxShadow: isListening
            ? "0 4px 20px rgba(234,88,12,0.15)"
            : "0 4px 20px rgba(0,0,0,0.06)",
          transition: "all 0.2s ease",
        }}
      >
        {/* Hidden inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={handleVideoUpload}
        />

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <IconBtn
            onClick={() => imageInputRef.current?.click()}
            title="Şəkil əlavə et"
          >
            <ImageIcon size={17} />
          </IconBtn>
          <IconBtn
            onClick={() => videoInputRef.current?.click()}
            title="Video əlavə et"
          >
            <Video size={17} />
          </IconBtn>
          <IconBtn
            onClick={toggleListening}
            title={isListening ? "Dayandır" : "Səsli sual ver"}
            active={isListening}
            activeColor="#dc2626"
          >
            {isListening ? <MicOff size={17} /> : <Mic size={17} />}
          </IconBtn>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "18px",
            background: "#e5e3dc",
            flexShrink: 0,
          }}
        />

        {/* Text input */}
        <input
          type="text"
          placeholder={
            isListening ? "Sizi dinləyirəm..." : "AI Müəllimə sual verin..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "13.5px",
            color: "#111827",
            background: "transparent",
            padding: "6px 4px",
            fontFamily: "inherit",
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            background: canSend ? "#18181b" : "#e5e7eb",
            color: "#ffffff",
            cursor: canSend ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s ease",
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  active,
  activeColor = "#ea580c",
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? "#fee2e2" : "transparent",
        border: "none",
        padding: "6px",
        borderRadius: "50%",
        cursor: "pointer",
        color: active ? activeColor : "#6b7280",
        display: "flex",
        alignItems: "center",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) =>
        !active && (e.currentTarget.style.background = "#f5f4f0")
      }
      onMouseLeave={(e) =>
        !active && (e.currentTarget.style.background = "transparent")
      }
    >
      {children}
    </button>
  );
}
