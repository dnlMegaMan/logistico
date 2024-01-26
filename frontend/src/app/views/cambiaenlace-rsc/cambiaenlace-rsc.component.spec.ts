import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiaenlaceRscComponent } from './cambiaenlace-rsc.component';

describe('CambiaenlaceRscComponent', () => {
  let component: CambiaenlaceRscComponent;
  let fixture: ComponentFixture<CambiaenlaceRscComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CambiaenlaceRscComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CambiaenlaceRscComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
