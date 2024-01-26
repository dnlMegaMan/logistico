import { TestBed } from '@angular/core/testing';

import { UnidadesOrganizacionalesService } from './unidades-organizacionales.service';

describe('UnidadesOrganizacionalesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnidadesOrganizacionalesService = TestBed.get(UnidadesOrganizacionalesService);
    expect(service).toBeTruthy();
  });
});
