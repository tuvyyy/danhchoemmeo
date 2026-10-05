/** Coordinates follow the inner reveal of the photographed, slightly asymmetric arch. */
export const GATE = { width: 510, height: 767, leftPivot: 12, rightPivot: 498, angle: 68 };

export type IronPath = { d: string; width: number; stock?: 'flat' | 'round' };

export function gateLeafPaths(side: 'left' | 'right'): IronPath[] {
  const left = side === 'left';
  // Each leaf is drawn in its own hinge coordinates, positive x towards the latch.
  const crown = left
    ? 'M0 212C0 108 133 16 239 14'
    : 'M0 194C-2 80 97 6 239 14';
  const inner = left
    ? 'M12 212C12 115 137 29 228 27'
    : 'M12 194C10 88 101 19 228 27';
  const paths: IronPath[] = [
    { d: `${crown}V759H0Z`, width: 8, stock: 'flat' },
    { d: `${inner}V747H12V${left ? 212 : 194}`, width: 2.6 },
    { d: 'M0 230H239M0 512H239M0 729H239', width: 6, stock: 'flat' },
    { d: 'M0 250H239', width: 3.2, stock: 'flat' },
  ];
  const cubic = (a: number, b: number, c: number, d: number, t: number) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;
  [38, 78, 118, 158, 198].forEach(x => {
    let low = 0, high = 1;
    for (let i = 0; i < 20; i++) {
      const t = (low + high) / 2;
      if (cubic(0, left ? 0 : -2, left ? 133 : 97, 239, t) < x) low = t;
      else high = t;
    }
    const top = cubic(left ? 212 : 194, left ? 108 : 80, left ? 16 : 6, 14, (low + high) / 2);
    paths.push({ d: `M${x} ${top.toFixed(3)}V729`, width: 3.8 });
    paths.push({ d: `M${x - 5} 250h10`, width: 3.2 });
  });
  // Curled straps are welded to the bars and waist rail, rather than floating motifs.
  paths.push(
    { d: 'M118 434V319C97 307 80 294 81 278C82 265 99 266 99 277C99 285 88 286 89 278M118 319C139 307 156 294 155 278C154 265 137 266 137 277C137 285 148 286 147 278', width: 3.5 },
    { d: 'M118 318C103 304 103 274 118 260C133 274 133 304 118 318Z', width: 3.2 },
    { d: 'M38 363C51 341 78 348 74 365C71 378 55 372 58 363M198 363C185 341 158 348 162 365C165 378 181 372 178 363', width: 3.2 },
    { d: 'M78 512C78 479 103 466 118 451C133 466 158 479 158 512', width: 3.4 },
    { d: 'M38 729C38 693 67 674 78 647C89 674 118 693 118 729M118 729C118 693 147 674 158 647C169 674 198 693 198 729', width: 3.4 },
  );
  return paths;
}
