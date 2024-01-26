import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultakardexComponent } from './consultakardex.component';

describe('ConsultakardexComponent', () => {
  let component: ConsultakardexComponent;
  let fixture: ComponentFixture<ConsultakardexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultakardexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultakardexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
