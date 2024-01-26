import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModaldetallesolicitudMonitorERPComponent } from './modaldetallesolicitud-monitor-erp.component';

describe('ModaldetallesolicitudMonitorERPComponent', () => {
  let component: ModaldetallesolicitudMonitorERPComponent;
  let fixture: ComponentFixture<ModaldetallesolicitudMonitorERPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModaldetallesolicitudMonitorERPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModaldetallesolicitudMonitorERPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
