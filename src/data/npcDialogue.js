/**
 * Canonical Village Dialogue Scripts for Seasons of Home
 * Written in warm, natural Indonesian pedesaan style.
 */

export const NPC_DIALOGUES = {
  suri: {
    name: 'Suri',
    title: 'Pemandu Kebun Komunitas',
    portrait: 'asset/characters/portraits/suri_bust.png',
    greetings: [
      'Selamat pagi, Joni. Udara lembah hari ini sungguh menyejukkan dada.',
      'Tanah terasering ini selalu menyambut mereka yang tekun merawatnya.',
      'Jangan lupa menyiram tanamanmu sebelum matahari terik meninggi, ya nak.',
      'Musim semi adalah awal dari segala kehidupan baru di Lembah Rimbun.'
    ],
    quests: {
      quest_beat_1: {
        intro: {
          text: 'Joni! Syukurlah kau sudah kembali ke pondok kakekmu. Lembah ini sudah lama merindukan tawa dari kebun terasering ini.',
          options: [
            { text: 'Terima kasih, Nek Suri. Dari mana saya harus mulai?', next: 'step1' },
            { text: 'Tanahnya masih terlihat agak tandus...', next: 'explain' }
          ]
        },
        explain: {
          text: 'Jangan cemas. Tanah di sini sangat subur jika digemburkan dengan cangkul dan diberi air jernih dari mata air pegunungan.',
          options: [
            { text: 'Baik, saya siap bekerja!', next: 'step1' }
          ]
        },
        step1: {
          text: 'Ambillah cangkulmu, gemburkan tanah, lalu tanam bibit Sunroot yang kau bawa. Sirami setiap hari sampai umbinya ranum keemasan!',
          options: [
            { text: 'Saya akan rawat sampai panen!', next: null, action: 'ACCEPT_QUEST' }
          ]
        },
        in_progress: {
          text: 'Bagaimana kebunmu, Joni? Pastikan tanahnya lembap disiram setiap hari agar bibit Sunroot lekas bertunas.',
          options: [
            { text: 'Saya sedang merawatnya, Nek.', next: null }
          ]
        },
        completed: {
          text: 'Luar biasa! Lihat umbi Sunroot ini—kuning cerah dan padat! Kakekmu pasti tersenyum bangga melihat ketekunanmu.',
          options: [
            { text: 'Terima kasih atas bimbingannya, Nek Suri!', next: null, action: 'CLAIM_REWARD' }
          ]
        }
      }
    }
  },

  bima: {
    name: 'Bima',
    title: 'Pandai Besi & Pengrajin Kayu',
    portrait: 'asset/characters/portraits/bima_bust.png',
    greetings: [
      'Hei, Joni! Gemerincing palu dan bau arang kayu bakar—inilah musik terbaik di bengkelku.',
      'Alat yang bagus adalah separuh dari keberhasilan kerja, Joni.',
      'Jika cangkul atau penyirammu butuh penguatan, bawa bijih logam ke mari.',
      'Kayu rimba di bukit barat sangat kokoh untuk tiang pondok.'
    ],
    quests: {
      quest_beat_2: {
        intro: {
          text: 'Joni, pas sekali kau lewat! Aku sedang menyiapkan pesanan rangka lentera untuk festival desa, tapi stok kayu rimba dan batu kali bengkelku menipis.',
          options: [
            { text: 'Apa yang bisa saya bantu, Paman Bima?', next: 'step1' },
            { text: 'Apakah festival sudah dekat?', next: 'festival_info' }
          ]
        },
        festival_info: {
          text: 'Malam Lentera Panen tinggal sebentar lagi! Seluruh warga akan menggantung lentera buatan tangan di pohon rimba desa.',
          options: [
            { text: 'Saya akan carikan bahannya!', next: 'step1' }
          ]
        },
        step1: {
          text: 'Tolong kumpulkan 3 potong Kayu Rimba dan 2 Batu Kali dari sekitar kebun dan bukit. Nanti akan kutempa penyiram tembaga untukmu sebagai imbalan!',
          options: [
            { text: 'Siap, Paman Bima. Segera saya kumpulkan!', next: null, action: 'ACCEPT_QUEST' }
          ]
        },
        in_progress: {
          text: 'Sudah dapat kayunya, Joni? Periksa pohon tumbang di dekat bukit atau bebatuan tepi sungai.',
          options: [
            { text: 'Masih saya cari, Paman.', next: null }
          ]
        },
        completed: {
          text: 'Wah, kayu rimba tua yang padat dan batu kali yang kokoh! Kerjamu cekatan sekali, Joni. Ini penyiram tembaga yang kujanjikan!',
          options: [
            { text: 'Terima kasih banyak, Paman Bima!', next: null, action: 'CLAIM_REWARD' }
          ]
        }
      }
    }
  },

  nara: {
    name: 'Nara',
    title: 'Pengelola Kios Desa',
    portrait: 'asset/characters/portraits/nara_bust.png',
    greetings: [
      'Halo, Joni! Segala macam bibit segar dan bumbu dapur siap ditimbang hari ini.',
      'Senang melihat hasil panen kebunmu mulai meramaikan pasar desa.',
      'Koin daunmu selalu berharga di kiosku, Joni. Mau belanja bibit apa hari ini?',
      'Kudengar cuaca besok akan cerah berawan—waktu yang tepat untuk menanam!'
    ],
    quests: {
      quest_beat_3: {
        intro: {
          text: 'Joni! Kiosku mendapat kehormatan menyiapkan seserahan pesta untuk Malam Lentera Panen, tapi aku masih kekurangan stok panen unggulan.',
          options: [
            { text: 'Bahan apa yang kau butuhkan, Nara?', next: 'step1' },
            { text: 'Apakah seluruh warga akan hadir?', next: 'festival_chat' }
          ]
        },
        festival_chat: {
          text: 'Tentu saja! Suri akan memimpin doa syukur, dan Bima sudah memasang lentera kayunya di alun-alun.',
          options: [
            { text: 'Baiklah, aku bantu penuhi bahannya!', next: 'step1' }
          ]
        },
        step1: {
          text: 'Aku membutuhkan 1 Umbi Sunroot manis dan 1 Mossberry matang. Bisakah kau menyumbangkannya untuk pesta desa?',
          options: [
            { text: 'Tentu, hasil panen kebunku siap untuk desa!', next: null, action: 'ACCEPT_QUEST' }
          ]
        },
        in_progress: {
          text: 'Bagaimana kebun Mossberry dan Sunroot-mu, Joni? Semangkuk pai berry dan rebusan umbi menanti hasil tanganmu.',
          options: [
            { text: 'Sedang kutunggu matang, Nara.', next: null }
          ]
        },
        completed: {
          text: 'Sempurna! Buah berry-nya sangat ranum dan umbinya wangi! Sekarang persiapan festival kita sudah lengkap. Terima kasih banyak, Joni!',
          options: [
            { text: 'Sama-sama, Nara! Sampai jumpa di malam festival!', next: null, action: 'CLAIM_REWARD' }
          ]
        }
      }
    }
  }
};
