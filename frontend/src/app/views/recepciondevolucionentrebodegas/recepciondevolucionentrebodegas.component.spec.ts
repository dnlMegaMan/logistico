import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepciondevolucionentrebodegasComponent } from './recepciondevolucionentrebodegas.component';

describe('RecepciondevolucionentrebodegasComponent', () => {
  let component: RecepciondevolucionentrebodegasComponent;
  let fixture: ComponentFixture<RecepciondevolucionentrebodegasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepciondevolucionentrebodegasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepciondevolucionentrebodegasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
