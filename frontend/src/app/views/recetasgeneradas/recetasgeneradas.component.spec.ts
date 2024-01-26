import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetasgeneradasComponent } from './recetasgeneradas.component';

describe('RecetasgeneradasComponent', () => {
  let component: RecetasgeneradasComponent;
  let fixture: ComponentFixture<RecetasgeneradasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecetasgeneradasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecetasgeneradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
