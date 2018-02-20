import {
  ComponentFixture,
  async
} from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/Rx';
import { TestHostComponent } from '../helpers/test-host.component';
import { configureTestingModule } from '../helpers/configure-testing-module';
import { getPaginationBar } from '../helpers/element';
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
});
