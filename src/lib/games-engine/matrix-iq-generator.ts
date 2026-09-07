// Eksik Parçayı Bul (IQ Matrisi / Raven's Progressive Matrix) Motoru

export type MatrixRuleType = 'rotation' | 'addition' | 'dot_movement' | 'shading' | 'shape_morph';

export interface MatrixOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
  isCorrect: boolean;
}

export interface MatrixIQPuzzle {
  id: string;
  title: string;
  ruleType: MatrixRuleType;
  ruleDescription: string;
  correctOption: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  // 8 cells: index 0..7 are cells (0..2 row 1, 3..5 row 2, 6..7 row 3 first two)
  cells: Array<(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void>;
  options: MatrixOption[];
}

// Drawing helper routines
function drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: boolean = false) {
  const pad = size * 0.2;
  ctx.lineWidth = 2;
  if (fill) {
    ctx.fillRect(x + pad, y + pad, size - pad * 2, size - pad * 2);
  } else {
    ctx.strokeRect(x + pad, y + pad, size - pad * 2, size - pad * 2);
  }
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: boolean = false) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.3;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  if (fill) ctx.fill();
  else ctx.stroke();
}

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angleDeg: number = 0, fill: boolean = false) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.32;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.866, r * 0.5);
  ctx.lineTo(-r * 0.866, r * 0.5);
  ctx.closePath();
  ctx.lineWidth = 2;
  if (fill) ctx.fill();
  else ctx.stroke();
  ctx.restore();
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angleDeg: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const len = size * 0.32;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, len);
  ctx.lineTo(0, -len);
  ctx.stroke();
  // Arrow head
  ctx.beginPath();
  ctx.moveTo(-len * 0.45, -len * 0.35);
  ctx.lineTo(0, -len);
  ctx.lineTo(len * 0.45, -len * 0.35);
  ctx.stroke();
  ctx.restore();
}

function drawPieQuadrant(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, activeQuadrant: number) {
  // activeQuadrant: 0=top-right, 1=bottom-right, 2=bottom-left, 3=top-left
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.32;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // Cross dividers
  ctx.beginPath();
  ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
  ctx.stroke();

  // Fill specified quadrant
  const startAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const a1 = startAngles[activeQuadrant % 4];
  const a2 = a1 + Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, a1, a2);
  ctx.closePath();
  ctx.fill();
}

function drawDotGrid(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, activePositions: number[]) {
  const pad = size * 0.22;
  const step = (size - pad * 2) / 2;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const px = x + pad + c * step;
      const py = y + pad + r * step;
      ctx.beginPath();
      if (activePositions.includes(idx)) {
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

export function generateMatrixIQPuzzle(seed: number = 1): MatrixIQPuzzle {
  const puzzles: MatrixIQPuzzle[] = [
    // Puzzle 1: Pie Quadrant Clockwise Rotation
    {
      id: 'matrix-rot-pie',
      title: 'Dönen Çeyrek Dilim Deseni',
      ruleType: 'rotation',
      ruleDescription: 'Her satırda dolu çeyrek dilim saat yönünde 90° ilerlemektedir.',
      correctOption: 'C',
      explanation: '3. Satırda: 1. hücre sol-alt (2), 2. hücre sol-üst (3) -> 3. hücre sağ-üst (0) olmalıdır (C şıkkı).',
      cells: [
        (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 0), // Row 1: 0 -> 1 -> 2
        (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 1),
        (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 2),
        (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 1), // Row 2: 1 -> 2 -> 3
        (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 2),
        (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 3),
        (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 2), // Row 3: 2 -> 3 -> ? (0)
        (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 3)
      ],
      options: [
        { id: 'A', draw: (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 2), isCorrect: false },
        { id: 'B', draw: (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 1), isCorrect: false },
        { id: 'C', draw: (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 0), isCorrect: true },
        { id: 'D', draw: (ctx, x, y, s) => drawPieQuadrant(ctx, x, y, s, 3), isCorrect: false }
      ]
    },

    // Puzzle 2: Arrow Vector 45° Step
    {
      id: 'matrix-rot-arrow',
      title: 'Açısal Yön Vektör Matrisi',
      ruleType: 'rotation',
      ruleDescription: 'Satır boyunca oklar saat yönünde 45° döner.',
      correctOption: 'B',
      explanation: '3. Satırda: 1. hücre Güney (180°), 2. hücre Güneybatı (225°) -> 3. hücre Batı (270°) olmalıdır (B şıkkı).',
      cells: [
        (ctx, x, y, s) => drawArrow(ctx, x, y, s, 0),   // Kuzey
        (ctx, x, y, s) => drawArrow(ctx, x, y, s, 45),  // Kuzeydoğu
        (ctx, x, y, s) => drawArrow(ctx, x, y, s, 90),  // Doğu
        (ctx, x, y, s) => drawArrow(ctx, x, y, s, 90),  // Doğu
        (ctx, x, y, s) => drawArrow(ctx, x, y, s, 135), // Güneydoğu
        (ctx, x, y, s) => drawArrow(ctx, x, y, s, 180), // Güney
        (ctx, x, y, s) => drawArrow(ctx, x, y, s, 180), // Güney
        (ctx, x, y, s) => drawArrow(ctx, x, y, s, 225)  // Güneybatı -> Sırada 270 (Batı)
      ],
      options: [
        { id: 'A', draw: (ctx, x, y, s) => drawArrow(ctx, x, y, s, 315), isCorrect: false },
        { id: 'B', draw: (ctx, x, y, s) => drawArrow(ctx, x, y, s, 270), isCorrect: true },
        { id: 'C', draw: (ctx, x, y, s) => drawArrow(ctx, x, y, s, 0), isCorrect: false },
        { id: 'D', draw: (ctx, x, y, s) => drawArrow(ctx, x, y, s, 135), isCorrect: false }
      ]
    },

    // Puzzle 3: Perimeter Dot Movement
    {
      id: 'matrix-dot-move',
      title: 'Çevre Boyu Nokta Hareketi',
      ruleType: 'dot_movement',
      ruleDescription: 'Nokta mini ızgaranın dış çevresinde her adımda 1 birim saat yönünde ilerler.',
      correctOption: 'A',
      explanation: '3. Satırda nokta sol-alt (6) ve alt-orta (7) noktalarından sonra sağ-alt köşeye (8) ulaşır (A şıkkı).',
      cells: [
        (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [0]),
        (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [1]),
        (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [2]),
        (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [3]),
        (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [4]),
        (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [5]),
        (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [6]),
        (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [7])
      ],
      options: [
        { id: 'A', draw: (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [8]), isCorrect: true },
        { id: 'B', draw: (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [0]), isCorrect: false },
        { id: 'C', draw: (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [4]), isCorrect: false },
        { id: 'D', draw: (ctx, x, y, s) => drawDotGrid(ctx, x, y, s, [2]), isCorrect: false }
      ]
    },

    // Puzzle 4: Shape Morph & Fill progression
    {
      id: 'matrix-shape-morph',
      title: 'Geometrik Şekil & Dolgu Sıralaması',
      ruleType: 'shape_morph',
      ruleDescription: 'Her satır ve sütunda bir Daire, bir Kare, bir Üçgen bulunur. 3. satır içi dolu formdur.',
      correctOption: 'D',
      explanation: '3. Satırda Daire (dolu) ve Kare (dolu) mevcuttur. Eksik olan parça Dolu Üçgendir (D şıkkı).',
      cells: [
        (ctx, x, y, s) => drawCircle(ctx, x, y, s, false),
        (ctx, x, y, s) => drawSquare(ctx, x, y, s, false),
        (ctx, x, y, s) => drawTriangle(ctx, x, y, s, 0, false),
        (ctx, x, y, s) => drawSquare(ctx, x, y, s, false),
        (ctx, x, y, s) => drawTriangle(ctx, x, y, s, 0, false),
        (ctx, x, y, s) => drawCircle(ctx, x, y, s, false),
        (ctx, x, y, s) => drawTriangle(ctx, x, y, s, 0, true),
        (ctx, x, y, s) => drawCircle(ctx, x, y, s, true)
      ],
      options: [
        { id: 'A', draw: (ctx, x, y, s) => drawSquare(ctx, x, y, s, false), isCorrect: false },
        { id: 'B', draw: (ctx, x, y, s) => drawCircle(ctx, x, y, s, true), isCorrect: false },
        { id: 'C', draw: (ctx, x, y, s) => drawTriangle(ctx, x, y, s, 0, false), isCorrect: false },
        { id: 'D', draw: (ctx, x, y, s) => drawSquare(ctx, x, y, s, true), isCorrect: true }
      ]
    }
  ];

  const index = Math.abs(seed) % puzzles.length;
  return puzzles[index];
}
