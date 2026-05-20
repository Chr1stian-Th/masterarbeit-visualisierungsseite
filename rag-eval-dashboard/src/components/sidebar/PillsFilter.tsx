interface Props<T extends string> {
  options: T[];
  selected: Set<T>;
  onToggle: (key: T) => void;
  /** Visual label for an option (default: the value itself). */
  labelFor?: (option: T) => string;
  /** Per-option color override; applies to both the "on" background and the
   *  off-state border/text when provided. */
  colorFor?: (option: T) => string | undefined;
  /** Title (tooltip) for an option. */
  titleFor?: (option: T) => string | undefined;
}

/**
 * The generic pills-as-checkboxes filter, used for approach/model/etc. lists.
 * Pass `colorFor` to color-tint pills (e.g. domain colors).
 */
export function PillsFilter<T extends string>({
  options,
  selected,
  onToggle,
  labelFor = (o) => o,
  colorFor,
  titleFor,
}: Props<T>) {
  return (
    <div className="pills">
      {options.map(o => {
        const on = selected.has(o);
        const color = colorFor?.(o);
        const style = color
          ? on
            ? { background: color, borderColor: color }
            : { borderColor: color, color }
          : undefined;
        return (
          <button
            key={o}
            className={'pill-btn ' + (on ? 'on' : '')}
            style={style}
            title={titleFor?.(o)}
            onClick={() => onToggle(o)}
          >
            {labelFor(o)}
          </button>
        );
      })}
    </div>
  );
}
