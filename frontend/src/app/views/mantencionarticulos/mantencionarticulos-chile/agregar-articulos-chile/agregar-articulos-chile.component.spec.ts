import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarArticulosChileComponent } from './agregar-articulos-chile.component';

describe('AgregarArticulosChileComponent', () => {
  let component: AgregarArticulosChileComponent;
  let fixture: ComponentFixture<AgregarArticulosChileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarArticulosChileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarArticulosChileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
