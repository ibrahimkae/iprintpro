// Görsel Dedektif: Termal Baskıya Uygun Mikro 5 Fark (Spot The 5 Differences) Motoru

export interface DifferenceItem {
  id: number;
  description: string;
  x: number;
  y: number;
}

export interface SpotDifferencePuzzle {
  id: string;
  themeTitle: string;
  themeDesc: string;
  drawScene: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isModified: boolean) => void;
  differences: DifferenceItem[];
}

export const SPOT_DIFFERENCE_PRESETS: SpotDifferencePuzzle[] = [
  // 1. Retro Bilgisayar & Arcade Masası
  {
    id: 'spot-arcade-desk',
    themeTitle: 'Retro Piksel Masası & Kedi',
    themeDesc: 'İki görsel arasında tam 5 mikro farkı bul ve daire içine al!',
    differences: [
      { id: 1, description: 'Duvardaki saatin akrep/yelkovan saati farklı', x: 70, y: 35 },
      { id: 2, description: 'Masadaki kahve kupasından çıkan buhar çizgisi yok', x: 260, y: 110 },
      { id: 3, description: 'Monitörün sağındaki disket yuvası eksik', x: 185, y: 95 },
      { id: 4, description: 'Uykucu kedinin kuyruk ucu yönü ters', x: 310, y: 130 },
      { id: 5, description: 'Arka duvardaki posterin içindeki yıldız motifi içi dolu', x: 110, y: 40 }
    ],
    drawScene: (ctx, x, y, w, h, isModified) => {
      ctx.save();
      ctx.translate(x, y);

      // Outer Frame
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // 1. Wall Horizon & Floor Line
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      ctx.lineTo(w, h * 0.7);
      ctx.stroke();

      // Floor plank patterns
      for (let i = 20; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, h * 0.7);
        ctx.lineTo(i - 15, h);
        ctx.stroke();
      }

      // 2. Wall Clock (Diff 1: Clock hands)
      const clockX = 50;
      const clockY = 32;
      ctx.beginPath();
      ctx.arc(clockX, clockY, 14, 0, Math.PI * 2);
      ctx.stroke();
      // Clock center dot
      ctx.beginPath();
      ctx.arc(clockX, clockY, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      if (!isModified) {
        ctx.lineTo(clockX, clockY - 9); // Hand pointing UP
        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX + 8, clockY); // Hand pointing RIGHT (3 o'clock)
      } else {
        ctx.lineTo(clockX - 8, clockY); // Hand pointing LEFT (Diff 1!)
        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX, clockY + 9); // Hand pointing DOWN (Diff 1!)
      }
      ctx.stroke();

      // 3. Wall Poster (Diff 5: Star motif)
      const postX = 90;
      const postY = 15;
      ctx.strokeRect(postX, postY, 36, 44);
      // Star in poster
      ctx.beginPath();
      const sx = postX + 18;
      const sy = postY + 22;
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      if (isModified) {
        ctx.fill(); // Diff 5: Solid filled star/circle
      } else {
        ctx.stroke(); // Hollow circle/star
      }

      // 4. Desk Table
      const deskY = h * 0.55;
      ctx.fillRect(130, deskY, 170, 8); // Desk top
      ctx.strokeRect(145, deskY + 8, 8, h * 0.7 - (deskY + 8)); // Desk Leg Left
      ctx.strokeRect(280, deskY + 8, 8, h * 0.7 - (deskY + 8)); // Desk Leg Right

      // 5. Retro Monitor (CRT)
      const monX = 160;
      const monY = deskY - 54;
      ctx.strokeRect(monX, monY, 65, 48); // Monitor casing
      ctx.strokeRect(monX + 5, monY + 5, 55, 38); // Screen bevel
      // Screen smile face
      ctx.beginPath();
      ctx.arc(monX + 22, monY + 20, 2, 0, Math.PI * 2); // Eye 1
      ctx.arc(monX + 42, monY + 20, 2, 0, Math.PI * 2); // Eye 2
      ctx.fill();
      ctx.beginPath();
      ctx.arc(monX + 32, monY + 24, 8, 0, Math.PI); // Smile
      ctx.stroke();
      // Stand
      ctx.fillRect(monX + 26, deskY - 6, 12, 6);

      // Floppy Disk Slot (Diff 3: Missing on modified)
      if (!isModified) {
        ctx.fillRect(monX + 70, deskY - 30, 4, 18);
        ctx.strokeRect(monX + 68, deskY - 34, 8, 26);
      }

      // 6. Keyboard
      ctx.strokeRect(165, deskY + 2, 45, 6);

      // 7. Coffee Mug on Desk (Diff 2: Steam line)
      const mugX = 245;
      const mugY = deskY - 18;
      ctx.strokeRect(mugX, mugY, 14, 18);
      ctx.beginPath();
      ctx.arc(mugX + 14, mugY + 9, 4, -Math.PI / 2, Math.PI / 2); // Handle
      ctx.stroke();

      if (!isModified) {
        // Steam squiggles (Diff 2)
        ctx.beginPath();
        ctx.moveTo(mugX + 4, mugY - 2);
        ctx.quadraticCurveTo(mugX + 8, mugY - 8, mugX + 4, mugY - 14);
        ctx.moveTo(mugX + 10, mugY - 2);
        ctx.quadraticCurveTo(mugX + 14, mugY - 8, mugX + 10, mugY - 14);
        ctx.stroke();
      }

      // 8. Sleeping Cat on Floor (Diff 4: Tail direction)
      const catX = w - 45;
      const catY = h * 0.7 - 8;
      // Body
      ctx.beginPath();
      ctx.ellipse(catX, catY, 18, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Head & Ears
      ctx.beginPath();
      ctx.arc(catX - 16, catY - 2, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(catX - 22, catY - 8); ctx.lineTo(catX - 20, catY - 15); ctx.lineTo(catX - 16, catY - 9);
      ctx.moveTo(catX - 15, catY - 9); ctx.lineTo(catX - 11, catY - 15); ctx.lineTo(catX - 10, catY - 8);
      ctx.stroke();

      // Tail
      ctx.beginPath();
      if (!isModified) {
        ctx.moveTo(catX + 16, catY);
        ctx.quadraticCurveTo(catX + 26, catY - 14, catX + 18, catY - 22); // Tail curled UP
      } else {
        ctx.moveTo(catX + 16, catY);
        ctx.quadraticCurveTo(catX + 26, catY + 6, catX + 18, catY + 12); // Tail pointing DOWN (Diff 4!)
      }
      ctx.stroke();

      ctx.restore();
    }
  },

  // 2. Uzay Üssü & Astronot Kabini
  {
    id: 'spot-space-station',
    themeTitle: 'Uzay Üssü & Yıldızlararası Keşif',
    themeDesc: 'İki astronot kabini arasındaki 5 gizli farkı keşfet!',
    differences: [
      { id: 1, description: 'Lombar penceresinden görünen Satürn halkası eksik', x: 80, y: 45 },
      { id: 2, description: 'Kontrol panelindeki 3. anahtar aşağı konumda', x: 190, y: 115 },
      { id: 3, description: 'Astronot kaskındaki parlama deseni yok', x: 260, y: 65 },
      { id: 4, description: 'Sol duvardaki oksijen basınç göstergesinin ibresi kırmızıda (sağda)', x: 45, y: 70 },
      { id: 5, description: 'Üst tavandaki yedek anten sinyal halkası eksik', x: 310, y: 25 }
    ],
    drawScene: (ctx, x, y, w, h, isModified) => {
      ctx.save();
      ctx.translate(x, y);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);

      // Circular Space Window (Lombar)
      const winX = 65;
      const winY = 48;
      ctx.beginPath();
      ctx.arc(winX, winY, 28, 0, Math.PI * 2);
      ctx.stroke();

      // Planet Saturn inside window
      ctx.beginPath();
      ctx.arc(winX + 4, winY + 2, 10, 0, Math.PI * 2);
      ctx.fill();

      if (!isModified) {
        // Saturn Ring (Diff 1)
        ctx.beginPath();
        ctx.ellipse(winX + 4, winY + 2, 20, 5, -0.4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Stars in window
      ctx.fillRect(winX - 16, winY - 14, 2, 2);
      ctx.fillRect(winX + 16, winY - 12, 2, 2);
      ctx.fillRect(winX - 12, winY + 14, 2, 2);

      // Wall Pressure Gauge (Diff 4: Needle)
      const gX = 25;
      const gY = 100;
      ctx.beginPath();
      ctx.arc(gX, gY, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gX, gY);
      if (!isModified) {
        ctx.lineTo(gX - 8, gY - 6); // Needle UP-LEFT
      } else {
        ctx.lineTo(gX + 8, gY - 6); // Needle UP-RIGHT (Diff 4!)
      }
      ctx.stroke();

      // Center Control Console
      ctx.strokeRect(120, h * 0.55, 120, 45);
      // Toggle switches (Diff 2)
      for (let s = 0; s < 4; s++) {
        const swX = 135 + s * 25;
        const swY = h * 0.55 + 15;
        ctx.strokeRect(swX, swY, 12, 20);
        ctx.beginPath();
        if (s === 2 && isModified) {
          // Switch Down (Diff 2!)
          ctx.fillRect(swX + 2, swY + 10, 8, 8);
        } else {
          // Switch Up
          ctx.fillRect(swX + 2, swY + 2, 8, 8);
        }
      }

      // Astronaut Figure on Right
      const aX = w - 60;
      const aY = 65;
      // Helmet
      ctx.beginPath();
      ctx.arc(aX, aY, 22, 0, Math.PI * 2);
      ctx.stroke();
      // Visor
      ctx.beginPath();
      ctx.ellipse(aX - 2, aY, 14, 10, 0, 0, Math.PI * 2);
      ctx.stroke();

      if (!isModified) {
        // Visor Glare (Diff 3)
        ctx.beginPath();
        ctx.moveTo(aX - 8, aY - 6);
        ctx.lineTo(aX - 2, aY - 6);
        ctx.moveTo(aX - 6, aY - 2);
        ctx.lineTo(aX + 2, aY - 2);
        ctx.stroke();
      }

      // Spacesuit Body
      ctx.strokeRect(aX - 20, aY + 22, 40, 50);

      // Top Ceiling Antenna / Radar (Diff 5)
      const radX = w - 40;
      const radY = 14;
      ctx.strokeRect(radX, radY, 8, 12);
      if (!isModified) {
        // Radar Waves (Diff 5)
        ctx.beginPath();
        ctx.arc(radX + 4, radY, 6, Math.PI, 0);
        ctx.arc(radX + 4, radY, 12, Math.PI, 0);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
];
