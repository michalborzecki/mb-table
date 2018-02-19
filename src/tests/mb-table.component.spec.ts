import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { MbTableComponent } from '../mb-table.component';
import { Component, Input } from '@angular/core';
import { ColumnDefinition } from '../column-definition';
import { BehaviorSubject } from 'rxjs/Rx';
import { CellRenderer } from '../cell-renderer';
import { getCellElement, getHeaderElement, getFilterInputElement, getRowsElements, getFilterRow, getPaginationBar } from './helpers/element';
import { fillIn, toggleCheckbox } from './helpers/input';
import { SortAlgorithm, SortDirection, ColumnSortState } from '../sort/sort-algorithm';
import { MultiColumnSort } from '../sort/multi-column-sort';
import { SingleColumnSort } from '../sort/single-column-sort';
import { TableConfiguration } from '../table-configuration';

function getColumns(): ColumnDefinition[] {
  return [
    new ColumnDefinition({ title: 'Last Name' }),
    new ColumnDefinition({ title: 'First Name' }),
    new ColumnDefinition({ title: 'Age' }),
  ];
}

@Component({
  template: `
    <mb-table
      [columns]="columns"
      [source]="source"
      [configuration]="configuration">
    </mb-table>
  `
})
class TestHostComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() source: any[] = [];
  @Input() sortAlgorithm: SortAlgorithm = new MultiColumnSort();
  @Input() configuration: TableConfiguration = new TableConfiguration();
}

describe('MbTableComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let nativeElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestHostComponent, MbTableComponent ],
      imports: [
        FormsModule,
        NguiAutoCompleteModule,
        ReactiveFormsModule,
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      nativeElement = fixture.nativeElement;
    });
  }));

  it('[column title] shows initial column title', () => {
    const columns = getColumns();
    component.columns = columns;
    fixture.autoDetectChanges();
    compareColumnsName(nativeElement, columns);
  });

  it('[column title] reacts to initial column title change', () => {
    const columns = getColumns();
    component.columns = columns;
    fixture.autoDetectChanges();

    columns[0].title.next('New title');
    columns[1].title.next('Another title');
    columns[2].title.next('Last title');
    fixture.autoDetectChanges();
    compareColumnsName(nativeElement, columns);
  });

  it('[column title] shows title of changed column', () => {
    component.columns = getColumns();
    fixture.autoDetectChanges();

    const columns = getColumns();
    columns[0].title.next('New title');
    columns[1].title.next('Another title');
    columns[2].title.next('Last title');
    component.columns = columns;
    fixture.autoDetectChanges();
    compareColumnsName(nativeElement, columns);
  });

  it('[column title] reacts to changed column title change', () => {
    component.columns = getColumns();
    fixture.autoDetectChanges();

    const columns = getColumns();
    component.columns = columns;
    fixture.autoDetectChanges();
    columns[0].title.next('New title');
    columns[1].title.next('Another title');
    columns[2].title.next('Last title');
    fixture.autoDetectChanges();
    compareColumnsName(nativeElement, columns);
  });

  it('[column value] renders cell value using property name', () => {
    const columns = [
      new ColumnDefinition({ value: 'firstName' }),
      new ColumnDefinition({ value: 'lastName' }),
      new ColumnDefinition({ value: 'age' }),
    ];
    const source = [{
      lastName: 'lastname',
      firstName: 'firstname',
      age: 10,
    }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    columns.forEach((column, index) =>
      expect(getCellElement(fixture, index, 0).innerText.trim())
        .toBe(String(source[0][column.columnDefinitionSource.value as string]))
    );
  });

  it('[column value] renders cell value using function', () => {
    const columns = [
      new ColumnDefinition({ value: (record) => record.firstName }),
      new ColumnDefinition({ value: (record) => record.lastName }),
      new ColumnDefinition({ value: (record) => record.age }),
    ];
    const source = [{
      lastName: 'lastname',
      firstName: 'firstname',
      age: 10,
    }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    columns.forEach((column, index) =>
      expect(getCellElement(fixture, index, 0).innerText.trim())
        .toBe(String((column.columnDefinitionSource.value as (record: any) => any)(source[0])))
    );
  });

  it('[column value] renders cell value using function subject', () => {
    const columns = [
      new ColumnDefinition({ value: new BehaviorSubject((record) => record.firstName) }),
      new ColumnDefinition({ value: new BehaviorSubject((record) => record.lastName) }),
      new ColumnDefinition({ value: new BehaviorSubject((record) => record.age) }),
    ];
    const source = [{
      lastName: 'lastname',
      firstName: 'firstname',
      age: 10,
    }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    columns.forEach((column, index) => {
      const valueCallback =
        (column.columnDefinitionSource.value as BehaviorSubject<(record: any) => any>)
        .getValue();
      expect(getCellElement(fixture, index, 0).innerText.trim())
        .toBe(String(valueCallback(source[0])));
    });
  });

  it('[column value] reacts to column value function change', () => {
    const columns = [
      new ColumnDefinition({ value: 'firstName' }),
      new ColumnDefinition({ value: 'lastName' }),
      new ColumnDefinition({ value: 'age' }),
    ];
    const source = [{
      lastName: 'lastname',
      firstName: 'firstname',
      age: 10,
    }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    columns[0].value.next((record) => record.firstName + '1');
    columns[1].value.next((record) => record.lastName + '1');
    columns[2].value.next((record) => record.age + '1');
    fixture.autoDetectChanges();
    columns.forEach((column, index) =>
      expect(getCellElement(fixture, index, 0).innerText.trim())
        .toBe(String(column.value.getValue()(source[0])))
    );
  });

  it('[column renderer] renders value using text renderer', () => {
    const columns = [
      new ColumnDefinition({ value: 'v', renderer: CellRenderer.Text }),
    ];
    const source = [{ v: 'test' }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    expect(getCellElement(fixture, 0, 0).innerText.trim()).toBe(source[0].v);
  });

  it('[column renderer] renders value using number renderer', () => {
    const columns = [
      new ColumnDefinition({ value: 'v', renderer: CellRenderer.Number }),
    ];
    const source = [{ v: 123 }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    expect(getCellElement(fixture, 0, 0).innerText.trim()).toBe(String(source[0].v));
  });

  it('[column renderer] renders value using checkbox renderer', () => {
    const columns = [
      new ColumnDefinition({ value: 'v', renderer: CellRenderer.Checkbox }),
    ];
    const source = [{ v: true }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    expect(getCellElement(fixture, 0, 0).querySelector('.glyphicon-ok')).toBeTruthy();
  });

  it('[column class] uses column class names provided as strings', () => {
    const columns = [
      new ColumnDefinition({ value: 'lastName', classNames: 'class1' }),
      new ColumnDefinition({ value: 'firstName', classNames: 'class2' }),
      new ColumnDefinition({ value: 'age', classNames: 'class3' }),
    ];
    const source = [{
      lastName: 'lastname',
      firstName: 'firstname',
      age: 10,
    }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    columns.forEach((column, index) => {
      const className = column.columnDefinitionSource.classNames as string;
      expect(getCellElement(fixture, index, 0).classList.contains(className))
        .toBe(true);
    });
  });

  it('[column class] uses column class names provided as functions', () => {
    const columns = [
      new ColumnDefinition({ value: 'lastName', classNames: (record) => record['firstName'] + '-class1' }),
      new ColumnDefinition({ value: 'firstName', classNames: (record) => record['lastName'] + '-class2' }),
      new ColumnDefinition({ value: 'age', classNames: (record) => record['age'] + '-class3' }),
    ];
    const source = [{
      lastName: 'lastname',
      firstName: 'firstname',
      age: 10,
    }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    columns.forEach((column, index) => {
      const className = column.columnDefinitionSource.classNames as (record: any) => any;
      expect(getCellElement(fixture, index, 0).classList.contains(className(source[0])))
        .toBe(true);
    });
  });

  it('[column class] uses column class names provided as function subject', () => {
    const columns = [
      new ColumnDefinition({ value: 'lastName', classNames: new BehaviorSubject((record) => record['firstName'] + '-class1') }),
      new ColumnDefinition({ value: 'firstName', classNames: new BehaviorSubject((record) => record['lastName'] + '-class2') }),
      new ColumnDefinition({ value: 'age', classNames: new BehaviorSubject((record) => record['age'] + '-class3') }),
    ];
    const source = [{
      lastName: 'lastname',
      firstName: 'firstname',
      age: 10,
    }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    columns.forEach((column, index) => {
      const className =
        (column.columnDefinitionSource.classNames as BehaviorSubject<(record: any) => any>)
        .getValue();
      expect(getCellElement(fixture, index, 0).classList.contains(className(source[0])))
        .toBe(true);
    });
  });

  it('[column class] reacts to column class names function change', () => {
    const columns = [
      new ColumnDefinition({ value: 'lastName', classNames: 'class1' }),
      new ColumnDefinition({ value: 'firstName', classNames: 'class2' }),
      new ColumnDefinition({ value: 'age', classNames: 'class3' }),
    ];
    const source = [{
      lastName: 'lastname',
      firstName: 'firstname',
      age: 10,
    }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    columns[0].classNames.next((record) => record['firstName'] + '-class1');
    columns[1].classNames.next((record) => record['lastName'] + '-class2');
    columns[2].classNames.next((record) => record['age'] + '-class3');
    fixture.autoDetectChanges();
    columns.forEach((column, index) => {
      const className = column.classNames.getValue();
      const cell = getCellElement(fixture, index, 0);
      expect(cell.classList.contains(className(source[0])))
        .toBe(true);
      expect(cell.classList.contains(column.columnDefinitionSource.classNames as string))
        .toBe(false);
    });
  });

  it('[column filter] hides filters if filterEnabled=false', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterDebounceTime: 1,
        filterQuery: 'de',
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ filterEnabled: false });
    whenStable(fixture).then(() => {
      expect(getFilterRow(fixture)).toBeNull();
      expect(getRowsElements(fixture).length).toBe(2);
      done();
    });
  });

  it('[column filter] shows filters if filterEnabled=true', () => {
    const columns = [
      new ColumnDefinition({ value: 'lastName' }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ filterEnabled: true });
    fixture.autoDetectChanges();
    expect(getFilterRow(fixture)).toBeTruthy();
  });

  it('[column filter] hides filters if subject filterEnabled contains false', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterDebounceTime: 1,
        filterQuery: 'de',
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ filterEnabled: new BehaviorSubject(false) });
    whenStable(fixture).then(() => {
      expect(getFilterRow(fixture)).toBeNull();
      expect(getRowsElements(fixture).length).toBe(2);
      done();
    });
  });

  it('[column filter] hides filters if subject filterEnabled changes to false', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterDebounceTime: 1,
        filterQuery: 'de',
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    const filterEnabled = new BehaviorSubject(true);
    component.configuration = new TableConfiguration({ filterEnabled });
    whenStable(fixture).then(() => {
      filterEnabled.next(false);
      fixture.autoDetectChanges();
      expect(getFilterRow(fixture)).toBeNull();
      expect(getRowsElements(fixture).length).toBe(2);
      done();
    });
  });

  it('[column filter] hides filter if column.filterEnabled=false', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterEnabled: false,
        filterDebounceTime: 1,
        filterQuery: 'de',
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      expect(getFilterInputElement(fixture, 0, columns[0])).toBeNull();
      expect(getRowsElements(fixture).length).toBe(2);
      done();
    });
  });

  it('[column filter] shows filter if column.filterEnabled=true', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterEnabled: true,
        filterDebounceTime: 1,
        filterQuery: 'de',
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      expect(getFilterInputElement(fixture, 0, columns[0])).toBeTruthy();
      done();
    });
  });

  it('[column filter] hides filter if subject column.filterEnabled contains false', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterEnabled: new BehaviorSubject(false),
        filterDebounceTime: 1,
        filterQuery: 'de',
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      expect(getFilterInputElement(fixture, 0, columns[0])).toBeNull();
      expect(getRowsElements(fixture).length).toBe(2);
      done();
    });
  });

  it('[column filter] hides filter if subject column.filterEnabled changes false', (done) => {
    const filterEnabled = new BehaviorSubject(true);
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterEnabled: filterEnabled,
        filterDebounceTime: 1,
        filterQuery: 'de',
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      filterEnabled.next(false);
      fixture.autoDetectChanges();
      expect(getFilterInputElement(fixture, 0, columns[0])).toBeNull();
      expect(getRowsElements(fixture).length).toBe(2);
      done();
    });
  });

  it('[column filter] shows all records if all filters are clear', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'lastName', filterDebounceTime: 1 }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      expect(getRowsElements(fixture).length).toBe(2);
      expect(getCellElement(fixture, 0, 0).innerText).toBe(source[0].lastName);
      expect(getCellElement(fixture, 0, 1).innerText).toBe(source[1].lastName);
      done();
    });
  });

  it('[column filter] uses query filter provided as a subject [text renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterDebounceTime: 1,
        filterQuery: new BehaviorSubject('de'),
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      expect(getFilterInputElement(fixture, 0, columns[0]).value).toBe('de');
      expect(getRowsElements(fixture).length).toBe(1);
      expect(getCellElement(fixture, 0, 0).innerText).toBe(source[1].lastName);
      done();
    });
  });

  it('[column filter] uses query filter provided as a subject [checkbox renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'value',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Checkbox,
        filterQuery: new BehaviorSubject(true),
      }),
    ];
    const source = [
      { value: true },
      { value: false },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      expect(getFilterInputElement(fixture, 0, columns[0]).checked).toBe(true);
      expect(getRowsElements(fixture).length).toBe(1);
      expect(getCellElement(fixture, 0, 0).innerText).toBe('true');
      done();
    });
  });

  it('[column filter] uses query filter provided as a subject [number renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'age',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Number,
        filterQuery: new BehaviorSubject('>7'),
      }),
    ];
    const source = [
      { age: 5 },
      { age: 10 },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      expect(getFilterInputElement(fixture, 0, columns[0]).value).toBe('>7');
      expect(getRowsElements(fixture).length).toBe(1);
      expect(getCellElement(fixture, 0, 0).innerText).toBe('10');
      done();
    });
  });

  it('[column filter] starts to filter after providing filter query [text renderer]', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'lastName', filterDebounceTime: 1 }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    fillIn(getFilterInputElement(fixture, 0, columns[0]), 'de');
    whenStable(fixture).then(() => {
      expect(getFilterInputElement(fixture, 0, columns[0]).value).toBe('de');
      expect(getRowsElements(fixture).length).toBe(1);
      expect(getCellElement(fixture, 0, 0).innerText).toBe(source[1].lastName);
      expect(columns[0].filterQuery.getValue()).toBe('de');
      done();
    });
  });

  it('[column filter] starts to filter after providing filter query [checkbox renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'value',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Checkbox,
      }),
    ];
    const source = [
      { value: true },
      { value: false },
    ];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    toggleCheckbox(getFilterInputElement(fixture, 0, columns[0]));
    whenStable(fixture).then(() => {
      expect(getFilterInputElement(fixture, 0, columns[0]).checked).toBe(true);
      expect(getRowsElements(fixture).length).toBe(1);
      expect(getCellElement(fixture, 0, 0).innerText).toBe('true');
      expect(columns[0].filterQuery.getValue()).toBe(true);
      done();
    });
  });

  it('[column filter] starts to filter after providing filter query [number renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'age',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Number,
      }),
    ];
    const source = [
      { age: 5 },
      { age: 10 },
    ];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    fillIn(getFilterInputElement(fixture, 0, columns[0]), '>7');
    whenStable(fixture).then(() => {
      expect(getFilterInputElement(fixture, 0, columns[0]).value).toBe('>7');
      expect(getRowsElements(fixture).length).toBe(1);
      expect(getCellElement(fixture, 0, 0).innerText).toBe('10');
      expect(columns[0].filterQuery.getValue()).toBe('>7');
      done();
    });
  });

  it('[column filter] reacts to filter change [text renderer]', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'lastName', filterDebounceTime: 1, filterQuery: 'ab' }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      fillIn(getFilterInputElement(fixture, 0, columns[0]), 'de');
      whenStable(fixture).then(() => {
        expect(getFilterInputElement(fixture, 0, columns[0]).value).toBe('de');
        expect(getRowsElements(fixture).length).toBe(1);
        expect(getCellElement(fixture, 0, 0).innerText).toBe(source[1].lastName);
        expect(columns[0].filterQuery.getValue()).toBe('de');
        done();
      });
    });
  });

  it('[column filter] reacts to filter change [checkbox renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'value',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Checkbox,
        filterQuery: true,
      }),
    ];
    const source = [
      { value: true },
      { value: false },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      toggleCheckbox(getFilterInputElement(fixture, 0, columns[0]));
      whenStable(fixture).then(() => {
        expect(getFilterInputElement(fixture, 0, columns[0]).checked).toBe(false);
        expect(getRowsElements(fixture).length).toBe(1);
        expect(getCellElement(fixture, 0, 0).innerText).toBe('false');
        expect(columns[0].filterQuery.getValue()).toBe(false);
        done();
      });
    });
  });

  it('[column filter] reacts to filter change [number renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'age',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Number,
        filterQuery: '>7',
      }),
    ];
    const source = [
      { age: '5' },
      { age: '10' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      fillIn(getFilterInputElement(fixture, 0, columns[0]), '<7');
      whenStable(fixture).then(() => {
        expect(getFilterInputElement(fixture, 0, columns[0]).value).toBe('<7');
        expect(getRowsElements(fixture).length).toBe(1);
        expect(getCellElement(fixture, 0, 0).innerText).toBe('5');
        expect(columns[0].filterQuery.getValue()).toBe('<7');
        done();
      });
    });
  });

  it('[column filter] reacts to query filter change provided as a subject [text renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterDebounceTime: 1,
        filterQuery: new BehaviorSubject('de'),
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      columns[0].filterQuery.next('ab');
      whenStable(fixture).then(() => {
        expect(getFilterInputElement(fixture, 0, columns[0]).value).toBe('ab');
        expect(getRowsElements(fixture).length).toBe(1);
        expect(getCellElement(fixture, 0, 0).innerText).toBe('abc');
        done();
      });
    });
  });

  it('[column filter] reacts to query filter change provided as a subject [checkbox renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'value',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Checkbox,
        filterQuery: new BehaviorSubject(true),
      }),
    ];
    const source = [
      { value: true },
      { value: false },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      columns[0].filterQuery.next(false);
      whenStable(fixture).then(() => {
        expect(getFilterInputElement(fixture, 0, columns[0]).checked).toBe(false);
        expect(getRowsElements(fixture).length).toBe(1);
        expect(getCellElement(fixture, 0, 0).innerText).toBe('false');
        done();
      });
    });
  });

  it('[column filter] reacts to query filter change provided as a subject [number renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'age',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Number,
        filterQuery: new BehaviorSubject('>7'),
      }),
    ];
    const source = [
      { age: 5 },
      { age: 10 },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      columns[0].filterQuery.next('<7');
      whenStable(fixture).then(() => {
        expect(getFilterInputElement(fixture, 0, columns[0]).value).toBe('<7');
        expect(getRowsElements(fixture).length).toBe(1);
        expect(getCellElement(fixture, 0, 0).innerText).toBe('5');
        done();
      });
    });
  });

  it('[column filter] does not filter after query deletion [text renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'lastName',
        filterDebounceTime: 1,
        filterQuery: new BehaviorSubject('de'),
      }),
    ];
    const source = [
      { lastName: 'abc' },
      { lastName: 'def' },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      fillIn(getFilterInputElement(fixture, 0, columns[0]), '');
      whenStable(fixture).then(() => {
        expect(getRowsElements(fixture).length).toBe(2);
        expect(columns[0].filterQuery.getValue()).toBe('');
        done();
      });
    });
  });

  it('[column filter] does not filter after query deletion [checkbox renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'value',
        filterDebounceTime: 1,
        filterQuery: new BehaviorSubject(true),
        filterRenderer: CellRenderer.Checkbox,
      }),
    ];
    const source = [
      { value: true },
      { value: false },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      toggleCheckbox(getFilterInputElement(fixture, 0, columns[0]));
      whenStable(fixture).then(() => {
        toggleCheckbox(getFilterInputElement(fixture, 0, columns[0]));
        whenStable(fixture).then(() => {
          expect(getRowsElements(fixture).length).toBe(2);
          expect(columns[0].filterQuery.getValue()).toBe('');
          done();
        });
      });
    });
  });

  it('[column filter] does not filter after query deletion [number renderer]', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'age',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Number,
        filterQuery: new BehaviorSubject('>7'),
      }),
    ];
    const source = [
      { age: 5 },
      { age: 10 },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      fillIn(getFilterInputElement(fixture, 0, columns[0]), '');
      whenStable(fixture).then(() => {
        expect(getRowsElements(fixture).length).toBe(2);
        expect(columns[0].filterQuery.getValue()).toBe('');
        done();
      });
    });
  });

  it('[column filter] allows to clear checkbox filter using observable', (done) => {
    const columns = [
      new ColumnDefinition({
        value: 'value',
        filterDebounceTime: 1,
        filterQuery: true,
        filterRenderer: CellRenderer.Checkbox,
      }),
    ];
    const source = [
      { value: true },
      { value: false },
    ];
    component.columns = columns;
    component.source = source;
    whenStable(fixture).then(() => {
      columns[0].filterQuery.next('');
      whenStable(fixture).then(() => {
        expect(getRowsElements(fixture).length).toBe(2);
        expect(getFilterInputElement(fixture, 0, columns[0]).indeterminate).toBe(true);
        done();
      });
    });
  });

  it('[column filter] filters only by one column', () => {
    const columns = [
      new ColumnDefinition({
        value: 'value1',
        filterDebounceTime: 1,
        filterQuery: true,
        filterRenderer: CellRenderer.Checkbox,
      }),
      new ColumnDefinition({
        value: 'value2',
        filterDebounceTime: 1,
        filterRenderer: CellRenderer.Checkbox,
      }),
    ];
    const source = [
      { value1: true, value2: true },
      { value1: true, value2: false },
      { value1: false, value2: true },
      { value1: false, value2: false },
    ];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    expect(getRowsElements(fixture).length).toBe(2);
  });

  it('[column filter] filters by two columns', () => {
    const columns = [
      new ColumnDefinition({
        value: 'value1',
        filterDebounceTime: 1,
        filterQuery: true,
        filterRenderer: CellRenderer.Checkbox,
      }),
      new ColumnDefinition({
        value: 'value2',
        filterDebounceTime: 1,
        filterQuery: false,
        filterRenderer: CellRenderer.Checkbox,
      }),
    ];
    const source = [
      { value1: true, value2: true },
      { value1: true, value2: false },
      { value1: false, value2: true },
      { value1: false, value2: false },
    ];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    expect(getRowsElements(fixture).length).toBe(1);
  });

  it('[column sort] does not sort by default [SingleColumnSort]', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortAlgorithm: new SingleColumnSort() });
    fixture.autoDetectChanges();
    for (let i = 0; i < source.length; i++) {
      expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(source[i].l1);
    }
  });

  it('[column sort] does not sort by default [MultiColumnSort]', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortAlgorithm: new MultiColumnSort() });
    fixture.autoDetectChanges();
    source.forEach(({ l1 }, i) =>
      expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
    );
  });

  it('[column sort] realizes default-ascending-descending-default sort cycle', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    component.columns = columns;
    fixture.autoDetectChanges();

    const headerElement = getHeaderElement(fixture, 0);
    expect(headerElement.classList.contains('sort-default')).toBeTruthy();
    headerElement.click();
    whenStable(fixture).then(() => {
      expect(headerElement.classList.contains('sort-ascending')).toBeTruthy();
      headerElement.click();
      whenStable(fixture).then(() => {
        expect(headerElement.classList.contains('sort-descending')).toBeTruthy();
        headerElement.click();
        whenStable(fixture).then(() => {
          expect(headerElement.classList.contains('sort-default')).toBeTruthy();
          done();
        });
      });
    });
  });

  it('[column sort] sorts ascending single column [SingleColumnSort]', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    const expectedSort = [source[1], source[2], source[0]];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortAlgorithm: new SingleColumnSort() });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      expectedSort.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] sorts descending single column [SingleColumnSort]', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    const expectedSort = [source[0], source[2], source[1]];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortAlgorithm: new SingleColumnSort() });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      getHeaderElement(fixture, 0).click();
      whenStable(fixture).then(() => {
        expectedSort.forEach(({ l1 }, i) => 
          expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
        );
        done();
      });
    });
  });

  it('[column sort] sorts ascending single column [MultiColumnSort]', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    const expectedSort = [source[1], source[2], source[0]];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortAlgorithm: new MultiColumnSort() });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      expectedSort.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] sorts descending single column [MultiColumnSort]', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    const expectedSort = [source[0], source[2], source[1]];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortAlgorithm: new MultiColumnSort() });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      getHeaderElement(fixture, 0).click();
      whenStable(fixture).then(() => {
        expectedSort.forEach(({ l1 }, i) => 
          expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
        );
        done();
      });
    });
  });

  it('[column sort] sorts stably two columns [MultiColumnSort]', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
      new ColumnDefinition({ value: 'l2' }),
    ];
    const source = [
      { l1: 'c', l2: 'b' },
      { l1: 'a', l2: 'a' },
      { l1: 'd', l2: 'a' },
      { l1: 'b', l2: 'a' },
    ];
    const expectedSort = [source[1], source[3], source[2], source[0]];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortAlgorithm: new MultiColumnSort() });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      getHeaderElement(fixture, 1).click();
      whenStable(fixture).then(() => {
        expectedSort.forEach(({ l1 }, i) =>
          expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
        );
        done();
      });
    });
  });

  it('[column sort] sorts using given configuration subject [SingleColumnSort]', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    const expectedSort = [source[0], source[2], source[1]];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      sortAlgorithm: new SingleColumnSort(new BehaviorSubject(
        new ColumnSortState(columns[0], SortDirection.Descending)
      )),
    });
    fixture.autoDetectChanges();
    expectedSort.forEach(({ l1 }, i) =>
      expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
    );
  });

  it('[column sort] sorts using given configuration subject after sorted column state change [SingleColumnSort]', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    const expectedSort = [source[1], source[2], source[0]];
    component.columns = columns;
    component.source = source;
    const sortState = new BehaviorSubject(new ColumnSortState(columns[0], SortDirection.Descending));
    component.configuration = new TableConfiguration({ sortAlgorithm: new SingleColumnSort(sortState) });
    fixture.autoDetectChanges();
    sortState.next(new ColumnSortState(columns[0], SortDirection.Ascending));
    fixture.autoDetectChanges();
    expectedSort.forEach(({ l1 }, i) =>
      expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
    );
  });

  it('[column sort] sorts using given configuration subject after another column state change [SingleColumnSort]', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
      new ColumnDefinition({ value: 'l2' }),
    ];
    const source = [
      { l1: 'c', l2: 'c' },
      { l1: 'a', l2: 'b' },
      { l1: 'b', l2: 'a' },
    ];
    const expectedSort = [source[0], source[1], source[2]];
    component.columns = columns;
    component.source = source;
    const sortState = new BehaviorSubject(new ColumnSortState(columns[0], SortDirection.Ascending));
    component.configuration = new TableConfiguration({ sortAlgorithm: new SingleColumnSort(sortState) });
    fixture.autoDetectChanges();
    sortState.next(new ColumnSortState(columns[1], SortDirection.Descending));
    fixture.autoDetectChanges();
    expectedSort.forEach(({ l2 }, i) =>
      expect(getCellElement(fixture, 1, i).innerText.trim()).toBe(l2)
    );
  });

  it('[column sort] allows to reset sort [SingleColumnSort]', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortAlgorithm: new SingleColumnSort() });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      fixture.nativeElement.querySelector('.reset-sort').click();
      whenStable(fixture).then(() => {
        source.forEach(({ l1 }, i) =>
          expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
        );
        done();
      });
    });
  });

  it('[column sort] sorts using given configuration subject [MultiColumnSort]', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
      new ColumnDefinition({ value: 'l2' }),
    ];
    const source = [
      { l1: 'c', l2: 'c' },
      { l1: 'a', l2: 'b' },
      { l1: 'b', l2: 'a' },
    ];
    const expectedSort = [source[0], source[2], source[1]];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      sortAlgorithm: new MultiColumnSort(new BehaviorSubject([
        new ColumnSortState(columns[0], SortDirection.Descending)
      ])),
    });
    fixture.autoDetectChanges();
    expectedSort.forEach(({ l1 }, i) =>
      expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
    );
  });

  it('[column sort] sorts using given configuration subject after sorted column state change [MultieColumnSort]', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
      new ColumnDefinition({ value: 'l2' }),
    ];
    const source = [
      { l1: 'c', l2: 'c' },
      { l1: 'a', l2: 'b' },
      { l1: 'b', l2: 'a' },
    ];
    const expectedSort = [source[1], source[2], source[0]];
    component.columns = columns;
    component.source = source;
    const sortState = new BehaviorSubject([new ColumnSortState(columns[0], SortDirection.Descending)]);
    component.configuration = new TableConfiguration({ sortAlgorithm: new MultiColumnSort(sortState) });
    fixture.autoDetectChanges();
    sortState.next([new ColumnSortState(columns[0], SortDirection.Ascending)]);
    fixture.autoDetectChanges();
    expectedSort.forEach(({ l1 }, i) =>
      expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
    );
  });

  it('[column sort] sorts using given configuration subject after another column state change [MultiColumnSort]', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
      new ColumnDefinition({ value: 'l2' }),
    ];
    const source = [
      { l1: 'c', l2: 'c' },
      { l1: 'a', l2: 'b' },
      { l1: 'b', l2: 'a' },
    ];
    const expectedSort = [source[0], source[1], source[2]];
    component.columns = columns;
    component.source = source;
    const sortState = new BehaviorSubject([new ColumnSortState(columns[0], SortDirection.Ascending)]);
    component.configuration = new TableConfiguration({ sortAlgorithm: new MultiColumnSort(sortState) });
    fixture.autoDetectChanges();
    sortState.next([
      new ColumnSortState(columns[0], SortDirection.Ascending),
      new ColumnSortState(columns[1], SortDirection.Descending),
    ]);
    fixture.autoDetectChanges();
    expectedSort.forEach(({ l2 }, i) =>
      expect(getCellElement(fixture, 1, i).innerText.trim()).toBe(l2)
    );
  });

  it('[column sort] allows to reset sort [MultiColumnSort]', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
      new ColumnDefinition({ value: 'l2' }),
    ];
    const source = [
      { l1: 'c', l2: 'c' },
      { l1: 'a', l2: 'b' },
      { l1: 'b', l2: 'a' },
    ];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortAlgorithm: new MultiColumnSort() });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      fixture.nativeElement.querySelector('.reset-sort').click();
      whenStable(fixture).then(() => {
        source.forEach(({ l1 }, i) =>
          expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
        );
        done();
      });
    });
  });

  it('[column sort] sort is enabled, when global sortEnabled=true', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    const expectedSort = [source[1], source[2], source[0]];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortEnabled: true });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      expectedSort.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] disables sort, when global sortEnabled=false', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortEnabled: false });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      source.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] disables sort, when global subject sortEnabled contains false', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({ sortEnabled: new BehaviorSubject(false) });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      source.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] disables sort, when global subject sortEnabled changes to false', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    component.columns = columns;
    component.source = source;
    const sortEnabled = new BehaviorSubject(true);
    component.configuration = new TableConfiguration({ sortEnabled });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      sortEnabled.next(false);
      fixture.autoDetectChanges();
      source.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] disables sort, when column.sortEnabled=true', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1', sortEnabled: true }),
      new ColumnDefinition({ value: 'l2', sortEnabled: true }),
    ];
    const source = [
      { l1: 'c', l2: 'c' },
      { l1: 'a', l2: 'b' },
      { l1: 'b', l2: 'a' },
    ];
    const expectedSort = [source[2], source[1], source[0]];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    getHeaderElement(fixture, 1).click();
    whenStable(fixture).then(() => {
      expectedSort.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] disables sort, when column.sortEnabled=false', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1', sortEnabled: true }),
      new ColumnDefinition({ value: 'l2', sortEnabled: false }),
    ];
    const source = [
      { l1: 'c', l2: 'c' },
      { l1: 'a', l2: 'b' },
      { l1: 'b', l2: 'a' },
    ];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    const expectedSort = [source[1], source[2], source[0]];
    getHeaderElement(fixture, 0).click();
    getHeaderElement(fixture, 1).click();
    whenStable(fixture).then(() => {
      expectedSort.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] disables sort, when subject column.sortEnabled contains false', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1', sortEnabled: true }),
      new ColumnDefinition({ value: 'l2', sortEnabled: new BehaviorSubject(false) }),
    ];
    const source = [
      { l1: 'c', l2: 'c' },
      { l1: 'a', l2: 'b' },
      { l1: 'b', l2: 'a' },
    ];
    component.columns = columns;
    component.source = source;
    const expectedSort = [source[1], source[2], source[0]];
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    getHeaderElement(fixture, 1).click();
    whenStable(fixture).then(() => {
      expectedSort.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] disables sort, when subject column.sortEnabled changes to false', (done) => {
    const sortEnabled = new BehaviorSubject(true);
    const columns = [
      new ColumnDefinition({ value: 'l1', sortEnabled: true }),
      new ColumnDefinition({ value: 'l2', sortEnabled }),
    ];
    const source = [
      { l1: 'c', l2: 'c' },
      { l1: 'a', l2: 'b' },
      { l1: 'b', l2: 'a' },
    ];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    const expectedSort = [source[1], source[2], source[0]];
    getHeaderElement(fixture, 0).click();
    getHeaderElement(fixture, 1).click();
    whenStable(fixture).then(() => {
      sortEnabled.next(false);
      fixture.autoDetectChanges();
      expectedSort.forEach(({ l1 }, i) =>
        expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
      );
      done();
    });
  });

  it('[column sort] does not change sort configuration if global sortEnabled=false', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    component.columns = columns;
    component.source = source;
    const sortState = new BehaviorSubject(null);
    component.configuration = new TableConfiguration({
      sortEnabled: false,
      sortAlgorithm: new SingleColumnSort(sortState),
    });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      expect(sortState.getValue()).toBeNull();
      done();
    });
  });

  it('[column sort] does not change sort configuration if column.sortEnabled=false', (done) => {
    const columns = [
      new ColumnDefinition({ value: 'l1', sortEnabled: false }),
    ];
    const source = [
      { l1: 'c' },
      { l1: 'a' },
      { l1: 'b' },
    ];
    component.columns = columns;
    component.source = source;
    const sortState = new BehaviorSubject(null);
    component.configuration = new TableConfiguration({ sortAlgorithm: new SingleColumnSort(sortState) });
    fixture.autoDetectChanges();
    getHeaderElement(fixture, 0).click();
    whenStable(fixture).then(() => {
      expect(sortState.getValue()).toBeNull();
      done();
    });
  });

  it('[pagination] hides pagination bar if paginationEnabled=false', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    component.columns = columns;
    component.configuration = new TableConfiguration({ paginationEnabled: false });
    fixture.autoDetectChanges();
    expect(getPaginationBar(fixture)).toBeNull();
  });

  it('[pagination] shows pagination bar if paginationEnabled=true', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    component.columns = columns;
    component.configuration = new TableConfiguration({ paginationEnabled: true });
    fixture.autoDetectChanges();
    expect(getPaginationBar(fixture)).toBeTruthy();
  });

  it('[pagination] shows pagination bar if subject paginationEnabled contains true', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    component.columns = columns;
    component.configuration = new TableConfiguration({ paginationEnabled: new BehaviorSubject(true) });
    fixture.autoDetectChanges();
    expect(getPaginationBar(fixture)).toBeTruthy();
  });

  it('[pagination] shows pagination bar if subject paginationEnabled changes to true', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    component.columns = columns;
    const paginationEnabled = new BehaviorSubject(false);
    component.configuration = new TableConfiguration({ paginationEnabled });
    fixture.autoDetectChanges();
    paginationEnabled.next(true);
    fixture.autoDetectChanges();
    expect(getPaginationBar(fixture)).toBeTruthy();
  });
});

function whenStable(fixture: ComponentFixture<any>): Promise<any> {
  fixture.autoDetectChanges();
  return fixture.whenStable();
}

function compareColumnsName(nativeElement, columns) {
  columns.forEach((column, index) => {
    const header = nativeElement.querySelector(`.header-${index}`) as HTMLElement;
    expect(header.innerText.trim()).toBe(columns[index].title.getValue());
  });
}
