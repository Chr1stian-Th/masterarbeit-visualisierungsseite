interface Props {
  darkMode: boolean;
  onToggle: () => void;
}

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
