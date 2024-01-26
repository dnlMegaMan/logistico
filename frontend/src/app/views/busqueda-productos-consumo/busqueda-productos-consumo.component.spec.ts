import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaProductosConsumoComponent } from './busqueda-productos-consumo.component';

describe('BusquedaProductosConsumoComponent', () => {
  let component: BusquedaProductosConsumoComponent;
  let fixture: ComponentFixture<BusquedaProductosConsumoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaProductosConsumoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaProductosConsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
