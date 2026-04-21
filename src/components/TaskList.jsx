import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'

export function TaskList({
  filter,
  searchQuery,
  tasks,
  onArchiveTask,
  onDeleteTask,
  onRestoreTask,
  onToggleTask,
  onUpdateTask,
}) {
  if (tasks.length === 0) {
    return <EmptyState filter={filter} searchQuery={searchQuery} />
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onArchiveTask={onArchiveTask}
          onDeleteTask={onDeleteTask}
          onRestoreTask={onRestoreTask}
          onToggleTask={onToggleTask}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </ul>
  )
}
