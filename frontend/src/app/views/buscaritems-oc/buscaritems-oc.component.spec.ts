import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscaritemsOcComponent } from './buscaritems-oc.component';

describe('BuscaritemsOcComponent', () => {
  let component: BuscaritemsOcComponent;
  let fixture: ComponentFixture<BuscaritemsOcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscaritemsOcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscaritemsOcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
