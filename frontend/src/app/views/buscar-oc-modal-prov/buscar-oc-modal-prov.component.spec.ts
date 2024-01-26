import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarOcModalProvComponent } from './buscar-oc-modal-prov.component';

describe('BuscarOcModalProvComponent', () => {
  let component: BuscarOcModalProvComponent;
  let fixture: ComponentFixture<BuscarOcModalProvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscarOcModalProvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarOcModalProvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
