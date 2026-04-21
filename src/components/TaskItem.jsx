import { useState } from 'react'
import { PRIORITY_OPTIONS, PRIORITY_META } from '../constants/priorities'

const formatDate = (isoDate) => {
  if (!isoDate) {
    return 'sin fecha'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function TaskItem({
  task,
  onDeleteTask,
  onToggleTask,
  onUpdateTask,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)
  const [draftPriority, setDraftPriority] = useState(task.priority ?? 'medium')

  const priorityMeta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium

  const openEditor = () => {
    setDraftTitle(task.title)
    setDraftPriority(task.priority ?? 'medium')
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmedTitle = draftTitle.trim()

    if (!trimmedTitle) {
      setDraftTitle(task.title)
      setDraftPriority(task.priority ?? 'medium')
      setIsEditing(false)
      return
    }

    onUpdateTask(task.id, {
      title: trimmedTitle,
      priority: draftPriority,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraftTitle(task.title)
    setDraftPriority(task.priority ?? 'medium')
    setIsEditing(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSave()
    }

    if (event.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <li className={`task-item ${task.completed ? 'is-completed' : ''}`}>
      <div className="task-main">
        <input
          className="task-checkbox"
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleTask(task.id)}
          aria-label={`Marcar ${task.title} como ${
            task.completed ? 'pendiente' : 'completada'
          }`}
        />

        <div className="task-content">
          <div className="task-meta">
            <span className={`task-priority priority-${task.priority}`}>
              {priorityMeta.label}
            </span>
            <span
              className={`task-status ${
                task.completed ? 'status-completed' : 'status-active'
              }`}
            >
              {task.completed ? 'Completada' : 'Activa'}
            </span>
            <span className="task-date">Rev. {formatDate(task.updatedAt)}</span>
          </div>

          {isEditing ? (
            <div className="task-editor">
              <input
                className="task-edit-input"
                type="text"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />

              <div className="priority-picker priority-picker-inline">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`priority-chip ${
                      draftPriority === option.value ? 'is-selected' : ''
                    }`}
                    type="button"
                    onClick={() => setDraftPriority(option.value)}
                  >
                    {option.shortLabel}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="task-title">{task.title}</p>
              <p className="task-helper">
                {priorityMeta.helper} - Creada {formatDate(task.createdAt)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="task-actions">
        {isEditing ? (
          <>
            <button
              className="secondary-button"
              type="button"
              onClick={handleSave}
            >
              Guardar
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              className="secondary-button"
              type="button"
              onClick={openEditor}
            >
              Editar
            </button>
            <button
              className="ghost-button danger-button"
              type="button"
              onClick={() => onDeleteTask(task.id)}
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </li>
  )
}
