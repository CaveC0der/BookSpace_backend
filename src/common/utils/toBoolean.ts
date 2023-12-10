export default function toBoolean(value: string | undefined): boolean {
  if (value) {
    value = value.toLowerCase();
    return value === 'true' || value === '1' ;
  }
  return false;
}
