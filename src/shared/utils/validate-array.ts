export default function validateArray<T>(array: T[], required?: T[], forbidden?: T[]) {
  const includesRequired = !required || required.some(value => array.includes(value));
  const notIncludesForbidden = !forbidden || !forbidden.some(value => array.includes(value));
  return includesRequired && notIncludesForbidden;
}
