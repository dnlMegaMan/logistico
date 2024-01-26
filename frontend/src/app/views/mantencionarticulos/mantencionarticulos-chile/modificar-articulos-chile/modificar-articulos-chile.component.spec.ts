import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarArticulosChileComponent } from './modificar-articulos-chile.component';

describe('ModificarArticulosChileComponent', () => {
  let component: ModificarArticulosChileComponent;
  let fixture: ComponentFixture<ModificarArticulosChileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModificarArticulosChileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarArticulosChileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
