import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosDetallesolicitudComponent } from './eventos-detallesolicitud.component';

describe('EventosDetallesolicitudComponent', () => {
  let component: EventosDetallesolicitudComponent;
  let fixture: ComponentFixture<EventosDetallesolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventosDetallesolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventosDetallesolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
