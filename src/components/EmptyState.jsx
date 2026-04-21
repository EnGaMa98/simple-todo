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
  'my-day': {
    title: 'Mi dia esta vacio',
    description:
      'Marca tareas clave con Mi dia para reunir aqui solo lo que quieres empujar hoy.',
  },
  today: {
    title: 'Nada para hoy',
    description:
      'No hay tareas con fecha de hoy. Puedes mover foco a proximas o planificar nuevas.',
  },
  upcoming: {
    title: 'Sin proximas fechas',
    description:
      'Aun no has programado tareas futuras. Las etiquetas y fechas ayudan a ver carga real.',
  },
  overdue: {
    title: 'Nada vencido',
    description:
      'No hay tareas atrasadas. Buen momento para mantener el ritmo antes de que se acumulen.',
  },
  completed: {
    title: 'No hay tareas completadas',
    description:
      'Cuando cierres una tarea aparecera aqui para dejar rastro del avance.',
  },
  archived: {
    title: 'Archivo vacio',
    description:
      'Las tareas archivadas saldran del panel diario y quedaran aqui para consulta o restauracion.',
  },
}

export function EmptyState({ filter, searchQuery }) {
  const normalizedQuery = searchQuery.trim()
  const message = normalizedQuery
    ? {
        title: 'Sin coincidencias',
        description: `No encontramos tareas para "${normalizedQuery}". Prueba con otra palabra, etiqueta o revisa el filtro activo.`,
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
