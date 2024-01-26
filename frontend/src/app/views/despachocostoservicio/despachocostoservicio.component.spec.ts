import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DespachocostoservicioComponent } from './despachocostoservicio.component';

describe('DespachocostoservicioComponent', () => {
  let component: DespachocostoservicioComponent;
  let fixture: ComponentFixture<DespachocostoservicioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DespachocostoservicioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DespachocostoservicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
