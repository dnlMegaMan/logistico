import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Presenta } from '../models/entity/Presenta'

@Injectable({
  providedIn: 'root'
})
export class PresentaService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/presentacion');//'http://172.25.108.236:8181/formadepago';

  constructor(private httpClient: HttpClient) {

  }

  public list(hdgcodigo: number, cmecodigo: number, esacodigo: number, usuario:string,servidor:string): Observable<Presenta[]> {
    return this.httpClient.post<Presenta[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}