import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformeajustesdepreciosComponent } from './informeajustesdeprecios.component';

describe('InformeajustesdepreciosComponent', () => {
  let component: InformeajustesdepreciosComponent;
  let fixture: ComponentFixture<InformeajustesdepreciosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformeajustesdepreciosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformeajustesdepreciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
