import { useEffect, useState } from 'react'
import './App.css'
import { FilterBar } from './components/FilterBar'
import { SortBar } from './components/SortBar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { TaskStats } from './components/TaskStats'
import { UndoToast } from './components/UndoToast'
import { FILTER_OPTIONS } from './constants/filters'
import { PRIORITY_META } from './constants/priorities'
import { SORT_OPTIONS } from './constants/sortOptions'
import { loadTasks, saveTasks } from './utils/storage'
import {
  doesTaskMatchFilter,
  doesTaskMatchSearch,
  getDueDateLabel,
  getFilterCounts,
  getFocusTask,
  getSubtaskStats,
  getTaskDueState,
  isTaskArchived,
  normalizeSubtasks,
  normalizeTagsInput,
  sortTasks,
} from './utils/tasks'

const createTask = ({ title, priority, dueDate, tags }) => {
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
    priority,
    dueDate,
    tags: normalizeTagsInput(tags),
    subtasks: [],
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function App() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [undoState, setUndoState] = useState(null)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    if (!undoState) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setUndoState(null)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [undoState])

  const workspaceTasks = tasks.filter((task) => !isTaskArchived(task))

  const totalTasks = workspaceTasks.length
  const archivedTasks = tasks.length - workspaceTasks.length
  const completedTasks = workspaceTasks.filter((task) => task.completed).length
  const activeTasks = totalTasks - completedTasks
  const overdueTasks = workspaceTasks.filter(
    (task) => !task.completed && getTaskDueState(task) === 'overdue',
  ).length
  const dueTodayTasks = workspaceTasks.filter(
    (task) => !task.completed && getTaskDueState(task) === 'today',
  ).length
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const counts = getFilterCounts(tasks)
  const filteredTasks = sortTasks(
    tasks.filter(
      (task) =>
        doesTaskMatchFilter(task, activeFilter) &&
        doesTaskMatchSearch(task, searchQuery),
    ),
    sortBy,
  )
  const focusTask = getFocusTask(workspaceTasks)
  const focusTaskMeta = focusTask
    ? PRIORITY_META[focusTask.priority] ?? PRIORITY_META.medium
    : null
  const focusDueLabel = focusTask ? getDueDateLabel(focusTask) : null

  const applyTaskMutation = (updater, undoMessage = null) => {
    const nextTasks = updater(tasks)

    if (nextTasks === tasks) {
      return
    }

    setTasks(nextTasks)
    setUndoState(
      undoMessage
        ? {
            id: crypto.randomUUID(),
            message: undoMessage,
            previousTasks: tasks,
          }
        : null,
    )
  }

  const handleAddTask = ({ title, priority, dueDate, tags }) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    applyTaskMutation(
      (currentTasks) => [
        createTask({
          title: trimmedTitle,
          priority,
          dueDate,
          tags,
        }),
        ...currentTasks,
      ],
      null,
    )
  }

  const handleDeleteTask = (taskId) => {
    applyTaskMutation(
      (currentTasks) => currentTasks.filter((task) => task.id !== taskId),
      'Tarea eliminada.',
    )
  }

  const handleToggleTask = (taskId) => {
    applyTaskMutation(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task
          }

          return {
            ...task,
            completed: !task.completed,
            subtasks: task.completed
              ? task.subtasks
              : task.subtasks.map((subtask) => ({
                  ...subtask,
                  completed: true,
                })),
            updatedAt: new Date().toISOString(),
          }
        }),
      null,
    )
  }

  const handleUpdateTask = (taskId, updates) => {
    const trimmedTitle = updates.title.trim()

    if (!trimmedTitle) {
      return
    }

    applyTaskMutation(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task
          }

          return {
            ...task,
            title: trimmedTitle,
            priority: updates.priority ?? task.priority,
            dueDate: updates.dueDate || null,
            tags: normalizeTagsInput(updates.tags),
            subtasks:
              updates.subtasks !== undefined
                ? normalizeSubtasks(updates.subtasks)
                : task.subtasks,
            updatedAt: new Date().toISOString(),
          }
        }),
      null,
    )
  }

  const handleArchiveTask = (taskId) => {
    applyTaskMutation(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task
          }

          return {
            ...task,
            archivedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }),
      'Tarea archivada.',
    )
  }

  const handleRestoreTask = (taskId) => {
    applyTaskMutation(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task
          }

          return {
            ...task,
            archivedAt: null,
            updatedAt: new Date().toISOString(),
          }
        }),
      null,
    )
  }

  const handleArchiveCompleted = () => {
    applyTaskMutation((currentTasks) => {
      const archiveTimestamp = new Date().toISOString()
      let hasChanges = false

      const nextTasks = currentTasks.map((task) => {
        if (!task.completed || task.archivedAt) {
          return task
        }

        hasChanges = true

        return {
          ...task,
          archivedAt: archiveTimestamp,
          updatedAt: archiveTimestamp,
        }
      })

      return hasChanges ? nextTasks : currentTasks
    }, 'Completadas archivadas.')
  }

  const handleUndo = () => {
    if (!undoState) {
      return
    }

    setTasks(undoState.previousTasks)
    setUndoState(null)
  }

  const handleAddSubtask = (taskId, title) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    applyTaskMutation(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task
          }

          return {
            ...task,
            subtasks: [
              ...task.subtasks,
              {
                id: crypto.randomUUID(),
                title: trimmedTitle,
                completed: false,
              },
            ],
            updatedAt: new Date().toISOString(),
          }
        }),
      null,
    )
  }

  const handleToggleSubtask = (taskId, subtaskId) => {
    applyTaskMutation(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task
          }

          const nextSubtasks = task.subtasks.map((subtask) => {
            if (subtask.id !== subtaskId) {
              return subtask
            }

            return {
              ...subtask,
              completed: !subtask.completed,
            }
          })

          const subtaskStats = getSubtaskStats({ subtasks: nextSubtasks })

          return {
            ...task,
            completed:
              task.completed && subtaskStats.remaining === 0
                ? true
                : task.completed && subtaskStats.remaining > 0
                  ? false
                  : task.completed,
            subtasks: nextSubtasks,
            updatedAt: new Date().toISOString(),
          }
        }),
      null,
    )
  }

  const handleDeleteSubtask = (taskId, subtaskId) => {
    applyTaskMutation(
      (currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task
          }

          return {
            ...task,
            subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          }
        }),
      null,
    )
  }

  return (
    <div className="app-shell">
      <main className="app">
        <section className="intro-panel">
          <div className="brand-stamp">TD</div>

          <div className="intro-copy">
            <span className="eyebrow">Agenda minimal</span>
            <h1>Ordena el trabajo importante sin ruido visual.</h1>
            <p className="hero-text">
              La app ahora cruza prioridad, fechas y etiquetas para mostrar
              carga real: lo vencido, lo que cae hoy y lo siguiente que no
              deberia esperar.
            </p>
          </div>

          <div className="intro-metrics">
            <article>
              <span>Progreso</span>
              <strong>{completionRate}%</strong>
            </article>
            <article>
              <span>Vencidas</span>
              <strong>{overdueTasks}</strong>
            </article>
          </div>

          <article className="focus-card">
            <span className="focus-label">Siguiente foco</span>
            {focusTask ? (
              <>
                <h2>{focusTask.title}</h2>
                <p>{`${focusDueLabel} - Prioridad ${focusTaskMeta.label.toLowerCase()}`}</p>
              </>
            ) : (
              <>
                <h2>Bandeja en orden</h2>
                <p>No quedan tareas activas. Buen momento para planificar.</p>
              </>
            )}
          </article>
        </section>

        <section className="workspace">
          <div className="workspace-head">
            <div>
              <span className="section-kicker">Panel diario</span>
              <h2>Tu lista, mas clara y accionable</h2>
            </div>
            <div className="tasks-badge">
              {activeTasks} pendiente{activeTasks === 1 ? '' : 's'}
            </div>
          </div>

          <div className="search-row">
            <div className="field-stack">
              <label className="sr-only" htmlFor="task-search">
                Buscar tareas
              </label>
              <input
                id="task-search"
                className="search-input"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por titulo o etiqueta..."
              />
            </div>

            <SortBar
              options={SORT_OPTIONS}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <div className="search-meta">
              <strong>{filteredTasks.length}</strong>
              <span>visibles</span>
            </div>
          </div>

          <TaskForm onSubmit={handleAddTask} />

          <TaskStats
            totalTasks={totalTasks}
            activeTasks={activeTasks}
            archivedTasks={archivedTasks}
            completedTasks={completedTasks}
            overdueTasks={overdueTasks}
            dueTodayTasks={dueTodayTasks}
            completionRate={completionRate}
            onArchiveCompleted={handleArchiveCompleted}
          />

          <FilterBar
            filters={FILTER_OPTIONS}
            activeFilter={activeFilter}
            counts={counts}
            onFilterChange={setActiveFilter}
          />

          <TaskList
            filter={activeFilter}
            searchQuery={searchQuery}
            tasks={filteredTasks}
            onAddSubtask={handleAddSubtask}
            onArchiveTask={handleArchiveTask}
            onDeleteSubtask={handleDeleteSubtask}
            onDeleteTask={handleDeleteTask}
            onRestoreTask={handleRestoreTask}
            onToggleSubtask={handleToggleSubtask}
            onToggleTask={handleToggleTask}
            onUpdateTask={handleUpdateTask}
          />
        </section>
      </main>

      {undoState ? (
        <UndoToast
          message={undoState.message}
          onUndo={handleUndo}
          onDismiss={() => setUndoState(null)}
        />
      ) : null}
    </div>
  )
}

export default App
