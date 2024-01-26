import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BodegaVigente } from '../models/entity/BodegaVigente';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BodegavigenteService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/bodegas');//'http://172.25.108.236:8189/bodegas';

  constructor(private httpClient: HttpClient) {

  }

  public list(): Observable<BodegaVigente[]> {
    return this.httpClient.get<BodegaVigente[]>(this.target_url);
  }

}