import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosSolicitudComponent } from './eventos-solicitud.component';

describe('EventosSolicitudComponent', () => {
  let component: EventosSolicitudComponent;
  let fixture: ComponentFixture<EventosSolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventosSolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventosSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
