import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalbusquedalotesComponent } from './modalbusquedalotes.component';

describe('ModalbusquedalotesComponent', () => {
  let component: ModalbusquedalotesComponent;
  let fixture: ComponentFixture<ModalbusquedalotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalbusquedalotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalbusquedalotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
