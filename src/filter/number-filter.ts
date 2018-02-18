import { ColumnDefinition } from '../column-definition';

const enum NumberFilterOperator {
  EQ,
  NOT_EQ,
  LT,
  LTE,
  GT,
  GTE,
};

/**
 * Compares two numbers according to given operator. Returns true if given
 * numbers satisfies comparison.
 * @param {number} num1 First number to compare.
 * @param {number} num2 Second number to compare.
 * @param {NumberFilterOperator} operator Compare operator.
 */
function compareNumbers(num1: number, num2: number, operator: NumberFilterOperator) {
  switch (operator) {
    case NumberFilterOperator.EQ:
      return num1 === num2;
    case NumberFilterOperator.NOT_EQ:
      return num1 !== num2;
    case NumberFilterOperator.LT:
      return num1 < num2;
    case NumberFilterOperator.LTE:
      return num1 <= num2;
    case NumberFilterOperator.GT:
      return num1 > num2;
    case NumberFilterOperator.GTE:
      return num1 >= num2;
  }
};

/**
 * Number filter function. Query may be:
 * * "" - means empty value,
 * * 123 (or any other number) - will perform strict filter,
 * * ==123 (or any other number) - the same, as above
 * * !=123 (or any other number) - will filter out all records with value equal
 * to given number
 * * <123 (or any other number and comparison: >, >=, <=) - will filter out all
 * records with value not satysfying given condition
 * @param {any} record Record.
 * @param {ColumnDefinition} column Column definition.
 */
export function numberFilter(record: any, column: ColumnDefinition) {
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
  let operator: NumberFilterOperator;
  let searchNumber: number;
  if (query.length > 2) {
    switch (query.substring(0, 2)) {
      case '==':
        operator = NumberFilterOperator.EQ;
        break;
      case '!=':
        operator = NumberFilterOperator.NOT_EQ;
        break;
      case '<=':
        operator = NumberFilterOperator.LTE;
        break;
      case '>=':
        operator = NumberFilterOperator.GTE;
        break;
    }
    searchNumber = Number(query.substring(2));
  }
  if (query.length > 1 && operator === undefined) {
    switch (query.substring(0, 1)) {
      case '<':
        operator = NumberFilterOperator.LT;
        break;
      case '>':
        operator = NumberFilterOperator.GT;
        break;
    }
    searchNumber = Number(query.substring(1));
  }
  if (operator === undefined) {
    operator = NumberFilterOperator.EQ;
    searchNumber = Number(query);
  }
  if (isNaN(searchNumber)) {
    return false;
  } else {
    return compareNumbers(recordValue, searchNumber, operator);
  }
}
