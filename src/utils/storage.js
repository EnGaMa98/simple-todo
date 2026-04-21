import { PRIORITY_META } from '../constants/priorities'
import { normalizeSubtasks, normalizeTagsInput } from './tasks'

const STORAGE_KEY = 'portfolio-todo-list'

export const loadTasks = () => {
  try {
    const storedTasks = window.localStorage.getItem(STORAGE_KEY)

    if (!storedTasks) {
      return []
    }

    const parsedTasks = JSON.parse(storedTasks)

    if (!Array.isArray(parsedTasks)) {
      return []
    }

    return parsedTasks
      .filter(
        (task) =>
          typeof task?.id === 'string' &&
          typeof task?.title === 'string' &&
          typeof task?.completed === 'boolean',
      )
      .map((task) => ({
        ...task,
        createdAt: task.createdAt ?? null,
        updatedAt: task.updatedAt ?? task.createdAt ?? null,
        archivedAt:
          typeof task.archivedAt === 'string' && task.archivedAt.trim()
            ? task.archivedAt
            : null,
        priority: PRIORITY_META[task.priority] ? task.priority : 'medium',
        dueDate:
          typeof task.dueDate === 'string' && task.dueDate.trim()
            ? task.dueDate
            : null,
        tags: normalizeTagsInput(task.tags),
        subtasks: normalizeSubtasks(task.subtasks),
      }))
  } catch {
    return []
  }
}

export const saveTasks = (tasks) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}
