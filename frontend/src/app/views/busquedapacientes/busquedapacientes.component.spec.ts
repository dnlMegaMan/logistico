import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedapacientesComponent } from './busquedapacientes.component';

describe('BusquedapacientesComponent', () => {
  let component: BusquedapacientesComponent;
  let fixture: ComponentFixture<BusquedapacientesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedapacientesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedapacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
