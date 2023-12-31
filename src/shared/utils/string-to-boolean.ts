import { isBooleanString } from 'class-validator';

export default function stringToBoolean(value: unknown): boolean {
  if (isBooleanString(value)) {
    return value === '1' || /^true$/i.test(value as string);
  }
  return false;
}
