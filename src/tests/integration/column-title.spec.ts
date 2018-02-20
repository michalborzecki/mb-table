import {
  ComponentFixture,
  async
} from '@angular/core/testing';
import { TestHostComponent } from '../helpers/test-host.component';
import { configureTestingModule } from '../helpers/configure-testing-module';
import { getHeaderElement } from '../helpers/element';
import { ColumnDefinition } from '../../index';

describe('MbTableComponent [column title]', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    configureTestingModule().then((f) => {
      fixture = f;
      component = fixture.componentInstance;
    });
  }));

  it('shows initial column title', () => {
    const columns = [
      new ColumnDefinition({ title: 'Last Name' }),
      new ColumnDefinition({ title: 'First Name' }),
      new ColumnDefinition({ title: 'Age' }),
    ];
    component.columns = columns;
    fixture.autoDetectChanges();
    compareColumnsName(fixture, columns);
  });

  it('reacts to initial column title change', () => {
    const columns = [
      new ColumnDefinition({ title: 'Last Name' }),
      new ColumnDefinition({ title: 'First Name' }),
      new ColumnDefinition({ title: 'Age' }),
    ];
    component.columns = columns;
    fixture.autoDetectChanges();

    columns[0].title.next('New title');
    columns[1].title.next('Another title');
    columns[2].title.next('Last title');
    fixture.autoDetectChanges();
    compareColumnsName(fixture, columns);
  });

  it('shows title of changed column', () => {
    component.columns = [
      new ColumnDefinition({ title: 'Last Name' }),
      new ColumnDefinition({ title: 'First Name' }),
      new ColumnDefinition({ title: 'Age' }),
    ];
    fixture.autoDetectChanges();

    const columns = [
      new ColumnDefinition({ title: 'New title' }),
      new ColumnDefinition({ title: 'Another title' }),
      new ColumnDefinition({ title: 'Last title' }),
    ];
    component.columns = columns;
    fixture.autoDetectChanges();
    compareColumnsName(fixture, columns);
  });

  it('reacts to changed column title change', () => {
    const columns = [
      new ColumnDefinition({ title: 'Last Name' }),
      new ColumnDefinition({ title: 'First Name' }),
      new ColumnDefinition({ title: 'Age' }),
    ];
    component.columns = columns;
    fixture.autoDetectChanges();
    columns[0].title.next('New title');
    columns[1].title.next('Another title');
    columns[2].title.next('Last title');
    fixture.autoDetectChanges();
    compareColumnsName(fixture, columns);
  });
});

function compareColumnsName(fixture, columns) {
  columns.forEach((column, index) => {
    expect(getHeaderElement(fixture, index).innerText.trim()).toBe(columns[index].title.getValue());
  });
}
