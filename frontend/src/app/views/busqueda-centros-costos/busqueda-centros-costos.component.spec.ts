import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaCentrosCostosComponent } from './busqueda-centros-costos.component';

describe('BusquedaCentrosCostosComponent', () => {
  let component: BusquedaCentrosCostosComponent;
  let fixture: ComponentFixture<BusquedaCentrosCostosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaCentrosCostosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaCentrosCostosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
