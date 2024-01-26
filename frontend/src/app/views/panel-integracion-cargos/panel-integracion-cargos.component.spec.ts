import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelIntegracionCargosComponent } from './panel-integracion-cargos.component';

describe('PanelIntegracionCargosComponent', () => {
  let component: PanelIntegracionCargosComponent;
  let fixture: ComponentFixture<PanelIntegracionCargosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelIntegracionCargosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelIntegracionCargosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
