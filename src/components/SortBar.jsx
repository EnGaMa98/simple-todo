export function SortBar({ options, sortBy, onSortChange }) {
  return (
    <label className="sort-control" htmlFor="task-sort">
      <span className="field-label">Ordenar</span>
      <select
        id="task-sort"
        className="sort-select"
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
