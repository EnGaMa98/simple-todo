import { useEffect, useState } from 'react'
import './App.css'
import { FilterBar } from './components/FilterBar'
import { SortBar } from './components/SortBar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { TaskStats } from './components/TaskStats'
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
  getTaskDueState,
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
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function App() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const activeTasks = totalTasks - completedTasks
  const overdueTasks = tasks.filter(
    (task) => !task.completed && getTaskDueState(task) === 'overdue',
  ).length
  const dueTodayTasks = tasks.filter(
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
  const focusTask = getFocusTask(tasks)
  const focusTaskMeta = focusTask
    ? PRIORITY_META[focusTask.priority] ?? PRIORITY_META.medium
    : null
  const focusDueLabel = focusTask ? getDueDateLabel(focusTask) : null

  const handleAddTask = ({ title, priority, dueDate, tags }) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    setTasks((currentTasks) => [
      createTask({
        title: trimmedTitle,
        priority,
        dueDate,
        tags,
      }),
      ...currentTasks,
    ])
  }

  const handleDeleteTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )
  }

  const handleToggleTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        return {
          ...task,
          completed: !task.completed,
          updatedAt: new Date().toISOString(),
        }
      }),
    )
  }

  const handleUpdateTask = (taskId, updates) => {
    const trimmedTitle = updates.title.trim()

    if (!trimmedTitle) {
      return
    }

    setTasks((currentTasks) =>
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
          updatedAt: new Date().toISOString(),
        }
      }),
    )
  }

  const handleClearCompleted = () => {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed))
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
            completedTasks={completedTasks}
            overdueTasks={overdueTasks}
            dueTodayTasks={dueTodayTasks}
            completionRate={completionRate}
            onClearCompleted={handleClearCompleted}
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
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onUpdateTask={handleUpdateTask}
          />
        </section>
      </main>
    </div>
  )
}

export default App
