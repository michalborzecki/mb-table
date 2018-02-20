import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { TestHostComponent } from '../helpers/test-host.component';
import { MbTableComponent } from '../../mb-table.component';

export function configureTestingModule(): Promise<ComponentFixture<TestHostComponent>> {
  return TestBed.configureTestingModule({
    declarations: [ TestHostComponent, MbTableComponent ],
    imports: [
      FormsModule,
      NguiAutoCompleteModule,
      ReactiveFormsModule,
    ]
  }).compileComponents().then(() => TestBed.createComponent(TestHostComponent));
}
