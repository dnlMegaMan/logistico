import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerardevolucionpacienteComponent } from './generardevolucionpaciente.component';

describe('GenerardevolucionpacienteComponent', () => {
  let component: GenerardevolucionpacienteComponent;
  let fixture: ComponentFixture<GenerardevolucionpacienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerardevolucionpacienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerardevolucionpacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
