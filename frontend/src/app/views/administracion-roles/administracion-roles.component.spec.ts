import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracionRolesComponent } from './administracion-roles.component';

describe('AdministracionRolesComponent', () => {
  let component: AdministracionRolesComponent;
  let fixture: ComponentFixture<AdministracionRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministracionRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministracionRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
