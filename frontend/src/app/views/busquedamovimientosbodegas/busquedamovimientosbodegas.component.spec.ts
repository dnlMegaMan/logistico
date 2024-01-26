import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedamovimientosbodegasComponent } from './busquedamovimientosbodegas.component';

describe('BusquedamovimientosbodegasComponent', () => {
  let component: BusquedamovimientosbodegasComponent;
  let fixture: ComponentFixture<BusquedamovimientosbodegasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedamovimientosbodegasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedamovimientosbodegasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
