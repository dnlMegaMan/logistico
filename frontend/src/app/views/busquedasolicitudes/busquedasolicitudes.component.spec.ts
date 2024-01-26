import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedasolicitudesComponent } from './busquedasolicitudes.component';

describe('BusquedasolicitudesComponent', () => {
  let component: BusquedasolicitudesComponent;
  let fixture: ComponentFixture<BusquedasolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedasolicitudesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedasolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
