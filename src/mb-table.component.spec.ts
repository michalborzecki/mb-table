import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { MbTableComponent } from './mb-table.component';
import { Component, Input } from '@angular/core';
import { ColumnDefinition } from './column-definition';
import { BehaviorSubject } from 'rxjs/Rx';

function getColumns(): ColumnDefinition[] {
  return [
    new ColumnDefinition({ title: 'Last Name' }),
    new ColumnDefinition({ title: 'First Name' }),
    new ColumnDefinition({ title: 'Age' }),
  ];
}

@Component({
  template: `
    <mb-table [settings]="settings" [columns]="columns" [source]="source"></mb-table>
  `
})
class TestHostComponent {
  @Input() settings: any = {};
  @Input() columns: ColumnDefinition[] = [];
  @Input() source: any[] = [];
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

  it('shows initial column title', () => {
    const columns = getColumns();
    component.columns = columns;
    fixture.detectChanges();
    compareColumnsName(nativeElement, columns);
  });

  it('reacts to initial column title change', () => {
    const columns = getColumns();
    component.columns = columns;
    fixture.detectChanges();

    columns[0].title.next('New title');
    columns[1].title.next('Another title');
    columns[2].title.next('Last title');
    fixture.detectChanges();
    compareColumnsName(nativeElement, columns);
  });

  it('shows title of changed column', () => {
    component.columns = getColumns();
    fixture.detectChanges();

    const columns = getColumns();
    columns[0].title.next('New title');
    columns[1].title.next('Another title');
    columns[2].title.next('Last title');
    component.columns = columns;
    fixture.detectChanges();
    compareColumnsName(nativeElement, columns);
  });

  it('reacts to changed column title change', () => {
    component.columns = getColumns();
    fixture.detectChanges();

    const columns = getColumns();
    component.columns = columns;
    fixture.detectChanges();
    columns[0].title.next('New title');
    columns[1].title.next('Another title');
    columns[2].title.next('Last title');
    fixture.detectChanges();
    compareColumnsName(nativeElement, columns);
  });

  it('renders cell value using property name', () => {
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
    fixture.detectChanges();
    columns.forEach((column, index) =>
      expect(getCellElement(nativeElement, index, 0).innerText.trim())
        .toBe(String(source[0][column.columnDefinitionSource.value as string]))
    );
  });

  it('renders cell value using function', () => {
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
    fixture.detectChanges();
    columns.forEach((column, index) =>
      expect(getCellElement(nativeElement, index, 0).innerText.trim())
        .toBe(String((column.columnDefinitionSource.value as (record: any) => any)(source[0])))
    );
  });

  it('renders cell value using function subject', () => {
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
    fixture.detectChanges();
    columns.forEach((column, index) => {
      const valueCallback =
        (column.columnDefinitionSource.value as BehaviorSubject<(record: any) => any>)
        .getValue();
      expect(getCellElement(nativeElement, index, 0).innerText.trim())
        .toBe(String(valueCallback(source[0])));
    });
  });

  it('reacts to column value function change', () => {
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
    fixture.detectChanges();
    columns[0].value.next((record) => record.firstName + '1');
    columns[1].value.next((record) => record.lastName + '1');
    columns[2].value.next((record) => record.age + '1');
    fixture.detectChanges();
    columns.forEach((column, index) =>
      expect(getCellElement(nativeElement, index, 0).innerText.trim())
        .toBe(String(column.value.getValue()(source[0])))
    );
  });
});

function compareColumnsName(nativeElement, columns) {
  columns.forEach((column, index) => {
    const header = nativeElement.querySelector(`.header-${index}`) as HTMLElement;
    expect(header.innerText.trim()).toBe(columns[index].title.getValue());
  });
}

function getCellElement(nativeElement: HTMLElement, columnIndex: number, rowIndex: number): HTMLElement {
  const cellSelector = `tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 1})`;
  return nativeElement.querySelector(cellSelector) as HTMLElement;
}
