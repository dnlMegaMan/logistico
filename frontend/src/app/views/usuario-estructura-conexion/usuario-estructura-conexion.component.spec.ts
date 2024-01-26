import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioEstructuraConexionComponent } from './usuario-estructura-conexion.component';

describe('UsuarioEstructuraConexionComponent', () => {
  let component: UsuarioEstructuraConexionComponent;
  let fixture: ComponentFixture<UsuarioEstructuraConexionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsuarioEstructuraConexionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioEstructuraConexionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
