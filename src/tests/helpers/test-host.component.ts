import {
  Component,
  Input,
} from '@angular/core';
import {
  ColumnDefinition,
  SortAlgorithm,
  MultiColumnSort,
  TableConfiguration,
} from '../../index';

@Component({
  template: `
    <mb-table
      [columns]="columns"
      [source]="source"
      [configuration]="configuration">
    </mb-table>
  `
})
export class TestHostComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() source: any[] = [];
  @Input() sortAlgorithm: SortAlgorithm = new MultiColumnSort();
  @Input() configuration: TableConfiguration = new TableConfiguration();
}
