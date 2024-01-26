import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedabodegasComponent } from './busquedabodegas.component';

describe('BusquedabodegasComponent', () => {
  let component: BusquedabodegasComponent;
  let fixture: ComponentFixture<BusquedabodegasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedabodegasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedabodegasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
