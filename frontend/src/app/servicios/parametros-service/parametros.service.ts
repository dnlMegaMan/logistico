import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Parametro } from 'src/app/models/parametro';
import { environment } from 'src/environments/environment';
import { DatosGrabarParametros } from './parametros.service.types';

@Injectable({
  providedIn: 'root',
})
export class ParametrosService {
  private readonly buscarTipoParametrosURL = `${environment.URLServiciosRest.URLConexion}/buscartipoparametros`;
  private readonly buscarParametrosURL = `${environment.URLServiciosRest.URLConexion}/buscarparametros`;
  private readonly grabarParametrosURL = `${environment.URLServiciosRest.URLConexion}/grabarparametros`;

  constructor(private http: HttpClient) {}

  private getHES() {
    return {
      hdgcodigo: Number(sessionStorage.getItem('hdgcodigo').toString()),
      esacodigo: Number(sessionStorage.getItem('esacodigo').toString()),
      cmecodigo: Number(sessionStorage.getItem('cmecodigo').toString()),
      servidor: environment.URLServiciosRest.ambiente,
      usuario: sessionStorage.getItem('Usuario'),
    };
  }

  async buscarTiposDeParametros(): Promise<Parametro[]> {
    return this.http
      .post<Parametro[]>(this.buscarTipoParametrosURL, { ...this.getHES() })
      .toPromise();
  }

  async buscarParametros(tipo: number): Promise<Parametro[]> {
    return this.http
      .post<Parametro[]>(this.buscarParametrosURL, {
        ...this.getHES(),
        tipo,
      })
      .toPromise();
  }

  async grabarParametros(datos: DatosGrabarParametros[]): Promise<void> {
    return this.http
      .post<void>(this.grabarParametrosURL, {
        ...this.getHES(),
        parametros: datos,
      })
      .toPromise();
  }
}
