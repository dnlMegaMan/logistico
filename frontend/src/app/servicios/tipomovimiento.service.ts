import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { TipoMovimiento } from '../models/entity/TipoMovimiento';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable()
export class TipomovimientoService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/tipomovimientofarmacia');//tipodespacho, ese servicio muestra mas datos en el combo

  constructor(private httpClient: HttpClient) {

  }

  public list(hdgcodigo: number, cmecodigo: number, esacodigo: number, usuario:string, servidor:string): Observable<TipoMovimiento[]> {
    return this.httpClient.post<TipoMovimiento[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}




