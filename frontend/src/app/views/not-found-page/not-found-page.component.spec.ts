import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFoundPAgeComponent } from './not-found-page.component';

describe('NotFoundPAgeComponent', () => {
  let component: NotFoundPAgeComponent;
  let fixture: ComponentFixture<NotFoundPAgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotFoundPAgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFoundPAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
