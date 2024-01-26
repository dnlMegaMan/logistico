import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillasprocedimientosComponent } from './plantillasprocedimientos.component';

describe('PlantillasprocedimientosComponent', () => {
  let component: PlantillasprocedimientosComponent;
  let fixture: ComponentFixture<PlantillasprocedimientosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantillasprocedimientosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantillasprocedimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
