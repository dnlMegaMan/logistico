import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticulosOcModalComponent } from './articulos-oc-modal.component';

describe('ArticulosOcModalComponent', () => {
  let component: ArticulosOcModalComponent;
  let fixture: ComponentFixture<ArticulosOcModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticulosOcModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticulosOcModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
