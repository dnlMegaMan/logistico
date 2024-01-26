import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudConsumoComponent } from './solicitud-consumo.component';

describe('SolicitudConsumoComponent', () => {
  let component: SolicitudConsumoComponent;
  let fixture: ComponentFixture<SolicitudConsumoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudConsumoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudConsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
