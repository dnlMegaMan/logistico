import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispensarsolicitudpacienteComponent } from './dispensarsolicitudpaciente.component';

describe('DispensarsolicitudpacienteComponent', () => {
  let component: DispensarsolicitudpacienteComponent;
  let fixture: ComponentFixture<DispensarsolicitudpacienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispensarsolicitudpacienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispensarsolicitudpacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
