import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DespachoRecetasAmbulatoriaComponent } from './despacho-recetas-ambulatoria.component';

describe('DespachoRecetasAmbulatoriaComponent', () => {
  let component: DespachoRecetasAmbulatoriaComponent;
  let fixture: ComponentFixture<DespachoRecetasAmbulatoriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DespachoRecetasAmbulatoriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DespachoRecetasAmbulatoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
