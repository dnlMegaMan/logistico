import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalsolicitudpacdevueltaComponent } from './modalsolicitudpacdevuelta.component';

describe('ModalsolicitudpacdevueltaComponent', () => {
  let component: ModalsolicitudpacdevueltaComponent;
  let fixture: ComponentFixture<ModalsolicitudpacdevueltaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalsolicitudpacdevueltaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalsolicitudpacdevueltaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
