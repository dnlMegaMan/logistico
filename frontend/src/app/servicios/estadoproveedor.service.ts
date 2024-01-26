import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoProveedor } from '../models/entity/EstadoProveedor';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class EstadoproveedorService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/estadoproveedor');//'http://172.25.108.236:8189/estadoproveedor';

  constructor(public httpClient: HttpClient) {

  }

  public list(usuario:string,servidor:string): Observable<EstadoProveedor[]> {
    return this.httpClient.post<EstadoProveedor[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}