import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoOCComponent } from './ingreso-oc.component';

describe('IngresoOCComponent', () => {
  let component: IngresoOCComponent;
  let fixture: ComponentFixture<IngresoOCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresoOCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoOCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
