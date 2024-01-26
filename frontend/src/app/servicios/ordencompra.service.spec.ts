import { TestBed } from '@angular/core/testing';

import { OrdenCompraService } from './ordencompra.service';

describe('OrdencompraService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdenCompraService = TestBed.get(OrdenCompraService);
    expect(service).toBeTruthy();
  });
});
