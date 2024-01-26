import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantencionarticulosComponent } from './mantencionarticulos.component';

describe('MantencionarticulosComponent', () => {
  let component: MantencionarticulosComponent;
  let fixture: ComponentFixture<MantencionarticulosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MantencionarticulosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantencionarticulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
