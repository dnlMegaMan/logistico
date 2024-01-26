import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedasolicitudpacientesComponent } from './busquedasolicitudpacientes.component';

describe('BusquedasolicitudpacientesComponent', () => {
  let component: BusquedasolicitudpacientesComponent;
  let fixture: ComponentFixture<BusquedasolicitudpacientesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedasolicitudpacientesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedasolicitudpacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
