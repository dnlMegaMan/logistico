import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaRolesComponent } from './busqueda-roles.component';

describe('BusquedaRolesComponent', () => {
  let component: BusquedaRolesComponent;
  let fixture: ComponentFixture<BusquedaRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
