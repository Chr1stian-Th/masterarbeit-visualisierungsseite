interface Props {
  label: string;
  value: string | number;
}

export function Stat({ label, value }: Props) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <div className="val num" style={{ fontSize: 22 }}>
        {value}
      </div>
    </div>
  );
}
