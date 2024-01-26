import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DespachosolicitudesComponent } from './despachosolicitudes.component';

describe('DespachosolicitudesComponent', () => {
  let component: DespachosolicitudesComponent;
  let fixture: ComponentFixture<DespachosolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DespachosolicitudesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DespachosolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
