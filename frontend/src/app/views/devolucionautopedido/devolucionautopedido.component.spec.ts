import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionautopedidoComponent } from './devolucionautopedido.component';

describe('DevolucionautopedidoComponent', () => {
  let component: DevolucionautopedidoComponent;
  let fixture: ComponentFixture<DevolucionautopedidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevolucionautopedidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionautopedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
