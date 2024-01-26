import { Injectable } from '@angular/core';
import { TipoAmbito } from '../models/entity/TipoAmbito';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TipoambitoService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/tipoambito');//'http://172.25.108.236:8189/tipoambito';

  constructor(public httpClient: HttpClient) {

  }

  public list(hdgcodigo:number, esacodigo:number, cmecodigo:number, usuario:string,servidor:string): Observable<TipoAmbito[]> {
    return this.httpClient.post<TipoAmbito[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario' : usuario,
      'servidor': servidor

    });
  }

}
