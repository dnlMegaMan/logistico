import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InflistaconteoinventarioComponent } from './inflistaconteoinventario.component';

describe('InflistaconteoinventarioComponent', () => {
  let component: InflistaconteoinventarioComponent;
  let fixture: ComponentFixture<InflistaconteoinventarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InflistaconteoinventarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InflistaconteoinventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
