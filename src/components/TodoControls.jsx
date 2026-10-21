import { FILTERS } from '../todoUtils.js';
import './TodoControls.css';

export default function TodoControls({
  activeCount,
  completedCount,
  filter,
  onChangeFilter,
  onClearCompleted,
}) {
  return (
    <div className="todo-controls">
      <span>
        {activeCount} item{activeCount === 1 ? '' : 's'} left
      </span>

      <div className="filters" aria-label="Filter todos">
        {FILTERS.map((filterName) => (
          <button
            key={filterName}
            type="button"
            className={filter === filterName ? 'active' : ''}
            aria-pressed={filter === filterName}
            onClick={() => onChangeFilter(filterName)}
          >
            {filterName[0].toUpperCase() + filterName.slice(1)}
          </button>
        ))}
      </div>

      {completedCount > 0 && (
        <button
          type="button"
          className="clear-completed"
          onClick={onClearCompleted}
        >
          Clear completed
        </button>
      )}
    </div>
  );
}
