import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InformacionGeneral, redirigirEnCaidaDelServidor } from '../models/informacion-general';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class InformacionGeneralService {
  private readonly configKey = 'infoGeneral';
  private servidor = environment.URLServiciosRest.ambiente;

  private ultimaPagina$ = new BehaviorSubject<string>('');

  constructor(private http: HttpClient, private loginService: LoginService) {
    this.loginService.estadoLogin().subscribe((estaLogueado) => {
      if (!estaLogueado) {
        localStorage.removeItem(this.configKey);
      }
    });
  }

  get urlInformacionGeneral() {
    return `${environment.URLServiciosRest.URLConexion}/informaciongeneral`;
  }

  obtenerInformacionGeneral(): Observable<InformacionGeneral> {
    return this.http
      .post<InformacionGeneral>(this.urlInformacionGeneral, {
        servidor: this.servidor,
      })
      .pipe(tap((info) => localStorage.setItem(this.configKey, JSON.stringify(info))));
  }

  /**
   * @returns
   * `true` si se debe redigirir a pantalla de "Error del Servidor" cuando no se obtiene respuesta
   * del servidor, `false` de lo contrario.
   */
  redirigirEnCaidaGo(): boolean {
    const infoJSON = localStorage.getItem(this.configKey);

    if (!infoJSON) {
      return false;
    }

    return redirigirEnCaidaDelServidor(JSON.parse(infoJSON));
  }

  ultimaPaginaNavegada() {
    return this.ultimaPagina$.asObservable();
  }

  notificarUltimaPagina(pagina: string) {
    const paginasOmitibles = ['/error-del-servidor', '/mantencion', '/sesion-expirada'];

    if (paginasOmitibles.some((p) => p.includes(pagina))) {
      return;
    }

    this.ultimaPagina$.next(pagina);
  }
}
