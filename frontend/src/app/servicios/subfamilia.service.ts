import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { SubFamilia } from '../models/entity/SubFamilia';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SubfamiliaService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/subfamilia');//'http://172.25.108.236:8181/subfamilia';

  constructor(private httpClient: HttpClient) {

  }

  public list(usuario:string, servidor: string): Observable<SubFamilia[]> {
    return this.httpClient.post<SubFamilia[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}