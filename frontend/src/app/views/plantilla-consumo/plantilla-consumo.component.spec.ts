import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillaConsumoComponent } from './plantilla-consumo.component';

describe('PlantillaConsumoComponent', () => {
  let component: PlantillaConsumoComponent;
  let fixture: ComponentFixture<PlantillaConsumoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantillaConsumoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantillaConsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
