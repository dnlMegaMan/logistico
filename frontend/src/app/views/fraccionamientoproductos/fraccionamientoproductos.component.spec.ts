import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FraccionamientoproductosComponent } from './fraccionamientoproductos.component';

describe('FraccionamientoproductosComponent', () => {
  let component: FraccionamientoproductosComponent;
  let fixture: ComponentFixture<FraccionamientoproductosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FraccionamientoproductosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FraccionamientoproductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
