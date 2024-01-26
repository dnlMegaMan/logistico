import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FacturaElectronica } from '../models/entity/FacturaElectronica';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturaelectronicaService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/facturaelectronica');//'http://172.25.108.236:8189/facturaelectronica';

  constructor(public httpClient: HttpClient) {

  }

  public list(usuario:string,servidor:string): Observable<FacturaElectronica[]> {
    return this.httpClient.post<FacturaElectronica[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}