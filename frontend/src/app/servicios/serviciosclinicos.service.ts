import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiciosClinicos } from '../models/entity/ServiciosClinicos';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ServiciosclinicosService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/traeclinservicios');//'http://172.25.108.236:8189/traeclinservicios';

  constructor(public httpClient: HttpClient) {

  }

  public list(hdgcodigo: number, esacodigo: number, cmecodigo: number,usuario:string,servidor: string): Observable<ServiciosClinicos[]> {
    return this.httpClient.post<ServiciosClinicos[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario'  : usuario,
      'servidor' : servidor
    });
  }

}