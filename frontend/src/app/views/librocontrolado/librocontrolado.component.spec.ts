import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrocontroladoComponent } from './librocontrolado.component';

describe('LibrocontroladoComponent', () => {
  let component: LibrocontroladoComponent;
  let fixture: ComponentFixture<LibrocontroladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibrocontroladoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibrocontroladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
