export function formatNaira(amount) {
  return "\u20a6" + Number(amount || 0).toLocaleString("en-NG");
}
