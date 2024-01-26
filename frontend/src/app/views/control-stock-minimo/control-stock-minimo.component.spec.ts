import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlStockMinimoComponent } from './control-stock-minimo.component';

describe('ControlStockMinimoComponent', () => {
  let component: ControlStockMinimoComponent;
  let fixture: ComponentFixture<ControlStockMinimoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlStockMinimoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlStockMinimoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
