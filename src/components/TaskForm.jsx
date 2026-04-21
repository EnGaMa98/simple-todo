import { useState } from 'react'
import { PRIORITY_OPTIONS } from '../constants/priorities'

export function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    onSubmit({
      title,
      priority,
      dueDate: dueDate || null,
      tags: tagsInput,
    })
    setTitle('')
    setPriority('medium')
    setDueDate('')
    setTagsInput('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-fields">
        <label className="sr-only" htmlFor="task-title">
          Nueva tarea
        </label>
        <input
          id="task-title"
          className="task-input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Escribe la siguiente tarea clave..."
        />

        <div className="task-form-secondary">
          <label className="field-stack" htmlFor="task-due-date">
            <span className="field-label">Fecha limite</span>
            <input
              id="task-due-date"
              className="date-input"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>

          <label className="field-stack" htmlFor="task-tags">
            <span className="field-label">Etiquetas</span>
            <input
              id="task-tags"
              className="tags-input"
              type="text"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="cliente, sprint, casa"
            />
          </label>
        </div>

        <div className="priority-picker" aria-label="Prioridad inicial">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`priority-chip ${
                priority === option.value ? 'is-selected' : ''
              }`}
              onClick={() => setPriority(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <button className="primary-button" type="submit">
        Crear tarea
      </button>
    </form>
  )
}
