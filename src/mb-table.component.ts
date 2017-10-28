import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, SimpleChanges, AfterViewInit, EventEmitter, NgZone, ViewEncapsulation, OnChanges, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import $ from 'jquery';
import elementResizeDetector from 'element-resize-detector';


const enum GridRefreshSteps {
  FILTER,
  SORT,
  PAGINATION,
  NEW_ROW
}

const enum NumberFilterOperator {
  EQ,
  NOT_EQ,
  LT,
  LTE,
  GT,
  GTE
}

@Component({
  selector: 'mb-table',
  styleUrls: ['mb-table.scss'],
  templateUrl: 'mb-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MbTableComponent implements OnChanges {
  @Input() settings: any;
  @Input() source: any[];
  @Input() sortConfiguration: any[];
  @Input() scrollParentSelector: string;
  @Input() scrollUpperBoundSelector: string;

  columns: any[] = [];
  columnsSortOrder: any[] = [];

  isDuplicationEnabled: boolean = true;
  isEditionEnabled: boolean = true;
  isDeletionEnabled: boolean = true;
  isBatchChangeEnabled: boolean = true;
  isFiltrationEnabled: boolean = true;
  isRowsSelectionEnabled: boolean = false;
  deselectRowOnClick: boolean = false;
  isFiltrationActive: boolean = true;

  showCreateButton: boolean = true;
  showResetSortButton: boolean = true;
  defaultSortConfiguration: any[] = [];

  isPaginationEnabled: boolean = false;
  pageSize: number = 0;
  selectedPage: number = 0;
  selectedPageTextValue: string = '1';
  numberOfPages: number = 1;

  filteredSource: any[] = [];
  sortedSource: any[] = [];
  paginatedSource: any[] = [];
  processedSource: any[] = [];
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

  private tableWidthOld: number = 0;

  constructor(
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone) { }

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
    this.columns.forEach((column, index) => {
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
    if (this.editorToFocus.row !== null) {
      const editor = $(this.elementRef.nativeElement).find(
        'tr.st-row-' + this.processedSource.indexOf(this.editorToFocus.row) +
        ' td.st-col-' + this.columns.indexOf(this.editorToFocus.column) + ' input');
      this.editorToFocus.row = this.editorToFocus.column = null;
      setTimeout(() => {
        editor.focus();
        editor.select();
      }, 10);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      if (propName === 'settings') {
        this.prepareColumns();
        this.prepareSettings();
      }
      if (propName === 'source') {
        this.refreshGrid();
        this.editedRows = this.editedRows.filter(r => this.processedSource.indexOf(r.original) !== -1 || this.createdRows.indexOf(r.original) !== -1);
        this.changePage(this.selectedPage);
      }
      if (propName === 'sortConfiguration') {
        this.refreshSortConfiguration();
      }
    }
  }

  private prepareColumns(): void {
    this.columns = [];
    this.settings.columns.forEach(column => {
      let internalColumn = Object.assign({}, column);
      internalColumn.originColumn = column;
      this.prepareColumn(internalColumn, this.settings);
      this.columns.push(internalColumn);
    });
    this.columnsSortOrder = this.columns.slice(0);
  }

  private prepareColumn(column: any, settings: any): void {
    if (typeof column.title === 'string') column.title = Observable.of(column.title);
    column.calculatedWidth = 0;
    if (!column.cellRenderer) column.cellRenderer = 'text';
    if (typeof column.class === 'string') {
      let classes = column.class;
      column.class = () => classes;
    }
    else if (typeof column.class !== 'function') column.class = () => '';
    column.isEditable = column.isEditable === undefined ? true : !!column.isEditable;
    if (!column.editor) column.editor = {};
    if (!column.editor.type) {
      switch (column.cellRenderer) {
        case 'number':
        case 'checkbox':
        case 'text':
          column.editor.type = column.cellRenderer;
          break;
        case undefined:
        default:
          column.editor.type = 'text';
      }
    }
    if (!column.editor.source) column.editor.source = () => [];
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

    if (!column.filter) column.filter = {};
    if (!column.filter.type) {
      switch (column.cellRenderer) {
        case 'number':
        case 'checkbox':
        case 'text':
          column.filter.type = column.cellRenderer;
          break;
        case undefined:
        default:
          column.filter.type = 'text';
      }
    }
    if (!column.filter.source) column.filter.source = () => [];
    if (!column.filter.filterFunction) {
      switch (column.filter.type) {
        case 'text':
          column.filter.filterFunction =
            (value, search, row) => MbTableComponent.nonStrictFilter(value, search);
          break;
        case 'autocomplete':
        case 'checkbox':
          column.filter.filterFunction =
            (value, search, row) => MbTableComponent.strictFilter(value, search);
          break;
        case 'number':
          column.filter.filterFunction =
            (value, search, row) => MbTableComponent.numberFilter(value, search);
      }
    }
    column.filter.query = '';

    if (!column.sort) column.sort = {};
    column.sort.direction = 0;
    if (!column.sort.comparator) 
      column.sort.comparator = (val1, val2) => MbTableComponent.compare(val1, val2);

    column.isFilterable = column.isFilterable !== false;

    if (column.filter.type === 'text' || column.filter.type === 'number') {
      column.textFilterFormControl = new FormControl();
      column.textFilterFormControl.valueChanges
        .distinctUntilChanged()
        .debounceTime(300)
        .subscribe((value: string) => {
          this.refreshGrid();
        });
    }
  }

  private prepareSettings(): void {
    this.duplicateFunction = this.settings.duplicateFunction ?
      this.settings.duplicateFunction :
      (row) => Object.assign({}, row);
    this.deleteCommitFunction = this.settings.deleteCommitFunction ?
      this.settings.deleteCommitFunction :
      (row) => this.source = this.source.filter(e => e !== row);
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
    this.isFiltrationEnabled = this.settings.isFiltrationEnabled !== false;
    if (!this.isFiltrationEnabled) {
      this.columns.forEach(column => column.isFilterable = false);
    }

    this.isPaginationEnabled = !!this.settings.pageSize;
    this.pageSize = this.settings.pageSize;
    this.showCreateButton = this.settings.showCreateButton !== false;
    this.showResetSortButton = this.settings.showResetSortButton !== false;
    this.defaultSortConfiguration = !!this.settings.defaultSortConfiguration ?
      this.settings.defaultSortConfiguration : [];
  }

  private refreshSortConfiguration(): void {
    if (typeof this.sortConfiguration !== "object")
      return;
    this.columns.forEach(c => c.sort.direction = 0);
    const sortedColumns = this.sortConfiguration.map(columnSort => {
      const column = this.columns[columnSort.index];
      column.sort.direction = columnSort.direction;
      return column;
    });
    this.columnsSortOrder = sortedColumns.concat(
      this.columns.filter(c => sortedColumns.indexOf(c) === -1)
    );
    this.refreshGrid(GridRefreshSteps.SORT);
  }

  private refreshGrid(fromStep: GridRefreshSteps = GridRefreshSteps.FILTER) {
    let processedSource;
    switch (fromStep) {
      case GridRefreshSteps.FILTER:
        processedSource = this.filteredSource = this.performFilter(this.source);
      case GridRefreshSteps.SORT:
        processedSource = this.sortedSource = this.performSort(this.filteredSource);
      case GridRefreshSteps.PAGINATION:
        if (this.isPaginationEnabled) {
          this.numberOfPages = Math.max(Math.floor(this.sortedSource.length / this.pageSize), 1);
          if (this.numberOfPages * this.pageSize < this.sortedSource.length) {
            this.numberOfPages++;
          }
          this.selectedPage = Math.min(this.selectedPage, this.numberOfPages - 1);
          processedSource = this.paginatedSource = this.performPagination(this.sortedSource);
        }
        else {
          processedSource = this.paginatedSource = this.sortedSource.slice(0);
        }
      case GridRefreshSteps.NEW_ROW:
        processedSource = this.paginatedSource.slice(0);
        if (this.createdRows.length > 0) {
          processedSource = this.createdRows.concat(processedSource);
        }
      default:
        this.processedSource = processedSource;
        this.changeDetectorRef.markForCheck();
        return;
    }
  }

  private getCellValue(row: any, column: any): any {
    if (column.valuePrepareFunction === undefined) {
      return row[column.id];
    }
    return column.valuePrepareFunction(row[column.id], row);
  }

  private getCellStyleClasses(row: any, column: any): any {
    return column.class.call(null, this.getCellValue(row, column), row);
  }

  private sortByColumn(column: any): void {
    // cycle values -1, 0, 1
    column.sort.direction = (column.sort.direction + 2) % 3 - 1
    this.columnsSortOrder = this.columnsSortOrder
      .filter(c => c != column)
      .concat([column]);
    this.refreshGrid(GridRefreshSteps.SORT);
  }

  private resetSort(): void {
    this.columns.forEach(c => c.sort.direction = 0);
    this.columnsSortOrder = [];
    this.defaultSortConfiguration.forEach(conf => {
      const column = this.columns[conf.index];
      column.sort.direction = conf.direction;
      this.columnsSortOrder.push(column);
    });
    this.refreshGrid(GridRefreshSteps.SORT);
  }

  private performSort(source: any[]): any[] {
    return this.columnsSortOrder
      .filter(column => column.sort.direction != 0)
      .reduce((sorted, column) =>
        MbTableComponent.stableSort(sorted, (a, b) =>
          column.sort.comparator.call(null,
            this.getCellValue(a, column),
            this.getCellValue(b, column),
            a,
            b
          ) * column.sort.direction
        ), source.slice(0));
  }

  private performFilter(source: any[]): any[] {
    if (this.isFiltrationActive) {
      return this.columns
        .filter(column => column.filter.query !== '')
        .reduce((filtered, column) =>
          filtered.filter((row) =>
            column.filter.filterFunction.call(null,
              this.getCellValue(row, column), column.filter.query, row)
        ), source.slice(0));
    }
    else {
      return this.source.slice(0);
    }
  }

  private toggleFiltration(): void {
    if (this.isFiltrationActive) {
      this.columns.forEach(column => {
        if (column.textFilterFormControl) {
          column.textFilterFormControl.reset({
            value: column.textFilterFormControl.value, 
            disabled: true
          });
        }
      });
    }
    else {
      this.columns.forEach(column => {
        if (column.textFilterFormControl) {
          column.textFilterFormControl.reset({
            value: column.textFilterFormControl.value, 
            disabled: false
          });
        }
      });
    }
    this.isFiltrationActive = !this.isFiltrationActive;
    this.refreshGrid(GridRefreshSteps.FILTER);
  }

  private performPagination(source: any[]): any[] {
    let startIndex = this.pageSize * this.selectedPage;
    return source.slice(startIndex, startIndex + this.pageSize);
  }

  private changePage(pageNumber: number): void {
    if (pageNumber < 0) {
      pageNumber = 0;
    }
    else if (pageNumber > this.numberOfPages - 1) {
      pageNumber = this.numberOfPages - 1;
    }
    this.selectedPage = pageNumber;
    this.selectedPageTextValue = (pageNumber + 1).toString();
    this.refreshGrid(GridRefreshSteps.PAGINATION);
  }

  private changePageFromText(textNumber): void {
    const newPageNumber = parseInt(textNumber);
    if (newPageNumber >= 1 && newPageNumber <= this.numberOfPages) {
      this.changePage(newPageNumber - 1);
    }
  }

  private selectRow(row: any, event: MouseEvent): void {
    if (!this.isRowsSelectionEnabled || row === this.batchChangeRow) {
      return;
    }
    if (event.ctrlKey && !event.shiftKey) {
      if (this.selectedRows.indexOf(row) === -1) {
        this.selectedRows.push(row);
      }
      else {
        this.selectedRows = this.selectedRows.filter(r => r !== row);
      }
    }
    else if (!event.ctrlKey && event.shiftKey) {
      if (this.selectedRows.length === 0) {
        this.selectedRows = [row];
      }
      else {
        let lastSelectedRow = this.selectedRows[this.selectedRows.length - 1];
        let lastIndex = this.processedSource.indexOf(lastSelectedRow);
        let newIndex = this.processedSource.indexOf(row);
        let newRowsSelection = this.processedSource.slice(
          Math.min(lastIndex, newIndex), Math.max(lastIndex, newIndex) + 1);
        let selectedRowsWithoutNew = this.selectedRows.filter(r => newRowsSelection.indexOf(r) === -1);
        if (selectedRowsWithoutNew.length + newRowsSelection.length === this.selectedRows.length) {
          this.selectedRows = selectedRowsWithoutNew;
        }
        else {
          this.selectedRows = selectedRowsWithoutNew
            .concat(lastIndex <= newIndex ? newRowsSelection : newRowsSelection.reverse());
        }
        window.getSelection().removeAllRanges();
      }
    }
    else {
      if (this.selectedRows.length > 1 || this.selectedRows.length === 0) {
        this.selectedRows = [row];
      }
      else {
        if (this.deselectRowOnClick || this.selectedRows[0] !== row) {
          this.selectedRows = this.selectedRows[0] === row ? [] : [row];
        } 
      }
    }
    this.selectedRowsChanged.call(null, this.selectedRows);
  }

  private edit(rows: any[], column: any = null): void {
    if (!this.isEditionEnabled || (rows.length === 1 && rows[0] === this.batchChangeRow)) {
      return;
    }
    this.editorToFocus.row = rows[0];
    this.editorToFocus.column = column ? column : this.columns[0];
    rows.forEach(row => {
      if (this.editedRows.filter(r => r.original === row).length === 0) {
        this.editedRows.push({
          original: row,
          values: this.columns.map(c => {
              return {value: c.isEditable ? this.getCellValue(row, c) : row[c.id]}
          })
        });
      }
    });
    this._editionStateChanged();
  }

  private duplicate(rows: any[]): void {
    rows.forEach(row => {
      let newRow = this.duplicateFunction(row)
      this.createdRows.push(newRow);
    });
    this.edit(this.createdRows);
    this.refreshGrid(GridRefreshSteps.NEW_ROW);
  }

  private batchChange(row: any): void {
    this.batchChangeRow = row;
    this.selectedRows = this.selectedRows.filter(r => r !== row);
    this.batchChangeColumnsSelection = Array.apply(null, new Array(this.columns.length)).map(() => false);
  }

  private commitBatchChange(): void {
    let originalRowsToChange = this.selectedRows;
    if (originalRowsToChange.length > 0 && !this.batchChangeColumnsSelection.every(isSelected => !isSelected)) {
      let rowsToChange = originalRowsToChange.map(row => Object.assign({}, row));
      this.batchChangeColumnsSelection.forEach((isSelected, columnIndex) => {
        if (!isSelected) return;
        let column = this.columns[columnIndex];
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

  private cancelBatchChange(): void {
    this.batchChangeRow = null;
  }

  private onCreate(): void {
    this.onCreateFunction();
  }

  private create(): void {
    this.createdRows = [Object.assign({}, this.newRowPrototype)];
    this.edit(this.createdRows);
    this.refreshGrid(GridRefreshSteps.NEW_ROW);
  }

  private commitEdit(rows: any[]): void {
    let editedRows = rows !== undefined ? rows.map(row => this._findRowInEdited(row)) : this.editedRows;
    editedRows.forEach(editedRow => {
      let duplicate = Object.assign({}, editedRow.original);
      this.columns.forEach((c, index) => {
        c.editor.valueApplyFunction.call(null, editedRow.values[index].value, duplicate);
      })
      this.editCommitFunction(this.createdRows.indexOf(editedRow.original) === -1 ? editedRow.original : null, duplicate).then(() => {
        this._removeFromEditedRows([editedRow.original]);
      }).catch(() => {});
    })
  }

  private cancelEdit(rows: any[]): void {
    rows = rows !== undefined ? rows : this.editedRows.map(r => r.original);
    this._removeFromEditedRows(rows);
  }

  private isRowEdited(row: any): boolean {
    return !!this._findRowInEdited(row);
  }

  private getEditObject(row: any): any {
    let editedRow = this._findRowInEdited(row);
    return editedRow.values;
  }

  private _editionStateChanged(): void {
    this.editionStateChanged.call(null, 
      this.editedRows.map(row => this.createdRows.indexOf(row.original) !== -1 ? row.original : null)
    );
  }

  private _findRowInEdited(row: any): any {
    let editedRow;
    this.editedRows.filter(r => {
      if (r.original === row) editedRow = r;
    });
    return editedRow;
  }

  private _removeFromEditedRows(rows: any[]): void {
    this.editedRows = this.editedRows.filter(r => rows.indexOf(r.original) === -1);
    this.createdRows = this.createdRows.filter(r => rows.indexOf(r) === -1);
    this.refreshGrid(GridRefreshSteps.NEW_ROW);
    this._editionStateChanged();
  }

  private editorKeyUp(event: KeyboardEvent, row: any): void {
    switch (event.keyCode) {
      case 27: //esc
        this.cancelEdit([row]);
        break;
      case 13: //enter
        this.commitEdit([row]);
        break;
    }
  }

  private checkboxFilterChanged(event: any, column: any): void {
    const checkbox = event.target;
    switch (column.filter.query) {
      case '':
        column.filter.query = true;
        checkbox.indeterminate = false;
        break;
      case true:
        column.filter.query = false;
        checkbox.indeterminate = false;
        break;
      case false:
        column.filter.query = '';
        checkbox.indeterminate = true;
        break;
    }
    this.refreshGrid(GridRefreshSteps.FILTER);
  }

  private remove(): void {
    this.selectedRows.forEach(row => {
      this.deleteCommitFunction(row);
    });
    this.selectedRows = [];
    this.selectedRowsChanged.call(null, this.selectedRows);
    this.refreshGrid(GridRefreshSteps.FILTER);
  }

  protected static compare = (a, b) => {
    // if a is empty
    if (!a && a != 0) {
      if (!b && b != 0) { // empty equals empty
        return 0;
      }
      return -1; // empty is always lower than sth
    }
    else if (!b && b != 0) { // if b is empty (and a is not)
      return 1;
    }
    else { // a and b are not empty
      // special case for strings comparison
      if (typeof a === 'string' && typeof b === 'string') {
        // bugfix for utf-8 characters sorting
        return a.localeCompare(b);
      }
      else {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      }
    }
  };

  private static compareNumbers(num1: number, num2: number, operator: NumberFilterOperator) {
    switch (operator) {
      case NumberFilterOperator.EQ:
        return num1 === num2;
      case NumberFilterOperator.NOT_EQ:
        return num1 !== num2;
      case NumberFilterOperator.LT:
        return num1 < num2;
      case NumberFilterOperator.LTE:
        return num1 <= num2;
      case NumberFilterOperator.GT:
        return num1 > num2;
      case NumberFilterOperator.GTE:
        return num1 >= num2;
    }
  }

  protected static nonStrictFilter = (value: any, search: any) => {
    search = search ? search.toString().trim() : '';
    if (search === '""')
      return !value && value !== 0;
    else if (search.length === 0) {
      return true;
    }
    else
      if (!value && value !== 0)
        return false;
      return value.toString().trim().toLowerCase().includes(
        search.toString().trim().toLowerCase());
  };

  protected static strictFilter = (value: any, search: any) => {
    return value === search;
  };

  protected static numberFilter = (value: number, search: string) => {
    search = search ? search.toString().trim() : '';
    if (search === '""')
      return !value && value !== 0;
    else if (search.length === 0) {
      return true;
    }
    else if (!value && value !== 0)
      return false;
    let operator : NumberFilterOperator;
    let searchNumber : number;
    if (search.length > 2) {
      switch (search.substring(0, 2)) {
        case '==':
          operator = NumberFilterOperator.EQ;
          break;
        case '!=':
          operator = NumberFilterOperator.NOT_EQ;
          break;
        case '<=':
          operator = NumberFilterOperator.LTE;
          break;
        case '>=':
          operator = NumberFilterOperator.GTE;
          break;
      }
      searchNumber = Number(search.substring(2));
    }
    if (search.length > 1 && operator === undefined) {
      switch (search.substring(0, 1)) {
        case '<':
          operator = NumberFilterOperator.LT;
          break;
        case '>':
          operator = NumberFilterOperator.GT;
          break;
      }
      searchNumber = Number(search.substring(1));
    }
    if (operator === undefined) {
      operator = NumberFilterOperator.EQ;
      searchNumber = Number(search);
    }
    if (isNaN(searchNumber)) {
      return false;
    }
    else {
      return MbTableComponent.compareNumbers(value, searchNumber, operator);
    }
  };

  private static stableSort(arr, cmpFunc) {
    var arrOfWrapper = arr.map(function(elem, idx){
        return {elem: elem, idx: idx};
    });

    arrOfWrapper.sort(function(wrapperA, wrapperB){
        var cmpDiff = cmpFunc(wrapperA.elem, wrapperB.elem);
        return cmpDiff === 0
             ? wrapperA.idx - wrapperB.idx
             : cmpDiff;
    });

    return arrOfWrapper.map(function(wrapper){
        return wrapper.elem;
    });
  }
}
