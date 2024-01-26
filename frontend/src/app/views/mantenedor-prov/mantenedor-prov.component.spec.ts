import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenedorProvComponent } from './mantenedor-prov.component';

describe('MantenedorProvComponent', () => {
  let component: MantenedorProvComponent;
  let fixture: ComponentFixture<MantenedorProvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MantenedorProvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantenedorProvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
