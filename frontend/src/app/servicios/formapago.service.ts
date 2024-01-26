import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { FormaPago } from '../models/entity/FormaPago';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormapagoService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/formadepago');//'http://172.25.108.236:8181/formadepago';

  constructor(private httpClient: HttpClient) {

  }

  public list(usuario:string,servidor:string): Observable<FormaPago[]> {
    return this.httpClient.post<FormaPago[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}