import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility';

interface TaskDescriptionModalProps {
  log: {
    taskName: string;
    projectName?: string;
    taskDescription?: string;
    description?: string;
  } | null;
  onClose: () => void;
}

export const TaskDescriptionModal: React.FC<TaskDescriptionModalProps> = ({ log, onClose }) => {
	const dialogRef = useRef<HTMLElement>(null);
	useDialogAccessibility(dialogRef, onClose, !!log);
  if (!log) return null;

  const rawDescription = log.taskDescription || log.description || '';
  const hasDescription = !!rawDescription.trim() && rawDescription !== '<p></p>';

  return ReactDOM.createPortal(
    <div
      className="modal-overlay task-desc-modal__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section ref={dialogRef} className="modal task-desc-modal__panel" role="dialog" aria-modal="true" aria-labelledby="task-description-title" tabIndex={-1}>
        {/* Header */}
        <div className="task-desc-modal__header">
          <h2 id="task-description-title" className="task-desc-modal__title">
            Task Description
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="task-desc-modal__close-btn"
            aria-label="Close task description"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="task-desc-modal__body">
          {hasDescription ? (
            <div
              className="rich-text-content task-desc-modal__content"
              dangerouslySetInnerHTML={{ __html: rawDescription }}
            />
          ) : (
            <div className="task-desc-modal__empty">
              No description provided for this task.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="task-desc-modal__footer">
          <button
            type="button"
            className="btn btn--primary task-desc-modal__btn-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
};
