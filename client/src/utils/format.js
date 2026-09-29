export const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });