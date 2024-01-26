import { TestBed } from '@angular/core/testing';

import { TipodocumentoidentService } from './tipodocumentoident.service';

describe('TipodocumentoidentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TipodocumentoidentService = TestBed.get(TipodocumentoidentService);
    expect(service).toBeTruthy();
  });
});
