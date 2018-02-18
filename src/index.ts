import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { MbTableComponent } from './mb-table.component';

export * from './mb-table.component';
export * from './column-definition';
export * from './cell-renderer';

@NgModule({
  imports: [
    CommonModule,
    NguiAutoCompleteModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    MbTableComponent,
  ],
  exports: [
    MbTableComponent,
  ]
})
export class MbTableModule {
}
