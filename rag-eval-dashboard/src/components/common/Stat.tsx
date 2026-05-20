interface Props {
  label: string;
  value: string | number;
}

/** Single labeled metric card with a large value. Used in hero stats and the modal cost breakdown. */
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
