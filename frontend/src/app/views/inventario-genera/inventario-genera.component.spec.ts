import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioGeneraComponent } from './inventario-genera.component';

describe('InventarioGeneraComponent', () => {
  let component: InventarioGeneraComponent;
  let fixture: ComponentFixture<InventarioGeneraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventarioGeneraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventarioGeneraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
