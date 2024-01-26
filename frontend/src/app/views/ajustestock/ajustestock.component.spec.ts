import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjustestockComponent } from './ajustestock.component';

describe('AjustestockComponent', () => {
  let component: AjustestockComponent;
  let fixture: ComponentFixture<AjustestockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjustestockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjustestockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
