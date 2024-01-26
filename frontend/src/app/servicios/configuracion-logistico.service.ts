import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConfiguracionLogistico } from '../models/configuracion-logistico';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionLogisticoService {

  constructor(private http: HttpClient) { }

  private obtenerHES() {
    return {
      hdgcodigo: Number(sessionStorage.getItem('hdgcodigo').toString()),
      esacodigo: Number(sessionStorage.getItem('esacodigo').toString()),
      cmecodigo: Number(sessionStorage.getItem('cmecodigo').toString()),
      usuario: sessionStorage.getItem('Usuario').toString(),
      servidor: environment.URLServiciosRest.ambiente,
    }
  }

  obtenerConfiguracion(): Promise<ConfiguracionLogistico> {
    return this.http
      .post<ConfiguracionLogistico>(
        `${environment.URLServiciosRest.URLConexion}/configuracionlogistico`,
        {
          ...this.obtenerHES(),
        },
      )
      .toPromise();
  }
}
