import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultalibrocontroladoComponent } from './consultalibrocontrolado.component';

describe('ConsultalibrocontroladoComponent', () => {
  let component: ConsultalibrocontroladoComponent;
  let fixture: ComponentFixture<ConsultalibrocontroladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultalibrocontroladoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultalibrocontroladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
