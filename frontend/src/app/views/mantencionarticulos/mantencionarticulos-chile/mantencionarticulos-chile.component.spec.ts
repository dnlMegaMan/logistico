import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantencionarticulosChileComponent } from './mantencionarticulos-chile.component';

describe('MantencionarticulosChileComponent', () => {
  let component: MantencionarticulosChileComponent;
  let fixture: ComponentFixture<MantencionarticulosChileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MantencionarticulosChileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantencionarticulosChileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
