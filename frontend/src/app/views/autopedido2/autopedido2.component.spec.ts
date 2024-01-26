import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Autopedido2Component } from './autopedido2.component';

describe('Autopedido2Component', () => {
  let component: Autopedido2Component;
  let fixture: ComponentFixture<Autopedido2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Autopedido2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Autopedido2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
