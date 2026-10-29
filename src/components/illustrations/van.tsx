import type { BodyType, Palette } from "@/modules/vehicles/types";

/**
 * Płaskie ilustracje wektorowe aut (widok z boku, przodem w prawo) – kolor
 * pochodzi wyłącznie z ilustracji, zgodnie z systemem projektowym. Docelowo
 * zastępowane zdjęciami z panelu admina, ale zostają jako awaryjny placeholder.
 */

type Colors = { body: string; shade: string };

const PALETTE: Record<Palette, Colors> = {
  orange: { body: "#E8672B", shade: "#B9501F" },
  teal: { body: "#1D6F78", shade: "#14515A" },
  cobalt: { body: "#2E55D3", shade: "#2140A2" },
  sand: { body: "#D8B07A", shade: "#B58D57" },
  brown: { body: "#8C5A3C", shade: "#6A4129" },
};

const GROUND = 150;
const AXLE_Y = 128;
const BOTTOM = 124;
const FRONT = 296;

/** Geometria nadwozia: początek skrzyni, wysokość dachu, szerokość kabiny. */
const GEOMETRY: Record<BodyType, { x0: number; roofY: number; cabW: number }> = {
  compact: { x0: 62, roofY: 62, cabW: 86 },
  panel: { x0: 36, roofY: 42, cabW: 84 },
  "panel-long": { x0: 10, roofY: 34, cabW: 84 },
  luton: { x0: 12, roofY: 64, cabW: 84 },
};

/** Zwykła funkcja (nie komponent): generator OG dopuszcza w <svg> tylko elementy natywne. */
function wheel(cx: number) {
  return (
    <g>
      <circle cx={cx} cy={AXLE_Y} r={27} fill="#1a1a1a" />
      <circle cx={cx} cy={AXLE_Y} r={22} fill="#2b2b2b" />
      <circle cx={cx} cy={AXLE_Y} r={12} fill="#d9d9d9" />
      <circle cx={cx} cy={AXLE_Y} r={4} fill="#8a8a8a" />
    </g>
  );
}

/** Same kształty (bez <svg>) – można je osadzać w większych scenach. */
export function VanShapes({ body, palette }: { body: BodyType; palette: Palette }) {
  const { x0, roofY, cabW } = GEOMETRY[body];
  const colors = PALETTE[palette];
  const c = FRONT - cabW; // początek kabiny
  const k = (BOTTOM - roofY) / (BOTTOM - 42); // skala pionowa kabiny względem furgonu
  const y = (offset: number) => Math.round((roofY + offset * k) * 10) / 10;
  const isLuton = body === "luton";

  const cabPath = [
    `M ${x0} ${BOTTOM}`,
    `L ${x0} ${roofY + 10}`,
    `Q ${x0} ${roofY} ${x0 + 10} ${roofY}`,
    `L ${c} ${roofY}`,
    `Q ${c + 14} ${roofY} ${c + 24} ${y(12)}`,
    `L ${c + 50} ${y(46)}`,
    `Q ${c + 58} ${y(56)} ${c + 70} ${y(58)}`,
    `Q ${FRONT} ${y(62)} ${FRONT} ${y(76)}`,
    `L ${FRONT} ${BOTTOM}`,
    "Z",
  ].join(" ");

  const rearWheel = x0 + 52;
  const frontWheel = FRONT - 52;
  const cargoEnd = c - 6;

  return (
    <g>
      <ellipse cx={(x0 + FRONT) / 2} cy={GROUND + 1} rx={(FRONT - x0) / 2 + 8} ry={5} fill="#000" opacity={0.12} />

      {isLuton ? (
        <>
          {/* Zabudowa kontenerowa z „daszkiem" nad kabiną */}
          <path d={cabPath} fill={colors.body} />
          <rect x={x0} y={22} width={c + 34 - x0} height={BOTTOM - 22} rx={7} fill="#F1EDE6" />
          <rect x={x0} y={BOTTOM - 22} width={c + 34 - x0} height={8} fill={colors.body} />
          <rect x={x0} y={22} width={c + 34 - x0} height={6} rx={3} fill={colors.shade} opacity={0.35} />
          {/* Winda załadowcza */}
          <rect x={x0 - 12} y={BOTTOM - 8} width={18} height={5} rx={1.5} fill="#444" />
          <rect x={x0 - 4} y={BOTTOM - 28} width={3} height={22} fill="#555" />
        </>
      ) : (
        <>
          <path d={cabPath} fill={colors.body} />
          <rect x={x0} y={BOTTOM - 22} width={c - x0} height={8} fill={colors.shade} opacity={0.55} />
          {/* Przesuwne drzwi boczne */}
          <rect
            x={x0 + (c - x0) * 0.34}
            y={roofY + 12}
            width={(c - x0) * 0.4}
            height={BOTTOM - roofY - 38}
            rx={4}
            fill="none"
            stroke={colors.shade}
            strokeWidth={2.5}
          />
          <rect
            x={x0 + (c - x0) * 0.34 + (c - x0) * 0.4 - 12}
            y={(roofY + BOTTOM) / 2 - 2}
            width={9}
            height={3}
            rx={1.5}
            fill={colors.shade}
          />
        </>
      )}

      {/* Szyba boczna i klamka drzwi kabiny */}
      <path
        d={`M ${c + 6} ${y(10)} L ${c + 16} ${y(10)} L ${c + 46} ${y(46)} L ${c + 6} ${y(46)} Z`}
        fill="#CFE6EB"
        stroke={colors.shade}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <line x1={c + 4} y1={y(10)} x2={c + 4} y2={BOTTOM - 4} stroke={colors.shade} strokeWidth={2} />
      <rect x={c + 10} y={y(56)} width={10} height={3} rx={1.5} fill={colors.shade} />

      {/* Światła i zderzaki */}
      <rect x={FRONT - 8} y={y(66)} width={9} height={8} rx={2.5} fill="#FFF1B8" />
      <rect x={x0 - 1} y={y(52)} width={4} height={14} rx={1.5} fill="#D6372B" />
      <rect x={FRONT - 16} y={BOTTOM - 8} width={22} height={9} rx={2.5} fill="#2b2b2b" />
      {!isLuton && <rect x={x0 - 6} y={BOTTOM - 8} width={18} height={9} rx={2.5} fill="#2b2b2b" />}

      {wheel(rearWheel)}
      {wheel(frontWheel)}
      {/* Linia podziału zabudowy od kabiny */}
      <line x1={cargoEnd} y1={roofY + (isLuton ? -40 : 4)} x2={cargoEnd} y2={BOTTOM - 26} stroke={colors.shade} strokeWidth={1.5} opacity={0.5} />
    </g>
  );
}

type VanProps = {
  body: BodyType;
  palette: Palette;
  className?: string;
};

/** Samodzielna ilustracja auta (dekoracyjna – ukryta przed czytnikami ekranu). */
export function VanIllustration({ body, palette, className }: VanProps) {
  return (
    <svg
      viewBox="0 0 320 160"
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <VanShapes body={body} palette={palette} />
    </svg>
  );
}
