import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarOcModalComponent } from './buscar-oc-modal.component';

describe('BuscarOcModalComponent', () => {
  let component: BuscarOcModalComponent;
  let fixture: ComponentFixture<BuscarOcModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscarOcModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarOcModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
