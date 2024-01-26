import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Familia } from '../models/entity/Familia';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FamiliaService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/familia');//'http://172.25.108.236:8181/familia';

  constructor(public httpClient: HttpClient) {

  }

  public list(hdgcodigo: number, esacodigo: number,cmecodigo:number, usuario:string,servidor:string): Observable<Familia[]> {
    return this.httpClient.post<Familia[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'tiporegistro' : 'M',
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}