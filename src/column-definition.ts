import {
  BehaviorSubject,
  Subject,
} from 'rxjs/Rx';

/**
 * Column definition class that is used by table component to setup data processing and displaying.
 */
export class ColumnDefinition {
  private titleSubject: Subject<string> = new BehaviorSubject('');
  private valueSubject: Subject<(record: any) => any> = new BehaviorSubject((record) => '');

  /**
   * Column header.
   * @type {Subject<string>}
   */
  get title(): Subject<string> {
    return this.titleSubject;
  }

  /**
   * Function that calculates cell value for column.
   * @type {(record: any) => any}
   */
  get value(): Subject<(record: any) => any> {
    return this.valueSubject;
  }

  /**
   * @param {ColumnDefinitionSource|undefined} columnDefinitionSource Data source
   * for column definition.
   */
  constructor(columnDefinitionSource?: ColumnDefinitionSource) {
    if (columnDefinitionSource) {
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
      } else if (title instanceof Subject) {
        this.titleSubject = title as Subject<string>;
      }
    }
    if (columnDefinitionSource.value) {
      const value = columnDefinitionSource.value;
      if (typeof value === 'string') {
        this.valueSubject.next((record) => record[value]);
      } else if (typeof value === 'function') {
        this.valueSubject.next(value);
      } else if (value instanceof Subject) {
        this.valueSubject = value as Subject<(record: any) => any>;
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
  public title: string | Subject<string>;

  /**
   * Function that calculates cell value for column.
   * @type {string | ((record: any) => any) | Subject<(record: any) => any>}
   */
  public value: string | ((record: any) => any) | Subject<(record: any) => any>;
}
