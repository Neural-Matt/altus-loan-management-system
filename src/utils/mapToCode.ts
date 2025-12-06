/**
 * Maps a human-readable value to its corresponding code using a lookup map
 * @param value - The human-readable value to map
 * @param map - The lookup map containing value-to-code mappings
 * @param fieldName - The field name for error reporting
 * @returns The corresponding code from the map
 * @throws Error if the value is not found in the map
 */
export default function mapToCode(value: string, map: Record<string, string>, fieldName: string): string {
  if (!value || !map[value]) {
    throw new Error(`Invalid ${fieldName}: "${value}" not found in mapping`);
  }
  return map[value];
}