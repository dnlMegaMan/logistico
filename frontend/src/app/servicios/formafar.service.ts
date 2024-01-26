import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormaFar } from '../models/entity/FormaFar';

@Injectable({
  providedIn: 'root'
})
export class FormaFarService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/formafarma');//'http://172.25.108.236:8181/familia';

  constructor(public httpClient: HttpClient) {

  }

  public list(usuario:string,servidor:string): Observable<FormaFar[]> {
    return this.httpClient.post<FormaFar[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }
}