/**
 * Maps a human-readable value to its corresponding code using a lookup map
 * @param value - The human-readable value to map
 * @param map - The lookup map containing value-to-code mappings
 * @param fieldName - The field name for error reporting
 * @returns The corresponding code from the map, or the original value if not found
 */
export default function mapToCode(value: string, map: Record<string, string> | Record<string, Record<string, string>>, fieldName: string): string {
  if (!value) {
    return value;
  }
  
  // Handle nested maps (for bank-branch mappings)
  if (fieldName === 'FinancialInstitutionBranchName' && typeof map === 'object' && map !== null) {
    // For branch mapping, we need bank context, but since we don't have it here,
    // we'll return the value as-is for now (validation happens elsewhere)
    console.warn(`[mapToCode] Branch mapping requires bank context for field ${fieldName}: "${value}". Using original value.`);
    return value;
  }
  
  // Handle flat maps
  if (typeof map === 'object' && map !== null && !Array.isArray(map)) {
    const flatMap = map as Record<string, string>;
    const mappedValue = flatMap[value];
    if (mappedValue) {
      return mappedValue;
    }
  }
  
  // If mapping not found, return the original value instead of throwing an error
  console.warn(`[mapToCode] No mapping found for ${fieldName}: "${value}". Using original value.`);
  return value;
}