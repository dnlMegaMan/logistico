import { TestBed } from '@angular/core/testing';

import { UnidadcompraService } from './unidadcompra.service';

describe('UnidadcompraService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnidadcompraService = TestBed.get(UnidadcompraService);
    expect(service).toBeTruthy();
  });
});
