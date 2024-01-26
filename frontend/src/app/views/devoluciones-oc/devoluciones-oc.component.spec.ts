import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionesOcComponent } from './devoluciones-oc.component';

describe('DevolucionesOcComponent', () => {
  let component: DevolucionesOcComponent;
  let fixture: ComponentFixture<DevolucionesOcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevolucionesOcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionesOcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
