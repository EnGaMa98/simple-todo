export function FilterBar({
  filters,
  activeFilter,
  counts,
  onFilterChange,
}) {
  return (
    <div className="filter-bar" aria-label="Filtros de tareas">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={`filter-button ${
            activeFilter === filter.value ? 'is-active' : ''
          }`}
          onClick={() => onFilterChange(filter.value)}
        >
          <span>{filter.label}</span>
          <span className="filter-count">{counts[filter.value]}</span>
        </button>
      ))}
    </div>
  )
}
