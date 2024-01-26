import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MensajeAlerta } from '../models/mensaje-alerta';

@Injectable({
  providedIn: 'root'
})
export class GlobalAlertService {
  private mensaje$ = new BehaviorSubject<MensajeAlerta | null>(null);
  
  constructor() { }

  public mensajeAlerta() {
    return this.mensaje$.asObservable();
  }

  /** Si no se incluye el nivel queda por defecto en inf */
  public enviarMensaje(msg: MensajeAlerta) {
    this.mensaje$.next({
      ...msg,
      nivel: msg.nivel ? msg.nivel : 'info',
    });
  }
}