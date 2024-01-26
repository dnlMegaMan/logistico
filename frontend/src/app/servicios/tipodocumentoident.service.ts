import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TipoDocumentoIdentificacion } from '../models/entity/TipoDocumentoIdentificacion'

@Injectable()
export class TipodocumentoidentService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/tipodocumentoident');

  constructor(private httpClient: HttpClient)
   { }


   public list(hdgcodigo: number, cmecodigo: number, esacodigo: number, usuario:string, servidor:string, idioma:string, isMedico:boolean): Observable<TipoDocumentoIdentificacion[]> {
    return this.httpClient.post<TipoDocumentoIdentificacion[]>(this.target_url,{
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'usuario' : usuario,
      'servidor': servidor,
      'idioma' : idioma,
      'medico' : isMedico
    });
  }

}



