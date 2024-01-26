import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionsolicitudesComponent } from './devolucionsolicitudes.component';

describe('DevolucionsolicitudesComponent', () => {
  let component: DevolucionsolicitudesComponent;
  let fixture: ComponentFixture<DevolucionsolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevolucionsolicitudesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionsolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
