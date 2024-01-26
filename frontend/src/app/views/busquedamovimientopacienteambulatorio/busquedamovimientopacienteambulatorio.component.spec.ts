import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedamovimientopacienteambulatorioComponent } from './busquedamovimientopacienteambulatorio.component';

describe('BusquedamovimientopacienteambulatorioComponent', () => {
  let component: BusquedamovimientopacienteambulatorioComponent;
  let fixture: ComponentFixture<BusquedamovimientopacienteambulatorioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedamovimientopacienteambulatorioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedamovimientopacienteambulatorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
