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
   * Column header.
   * @type {Subject<string>}
   */
  get title(): BehaviorSubject<string> {
    return this.titleSubject;
  }

  /**
   * Function that calculates cell value for column.
   * @type {(record: any) => any}
   */
  get value(): BehaviorSubject<(record: any) => any> {
    return this.valueSubject;
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
    if (columnDefinitionSource.title) {
      const title = columnDefinitionSource.title;
      if (typeof title === 'string') {
        this.titleSubject.next(title);
      } else if (title instanceof BehaviorSubject) {
        this.titleSubject = title as BehaviorSubject<string>;
      }
    }
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
  }
};

/**
 * Class that is used as a source for newly created column definition object.
 */
export class ColumnDefinitionSource {
  /**
   * Column header.
   * @type {string | Subject<string>}
   */
  public title?: string | BehaviorSubject<string>;

  /**
   * Function that calculates cell value for column.
   * @type {string | ((record: any) => any) | BehaviorSubject<(record: any) => any>}
   */
  public value?: string | ((record: any) => any) | BehaviorSubject<(record: any) => any>;
}
