import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformeajustesvalorizadosComponent } from './informeajustesvalorizados.component';

describe('InformeajustesvalorizadosComponent', () => {
  let component: InformeajustesvalorizadosComponent;
  let fixture: ComponentFixture<InformeajustesvalorizadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformeajustesvalorizadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformeajustesvalorizadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
