import {
  ComponentFixture,
  async
} from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/Rx';
import { TestHostComponent } from '../helpers/test-host.component';
import { configureTestingModule } from '../helpers/configure-testing-module';
import {
  getPaginationBar,
  getRowsElements,
  getCellElement,
  getActivePageInput,
  getJumpToFirstPageButton,
  getJumpToPreviousPageButton,
  getJumpToNextPageButton,
  getJumpToLastPageButton,
} from '../helpers/element';
import { fillIn } from '../helpers/input';
import { whenStable } from '../helpers/when-stable';
import {
  ColumnDefinition,
  TableConfiguration,
} from '../../index';

describe('MbTableComponent [pagination]', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    configureTestingModule().then((f) => {
      fixture = f;
      component = fixture.componentInstance;
    });
  }));

  it('hides pagination bar if paginationEnabled=false', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    component.columns = columns;
    component.configuration = new TableConfiguration({ paginationEnabled: false });
    fixture.autoDetectChanges();
    expect(getPaginationBar(fixture)).toBeNull();
  });

  it('shows pagination bar if paginationEnabled=true', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    component.columns = columns;
    component.configuration = new TableConfiguration({ paginationEnabled: true });
    fixture.autoDetectChanges();
    expect(getPaginationBar(fixture)).toBeTruthy();
  });

  it('shows pagination bar if subject paginationEnabled contains true', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    component.columns = columns;
    component.configuration = new TableConfiguration({ paginationEnabled: new BehaviorSubject(true) });
    fixture.autoDetectChanges();
    expect(getPaginationBar(fixture)).toBeTruthy();
  });

  it('shows pagination bar if subject paginationEnabled changes to true', () => {
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

  it('allows to set page size using value', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: 'a' }, { l1: 'a' }, { l1: 'a' }];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
    });
    fixture.autoDetectChanges();
    expect(getRowsElements(fixture).length).toBe(1);
  });

  it('allows to set page size using subject', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: 'a' }, { l1: 'a' }, { l1: 'a' }];
    const pageSize = new BehaviorSubject(1);
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize,
    });
    fixture.autoDetectChanges();
    expect(getRowsElements(fixture).length).toBe(1);
  });

  it('reacts to page size subject change', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: 'a' }, { l1: 'a' }, { l1: 'a' }];
    const pageSize = new BehaviorSubject(1);
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize,
    });
    fixture.autoDetectChanges();
    pageSize.next(2);
    fixture.autoDetectChanges();
    expect(getRowsElements(fixture).length).toBe(2);
  });

  it('allows to set active page using value', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage: 2,
    });
    fixture.autoDetectChanges();
    expect(getCellElement(fixture, 0, 0).innerText.trim()).toBe('2');
    expect(getActivePageInput(fixture).value.trim()).toBe('2');
  });

  it('allows to set active page using subject', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    const activePage = new BehaviorSubject(2);
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage,
    });
    fixture.autoDetectChanges();
    expect(getCellElement(fixture, 0, 0).innerText.trim()).toBe('2');
    expect(getActivePageInput(fixture).value.trim()).toBe('2');
  });

  it('reacts to active page subject change', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    const activePage = new BehaviorSubject(2);
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage,
    });
    fixture.autoDetectChanges();
    activePage.next(3);
    fixture.autoDetectChanges();
    expect(getCellElement(fixture, 0, 0).innerText.trim()).toBe('3');
    expect(getActivePageInput(fixture).value.trim()).toBe('3');
  });

  it('allows to jump to the first page using button', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    const activePage = new BehaviorSubject(3);
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage,
    });
    fixture.autoDetectChanges();
    getJumpToFirstPageButton(fixture).click();
    return whenStable(fixture).then(() => {
      expect(activePage.getValue()).toBe(1);
      expect(getActivePageInput(fixture).value.trim()).toBe('1');
    });
  });

  it('allows to jump to the last page using button', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    const activePage = new BehaviorSubject(1);
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage,
    });
    fixture.autoDetectChanges();
    getJumpToLastPageButton(fixture).click();
    return whenStable(fixture).then(() => {
      expect(activePage.getValue()).toBe(3);
      expect(getActivePageInput(fixture).value.trim()).toBe('3');
    });
  });

  it('allows to jump to the previous page using button', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    const activePage = new BehaviorSubject(3);
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage,
    });
    fixture.autoDetectChanges();
    getJumpToPreviousPageButton(fixture).click();
    return whenStable(fixture).then(() => {
      expect(activePage.getValue()).toBe(2);
      expect(getActivePageInput(fixture).value.trim()).toBe('2');
    });
  });

  it('allows to jump to the next page using button', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    const activePage = new BehaviorSubject(1);
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage,
    });
    fixture.autoDetectChanges();
    getJumpToNextPageButton(fixture).click();
    return whenStable(fixture).then(() => {
      expect(activePage.getValue()).toBe(2);
      expect(getActivePageInput(fixture).value.trim()).toBe('2');
    });
  });

  it('allows to jump to the specified page using input', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    const activePage = new BehaviorSubject(1);
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage,
      activePageControlDebounceTime: 0,
    });
    fixture.autoDetectChanges();
    fillIn(getActivePageInput(fixture), '3');
    return whenStable(fixture).then(() => {
      expect(activePage.getValue()).toBe(3);
    });
  });

  it('fallbacks too large page number to its maximum value', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage: 5,
      activePageControlDebounceTime: 0,
    });
    fixture.autoDetectChanges();
    return whenStable(fixture).then(() => {
      expect(getActivePageInput(fixture).value.trim()).toBe('3');
    });
  });

  it('fallbacks too small page number to its minimum value', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage: -5,
      activePageControlDebounceTime: 0,
    });
    fixture.autoDetectChanges();
    return whenStable(fixture).then(() => {
      expect(getActivePageInput(fixture).value.trim()).toBe('1');
    });
  });

  it('fallbacks empty page number to its minimum value', () => {
    const columns = [
      new ColumnDefinition({ value: 'l1' }),
    ];
    const source = [{ l1: '1' }, { l1: '2' }, { l1: '3' }];
    component.columns = columns;
    component.source = source;
    component.configuration = new TableConfiguration({
      paginationEnabled: true,
      pageSize: 1,
      activePage: null,
      activePageControlDebounceTime: 0,
    });
    fixture.autoDetectChanges();
    return whenStable(fixture).then(() => {
      expect(getActivePageInput(fixture).value.trim()).toBe('1');
    });
  });
});
