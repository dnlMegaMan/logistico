import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaPlantillaConsumoComponent } from './busqueda-plantilla-consumo.component';

describe('BusquedaPlantillaConsumoComponent', () => {
  let component: BusquedaPlantillaConsumoComponent;
  let fixture: ComponentFixture<BusquedaPlantillaConsumoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaPlantillaConsumoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaPlantillaConsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
