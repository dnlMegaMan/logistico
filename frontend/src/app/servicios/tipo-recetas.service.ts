import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoReceta } from '../models/entity/TipoReceta';

@Injectable({
  providedIn: 'root'
})
export class TipoRecetasService {
  private target_url = sessionStorage.getItem('enlace').toString().concat('/tiporeceta');

  constructor(public httpClient: HttpClient) {

  }

  public list(hdgcodigo:number, esacodigo:number, cmecodigo:number, usuario:string,servidor:string): Observable<TipoReceta[]> {
    return this.httpClient.post<TipoReceta[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario' : usuario,
      'servidor': servidor

    });
  }
}
