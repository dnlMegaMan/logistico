import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalbusquedadosComponent } from './modalbusquedados.component';

describe('ModalbusuqedadosComponent', () => {
  let component: ModalbusquedadosComponent;
  let fixture: ComponentFixture<ModalbusquedadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalbusquedadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalbusquedadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
