import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimientoDevolucionComponent } from './movimiento-devolucion.component';

describe('MovimientoDevolucionComponent', () => {
  let component: MovimientoDevolucionComponent;
  let fixture: ComponentFixture<MovimientoDevolucionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovimientoDevolucionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovimientoDevolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
