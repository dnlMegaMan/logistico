import { TestBed } from '@angular/core/testing';

import { BusquedaproductosService } from './busquedaproductos.service';

describe('BusquedaproductosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BusquedaproductosService = TestBed.get(BusquedaproductosService);
    expect(service).toBeTruthy();
  });
});
