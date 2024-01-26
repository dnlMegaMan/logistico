import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerainventariosistemaComponent } from './generainventariosistema.component';

describe('GenerainventariosistemaComponent', () => {
  let component: GenerainventariosistemaComponent;
  let fixture: ComponentFixture<GenerainventariosistemaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerainventariosistemaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerainventariosistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
