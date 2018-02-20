import {
  ComponentFixture,
  async
} from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/Rx';
import { TestHostComponent } from '../helpers/test-host.component';
import { configureTestingModule } from '../helpers/configure-testing-module';
import { getCellElement } from '../helpers/element';
import { ColumnDefinition } from '../../index';

describe('MbTableComponent [column class]', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    configureTestingModule().then((f) => {
      fixture = f;
      component = fixture.componentInstance;
    });
  }));

  it('uses column class names provided as strings', () => {
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

  it('uses column class names provided as functions', () => {
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

  it('uses column class names provided as function subject', () => {
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

  it('reacts to column class names function change', () => {
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
});
