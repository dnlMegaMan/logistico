import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaplantillasbodegaComponent } from './busquedaplantillasbodega.component';

describe('BusquedaplantillasbodegaComponent', () => {
  let component: BusquedaplantillasbodegaComponent;
  let fixture: ComponentFixture<BusquedaplantillasbodegaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedaplantillasbodegaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaplantillasbodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
