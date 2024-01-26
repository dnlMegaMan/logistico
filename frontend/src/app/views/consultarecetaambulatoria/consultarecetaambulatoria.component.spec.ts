import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarecetaambulatoriaComponent } from './consultarecetaambulatoria.component';

describe('ConsultarecetaambulatoriaComponent', () => {
  let component: ConsultarecetaambulatoriaComponent;
  let fixture: ComponentFixture<ConsultarecetaambulatoriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultarecetaambulatoriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarecetaambulatoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
