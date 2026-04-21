const EMPTY_MESSAGES = {
  all: {
    title: 'Tu lista esta vacia',
    description:
      'Anade la primera tarea para convertir la lista en una vista de trabajo real.',
  },
  active: {
    title: 'No hay tareas activas',
    description:
      'Todo lo pendiente esta resuelto o todavia no has cargado nuevas tareas.',
  },
  completed: {
    title: 'No hay tareas completadas',
    description:
      'Cuando cierres una tarea aparecera aqui para dejar rastro del avance.',
  },
}

export function EmptyState({ filter, searchQuery }) {
  const normalizedQuery = searchQuery.trim()
  const message = normalizedQuery
    ? {
        title: 'Sin coincidencias',
        description: `No encontramos tareas para "${normalizedQuery}". Prueba con otra palabra o revisa el filtro activo.`,
      }
    : EMPTY_MESSAGES[filter]

  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        01
      </div>
      <h3>{message.title}</h3>
      <p>{message.description}</p>
    </div>
  )
}
