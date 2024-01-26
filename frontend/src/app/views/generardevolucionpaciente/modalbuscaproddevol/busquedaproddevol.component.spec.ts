import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaProdDevolComponent } from './busquedaproddevol.component';

describe('BusquedaProdDevolComponent', () => {
  let component: BusquedaProdDevolComponent;
  let fixture: ComponentFixture<BusquedaProdDevolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaProdDevolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaProdDevolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
