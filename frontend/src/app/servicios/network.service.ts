import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  /** Parte online porque si carga la página es porque hay conexión. */
  private estadoRed$ = new BehaviorSubject<'online' | 'offline'>('online')

  constructor() {
    fromEvent(window, 'online').subscribe(() => {
      this.estadoRed$.next('online')
    })

    fromEvent(window, 'offline').subscribe(() => {
      this.estadoRed$.next('offline')
    });
  }

  estadoRed() {
    return this.estadoRed$.asObservable()
  }
}
