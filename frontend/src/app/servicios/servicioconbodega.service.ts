import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosconbodegaService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/serviciosconbodegas');//'http://172.25.108.236:8189/serviciosconbodegas';

  constructor(public httpClient: HttpClient) {

  }



}