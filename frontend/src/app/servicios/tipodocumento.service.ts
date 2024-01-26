import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { TipoDocumento } from '../models/entity/TipoDocumento';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TipodocumentoService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/tipodoctomercantil');//'http://172.25.108.236:8187/tipodoctomercantil'; //busca tipo documento

  constructor(private httpClient: HttpClient) {

  }

  public list(usuario:string,servidor:string): Observable<TipoDocumento[]> {
    return this.httpClient.post<TipoDocumento[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}