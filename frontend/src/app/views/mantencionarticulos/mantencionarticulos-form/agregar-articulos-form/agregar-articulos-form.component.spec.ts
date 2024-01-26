import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarArticulosFormComponent } from './AgregarArticulosFormComponent';

describe('AgregarArticulosFormComponent', () => {
  let component: AgregarArticulosFormComponent;
  let fixture: ComponentFixture<AgregarArticulosFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarArticulosFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarArticulosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
