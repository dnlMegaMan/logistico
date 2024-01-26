import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillassolicitudbodegaComponent } from './plantillassolicitudbodega.component';

describe('PlantillassolicitudbodegaComponent', () => {
  let component: PlantillassolicitudbodegaComponent;
  let fixture: ComponentFixture<PlantillassolicitudbodegaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantillassolicitudbodegaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantillassolicitudbodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
