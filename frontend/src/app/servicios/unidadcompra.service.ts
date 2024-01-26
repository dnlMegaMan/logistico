import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { UnidadCompra } from '../models/entity/UnidadCompra';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UnidadcompraService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/unidaddecompra');

  constructor(private httpClient: HttpClient) {

  }

  public list(hdgcodigo: number, cmecodigo: number, esacodigo: number, usuario:string, servidor:string): Observable<UnidadCompra[]> {
    return this.httpClient.post<UnidadCompra[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}
