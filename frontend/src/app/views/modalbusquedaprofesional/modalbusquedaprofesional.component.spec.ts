import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalbusquedaprofesionalComponent } from './modalbusquedaprofesional.component';

describe('ModalbusquedaprofesionalComponent', () => {
  let component: ModalbusquedaprofesionalComponent;
  let fixture: ComponentFixture<ModalbusquedaprofesionalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalbusquedaprofesionalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalbusquedaprofesionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
