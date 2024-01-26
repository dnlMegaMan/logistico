import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Holding } from '../models/entity/Holding';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HoldingService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/buscaholding');//'http://172.25.108.236:8181/buscaholding';

  constructor(private httpClient: HttpClient) {

  }

  public list(usuario:string,servidor:string): Observable<Holding[]> {
    return this.httpClient.post<Holding[]>(this.target_url,      {
      'usuario': usuario,
      'servidor':servidor                                      
  } );
  }

}