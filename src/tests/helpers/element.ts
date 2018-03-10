import { ComponentFixture } from '@angular/core/testing';
import { ColumnDefinition } from '../../column-definition';
import { CellRenderer } from '../../cell-renderer';

export function getCellElement(fixture: ComponentFixture<any>, columnIndex: number, rowIndex: number): HTMLElement {
  const cellSelector = `tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 1})`;
  return fixture.nativeElement.querySelector(cellSelector) as HTMLElement;
}

export function getHeaderElement(fixture: ComponentFixture<any>, columnIndex: number): HTMLElement {
  return fixture.nativeElement.querySelector(`thead .header-${columnIndex}`) as HTMLElement;
}

export function getFilterRow(fixture: ComponentFixture<any>): HTMLElement {
  return fixture.nativeElement.querySelector('thead .filter-row') as HTMLElement;
}

export function getFilterElement(fixture: ComponentFixture<any>, columnIndex: number): HTMLElement {
  return fixture.nativeElement.querySelector(`thead .filter-${columnIndex}`) as HTMLElement;
}

export function getFilterInputElement(fixture: ComponentFixture<any>, columnIndex: number, column: ColumnDefinition): HTMLInputElement {
  const filterElement = getFilterElement(fixture, columnIndex);
  switch (column.filterRenderer.getValue()) {
    case CellRenderer.Text:
    case CellRenderer.Checkbox:
    case CellRenderer.Number:
    default:
      return filterElement.querySelector('input') as HTMLInputElement;
  }
}

export function getRowsElements(fixture: ComponentFixture<any>): NodeListOf<HTMLElement> {
  return fixture.nativeElement.querySelectorAll('tbody tr') as NodeListOf<HTMLElement>;
}

export function getPaginationBar(fixture: ComponentFixture<any>): HTMLElement {
  return fixture.nativeElement.querySelector('.pagination-bar');
}

export function getActivePageInput(fixture: ComponentFixture<any>): HTMLInputElement {
  return fixture.nativeElement.querySelector('.active-page');
}

export function getJumpToFirstPageButton(fixture: ComponentFixture<any>): HTMLElement {
  return fixture.nativeElement.querySelector('.jump-to-first-page');
}

export function getJumpToPreviousPageButton(fixture: ComponentFixture<any>): HTMLElement {
  return fixture.nativeElement.querySelector('.jump-to-previous-page');
}

export function getJumpToNextPageButton(fixture: ComponentFixture<any>): HTMLElement {
  return fixture.nativeElement.querySelector('.jump-to-next-page');
}

export function getJumpToLastPageButton(fixture: ComponentFixture<any>): HTMLElement {
  return fixture.nativeElement.querySelector('.jump-to-last-page');
}

export function getResetSortButton(fixture: ComponentFixture<any>): HTMLElement {
  return fixture.nativeElement.querySelector('.reset-sort');
}
