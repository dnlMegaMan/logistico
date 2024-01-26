import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Periodo } from '../models/entity/Periodo';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/periodos');//'http://172.25.108.236:8187/periodos';

  constructor(public httpClient: HttpClient) {

  }

  public list(usuario:string, servidor:string): Observable<Periodo[]> {
    return this.httpClient.post<Periodo[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}