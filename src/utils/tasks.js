import { PRIORITY_META } from '../constants/priorities'

const padDatePart = (value) => String(value).padStart(2, '0')

export const getTodayDateKey = () => {
  const today = new Date()

  return `${today.getFullYear()}-${padDatePart(today.getMonth() + 1)}-${padDatePart(today.getDate())}`
}

const toTimestamp = (value) => {
  if (!value) {
    return 0
  }

  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

export const normalizeTagsInput = (value) => {
  const source = Array.isArray(value) ? value.join(',') : value ?? ''

  return [
    ...new Set(
      source
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ]
}

export const formatDateLabel = (value, options) => {
  if (!value) {
    return 'sin fecha'
  }

  return new Intl.DateTimeFormat('es-ES', options).format(
    new Date(`${value}T12:00:00`),
  )
}

export const getTaskDueState = (task, todayKey = getTodayDateKey()) => {
  if (!task.dueDate) {
    return 'none'
  }

  if (task.dueDate < todayKey) {
    return 'overdue'
  }

  if (task.dueDate === todayKey) {
    return 'today'
  }

  return 'upcoming'
}

export const getDueDateLabel = (task, todayKey = getTodayDateKey()) => {
  if (!task.dueDate) {
    return 'Sin fecha'
  }

  if (task.completed) {
    return `Planificada ${formatDateLabel(task.dueDate, {
      day: '2-digit',
      month: 'short',
    })}`
  }

  const dueState = getTaskDueState(task, todayKey)

  if (dueState === 'overdue') {
    return `Vencida ${formatDateLabel(task.dueDate, {
      day: '2-digit',
      month: 'short',
    })}`
  }

  if (dueState === 'today') {
    return 'Vence hoy'
  }

  return `Vence ${formatDateLabel(task.dueDate, {
    day: '2-digit',
    month: 'short',
  })}`
}

const compareByPriority = (leftTask, rightTask) =>
  (PRIORITY_META[rightTask.priority] ?? PRIORITY_META.medium).weight -
  (PRIORITY_META[leftTask.priority] ?? PRIORITY_META.medium).weight

const compareByDueDate = (leftTask, rightTask) => {
  if (!leftTask.dueDate && !rightTask.dueDate) {
    return 0
  }

  if (!leftTask.dueDate) {
    return 1
  }

  if (!rightTask.dueDate) {
    return -1
  }

  return leftTask.dueDate.localeCompare(rightTask.dueDate)
}

const getDueWeight = (task, todayKey) => {
  const dueState = getTaskDueState(task, todayKey)

  if (dueState === 'overdue') {
    return 3
  }

  if (dueState === 'today') {
    return 2
  }

  if (dueState === 'upcoming') {
    return 1
  }

  return 0
}

export const doesTaskMatchFilter = (
  task,
  filter,
  todayKey = getTodayDateKey(),
) => {
  const dueState = getTaskDueState(task, todayKey)

  if (filter === 'active') {
    return !task.completed
  }

  if (filter === 'completed') {
    return task.completed
  }

  if (filter === 'today') {
    return !task.completed && dueState === 'today'
  }

  if (filter === 'upcoming') {
    return !task.completed && dueState === 'upcoming'
  }

  if (filter === 'overdue') {
    return !task.completed && dueState === 'overdue'
  }

  return true
}

export const getFilterCounts = (tasks, todayKey = getTodayDateKey()) => ({
  all: tasks.length,
  active: tasks.filter((task) => doesTaskMatchFilter(task, 'active', todayKey))
    .length,
  today: tasks.filter((task) => doesTaskMatchFilter(task, 'today', todayKey))
    .length,
  upcoming: tasks.filter((task) =>
    doesTaskMatchFilter(task, 'upcoming', todayKey),
  ).length,
  overdue: tasks.filter((task) =>
    doesTaskMatchFilter(task, 'overdue', todayKey),
  ).length,
  completed: tasks.filter((task) =>
    doesTaskMatchFilter(task, 'completed', todayKey),
  ).length,
})

export const doesTaskMatchSearch = (task, searchQuery) => {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return (
    task.title.toLowerCase().includes(normalizedQuery) ||
    task.tags.some((tag) => tag.includes(normalizedQuery))
  )
}

export const sortTasks = (tasks, sortBy) =>
  [...tasks].sort((leftTask, rightTask) => {
    if (sortBy === 'oldest') {
      return (
        toTimestamp(leftTask.createdAt) - toTimestamp(rightTask.createdAt) ||
        toTimestamp(leftTask.updatedAt) - toTimestamp(rightTask.updatedAt)
      )
    }

    if (sortBy === 'priority') {
      return (
        compareByPriority(leftTask, rightTask) ||
        compareByDueDate(leftTask, rightTask) ||
        toTimestamp(rightTask.updatedAt) - toTimestamp(leftTask.updatedAt)
      )
    }

    if (sortBy === 'due-date') {
      return (
        compareByDueDate(leftTask, rightTask) ||
        compareByPriority(leftTask, rightTask) ||
        toTimestamp(rightTask.updatedAt) - toTimestamp(leftTask.updatedAt)
      )
    }

    return (
      toTimestamp(rightTask.updatedAt) - toTimestamp(leftTask.updatedAt) ||
      compareByPriority(leftTask, rightTask)
    )
  })

export const getFocusTask = (tasks, todayKey = getTodayDateKey()) => {
  const activeTasks = tasks.filter((task) => !task.completed)

  if (activeTasks.length === 0) {
    return null
  }

  return [...activeTasks].sort((leftTask, rightTask) => {
    return (
      getDueWeight(rightTask, todayKey) - getDueWeight(leftTask, todayKey) ||
      compareByDueDate(leftTask, rightTask) ||
      compareByPriority(leftTask, rightTask) ||
      toTimestamp(rightTask.updatedAt) - toTimestamp(leftTask.updatedAt)
    )
  })[0]
}
