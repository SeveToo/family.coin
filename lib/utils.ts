export const formatBalance = (balance: number | string | undefined | null): string => {
  if (balance === undefined || balance === null) return '0.00';
  const num = Number(balance);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};
