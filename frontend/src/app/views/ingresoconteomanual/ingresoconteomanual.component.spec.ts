import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoconteomanualComponent } from './ingresoconteomanual.component';

describe('IngresoconteomanualComponent', () => {
  let component: IngresoconteomanualComponent;
  let fixture: ComponentFixture<IngresoconteomanualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresoconteomanualComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoconteomanualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
