import {
  SortAlgorithm,
  ColumnSortState,
  SortDirection,
} from './sort-algorithm';
import { stableSort } from './stable-sort';
import { BehaviorSubject, Observable } from 'rxjs/Rx';

/**
 * Implementation of sort by single column algorithm.
 */
export class SingleColumnSort extends SortAlgorithm {
  /**
   * Subject with column sort state by which records will be sorted.
   * @type {BehaviorSubject<ColumnDefinition>}
   */
  private columnSortStateSubject: BehaviorSubject<ColumnSortState>;

  /**
   * Subject with column sort state by which records will be sorted.
   * @type {BehaviorSubject<ColumnDefinition>}
   */
  public get columnSortState(): BehaviorSubject<ColumnSortState> {
    return this.columnSortStateSubject;
  }

  /**
   * @override
   */
  public get columnsSortState(): Observable<ColumnSortState[]> {
    return this.columnSortStateSubject.map(column => column ? [column] : []);
  }

  /**
   * @param {BehaviorSubject<ColumnSortState>} columnSortState Subject with
   * column sort state by which records will be sorted.
   */
  constructor(columnSortState?: BehaviorSubject<ColumnSortState>) {
    super();
    if (columnSortState) {
      this.columnSortStateSubject = columnSortState;
    } else {
      this.columnSortStateSubject = new BehaviorSubject(null);
    }
  }

  /**
   * @override
   */
  public applyColumnSort(columnSortState: ColumnSortState): void {
    this.columnSortStateSubject.next(columnSortState);
  }

  /**
   * @override
   */
  public resetSort(): void {
    this.columnSortStateSubject.next(null);
  }

  /**
   * @override
   */
  public sort(records: any[]): any[] {
    const columnSortState = this.columnSortStateSubject.getValue();
    if (!columnSortState || columnSortState.direction === SortDirection.Default) {
      return records.slice(0);
    }

    const sortComparator = columnSortState.column.sortComparator.getValue();
    const directionMultiplicator: number = columnSortState.direction;
    return stableSort(records, (recordA, recordB) =>
      sortComparator(recordA, recordB, columnSortState.column) * directionMultiplicator
    );
  }
}
