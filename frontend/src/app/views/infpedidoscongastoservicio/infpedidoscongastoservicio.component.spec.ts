import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfpedidoscongastoservicioComponent } from './infpedidoscongastoservicio.component';

describe('InfpedidoscongastoservicioComponent', () => {
  let component: InfpedidoscongastoservicioComponent;
  let fixture: ComponentFixture<InfpedidoscongastoservicioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfpedidoscongastoservicioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfpedidoscongastoservicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
