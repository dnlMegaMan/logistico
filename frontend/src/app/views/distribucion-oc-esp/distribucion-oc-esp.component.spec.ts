import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistribucionOcEspComponent } from './distribucion-oc-esp.component';

describe('DistribucionOcEspComponent', () => {
  let component: DistribucionOcEspComponent;
  let fixture: ComponentFixture<DistribucionOcEspComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistribucionOcEspComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistribucionOcEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
