export function TaskStats({
  totalTasks,
  activeTasks,
  archivedTasks,
  completedTasks,
  overdueTasks,
  dueTodayTasks,
  completionRate,
  onArchiveCompleted,
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
        <span>Vencidas</span>
        <strong>{overdueTasks}</strong>
      </article>

      <article className="stat-card">
        <span>Archivadas</span>
        <strong>{archivedTasks}</strong>
      </article>

      <article className="progress-card">
        <div className="progress-copy">
          <span>Ritmo actual</span>
          <strong>{completionRate}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${completionRate}%` }} />
        </div>
        <p>{`${completedTasks} completadas de ${totalTasks || 0} - ${dueTodayTasks} para hoy`}</p>
      </article>

      <button
        className="ghost-button clear-button"
        type="button"
        onClick={onArchiveCompleted}
        disabled={completedTasks === 0}
      >
        Archivar completadas
      </button>
    </section>
  )
}
