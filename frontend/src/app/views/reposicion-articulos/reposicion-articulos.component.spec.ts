import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReposicionArticulosComponent } from './reposicion-articulos.component';

describe('ReposicionArticulosComponent', () => {
  let component: ReposicionArticulosComponent;
  let fixture: ComponentFixture<ReposicionArticulosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReposicionArticulosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReposicionArticulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
