import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelIntegracionERPComponent } from './panel-integracion-erp.component';

describe('PanelIntegracionERPComponent', () => {
  let component: PanelIntegracionERPComponent;
  let fixture: ComponentFixture<PanelIntegracionERPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelIntegracionERPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelIntegracionERPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
