import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  AfterViewInit,
  AfterViewChecked,
  NgZone,
  OnInit,
  ElementRef,
} from '@angular/core';
import * as $_ from 'jquery';
import * as elementResizeDetector_ from 'element-resize-detector';
import { BehaviorSubject, Subject, Observable } from 'rxjs/Rx';
import { CellRenderer } from './cell-renderer';
import { ColumnDefinition } from './column-definition';
import { SortDirection, ColumnSortState } from './sort/sort-algorithm';
import { TableConfiguration } from './table-configuration';
import { ChangePageType } from './pagination/change-page-type';
import { FormControl } from '@angular/forms';

let $ = $_;
let elementResizeDetector = elementResizeDetector_;

const enum GridRefreshSteps {
  FILTER,
  SORT,
  PAGINATION,
  NEW_ROW
}

const sortDirectionCycle = [
  SortDirection.Default,
  SortDirection.Ascending,
  SortDirection.Descending,
  SortDirection.Default,
];

@Component({
  selector: 'mb-table',
  styleUrls: ['mb-table.css'],
  templateUrl: 'mb-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MbTableComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @Input() settings: any;
  @Input('source')
  get _source(): any[] {
    return this.source.getValue();
  };
  set _source(value: any[]) {
    this.source.next(value);
  }
  @Input('columns')
  get _columns(): any[] {
    return this.columns.getValue();
  };
  set _columns(value: any[]) {
    this.columns.next(value);
  }
  @Input('configuration')
  get _configuration(): TableConfiguration {
    return this.configuration.getValue();
  };
  set _configuration(value: TableConfiguration) {
    this.configuration.next(value);
  }
  CellRenderer: typeof CellRenderer = CellRenderer;
  SortDirection: typeof SortDirection = SortDirection;
  ChangePageType: typeof ChangePageType = ChangePageType;

  configuration: BehaviorSubject<TableConfiguration> = new BehaviorSubject(new TableConfiguration());
  source: BehaviorSubject<any[]> = new BehaviorSubject([]);
  columns: BehaviorSubject<any[]> = new BehaviorSubject([]);
  columnsSortDirection: Observable<Map<ColumnDefinition, SortDirection>> = Observable.combineLatest(
    this.configuration.switchMap(c => c.sortEnabled),
    this.columns,
    this.configuration.switchMap(c => c.sortAlgorithm).switchMap(s => s.columnsSortState),
    (sortEnabled, columns, columnsSortState) => {
      const mapSource = columns.map(column => {
        const sortState = columnsSortState.filter(columnSortState => columnSortState.column === column)[0];
        return [column, sortEnabled && sortState ? sortState.direction : SortDirection.Default] as [ColumnDefinition, SortDirection];
      });
      return new Map(mapSource);
    }
  );

  private lastSortChangedColumn: Subject<ColumnDefinition> = new Subject();
  private resetSortButtonClick: Subject<Event> = new Subject();
  private activePageChange: Subject<ChangePageType> = new Subject();

  isDuplicationEnabled = true;
  isEditionEnabled = true;
  isDeletionEnabled = true;
  isBatchChangeEnabled = true;
  isRowsSelectionEnabled = false;
  deselectRowOnClick = false;
  isFiltrationActive = true;

  showCreateButton = true;
  showResetSortButton = true;
  // defaultSortConfiguration: any[] = [];

  pageSize = 0;
  selectedPage = 0;
  selectedPageTextValue = '1';
  numberOfPages = 1;

  /**
   * Source data after filtration.
   */
  private filteredSource: Observable<any[]> = Observable.combineLatest(
    this.configuration.switchMap(c => c.filterEnabled),
    this.source,
    this.columns.switchMap(columns => columns.length ?
      Observable.combineLatest(...columns.map(c => c.filterConfigurationChanged)) :
      Observable.of([])
    ),
    (filterEnabled, source, columns) => {
      if (filterEnabled) {
        return columns
          .filter(c => c.filterEnabled.getValue() && c.filterQuery.getValue() !== '')
          .reduce((filtered, c) =>
            filtered.filter(record =>
                c.filterFunction.getValue()(record, c)
            ), source.slice(0));
      } else {
        return source.slice(0);
      }
  });

  /**
   * Filtered source data after sorting.
   */
  private sortedSource: Observable<any[]> = Observable.combineLatest(
    this.configuration.switchMap(c => c.sortEnabled),
    this.configuration.switchMap(c => c.sortAlgorithm).switchMap(s => s.configurationChanged),
    this.filteredSource,
    (sortEnabled, sortAlgorithm, filteredSource) =>
      sortEnabled ? sortAlgorithm.sort(filteredSource) : filteredSource.slice(0)
  );

  private amountOfPages: Observable<number> = Observable.combineLatest(
    this.configuration.switchMap(c => c.pageSize),
    this.sortedSource,
    function (pageSize, sortedSource) {
      if (!(pageSize > 0)) {
        pageSize = 20;
      }
      return sortedSource.length === 0 ? 1 : Math.ceil(sortedSource.length / pageSize);
    }
  );

  private activePage: Observable<number> = Observable.combineLatest(
    this.configuration.switchMap(c => c.activePage),
    this.amountOfPages,
    function (activePage, amountOfPages) {
      if (activePage > amountOfPages) {
        return amountOfPages;
      } else if (activePage < 1) {
        return 1;
      } else {
        return activePage;
      }
    }
  );

  private paginatedSource: Observable<any[]> = Observable.combineLatest(
    this.sortedSource,
    this.activePage.distinctUntilChanged(),
    this.configuration.switchMap(c => c.paginationEnabled),
    this.configuration.switchMap(c => c.pageSize),
    function (sortedSource, activePage, paginationEnabled, pageSize) {
      if (paginationEnabled) {
        const startIndex = (activePage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, sortedSource.length);
        return sortedSource.slice(startIndex, endIndex);
      } else {
        return sortedSource.slice(0);
      }
    }
  );
  processedSource: Observable<any[]> = this.paginatedSource.map(arr => arr.slice(0));

  activePageControl: FormControl = new FormControl();

  editedRows: any[] = [];
  createdRows: any = [];
  selectedRows: any[] = [];
  batchChangeRow: any = null;
  batchChangeColumnsSelection: boolean[];

  duplicateFunction: Function = null;
  editCommitFunction: Function = null;
  deleteCommitFunction: Function = null;
  selectedRowsChanged: Function = null;
  newRowPrototype: any = {};
  onCreateFunction: Function = null;
  editionStateChanged: Function = null;

  editorToFocus: any = {
    row: null,
    column: null
  };

  private tableWidthOld = 0;

  constructor(
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.setupColumnSortChangeHandler();
    this.setupSortResetHandler();
    this.setupPageChangeHandler();
  }

  private setupColumnSortChangeHandler(): void {
    this.lastSortChangedColumn
      .withLatestFrom(
        this.configuration.switchMap(c => c.sortEnabled),
        this.configuration.switchMap(c => c.sortAlgorithm),
        this.columnsSortDirection
      )
      .filter(([column, sortEnabled, ]) =>
        sortEnabled && column.sortEnabled.getValue()
      )
      .subscribe(([column, , sortAlgorithm, columnsSortDirection]) => {
        if (column.sortEnabled.getValue()) {
          const actualDirection = columnsSortDirection.get(column);
          if (actualDirection === undefined) {
            return;
          }
          let nextDirection = sortDirectionCycle[sortDirectionCycle.indexOf(actualDirection) + 1];
          sortAlgorithm.applyColumnSort(new ColumnSortState(column, nextDirection));
        }
      });
  }

  private setupSortResetHandler(): void {
    this.resetSortButtonClick
      .withLatestFrom(this.configuration.switchMap(c => c.sortAlgorithm))
      .subscribe(([, sortAlgorithm]) => sortAlgorithm.resetSort());
  }

  private setupPageChangeHandler(): void {
    this.activePageChange
      .withLatestFrom(this.amountOfPages, this.activePage)
      .subscribe(([changePageType, amountOfPages, activePage]) => {
        let nextActivePage;
        switch (changePageType) {
          case ChangePageType.Previous:
            nextActivePage = Math.max(activePage - 1, 1);
            break;
          case ChangePageType.Next:
            nextActivePage = Math.min(activePage + 1, amountOfPages);
            break;
          case ChangePageType.First:
            nextActivePage = 1;
            break;
          case ChangePageType.Last:
            nextActivePage = amountOfPages;
            break;
        }
        this.configuration.getValue().activePage.next(nextActivePage);
      });
    this.activePageControl.valueChanges
      .map(value => parseInt(value, 10))
      .withLatestFrom(this.amountOfPages, this.activePage)
      .filter(([page, amountOfPages, activePage]) => page !== NaN && page >= 1 && page <= amountOfPages && page !== activePage)
      .withLatestFrom(this.configuration.switchMap(c => c.activePageControlDebounceTime))
      .debounce(([, debounceTime]) => Observable.timer(debounceTime))
      .map(([[page]]) => page)
      .subscribe(page => this.configuration.getValue().activePage.next(page));
  }

  setupColumnsWidth() {
    const table = $(this.elementRef.nativeElement);
    const tableWidth: number = $(this.elementRef.nativeElement).innerWidth();
    // prevents from unnecessary recalculations
    if (this.tableWidthOld === tableWidth) {
      return;
    }
    this.tableWidthOld = tableWidth;

    const ths = table.find('th');
    const fixedThs = ths.filter('.fixedWidth');
    const dynamicThs = ths.filter(':not(.fixedWidth)');
    const thead = table.find('thead');
    const tbody = table.find('tbody');
    const scrollWidth: number = tbody[0].offsetWidth - tbody[0].clientWidth;
    const consumedWidth: number = fixedThs.toArray()
      .map((th) => $(th).outerWidth())
      .reduce((sum, next) => sum + next, 0);
    const widthPerDynamicTh = (tableWidth - consumedWidth) / dynamicThs.length;

    dynamicThs.css('width', widthPerDynamicTh + 'px');
    thead.css('padding-right', scrollWidth + 'px');
    this.columns.getValue().forEach((column, index) => {
      column.calculatedWidth = ths.eq(index).css('width');
    });
    // at the beginning tbody is hidden to not show totally
    // incorrect columns size
    thead.css('visibility', 'visible');
    tbody.css('visibility', 'visible');
    this.changeDetectorRef.markForCheck();
  }

  ngAfterViewInit() {
    elementResizeDetector({ strategy: 'scroll' }).listenTo(
      this.elementRef.nativeElement,
      () => this.setupColumnsWidth()
    );
  }

  ngAfterViewChecked() {
    // if (this.editorToFocus.row !== null) {
    //   const editor = $(this.elementRef.nativeElement).find(
    //     'tr.st-row-' + this.processedSource.indexOf(this.editorToFocus.row) +
    //     ' td.st-col-' + this.columns.getValue().indexOf(this.editorToFocus.column) + ' input');
    //   this.editorToFocus.row = this.editorToFocus.column = null;
    //   setTimeout(() => {
    //     editor.focus();
    //     editor.select();
    //   }, 10);
    // }
  }

  private prepareColumn(column: any, settings: any): void {
    column.calculatedWidth = 0;
    column.isEditable = column.isEditable === undefined ? true : !!column.isEditable;
    if (!column.editor) {
      column.editor = {};
    }
    if (!column.editor.type) {
      switch (column.renderer.getValue()) {
        case CellRenderer.Number:
          column.editor.type = 'number';
          break;
        case CellRenderer.Checkbox:
          column.editor.type = 'checkbox';
          break;
        case CellRenderer.Text:
          column.editor.type = 'text';
          break;
      }
    }
    if (!column.editor.source) {
      column.editor.source = () => [];
    }
    column.editor.showEmptyOption = column.editor.showEmptyOption === undefined ? true : !!column.editor.showEmptyOption;
    if (!column.editor.valueApplyFunction) {
      switch (column.editor.type) {
        case 'text':
          column.editor.valueApplyFunction = (value, row) =>
            row[column.id] = typeof value === 'string' ? value.trim() : value;
          break;
        case 'number':
          column.editor.valueApplyFunction = (value, row) =>
            row[column.id] = typeof value === 'number' || value === undefined ? value : Number(value);
          break;
        case 'checkbox':
          column.editor.valueApplyFunction = (value, row) =>
            row[column.id] = typeof value === 'boolean' ? value : !!value;
          break;
        case 'autocomplete':
        default:
          column.editor.valueApplyFunction = (value, row) => row[column.id] = value;
      }
    }
  }

  private prepareSettings(): void {
    this.duplicateFunction = this.settings.duplicateFunction ?
      this.settings.duplicateFunction :
      (row) => Object.assign({}, row);
    this.deleteCommitFunction = this.settings.deleteCommitFunction ?
      this.settings.deleteCommitFunction :
      (row) => this.source.next(this.source.getValue().filter(e => e !== row));
    this.editCommitFunction = this.settings.editCommitFunction ?
      this.settings.editCommitFunction :
      (row, newRow) => {
        Object.assign(row, newRow);
        return new Promise((resolve) => resolve());
      };
    this.newRowPrototype = this.settings.newRowPrototype;
    this.isRowsSelectionEnabled = this.settings.isRowsSelectionEnabled !== false;
    this.deselectRowOnClick = this.settings.deselectRowOnClick === true;
    this.selectedRowsChanged = typeof this.settings.selectedRowsChanged === 'function' ?
      this.settings.selectedRowsChanged : () => undefined;
    this.onCreateFunction = this.settings.onCreateFunction || this.create;
    this.editionStateChanged = typeof this.settings.editionStateChanged === 'function' ?
      this.settings.editionStateChanged : () => undefined;

    this.isDuplicationEnabled = this.settings.isDuplicationEnabled !== false;
    this.isEditionEnabled = this.settings.isEditionEnabled !== false;
    this.isDeletionEnabled = this.settings.isDeletionEnabled !== false;
    this.isBatchChangeEnabled = (this.settings.isBatchChangeEnabled !== false) && this.isEditionEnabled;

    this.pageSize = this.settings.pageSize;
    this.showCreateButton = this.settings.showCreateButton !== false;
    this.showResetSortButton = this.settings.showResetSortButton !== false;
  }
  // private refreshGrid(fromStep: GridRefreshSteps = GridRefreshSteps.FILTER) {
  //   let processedSource;
  //   switch (fromStep) {
  //     case GridRefreshSteps.FILTER:
  //       processedSource = this.filteredSource = this.performFilter(this.source);
  //       /* falls through */
  //     case GridRefreshSteps.SORT:
  //       processedSource = this.sortedSource = this.performSort(this.filteredSource);
  //       /* falls through */
  //     case GridRefreshSteps.PAGINATION:
  //       if (this.isPaginationEnabled) {
  //         this.numberOfPages = Math.max(Math.floor(this.sortedSource.length / this.pageSize), 1);
  //         if (this.numberOfPages * this.pageSize < this.sortedSource.length) {
  //           this.numberOfPages++;
  //         }
  //         this.selectedPage = Math.min(this.selectedPage, this.numberOfPages - 1);
  //         processedSource = this.paginatedSource = this.performPagination(this.sortedSource);
  //       } else {
  //         processedSource = this.paginatedSource = this.sortedSource.slice(0);
  //       }
  //       /* falls through */
  //     case GridRefreshSteps.NEW_ROW:
  //       processedSource = this.paginatedSource.slice(0);
  //       if (this.createdRows.length > 0) {
  //         processedSource = this.createdRows.concat(processedSource);
  //       }
  //       /* falls through */
  //     default:
  //       this.processedSource = processedSource;
  //       this.changeDetectorRef.markForCheck();
  //       return;
  //   }
  // }

  public getCellValue(row: any, column: any): any {
    return column.value.getValue()(row);
  }

  // public selectRow(row: any, event: MouseEvent): void {
  //   if (!this.isRowsSelectionEnabled || row === this.batchChangeRow) {
  //     return;
  //   }
  //   if (event.ctrlKey && !event.shiftKey) {
  //     if (this.selectedRows.indexOf(row) === -1) {
  //       this.selectedRows.push(row);
  //     } else {
  //       this.selectedRows = this.selectedRows.filter(r => r !== row);
  //     }
  //   } else if (!event.ctrlKey && event.shiftKey) {
  //     if (this.selectedRows.length === 0) {
  //       this.selectedRows = [row];
  //     } else {
  //       let lastSelectedRow = this.selectedRows[this.selectedRows.length - 1];
  //       let lastIndex = this.processedSource.indexOf(lastSelectedRow);
  //       let newIndex = this.processedSource.indexOf(row);
  //       let newRowsSelection = this.processedSource.slice(
  //         Math.min(lastIndex, newIndex), Math.max(lastIndex, newIndex) + 1);
  //       let selectedRowsWithoutNew = this.selectedRows.filter(r => newRowsSelection.indexOf(r) === -1);
  //       if (selectedRowsWithoutNew.length + newRowsSelection.length === this.selectedRows.length) {
  //         this.selectedRows = selectedRowsWithoutNew;
  //       } else {
  //         this.selectedRows = selectedRowsWithoutNew
  //           .concat(lastIndex <= newIndex ? newRowsSelection : newRowsSelection.reverse());
  //       }
  //       window.getSelection().removeAllRanges();
  //     }
  //   } else {
  //     if (this.selectedRows.length > 1 || this.selectedRows.length === 0) {
  //       this.selectedRows = [row];
  //     } else if (this.deselectRowOnClick || this.selectedRows[0] !== row) {
  //       this.selectedRows = this.selectedRows[0] === row ? [] : [row];
  //     }
  //   }
  //   this.selectedRowsChanged.call(null, this.selectedRows);
  // }

  public edit(rows: any[], column: any = null): void {
    if (!this.isEditionEnabled || (rows.length === 1 && rows[0] === this.batchChangeRow)) {
      return;
    }
    this.editorToFocus.row = rows[0];
    this.editorToFocus.column = column ? column : this.columns.getValue()[0];
    rows.forEach(row => {
      if (this.editedRows.filter(r => r.original === row).length === 0) {
        this.editedRows.push({
          original: row,
          values: this.columns.getValue().map(c => {
              return { value: c.isEditable ? this.getCellValue(row, c) : row[c.id] };
          })
        });
      }
    });
    this._editionStateChanged();
  }

  public duplicate(rows: any[]): void {
    rows.forEach(row => {
      let newRow = this.duplicateFunction(row);
      this.createdRows.push(newRow);
    });
    this.edit(this.createdRows);
    // this.refreshGrid(GridRefreshSteps.NEW_ROW);
  }

  public batchChange(row: any): void {
    this.batchChangeRow = row;
    this.selectedRows = this.selectedRows.filter(r => r !== row);
    this.batchChangeColumnsSelection = Array.apply(null, new Array(this.columns.getValue().length)).map(() => false);
  }

  public commitBatchChange(): void {
    let originalRowsToChange = this.selectedRows;
    if (originalRowsToChange.length > 0 && !this.batchChangeColumnsSelection.every(isSelected => !isSelected)) {
      let rowsToChange = originalRowsToChange.map(row => Object.assign({}, row));
      this.batchChangeColumnsSelection.forEach((isSelected, columnIndex) => {
        if (!isSelected) {
          return;
        }
        let column = this.columns.getValue()[columnIndex];
        let value = this.getCellValue(this.batchChangeRow, column);
        rowsToChange.forEach((row) => {
          column.editor.valueApplyFunction.call(null, value, row);
        });
      });
      rowsToChange.forEach((row, index) => {
        this.editCommitFunction(originalRowsToChange[index], row);
      });
    }
    this.batchChangeRow = null;
  }

  public cancelBatchChange(): void {
    this.batchChangeRow = null;
  }

  public onCreate(): void {
    this.onCreateFunction();
  }

  private create(): void {
    this.createdRows = [Object.assign({}, this.newRowPrototype)];
    this.edit(this.createdRows);
    // this.refreshGrid(GridRefreshSteps.NEW_ROW);
  }

  public commitEdit(rows: any[]): void {
    let editedRows = rows !== undefined ? rows.map(row => this._findRowInEdited(row)) : this.editedRows;
    editedRows.forEach(editedRow => {
      let duplicate = Object.assign({}, editedRow.original);
      this.columns.getValue().forEach((c, index) => {
        c.editor.valueApplyFunction.call(null, editedRow.values[index].value, duplicate);
      });
      this.editCommitFunction(this.createdRows.indexOf(editedRow.original) === -1 ? editedRow.original : null, duplicate).then(() => {
        this._removeFromEditedRows([editedRow.original]);
      }).catch(() => {});
    });
  }

  public cancelEdit(rows: any[]): void {
    rows = rows !== undefined ? rows : this.editedRows.map(r => r.original);
    this._removeFromEditedRows(rows);
  }

  public isRowEdited(row: any): boolean {
    return !!this._findRowInEdited(row);
  }

  public getEditObject(row: any): any {
    let editedRow = this._findRowInEdited(row);
    return editedRow.values;
  }

  private _editionStateChanged(): void {
    this.editionStateChanged.call(
      null,
      this.editedRows.map(row => this.createdRows.indexOf(row.original) !== -1 ? row.original : null)
    );
  }

  private _findRowInEdited(row: any): any {
    let editedRow;
    this.editedRows.filter(r => {
      if (r.original === row) {
        editedRow = r;
      }
    });
    return editedRow;
  }

  private _removeFromEditedRows(rows: any[]): void {
    this.editedRows = this.editedRows.filter(r => rows.indexOf(r.original) === -1);
    this.createdRows = this.createdRows.filter(r => rows.indexOf(r) === -1);
    // this.refreshGrid(GridRefreshSteps.NEW_ROW);
    this._editionStateChanged();
  }

  public editorKeyUp(event: KeyboardEvent, row: any): void {
    switch (event.keyCode) {
      case 27: // esc
        this.cancelEdit([row]);
        break;
      case 13: // enter
        this.commitEdit([row]);
        break;
    }
  }

  public checkboxFilterChanged(column: any): void {
    switch (column.filterQuery.getValue()) {
      case '':
        column.filterQuery.next(true);
        break;
      case true:
        column.filterQuery.next(false);
        break;
      case false:
        column.filterQuery.next('');
        break;
    }
  }

  public remove(): void {
    this.selectedRows.forEach(row => {
      this.deleteCommitFunction(row);
    });
    this.selectedRows = [];
    this.selectedRowsChanged.call(null, this.selectedRows);
    // this.refreshGrid(GridRefreshSteps.FILTER);
  }
}
