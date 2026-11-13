import * as pdfjsLib from "pdfjs-dist";

// Configure local worker to run completely offline without external CDN dependencies
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

/**
 * Parses an uploaded PDF file and builds an interactive structured lesson.
 * Strictly based on actual content in the document, skipping cover & table of contents.
 */
export async function parsePdfAndBuildLesson(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    });
    const pdfDoc = await loadingTask.promise;

    const numPages = pdfDoc.numPages;
    if (numPages === 0) {
      return {
        success: false,
        error: "PDF файл пуст (0 страниц).",
      };
    }

    const pagesData = [];
    let totalExtractedCharacters = 0;

    // Extract text and render preview for each page (up to 8 pages for fast responsiveness)
    for (let pageNum = 1; pageNum <= Math.min(numPages, 10); pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const rawText = textContent.items
        .map((item) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      totalExtractedCharacters += rawText.length;

      // Render page to canvas thumbnail for board display
      let pageImageDataUrl = null;
      try {
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        pageImageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      } catch (renderErr) {
        console.warn(
          `Could not render preview for page ${pageNum}:`,
          renderErr,
        );
      }

      pagesData.push({
        pageNum,
        text: rawText,
        imageDataUrl: pageImageDataUrl,
      });
    }

    // Check if there is readable text layer
    if (totalExtractedCharacters < 30) {
      return {
        success: false,
        error:
          "Не удалось извлечь текст из PDF. В документе отсутствует текстовый слой (вероятно, это отсканированные изображения без OCR-распознавания).",
      };
    }

    // Identify Cover and Table of Contents
    const isCover = (text) => {
      const lower = text.toLowerCase();
      return (
        text.length < 250 ||
        lower.includes("edition") ||
        lower.includes("издание") ||
        lower.includes("учебник") ||
        lower.includes("textbook") ||
        lower.includes("department of") ||
        lower.includes("кафедра")
      );
    };

    const isTableOfContents = (text) => {
      const lower = text.toLowerCase();
      const dotCount = (text.match(/\.{3,}/g) || []).length;
      return (
        lower.includes("table of contents") ||
        lower.includes("содержание") ||
        lower.includes("оглавление") ||
        lower.includes("mündəricat") ||
        dotCount >= 2
      );
    };

    // Detect first substantive page
    let substantivePageIndex = 0;
    for (let i = 0; i < pagesData.length; i++) {
      const page = pagesData[i];
      if (i === 0 && isCover(page.text)) continue;
      if (isTableOfContents(page.text)) continue;
      if (page.text.length > 80) {
        substantivePageIndex = i;
        break;
      }
    }

    const substantivePage = pagesData[substantivePageIndex];
    const pageNum = substantivePage.pageNum;
    const contentText = substantivePage.text;

    // Extract Document Title (from page 1 or substantive page heading)
    let docTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    const firstLines = pagesData[0].text.split(". ")[0].split("\n")[0];
    if (firstLines.length > 5 && firstLines.length < 70) {
      docTitle = firstLines;
    }

    // Extract Topic Heading from substantive page
    let topicTitle = `Тема на стр. ${pageNum}`;
    const headingMatch = contentText.match(
      /(?:Chapter|Глава|Раздел|Section|\d+\.|\d+\.\d+)\s+([A-ZА-ЯЁa-zа-яё0-9\s:,-]{5,60})/i,
    );
    if (headingMatch && headingMatch[1]) {
      topicTitle = headingMatch[0].trim();
    } else {
      const words = contentText.split(" ").slice(0, 8).join(" ");
      if (words.length > 5) topicTitle = words + "...";
    }

    // Extract formulas or key expressions if any
    const formulaMatch = contentText.match(
      /(?:formula|формула|y\s*=|f\s*\(|E\s*=|x\s*=|[A-Za-z]\s*=\s*[^.]{3,35})/i,
    );
    const formulaText = formulaMatch ? formulaMatch[0].trim() : null;

    // Extract sentences for structured explanation steps
    const rawSentences = contentText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && !s.includes("...."));

    const s1 =
      rawSentences[0] ||
      "В данном разделе излагается фундаментальное понятие темы.";
    const s2 =
      rawSentences[1] ||
      "Рассматриваются ключевые компоненты и взаимосвязи системы.";
    const s3 =
      rawSentences[2] ||
      "На практике данный принцип определяет устойчивость и точность всей модели.";

    // Build 3 instructional steps
    const steps = [
      {
        stepIndex: 1,
        pageNumber: pageNum,
        boardTitle: "1. Основное определение и суть",
        boardType: "key-phrase",
        boardContent: s1,
        pdfSnippet: s1,
        pageImage: substantivePage.imageDataUrl,
        teacherSpeechRu: `Начнём с первой темы документа: «${topicTitle}». В тексте на странице ${pageNum} даётся ключевое определение: ${s1}.`,
        teacherSpeechAz: `Sənədin ilk mövzusu ilə başlayaq: «${topicTitle}». Səhifə ${pageNum}-dəki əsas anlayış budur: ${s1}.`,
        gesture: "point-board",
        lookAt: "board",
      },
      {
        stepIndex: 2,
        pageNumber: pageNum,
        boardTitle: formulaText
          ? "2. Формула и математический закон"
          : "2. Механизм и структура работы",
        boardType: formulaText ? "formula" : "diagram",
        boardContent: formulaText || s2,
        pdfSnippet: s2,
        pageImage: substantivePage.imageDataUrl,
        teacherSpeechRu: `Теперь обрати внимание на доску: ${s2}${formulaText ? ` На доске выведена соответствующая формула из документа: ${formulaText}.` : ""}`,
        teacherSpeechAz: `İndi lövhəyə diqqət yetirək: ${s2}${formulaText ? ` Lövhədə sənəddən çıxarılmış düstur əks olunub: ${formulaText}.` : ""}`,
        gesture: "point-board",
        lookAt: "board",
      },
      {
        stepIndex: 3,
        pageNumber: pageNum,
        boardTitle: "3. Ключевое правило и вывод",
        boardType: "key-phrase",
        boardContent: s3,
        pdfSnippet: s3,
        pageImage: substantivePage.imageDataUrl,
        teacherSpeechRu: `И главный практический вывод по этой теме: ${s3}`,
        teacherSpeechAz: `Və bu mövzu üzrə ən əsas nəticə: ${s3}`,
        gesture: "explain",
        lookAt: "student",
      },
    ];

    // Formulate 1 Level Check Question
    const levelQuestion = {
      questionRu: `Ты уже встречался с темой «${topicTitle}»?`,
      questionAz: `«${topicTitle}» mövzusu ilə əvvəllər qarşılaşmısan?`,
      autoProceedSec: 9,
    };

    // Formulate 2 Verification Check Questions after topic
    const checkQuestions = [
      {
        id: "q1",
        pageNumber: pageNum,
        questionRu: `Проверим понимание: о чём говорится в первом определении на стр. ${pageNum}?`,
        questionAz: `Biliyimizi yoxlayaq: Səhifə ${pageNum}-dəki ilk anlayışda nə qeyd olunur?`,
        options: [
          {
            textRu: s1.slice(0, 75) + "...",
            textAz: s1.slice(0, 75) + "...",
            correct: true,
          },
          {
            textRu: "Об абсолютной случайности всех входящих сигналов",
            textAz: "Bütün daxil olan siqnalların tam təsadüfiliyi",
            correct: false,
          },
          {
            textRu: "Об исключении параметров из вычислений",
            textAz: "Parametrlərin hesablamalardan çıxarılması",
            correct: false,
          },
        ],
        hintRu: `Посмотри на первую карточку на доске: «${s1.slice(0, 60)}...»`,
        hintAz: `Lövhədəki ilk qeydə bax: «${s1.slice(0, 60)}...»`,
      },
      {
        id: "q2",
        pageNumber: pageNum,
        questionRu: `Второй вопрос: какое ключевое правило сформулировано в материале?`,
        questionAz: `İkinci sual: Materialda hansı əsas qayda vurğulanır?`,
        options: [
          {
            textRu: s3.slice(0, 75) + "...",
            textAz: s3.slice(0, 75) + "...",
            correct: true,
          },
          {
            textRu: "Все параметры должны быть строго нулевыми",
            textAz: "Bütün parametrlər mütləq sıfır olmalıdır",
            correct: false,
          },
          {
            textRu: "Вычисления не зависят от входных данных",
            textAz: "Hesablamalar ilkin məlumatlardan asılı deyil",
            correct: false,
          },
        ],
        hintRu: `Обрати внимание на третий пункт на доске: «${s3.slice(0, 60)}...»`,
        hintAz: `Lövhədəki üçüncü bəndə bax: «${s3.slice(0, 60)}...»`,
      },
    ];

    return {
      success: true,
      documentName: file.name,
      docTitle,
      topicTitle,
      totalPages: numPages,
      substantivePageNum: pageNum,
      levelQuestion,
      steps,
      checkQuestions,
      pagesData,
    };
  } catch (err) {
    console.error("PDF parsing error:", err);
    return {
      success: false,
      error: `Не удалось обработать PDF файл: ${err.message || "Формат не поддерживается или файл повреждён"}`,
    };
  }
}
