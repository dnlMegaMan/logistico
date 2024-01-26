import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfconsolidadoxdevolucionesComponent } from './infconsolidadoxdevoluciones.component';

describe('InfconsolidadoxdevolucionesComponent', () => {
  let component: InfconsolidadoxdevolucionesComponent;
  let fixture: ComponentFixture<InfconsolidadoxdevolucionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfconsolidadoxdevolucionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfconsolidadoxdevolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
