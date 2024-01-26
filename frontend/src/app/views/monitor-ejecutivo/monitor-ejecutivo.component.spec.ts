import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorEjecutivoComponent } from './monitor-ejecutivo.component';

describe('MonitorEjecutivoComponent', () => {
  let component: MonitorEjecutivoComponent;
  let fixture: ComponentFixture<MonitorEjecutivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorEjecutivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorEjecutivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
