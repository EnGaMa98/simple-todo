export function UndoToast({ message, onUndo, onDismiss }) {
  return (
    <div className="undo-toast" role="status" aria-live="polite">
      <p>{message}</p>
      <div className="undo-toast-actions">
        <button className="secondary-button" type="button" onClick={onUndo}>
          Deshacer
        </button>
        <button className="ghost-button" type="button" onClick={onDismiss}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
