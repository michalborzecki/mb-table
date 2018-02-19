import {
  SortAlgorithm,
  ColumnSortState,
  SortDirection,
} from './sort-algorithm';
import { stableSort } from './stable-sort';
import { BehaviorSubject } from 'rxjs/Rx';

/**
 * Implementation of sort by many columns algorithm.
 */
export class MultiColumnSort extends SortAlgorithm {
  /**
   * Subject with columns sort state by which records will be sorted.
   * @type {BehaviorSubject<ColumnDefinition[]>}
   */
  protected columnsSortStateSubject: BehaviorSubject<ColumnSortState[]>;

  /**
   * Subject with column sort state by which records will be sorted.
   * @type {BehaviorSubject<ColumnDefinition[]>}
   */
  public get columnsSortState(): BehaviorSubject<ColumnSortState[]> {
    return this.columnsSortStateSubject;
  }

  /**
   * @param {BehaviorSubject<ColumnSortState>} columnSortState Subject with
   * column sort state by which records will be sorted.
   */
  constructor(columnsSortState?: BehaviorSubject<ColumnSortState[]>) {
    super();
    if (columnsSortState) {
      this.columnsSortStateSubject = columnsSortState;
    } else {
      this.columnsSortStateSubject = new BehaviorSubject([]);
    }
  }

  /**
   * @override
   */
  public applyColumnSort(columnSortState: ColumnSortState): void {
    const columnsSortState = (this.columnsSortStateSubject.getValue() || [])
      .filter(sortState => sortState.column !== columnSortState.column)
      .slice(0);
    columnsSortState.push(columnSortState);
    this.columnsSortStateSubject.next(columnsSortState);
  }

  /**
   * @override
   */
  public resetSort(): void {
    this.columnsSortStateSubject.next([]);
  }

  /**
   * @override
   */
  public sort(records: any[]): any[] {
    const columnsSortState = (this.columnsSortStateSubject.getValue() || [])
      .filter(sortState =>
        sortState.column.sortEnabled.getValue() && sortState.direction !== SortDirection.Default
      );

    if (columnsSortState.length === 0) {
      return records.slice(0);
    } else {
      return columnsSortState
        .reduce((sortedRecords, sortState) => stableSort(sortedRecords, (recordA, recordB) => {
          const comparator = sortState.column.sortComparator.getValue();
          const directionMultiplicator: number = sortState.direction;
          return comparator(recordA, recordB, sortState.column) * directionMultiplicator;
        }), records);
    }
  }
}
