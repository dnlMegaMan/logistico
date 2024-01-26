import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumopacienteporbodegaComponent } from './consumopacienteporbodega.component';

describe('ConsumopacienteporbodegaComponent', () => {
  let component: ConsumopacienteporbodegaComponent;
  let fixture: ComponentFixture<ConsumopacienteporbodegaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumopacienteporbodegaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumopacienteporbodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
