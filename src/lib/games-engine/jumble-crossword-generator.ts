// Görsel & Kelime: Kelime Karıştırma (Jumble), Kelime Arama (Word Search) ve Mini Çapraz Bulmaca Motoru

// -------------------------------------------------------------
// 1. JUMBLE / ANAGRAM PUZZLE
// -------------------------------------------------------------

export interface JumbleItem {
  scrambled: string;
  original: string;
  hint: string;
  circledIndices: number[]; // 0-based indices in the original word that feed the final mystery word
}

export interface JumblePuzzle {
  id: string;
  theme: string;
  items: JumbleItem[];
  mysteryRiddle: string; // e.g. "Küçük bir kutu, sıcak noktalarla kağıda sihir çizer:"
  mysteryAnswer: string; // e.g. "TERMAL BASKI"
  mysteryScrambled: string;
}

export const JUMBLE_PRESETS: JumblePuzzle[] = [
  {
    id: 'jumble-tech-print',
    theme: 'Teknoloji & Matbaa Dünyası',
    mysteryRiddle: 'Isı ve mikro noktalarla saniyeler içinde anı donduran teknoloji:',
    mysteryAnswer: 'TERMAL YAZICI',
    mysteryScrambled: 'AZTMILECR YIA',
    items: [
      { scrambled: 'BLTMKUEO', original: 'KABLOLU', hint: 'Bağlantı şekli', circledIndices: [0, 4] }, // K, O
      { scrambled: 'RMATLE', original: 'TERMAL', hint: 'Isı ile çalışan', circledIndices: [0, 1] }, // T, E
      { scrambled: 'KPBASO', original: 'BARKOD', hint: 'Siyah beyaz çizgiler', circledIndices: [0, 1] }, // B, A
      { scrambled: 'PKSLEİ', original: 'PİKSEL', hint: 'Görüntü birimi', circledIndices: [0, 2] }, // P, K
      { scrambled: 'LOURO', original: 'RULLO', hint: 'Kağıt sarımı', circledIndices: [0, 1] } // R, U
    ]
  },
  {
    id: 'jumble-nature-science',
    theme: 'Uzay & Bilim Keşfi',
    mysteryRiddle: 'Evrende zamanın ve ışığın bile büküldüğü gizemli gök cismi:',
    mysteryAnswer: 'KARA DELIK',
    mysteryScrambled: 'ALIA KDKER',
    items: [
      { scrambled: 'ZGYNEEE', original: 'GEZEGEN', hint: 'Gök cismi', circledIndices: [0, 2] }, // G, Z
      { scrambled: 'TKROEE', original: 'ROKET', hint: 'Uzay aracı', circledIndices: [0, 1] }, // R, O
      { scrambled: 'LTYDIIZ', original: 'YILDIZ', hint: 'Işık saçan', circledIndices: [0, 3] }, // Y, D
      { scrambled: 'OATMRSEF', original: 'ATMOSFER', hint: 'Hava küre', circledIndices: [0, 2] } // A, M
    ]
  },
  {
    id: 'jumble-retro-gaming',
    theme: 'Retro Oyun & Nostalji',
    mysteryRiddle: '80\'lerin jetonla çalışan, yanıp sönen efsanevi oyun makineleri:',
    mysteryAnswer: 'ARCADE KABIN',
    mysteryScrambled: 'BNCD AAERKI',
    items: [
      { scrambled: 'TTRSEİ', original: 'TETRIS', hint: 'Düşen bloklar', circledIndices: [0, 1] }, // T, E
      { scrambled: 'JTYSOKİC', original: 'JOYSTICK', hint: 'Oyun kolu', circledIndices: [0, 2] }, // J, Y
      { scrambled: 'APCNMA', original: 'PACMAN', hint: 'Labirentte sarı canavar', circledIndices: [0, 1] }, // P, A
      { scrambled: 'PTNLEOİ', original: 'PALET', hint: 'Piksel renk grubu', circledIndices: [0, 1] } // P, A
    ]
  }
];

// -------------------------------------------------------------
// 2. WORD SEARCH (KELİME AVCI IZGARASI)
// -------------------------------------------------------------

export interface WordSearchPuzzle {
  id: string;
  theme: string;
  size: number; // 8x8 or 10x10
  grid: string[][];
  words: string[];
}

export function generateWordSearch(themeIdx: number = 0, size: number = 8): WordSearchPuzzle {
  const WORD_SETS = [
    {
      theme: 'Piksel & Baskı Terimleri',
      words: ['TERMAL', 'PIKSEL', 'BLUETOOTH', 'BASKI', 'RULO', 'ETIKET', 'DITHER']
    },
    {
      theme: 'Retro Bilgisayar & Oyun',
      words: ['CHIPTUNE', 'ARCADE', 'TETRIS', 'KODLAMA', 'PIKSEL', 'NOSTALJI', 'ECHO']
    },
    {
      theme: 'Zeka & Mantık Oyunları',
      words: ['SUDOKU', 'LABIRENT', 'MATRIS', 'BULMACA', 'SIFRE', 'HAFIZA', 'MANTIK']
    }
  ];

  const selectedSet = WORD_SETS[themeIdx % WORD_SETS.length];
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));

  // Place selected words in grid horizontally, vertically, or diagonal
  const placedWords: string[] = [];
  const TURKISH_CHARS = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

  selectedSet.words.forEach((w) => {
    const cleanWord = w.replace(/[^A-ZÇĞİÖŞÜ]/gi, '').toUpperCase();
    if (cleanWord.length > size) return;

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 50) {
      attempts++;
      const dir = attempts % 3; // 0=horizontal, 1=vertical, 2=diagonal
      const maxR = dir === 0 ? size - 1 : size - cleanWord.length;
      const maxC = dir === 1 ? size - 1 : size - cleanWord.length;

      if (maxR < 0 || maxC < 0) continue;

      const r = Math.floor(Math.random() * (maxR + 1));
      const c = Math.floor(Math.random() * (maxC + 1));

      // Check collision
      let canPlace = true;
      for (let i = 0; i < cleanWord.length; i++) {
        const nr = dir === 0 ? r : r + i;
        const nc = dir === 1 ? c : c + i;
        if (grid[nr][nc] !== '' && grid[nr][nc] !== cleanWord[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < cleanWord.length; i++) {
          const nr = dir === 0 ? r : r + i;
          const nc = dir === 1 ? c : c + i;
          grid[nr][nc] = cleanWord[i];
        }
        placed = true;
        placedWords.push(cleanWord);
      }
    }
  });

  // Fill empty cells with random letters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        const randChar = TURKISH_CHARS[Math.floor(Math.random() * TURKISH_CHARS.length)];
        grid[r][c] = randChar;
      }
    }
  }

  return {
    id: `ws-${size}x${size}-${themeIdx}`,
    theme: selectedSet.theme,
    size,
    grid,
    words: placedWords
  };
}

// -------------------------------------------------------------
// 3. MINI CROSSWORD (MİNİ ÇENGEL / ÇAPRAZ BULMACA)
// -------------------------------------------------------------

export interface CrosswordClue {
  num: number;
  direction: 'across' | 'down';
  clue: string;
  answer: string;
  r: number;
  c: number;
}

export interface MiniCrosswordPuzzle {
  id: string;
  title: string;
  size: number; // 5 or 6
  grid: Array<Array<{ letter: string; num?: number; isBlock: boolean }>>;
  cluesAcross: CrosswordClue[];
  cluesDown: CrosswordClue[];
}

export const MINI_CROSSWORD_PRESETS: MiniCrosswordPuzzle[] = [
  {
    id: 'mini-cross-1',
    title: '5x5 Termal Mini Çapraz #1',
    size: 5,
    grid: [
      [{ letter: 'B', num: 1, isBlock: false }, { letter: 'A', num: 2, isBlock: false }, { letter: 'S', num: 3, isBlock: false }, { letter: 'K', num: 4, isBlock: false }, { letter: 'I', isBlock: false }],
      [{ letter: 'L', num: 5, isBlock: false }, { letter: 'N', isBlock: false }, { letter: 'I', isBlock: false }, { letter: 'O', isBlock: false }, { letter: 'S', isBlock: false }],
      [{ letter: 'U', num: 6, isBlock: false }, { letter: 'A', isBlock: false }, { letter: 'F', isBlock: false }, { letter: 'D', isBlock: false }, { letter: 'I', isBlock: false }],
      [{ letter: 'E', num: 7, isBlock: false }, { letter: 'R', isBlock: false }, { letter: 'R', isBlock: false }, { letter: 'U', isBlock: false }, { letter: 'N', isBlock: false }],
      [{ letter: 'T', num: 8, isBlock: false }, { letter: 'T', isBlock: false }, { letter: 'E', isBlock: false }, { letter: 'M', isBlock: false }, { letter: 'A', isBlock: false }]
    ],
    cluesAcross: [
      { num: 1, direction: 'across', clue: 'Kağıt üzerine mürekkep veya ısıyla yapılan çoğaltma', answer: 'BASKI', r: 0, c: 0 },
      { num: 5, direction: 'across', clue: 'Fotoğrafta kaydedilen hatıra, geçmişten kalan iz', answer: 'ANI', r: 1, c: 1 },
      { num: 6, direction: 'across', clue: 'Gizli kilit kombinasyonu, parola', answer: 'ŞİFRE', r: 2, c: 0 },
      { num: 7, direction: 'across', clue: 'Hata veya sistemsel uyarı mesajı', answer: 'ERROR', r: 3, c: 0 },
      { num: 8, direction: 'across', clue: 'Bir tasarımın ana görsel motifi, tarzı', answer: 'TEMA', r: 4, c: 1 }
    ],
    cluesDown: [
      { num: 1, direction: 'down', clue: 'Mavi diş anlamına gelen kablosuz bağlantı standardı', answer: 'BLUET', r: 0, c: 0 },
      { num: 2, direction: 'down', clue: 'Mantık, zeka ve düşünce yürütme sanatı', answer: 'AKIL', r: 0, c: 1 },
      { num: 3, direction: 'down', clue: 'Ses titreşimi, dalga', answer: 'SES', r: 0, c: 2 },
      { num: 4, direction: 'down', clue: 'Programlama veya şifre komut dizisi', answer: 'KODUM', r: 0, c: 3 }
    ]
  },
  {
    id: 'mini-cross-2',
    title: '5x5 Termal Mini Çapraz #2',
    size: 5,
    grid: [
      [{ letter: 'R', num: 1, isBlock: false }, { letter: 'U', num: 2, isBlock: false }, { letter: 'L', num: 3, isBlock: false }, { letter: 'O', num: 4, isBlock: false }, { letter: '', isBlock: true }],
      [{ letter: 'O', num: 5, isBlock: false }, { letter: 'Y', isBlock: false }, { letter: 'U', isBlock: false }, { letter: 'N', isBlock: false }, { letter: 'A', isBlock: false }],
      [{ letter: 'B', num: 6, isBlock: false }, { letter: 'U', isBlock: false }, { letter: 'L', isBlock: false }, { letter: 'M', isBlock: false }, { letter: 'A', isBlock: false }],
      [{ letter: 'O', num: 7, isBlock: false }, { letter: 'N', isBlock: false }, { letter: 'U', isBlock: false }, { letter: 'L', isBlock: false }, { letter: 'R', isBlock: false }],
      [{ letter: 'T', num: 8, isBlock: false }, { letter: 'E', isBlock: false }, { letter: 'M', isBlock: false }, { letter: 'A', isBlock: false }, { letter: 'T', isBlock: false }]
    ],
    cluesAcross: [
      { num: 1, direction: 'across', clue: 'Silindir biçiminde sarılmış kağıt bandı', answer: 'RULO', r: 0, c: 0 },
      { num: 5, direction: 'across', clue: 'Eğlence ve yarışma amacıyla yapılan aktivite', answer: 'OYUN', r: 1, c: 0 },
      { num: 6, direction: 'across', clue: 'Zeka ve dikkat gerektiren bilmece', answer: 'BULMA', r: 2, c: 0 },
      { num: 8, direction: 'across', clue: 'Bir yapıtın işlediği ana konu, motif', answer: 'TEMAT', r: 4, c: 0 }
    ],
    cluesDown: [
      { num: 1, direction: 'down', clue: 'Otomatik çalışan elektromekanik aygıt', answer: 'ROBOT', r: 0, c: 0 },
      { num: 2, direction: 'down', clue: 'Gözün dinlenmek üzere kapandığı evre', answer: 'UYKU', r: 0, c: 1 },
      { num: 3, direction: 'down', clue: 'Piksel matrisinde en küçük nokta', answer: 'LUMEN', r: 0, c: 2 },
      { num: 4, direction: 'down', clue: 'Termal kafanın kağıda aktardığı sıcaklık noktası', answer: 'ON' , r: 0, c: 3 }
    ]
  }
];
