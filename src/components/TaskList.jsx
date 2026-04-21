import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'

export function TaskList({
  filter,
  searchQuery,
  tasks,
  onDeleteTask,
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
          onDeleteTask={onDeleteTask}
          onToggleTask={onToggleTask}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </ul>
  )
}
