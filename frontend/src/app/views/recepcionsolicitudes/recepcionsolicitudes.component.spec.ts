import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionsolicitudesComponent } from './recepcionsolicitudes.component';

describe('RecepcionsolicitudesComponent', () => {
  let component: RecepcionsolicitudesComponent;
  let fixture: ComponentFixture<RecepcionsolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepcionsolicitudesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionsolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
