import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasaldosporbodegasComponent } from './consultasaldosporbodegas.component';

describe('ConsultasaldosporbodegasComponent', () => {
  let component: ConsultasaldosporbodegasComponent;
  let fixture: ComponentFixture<ConsultasaldosporbodegasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultasaldosporbodegasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasaldosporbodegasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
