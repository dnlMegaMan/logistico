import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Comuna } from '../models/entity/Comuna';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComunaService { 

  private target_url = sessionStorage.getItem('enlace').toString().concat('/traecomunas');//'http://172.25.108.236:8189/traecomunas';

  constructor(private httpClient: HttpClient) {

  }

  public list(usuario:string, servidor: string): Observable<Comuna[]> {
    return this.httpClient.post<Comuna[]>(this.target_url, {
      'usuario': usuario,
      'servidor' : servidor       
    });
  }
}