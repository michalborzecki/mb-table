import {
  ComponentFixture,
  async
} from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/Rx';
import { TestHostComponent } from '../helpers/test-host.component';
import { configureTestingModule } from '../helpers/configure-testing-module';
import { getCellElement } from '../helpers/element';
import { ColumnDefinition } from '../../index';

describe('MbTableComponent [column value]', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    configureTestingModule().then((f) => {
      fixture = f;
      component = fixture.componentInstance;
    });
  }));

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
    fixture.autoDetectChanges();
    columns.forEach((column, index) =>
      expect(getCellElement(fixture, index, 0).innerText.trim())
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
    fixture.autoDetectChanges();
    columns.forEach((column, index) =>
      expect(getCellElement(fixture, index, 0).innerText.trim())
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
    fixture.autoDetectChanges();
    columns.forEach((column, index) => {
      const valueCallback =
        (column.columnDefinitionSource.value as BehaviorSubject<(record: any) => any>)
        .getValue();
      expect(getCellElement(fixture, index, 0).innerText.trim())
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
});
