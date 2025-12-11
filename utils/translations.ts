
export type Language = 'en' | 'id';

export const translations = {
  en: {
    nav: {
      library: "Library",
      save: "Save",
      settings: "Settings",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      help: "How to Use"
    },
    hero: {
      title: "Upload your room",
      subtitle: "Take a photo or upload an image of your space to start reimagining.",
      button: "Select Photo",
      cameraButton: "Take Photo"
    },
    preview: {
      title: "Photo Ready!",
      subtitle: "We've analyzed your space.",
      detectedAs: "Identified as:",
      retake: "Retake Photo",
      start: "Start Designing"
    },
    actions: {
      newPhoto: "New Photo",
      editPhoto: "Edit Photo",
      surprise: "Surprise Me",
      download: "Download",
      downloadResult: "Download Result",
      downloadCollage: "Before & After",
      exportPdf: "Export Report (PDF)",
      saveDesc: "Save the new design only",
      collageDesc: "Save side-by-side comparison",
      pdfDesc: "Print full consultation report"
    },
    style: {
      title: "Choose a Style",
    },
    project: {
      title: "Project Parameters",
      budgetLabel: "Est. Budget",
      budgetPlaceholder: "e.g. Rp 50 Juta or $5,000",
      scaleLabel: "Floor Plan Scale",
      scalePlaceholder: "e.g. 1:50, 1:100...",
      scales: {
        s50: "1:50 (High Detail)",
        s100: "1:100 (Standard)",
        s200: "1:200 (Layout Only)"
      }
    },
    analysis: {
      button: "Smart Analysis",
      analyzing: "Analyzing...",
      view: "View Analysis",
      title: "Room Audit",
      subtitle: "AI-Powered Analysis Report",
      works: "What Works",
      improve: "To Improve",
      quickWins: "Quick Wins",
      lighting: "Lighting",
      layout: "Layout Flow",
      harmony: "Color Harmony",
      autoInsight: "I've done a quick scan of your room. Here are my initial thoughts:\n\n"
    },
    budget: {
      button: "Estimate Cost",
      view: "View Estimate",
      title: "Cost Estimate",
      included: "Included Items",
      disclaimer: "This is an AI-generated estimate for planning purposes only."
    },
    floorPlan: {
      button: "2D Floor Plan",
      generating: "Drafting Plan...",
      view: "View Floor Plan",
      title: "Floor Plan Generator",
      subtitle: "Experimental Top-Down View",
      download: "Download Plan",
      description: "This is an AI-generated approximation of your room's layout based on visible objects."
    },
    chat: {
      title: "ReRoom Consultant",
      subtitle: "Powered by Gemini 3 Pro",
      placeholder: "Type a message...",
      welcome: "Hello! I am ReRoom. Upload a photo of your room, and I can help you redesign it.",
      uploadParams: "Photo uploaded! I'm analyzing the current conditions...",
      ready: "Ready for a new photo.",
      emptyState: "Ask me to refine the design or find items!",
      emptyStateSub: "\"Make the rug blue\" • \"How much would this cost?\"",
      shoppable: "Shoppable Items",
      estimate: "Renovation Estimate"
    },
    palette: {
      title: "Suggested Palette",
      copy: "Click to copy hex",
      copied: "Copied!"
    },
    loading: {
      generating: "Reimagining your space...",
      detecting: "Detecting room type...",
      steps: [
        "Peeking through the keyhole...",
        "Identifying furniture...",
        "Measuring the walls...",
        "Is that a vintage chair?",
        "Checking lighting sources...",
        "Almost there..."
      ]
    },
    hints: {
      title: "Refine with AI",
      text: "Want to change specific details? Use the chat on the right. Try saying"
    },
    help: {
      title: "How to Use ReRoom",
      step1Title: "Upload Photo",
      step1Desc: "Take a clear photo of your room or upload one from your gallery.",
      step2Title: "Choose Style",
      step2Desc: "Select a design style (e.g., Modern, Industrial) to instantly reimagine the space.",
      step3Title: "Chat & Refine",
      step3Desc: "Chat with the AI to change colors, furniture, or ask for budget estimates.",
      step4Title: "Tools",
      step4Desc: "Use 'Smart Analysis' for design feedback or 'Floor Plan' for layout views."
    },
    roomDetection: {
      title: "Identify Room Type",
      description: "We couldn't automatically identify this room. Please tell us what kind of space this is so we can design it correctly.",
      label: "Room Type",
      placeholder: "e.g., Home Office, Attic, Coffee Shop...",
      submit: "Confirm Room Type",
      detected: "Identified as",
      change: "Change"
    },
    footer: {
      credit: "Created by Anton Prafanto in Samarinda"
    }
  },
  id: {
    nav: {
      library: "Galeri",
      save: "Simpan",
      settings: "Pengaturan",
      language: "Bahasa",
      theme: "Tema",
      light: "Terang",
      dark: "Gelap",
      help: "Cara Pakai"
    },
    hero: {
      title: "Unggah ruangan Anda",
      subtitle: "Ambil foto atau unggah gambar ruangan Anda untuk mulai merancang ulang.",
      button: "Pilih Foto",
      cameraButton: "Ambil Foto"
    },
    preview: {
      title: "Foto Siap!",
      subtitle: "Kami telah menganalisa ruangan Anda.",
      detectedAs: "Teridentifikasi sebagai:",
      retake: "Foto Ulang",
      start: "Mulai Desain"
    },
    actions: {
      newPhoto: "Foto Baru",
      editPhoto: "Edit Foto",
      surprise: "Acak Gaya",
      download: "Unduh",
      downloadResult: "Unduh Hasil",
      downloadCollage: "Sebelum & Sesudah",
      exportPdf: "Ekspor Laporan (PDF)",
      saveDesc: "Simpan hasil desain baru saja",
      collageDesc: "Simpan perbandingan berdampingan",
      pdfDesc: "Cetak laporan konsultasi lengkap"
    },
    style: {
      title: "Pilih Gaya Desain",
    },
    project: {
      title: "Parameter Proyek",
      budgetLabel: "Est. Anggaran",
      budgetPlaceholder: "cth: Rp 50 Juta atau $5000",
      scaleLabel: "Skala Denah",
      scalePlaceholder: "cth: 1:50, 1:100...",
      scales: {
        s50: "1:50 (Sangat Detail)",
        s100: "1:100 (Standar)",
        s200: "1:200 (Hanya Layout)"
      }
    },
    analysis: {
      button: "Analisis Cerdas",
      analyzing: "Menganalisis...",
      view: "Lihat Analisis",
      title: "Audit Ruangan",
      subtitle: "Laporan Analisis AI",
      works: "Kelebihan",
      improve: "Perlu Perbaikan",
      quickWins: "Solusi Cepat",
      lighting: "Pencahayaan",
      layout: "Alur Tata Letak",
      harmony: "Harmoni Warna",
      autoInsight: "Saya telah memindai ruangan Anda. Berikut analisis awal saya:\n\n"
    },
    budget: {
      button: "Estimasi Biaya",
      view: "Lihat Estimasi",
      title: "Estimasi Biaya",
      included: "Item Termasuk",
      disclaimer: "Ini adalah estimasi AI untuk tujuan perencanaan saja."
    },
    floorPlan: {
      button: "Denah 2D",
      generating: "Menggambar Denah...",
      view: "Lihat Denah",
      title: "Generator Denah Lantai",
      subtitle: "Tampilan Atas Eksperimental",
      download: "Unduh Denah",
      description: "Ini adalah perkiraan tata letak ruangan yang dibuat oleh AI berdasarkan objek yang terlihat."
    },
    chat: {
      title: "Konsultan ReRoom",
      subtitle: "Ditenagai oleh Gemini 3 Pro",
      placeholder: "Ketik pesan...",
      welcome: "Halo! Saya ReRoom. Unggah foto ruangan Anda, dan saya akan membantu mendesain ulang.",
      uploadParams: "Foto diunggah! Saya sedang menganalisa kondisi ruangan saat ini...",
      ready: "Siap untuk foto baru.",
      emptyState: "Minta saya untuk menyempurnakan desain atau mencari barang!",
      emptyStateSub: "\"Ubah karpet jadi biru\" • \"Berapa biayanya?\"",
      shoppable: "Rekomendasi Produk",
      estimate: "Estimasi Renovasi"
    },
    palette: {
      title: "Palet Warna",
      copy: "Klik untuk salin hex",
      copied: "Disalin!"
    },
    loading: {
      generating: "Sedang merancang ulang ruangan...",
      detecting: "Mendeteksi tipe ruangan...",
      steps: [
        "Mengintip dari lubang kunci...",
        "Menganalisa furnitur...",
        "Mengukur dinding...",
        "Hmm, apakah itu kursi antik?",
        "Memeriksa pencahayaan...",
        "Sedikit lagi..."
      ]
    },
    hints: {
      title: "Sempurnakan dengan AI",
      text: "Ingin mengubah detail tertentu? Gunakan obrolan di sebelah kanan. Coba katakan"
    },
    help: {
      title: "Cara Menggunakan ReRoom",
      step1Title: "Unggah Foto",
      step1Desc: "Ambil foto ruangan yang jelas atau unggah dari galeri Anda.",
      step2Title: "Pilih Gaya",
      step2Desc: "Pilih gaya desain (misal: Modern, Industrial) untuk merancang ulang seketika.",
      step3Title: "Chat & Edit",
      step3Desc: "Chat dengan AI untuk mengubah warna, furnitur, atau meminta estimasi biaya.",
      step4Title: "Alat Tambahan",
      step4Desc: "Gunakan 'Analisis Cerdas' untuk saran desain atau 'Denah' untuk melihat tata letak."
    },
    roomDetection: {
      title: "Identifikasi Tipe Ruangan",
      description: "Kami tidak dapat mengenali ruangan ini secara otomatis. Mohon beritahu kami jenis ruangan ini agar desainnya akurat.",
      label: "Tipe Ruangan",
      placeholder: "cth: Ruang Kerja, Loteng, Kafe...",
      submit: "Konfirmasi Tipe Ruangan",
      detected: "Teridentifikasi sebagai",
      change: "Ubah"
    },
    footer: {
      credit: "Dibuat oleh Anton Prafanto di Samarinda"
    }
  }
};
