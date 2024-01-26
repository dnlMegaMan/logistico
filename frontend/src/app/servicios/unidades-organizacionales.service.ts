import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CentroCostoUsuario } from '../models/entity/centro-costo-usuario';
import { UnidadesOrganizacionales } from '../models/entity/unidades-organizacionales';

@Injectable({
  providedIn: 'root',
})
export class UnidadesOrganizacionalesService {
  private url_buscarunidadesorganizacionales = sessionStorage
    .getItem('enlace')
    .toString()
    .concat('/buscarunidadesorganizacionales');

  constructor(public httpClient: HttpClient) {}

  public buscarCentroCosto(
    accion: string,
    correlativo: number,
    unortype: string,
    descripcion: string,
    codigoflexible: string,
    unorcorrelativo: number,
    codigosucursal: number,
    codigooficina: number,
    rutficticio: number,
    vigente: string,
    usuario: string,
    centroscosto: Array<CentroCostoUsuario>,
    servidor?: string,
    hdgcodigo?: number,
    esacodigo?: number,
    cmecodigo?: number,
  ): Observable<UnidadesOrganizacionales[]> {
    return this.httpClient.post<UnidadesOrganizacionales[]>(
      this.url_buscarunidadesorganizacionales,
      {
        accion,
        correlativo,
        unortype,
        descripcion,
        codigoflexible,
        unorcorrelativo,
        codigosucursal,
        codigooficina,
        rutficticio,
        vigente,
        usuario,
        centroscosto,
        servidor,
        hdgcodigo: hdgcodigo ? hdgcodigo : null,
        esacodigo: esacodigo ? esacodigo : null,
        cmecodigo: cmecodigo ? cmecodigo : null,
      },
    );
  }
}
