import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MantencionService {
  private errores: HttpErrorResponse[] = [];
  private errores$ = new BehaviorSubject<HttpErrorResponse[]>([]);
  private servidor = environment.URLServiciosRest.ambiente;

  constructor(private http: HttpClient) {}

  /**
   * Sirve para poder obtener los errores tal cual se producen en el interceptor de mantencion, ya
   * que no se pueden pasar correctamente a través del router de Angular.
   */
  obtenerErrores(): Observable<HttpErrorResponse[]> {
    return this.errores$.asObservable();
  }

  publicarError(error: HttpErrorResponse) {
    this.errores.push(error);
    this.errores$.next(this.errores);
  }

  resetearErrores(publicarErrores = false): void {
    this.errores = [];

    if (publicarErrores) {
      this.errores$.next(this.errores);
    }
  }

  reiniciarServicios(): Promise<any> {
    if (this.servidor !== 'DESARROLLO' && this.servidor !== 'TESTING') {
      throw new Error('Reinicio de servicios solo disponible en DESAROLLO o TESTING');
    }

    return this.http
      .post(`${environment.URLServiciosRest.URLReiniciaServicios}/levantar-servicios`, {})
      .toPromise();
  }
}
