const styles = {
  Placed: 'bg-neutral-100 text-neutral-700',
  Confirmed: 'bg-blue-50 text-blue-700',
  Shipped: 'bg-amber-50 text-amber-700',
  Delivered: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Placed}`}>
      {status}
    </span>
  );
}