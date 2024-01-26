import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { TipoMedicamento } from '../models/entity/TipoMedicamento';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TipoMedicamentoService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/tipomedicamento');//'http://172.25.108.236:8181/tipomedicamento';

  constructor(private httpClient: HttpClient) {

  }

  public list(hdgcodigo: number, cmecodigo: number, esacodigo: number, usuario: string, servidor:string): Observable<TipoMedicamento[]> {
    return this.httpClient.post<TipoMedicamento[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}