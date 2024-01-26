import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoProducto } from '../models/entity/TipoProducto';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TipoproductoService {
//fALTA EL RESTO DE LA CONEXION
  private target_url = sessionStorage.getItem('enlace').toString().concat('/buscastockenbodegas');//'http://172.25.108.236:8105/';

  constructor(private httpClient: HttpClient) {

  }

  public list(): Observable<TipoProducto[]> {
    return this.httpClient.get<TipoProducto[]>(this.target_url);
  }

}