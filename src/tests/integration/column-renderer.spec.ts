import {
  ComponentFixture,
  async
} from '@angular/core/testing';
import { TestHostComponent } from '../helpers/test-host.component';
import { configureTestingModule } from '../helpers/configure-testing-module';
import { getCellElement } from '../helpers/element';
import {
  ColumnDefinition,
  CellRenderer,
} from '../../index';

describe('MbTableComponent [column renderer]', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    configureTestingModule().then((f) => {
      fixture = f;
      component = fixture.componentInstance;
    });
  }));

  it('renders value using text renderer', () => {
    const columns = [
      new ColumnDefinition({ value: 'v', renderer: CellRenderer.Text }),
    ];
    const source = [{ v: 'test' }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    expect(getCellElement(fixture, 0, 0).innerText.trim()).toBe(source[0].v);
  });

  it('renders value using number renderer', () => {
    const columns = [
      new ColumnDefinition({ value: 'v', renderer: CellRenderer.Number }),
    ];
    const source = [{ v: 123 }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    expect(getCellElement(fixture, 0, 0).innerText.trim()).toBe(String(source[0].v));
  });

  it('renders value using checkbox renderer', () => {
    const columns = [
      new ColumnDefinition({ value: 'v', renderer: CellRenderer.Checkbox }),
    ];
    const source = [{ v: true }];
    component.columns = columns;
    component.source = source;
    fixture.autoDetectChanges();
    expect(getCellElement(fixture, 0, 0).querySelector('.glyphicon-ok')).toBeTruthy();
  });
});
