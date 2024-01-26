import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreacionrecetasambulatoriasComponent } from './creacionrecetasambulatorias.component';

describe('CreacionrecetasambulatoriasComponent', () => {
  let component: CreacionrecetasambulatoriasComponent;
  let fixture: ComponentFixture<CreacionrecetasambulatoriasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreacionrecetasambulatoriasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreacionrecetasambulatoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
