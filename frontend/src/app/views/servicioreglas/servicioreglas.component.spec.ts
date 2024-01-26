import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioreglasComponent } from './servicioreglas.component';

describe('ServicioreglasComponent', () => {
  let component: ServicioreglasComponent;
  let fixture: ComponentFixture<ServicioreglasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicioreglasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicioreglasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
