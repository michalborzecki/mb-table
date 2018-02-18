import { BehaviorSubject } from 'rxjs/Rx';
import { defaultComparator } from './sort/default-comparator';
import { CellRenderer } from './cell-renderer';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { nonStrictFilter } from './filter/non-strict-filter';
import { numberFilter } from './filter/number-filter';
import { strictFilter } from './filter/strict-filter';

/**
 * Column definition class that is used by table component to setup data processing and displaying.
 */
export class ColumnDefinition {
  /**
   * Source used while creating definition object.
   * @type {ColumnDefinitionSource}
   */
  public readonly columnDefinitionSource?: ColumnDefinitionSource;

  /**
   * Subject with column renderer type.
   * @type {BehaviorSubject<CellRenderer>}
   */
  private rendererSubject: BehaviorSubject<CellRenderer> = new BehaviorSubject(CellRenderer.Text);

  /**
   * Subject with column title string.
   * @type {BehaviorSubject<string>}
   */
  private titleSubject: BehaviorSubject<string> = new BehaviorSubject('');

  /**
   * Subject with function that calculates cell value for column.
   * @type {BehaviorSubject<(record: any) => any>}
   */
  private valueSubject: BehaviorSubject<(record: any) => any> = new BehaviorSubject((record) => '');

  /**
   * Subject with function that calculates class names for column.
   * @type {BehaviorSubject<(record: any) => any>}
   */
  private classNamesSubject: BehaviorSubject<(record: any) => any> = new BehaviorSubject((record) => '');

  /**
   * Subject with flag, that indicates whether filtration should be enabled or not.
   */
  private filterEnabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);

  /**
   * Subject with column filter renderer type.
   * @type {BehaviorSubject<CellRenderer>}
   */
  private filterRendererSubject: BehaviorSubject<CellRenderer> = new BehaviorSubject(undefined);

  /**
   * Subject with column filter query.
   * @type {BehaviorSubject<any>}
   */
  private filterQuerySubject: BehaviorSubject<any> = new BehaviorSubject('');

  /**
   * Subject with function that is used to check whether record should be filtered out or not.
   * @type {BehaviorSubject<(record: any, column: ColumnDefinition) => boolean>}
   */
  private filterFunctionSubject: BehaviorSubject<(record: any, column: ColumnDefinition) => boolean> =
  new BehaviorSubject(undefined);

  /**
   * Subject with column filter change debounce time.
   * @type {BehaviorSubject<number>}
   */
  private filterDebounceTimeSubject: BehaviorSubject<number> = new BehaviorSubject(300);

  /**
   * Observable, that returns actual checked value of checkbox filter.
   * @type {BehaviorSubject<boolean>}
   */
  private checkboxFilterCheckedObservable: Observable<boolean>;

  /**
   * Observable, that returns actual indeterminate value of checkbox filter.
   * @type {BehaviorSubject<boolean>}
   */
  private checkboxFilterIndeterminateObservable: Observable<boolean>;

  /**
   * Filter form control associated with column filter.
   * @type {FormControl}
   */
  public readonly filterFormControl: FormControl = new FormControl();

  /**
   * Observable that is used as an event emitter when any of the filter
   * settings has changed.
   */
  public readonly filterConfigurationChanged: Observable<ColumnDefinition>;

  /**
   * Subject with function that is used while sorting to compare two records.
   * @type {BehaviorSubject<(recordA: any, recordB: any, column: ColumnDefinition) => number>}
   */
  private sortComparatorSubject:
    BehaviorSubject<(recordA: any, recordB: any, column: ColumnDefinition) => number> =
    new BehaviorSubject(defaultComparator);

  /**
   * Subject with column renderer type.
   * @type {BehaviorSubject<CellRenderer>}
   */
  get renderer(): BehaviorSubject<CellRenderer> {
    return this.rendererSubject;
  }

  /**
   * Subject with column header string.
   * @type {Subject<string>}
   */
  get title(): BehaviorSubject<string> {
    return this.titleSubject;
  }

  /**
   * Subject with function that calculates cell value for column.
   * @type {(record: any) => any}
   */
  get value(): BehaviorSubject<(record: any) => any> {
    return this.valueSubject;
  }

  /**
   * Subject with function that calculates class names for column.
   * @type {BehaviorSubject<(record: any) => any>}
   */
  get classNames(): BehaviorSubject<(record: any) => any> {
    return this.classNamesSubject;
  }

  /**
   * Subject with flag, that indicates whether filtration should be enabled or not.
   */
  get filterEnabled(): BehaviorSubject<boolean> {
    return this.filterEnabledSubject;
  }

  /**
   * Subject with column filter renderer type.
   * @type {BehaviorSubject<CellRenderer>}
   */
  get filterRenderer(): BehaviorSubject<CellRenderer> {
    return this.filterRendererSubject;
  }

  /**
   * Subject with column filter query.
   * @type {BehaviorSubject<any>}
   */
  get filterQuery(): BehaviorSubject<any> {
    return this.filterQuerySubject;
  }

  /**
   * Subject with function that is used to check whether record should be filtered out or not.
   * @type {BehaviorSubject<(record: any, column: ColumnDefinition) => boolean>}
   */
  get filterFunction(): BehaviorSubject<(record: any, column: ColumnDefinition) => boolean> {
    return this.filterFunctionSubject;
  }

  /**
   * Subject with column filter change debounce time.
   * @type {BehaviorSubject<number>}
   */
  get filterDebounceTime(): BehaviorSubject<number> {
    return this.filterDebounceTimeSubject;
  }

  /**
   * Subject with function that is used while sorting to compare two records.
   * @type {BehaviorSubject<(recordA: any, recordB: any, column: ColumnDefinition) => number>}
   */
  get sortComparator(): BehaviorSubject<(recordA: any, recordB: any, column: ColumnDefinition) => number> {
    return this.sortComparatorSubject;
  }

  /**
   * Observable, that returns actual checked value of checkbox filter.
   * @type {BehaviorSubject<boolean>}
   */
  get checkboxFilterChecked(): Observable<boolean> {
    return this.checkboxFilterCheckedObservable;
  }

  /**
   * Observable, that returns actual indeterminate value of checkbox filter.
   * @type {BehaviorSubject<boolean>}
   */
  get checkboxFilterIndeterminate(): Observable<boolean> {
    return this.checkboxFilterIndeterminateObservable;
  }

  /**
   * @param {ColumnDefinitionSource|undefined} columnDefinitionSource Data source
   * for column definition.
   */
  constructor(columnDefinitionSource?: ColumnDefinitionSource) {
    if (columnDefinitionSource) {
      this.columnDefinitionSource = columnDefinitionSource;
      this.mergeDefinitionObject(columnDefinitionSource);
    }

    this.prepareFilterRenderer();
    this.prepareFilterFunction();
    this.prepareFilterFormControl();
    this.prepareCheckboxFilterState();

    this.filterConfigurationChanged = Observable.combineLatest(
      this.filterEnabledSubject,
      this.filterRendererSubject,
      this.filterQuerySubject,
      this.filterFunctionSubject,
      this.filterDebounceTimeSubject
    ).mapTo(this);
  }

  /**
   * Copies data from given object to column definition.
   * @param {any} columnDefinitionSource Definition of the column. Its format
   * is the same as native ColumnDefinition object except that some fields
   * can be more generic.
   */
  private mergeDefinitionObject(columnDefinitionSource: ColumnDefinitionSource) {
    // renderer
    if (columnDefinitionSource.renderer !== undefined) {
      const renderer = columnDefinitionSource.renderer;
      if (renderer instanceof BehaviorSubject) {
        this.rendererSubject = renderer as BehaviorSubject<CellRenderer>;
      } else if ((renderer as number) in CellRenderer) {
        this.rendererSubject.next(renderer as CellRenderer);
      }
    }

    // title
    if (columnDefinitionSource.title) {
      const title = columnDefinitionSource.title;
      if (typeof title === 'string') {
        this.titleSubject.next(title);
      } else if (title instanceof BehaviorSubject) {
        this.titleSubject = title as BehaviorSubject<string>;
      }
    }

    // value
    if (columnDefinitionSource.value) {
      const value = columnDefinitionSource.value;
      if (typeof value === 'string') {
        this.valueSubject.next((record) => record[value]);
      } else if (typeof value === 'function') {
        this.valueSubject.next(value);
      } else if (value instanceof BehaviorSubject) {
        this.valueSubject = value as BehaviorSubject<(record: any) => any>;
      }
    }

    // classNames
    if (columnDefinitionSource.classNames) {
      const classNames = columnDefinitionSource.classNames;
      if (typeof classNames === 'string') {
        this.classNamesSubject.next((record) => classNames);
      } else if (typeof classNames === 'function') {
        this.classNamesSubject.next(classNames);
      } else if (classNames instanceof BehaviorSubject) {
        this.classNamesSubject = classNames as BehaviorSubject<(record: any) => any>;
      }
    }

    // filterEnabled
    if (columnDefinitionSource.filterEnabled !== undefined) {
      const filterEnabled = columnDefinitionSource.filterEnabled;
      if (filterEnabled instanceof BehaviorSubject) {
        this.filterEnabledSubject = filterEnabled;
      } else {
        this.filterEnabledSubject.next(filterEnabled);
      }
    }

    // filterRenderer
    if (columnDefinitionSource.filterRenderer !== undefined) {
      const filterRenderer = columnDefinitionSource.filterRenderer;
      if (filterRenderer instanceof BehaviorSubject) {
        this.filterRendererSubject = filterRenderer as BehaviorSubject<CellRenderer>;
      } else if ((filterRenderer as number) in CellRenderer) {
        this.filterRendererSubject.next(filterRenderer as CellRenderer);
      }
    }

    // filterQuery
    if (columnDefinitionSource.filterQuery !== undefined) {
      const filterQuery = columnDefinitionSource.filterQuery;
      if (filterQuery instanceof BehaviorSubject) {
        this.filterQuerySubject = filterQuery as BehaviorSubject<any>;
      } else {
        this.filterQuerySubject.next(filterQuery);
      }
    }

    // filterFunction
    if (columnDefinitionSource.filterFunction) {
      const filterFunction = columnDefinitionSource.filterFunction;
      if (typeof filterFunction === 'function') {
        this.filterFunctionSubject.next(filterFunction);
      } else if (filterFunction instanceof BehaviorSubject) {
        this.filterFunctionSubject = filterFunction as BehaviorSubject<((record: any, column: ColumnDefinition) => boolean)>;
      }
    }

    // filterDebounceTime
    if (columnDefinitionSource.filterDebounceTime) {
      const filterDebounceTime = columnDefinitionSource.filterDebounceTime;
      if (typeof filterDebounceTime === 'number') {
        this.filterDebounceTimeSubject.next(filterDebounceTime);
      } else if (filterDebounceTime instanceof BehaviorSubject) {
        this.filterDebounceTimeSubject = filterDebounceTime as BehaviorSubject<number>;
      }
    }

    // sortComparator
    if (columnDefinitionSource.sortComparator) {
      const sortComparator = columnDefinitionSource.sortComparator;
      if (typeof sortComparator === 'function') {
        this.sortComparatorSubject.next(sortComparator);
      } else if (sortComparator instanceof BehaviorSubject) {
        this.sortComparatorSubject =
          sortComparator as BehaviorSubject<((recordA: any, recordB: any, column: ColumnDefinition) => any)>;
      }
    }
  }

  /**
   * Configures filter renderer.
   * @returns {undefined}
   */
  private prepareFilterRenderer() {
    if (this.filterRendererSubject.getValue() === undefined) {
      this.filterRendererSubject.next(this.rendererSubject.getValue());
    }
  }

  /**
   * Configures filter function.
   * @returns {undefined}
   */
  private prepareFilterFunction() {
    if (this.filterFunctionSubject.getValue() === undefined) {
      let filterFunction;
      switch (this.filterRendererSubject.getValue()) {
        case CellRenderer.Text:
          filterFunction = nonStrictFilter;
          break;
        case CellRenderer.Number:
          filterFunction = numberFilter;
          break;
        case CellRenderer.Checkbox:
          filterFunction = strictFilter;
          break;
      }
      this.filterFunctionSubject.next(filterFunction);
    }
  }

  /**
   * Configures filter form control.
   * @returns {undefined}
   */
  private prepareFilterFormControl() {
    this.filterFormControl.valueChanges
      .distinctUntilChanged()
      .debounce(() => Observable.timer(this.filterDebounceTimeSubject.getValue()))
      .subscribe((value: any) => this.filterQuerySubject.next(value));
  }

  private prepareCheckboxFilterState() {
    this.checkboxFilterCheckedObservable = this.filterQuerySubject.map(value => value === true);
    this.checkboxFilterIndeterminateObservable = this.filterQuerySubject.map(value => value === '');
  }
};

/**
 * Class that is used as a source for newly created column definition object.
 */
export class ColumnDefinitionSource {
  /**
   * Column renderer. May be a CellRenderer or BehaviorSubject with CellRenderer.
   * @type {CellRenderer | BehaviorSubject<CellRenderer>}
   */
  public renderer?: CellRenderer | BehaviorSubject<CellRenderer>;

  /**
   * Column header. May be a string or prepared BehaviorSubject with string.
   * @type {string | BehaviorSubject<string>}
   */
  public title?: string | BehaviorSubject<string>;

  /**
   * Source for function, which calculates cell value for column. May be:
   * * a string, which is a name of record property that will be used as a value,
   * * a function that takes record object and returns cell value,
   * * prepared BehaviorSubject with function the same as explained above.
   * @type {string | ((record: any) => any) | BehaviorSubject<(record: any) => any>}
   */
  public value?: string | ((record: any) => any) | BehaviorSubject<(record: any) => any>;

  /**
   * Source for function, which calculates class names for column. May be:
   * * a string, which is a plain representation of class names,
   * * a function that takes record object and returns class names string,
   * * prepared BehaviorSubject with function the same as explained above.
   * @type {string | ((record: any) => any) | BehaviorSubject<(record: any) => any>}
   */
  public classNames?: string | ((record: any) => any) | BehaviorSubject<(record: any) => any>;

  /**
   * Subject with flag, that indicates whether filtration should be enabled or not.
   */
  public filterEnabled?: boolean | BehaviorSubject<boolean>;

  /**
   * Column filter renderer. May be a CellRenderer or BehaviorSubject with CellRenderer.
   * @type {CellRenderer | BehaviorSubject<CellRenderer>}
   */
  public filterRenderer?: CellRenderer | BehaviorSubject<CellRenderer>;

  /**
   * Column filter query. May be any value or prepared BehaviorSubject with it.
   * @type {any | BehaviorSubject<any>}
   */
  public filterQuery?: any | BehaviorSubject<any>;

  /**
   * Source for function, which is used while filtering to check if record should
   * be filtered out. May be:
   * * a function which checks if given record matches given query and returns boolean result,
   * * prepared BehaviorSubject with function the same as explained above.
   * @type {(query: string, record: any, column: ColumnDefinition) => boolean}
   * @type {BehaviorSubject<(query: string, record: any, column: ColumnDefinition) => boolean>}
   */
  public filterFunction?:
    ((record: any, column: ColumnDefinition) => boolean) |
    BehaviorSubject<(record: any, column: ColumnDefinition) => boolean>;

  /**
   * Column filter change debounce time. May be a number (time in milliseconds) or
   * prepared BehaviorSubject with number.
   * @type {number | BehaviorSubject<number>}
   */
  public filterDebounceTime?: number | BehaviorSubject<number>;

  /**
   * Source for function, which is used while sorting to compare two records. May be:
   * * a function which compares two records, a and b, and returns -1 if a < b, 0 if a = b and 1 if a > b,
   * * prepared BehaviorSubject with function the same as explained above.
   * @type {(recordA: any, recordB: any, column: ColumnDefinition) => number}
   * @type {BehaviorSubject<(recordA: any, recordB: any, column: ColumnDefinition) => number>}
   */
  public sortComparator?: ((recordA: any, recordB: any, column: ColumnDefinition) => number) |
    BehaviorSubject<(recordA: any, recordB: any, column: ColumnDefinition) => number>;
}
