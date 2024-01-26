import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjustevaloresComponent } from './ajustevalores.component';

describe('AjustevaloresComponent', () => {
  let component: AjustevaloresComponent;
  let fixture: ComponentFixture<AjustevaloresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjustevaloresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjustevaloresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
