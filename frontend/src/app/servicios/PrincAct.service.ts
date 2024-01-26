import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PrincAct } from '../models/entity/PrincAct';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrincActService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/principioactivo');

  constructor(public httpClient: HttpClient) {

  }

  public list(hdgcodigo: number, cmecodigo: number, esacodigo: number,usuario:string,servidor:string): Observable<PrincAct[]> {
    return this.httpClient.post<PrincAct[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'usuario' : usuario,
      'servidor': servidor
    });
  }
}