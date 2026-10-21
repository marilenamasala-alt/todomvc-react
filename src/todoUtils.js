export const FILTERS = ['all', 'active', 'completed'];

export const getFilterFromHash = (hash) => {
  const value = hash.replace(/^#\/?/, '').trim();
  return FILTERS.includes(value) ? value : 'all';
};
