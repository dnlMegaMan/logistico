import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadopararealizarinventarioComponent } from './listadopararealizarinventario.component';

describe('ListadopararealizarinventarioComponent', () => {
  let component: ListadopararealizarinventarioComponent;
  let fixture: ComponentFixture<ListadopararealizarinventarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListadopararealizarinventarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadopararealizarinventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
