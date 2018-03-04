import { BehaviorSubject } from 'rxjs/Rx';
import { SortAlgorithm } from './sort/sort-algorithm';
import { MultiColumnSort } from './sort/multi-column-sort';

/**
 * Table configuration class that is used to setup table settings.
 */
export class TableConfiguration {
  /**
   * Source used while creating configuration object.
   */
  private tableConfigurationSource?: TableConfigurationSource;

  /**
   * Subject with flag, that indicates whether filtration should be enabled or not.
   */
  private filterEnabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);

  /**
   * Subject with flag, that indicates whether sort should be enabled or not.
   */
  private sortEnabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);

  /**
   * Subject with sort algorithm.
   */
  private sortAlgorithmSubject: BehaviorSubject<SortAlgorithm> = new BehaviorSubject(new MultiColumnSort());

  /**
   * Subject with flag, that indicates whether pagination should be enabled or not.
   */
  private paginationEnabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);

  /**
   * Subject with page size used by pagination mechanism.
   */
  private pageSizeSubject: BehaviorSubject<number> = new BehaviorSubject(20);

  /**
   * Subject with a number of the active page.
   */
  private activePageSubject: BehaviorSubject<number> = new BehaviorSubject(1);

  /**
   * Subject with active page control change debounce time.
   * @type {BehaviorSubject<number>}
   */
  private activePageControlDebounceTimeSubject: BehaviorSubject<number> = new BehaviorSubject(300);

  /**
   * Subject with flag, that indicates whether filtration should be enabled or not.
   */
  public get filterEnabled(): BehaviorSubject<boolean> {
    return this.filterEnabledSubject;
  }

  /**
   * Subject with flag, that indicates whether sort should be enabled or not.
   */
  public get sortEnabled(): BehaviorSubject<boolean> {
    return this.sortEnabledSubject;
  }

  /**
   * Subject with sort algorithm.
   */
  public get sortAlgorithm(): BehaviorSubject<SortAlgorithm> {
    return this.sortAlgorithmSubject;
  }

  /**
   * Subject with flag, that indicates whether pagination should be enabled or not.
   */
  public get paginationEnabled(): BehaviorSubject<boolean> {
    return this.paginationEnabledSubject;
  }

  /**
   * Subject with page size used by pagination mechanism.
   */
  public get pageSize(): BehaviorSubject<number> {
    return this.pageSizeSubject;
  }

  /**
   * Subject with a number of the active page.
   */
  public get activePage(): BehaviorSubject<number> {
    return this.activePageSubject;
  }

  /**
   * Subject with active page control change debounce time.
   */
  public get activePageControlDebounceTime(): BehaviorSubject<number> {
    return this.activePageControlDebounceTimeSubject;
  }

  /**
   * @param tableConfigurationSource Data source for table configuration.
   */
  constructor(tableConfigurationSource?: TableConfigurationSource) {
    if (tableConfigurationSource) {
      this.tableConfigurationSource = tableConfigurationSource;
      this.mergeConfigurationObject(tableConfigurationSource);
    }
  }

  /**
   * Copies data from given object to table configuration.
   * @param tableConfigurationSource Configuration of the table. Its format
   * is the same as native TableConfiguration object except that some fields
   * can be more generic.
   */
  private mergeConfigurationObject(tableConfigurationSource: TableConfigurationSource) {
    // filterEnabled
    if (tableConfigurationSource.filterEnabled !== undefined) {
      const filterEnabled = tableConfigurationSource.filterEnabled;
      if (filterEnabled instanceof BehaviorSubject) {
        this.filterEnabledSubject = filterEnabled;
      } else {
        this.filterEnabledSubject.next(filterEnabled);
      }
    }

    // sortEnabled
    if (tableConfigurationSource.sortEnabled !== undefined) {
      const sortEnabled = tableConfigurationSource.sortEnabled;
      if (sortEnabled instanceof BehaviorSubject) {
        this.sortEnabledSubject = sortEnabled;
      } else {
        this.sortEnabledSubject.next(sortEnabled);
      }
    }

    // sortAlgorithm
    if (tableConfigurationSource.sortAlgorithm !== undefined) {
      const sortAlgorithm = tableConfigurationSource.sortAlgorithm;
      if (sortAlgorithm instanceof BehaviorSubject) {
        this.sortAlgorithmSubject = sortAlgorithm;
      } else {
        this.sortAlgorithmSubject.next(sortAlgorithm);
      }
    }

    // paginationEnabled
    if (tableConfigurationSource.paginationEnabled !== undefined) {
      const paginationEnabled = tableConfigurationSource.paginationEnabled;
      if (paginationEnabled instanceof BehaviorSubject) {
        this.paginationEnabledSubject = paginationEnabled;
      } else {
        this.paginationEnabledSubject.next(paginationEnabled);
      }
    }

    // pageSize
    if (tableConfigurationSource.pageSize !== undefined) {
      const pageSize = tableConfigurationSource.pageSize;
      if (pageSize instanceof BehaviorSubject) {
        this.pageSizeSubject = pageSize;
      } else {
        this.pageSizeSubject.next(pageSize);
      }
    }

    // activePage
    if (tableConfigurationSource.activePage !== undefined) {
      const activePage = tableConfigurationSource.activePage;
      if (activePage instanceof BehaviorSubject) {
        this.activePageSubject = activePage;
      } else {
        this.activePageSubject.next(activePage);
      }
    }

    // activePageControlDebounceTime
    if (tableConfigurationSource.activePageControlDebounceTime !== undefined) {
      const activePageControlDebounceTime = tableConfigurationSource.activePageControlDebounceTime;
      if (activePageControlDebounceTime instanceof BehaviorSubject) {
        this.activePageControlDebounceTimeSubject = activePageControlDebounceTime;
      } else {
        this.activePageControlDebounceTimeSubject.next(activePageControlDebounceTime);
      }
    }
  }
}

/**
 * Class that is used as a source for newly created table configuration object.
 */
export class TableConfigurationSource {
  /**
   * Flag that indicates whether filtration should be enabled or not.
   */
  public filterEnabled?: boolean | BehaviorSubject<boolean>;

  /**
   * Flag that indicates whether sort should be enabled or not.
   */
  public sortEnabled?: boolean | BehaviorSubject<boolean>;

  /**
   * Sort algorithm.
   */
  public sortAlgorithm?: SortAlgorithm | BehaviorSubject<SortAlgorithm>;

  /**
   * Flag that indicates whether pagination should be enabled or not.
   */
  public paginationEnabled?: boolean | BehaviorSubject<boolean>;

  /**
   * Page size used by pagination mechanism.
   */
  public pageSize?: number | BehaviorSubject<number>;

  /**
   * Number of the active page.
   */
  public activePage?: number | BehaviorSubject<number>;

  /**
   * Subject with active page control change debounce time.
   */
  public activePageControlDebounceTime?: number | BehaviorSubject<number>;
}
