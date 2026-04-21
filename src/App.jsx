import { useEffect, useState } from 'react'
import './App.css'
import { FilterBar } from './components/FilterBar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { TaskStats } from './components/TaskStats'
import { FILTER_OPTIONS } from './constants/filters'
import { PRIORITY_META } from './constants/priorities'
import { loadTasks, saveTasks } from './utils/storage'

const createTask = ({ title, priority }) => {
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
    priority,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

const getFilteredTasks = (tasks, filter, searchQuery) => {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchesFilter =
      filter === 'active'
        ? !task.completed
        : filter === 'completed'
          ? task.completed
          : true

    const matchesSearch = normalizedQuery
      ? task.title.toLowerCase().includes(normalizedQuery)
      : true

    return matchesFilter && matchesSearch
  })
}

const getFocusTask = (tasks) => {
  const activeTasks = tasks.filter((task) => !task.completed)

  if (activeTasks.length === 0) {
    return null
  }

  return [...activeTasks].sort((leftTask, rightTask) => {
    const priorityDifference =
      (PRIORITY_META[rightTask.priority] ?? PRIORITY_META.medium).weight -
      (PRIORITY_META[leftTask.priority] ?? PRIORITY_META.medium).weight

    if (priorityDifference !== 0) {
      return priorityDifference
    }

    return new Date(rightTask.updatedAt) - new Date(leftTask.updatedAt)
  })[0]
}

function App() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const activeTasks = totalTasks - completedTasks
  const highPriorityTasks = tasks.filter(
    (task) => !task.completed && task.priority === 'high',
  ).length
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const counts = {
    all: totalTasks,
    active: activeTasks,
    completed: completedTasks,
  }

  const filteredTasks = getFilteredTasks(tasks, activeFilter, searchQuery)
  const focusTask = getFocusTask(tasks)

  const handleAddTask = ({ title, priority }) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    setTasks((currentTasks) => [
      createTask({
        title: trimmedTitle,
        priority,
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
              La app ahora prioriza decision rapida: foco actual, prioridad por
              tarea y busqueda instantanea sobre una interfaz mas sobria.
            </p>
          </div>

          <div className="intro-metrics">
            <article>
              <span>Progreso</span>
              <strong>{completionRate}%</strong>
            </article>
            <article>
              <span>Pendientes</span>
              <strong>{activeTasks}</strong>
            </article>
          </div>

          <article className="focus-card">
            <span className="focus-label">Siguiente foco</span>
            {focusTask ? (
              <>
                <h2>{focusTask.title}</h2>
                <p>
                  Prioridad{' '}
                  {(PRIORITY_META[focusTask.priority] ?? PRIORITY_META.medium).label.toLowerCase()}
                </p>
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
            <label className="sr-only" htmlFor="task-search">
              Buscar tareas
            </label>
            <input
              id="task-search"
              className="search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por titulo..."
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
            highPriorityTasks={highPriorityTasks}
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
