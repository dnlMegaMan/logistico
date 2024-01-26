import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedarecetasComponent } from './busquedarecetas.component';

describe('BusquedarecetasComponent', () => {
  let component: BusquedarecetasComponent;
  let fixture: ComponentFixture<BusquedarecetasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedarecetasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedarecetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
