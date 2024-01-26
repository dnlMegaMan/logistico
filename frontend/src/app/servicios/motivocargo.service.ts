import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { MotivoCargo } from '../models/entity/MotivoCargo';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable( )

export class MotivocargoService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/tipomotivocargo');

  constructor(private httpClient: HttpClient) {

  }

  public list(hdgcodigo: number, cmecodigo: number, esacodigo: number, usuario:string, servidor:string): Observable<MotivoCargo[]> {
    return this.httpClient.post<MotivoCargo[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}