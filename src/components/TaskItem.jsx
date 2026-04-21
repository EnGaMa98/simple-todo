import { useState } from 'react'
import { PRIORITY_OPTIONS, PRIORITY_META } from '../constants/priorities'
import {
  formatDateLabel,
  getDueDateLabel,
  getTaskDueState,
} from '../utils/tasks'

const formatDate = (isoDate) =>
  isoDate
    ? new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoDate))
    : 'sin fecha'

export function TaskItem({
  task,
  onArchiveTask,
  onDeleteTask,
  onRestoreTask,
  onToggleTask,
  onUpdateTask,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)
  const [draftPriority, setDraftPriority] = useState(task.priority ?? 'medium')
  const [draftDueDate, setDraftDueDate] = useState(task.dueDate ?? '')
  const [draftTags, setDraftTags] = useState((task.tags ?? []).join(', '))

  const isArchived = Boolean(task.archivedAt)
  const priorityMeta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium
  const dueState = isArchived
    ? 'archived'
    : task.completed
      ? 'completed'
      : getTaskDueState(task)
  const dueDateLabel = getDueDateLabel(task)

  const openEditor = () => {
    setDraftTitle(task.title)
    setDraftPriority(task.priority ?? 'medium')
    setDraftDueDate(task.dueDate ?? '')
    setDraftTags((task.tags ?? []).join(', '))
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
      dueDate: draftDueDate || null,
      tags: draftTags,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraftTitle(task.title)
    setDraftPriority(task.priority ?? 'medium')
    setDraftDueDate(task.dueDate ?? '')
    setDraftTags((task.tags ?? []).join(', '))
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
    <li
      className={`task-item ${task.completed ? 'is-completed' : ''} ${
        isArchived ? 'is-archived' : ''
      }`}
    >
      <div className="task-main">
        {isArchived ? (
          <span className="task-archive-indicator" aria-hidden="true">
            AR
          </span>
        ) : (
          <input
            className="task-checkbox"
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleTask(task.id)}
            aria-label={`Marcar ${task.title} como ${
              task.completed ? 'pendiente' : 'completada'
            }`}
          />
        )}

        <div className="task-content">
          <div className="task-meta">
            <span className={`task-priority priority-${task.priority}`}>
              {priorityMeta.label}
            </span>
            <span className={`task-due due-${dueState}`}>{dueDateLabel}</span>
            <span
              className={`task-status ${
                isArchived
                  ? 'status-archived'
                  : task.completed
                    ? 'status-completed'
                    : 'status-active'
              }`}
            >
              {isArchived
                ? 'Archivada'
                : task.completed
                  ? 'Completada'
                  : 'Activa'}
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

              <div className="task-editor-grid">
                <label className="field-stack" htmlFor={`due-${task.id}`}>
                  <span className="field-label">Fecha limite</span>
                  <input
                    id={`due-${task.id}`}
                    className="date-input"
                    type="date"
                    value={draftDueDate}
                    onChange={(event) => setDraftDueDate(event.target.value)}
                  />
                </label>

                <label className="field-stack" htmlFor={`tags-${task.id}`}>
                  <span className="field-label">Etiquetas</span>
                  <input
                    id={`tags-${task.id}`}
                    className="tags-input"
                    type="text"
                    value={draftTags}
                    onChange={(event) => setDraftTags(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="cliente, sprint, casa"
                  />
                </label>
              </div>

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
              {isArchived ? (
                <p className="task-helper">
                  Archivada {formatDate(task.archivedAt)}
                </p>
              ) : null}
              {task.tags?.length > 0 ? (
                <div className="task-tags" aria-label="Etiquetas de la tarea">
                  {task.tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {task.dueDate ? (
                <p className="task-helper">
                  Fecha objetivo {formatDateLabel(task.dueDate, {
                    day: '2-digit',
                    month: 'long',
                  })}
                </p>
              ) : null}
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
            {isArchived ? (
              <>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onRestoreTask(task.id)}
                >
                  Restaurar
                </button>
                <button
                  className="ghost-button danger-button"
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                >
                  Eliminar
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
                  className="ghost-button"
                  type="button"
                  onClick={() => onArchiveTask(task.id)}
                >
                  Archivar
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
          </>
        )}
      </div>
    </li>
  )
}
