import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionsolicitudespacientesComponent } from './devolucionsolicitudespacientes.component';

describe('DevolucionsolicitudespacientesComponent', () => {
  let component: DevolucionsolicitudespacientesComponent;
  let fixture: ComponentFixture<DevolucionsolicitudespacientesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevolucionsolicitudespacientesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionsolicitudespacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
