import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

/**
 * @deprecated
 * No es referenciado por ningun otro servicio ni componente. Se puede eliminar sin problemas. No 
 * usar.
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  public get() {
    let token = '';
    const uilogistico = JSON.parse(sessionStorage.getItem('uilogistico'));
    if (uilogistico !== null) {
      token = uilogistico.token;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token
      })
    };
    return httpOptions;
  }

  public post() {
    let token = '';
    const uilogistico = JSON.parse(sessionStorage.getItem('uilogistico'));
    console.log(uilogistico);
    if (uilogistico !== null) {
      token = uilogistico.token;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token
      })
    };
    return httpOptions;
  }

  public delete() {
    const token = sessionStorage.getItem('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'bearer '.concat(JSON.parse(token))
      })
    };
    return httpOptions;
  }

  public put() {
    const token = sessionStorage.getItem('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'bearer '.concat(JSON.parse(token))
      })
    };
    return httpOptions;
  }

  public getBlob() {
    const token = JSON.parse(sessionStorage.getItem('token'));
    const headers =
      new HttpHeaders({
        'Content-Type': 'application/vnd.openxmlformats',
        'Authorization': 'bearer '.concat(token)
      });
    return headers;
  }
}
