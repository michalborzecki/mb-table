/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { MbTableModule, ColumnDefinition } from 'mb-table';

@Component({
  selector: 'app',
  template: `
  <mb-table [settings]="tableSettings" [columns]="tableColumns" [source]="tableData">
    <div class="pull-right" table-header-end>
      <button class="btn btn-sm btn-default header-button">btn1</button>
      <button class="btn btn-sm btn-default header-button">btn2</button>
    </div>
  </mb-table>`
})
class AppComponent {
  public tableSettings = {};
  public tableColumns = [
    new ColumnDefinition({
      title: 'Last Name',
      value: 'lastName',
    }),
    new ColumnDefinition({
      title: 'First Name',
      value: 'firstName',
    }),
    new ColumnDefinition({
      title: 'Age',
      value: 'age',
    }),
  ];
  public tableData = Array(1000).fill({
      lastName: 'aaa',
      firstName: 'bbb',
      age: 12,
    });
}

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ],
  imports: [ BrowserModule, MbTableModule ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
