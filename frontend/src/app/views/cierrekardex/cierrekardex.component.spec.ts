import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CierrekardexComponent } from './cierrekardex.component';

describe('CierrekardexComponent', () => {
  let component: CierrekardexComponent;
  let fixture: ComponentFixture<CierrekardexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CierrekardexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CierrekardexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
