import { TestBed } from '@angular/core/testing';

import { SolicitudConsumoService } from './solicitud-consumo.service';

describe('SolicitudConsumoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SolicitudConsumoService = TestBed.get(SolicitudConsumoService);
    expect(service).toBeTruthy();
  });
});
