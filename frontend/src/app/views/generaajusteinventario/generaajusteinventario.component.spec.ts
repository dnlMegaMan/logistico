import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneraajusteinventarioComponent } from './generaajusteinventario.component';

describe('GeneraajusteinventarioComponent', () => {
  let component: GeneraajusteinventarioComponent;
  let fixture: ComponentFixture<GeneraajusteinventarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneraajusteinventarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneraajusteinventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
