export default function Meter({ percent }: { percent: number }) {
  return (
    <div className="meter">
      <i style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  );
}
