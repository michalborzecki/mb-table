import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { MbTableComponent } from './mb-table.component';
import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

function getColumns() {
  return [
    {
      id: 'lastName',
      title: new BehaviorSubject('Last name'),
    },
    {
      id: 'firstName',
      title: new BehaviorSubject('First name'),
    },
    {
      id: 'age',
      title: new BehaviorSubject('Age'),
    },
  ];
}

@Component({
  template: `
    <mb-table [settings]="settings" [columns]="columns" [source]="source"></mb-table>
  `
})
class TestHostComponent {
  @Input() settings: any = {};
  @Input() columns: any[] = [];
  @Input() source: any[] = [];
}

describe('MbTableComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let nativeElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestHostComponent, MbTableComponent ],
      imports: [
        FormsModule,
        NguiAutoCompleteModule,
        ReactiveFormsModule,
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      nativeElement = fixture.nativeElement;
    });
  }));

  it('reacts to column title change', async(() => {
    let columns;
    const compareColumnsName = () =>
      columns.forEach((column, index) => {
        const header = nativeElement.querySelector(`.header-${index}`) as HTMLElement;
        expect(header.innerText.trim()).toBe(columns[index].title.getValue());
      });

    component.columns = columns = getColumns();
    fixture.detectChanges();
    compareColumnsName();

    columns[0].title.next('New title');
    columns[1].title.next('Another title');
    columns[2].title.next('Last title');
    fixture.detectChanges();
    compareColumnsName();

    component.columns = columns = getColumns();
    columns[0].title.next('New title 2');
    fixture.detectChanges();
    compareColumnsName();
  }));
});
