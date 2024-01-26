import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';

describe('BusquedaproductosComponent', () => {
  let component: BusquedaproductosComponent;
  let fixture: ComponentFixture<BusquedaproductosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaproductosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaproductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
