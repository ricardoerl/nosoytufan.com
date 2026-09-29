export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-[-0.03em] ${className}`}>
      nosoytu
      <span className="line-through decoration-neon [text-decoration-thickness:0.11em]">fan</span>
      <span className="hidden text-acid md:inline">.com</span>
    </span>
  );
}
