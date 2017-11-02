/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { MbTableModule } from 'mb-table';

@Component({
  selector: 'app',
  template: `
  <mb-table [settings]="tableSettings" [source]="tableData">
    <div class="pull-right" table-header-end>
      <button class="btn btn-sm btn-default header-button">btn1</button>
      <button class="btn btn-sm btn-default header-button">btn2</button>
    </div>
  </mb-table>`
})
class AppComponent {
  public tableSettings = {
    columns: [
      {
        id: 'lastName',
        title: 'Last name',
      },
      {
        id: 'firstName',
        title: 'First name',
      },
      {
        id: 'age',
        title: 'Age',
      },
    ],
  };
  public tableData = [
    {
      lastName: 'aaa',
      firstName: 'bbb',
      age: 12,
    }
  ];
}

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ],
  imports: [ BrowserModule, MbTableModule ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
