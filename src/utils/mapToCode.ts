/**
 * Maps a human-readable value to its corresponding code using a lookup map
 * @param value - The human-readable value to map
 * @param map - The lookup map containing value-to-code mappings
 * @param fieldName - The field name for error reporting
 * @returns The corresponding code from the map, or the original value if not found
 */
export default function mapToCode(value: string, map: Record<string, string>, fieldName: string): string {
  if (!value) {
    return value;
  }
  
  const mappedValue = map[value];
  if (mappedValue) {
    return mappedValue;
  }
  
  // If mapping not found, return the original value instead of throwing an error
  console.warn(`[mapToCode] No mapping found for ${fieldName}: "${value}". Using original value.`);
  return value;
}