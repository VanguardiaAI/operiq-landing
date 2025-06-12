import { cn } from "@/lib/utils";

export function RetroMapGrid({
  className,
  angle = 65,
}: {
  className?: string;
  angle?: number;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 w-full h-full overflow-hidden opacity-80 [perspective:200px]",
        className,
      )}
      style={{ "--grid-angle": `${angle}deg` } as React.CSSProperties}
    >
      {/* Cuadrícula tipo mapa */}
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className={cn(
            "[background-repeat:repeat] [background-size:80px_80px] [height:300vh] [margin-left:-50%] [width:600vw]",
            "[background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_0)]"
          )}
        />
      </div>
      {/* Gradiente oscuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
      {/* Línea de ruta naranja */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 800 300" fill="none">
        <polyline
          points="0,50 300,200 500,100 650,150"
          stroke="#000000"
          strokeWidth="6"
          fill="none"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 10px #000000aa)" }}
        />
        <circle cx="650" cy="150" r="16" fill="#000000" opacity="0.5" />
        <circle cx="650" cy="150" r="8" fill="#000000" />
      </svg>
    </div>
  );
} 