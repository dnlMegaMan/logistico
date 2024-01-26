import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesManualesComponent } from './solicitudes-manuales.component';

describe('SolicitudesManualesComponent', () => {
  let component: SolicitudesManualesComponent;
  let fixture: ComponentFixture<SolicitudesManualesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudesManualesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudesManualesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
