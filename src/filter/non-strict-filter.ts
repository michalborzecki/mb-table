import { ColumnDefinition } from '../column-definition';

/**
 * Non-strict filter function. Returns true only if lowercased, string value
 * from record is identical to given query (also casted to lowercased string).
 * If query is "" (two double quotes), then only empty (but != 0)
 * record value is recognised as correct.
 * @param {any} record Record.
 * @param {ColumnDefinition} column Column definition.
 */
export function nonStrictFilter(record: any, column: ColumnDefinition) {
  const rawQuery = column.filterQuery.getValue();
  const query = rawQuery ? rawQuery.toString().trim() : '';
  const recordValue = column.value.getValue()(record);
  if (query === '""') {
    return !recordValue && recordValue !== 0;
  } else if (query.length === 0) {
    return true;
  } else if (!recordValue && recordValue !== 0) {
    return false;
  }
  return recordValue.toString().trim().toLowerCase().includes(query.toLowerCase());
};
