import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Ciudad } from '../models/entity/Ciudad';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root' 
})
export class CiudadService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/traeciudades');//'http://172.25.108.236/traeciudades';

  constructor(private httpClient: HttpClient) {

  }

  public list(usuario:string, servidor:string): Observable<Ciudad[]> {
    return this.httpClient.post<Ciudad[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }

}