import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionOcComponent } from './devolucion-oc.component';

describe('DevolucionOcComponent', () => {
  let component: DevolucionOcComponent;
  let fixture: ComponentFixture<DevolucionOcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevolucionOcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionOcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
