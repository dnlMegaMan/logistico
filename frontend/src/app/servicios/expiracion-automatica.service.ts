import { Injectable } from '@angular/core';
import { Subject, combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LoginService } from './login.service';
import { ConfiguracionLogisticoService } from './configuracion-logistico.service';
import { ConfiguracionLogistico } from '../models/configuracion-logistico';

@Injectable({
  providedIn: 'root',
})
export class ExpiracionAutomaticaService {
  private readonly expiracionAutomatica$ = new Subject<void>();
  private expiracionAutomaticaTimeoutId: NodeJS.Timer | null = null;
  private expiracionAutomaticaActivada = false;
  private tiempoExpiracionMs = 5 * 60 * 1000; // 5 minutos por si acaso

  constructor(
    private loginService: LoginService,
    private configLogisticoService: ConfiguracionLogisticoService,
  ) {
    this.loginService
      .estadoLogin()
      .pipe(
        switchMap((estaLogueado) => {
          if (estaLogueado) {
            return combineLatest([
              of(estaLogueado),
              this.configLogisticoService.obtenerConfiguracion(),
            ]);
          } else {
            return combineLatest([of(estaLogueado), of({} as ConfiguracionLogistico)]); // Solo para mantener el tipo
          }
        }),
      )
      .subscribe(([estaLogueado, config]) => {
        if (estaLogueado) {
          this.tiempoExpiracionMs = config.tiempoExpiraSesionMs;
          this.activarExpiracionAutomatica();
        } else {
          this.desactivarExpiracionAutomatica();
        }
      });
  }

  expiracionAutomatica() {
    return this.expiracionAutomatica$.asObservable();
  }

  private activarExpiracionAutomatica() {
    this.expiracionAutomaticaActivada = true;
    this.resetearExpiracionAutomatica();
  }

  resetearExpiracionAutomatica(): void {
    if (!this.expiracionAutomaticaActivada) {
      return;
    }

    if (this.expiracionAutomaticaTimeoutId != null) {
      clearTimeout(this.expiracionAutomaticaTimeoutId);
    }

    this.expiracionAutomaticaTimeoutId = setTimeout(() => {
      this.loginService.logout();
      this.desactivarExpiracionAutomatica();
      this.expiracionAutomatica$.next();
    }, this.tiempoExpiracionMs);
  }

  private desactivarExpiracionAutomatica() {
    if (this.expiracionAutomaticaTimeoutId != null) {
      clearTimeout(this.expiracionAutomaticaTimeoutId);
    }

    this.expiracionAutomaticaActivada = false;
  }
}
