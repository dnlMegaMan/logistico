import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarArticulosFormComponent } from './modificar-articulos-form.component';

describe('ModificarArticulosFormComponent', () => {
  let component: ModificarArticulosFormComponent;
  let fixture: ComponentFixture<ModificarArticulosFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModificarArticulosFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarArticulosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
