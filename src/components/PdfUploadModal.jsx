import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { parsePdfAndBuildLesson } from "../utils/pdfLessonParser";
import { buildLessonFromParsedPdf } from "../utils/lessonData";

export default function PdfUploadModal({
  isOpen,
  onClose,
  onLessonLoaded,
  onSelectPreset,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFile = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Zəhmət olmasa düzgün .pdf formatında fayl seçin.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parsePdfAndBuildLesson(file);
      if (!parsed.success) {
        setError(parsed.error || "PDF faylını oxumaq mümkün olmadı.");
        setIsLoading(false);
        return;
      }

      const lessonData = buildLessonFromParsedPdf(parsed);
      setIsLoading(false);
      onLessonLoaded(lessonData);
      onClose();
    } catch (err) {
      console.error("PDF parsing error:", err);
      setError("Fayl emal edilərkən xəta baş verdi: " + err.message);
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(8px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "540px",
          padding: "28px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
          border: "1px solid #e5e3dc",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "#fff7ed",
              color: "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UploadCloud size={20} />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "800",
                color: "#111827",
              }}
            >
              PDF Dərs Yükləyin
            </h2>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#6b7280" }}>
              İstənilən fənn üzrə mühazirə və ya slayd PDF faylını daxil edin
            </p>
          </div>
        </div>

        {/* DRAG & DROP AREA */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("pdf-file-picker").click()}
          style={{
            marginTop: "20px",
            border: isDragging ? "2px dashed #ea580c" : "2px dashed #d1d5db",
            background: isDragging ? "#fff7ed" : "#faf9f6",
            borderRadius: "14px",
            padding: "36px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <input
            id="pdf-file-picker"
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <FileText
            size={38}
            color={isDragging ? "#ea580c" : "#9ca3af"}
            style={{ marginBottom: "10px" }}
          />

          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "4px",
            }}
          >
            {isLoading
              ? "PDF analiz edilir və interaktiv dərs qurulur..."
              : "Faylı bura sürükləyin və ya seçin"}
          </div>

          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            HTML/CSS, Proqramlaşdırma və ya Sistem Dizaynı dərsləri
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#dc2626",
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* READY PRESETS */}
        <div style={{ marginTop: "22px" }}>
          <div
            style={{
              fontSize: "11.5px",
              fontWeight: "700",
              letterSpacing: "0.06em",
              color: "#9ca3af",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Və ya Hazır Dərsi Seçin
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <button
              onClick={() => {
                onSelectPreset("html");
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#faf9f6",
                border: "1px solid #e5e3dc",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3f1ea")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#faf9f6")
              }
            >
              <BookOpen size={20} color="#ea580c" />
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  HTML & CSS 01
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>
                  Struktur və Teqlər
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectPreset("system_design");
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#faf9f6",
                border: "1px solid #e5e3dc",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3f1ea")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#faf9f6")
              }
            >
              <Sparkles size={20} color="#3b82f6" />
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  Sistem Dizaynı 06
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>
                  Keşləmə & faf
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
