import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialDevolucionesComponent } from './historialdevoluciones-modal.component';

describe('HistorialDevolucionesComponent', () => {
  let component: HistorialDevolucionesComponent;
  let fixture: ComponentFixture<HistorialDevolucionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorialDevolucionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialDevolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
