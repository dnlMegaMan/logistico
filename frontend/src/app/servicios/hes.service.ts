import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { BehaviorSubject, Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Holding } from '../models/entity/Holding';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';


@Injectable()
export class hesService {
    public urlbuscaholding          : string = sessionStorage.getItem('enlace').toString().concat('/buscaholding');
    public urlbuscaempresa          : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');
    public urlbuscasucursal         : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');

    private empresa$ = new BehaviorSubject<Empresas>(null);
    constructor(public _http: HttpClient) {

    }

    public list(usuario:string,servidor:string): Observable<Holding[]> {
        return this._http.post<Holding[]>(this.urlbuscaholding,      {
          'usuario': usuario,
          'servidor':servidor
      } );
      }

    BuscaEmpresa(hdgcodigo: number,usuario:string, servidor:string):Observable<Empresas[]> {
        return this._http.post<Empresas[]>(this.urlbuscaempresa, {
            'hdgcodigo': hdgcodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaSucursal(hdgcodigo: number, esacodigo: number,usuario:string, servidor:string):Observable<Sucursal[]> {
        return this._http.post<Sucursal[]>(this.urlbuscasucursal, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    EmpresaActual(){
      return this.empresa$.asObservable();
    }

    CambiarEmpresa(Empresa : Empresas){
      this.empresa$.next(Empresa);
    }

}
