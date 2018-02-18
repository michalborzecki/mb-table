import { ColumnDefinition } from '../column-definition';

/**
 * Strict filter function. Returns true only if value from record is identical to given query.
 * @param {any} record Record.
 * @param {ColumnDefinition} column Column definition.
 */
export function strictFilter(record: any, column: ColumnDefinition) {
  return column.value.getValue()(record) === column.filterQuery.getValue();
};
