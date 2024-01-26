import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaSolicitudPacienteAmbulatorioComponent } from './busqueda-solicitud-paciente-ambulatorio.component';

describe('BusquedaSolicitudPacienteAmbulatorioComponent', () => {
  let component: BusquedaSolicitudPacienteAmbulatorioComponent;
  let fixture: ComponentFixture<BusquedaSolicitudPacienteAmbulatorioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaSolicitudPacienteAmbulatorioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaSolicitudPacienteAmbulatorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
