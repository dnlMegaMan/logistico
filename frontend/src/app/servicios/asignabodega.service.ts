import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AsignaBodega } from '../models/entity/AsignaBodega';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignabodegaService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/bodegasparaasignar');//'http://172.25.108.236:8189/bodegasparaasignar';

  constructor(private httpClient: HttpClient) {

  }

  public list(usuario:string,servidor:string): Observable<AsignaBodega[]> {
    return this.httpClient.post<AsignaBodega[]>(this.target_url,{
      'usuario'   : usuario,
      'servidor'  : servidor
    });
  }

}