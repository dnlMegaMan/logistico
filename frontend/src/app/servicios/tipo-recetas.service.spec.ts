import { TestBed } from '@angular/core/testing';

import { TipoRecetasService } from './tipo-recetas.service';

describe('TipoRecetasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TipoRecetasService = TestBed.get(TipoRecetasService);
    expect(service).toBeTruthy();
  });
});
