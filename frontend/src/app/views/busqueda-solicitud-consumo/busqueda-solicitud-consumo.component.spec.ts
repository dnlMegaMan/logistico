import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaSolicitudConsumoComponent } from './busqueda-solicitud-consumo.component';

describe('BusquedaSolicitudConsumoComponent', () => {
  let component: BusquedaSolicitudConsumoComponent;
  let fixture: ComponentFixture<BusquedaSolicitudConsumoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaSolicitudConsumoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaSolicitudConsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
