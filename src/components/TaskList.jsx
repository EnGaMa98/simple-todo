import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'

export function TaskList({
  filter,
  searchQuery,
  tasks,
  onAddSubtask,
  onArchiveTask,
  onDeleteSubtask,
  onDeleteTask,
  onRestoreTask,
  onToggleSubtask,
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
          onAddSubtask={onAddSubtask}
          onArchiveTask={onArchiveTask}
          onDeleteSubtask={onDeleteSubtask}
          onDeleteTask={onDeleteTask}
          onRestoreTask={onRestoreTask}
          onToggleSubtask={onToggleSubtask}
          onToggleTask={onToggleTask}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </ul>
  )
}
