import {
  ComponentFixture,
  async
} from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/Rx';
import { TestHostComponent } from '../helpers/test-host.component';
import { configureTestingModule } from '../helpers/configure-testing-module';
import {
  getCellElement,
  getFilterRow,
  getRowsElements,
  getFilterInputElement,
} from '../helpers/element';
import { whenStable } from '../helpers/when-stable';
import {
  fillIn,
  toggleCheckbox,
} from '../helpers/input';
import {
  ColumnDefinition,
  CellRenderer,
  TableConfiguration,
} from '../../index';

describe('MbTableComponent [column filter]', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    configureTestingModule().then((f) => {
      fixture = f;
      component = fixture.componentInstance;
    });
  }));

  it('hides filters if filterEnabled=false', (done) => {
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

  it('shows filters if filterEnabled=true', () => {
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

  it('hides filters if subject filterEnabled contains false', (done) => {
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

  it('hides filters if subject filterEnabled changes to false', (done) => {
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

  it('hides filter if column.filterEnabled=false', (done) => {
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

  it('shows filter if column.filterEnabled=true', (done) => {
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

  it('hides filter if subject column.filterEnabled contains false', (done) => {
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

  it('hides filter if subject column.filterEnabled changes false', (done) => {
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

  it('shows all records if all filters are clear', (done) => {
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

  it('uses query filter provided as a subject [text renderer]', (done) => {
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

  it('uses query filter provided as a subject [checkbox renderer]', (done) => {
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

  it('uses query filter provided as a subject [number renderer]', (done) => {
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

  it('starts to filter after providing filter query [text renderer]', (done) => {
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

  it('starts to filter after providing filter query [checkbox renderer]', (done) => {
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

  it('starts to filter after providing filter query [number renderer]', (done) => {
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

  it('reacts to filter change [text renderer]', (done) => {
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

  it('reacts to filter change [checkbox renderer]', (done) => {
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

  it('reacts to filter change [number renderer]', (done) => {
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

  it('reacts to query filter change provided as a subject [text renderer]', (done) => {
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

  it('reacts to query filter change provided as a subject [checkbox renderer]', (done) => {
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

  it('reacts to query filter change provided as a subject [number renderer]', (done) => {
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

  it('does not filter after query deletion [text renderer]', (done) => {
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

  it('does not filter after query deletion [checkbox renderer]', (done) => {
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

  it('does not filter after query deletion [number renderer]', (done) => {
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

  it('allows to clear checkbox filter using observable', (done) => {
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

  it('filters only by one column', () => {
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

  it('filters by two columns', () => {
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
});
