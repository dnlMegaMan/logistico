import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaproveedorComponent } from './busquedaproveedor.component';

describe('BusquedaproveedorComponent', () => {
  let component: BusquedaproveedorComponent;
  let fixture: ComponentFixture<BusquedaproveedorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaproveedorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaproveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
