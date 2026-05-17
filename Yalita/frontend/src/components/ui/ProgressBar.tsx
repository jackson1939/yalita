export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--y-border)" }}>
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%`, background: "var(--y-primary)" }}
      />
    </div>
  );
}
