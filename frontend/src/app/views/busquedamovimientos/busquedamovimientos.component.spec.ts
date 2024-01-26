import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedamovimientosComponent } from './busquedamovimientos.component';

describe('BusquedamovimientosComponent', () => {
  let component: BusquedamovimientosComponent;
  let fixture: ComponentFixture<BusquedamovimientosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedamovimientosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedamovimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
