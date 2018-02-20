import {
  ComponentFixture,
  async
} from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/Rx';
import { TestHostComponent } from '../helpers/test-host.component';
import { configureTestingModule } from '../helpers/configure-testing-module';
import {
  getCellElement,
  getHeaderElement,
  getResetSortButton,
} from '../helpers/element';
import { whenStable } from '../helpers/when-stable';
import {
  ColumnDefinition,
  TableConfiguration,
  SingleColumnSort,
  MultiColumnSort,
  SortDirection,
  ColumnSortState,
} from '../../index';

describe('MbTableComponent [column sort]', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    configureTestingModule().then((f) => {
      fixture = f;
      component = fixture.componentInstance;
    });
  }));

  it('does not sort by default [SingleColumnSort]', () => {
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

  it('does not sort by default [MultiColumnSort]', () => {
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

  it('realizes default-ascending-descending-default sort cycle', (done) => {
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

  it('sorts ascending single column [SingleColumnSort]', (done) => {
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

  it('sorts descending single column [SingleColumnSort]', (done) => {
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

  it('sorts ascending single column [MultiColumnSort]', (done) => {
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

  it('sorts descending single column [MultiColumnSort]', (done) => {
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

  it('sorts stably two columns [MultiColumnSort]', (done) => {
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

  it('sorts using given configuration subject [SingleColumnSort]', () => {
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

  it('sorts using given configuration subject after sorted column state change [SingleColumnSort]', () => {
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

  it('sorts using given configuration subject after another column state change [SingleColumnSort]', () => {
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

  it('allows to reset sort [SingleColumnSort]', (done) => {
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
      getResetSortButton(fixture).click();
      whenStable(fixture).then(() => {
        source.forEach(({ l1 }, i) =>
          expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
        );
        done();
      });
    });
  });

  it('sorts using given configuration subject [MultiColumnSort]', () => {
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

  it('sorts using given configuration subject after sorted column state change [MultieColumnSort]', () => {
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

  it('sorts using given configuration subject after another column state change [MultiColumnSort]', () => {
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

  it('allows to reset sort [MultiColumnSort]', (done) => {
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
      getResetSortButton(fixture).click();
      whenStable(fixture).then(() => {
        source.forEach(({ l1 }, i) =>
          expect(getCellElement(fixture, 0, i).innerText.trim()).toBe(l1)
        );
        done();
      });
    });
  });

  it('sort is enabled, when global sortEnabled=true', (done) => {
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

  it('disables sort, when global sortEnabled=false', (done) => {
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

  it('disables sort, when global subject sortEnabled contains false', (done) => {
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

  it('disables sort, when global subject sortEnabled changes to false', (done) => {
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

  it('disables sort, when column.sortEnabled=true', (done) => {
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

  it('disables sort, when column.sortEnabled=false', (done) => {
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

  it('disables sort, when subject column.sortEnabled contains false', (done) => {
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

  it('disables sort, when subject column.sortEnabled changes to false', (done) => {
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

  it('does not change sort configuration if global sortEnabled=false', (done) => {
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

  it('does not change sort configuration if column.sortEnabled=false', (done) => {
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
});
