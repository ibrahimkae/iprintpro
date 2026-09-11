import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Sparkles, 
  Printer, 
  Dices, 
  Grid, 
  Calculator, 
  Hash,
  KeyRound,
  Brain,
  Compass,
  FileText,
  Search,
  Eye,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sliders,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

// Game Engines
import { generateSafePuzzle, SafePuzzle } from '../lib/games-engine/safe-code-generator';
import { generateMatrixIQPuzzle, MatrixIQPuzzle } from '../lib/games-engine/matrix-iq-generator';
import { generateSudoku, generateMaze, SudokuDifficulty } from '../lib/games-engine/sudoku-maze-generator';
import { JUMBLE_PRESETS, generateWordSearch, MINI_CROSSWORD_PRESETS } from '../lib/games-engine/jumble-crossword-generator';
import { SPOT_DIFFERENCE_PRESETS } from '../lib/games-engine/spot-difference-generator';

export interface MiniGamesPrintViewProps {
  pageWidth: number;
  onPrintImage: (dataUrl: string, title: string, widthMm?: number) => void;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onPreviewAndPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack?: () => void;
}

export type GameCategory = 
  | 'safe_code'       // Kasa Şifresi & Mantık
  | 'matrix_iq'       // Eksik Parçayı Bul (IQ Matrisi)
  | 'sudoku'          // Prosedürel Sudoku
  | 'maze'            // Prosedürel Labirent
  | 'jumble'          // Kelime Karıştırma (Jumble)
  | 'word_search'     // Kelime Arama
  | 'mini_crossword'  // Mini Çapraz Bulmaca
  | 'spot_diff'       // Görsel Dedektif (Mikro 5 Fark)
  | 'tictactoe'       // XOX 4'lü Grid
  | 'math_quiz';      // Matematik Çarpım Fişi

export const MiniGamesPrintView: React.FC<MiniGamesPrintViewProps> = ({
  pageWidth = 384,
  onPrintImage,
  onDirectPrint,
  onPreviewAndPrint,
  onBack
}) => {
  const [selectedGame, setSelectedGame] = useState<GameCategory>('safe_code');
  const [activeMainTab, setActiveMainTab] = useState<'preview' | 'games' | 'settings'>('preview');
  const [gameSeed, setGameSeed] = useState<number>(1);
  const [sudokuDifficulty, setSudokuDifficulty] = useState<SudokuDifficulty>('easy');
  const [mazeSize, setMazeSize] = useState<number>(17);
  const [wordSearchSize, setWordSearchSize] = useState<number>(8);
  const [showAnswerInPrint, setShowAnswerInPrint] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // -------------------------------------------------------------
  // CANVAS RENDER ENGINE FOR ALL GAME TYPES
  // -------------------------------------------------------------
  const renderGameCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetW = pageWidth >= 576 ? 576 : 384;
    const is80mm = targetW >= 576;

    // Helper: Draw Inverted (Upside Down) Answer Key at the bottom
    const drawInvertedAnswer = (startY: number, title: string, answerText: string, extraHeight: number = 70) => {
      const boxY = startY + 12;
      const boxH = extraHeight;

      // Divider Line with fold icon
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(15, boxY);
      ctx.lineTo(targetW - 15, boxY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✂️ Buradan Katlayın / Ters Çevirin (Cevap Anahtarı) 🔄', targetW / 2, boxY + 12);

      // Draw Upside Down Text Box
      ctx.save();
      ctx.translate(targetW / 2, boxY + 18 + (boxH - 18) / 2);
      ctx.rotate(Math.PI); // Rotate 180 degrees

      ctx.strokeRect(-((targetW - 40) / 2), -((boxH - 24) / 2), targetW - 40, boxH - 24);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`🔑 ${title}`, 0, -((boxH - 24) / 2) + 14);

      ctx.font = '10px monospace';
      // Word wrap or line break answer text
      const lines = answerText.split('\n');
      lines.forEach((line, idx) => {
        ctx.fillText(line, 0, -((boxH - 24) / 2) + 28 + (idx * 14));
      });

      ctx.restore();
      return boxY + boxH;
    };

    // 1. KASA ŞİFRESİ (CRACK THE SAFE CODE)
    if (selectedGame === 'safe_code') {
      const puzzle: SafePuzzle = generateSafePuzzle(gameSeed);
      const totalH = showAnswerInPrint ? 520 : 430;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      // Header Banner
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 KASA ŞİFRESİ: KODU KIR', targetW / 2, 36);

      // Subtitle
      ctx.fillStyle = '#000000';
      ctx.font = 'italic 10px sans-serif';
      ctx.fillText('3 basamaklı gizli sayıyı mantıksal ipuçlarıyla çöz!', targetW / 2, 65);

      // Draw 5 Clues
      let y = 80;
      puzzle.clues.forEach((clue, idx) => {
        // Clue row box
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(16, y, targetW - 32, 42);

        // Guess digits box on left
        ctx.fillStyle = '#000000';
        ctx.fillRect(18, y + 2, 70, 38);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(clue.guess.split('').join(' '), 53, y + 27);

        // Clue text description on right
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';

        // Badge indicator
        let badge = '⚠️';
        if (clue.correctCount === 0) badge = '❌';
        else if (clue.wellPlacedCount > 0) badge = '🎯';
        else badge = '🔄';

        ctx.fillText(`${badge} ${clue.description}`, 96, y + 25);
        y += 48;
      });

      // Player Scratchpad / Guess Area
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✍️ Tahmininiz (Kasa Şifresi):', 20, y + 16);

      const boxSize = 32;
      const startBoxX = targetW - 20 - (boxSize * 3 + 12);
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(startBoxX + i * (boxSize + 6), y + 2, boxSize, boxSize);
      }

      y += 46;

      if (showAnswerInPrint) {
        drawInvertedAnswer(y, 'KASA ŞİFRE ÇÖZÜMÜ', `Gizli Şifre: [ ${puzzle.secret} ]\n${puzzle.solutionExplanation}`, 80);
      }
    }

    // 2. EKSİK PARÇAYI BUL (IQ MATRİSİ)
    else if (selectedGame === 'matrix_iq') {
      const puzzle: MatrixIQPuzzle = generateMatrixIQPuzzle(gameSeed);
      const totalH = showAnswerInPrint ? 590 : 500;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      // Header Banner
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧠 IQ MATRİSİ: EKSİK PARÇA', targetW / 2, 36);

      // Subtitle
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(puzzle.title, targetW / 2, 65);
      ctx.font = '10px sans-serif';
      ctx.fillText('9. kutudaki soru işareti yerine hangi seçenek gelmelidir?', targetW / 2, 80);

      // 3x3 Matrix Grid
      const matrixSize = is80mm ? 220 : 190;
      const cellSize = Math.floor(matrixSize / 3);
      const mx = Math.floor((targetW - cellSize * 3) / 2);
      const my = 95;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(mx, my, cellSize * 3, cellSize * 3);

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const cx = mx + c * cellSize;
          const cy = my + r * cellSize;
          const idx = r * 3 + c;

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, cy, cellSize, cellSize);

          if (idx < 8) {
            puzzle.cells[idx](ctx, cx, cy, cellSize);
          } else {
            // 9th cell: '?'
            ctx.fillStyle = '#000000';
            ctx.fillRect(cx + 4, cy + 4, cellSize - 8, cellSize - 8);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', cx + cellSize / 2, cy + cellSize / 2);
            ctx.textBaseline = 'alphabetic';
          }
        }
      }

      // Options: A, B, C, D
      const optY = my + cellSize * 3 + 20;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Seçenekler:', targetW / 2, optY);

      const optBoxW = Math.floor((targetW - 50) / 4);
      const optBoxH = is80mm ? 65 : 55;
      const optStartX = Math.floor((targetW - (optBoxW * 4 + 18)) / 2);

      puzzle.options.forEach((opt, idx) => {
        const ox = optStartX + idx * (optBoxW + 6);
        const oy = optY + 10;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox, oy, optBoxW, optBoxH);

        // Option letter label
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`[ ${opt.id} ]`, ox + optBoxW / 2, oy + 12);

        // Draw shape in option
        opt.draw(ctx, ox + (optBoxW - (optBoxH - 18)) / 2, oy + 14, optBoxH - 18);
      });

      const nextY = optY + optBoxH + 20;
      if (showAnswerInPrint) {
        drawInvertedAnswer(nextY, 'IQ MATRİSİ DOĞRU CEVAP', `Doğru Şık: [ ${puzzle.correctOption} ]\n${puzzle.explanation}`, 76);
      }
    }

    // 3. PROSEDÜREL 9x9 SUDOKU
    else if (selectedGame === 'sudoku') {
      const puzzle = generateSudoku(gameSeed, sudokuDifficulty);
      const totalH = showAnswerInPrint ? 580 : 490;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      // Header Banner
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🧩 TERMAL SUDOKU (${sudokuDifficulty.toUpperCase()})`, targetW / 2, 36);

      // Info Bar
      ctx.fillStyle = '#000000';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Süre Tutun: [ __ : __ ]  •  Tohum #${gameSeed}`, targetW / 2, 65);

      const gridMargin = is80mm ? 30 : 16;
      const gridW = targetW - (gridMargin * 2);
      const cellSize = Math.floor(gridW / 9);
      const actualGridW = cellSize * 9;
      const startX = Math.floor((targetW - actualGridW) / 2);
      const startY = 75;

      // Draw Grid Lines
      for (let i = 0; i <= 9; i++) {
        ctx.lineWidth = (i % 3 === 0) ? 3 : 1;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(startX + i * cellSize, startY);
        ctx.lineTo(startX + i * cellSize, startY + actualGridW);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(startX, startY + i * cellSize);
        ctx.lineTo(startX + actualGridW, startY + i * cellSize);
        ctx.stroke();
      }

      // Numbers
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.floor(cellSize * 0.65)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = puzzle.grid[r][c];
          if (val > 0) {
            const cx = startX + c * cellSize + cellSize / 2;
            const cy = startY + r * cellSize + cellSize / 2;
            ctx.fillText(String(val), cx, cy + 1);
          }
        }
      }
      ctx.textBaseline = 'alphabetic';

      const nextY = startY + actualGridW + 10;
      if (showAnswerInPrint) {
        // Compact single-line row solution string
        const solRows = puzzle.solution.map(r => r.join('')).join(' | ');
        drawInvertedAnswer(nextY, 'SUDOKU ÇÖZÜMÜ (Satır Satır)', `${solRows.slice(0, 44)}\n${solRows.slice(44)}`, 74);
      }
    }

    // 4. PROSEDÜREL LABİRENT (MAZE)
    else if (selectedGame === 'maze') {
      const maze = generateMaze(mazeSize, mazeSize, gameSeed);
      const totalH = showAnswerInPrint ? 560 : 470;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      // Header Banner
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌀 PROSEDÜREL TERMAL LABİRENT', targetW / 2, 36);

      ctx.fillStyle = '#000000';
      ctx.font = '10px sans-serif';
      ctx.fillText('🚩 GİRİŞ (Sol Üst)  ----->  🏆 ÇIKIŞ (Sağ Alt)', targetW / 2, 65);

      const margin = is80mm ? 36 : 20;
      const mazeDim = targetW - (margin * 2);
      const cellSize = Math.floor(mazeDim / mazeSize);
      const actualMazeW = cellSize * mazeSize;
      const startX = Math.floor((targetW - actualMazeW) / 2);
      const startY = 75;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;

      for (let r = 0; r < maze.rows; r++) {
        for (let c = 0; c < maze.cols; c++) {
          const cell = maze.grid[r][c];
          const x = startX + c * cellSize;
          const y = startY + r * cellSize;

          if (cell.top) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke();
          }
          if (cell.right) {
            ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke();
          }
          if (cell.bottom) {
            ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke();
          }
          if (cell.left) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke();
          }
        }
      }

      // Draw start and end flags
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('🚩', startX - 12, startY + 10);
      ctx.fillText('🏆', startX + actualMazeW + 4, startY + actualMazeW);

      const nextY = startY + actualMazeW + 12;
      if (showAnswerInPrint) {
        drawInvertedAnswer(nextY, 'LABİRENT YOL İPUCU', `Toplam Çözüm Adımı: ${maze.solutionPath.length} hücre.\nBaşlangıç yönü: Doğu/Güney rotasını takip ediniz.`, 65);
      }
    }

    // 5. KELİME KARIŞTIRMA (JUMBLE / ANAGRAM)
    else if (selectedGame === 'jumble') {
      const puzzleIndex = Math.abs(gameSeed) % JUMBLE_PRESETS.length;
      const puzzle = JUMBLE_PRESETS[puzzleIndex];
      const totalH = showAnswerInPrint ? 560 : 470;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      // Header Banner
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔤 KELİME KARIŞTIRMA (JUMBLE)', targetW / 2, 36);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`Tema: ${puzzle.theme}`, targetW / 2, 65);
      ctx.font = '10px sans-serif';
      ctx.fillText('Harfleri düzeltip kutucuklara yazın, daireli harflerden şifreyi bulun!', targetW / 2, 80);

      let y = 98;
      puzzle.items.forEach((item) => {
        // Scrambled badge
        ctx.fillStyle = '#000000';
        ctx.fillRect(16, y, 90, 26);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(item.scrambled, 61, y + 18);

        // Hint text
        ctx.fillStyle = '#000000';
        ctx.font = 'italic 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`(${item.hint})`, 112, y + 17);

        // Empty letter boxes on right
        const boxSize = 22;
        const startX = targetW - 18 - (item.original.length * (boxSize + 4));

        for (let i = 0; i < item.original.length; i++) {
          const bx = startX + i * (boxSize + 4);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, y + 2, boxSize, boxSize);

          if (item.circledIndices.includes(i)) {
            // Draw circle around/inside this box for mystery clue
            ctx.beginPath();
            ctx.arc(bx + boxSize / 2, y + 2 + boxSize / 2, boxSize / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        y += 36;
      });

      // Bonus Riddle
      y += 8;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(16, y, targetW - 32, 65);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ GÜNÜN GİZEMLİ ŞİFRE SORUSU:', targetW / 2, y + 18);

      ctx.font = '10px sans-serif';
      ctx.fillText(puzzle.mysteryRiddle, targetW / 2, y + 34);

      // Mystery Boxes
      const mLen = puzzle.mysteryAnswer.replace(/\s+/g, '').length;
      const mBoxW = Math.min(22, Math.floor((targetW - 50) / mLen));
      const mStartX = Math.floor((targetW - (mLen * (mBoxW + 4))) / 2);

      for (let i = 0; i < mLen; i++) {
        ctx.strokeRect(mStartX + i * (mBoxW + 4), y + 42, mBoxW, 16);
      }

      y += 76;
      if (showAnswerInPrint) {
        const solvedWords = puzzle.items.map(it => it.original).join(', ');
        drawInvertedAnswer(y, 'JUMBLE ÇÖZÜMÜ', `Kelimeler: ${solvedWords}\nGizemli Şifre: [ ${puzzle.mysteryAnswer} ]`, 70);
      }
    }

    // 6. KELİME ARAMA (WORD SEARCH)
    else if (selectedGame === 'word_search') {
      const ws = generateWordSearch(gameSeed, wordSearchSize);
      const totalH = showAnswerInPrint ? 560 : 470;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      // Header Banner
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔍 KELİME AVCI IZGARASI (WORD SEARCH)', targetW / 2, 36);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`Tema: ${ws.theme}`, targetW / 2, 65);

      // Draw Letter Grid
      const margin = is80mm ? 36 : 22;
      const gridDim = targetW - (margin * 2);
      const cellSize = Math.floor(gridDim / ws.size);
      const actualGridW = cellSize * ws.size;
      const startX = Math.floor((targetW - actualGridW) / 2);
      const startY = 76;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(startX, startY, actualGridW, actualGridW);

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.floor(cellSize * 0.55)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < ws.size; r++) {
        for (let c = 0; c < ws.size; c++) {
          const cx = startX + c * cellSize + cellSize / 2;
          const cy = startY + r * cellSize + cellSize / 2;

          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);

          ctx.fillText(ws.grid[r][c], cx, cy);
        }
      }
      ctx.textBaseline = 'alphabetic';

      // Word Bank Checklist
      let wordY = startY + actualGridW + 16;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Bulunacak Kelimeler:', 20, wordY);

      wordY += 14;
      const cols = is80mm ? 3 : 2;
      const colW = Math.floor((targetW - 40) / cols);

      ws.words.forEach((w, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        const wx = 20 + c * colW;
        const wy = wordY + r * 16;

        ctx.font = '10px monospace';
        ctx.fillText(`[ ] ${w}`, wx, wy);
      });

      const nextY = wordY + Math.ceil(ws.words.length / cols) * 16 + 10;
      if (showAnswerInPrint) {
        drawInvertedAnswer(nextY, 'KELİME LİSTESİ', `Gizlenmiş Kelimeler:\n${ws.words.join(' • ')}`, 65);
      }
    }

    // 7. MİNİ ÇAPRAZ BULMACA (MINI CROSSWORD)
    else if (selectedGame === 'mini_crossword') {
      const pIdx = Math.abs(gameSeed) % MINI_CROSSWORD_PRESETS.length;
      const cross = MINI_CROSSWORD_PRESETS[pIdx];
      const totalH = showAnswerInPrint ? 580 : 490;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      // Header Banner
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✏️ MİNİ ÇAPRAZ BULMACA', targetW / 2, 36);

      // Grid on Left / Top
      const cellSize = is80mm ? 32 : 26;
      const actualGridW = cellSize * cross.size;
      const startX = Math.floor((targetW - actualGridW) / 2);
      const startY = 60;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, actualGridW, actualGridW);

      for (let r = 0; r < cross.size; r++) {
        for (let c = 0; c < cross.size; c++) {
          const cell = cross.grid[r][c];
          const cx = startX + c * cellSize;
          const cy = startY + r * cellSize;

          if (cell.isBlock) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(cx, cy, cellSize, cellSize);
          } else {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx, cy, cellSize, cellSize);

            if (cell.num) {
              ctx.fillStyle = '#000000';
              ctx.font = 'bold 8px sans-serif';
              ctx.textAlign = 'left';
              ctx.fillText(String(cell.num), cx + 2, cy + 9);
            }
          }
        }
      }

      // Clues across & down
      let clueY = startY + actualGridW + 16;

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('➡️ SOLDAN SAĞA:', 18, clueY);
      clueY += 13;

      ctx.font = '9px sans-serif';
      cross.cluesAcross.forEach(cl => {
        ctx.fillText(`${cl.num}. ${cl.clue} (${cl.answer.length})`, 22, clueY);
        clueY += 12;
      });

      clueY += 4;
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('⬇️ YUKARIDAN AŞAĞIYA:', 18, clueY);
      clueY += 13;

      ctx.font = '9px sans-serif';
      cross.cluesDown.forEach(cl => {
        ctx.fillText(`${cl.num}. ${cl.clue} (${cl.answer.length})`, 22, clueY);
        clueY += 12;
      });

      if (showAnswerInPrint) {
        const acrossAns = cross.cluesAcross.map(c => `${c.num}:${c.answer}`).join(' ');
        const downAns = cross.cluesDown.map(c => `${c.num}:${c.answer}`).join(' ');
        drawInvertedAnswer(clueY, 'ÇAPRAZ BULMACA CEVAPLARI', `Yatay: ${acrossAns}\nDüşey: ${downAns}`, 65);
      }
    }

    // 8. GÖRSEL DEDEKTİF (MİKRO 5 FARK)
    else if (selectedGame === 'spot_diff') {
      const pIdx = Math.abs(gameSeed) % SPOT_DIFFERENCE_PRESETS.length;
      const spot = SPOT_DIFFERENCE_PRESETS[pIdx];
      const totalH = showAnswerInPrint ? 620 : 530;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      // Header Banner
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🕵️ GÖRSEL DEDEKTİF: 5 FARK', targetW / 2, 36);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(spot.themeTitle, targetW / 2, 65);
      ctx.font = '10px sans-serif';
      ctx.fillText(spot.themeDesc, targetW / 2, 78);

      const sceneW = targetW - 32;
      const sceneH = is80mm ? 155 : 135;
      const sceneX = 16;

      // Image 1: Original
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📷 1. GÖRSEL (ORİJİNAL)', sceneX, 94);
      spot.drawScene(ctx, sceneX, 98, sceneW, sceneH, false);

      // Image 2: Modified (5 Differences)
      const scene2Y = 98 + sceneH + 16;
      ctx.fillText('🔍 2. GÖRSEL (5 MİKRO FARK GİZLİ)', sceneX, scene2Y - 4);
      spot.drawScene(ctx, sceneX, scene2Y, sceneW, sceneH, true);

      // Trackers for user
      const trackY = scene2Y + sceneH + 14;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Bulunan Farklar:   ( 1 )      ( 2 )      ( 3 )      ( 4 )      ( 5 )', targetW / 2, trackY);

      if (showAnswerInPrint) {
        const diffList = spot.differences.map(d => `${d.id}) ${d.description}`).join('\n');
        drawInvertedAnswer(trackY + 8, '5 FARK CEVAPLARI', diffList, 95);
      }
    }

    // 9. KLASİK XOX
    else if (selectedGame === 'tictactoe') {
      const totalH = 460;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('❌ XOX (TIC-TAC-TOE) KARTI ⭕', targetW / 2, 36);

      const boxW = Math.floor((targetW - 40) / 2);
      const boxH = 160;

      const drawSingleGrid = (bx: number, by: number, label: string) => {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, boxW, boxH);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, bx + boxW / 2, by + 16);

        const gSize = 100;
        const gx = bx + Math.floor((boxW - gSize) / 2);
        const gy = by + 30;
        const step = Math.floor(gSize / 3);

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gx + step, gy); ctx.lineTo(gx + step, gy + gSize);
        ctx.moveTo(gx + step * 2, gy); ctx.lineTo(gx + step * 2, gy + gSize);
        ctx.moveTo(gx, gy + step); ctx.lineTo(gx + gSize, gy + step);
        ctx.moveTo(gx, gy + step * 2); ctx.lineTo(gx + gSize, gy + step * 2);
        ctx.stroke();
      };

      drawSingleGrid(15, 60, 'Oyun #1');
      drawSingleGrid(targetW / 2 + 5, 60, 'Oyun #2');
      drawSingleGrid(15, 235, 'Oyun #3');
      drawSingleGrid(targetW / 2 + 5, 235, 'Oyun #4');

      ctx.fillStyle = '#000000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('iPrint Pro • Eğlenceli Rulo Baskısı', targetW / 2, totalH - 14);
    }

    // 10. MATEMATİK ÇARPIM FİŞİ
    else if (selectedGame === 'math_quiz') {
      const totalH = 430;
      canvas.width = targetW;
      canvas.height = totalH;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, totalH);

      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 12, targetW - 24, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📐 ÇARPINIM & MATEMATİK FİŞİ', targetW / 2, 36);

      const nums = [2, 3, 4, 5, 6, 7, 8, 9];
      const baseNum = nums[gameSeed % nums.length];

      let y = 70;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`🎯 ${baseNum}'ler Çarpım Alıştırması`, 20, y);
      y += 20;

      for (let i = 1; i <= 10; i++) {
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`${i}  x  ${baseNum}  =  [      ]`, 25, y);
        y += 24;
      }

      ctx.font = 'italic 11px sans-serif';
      ctx.fillText('Not: Cevapları kutucuklara kurşun kalemle yazınız.', 20, y + 10);

      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('iPrint Pro Mini Öğrenme Kartı', targetW / 2, totalH - 14);
    }

    setPreviewUrl(canvas.toDataURL());
  };

  useEffect(() => {
    renderGameCanvas();
  }, [
    selectedGame,
    gameSeed,
    sudokuDifficulty,
    mazeSize,
    wordSearchSize,
    showAnswerInPrint,
    pageWidth
  ]);

  const handleExecutePrint = (direct: boolean = true) => {
    if (!previewUrl) return;
    setIsGenerating(true);
    try {
      const widthMm = pageWidth >= 576 ? 80 : 57;
      const title = `Zeka-Oyun-${selectedGame.toUpperCase()}`;

      if (direct && onDirectPrint) {
        onDirectPrint(previewUrl, title, widthMm);
      } else if (!direct && onPreviewAndPrint) {
        onPreviewAndPrint(previewUrl, title, widthMm);
      } else {
        onPrintImage(previewUrl, title, widthMm);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const quickGames = [
    { id: 'vault_code', label: 'Şifre', icon: KeyRound },
    { id: 'sudoku', label: 'Sudoku', icon: Grid },
    { id: 'maze', label: 'Labirent', icon: Compass },
    { id: 'word_search', label: 'Kelime', icon: Search },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* 1. Header Bar: Compact, Responsive & Minimalist */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs">
        {/* Left: Back Button */}
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              title="Geri"
              className="rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 px-2.5 cursor-pointer shrink-0"
            >
              <ArrowLeft size={14} className="mr-1" /> Geri
            </Button>
          )}
        </div>

        {/* Right: Quick Game Switcher (Expanding on active) & Fixed Print Button */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Quick Game Mode Pill Group (Expanding Buttons) */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 gap-0.5">
            {quickGames.map((opt) => {
              const isSelected = selectedGame === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedGame(opt.id as any)}
                  title={opt.label}
                  className={`flex items-center gap-1.5 h-7 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap ${
                    isSelected
                      ? 'bg-purple-600 text-white px-2.5 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 px-2'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  {isSelected && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      {opt.label}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Fixed Print Button */}
          <Button
            size="sm"
            onClick={() => handleExecutePrint(true)}
            disabled={!previewUrl || isGenerating}
            className="h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCcw size={13} className="animate-spin" />
                <span className="hidden sm:inline">Yazdırılıyor...</span>
              </>
            ) : (
              <>
                <Printer size={14} />
                <span>Yazdır</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* TAB 1: PREVIEW & PRINT */}
      {activeMainTab === 'preview' && (
        <div className="space-y-4">
          {/* Quick 1-Click Game Selection Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'safe_code', name: '🔒 Kasa Şifresi' },
              { id: 'matrix_iq', name: '🧠 IQ Matrisi' },
              { id: 'sudoku', name: '🔢 Sudoku' },
              { id: 'maze', name: '🌀 Labirent' },
              { id: 'jumble', name: '🔤 Jumble' },
              { id: 'word_search', name: '🔍 Kelime Avı' },
              { id: 'mini_crossword', name: '🧩 Mini Çapraz' },
              { id: 'spot_diff', name: '👀 5 Fark' },
              { id: 'tictactoe', name: '⚔️ 4\'lü XOX' },
              { id: 'math_quiz', name: '📐 Çarpım Fişi' }
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGame(g.id as GameCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedGame === g.id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          <Card className="p-4 rounded-3xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-wrap items-center justify-between w-full max-w-md px-1 gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                <Sparkles size={14} className="text-purple-500" />
                <span>Önizleme ({pageWidth >= 576 ? '80mm' : '58mm'})</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGameSeed(s => s + 1)}
                  className="h-7 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/40 rounded-lg gap-1"
                >
                  <RotateCcw size={12} />
                  Yeni Rastgele Üret
                </Button>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="w-full overflow-x-auto flex justify-center py-2">
              <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-300 dark:border-slate-700 max-w-full min-h-[300px] flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Oyun Kartı Önizleme"
                    className="max-w-full h-auto object-contain block mx-auto rounded shadow-xs"
                  />
                ) : (
                  <div className="text-xs text-slate-400 font-medium animate-pulse">
                    Oyun grafiği oluşturuluyor...
                  </div>
                )}
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <Button
                size="lg"
                onClick={() => handleExecutePrint(true)}
                disabled={!previewUrl || isGenerating}
                className="h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md gap-2 cursor-pointer disabled:opacity-50"
              >
                <Printer size={18} />
                {isGenerating ? 'Hazırlanıyor...' : 'Yazdır'}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => handleExecutePrint(false)}
                disabled={!previewUrl || isGenerating}
                className="h-12 rounded-2xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold gap-2 text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs"
              >
                <Eye size={18} className="text-purple-500" />
                Önizle
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: GAMES CATALOG (Store-Like Visual Game Browser) */}
      {activeMainTab === 'games' && (
        <div className="space-y-4">
          <Card className="p-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Dices size={18} className="text-purple-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Zeka Oyunları Kataloğu
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Oynamak istediğiniz oyunu seçin, doğrudan termal kağıda basılabilir formata dönüşsün.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameSeed(s => s + 1)}
                className="h-8 text-xs font-bold rounded-xl border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                Yeni Rastgele Üret
              </Button>
            </div>

            {/* Store-Like Visual Game Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: 'safe_code',
                  title: 'Kasa Şifresi',
                  category: 'Mantık & Sayısal',
                  badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                  icon: KeyRound,
                  iconBg: 'bg-purple-600',
                  desc: '3 basamaklı gizli şifreyi 5 sayısal ipucuyla çözme mantık oyunu.'
                },
                {
                  id: 'matrix_iq',
                  title: 'IQ Matrisi',
                  category: 'Görsel Zeka',
                  badgeColor: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                  icon: Brain,
                  iconBg: 'bg-indigo-600',
                  desc: '3x3 geometrik matristeki soru işaretli eksik parçayı bulma testi.'
                },
                {
                  id: 'sudoku',
                  title: '9x9 Sudoku',
                  category: 'Klasik Sayısal',
                  badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                  icon: Grid,
                  iconBg: 'bg-blue-600',
                  desc: 'Tek çözümlü, 4 zorluk seviyesine sahip gerçek mantıksal 9x9 Sudoku.'
                },
                {
                  id: 'maze',
                  title: 'Labirent (Maze)',
                  category: 'Yol Bulma',
                  badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                  icon: Compass,
                  iconBg: 'bg-emerald-600',
                  desc: 'Girişten çıkışa giden tek yolu bulabileceğiniz prosedürel labirent.'
                },
                {
                  id: 'jumble',
                  title: 'Jumble',
                  category: 'Kelime Bulmaca',
                  badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                  icon: FileText,
                  iconBg: 'bg-amber-600',
                  desc: 'Karışık harflerden anlamlı kelimeler türetip ana şifreyi çözme.'
                },
                {
                  id: 'word_search',
                  title: 'Kelime Avı',
                  category: 'Görsel Arama',
                  badgeColor: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
                  icon: Search,
                  iconBg: 'bg-teal-600',
                  desc: 'Izgara içine gizlenmiş tematik kelimeleri bulma ve işaretleme.'
                },
                {
                  id: 'mini_crossword',
                  title: 'Mini Çapraz',
                  category: '5x5 Çengel',
                  badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                  icon: Grid,
                  iconBg: 'bg-rose-600',
                  desc: '5x5 mini karede soldan sağa ve yukarıdan aşağıya çapraz bulmaca.'
                },
                {
                  id: 'spot_diff',
                  title: 'Görsel Dedektif',
                  category: '5 Mikro Fark',
                  badgeColor: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
                  icon: Eye,
                  iconBg: 'bg-orange-600',
                  desc: 'İki piksel görseli arasındaki gizlenmiş 5 farkı bulma oyunu.'
                },
                {
                  id: 'tictactoe',
                  title: "4'lü XOX Kartı",
                  category: '2 Kişilik',
                  badgeColor: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
                  icon: Hash,
                  iconBg: 'bg-violet-600',
                  desc: 'Arkadaşınızla oynayabileceğiniz 4 adet XOX ızgarası içeren oyun fişi.'
                },
                {
                  id: 'math_quiz',
                  title: 'Çarpım Fişi',
                  category: 'Matematik Kartı',
                  badgeColor: 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
                  icon: Calculator,
                  iconBg: 'bg-pink-600',
                  desc: 'Çocuklar ve öğrenciler için günlük 20 soruluk çarpım tablosu fişi.'
                }
              ].map((g) => {
                const isSelected = selectedGame === g.id;
                const IconComp = g.icon;
                return (
                  <div
                    key={g.id}
                    onClick={() => {
                      setSelectedGame(g.id as GameCategory);
                      setActiveMainTab('preview');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-500/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className={`w-10 h-10 rounded-xl ${g.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                        <IconComp size={20} />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${g.badgeColor}`}>
                        {g.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {g.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {g.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      <span>{isSelected ? '✓ Seçili' : 'Seç ve Önizle'}</span>
                      <span className="text-xs">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeMainTab === 'settings' && (
        <div className="space-y-4">
          <Card className="p-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Settings size={16} className="text-purple-500" />
              Zorluk & Ayarlar
            </h3>

            {/* Contextual Options for Selected Game */}
            <div className="space-y-4">
              {selectedGame === 'sudoku' && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Sudoku Zorluk Derecesi:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['easy', 'medium', 'hard', 'expert'] as SudokuDifficulty[]).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSudokuDifficulty(diff)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border capitalize transition-all cursor-pointer ${
                          sudokuDifficulty === diff
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {diff === 'easy' ? 'Kolay' : diff === 'medium' ? 'Orta' : diff === 'hard' ? 'Zor' : 'Uzman'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedGame === 'maze' && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Labirent Karmaşıklığı (Izgara Boyutu):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[13, 17, 21].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setMazeSize(sz)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          mazeSize === sz
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {sz === 13 ? 'Kısa (13x13)' : sz === 17 ? 'Standart (17x17)' : 'Geniş (21x21)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedGame === 'word_search' && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Kelime Avı Izgara Ölçüsü:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[8, 10].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setWordSearchSize(sz)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          wordSearchSize === sz
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {sz}x{sz} Izgara
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Key Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-purple-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Ters Baş Aşağı Çözüm Anahtarı
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Çıktının altına katlama çizgisi ile ters basılan şifre anahtarı
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnswerInPrint(!showAnswerInPrint)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    showAnswerInPrint
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {showAnswerInPrint ? '✓ Açık' : '✗ Kapalı'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* FLOATING BOTTOM CAPSULE NAVIGATION BAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 select-none max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => setActiveMainTab('preview')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeMainTab === 'preview'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Baskı Önizleme"
        >
          <Eye size={15} className="shrink-0" />
          {activeMainTab === 'preview' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Önizleme</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('games')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeMainTab === 'games'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Oyun Kataloğu"
        >
          <Gamepad2 size={15} className="shrink-0" />
          {activeMainTab === 'games' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Oyunlar</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('settings')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeMainTab === 'settings'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Oyun Ayarları"
        >
          <Settings size={15} className="shrink-0" />
          {activeMainTab === 'settings' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Ayarlar</span>
          )}
        </button>
      </div>
    </div>
  );
};
