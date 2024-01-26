import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedarecetasanuladasComponent } from './busquedarecetasanuladas.component';

describe('BusquedarecetasanuladasComponent', () => {
  let component: BusquedarecetasanuladasComponent;
  let fixture: ComponentFixture<BusquedarecetasanuladasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusquedarecetasanuladasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedarecetasanuladasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
