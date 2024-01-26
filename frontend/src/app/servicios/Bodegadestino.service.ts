import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { BodegaDestino } from '../models/entity/BodegaDestino';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BodegadestinoService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/bodegasdestino');//'http://172.25.108.236:8189/bodegasdestino';

  constructor(private httpClient: HttpClient) {

  }

  public list(): Observable<BodegaDestino[]> {
    return this.httpClient.post<BodegaDestino[]>(this.target_url,{
    });
  }

  /*public list(usuario:string, servidor: string): Observable<BodegaDestino[]> {
    return this.httpClient.post<BodegaDestino[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }*/
}