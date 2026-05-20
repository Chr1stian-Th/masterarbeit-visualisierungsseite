interface Props {
  darkMode: boolean;
  onToggle: () => void;
}

/** Fixed-position button in the top-right corner that toggles the global light/dark theme. */
export function ThemeToggle({ darkMode, onToggle }: Props) {
  return (
    <button
      className="theme-btn"
      onClick={onToggle}
      title="Toggle light/dark mode"
    >
      {darkMode ? '○ light' : '◐ dark'}
    </button>
  );
}
