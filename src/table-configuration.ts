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
   * Subject with sort algorithm.
   */
  private sortAlgorithmSubject: BehaviorSubject<SortAlgorithm> = new BehaviorSubject(new MultiColumnSort());

  /**
   * Subject with flag, that indicates whether pagination should be enabled or not.
   */
  private paginationEnabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Subject with flag, that indicates whether filtration should be enabled or not.
   */
  public get filterEnabled(): BehaviorSubject<boolean> {
    return this.filterEnabledSubject;
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
   * Sort algorithm.
   */
  public sortAlgorithm?: SortAlgorithm | BehaviorSubject<SortAlgorithm>;

  /**
   * Flag that indicates whether pagination should be enabled or not.
   */
  public paginationEnabled?: boolean | BehaviorSubject<boolean>;
}
