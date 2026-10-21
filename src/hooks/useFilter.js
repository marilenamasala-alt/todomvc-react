import { useEffect, useState } from 'react';
import { getFilterFromHash } from '../todoUtils.js';

export default function useFilter() {
  const [filter, setFilter] = useState(() => getFilterFromHash(window.location.hash));

  useEffect(() => {
    const syncFilterFromHash = () => {
      const nextFilter = getFilterFromHash(window.location.hash);
      setFilter((currentFilter) =>
        currentFilter === nextFilter ? currentFilter : nextFilter
      );
    };

    syncFilterFromHash();
    window.addEventListener('hashchange', syncFilterFromHash);

    return () => window.removeEventListener('hashchange', syncFilterFromHash);
  }, []);

  useEffect(() => {
    const nextHash = filter === 'all' ? '#/' : `#/${filter}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }, [filter]);

  return [filter, setFilter];
}
