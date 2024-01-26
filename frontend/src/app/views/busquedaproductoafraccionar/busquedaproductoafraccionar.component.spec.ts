import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaproductoafraccionarComponent } from './busquedaproductoafraccionar.component';

describe('BusquedaproductoafraccionarComponent', () => {
  let component: BusquedaproductoafraccionarComponent;
  let fixture: ComponentFixture<BusquedaproductoafraccionarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaproductoafraccionarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaproductoafraccionarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
