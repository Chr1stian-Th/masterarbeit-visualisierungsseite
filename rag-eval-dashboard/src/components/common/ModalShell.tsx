import type { ReactNode } from 'react';

interface Props {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}

/**
 * Reusable modal shell: clicks on the backdrop close, clicks inside don't.
 * Used by both QuestionModal and CostEditor.
 */
export function ModalShell({ onClose, children, maxWidth }: Props) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
