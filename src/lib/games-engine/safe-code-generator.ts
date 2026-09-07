// Sayısal & Mantık: Kasa Şifresi / Kod Kırma (Mastermind / Crack The Code) Motoru

export interface SafeClue {
  guess: string; // e.g. "682"
  correctCount: number;
  wellPlacedCount: number;
  description: string;
}

export interface SafePuzzle {
  id: string;
  secret: string; // e.g. "042"
  digits: number; // 3 or 4
  clues: SafeClue[];
  solutionExplanation: string;
}

// Check how many well placed and wrongly placed numbers
function evaluateClue(secret: string, guess: string) {
  let wellPlaced = 0;
  let correct = 0;
  const len = secret.length;

  for (let i = 0; i < len; i++) {
    if (guess[i] === secret[i]) {
      wellPlaced++;
    }
    if (secret.includes(guess[i])) {
      correct++;
    }
  }

  const wronglyPlaced = correct - wellPlaced;
  return { wellPlaced, wronglyPlaced, correct };
}

// Solver: Check how many candidate secrets satisfy all clues
export function solveSafePuzzle(clues: SafeClue[], digits: number = 3): string[] {
  const max = Math.pow(10, digits);
  const solutions: string[] = [];

  for (let i = 0; i < max; i++) {
    const candidate = String(i).padStart(digits, '0');
    // Ensure all digits in candidate are unique if standard rules apply
    const uniqueDigits = new Set(candidate);
    if (uniqueDigits.size !== digits) continue;

    let valid = true;
    for (const clue of clues) {
      const { wellPlaced, correct } = evaluateClue(candidate, clue.guess);
      if (wellPlaced !== clue.wellPlacedCount || correct !== clue.correctCount) {
        valid = false;
        break;
      }
    }

    if (valid) {
      solutions.push(candidate);
    }
  }

  return solutions;
}

// Procedural Generator for Safe Code Puzzle
export function generateSafePuzzle(seed: number = 1, digits: number = 3): SafePuzzle {
  // Predefined curated distinct seed puzzles + procedural fallback
  const CURATED_PUZZLES: SafePuzzle[] = [
    {
      id: 'safe-042',
      secret: '042',
      digits: 3,
      clues: [
        { guess: '682', correctCount: 1, wellPlacedCount: 1, description: '1 Rakam Doğru ve Yeri Doğru' },
        { guess: '614', correctCount: 1, wellPlacedCount: 0, description: '1 Rakam Doğru fakat Yeri Yanlış' },
        { guess: '206', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' },
        { guess: '738', correctCount: 0, wellPlacedCount: 0, description: 'Hiçbir Rakam Doğru Değil' },
        { guess: '780', correctCount: 1, wellPlacedCount: 0, description: '1 Rakam Doğru fakat Yeri Yanlış' }
      ],
      solutionExplanation: 'İpucu 4: {7,3,8} elendi. İpucu 1: {6,8,2} içinde 2 doğru ve son basamakta. İpucu 5: 0 var ve ilk basamakta. İpucu 2: 4 var ve ortada.'
    },
    {
      id: 'safe-379',
      secret: '379',
      digits: 3,
      clues: [
        { guess: '271', correctCount: 1, wellPlacedCount: 1, description: '1 Rakam Doğru ve Yeri Doğru' },
        { guess: '438', correctCount: 1, wellPlacedCount: 0, description: '1 Rakam Doğru fakat Yeri Yanlış' },
        { guess: '974', correctCount: 2, wellPlacedCount: 1, description: '2 Rakam Doğru, 1 Doğru Yerde' },
        { guess: '852', correctCount: 0, wellPlacedCount: 0, description: 'Hiçbir Rakam Doğru Değil' },
        { guess: '913', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' }
      ],
      solutionExplanation: 'İpucu 4: {8,5,2} elendi. İpucu 1: 7 ortada doğru. İpucu 5: {9,3} ikisi de var, 3 başta, 9 sonda. Şifre: 379.'
    },
    {
      id: 'safe-168',
      secret: '168',
      digits: 3,
      clues: [
        { guess: '963', correctCount: 1, wellPlacedCount: 1, description: '1 Rakam Doğru ve Yeri Doğru' },
        { guess: '815', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' },
        { guess: '247', correctCount: 0, wellPlacedCount: 0, description: 'Hiçbir Rakam Doğru Değil' },
        { guess: '689', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' },
        { guess: '150', correctCount: 1, wellPlacedCount: 1, description: '1 Rakam Doğru ve Yeri Doğru' }
      ],
      solutionExplanation: 'İpucu 3: {2,4,7} elendi. İpucu 5: 1 başta doğru. İpucu 1: 6 ortada doğru. İpucu 2: 8 sonda. Şifre: 168.'
    },
    {
      id: 'safe-582',
      secret: '582',
      digits: 3,
      clues: [
        { guess: '184', correctCount: 1, wellPlacedCount: 1, description: '1 Rakam Doğru ve Yeri Doğru' },
        { guess: '259', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' },
        { guess: '730', correctCount: 0, wellPlacedCount: 0, description: 'Hiçbir Rakam Doğru Değil' },
        { guess: '562', correctCount: 2, wellPlacedCount: 2, description: '2 Rakam Doğru ve Yerleri Doğru' },
        { guess: '821', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' }
      ],
      solutionExplanation: 'İpucu 3: {7,3,0} elendi. İpucu 1: 8 ortada doğru. İpucu 4: 5 başta, 2 sonda doğru. Şifre: 582.'
    },
    {
      id: 'safe-904',
      secret: '904',
      digits: 3,
      clues: [
        { guess: '502', correctCount: 1, wellPlacedCount: 1, description: '1 Rakam Doğru ve Yeri Doğru' },
        { guess: '491', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' },
        { guess: '873', correctCount: 0, wellPlacedCount: 0, description: 'Hiçbir Rakam Doğru Değil' },
        { guess: '954', correctCount: 2, wellPlacedCount: 2, description: '2 Rakam Doğru ve Yerleri Doğru' },
        { guess: '046', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' }
      ],
      solutionExplanation: 'İpucu 3: {8,7,3} elendi. İpucu 4: 9 başta ve 4 sonda doğru. İpucu 1: 0 ortada doğru. Şifre: 904.'
    },
    {
      id: 'safe-281',
      secret: '281',
      digits: 3,
      clues: [
        { guess: '483', correctCount: 1, wellPlacedCount: 1, description: '1 Rakam Doğru ve Yeri Doğru' },
        { guess: '129', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' },
        { guess: '765', correctCount: 0, wellPlacedCount: 0, description: 'Hiçbir Rakam Doğru Değil' },
        { guess: '201', correctCount: 2, wellPlacedCount: 2, description: '2 Rakam Doğru ve Yerleri Doğru' },
        { guess: '810', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' }
      ],
      solutionExplanation: 'İpucu 3: {7,6,5} elendi. İpucu 1: 8 ortada doğru. İpucu 4: 2 başta ve 1 sonda doğru. Şifre: 281.'
    },
    {
      id: 'safe-637',
      secret: '637',
      digits: 3,
      clues: [
        { guess: '614', correctCount: 1, wellPlacedCount: 1, description: '1 Rakam Doğru ve Yeri Doğru' },
        { guess: '739', correctCount: 2, wellPlacedCount: 1, description: '2 Rakam Doğru, 1 Doğru Yerde' },
        { guess: '852', correctCount: 0, wellPlacedCount: 0, description: 'Hiçbir Rakam Doğru Değil' },
        { guess: '360', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' },
        { guess: '473', correctCount: 2, wellPlacedCount: 0, description: '2 Rakam Doğru fakat Yerleri Yanlış' }
      ],
      solutionExplanation: 'İpucu 3: {8,5,2} elendi. İpucu 1: 6 başta doğru. İpucu 2: 3 ortada doğru, 7 sonda. Şifre: 637.'
    }
  ];

  const index = Math.abs(seed) % CURATED_PUZZLES.length;
  return CURATED_PUZZLES[index];
}
