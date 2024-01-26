import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { MotivoAjuste } from '../models/entity/MotivoAjuste';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RetornaMensaje } from '../models/entity/RetornaMensaje';

@Injectable({
  providedIn: 'root'
})
export class MotivoAjusteService {

  public urltiposdeajustesinv = sessionStorage.getItem('enlace').toString().concat('/tiposdeajustesinv');
  public urlcrearnuevomotivoinventario = sessionStorage.getItem('enlace').toString().concat('/crearnuevomotivoinventario');

  constructor(private httpClient: HttpClient) {

  }

  public list(usuario: string, servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number): Observable<MotivoAjuste[]> {
    return this.httpClient.post<MotivoAjuste[]>(this.urltiposdeajustesinv, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      usuario,
      servidor
    });
  }

  public crearNuevoMotivo(
    hdgcodigo: number,
    esacodigo: number,
    cmecodigo: number,
    descripcion: string,
    usuario: string,
    servidor: string
  ): Observable<RetornaMensaje> {
    return this.httpClient.post<RetornaMensaje>(this.urlcrearnuevomotivoinventario, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      descripcion,
      usuario,
      servidor
    });

  }
}