// Web Speech API Voice and Speech Recognition Helper

let currentUtterance = null;

export function speakText(text, lang = "ru", { onStart, onEnd, onError } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (onError)
      onError("SpeechSynthesis API не поддерживается данным браузером.");
    return false;
  }

  // Cancel any ongoing speech immediately
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Set language
  utterance.lang = lang === "az" ? "az-AZ" : "ru-RU";
  utterance.rate = 1.0;
  utterance.pitch = 1.05;

  // Try to find a matching female voice
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const targetLangPrefix = lang === "az" ? "az" : "ru";
    const matchedVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(targetLangPrefix),
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    // 'canceled' or 'interrupted' is normal when user clicks "Задать вопрос"
    if (e.error !== "canceled" && e.error !== "interrupted") {
      console.warn("SpeechSynthesis event note:", e.error);
      if (onError) onError(e.error);
    }
  };

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    if (onError) onError(err.message);
    return false;
  }
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Speech Recognition (Microphone) with status detection
 */
export function createSpeechRecognizer({
  onResult,
  onError,
  onEnd,
  lang = "ru",
}) {
  if (typeof window === "undefined") return null;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return {
      supported: false,
      reason:
        "SpeechRecognition API не поддерживается вашим браузером (рекомендуется Google Chrome или Edge).",
    };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang === "az" ? "az-AZ" : "ru-RU";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return {
    supported: true,
    start: () => {
      try {
        recognition.start();
      } catch (e) {
        console.warn("Recognition start note:", e);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {
        console.warn("Recognition stop note:", e);
      }
    },
  };
}
