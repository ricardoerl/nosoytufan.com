// Pixelated broken heart (14×12 grid). Left half drops 1px, right half shifts 1px right.
export const HEART_LEFT =
  "M2 0h3v1h-3zM1 1h5v1h-5zM0 2h6v1h-6zM0 3h5v1h-5zM0 4h6v1h-6zM1 5h6v1h-6zM2 6h4v1h-4zM3 7h2v1h-2zM4 8h2v1h-2zM5 9h1v1h-1zM6 10h1v1h-1z";
export const HEART_RIGHT =
  "M8 0h3v1h-3zM7 1h5v1h-5zM7 2h6v1h-6zM6 3h7v1h-7zM7 4h6v1h-6zM8 5h4v1h-4zM7 6h4v1h-4zM6 7h4v1h-4zM7 8h2v1h-2zM7 9h1v1h-1z";

export function LogoMark({ width = 42, fill = "#FF007F", className }: { width?: number; fill?: string; className?: string }) {
  return (
    <svg
      width={width}
      height={(width * 12) / 14}
      viewBox="0 0 14 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path transform="translate(0 1)" fill={fill} d={HEART_LEFT} />
      <path transform="translate(1 0)" fill={fill} d={HEART_RIGHT} />
    </svg>
  );
}

export function SadFace({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <path fill="#BADA55" d="M4 0h4v1h-4zM2 1h8v1h-8zM1 2h10v2h-10zM0 4h12v4h-12zM1 8h10v2h-10zM2 10h8v1h-8zM4 11h4v1h-4z" />
      <path fill="#0A0A0A" d="M1 4h10v1h-10zM2 5h3v1h-3zM7 5h3v1h-3zM4 8h4v1h-4zM3 9h1v1h-1zM8 9h1v1h-1z" />
      <path fill="#FF007F" d="M2 4h1v1h-1zM7 4h1v1h-1zM9 6h1v2h-1z" />
    </svg>
  );
}
