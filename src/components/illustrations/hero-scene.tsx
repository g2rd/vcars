import { VanShapes } from "./van";

/**
 * Kwadratowa scena do sekcji hero: ciepłe tło, słońce, miejska zabudowa i
 * pomarańczowy furgon na drodze. Płaskie kształty, bez gradientów i zdjęć.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 480"
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="480" height="480" fill="#EFD9B4" />
      <circle cx="370" cy="118" r="58" fill="#E8672B" />
      <circle cx="370" cy="118" r="82" fill="#E8672B" opacity="0.14" />

      {/* Zabudowa w tle */}
      <g>
        <rect x="26" y="206" width="78" height="170" fill="#1D6F78" />
        <rect x="104" y="156" width="62" height="220" fill="#2E55D3" />
        <rect x="166" y="232" width="86" height="144" fill="#8C5A3C" />
        <rect x="252" y="188" width="70" height="188" fill="#1D6F78" />
        <rect x="322" y="246" width="76" height="130" fill="#2E55D3" />
        <rect x="398" y="214" width="62" height="162" fill="#8C5A3C" />
      </g>
      {/* Okna */}
      <g fill="#EFD9B4" opacity="0.85">
        {[0, 1, 2, 3, 4].map((row) =>
          [38, 64].map((x) => <rect key={`a${row}${x}`} x={x} y={222 + row * 30} width="14" height="16" />),
        )}
        {[0, 1, 2, 3, 4, 5].map((row) =>
          [116, 142].map((x) => <rect key={`b${row}${x}`} x={x} y={172 + row * 30} width="14" height="16" />),
        )}
        {[0, 1, 2, 3].map((row) =>
          [178, 204, 230].map((x) => <rect key={`c${row}${x}`} x={x} y={248 + row * 30} width="14" height="16" />),
        )}
        {[0, 1, 2, 3, 4].map((row) =>
          [264, 290].map((x) => <rect key={`d${row}${x}`} x={x} y={204 + row * 30} width="14" height="16" />),
        )}
        {[0, 1, 2].map((row) =>
          [334, 360].map((x) => <rect key={`e${row}${x}`} x={x} y={262 + row * 30} width="14" height="16" />),
        )}
        {[0, 1, 2, 3].map((row) =>
          [410, 434].map((x) => <rect key={`f${row}${x}`} x={x} y={230 + row * 30} width="14" height="16" />),
        )}
      </g>

      {/* Chodnik i droga */}
      <rect y="376" width="480" height="18" fill="#C9AE82" />
      <rect y="394" width="480" height="86" fill="#5B3F2B" />
      <g fill="#EFD9B4">
        {[10, 110, 210, 310, 410].map((x) => (
          <rect key={x} x={x} y="436" width="56" height="6" rx="3" />
        ))}
      </g>

      {/* Furgon (skalowany ze sceny 320×160 do ~400 px szerokości) */}
      <g transform="translate(46 236) scale(1.3)">
        <VanShapes body="panel" palette="orange" />
      </g>
    </svg>
  );
}
