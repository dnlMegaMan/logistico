import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiasModalComponent } from './guias-modal.component';

describe('GuiasModalComponent', () => {
  let component: GuiasModalComponent;
  let fixture: ComponentFixture<GuiasModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuiasModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuiasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
