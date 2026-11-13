import React, { useState, useEffect, useRef } from "react";
import Classroom3DScene from "./Classroom3DScene";
import { parsePdfAndBuildLesson } from "../utils/pdfLessonParser";
import {
  speakText,
  stopSpeech,
  createSpeechRecognizer,
} from "../utils/speechHelper";
import {
  FileText,
  Upload,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Image as ImageIcon,
  Video,
  Send,
  HelpCircle,
  Play,
  RotateCcw,
  Languages,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function PdfLessonScreen({ onBackToStudio }) {
  // Screen stages: 'upload' | 'processing' | 'classroom' | 'error'
  const [stage, setStage] = useState("upload");
  const [errorMessage, setErrorMessage] = useState("");
  const [lessonData, setLessonData] = useState(null);
  const [language, setLanguage] = useState("ru"); // 'ru' | 'az'

  // Classroom Lesson Progress
  // stepState: 'greeting' | 'level-check' | 'step-1' | 'step-2' | 'step-3' | 'quiz-1' | 'quiz-2' | 'completed' | 'user-qa'
  const [currentStepState, setCurrentStepState] = useState("greeting");
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0, 1, 2 for the 3 steps
  const [boardContent, setBoardContent] = useState(null);
  const [subtitles, setSubtitles] = useState("");
  const [currentPageCitation, setCurrentPageCitation] = useState(null);

  // 3D Teacher States
  const [teacherGesture, setTeacherGesture] = useState("rest"); // 'rest' | 'point-board' | 'explain' | 'listen'
  const [teacherLookAt, setTeacherLookAt] = useState("student"); // 'student' | 'board'
  const [teacherExpression, setTeacherExpression] = useState("smile");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Audio & Autoplay
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Interactive Q&A and Input
  const [userText, setUserText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micStatusNotice, setMicStatusNotice] = useState("");
  const [userUploadedMedia, setUserUploadedMedia] = useState(null); // { type: 'image' | 'video', url, name }

  // Quiz state
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null); // { correct: boolean, text: string }

  // Refs
  const fileInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const levelTimeoutRef = useRef(null);
  const stepAdvanceTimeoutRef = useRef(null);
  const speechRecognizerRef = useRef(null);

  // Initialize Speech Recognition on mount
  useEffect(() => {
    speechRecognizerRef.current = createSpeechRecognizer({
      lang: language,
      onResult: (transcript) => {
        setIsListeningMic(false);
        handleUserSubmit(transcript);
      },
      onError: (err) => {
        setIsListeningMic(false);
        if (err !== "no-speech") {
          setMicStatusNotice(`Микрофон: ${err}`);
        }
      },
      onEnd: () => {
        setIsListeningMic(false);
      },
    });

    return () => {
      stopSpeech();
      clearTimeout(levelTimeoutRef.current);
      clearTimeout(stepAdvanceTimeoutRef.current);
    };
  }, [language]);

  // Teacher speaks and synchronizes gestures and subtitles
  const speakTeacherPhrase = (
    text,
    { gesture = "rest", lookAt = "student", expression = "smile", onDone } = {},
  ) => {
    setSubtitles(text);
    setTeacherGesture(gesture);
    setTeacherLookAt(lookAt);
    setTeacherExpression(expression);

    if (!soundEnabled) {
      if (onDone) onDone();
      return;
    }

    const started = speakText(text, language, {
      onStart: () => {
        setIsSpeaking(true);
        setAudioBlocked(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        if (onDone) onDone();
      },
      onError: (err) => {
        setIsSpeaking(false);
        if (err === "not-allowed") {
          setAudioBlocked(true);
        }
        if (onDone) onDone();
      },
    });

    if (!started) {
      setAudioBlocked(true);
    }
  };

  // Handle PDF file selection
  const handlePdfUpload = async (file) => {
    if (!file) return;
    setStage("processing");
    setErrorMessage("");

    const result = await parsePdfAndBuildLesson(file);

    if (!result.success) {
      setStage("error");
      setErrorMessage(result.error);
      return;
    }

    setLessonData(result);
    setStage("classroom");
    startLessonFlow(result);
  };

  // Start the educational lesson flow automatically
  const startLessonFlow = (data) => {
    setCurrentStepState("greeting");
    setCurrentPageCitation(data.substantivePageNum);

    const isRu = language === "ru";
    const greetingText = isRu
      ? `Здравствуйте! Я изучила ваш документ по теме «${data.docTitle}». Пропускаем оглавление и начинаем с первой содержательной темы на странице ${data.substantivePageNum}: «${data.topicTitle}». ${data.levelQuestion.questionRu}`
      : `Salam! «${data.docTitle}» mövzulu sənədinizi araşdırdım. Mündəricatı keçərək birbaşa səhifə ${data.substantivePageNum}-dəki ilk əsas mövzu ilə başlayırıq: «${data.topicTitle}». ${data.levelQuestion.questionAz}`;

    setBoardContent({
      title: isRu
        ? "Добро пожаловать в виртуальный класс"
        : "Virtual sinfə xoş gəlmisiniz",
      type: "greeting",
      subtitle: data.docTitle,
      topic: data.topicTitle,
      pageNumber: data.substantivePageNum,
      levelQuestionText: isRu
        ? data.levelQuestion.questionRu
        : data.levelQuestion.questionAz,
    });

    speakTeacherPhrase(greetingText, {
      gesture: "explain",
      lookAt: "student",
      expression: "smile",
      onDone: () => {
        setCurrentStepState("level-check");
        // If student does not answer within 9 seconds, auto-proceed with simple explanation
        levelTimeoutRef.current = setTimeout(() => {
          proceedToStep(
            0,
            data,
            isRu
              ? "Отлично, тогда начнём с самого простого и наглядного объяснения!"
              : "Əla, onda ən sadə və aydın izahla başlayaq!",
          );
        }, 9000);
      },
    });
  };

  // Proceed to a specific instructional step (0, 1, 2)
  const proceedToStep = (index, data = lessonData, introPhrase = "") => {
    clearTimeout(levelTimeoutRef.current);
    if (!data || !data.steps || !data.steps[index]) {
      startQuizFlow(data);
      return;
    }

    setCurrentStepIndex(index);
    setCurrentStepState(`step-${index + 1}`);
    const step = data.steps[index];
    setCurrentPageCitation(step.pageNumber);

    // Update Blackboard
    setBoardContent({
      title: step.boardTitle,
      type: step.boardType,
      content: step.boardContent,
      pageNumber: step.pageNumber,
      pdfSnippet: step.pdfSnippet,
      pageImage: step.pageImage,
    });

    const speech =
      language === "ru" ? step.teacherSpeechRu : step.teacherSpeechAz;
    const fullText = introPhrase ? `${introPhrase} ${speech}` : speech;

    speakTeacherPhrase(fullText, {
      gesture: step.gesture || "point-board",
      lookAt: step.lookAt || "board",
      expression: "smile",
      onDone: () => {
        // Natural pause between steps, then proceed to next step
        stepAdvanceTimeoutRef.current = setTimeout(() => {
          if (index + 1 < data.steps.length) {
            proceedToStep(index + 1, data);
          } else {
            startQuizFlow(data);
          }
        }, 4500);
      },
    });
  };

  // Quiz Check Questions Flow
  const startQuizFlow = (data = lessonData) => {
    setCurrentStepState("quiz-1");
    setSelectedQuizOption(null);
    setQuizFeedback(null);

    const q1 = data.checkQuestions[0];
    setCurrentPageCitation(q1.pageNumber);

    const questionText = language === "ru" ? q1.questionRu : q1.questionAz;
    const speech =
      language === "ru"
        ? `Мы разобрали первую тему! Теперь проверим понимание. Первый вопрос: ${questionText}`
        : `İlk mövzunu tamamladıq! İndi biliyimizi yoxlayaq. Birinci sual: ${questionText}`;

    setBoardContent({
      title:
        language === "ru"
          ? "Проверка понимания: Вопрос 1 из 2"
          : "Bilik yoxlanışı: Sual 1/2",
      type: "quiz",
      question: q1,
      pageNumber: q1.pageNumber,
    });

    speakTeacherPhrase(speech, {
      gesture: "explain",
      lookAt: "student",
      expression: "serious",
    });
  };

  // Handle Student's Quiz Answer
  const handleQuizAnswer = (optionIndex, isCorrect) => {
    setSelectedQuizOption(optionIndex);
    const isRu = language === "ru";
    const isQ1 = currentStepState === "quiz-1";
    const qData = lessonData.checkQuestions[isQ1 ? 0 : 1];

    if (isCorrect) {
      setQuizFeedback({
        correct: true,
        text: isRu
          ? "Верно! Отличный ответ, материал усвоен правильно."
          : "Doğrudur! Mövzu tam mənimsənildi.",
      });

      const praiseSpeech = isRu
        ? "Абсолютно верно! Молодец, ты точно уловил суть."
        : "Tamamilə doğrudur! Əla, mövzunun mahiyyətini düzgün anladın.";
      speakTeacherPhrase(praiseSpeech, {
        gesture: "explain",
        lookAt: "student",
        expression: "joy",
        onDone: () => {
          if (isQ1) {
            // Move to Question 2
            setTimeout(() => {
              setCurrentStepState("quiz-2");
              setSelectedQuizOption(null);
              setQuizFeedback(null);
              const q2 = lessonData.checkQuestions[1];
              const q2Text = isRu ? q2.questionRu : q2.questionAz;

              setBoardContent({
                title: isRu
                  ? "Проверка понимания: Вопрос 2 из 2"
                  : "Bilik yoxlanışı: Sual 2/2",
                type: "quiz",
                question: q2,
                pageNumber: q2.pageNumber,
              });

              speakTeacherPhrase(
                isRu ? `Второй вопрос: ${q2Text}` : `İkinci sual: ${q2Text}`,
                {
                  gesture: "explain",
                  lookAt: "student",
                  expression: "serious",
                },
              );
            }, 3000);
          } else {
            // Completed
            setTimeout(() => {
              setCurrentStepState("completed");
              setBoardContent({
                title: isRu
                  ? "Тема успешно пройдена!"
                  : "Mövzu uğurla tamamlandı!",
                type: "completed",
                pageNumber: lessonData.substantivePageNum,
              });
              const doneSpeech = isRu
                ? "Поздравляю! Первая тема документа полностью освоена. Если у тебя есть вопросы по любой части или хочешь разобрать задание, нажми «Задать вопрос» или прикрепи фото."
                : "Təbriklər! Sənədin ilk mövzusu tam mənimsənildi. Əlavə sualın varsa və ya tapşırığı araşdırmaq istəyirsənsə, sual verə və ya şəkil göndərə bilərsən.";
              speakTeacherPhrase(doneSpeech, {
                gesture: "explain",
                lookAt: "student",
                expression: "smile",
              });
            }, 3000);
          }
        },
      });
    } else {
      // Wrong answer: Point to the board where the mistake happened and let them try again!
      const hint = isRu ? qData.hintRu : qData.hintAz;
      const feedbackText = isRu
        ? `Не совсем так. ${hint}. Попробуй выбрать ещё раз!`
        : `Düzgün deyil. ${hint}. Yenidən cəhd et!`;

      setQuizFeedback({
        correct: false,
        text: feedbackText,
      });

      speakTeacherPhrase(feedbackText, {
        gesture: "point-board",
        lookAt: "board",
        expression: "serious",
      });
    }
  };

  // Student interrupts: "Задать вопрос"
  const handleAskQuestionClick = () => {
    stopSpeech();
    clearTimeout(levelTimeoutRef.current);
    clearTimeout(stepAdvanceTimeoutRef.current);
    setIsSpeaking(false);
    setTeacherGesture("listen");
    setTeacherLookAt("student");
    setTeacherExpression("serious");

    const promptText =
      language === "ru"
        ? "Я внимательно слушаю. Задай свой вопрос голосом или текстом в поле внизу."
        : "Səni diqqətlə dinləyirəm. Sualını səslə və ya aşağıdakı xanaya yazaraq ver.";

    setSubtitles(promptText);
  };

  // Student asks for simpler explanation: "Вот эту часть я не понял"
  const handleExplainSimpler = () => {
    stopSpeech();
    clearTimeout(stepAdvanceTimeoutRef.current);

    const step = lessonData.steps[currentStepIndex] || lessonData.steps[0];
    const isRu = language === "ru";

    const simplerSpeech = isRu
      ? `Давай объясню проще и на жизненном примере. Представь, что каждый входной сигнал — это совет друга, а веса — степень твоего доверия к каждому совету. Чем больше вес, тем сильнее влияние на окончательное решение. На доске выделена эта ключевая мысль.`
      : `Daha sadə izah edim. Təsəvvür et ki, hər giriş siqnalı dostunun məsləhətidir, çəkilər isə sənin həmin məsləhətə etibar dərəcəndir. Çəki nə qədər böyükdürsə, qərara təsiri bir o qədər güclüdür.`;

    setBoardContent({
      title: isRu
        ? "Упрощённое объяснение (Аналогия)"
        : "Sadələşdirilmiş izah (Bənzətmə)",
      type: "simpler-analogy",
      content: simplerSpeech,
      pageNumber: step.pageNumber,
      pdfSnippet: step.pdfSnippet,
    });

    speakTeacherPhrase(simplerSpeech, {
      gesture: "explain",
      lookAt: "student",
      expression: "smile",
    });
  };

  // Resume lesson: "Продолжай"
  const handleContinueLesson = () => {
    stopSpeech();
    const isRu = language === "ru";
    const nextIdx = currentStepIndex < 2 ? currentStepIndex + 1 : 2;
    proceedToStep(
      nextIdx,
      lessonData,
      isRu ? "Хорошо, продолжаем наш урок." : "Yaxşı, dərsimizə davam edirik.",
    );
  };

  // Change language dynamically
  const handleChangeLanguage = (newLang) => {
    setLanguage(newLang);
    stopSpeech();
    const isRu = newLang === "ru";
    const speech = isRu
      ? `Переключаюсь на русский язык. Мы продолжаем разбирать тему «${lessonData?.topicTitle || ""}».`
      : `Azərbaycan dilinə keçirəm. «${lessonData?.topicTitle || ""}» mövzusunu davam etdiririk.`;
    speakTeacherPhrase(speech, {
      gesture: "explain",
      lookAt: "student",
      expression: "smile",
    });
  };

  // User submits text or voice question
  const handleUserSubmit = (textToSubmit) => {
    const query = (textToSubmit || userText).trim();
    if (!query) return;

    stopSpeech();
    setUserText("");
    setChatLog((prev) => [...prev, { sender: "user", text: query }]);

    const lower = query.toLowerCase();

    // Command: "Не понял" / "Объясни проще"
    if (
      lower.includes("не понял") ||
      lower.includes("проще") ||
      lower.includes("basa dusmedim") ||
      lower.includes("başa düşmədim") ||
      lower.includes("sadə")
    ) {
      handleExplainSimpler();
      return;
    }

    // Command: "Продолжай" / "Davam et"
    if (
      lower.includes("продолж") ||
      lower.includes("дальше") ||
      lower.includes("davam")
    ) {
      handleContinueLesson();
      return;
    }

    // Command: Change language
    if (lower.includes("русск") || lower.includes("rus")) {
      handleChangeLanguage("ru");
      return;
    }
    if (
      lower.includes("азерб") ||
      lower.includes("azer") ||
      lower.includes("azərbaycanca")
    ) {
      handleChangeLanguage("az");
      return;
    }

    // Question answering based strictly on the document
    const isRu = language === "ru";
    let answerText = "";
    let foundInPdf = false;

    // Search document pages for relevant keywords
    if (lessonData && lessonData.pagesData) {
      const words = query.split(" ").filter((w) => w.length > 3);
      for (const page of lessonData.pagesData) {
        if (
          words.some((w) => page.text.toLowerCase().includes(w.toLowerCase()))
        ) {
          foundInPdf = true;
          answerText = isRu
            ? `По твоему вопросу в тексте документа на стр. ${page.pageNum} указано: «${page.text.slice(0, 180)}...».`
            : `Sualınızla bağlı sənədin ${page.pageNum}-ci səhifəsində qeyd olunur: «${page.text.slice(0, 180)}...».`;
          setCurrentPageCitation(page.pageNum);
          break;
        }
      }
    }

    // Honest fallback if answer is not in the uploaded PDF
    if (!foundInPdf) {
      answerText = isRu
        ? `В загруженном PDF-документе прямого ответа на этот вопрос нет. Урок строится строго по материалам файла, поэтому я рекомендую сосредоточиться на текущей теме: «${lessonData?.topicTitle || ""}». Можешь спросить меня о понятиях со страницы ${currentPageCitation || 1}.`
        : `Yüklənmiş PDF sənədində bu sualın birbaşa cavabı yoxdur. Dərs ciddi şəkildə faylın materialı əsasında qurulduğu üçün diqqəti hazırkı mövzuya («${lessonData?.topicTitle || ""}») yönəltməyi tövsiyə edirəm.`;
    }

    setChatLog((prev) => [...prev, { sender: "teacher", text: answerText }]);
    speakTeacherPhrase(answerText, {
      gesture: "explain",
      lookAt: "student",
      expression: "smile",
    });
  };

  // Handle User Uploading Photo or Video
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const url = URL.createObjectURL(file);

    setUserUploadedMedia({
      type: isVideo ? "video" : "image",
      url,
      name: file.name,
    });

    const isRu = language === "ru";
    if (isImage) {
      setBoardContent({
        title: isRu
          ? "Разбор задания (Фото студента)"
          : "Tapşırığın təhlili (Tələbə şəkli)",
        type: "user-media",
        mediaUrl: url,
        mediaType: "image",
        fileName: file.name,
        pageNumber: currentPageCitation,
      });

      const speech = isRu
        ? `Я вывела отправленное фото задания на доску. Давай разберём его шаг за шагом. В каком именно месте возникла сложность?`
        : `Göndərdiyiniz tapşırıq şəklini lövhəyə çıxardım. Gəl onu addım-addım təhlil edək. Çətinlik məhz hansı hissədə yarandı?`;

      speakTeacherPhrase(speech, {
        gesture: "point-board",
        lookAt: "board",
        expression: "smile",
      });
    } else if (isVideo) {
      setBoardContent({
        title: isRu ? "Видеоматериал студента" : "Tələbənin video materialı",
        type: "user-media",
        mediaUrl: url,
        mediaType: "video",
        fileName: file.name,
        pageNumber: currentPageCitation,
      });

      const speech = isRu
        ? `Видео выведено на доску. Обрати внимание: автоматический покадровый нейросетевой анализ видео в проекте не подключён. Ты можешь воспроизвести нужный момент и задать по нему конкретный вопрос.`
        : `Video lövhəyə yerləşdirildi. Qeyd: layihədə avtomatik video-neyroşəbəkə analizi qoşulmayıb. Lazımi anı səsləndirib konkret sual verə bilərsən.`;

      speakTeacherPhrase(speech, {
        gesture: "point-board",
        lookAt: "board",
        expression: "serious",
      });
    }
  };

  // Handle Autoplay Unblock Button
  const handleUnblockAudio = () => {
    setSoundEnabled(true);
    setAudioBlocked(false);
    if (subtitles) {
      speakTeacherPhrase(subtitles, {
        gesture: teacherGesture,
        lookAt: teacherLookAt,
        expression: teacherExpression,
      });
    }
  };

  // Quick Demo PDF Loader
  const loadDemoPdf = async () => {
    try {
      setStage("processing");
      const resp = await fetch("/sample-lessons/ai_intro.pdf");
      const blob = await resp.blob();
      const file = new File([blob], "ai_intro.pdf", {
        type: "application/pdf",
      });
      handlePdfUpload(file);
    } catch (err) {
      setStage("error");
      setErrorMessage(`Ошибка загрузки демо-файла: ${err.message}`);
    }
  };

  // =========================================================
  // RENDER: STAGE 0 (UPLOAD VIEW)
  // =========================================================
  if (stage === "upload" || stage === "processing" || stage === "error") {
    return (
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          background: "#111317",
          color: "#f3f4f6",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header
          style={{
            height: "60px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(20,23,28,0.9)",
            backdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen size={18} color="#fff" />
            </div>
            <div>
              <span
                style={{ fontWeight: "700", fontSize: "16px", color: "#fff" }}
              >
                Тестовый экран: Урок по PDF
              </span>
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "11px",
                  background: "rgba(59,130,246,0.15)",
                  color: "#60a5fa",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  border: "1px solid rgba(59,130,246,0.3)",
                }}
              >
                Без регистрации • Localhost
              </span>
            </div>
          </div>

          <button
            onClick={onBackToStudio}
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#d1d5db",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            ← Вернуться в 3D Студию
          </button>
        </header>

        {/* Upload Container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "640px",
              width: "100%",
              background: "rgba(22,25,32,0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "36px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
            {stage === "processing" ? (
              <div style={{ padding: "40px 20px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    border: "4px solid rgba(59,130,246,0.2)",
                    borderTopColor: "#3b82f6",
                    borderRadius: "50%",
                    margin: "0 auto 20px",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  Обработка и чтение PDF документа...
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    lineHeight: "1.5",
                  }}
                >
                  Извлекаем страницы, определяем тему и пропускаем обложку с
                  оглавлением. Класс откроется автоматически.
                </p>
              </div>
            ) : stage === "error" ? (
              <div>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <AlertCircle size={28} color="#ef4444" />
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  Не удалось начать урок
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#f87171",
                    lineHeight: "1.5",
                    marginBottom: "24px",
                  }}
                >
                  {errorMessage}
                </p>
                <button
                  onClick={() => setStage("upload")}
                  style={{
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Попробовать другой PDF
                </button>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                  }}
                >
                  <FileText size={32} color="#60a5fa" />
                </div>

                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#fff",
                    marginBottom: "10px",
                  }}
                >
                  Загрузите PDF для начала урока
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    lineHeight: "1.5",
                    marginBottom: "28px",
                    maxWidth: "480px",
                    margin: "0 auto 28px",
                  }}
                >
                  Загрузите один файл и больше ничего не нажимайте. Текст будет
                  прочитан, обложка и оглавление пропущены, и 3D-учитель сразу
                  начнёт объяснение первой темы на доске.
                </p>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handlePdfUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: "2px dashed rgba(59,130,246,0.4)",
                    borderRadius: "12px",
                    padding: "36px 20px",
                    background: "rgba(59,130,246,0.03)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginBottom: "20px",
                  }}
                >
                  <Upload
                    size={28}
                    color="#60a5fa"
                    style={{ marginBottom: "10px" }}
                  />
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#fff",
                      marginBottom: "4px",
                    }}
                  >
                    Нажмите для выбора PDF или перетащите файл сюда
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    Поддерживаются любые учебные PDF (русский / азербайджанский
                    / английский)
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => handlePdfUpload(e.target.files[0])}
                />

                {/* Quick 1-click test button */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    Нет своего PDF под рукой?
                  </span>
                  <button
                    onClick={loadDemoPdf}
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(16,185,129,0.3)",
                      borderRadius: "8px",
                      padding: "6px 14px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Быстрый тест (Демо-учебник AI)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: STAGE 2 (VIRTUAL CLASSROOM VIEW)
  // =========================================================
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#0e1014",
        color: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* CLASSROOM TOP BAR */}
      <header
        style={{
          height: "56px",
          background: "rgba(18,20,25,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => {
              stopSpeech();
              setStage("upload");
            }}
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#d1d5db",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            ← Загрузить другой PDF
          </button>

          <div
            style={{
              height: "16px",
              width: "1px",
              background: "rgba(255,255,255,0.1)",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}
            >
              {lessonData?.docTitle || "Учебный документ"}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#60a5fa",
                background: "rgba(59,130,246,0.15)",
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              {lessonData?.topicTitle || "Первая тема"}
            </span>
            {currentPageCitation && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#10b981",
                  background: "rgba(16,185,129,0.15)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                Стр. {currentPageCitation}
              </span>
            )}
          </div>
        </div>

        {/* Right Status Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Autoplay unblock button if audio was blocked */}
          {audioBlocked && (
            <button
              onClick={handleUnblockAudio}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 0 12px rgba(239,68,68,0.5)",
                animation: "pulse 1.5s infinite",
              }}
            >
              <Volume2 size={16} />
              <span>Включить звук</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              if (soundEnabled) {
                stopSpeech();
                setSoundEnabled(false);
              } else {
                setSoundEnabled(true);
                if (subtitles) speakTeacherPhrase(subtitles);
              }
            }}
            title={soundEnabled ? "Выключить звук" : "Включить звук"}
            style={{
              background: soundEnabled
                ? "rgba(59,130,246,0.15)"
                : "rgba(255,255,255,0.06)",
              color: soundEnabled ? "#60a5fa" : "#9ca3af",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Language Switcher */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "2px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <button
              onClick={() => handleChangeLanguage("ru")}
              style={{
                background: language === "ru" ? "#3b82f6" : "transparent",
                color: language === "ru" ? "#fff" : "#9ca3af",
                border: "none",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              RU
            </button>
            <button
              onClick={() => handleChangeLanguage("az")}
              style={{
                background: language === "az" ? "#3b82f6" : "transparent",
                color: language === "az" ? "#fff" : "#9ca3af",
                border: "none",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              AZ
            </button>
          </div>

          <button
            onClick={onBackToStudio}
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#9ca3af",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            3D Студия
          </button>
        </div>
      </header>

      {/* MAIN CLASSROOM WORKSPACE: BOARD (CENTER) + 3D TEACHER (SIDE) */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.25fr 0.75fr",
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* ===================== CENTER: INTERACTIVE DIGITAL BOARD ===================== */}
        <div
          style={{
            padding: "16px 12px 16px 20px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#141820",
              borderRadius: "16px",
              border: "2px solid rgba(59,130,246,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Board Top Header Frame */}
            <div
              style={{
                background: "#1a1f29",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#10b981",
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    letterSpacing: "0.3px",
                    color: "#fff",
                  }}
                >
                  {boardContent?.title || "Интерактивная доска урока"}
                </span>
              </div>
              {currentPageCitation && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    background: "rgba(255,255,255,0.05)",
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Основано на стр. {currentPageCitation} PDF
                </div>
              )}
            </div>

            {/* Board Main Canvas Area */}
            <div
              style={{
                flex: 1,
                padding: "24px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Board State: Greeting & Level Check */}
              {boardContent?.type === "greeting" && (
                <div
                  style={{
                    textAlign: "center",
                    maxWidth: "520px",
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      textTransform: "uppercase",
                      color: "#60a5fa",
                      fontWeight: "700",
                      marginBottom: "8px",
                    }}
                  >
                    Тема урока
                  </div>
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#fff",
                      marginBottom: "14px",
                      lineHeight: "1.3",
                    }}
                  >
                    {boardContent.topic}
                  </h2>
                  <div
                    style={{
                      background: "rgba(59,130,246,0.08)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#93c5fd",
                        marginBottom: "6px",
                      }}
                    >
                      Вопрос учителя для проверки уровня:
                    </div>
                    <div style={{ fontSize: "15px", color: "#fff" }}>
                      «{boardContent.levelQuestionText}»
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                    Можете ответить текстом, голосом или подождать — через
                    несколько секунд учитель начнёт с простых основ.
                  </div>
                </div>
              )}

              {/* Board State: Key Phrase or Definition */}
              {boardContent?.type === "key-phrase" && (
                <div
                  style={{ maxWidth: "580px", margin: "0 auto", width: "100%" }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      padding: "24px",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#34d399",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>
                        Материал из PDF (Стр. {boardContent.pageNumber})
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#fff",
                        lineHeight: "1.5",
                      }}
                    >
                      {boardContent.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Board State: Formula */}
              {boardContent?.type === "formula" && (
                <div
                  style={{
                    textAlign: "center",
                    maxWidth: "540px",
                    margin: "0 auto",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(59,130,246,0.1)",
                      border: "2px solid #3b82f6",
                      borderRadius: "14px",
                      padding: "28px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#93c5fd",
                        textTransform: "uppercase",
                        fontWeight: "700",
                        marginBottom: "10px",
                      }}
                    >
                      Математическая формула из документа
                    </div>
                    <div
                      style={{
                        fontSize: "26px",
                        fontWeight: "700",
                        fontFamily: "monospace",
                        color: "#60a5fa",
                        letterSpacing: "1px",
                      }}
                    >
                      {boardContent.content}
                    </div>
                  </div>
                  {boardContent.pdfSnippet && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        fontStyle: "italic",
                      }}
                    >
                      Контекст из текста: «
                      {boardContent.pdfSnippet.slice(0, 120)}...»
                    </div>
                  )}
                </div>
              )}

              {/* Board State: Diagram */}
              {boardContent?.type === "diagram" && (
                <div
                  style={{ maxWidth: "560px", margin: "0 auto", width: "100%" }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#f59e0b",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        marginBottom: "14px",
                      }}
                    >
                      Структурная схема из учебника (Стр.{" "}
                      {boardContent.pageNumber})
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(59,130,246,0.15)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          padding: "12px",
                          borderRadius: "8px",
                          textAlign: "center",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#93c5fd",
                        }}
                      >
                        Входные данные (x)
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: "18px" }}>
                        ➔
                      </div>
                      <div
                        style={{
                          background: "rgba(16,185,129,0.15)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          padding: "12px",
                          borderRadius: "8px",
                          textAlign: "center",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#6ee7b7",
                        }}
                      >
                        Обработка весами (w)
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#e5e7eb",
                        lineHeight: "1.4",
                      }}
                    >
                      {boardContent.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Board State: Quiz Questions */}
              {boardContent?.type === "quiz" && (
                <div
                  style={{ maxWidth: "560px", margin: "0 auto", width: "100%" }}
                >
                  <div
                    style={{
                      background: "rgba(139,92,246,0.1)",
                      border: "1px solid rgba(139,92,246,0.3)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#a78bfa",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                      }}
                    >
                      Вопрос по материалу со стр. {boardContent.pageNumber}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#fff",
                      }}
                    >
                      {language === "ru"
                        ? boardContent.question.questionRu
                        : boardContent.question.questionAz}
                    </div>
                  </div>

                  {/* Options */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginBottom: "14px",
                    }}
                  >
                    {boardContent.question.options.map((opt, i) => {
                      const isSelected = selectedQuizOption === i;
                      let optBg = "rgba(255,255,255,0.04)";
                      let optBorder = "1px solid rgba(255,255,255,0.1)";

                      if (isSelected) {
                        optBg = opt.correct
                          ? "rgba(16,185,129,0.2)"
                          : "rgba(239,68,68,0.2)";
                        optBorder = opt.correct
                          ? "1px solid #10b981"
                          : "1px solid #ef4444";
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleQuizAnswer(i, opt.correct)}
                          style={{
                            background: optBg,
                            border: optBorder,
                            borderRadius: "10px",
                            padding: "12px 16px",
                            textAlign: "left",
                            color: "#fff",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.15s",
                          }}
                        >
                          <span>
                            {language === "ru" ? opt.textRu : opt.textAz}
                          </span>
                          {isSelected && <span>{opt.correct ? "✓" : "✗"}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {quizFeedback && (
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        background: quizFeedback.correct
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(239,68,68,0.15)",
                        border: quizFeedback.correct
                          ? "1px solid #10b981"
                          : "1px solid #ef4444",
                        color: quizFeedback.correct ? "#6ee7b7" : "#fca5a5",
                      }}
                    >
                      {quizFeedback.text}
                    </div>
                  )}
                </div>
              )}

              {/* Board State: User Media (Photo or Video) */}
              {boardContent?.type === "user-media" && (
                <div
                  style={{
                    textAlign: "center",
                    maxWidth: "540px",
                    margin: "0 auto",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#60a5fa",
                      fontWeight: "700",
                      marginBottom: "8px",
                    }}
                  >
                    {boardContent.mediaType === "image"
                      ? "Загруженное фото задания"
                      : "Видео студента"}
                  </div>
                  {boardContent.mediaType === "image" ? (
                    <img
                      src={boardContent.mediaUrl}
                      alt="Student task"
                      style={{
                        maxHeight: "280px",
                        maxWidth: "100%",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    />
                  ) : (
                    <video
                      src={boardContent.mediaUrl}
                      controls
                      style={{
                        maxHeight: "280px",
                        maxWidth: "100%",
                        borderRadius: "10px",
                      }}
                    />
                  )}
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "11px",
                      color: "#9ca3af",
                    }}
                  >
                    {boardContent.fileName}
                  </div>
                </div>
              )}

              {/* Board State: Simpler Analogy */}
              {boardContent?.type === "simpler-analogy" && (
                <div
                  style={{ maxWidth: "560px", margin: "0 auto", width: "100%" }}
                >
                  <div
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      borderRadius: "14px",
                      padding: "24px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#fbbf24",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                      }}
                    >
                      Наглядный жизненный пример
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#fff",
                        lineHeight: "1.5",
                      }}
                    >
                      {boardContent.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Board State: Completed */}
              {boardContent?.type === "completed" && (
                <div
                  style={{
                    textAlign: "center",
                    maxWidth: "480px",
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "rgba(16,185,129,0.2)",
                      border: "1px solid #10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <CheckCircle2 size={32} color="#10b981" />
                  </div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#fff",
                      marginBottom: "8px",
                    }}
                  >
                    Тема успешно изучена!
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#9ca3af",
                      lineHeight: "1.5",
                    }}
                  >
                    Вы прошли объяснение и ответили на контрольные вопросы по
                    материалу на странице {boardContent.pageNumber}.
                  </p>
                </div>
              )}
            </div>

            {/* Subtitles Bar (Live speech & step progress) */}
            <div
              style={{
                background: "#12141a",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#60a5fa",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Субтитры:
              </span>
              <div
                style={{
                  flex: 1,
                  fontSize: "13px",
                  color: "#f3f4f6",
                  lineHeight: "1.4",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {subtitles || "Учитель слушает вас..."}
              </div>
              {currentPageCitation && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    whiteSpace: "nowrap",
                  }}
                >
                  Стр. {currentPageCitation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ===================== SIDE: 3D TEACHER VIEWPORT ===================== */}
        <div
          style={{
            padding: "16px 20px 16px 0",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#141820",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* 3D Canvas Scene */}
            <Classroom3DScene
              gesture={teacherGesture}
              lookAt={teacherLookAt}
              expression={teacherExpression}
              isSpeaking={isSpeaking}
            />

            {/* Overlay badge on 3D viewport */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isSpeaking ? "#10b981" : "#6b7280",
                }}
              />
              <span style={{ color: "#fff", fontWeight: "500" }}>
                {isSpeaking
                  ? "Учитель говорит и жестикулирует"
                  : teacherGesture === "listen"
                    ? "Слушает вопрос"
                    : "Готова к уроку"}
              </span>
            </div>

            {/* Quick Action Pills on top of 3D view */}
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                right: "12px",
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                onClick={handleAskQuestionClick}
                style={{
                  flex: 1,
                  background: "rgba(239,68,68,0.2)",
                  color: "#f87171",
                  border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: "8px",
                  padding: "7px 8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <HelpCircle size={13} />
                <span>Задать вопрос</span>
              </button>

              <button
                onClick={handleExplainSimpler}
                style={{
                  flex: 1,
                  background: "rgba(245,158,11,0.2)",
                  color: "#fbbf24",
                  border: "1px solid rgba(245,158,11,0.4)",
                  borderRadius: "8px",
                  padding: "7px 8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Объясни проще
              </button>

              <button
                onClick={handleContinueLesson}
                style={{
                  flex: 1,
                  background: "rgba(16,185,129,0.2)",
                  color: "#34d399",
                  border: "1px solid rgba(16,185,129,0.4)",
                  borderRadius: "8px",
                  padding: "7px 8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <Play size={13} />
                <span>Продолжай</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BOTTOM CONTROLS & INPUT BAR ===================== */}
      <footer
        style={{
          background: "#12141a",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 10,
        }}
      >
        {/* Microphone Button */}
        <button
          onClick={() => {
            if (
              speechRecognizerRef.current &&
              speechRecognizerRef.current.supported
            ) {
              if (isListeningMic) {
                speechRecognizerRef.current.stop();
                setIsListeningMic(false);
              } else {
                speechRecognizerRef.current.start();
                setIsListeningMic(true);
                handleAskQuestionClick();
              }
            } else {
              setMicStatusNotice(
                "Распознавание речи не поддерживается в этом браузере. Используйте поле ввода.",
              );
              setTimeout(() => setMicStatusNotice(""), 5000);
            }
          }}
          title={isListeningMic ? "Идёт запись речи..." : "Сказать микрофоном"}
          style={{
            background: isListeningMic ? "#ef4444" : "rgba(255,255,255,0.06)",
            color: isListeningMic ? "#fff" : "#9ca3af",
            border: isListeningMic
              ? "1px solid #ef4444"
              : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            width: "42px",
            height: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {isListeningMic ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Media (Photo / Video) Button */}
        <button
          onClick={() => mediaInputRef.current.click()}
          title="Прикрепить фото задания или видео"
          style={{
            background: "rgba(255,255,255,0.06)",
            color: "#9ca3af",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            width: "42px",
            height: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ImageIcon size={18} />
        </button>
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleMediaUpload}
        />

        {/* Text Input Field */}
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUserSubmit();
            }}
            placeholder={
              language === "ru"
                ? "Напишите вопрос по уроку (например: «Вот эту часть я не понял» или «Продолжай»)..."
                : "Dərslə bağlı sualınızı yazın (məsələn: «Bu hissə aydın olmadı» və ya «Davam et»)..."
            }
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              padding: "11px 16px",
              color: "#fff",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={() => handleUserSubmit()}
          disabled={!userText.trim()}
          style={{
            background: userText.trim() ? "#3b82f6" : "rgba(255,255,255,0.06)",
            color: userText.trim() ? "#fff" : "#6b7280",
            border: "none",
            borderRadius: "10px",
            padding: "0 18px",
            height: "42px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: userText.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>Отправить</span>
          <Send size={14} />
        </button>
      </footer>

      {/* Honest Status Banner for Media / Mic if needed */}
      {micStatusNotice && (
        <div
          style={{
            position: "absolute",
            bottom: "66px",
            left: "20px",
            background: "rgba(245,158,11,0.95)",
            color: "#000",
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "600",
            zIndex: 20,
          }}
        >
          {micStatusNotice}
        </div>
      )}
    </div>
  );
}
