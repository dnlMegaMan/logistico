import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleOcModalComponent } from './detalle-oc-modal.component';

describe('DetalleOcModalComponent', () => {
  let component: DetalleOcModalComponent;
  let fixture: ComponentFixture<DetalleOcModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleOcModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleOcModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
