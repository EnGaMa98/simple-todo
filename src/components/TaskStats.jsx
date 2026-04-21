export function TaskStats({
  totalTasks,
  activeTasks,
  completedTasks,
  highPriorityTasks,
  completionRate,
  onClearCompleted,
}) {
  return (
    <section className="stats-grid" aria-label="Resumen de tareas">
      <article className="stat-card">
        <span>Totales</span>
        <strong>{totalTasks}</strong>
      </article>

      <article className="stat-card">
        <span>Activas</span>
        <strong>{activeTasks}</strong>
      </article>

      <article className="stat-card">
        <span>Alta prioridad</span>
        <strong>{highPriorityTasks}</strong>
      </article>

      <article className="progress-card">
        <div className="progress-copy">
          <span>Ritmo actual</span>
          <strong>{completionRate}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${completionRate}%` }} />
        </div>
        <p>
          {completedTasks} completadas de {totalTasks || 0}
        </p>
      </article>

      <button
        className="ghost-button clear-button"
        type="button"
        onClick={onClearCompleted}
        disabled={completedTasks === 0}
      >
        Limpiar completadas
      </button>
    </section>
  )
}
