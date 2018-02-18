import { ColumnDefinition } from '../column-definition';

/**
 * Default comparator for sort algorithms.
 * @param {any} recordA First record to compare.
 * @param {any} recordB Second record to compare.
 * @param {ColumnDefinition} column Column definition by which records should be compared.
 */
export function defaultComparator(recordA: any, recordB: any, column: ColumnDefinition) {
  const columnValue = column.value.getValue();
  const a = columnValue(recordA);
  const b = columnValue(recordB);

  // if a is empty
  if (!a && a !== 0) {
    if (!b && b !== 0) { // empty equals empty
      return 0;
    }
    return -1; // empty is always lower than sth
  } else if (!b && b !== 0) { // if b is empty (and a is not)
    return 1;
  } else { // a and b are not empty
    // special case for strings comparison
    if (typeof a === 'string' && typeof b === 'string') {
      // bugfix for utf-8 characters sorting
      return a.localeCompare(b);
    } else {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    }
  }
}
