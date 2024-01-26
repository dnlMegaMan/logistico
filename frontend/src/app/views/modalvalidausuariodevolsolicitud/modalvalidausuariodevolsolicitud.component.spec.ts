import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalvalidausuariodevolsolicitudComponent } from './modalvalidausuariodevolsolicitud.component';

describe('ModalvalidausuariodevolsolicitudComponent', () => {
  let component: ModalvalidausuariodevolsolicitudComponent;
  let fixture: ComponentFixture<ModalvalidausuariodevolsolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalvalidausuariodevolsolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalvalidausuariodevolsolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
