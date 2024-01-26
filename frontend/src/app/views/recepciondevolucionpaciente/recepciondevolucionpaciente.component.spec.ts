import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepciondevolucionpacienteComponent } from './recepciondevolucionpaciente.component';

describe('RecepciondevolucionpacienteComponent', () => {
  let component: RecepciondevolucionpacienteComponent;
  let fixture: ComponentFixture<RecepciondevolucionpacienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepciondevolucionpacienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepciondevolucionpacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
