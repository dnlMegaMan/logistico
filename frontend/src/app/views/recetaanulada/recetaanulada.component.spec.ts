import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetaanuladaComponent } from './recetaanulada.component';

describe('RecetaanuladaComponent', () => {
  let component: RecetaanuladaComponent;
  let fixture: ComponentFixture<RecetaanuladaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecetaanuladaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecetaanuladaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
