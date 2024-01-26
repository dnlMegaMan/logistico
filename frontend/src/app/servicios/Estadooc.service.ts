import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { EstadoOc } from '../models/entity/EstadoOc';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadoocService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/estadoordendecompra');//'http://172.25.108.236:8181/estadoordendecompra';

  constructor(private httpClient: HttpClient) {

  }

  public list(usuario: string, servidor: string): Observable<EstadoOc[]> {
    return this.httpClient.post<EstadoOc[]>(this.target_url, {
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}