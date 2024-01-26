import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultalotesComponent } from './consultalotes.component';

describe('ConsultalotesComponent', () => {
  let component: ConsultalotesComponent;
  let fixture: ComponentFixture<ConsultalotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultalotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultalotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
