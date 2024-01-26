import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BodegasPerifericas } from '../models/entity/BodegasPerifericas';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BodegasperifericasService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/solobodegasperifericas');

  constructor(private httpClient: HttpClient) {

  }

  public list(hdgcodigo:number,esacodigo:number,cmecodigo:number,usuario:string,servidor:string): Observable<BodegasPerifericas[]> {
    return this.httpClient.post<BodegasPerifericas[]>(this.target_url,{
        'hdgcodigo' : hdgcodigo,
        'esacodigo' : esacodigo,
        'cmecodigo' : cmecodigo,
        'usuario'   : usuario,
        'servidor'  : servidor
    });
  }

}