import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantencionarticulosFormComponent } from './mantencionarticulos-form.component';

describe('MantencionarticulosFormComponent', () => {
  let component: MantencionarticulosFormComponent;
  let fixture: ComponentFixture<MantencionarticulosFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MantencionarticulosFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantencionarticulosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
