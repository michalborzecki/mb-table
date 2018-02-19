import { Observable } from 'rxjs/Rx';
import { ColumnDefinition } from '../column-definition';

/**
 * Sort direction values for column. `Default` means no sorting.
 */
export enum SortDirection {
  Ascending = 1,
  Descending = -1,
  Default = 0,
};

/**
 * State of column sort.
 */
export class ColumnSortState {
  /**
   * Column definition.
   * @type {ColumnDefinition}
   */
  public column: ColumnDefinition;

  /**
   * Sort direction for column.
   * @type {BehaviorSubject<SortDirection>}
   */
  public direction: SortDirection;

  /**
   * @param {ColumnDefinition} column Column definition.
   */
  constructor(column: ColumnDefinition, direction?: SortDirection) {
    this.column = column;
    this.direction = direction ? direction : SortDirection.Default;
  }
}

/**
 * Base class for sort algorithm implementations used to sort records.
 */
export abstract class SortAlgorithm {
  /**
   * Subject with column sort state by which records will be sorted.
   * @type {Observable<ColumnDefinition[]>}
   */
  public abstract get columnsSortState(): Observable<ColumnSortState[]>;

  /**
   * Notifies about sort algorith configuration change.
   * @type {Observable<SortAlgorithm>}
   */
  public get configurationChanged(): Observable<SortAlgorithm> {
    return this.columnsSortState.switchMap(columnsSortState => {
      if (columnsSortState.length) {
        return Observable.combineLatest(
          ...columnsSortState.map(columnSortState => columnSortState.column.sortComparator),
          ...columnsSortState.map(columnSortState => columnSortState.column.sortEnabled),
        ).map(x => this);
      } else {
        return Observable.of(this);
      }
    }).startWith(this);
  }

  /**
   * Adds next column sort state to actually used configuration.
   * @param {ColumnSortState} columnSortState Next column sort state.
   * @returns {void}
   */
  public abstract applyColumnSort(columnSortState: ColumnSortState): void;

  /**
   * Clears all sort configuration.
   * @returns {void}
   */
  public abstract resetSort(): void;

  /**
   * Performs sort of given records.
   * @param {any[]} records Array of records to sort.
   * @return {any[]} Array of sorted records.
   */
  public abstract sort(records: any[]): any[];
}
