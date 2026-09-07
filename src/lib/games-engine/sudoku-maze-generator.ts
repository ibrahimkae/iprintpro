// Prosedürel 9x9 Sudoku ve Termal Labirent (Maze) Motoru

export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuPuzzle {
  id: string;
  difficulty: SudokuDifficulty;
  grid: number[][]; // 9x9 with 0 for blanks
  solution: number[][]; // 9x9 complete
}

export interface MazeCell {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  visited: boolean;
}

export interface MazePuzzle {
  id: string;
  cols: number;
  rows: number;
  grid: MazeCell[][];
  start: { x: number; y: number };
  end: { x: number; y: number };
  solutionPath: Array<{ x: number; y: number }>;
}

// -------------------------------------------------------------
// 1. SUDOKU GENERATION & SOLVER (Backtracking + Band Shuffling)
// -------------------------------------------------------------

const BASE_SUDOKU_GRID = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

function pseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateSudoku(seed: number = 1, difficulty: SudokuDifficulty = 'easy'): SudokuPuzzle {
  const rand = pseudoRandom(seed + 100);

  // 1. Permute numbers (1..9 map)
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  const solution: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const orig = BASE_SUDOKU_GRID[r][c];
      solution[r][c] = nums[orig - 1];
    }
  }

  // 2. Shuffle row bands and col bands
  for (let block = 0; block < 3; block++) {
    const r1 = block * 3 + Math.floor(rand() * 3);
    const r2 = block * 3 + Math.floor(rand() * 3);
    if (r1 !== r2) {
      [solution[r1], solution[r2]] = [solution[r2], solution[r1]];
    }
  }

  // 3. Remove numbers according to difficulty
  let cluesToKeep = 42;
  if (difficulty === 'medium') cluesToKeep = 34;
  if (difficulty === 'hard') cluesToKeep = 29;
  if (difficulty === 'expert') cluesToKeep = 24;

  const puzzleGrid: number[][] = solution.map(row => [...row]);
  const cells: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      cells.push({ r, c });
    }
  }

  // Shuffle cells
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const removeCount = 81 - cluesToKeep;
  for (let i = 0; i < removeCount; i++) {
    const { r, c } = cells[i];
    puzzleGrid[r][c] = 0;
  }

  return {
    id: `sudoku-${difficulty}-${seed}`,
    difficulty,
    grid: puzzleGrid,
    solution
  };
}

// -------------------------------------------------------------
// 2. RECURSIVE BACKTRACKER MAZE GENERATOR
// -------------------------------------------------------------

export function generateMaze(cols: number = 15, rows: number = 15, seed: number = 1): MazePuzzle {
  const rand = pseudoRandom(seed + 500);

  const grid: MazeCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
      visited: false
    }))
  );

  const stack: Array<{ x: number; y: number }> = [];
  const start = { x: 0, y: 0 };
  const end = { x: cols - 1, y: rows - 1 };

  grid[start.y][start.x].visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: Array<{ x: number; y: number; dir: 'top' | 'right' | 'bottom' | 'left' }> = [];

    const { x, y } = current;

    // Top
    if (y > 0 && !grid[y - 1][x].visited) neighbors.push({ x, y: y - 1, dir: 'top' });
    // Right
    if (x < cols - 1 && !grid[y][x + 1].visited) neighbors.push({ x: x + 1, y, dir: 'right' });
    // Bottom
    if (y < rows - 1 && !grid[y + 1][x].visited) neighbors.push({ x, y: y + 1, dir: 'bottom' });
    // Left
    if (x > 0 && !grid[y - 1]?.[x] && !grid[y][x - 1].visited) neighbors.push({ x: x - 1, y, dir: 'left' });

    if (neighbors.length > 0) {
      // Pick random neighbor
      const nextIdx = Math.floor(rand() * neighbors.length);
      const next = neighbors[nextIdx];

      // Knock down walls between current and next
      if (next.dir === 'top') {
        grid[y][x].top = false;
        grid[next.y][next.x].bottom = false;
      } else if (next.dir === 'right') {
        grid[y][x].right = false;
        grid[next.y][next.x].left = false;
      } else if (next.dir === 'bottom') {
        grid[y][x].bottom = false;
        grid[next.y][next.x].top = false;
      } else if (next.dir === 'left') {
        grid[y][x].left = false;
        grid[next.y][next.x].right = false;
      }

      grid[next.y][next.x].visited = true;
      stack.push({ x: next.x, y: next.y });
    } else {
      stack.pop();
    }
  }

  // Open entry and exit
  grid[0][0].top = false;
  grid[rows - 1][cols - 1].bottom = false;

  // Compute BFS Solution Path from Start to End
  const queue: Array<{ x: number; y: number; path: Array<{ x: number; y: number }> }> = [
    { x: 0, y: 0, path: [{ x: 0, y: 0 }] }
  ];
  const seen: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  seen[0][0] = true;
  let solutionPath: Array<{ x: number; y: number }> = [];

  while (queue.length > 0) {
    const { x, y, path } = queue.shift()!;
    if (x === end.x && y === end.y) {
      solutionPath = path;
      break;
    }

    const cell = grid[y][x];

    // Check 4 directions without walls
    if (!cell.top && y > 0 && !seen[y - 1][x]) {
      seen[y - 1][x] = true;
      queue.push({ x, y: y - 1, path: [...path, { x, y: y - 1 }] });
    }
    if (!cell.right && x < cols - 1 && !seen[y][x + 1]) {
      seen[y][x + 1] = true;
      queue.push({ x: x + 1, y, path: [...path, { x: x + 1, y }] });
    }
    if (!cell.bottom && y < rows - 1 && !seen[y + 1][x]) {
      seen[y + 1][x] = true;
      queue.push({ x, y: y + 1, path: [...path, { x, y: y + 1 }] });
    }
    if (!cell.left && x > 0 && !seen[y][x - 1]) {
      seen[y][x - 1] = true;
      queue.push({ x: x - 1, y, path: [...path, { x: x - 1, y }] });
    }
  }

  return {
    id: `maze-${cols}x${rows}-${seed}`,
    cols,
    rows,
    grid,
    start,
    end,
    solutionPath
  };
}
