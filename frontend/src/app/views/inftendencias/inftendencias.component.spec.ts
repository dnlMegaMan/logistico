import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InftendenciasComponent } from './inftendencias.component';

describe('InftendenciasComponent', () => {
  let component: InftendenciasComponent;
  let fixture: ComponentFixture<InftendenciasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InftendenciasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InftendenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
