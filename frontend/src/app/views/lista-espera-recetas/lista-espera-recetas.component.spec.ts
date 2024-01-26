import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaEsperaRecetasComponent } from './lista-espera-recetas.component';

describe('ListaEsperaRecetasComponent', () => {
  let component: ListaEsperaRecetasComponent;
  let fixture: ComponentFixture<ListaEsperaRecetasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaEsperaRecetasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaEsperaRecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
