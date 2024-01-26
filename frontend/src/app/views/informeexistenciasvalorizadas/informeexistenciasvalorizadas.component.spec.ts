import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformeexistenciasvalorizadasComponent } from './informeexistenciasvalorizadas.component';

describe('InformeexistenciasvalorizadasComponent', () => {
  let component: InformeexistenciasvalorizadasComponent;
  let fixture: ComponentFixture<InformeexistenciasvalorizadasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformeexistenciasvalorizadasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformeexistenciasvalorizadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
