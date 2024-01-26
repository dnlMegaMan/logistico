import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionfraccionamientoComponent } from './devolucionfraccionamiento.component';

describe('DevolucionfraccionamientoComponent', () => {
  let component: DevolucionfraccionamientoComponent;
  let fixture: ComponentFixture<DevolucionfraccionamientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevolucionfraccionamientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionfraccionamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
