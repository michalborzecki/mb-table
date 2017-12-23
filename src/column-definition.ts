import { BehaviorSubject } from 'rxjs/Rx';

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
   * @param {ColumnDefinitionSource|undefined} columnDefinitionSource Data source
   * for column definition.
   */
  constructor(columnDefinitionSource?: ColumnDefinitionSource) {
    if (columnDefinitionSource) {
      this.columnDefinitionSource = columnDefinitionSource;
      this.mergeDefinitionObject(columnDefinitionSource);
    }
  }

  /**
   * Copies data from given object to column definition.
   * @param {any} columnDefinitionSource Definition of the column. Its format
   * is the same as native ColumnDefinition object except that some fields
   * can be more generic.
   */
  private mergeDefinitionObject(columnDefinitionSource: ColumnDefinitionSource) {
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
  }
};

/**
 * Class that is used as a source for newly created column definition object.
 */
export class ColumnDefinitionSource {
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
}
