export function formatIDR(value: number | string) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}