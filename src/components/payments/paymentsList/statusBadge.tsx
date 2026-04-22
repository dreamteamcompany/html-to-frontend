export const getStatusBadge = (status?: string) => {
  const base = 'px-2 py-1 rounded-full text-xs font-semibold';
  if (!status || status === 'draft') {
    return <span className={`${base} bg-gray-500/20 text-gray-800 dark:text-gray-300`}>Черновик</span>;
  }
  if (status === 'pending_ib') {
    return <span className={`${base} bg-yellow-500/20 text-yellow-800 dark:text-yellow-300`}>На согласовании (ИБ)</span>;
  }
  if (status === 'pending_cfo') {
    return <span className={`${base} bg-orange-500/20 text-orange-800 dark:text-orange-300`}>На согласовании (CFO)</span>;
  }
  if (status === 'pending_ceo') {
    return <span className={`${base} bg-blue-500/20 text-blue-800 dark:text-blue-300`}>На согласовании (CEO)</span>;
  }
  if (status === 'approved') {
    return <span className={`${base} bg-green-500/20 text-green-800 dark:text-green-300`}>Одобрен</span>;
  }
  if (status === 'rejected') {
    return <span className={`${base} bg-red-500/20 text-red-800 dark:text-red-300`}>Отклонён</span>;
  }
  if (status === 'revoked') {
    return <span className={`${base} bg-orange-500/20 text-orange-800 dark:text-orange-300`}>Отозван</span>;
  }
  return null;
};
