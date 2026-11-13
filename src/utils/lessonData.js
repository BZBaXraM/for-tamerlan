/**
 * Rich interactive lesson datasets and dynamic builders
 */

export const DEFAULT_LESSONS = {
  html: {
    id: "html",
    badge: "DƏRS 01 · HTML VƏ VEB TEXNOLOGİYALARI",
    title: "HTML Struktur, Teqlər və DOM Arxitekturası",
    codeSnippet:
      "Performans: Semantik HTML (<main>, <article>) vs Divlər (SEO +35%)",
    paragraphs: [
      '"HTML Struktur" mövzusunu dərindən qavramaq üçün əvvəlcə sol tərəfdəki vizual sxemə və video simulyasiyaya diqqət yetirin.',
      "Mövzunun praktik tətbiqində ən vacib qayda səbəb-nəticə əlaqəsini düstur əzbərləmədən, brauzerin HTML teqlərini oxuyub DOM ağacına çevirdiyi real nümunə üzərində görməkdir.",
      "Sağdakı arxitektura halqasının üzərinə klikləyərək fərqli struktur elementlərini müqayisə edə və əlavə sualınızı səsli və ya yazılı göndərə bilərsiniz.",
    ],
    visualLabel: "VİZUAL LÖVHƏ",
    visualCaption: "Canlı vizual izah: HTML Parser və DOM Ağacı Qurulması",
    diagram: {
      type: "html-flow",
      nodes: [
        {
          id: "browser",
          label: "Brauzer",
          sub: "HTTP Request",
          type: "primary",
        },
        {
          id: "server",
          label: "Web Server",
          sub: "index.html",
          type: "accent",
        },
        {
          id: "parser",
          label: "HTML Parser",
          sub: "Tokenization",
          type: "highlight",
        },
        { id: "dom", label: "DOM Ağacı", sub: "Render Tree", type: "success" },
      ],
    },
    video: {
      title: "DƏRS VİDEO SİMULYASİYASI",
      duration: "02:45",
      frames: [
        {
          num: 1,
          text: "1) İstifadəçi URL daxil edir, brauzer serverə GET sorğusu göndərir və index.html faylını endirir.",
          visualState: "request",
        },
        {
          num: 2,
          text: "2) HTML Parser <!DOCTYPE html> teqini oxuyaraq müasir standart rejimini aktivləşdirir və teqləri iyerarxik düzür.",
          visualState: "parsing",
        },
        {
          num: 3,
          text: "3) DOM (Document Object Model) yaranır və CSS qaydaları ilə birləşərək ekranda vizual səhifəni render edir.",
          visualState: "render",
        },
      ],
    },
    ringWidget: {
      title: "ARXİTEKTURA HALQASI",
      centerTag: "<!DOCTYPE html>",
      description:
        "Sənədin növünü və brauzer render rejimini təyin edən ilkin təlimat (Standartlar rejimi).",
      activePill: "doctype",
      pills: [
        {
          id: "doctype",
          label: "Doctype",
          title: "<!DOCTYPE html>",
          desc: "Sənədin növünü və brauzer render rejimini təyin edən ilkin təlimat (Standartlar rejimi).",
        },
        {
          id: "head",
          label: "Head / Meta",
          title: "<head> & <meta>",
          desc: "Səhifənin başlığı (<title>), UTF-8 kodlaşdırması və brauzer miqyas tənzimləmələri.",
        },
        {
          id: "body",
          label: "Body / Elements",
          title: "<body> & Teqlər",
          desc: "İstifadəçiyə görünən bütün məzmun: başlıqlar <h1>-<h6>, paraqraflar <p> və interaktiv bloklar.",
        },
      ],
    },
    teacherSpeech: {
      intro:
        "Salam! Mən sizin AI müəlliminizəm. Bu gün HTML və veb arxitekturasını öyrənirik. Sol tərəfdəki vizual lövhəyə diqqət yetirin.",
      visual:
        "Sol tərəfdəki sxem brauzerin HTML faylını necə oxuyub DOM ağacına çevirdiyini nümayiş etdirir.",
      text: "HTML teqlərinin semantik yazılışı veb saytın sürətini və axtarış motorlarında yüksək yer tutmasını təmin edir.",
      ring: "Sağdakı arxitektura halqasında <!DOCTYPE html>, head və body bloklarını tək-tək müqayisə edə bilərsiniz.",
    },
  },

  system_design: {
    id: "system_design",
    badge: "DƏRS 06 · SİSTEM DİZAYNI",
    title: "Keşləmə və Yüksək Yüklü Sistem Arxitekturası (faf)",
    codeSnippet: "Performans: Redis Hit (~2ms) vs İndekssiz Tam Skan (~180ms)",
    paragraphs: [
      '"faf" mövzusunu qavramaq üçün əvvəlcə sol tərəfdəki vizual sxemə və video simulyasiyaya diqqət yetirin.',
      "Mövzunun praktik tətbiqində ən vacib qayda səbəb-nəticə əlaqəsini düstur əzbərləmədən, real nümunə üzərində görməkdir.",
      "Sağdakı dairəvi modelin üzərinə klikləyərək fərqli halları müqayisə edə və əlavə sualınızı səsli və ya yazılı göndərə bilərsiniz.",
    ],
    visualLabel: "VİZUAL LÖVHƏ",
    visualCaption: "Canlı vizual izah: faf",
    diagram: {
      type: "cache-flow",
      nodes: [
        { id: "api", label: "API", sub: "Gateway", type: "primary" },
        { id: "redis", label: "REDIS", sub: "~2 ms", type: "accent" },
        { id: "db", label: "Postgres", sub: "Primary DB", type: "dashed" },
      ],
    },
    video: {
      title: "DƏRS VİDEO SİMULYASİYASI",
      duration: "02:05",
      frames: [
        {
          num: 1,
          text: "1) Müştəri GET /api/courses sorğusunu Bearer token ilə göndərir.",
          visualState: "client_req",
        },
        {
          num: 2,
          text: "2) API server Redis keş yaddaşını yoxlayır və açar tapıldıqda cəmi 2 millisaniyəyə dərhal cavab qaytarır.",
          visualState: "cache_hit",
        },
        {
          num: 3,
          text: "3) Keşdə olmadıqda Postgres bazasına indeksli sorğu göndərilir və gələn nəticə sonrakı istifadə üçün keşə yazılır.",
          visualState: "db_fallback",
        },
      ],
    },
    ringWidget: {
      title: "ARXİTEKTURA HALQASI",
      centerTag: "JWT / TLS",
      description: "Sorğunun kimlik və icazə yoxlaması (401 / 403 qorunması).",
      activePill: "auth",
      pills: [
        {
          id: "auth",
          label: "Auth",
          title: "JWT / TLS",
          desc: "Sorğunun kimlik və icazə yoxlaması (401 / 403 qorunması).",
        },
        {
          id: "cache",
          label: "Cache",
          title: "Redis LRU Keş",
          desc: "Tez-tez soruşulan məlumatların RAM yaddaşda saxlanması (~2ms reaksiya müddəti).",
        },
        {
          id: "db",
          label: "DB Index",
          title: "B-Tree İndeksləmə",
          desc: "Böyük cədvəllərdə axtarış sürətini O(N) tam skandan O(log N) indeks skanına endirilməsi.",
        },
      ],
    },
    teacherSpeech: {
      intro:
        "Sistem dizaynı dərsimizə xoş gəldiniz. Bu gün keşləmə və yüksək yüklü arxitekturanı öyrənirik.",
      visual:
        "Vizual lövhəyə baxın: API server birbaşa Redis keşinə müraciət edir və 2 millisaniyəyə cavab qaytarır.",
      text: "Mövzunun ən vacib qaydası verilənlər bazasını lazımsız oxuma sorğuları ilə yükləməməkdir.",
      ring: "Dairəvi modeldə Auth, Keş və Verilənlər Bazası İndekslərinin necə uzlaşdığını yoxlaya bilərsiniz.",
    },
  },
};

/**
 * Builds lesson data from arbitrary parsed PDF pages
 */
export function buildLessonFromParsedPdf(parsedData) {
  const title =
    parsedData.topicTitle || parsedData.docTitle || "PDF Dərs Məzmunu";
  const sentences = parsedData.steps
    .map((s) => s.boardContent || s.pdfSnippet)
    .filter(Boolean);
  const p1 =
    sentences[0] || "Sənəddəki əsas anlayış və mövzunun təməli təqdim olunur.";
  const p2 =
    sentences[1] ||
    "Sistem komponentləri və onların bir-biri ilə qarşılıqlı əlaqəsi izah edilir.";
  const p3 =
    sentences[2] ||
    "Praktiki tətbiq qaydaları və arxitektura nəticələri ümumiləşdirilir.";

  return {
    id: "uploaded_pdf",
    badge: `DƏRS · ${parsedData.documentName.toUpperCase().slice(0, 30)}`,
    title: title,
    codeSnippet: `Səhifə: ${parsedData.substantivePageNum} / ${parsedData.totalPages} · Sənəd: ${parsedData.documentName}`,
    paragraphs: [
      `"${title}" mövzusunu qavramaq üçün əvvəlcə sol tərəfdəki vizual sxemə və video simulyasiyaya diqqət yetirin.`,
      p1,
      `Sağdakı arxitektura modelinə klikləyərək fərqli məqamları müqayisə edə və sualınızı göndərə bilərsiniz.`,
    ],
    visualLabel: "VİZUAL LÖVHƏ",
    visualCaption: `Canlı vizual izah: ${title}`,
    diagram: {
      type: "pdf-flow",
      nodes: [
        {
          id: "input",
          label: "Daxilolma",
          sub: "PDF Səh. " + parsedData.substantivePageNum,
          type: "primary",
        },
        {
          id: "core",
          label: "Əsas Konsept",
          sub: title.slice(0, 15),
          type: "accent",
        },
        {
          id: "output",
          label: "Nəticə",
          sub: "Analiz & Tətbiq",
          type: "success",
        },
      ],
    },
    video: {
      title: "DƏRS VİDEO SİMULYASİYASI",
      duration: "01:50",
      frames: [
        {
          num: 1,
          text: `1) ${p1.slice(0, 110)}...`,
          visualState: "frame_1",
        },
        {
          num: 2,
          text: `2) ${p2.slice(0, 110)}...`,
          visualState: "frame_2",
        },
        {
          num: 3,
          text: `3) ${p3.slice(0, 110)}...`,
          visualState: "frame_3",
        },
      ],
    },
    ringWidget: {
      title: "ARXİTEKTURA HALQASI",
      centerTag: title.slice(0, 14),
      description: p1.slice(0, 100),
      activePill: "part1",
      pills: [
        {
          id: "part1",
          label: "Anlayış",
          title: "Əsas Tərif",
          desc: p1,
        },
        {
          id: "part2",
          label: "Struktur",
          title: "Quruluş",
          desc: p2,
        },
        {
          id: "part3",
          label: "Qayda",
          title: "Nəticə",
          desc: p3,
        },
      ],
    },
    teacherSpeech: {
      intro: `Salam! Sizin yüklədiyiniz "${parsedData.documentName}" sənədini analiz etdim. Dərsimizə başlayaq!`,
      visual: `Sol lövhədə sənədin ${parsedData.substantivePageNum}-ci səhifəsindəki konseptləri vizuallaşdırmışam.`,
      text: p1,
      ring: `Sağdakı arxitektura modelindən əsas qaydaları nəzərdən keçirə bilərsiniz.`,
    },
  };
}
