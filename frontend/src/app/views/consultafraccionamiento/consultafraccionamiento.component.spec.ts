import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultafraccionamientoComponent } from './consultafraccionamiento.component';

describe('ConsultafraccionamientoComponent', () => {
  let component: ConsultafraccionamientoComponent;
  let fixture: ComponentFixture<ConsultafraccionamientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultafraccionamientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultafraccionamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
