import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { UrlReporte } from '../models/entity/Urlreporte';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { environment } from '../../environments/environment';
//import { AsignaBodega } from '../models/entity/AsignaBodega';

@Injectable()
export class InformedespachosbodegasService {
    public urlinfdespacho   : string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinfdespachobodegas');//"http://172.25.108.236:8194/obtieneurlinfajustesprecios";
    public urlbuscaempresa   : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal  : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"
       
    constructor(public _http: HttpClient) {

    }

    BuscaEmpresa(hdgcodigo: number,usuario:string,servidor: string):Observable<Empresas[]> {
   
        return this._http.post<Empresas[]>(this.urlbuscaempresa, {
            'hdgcodigo': hdgcodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaSucursal(hdgcodigo: number, esacodigo: number,usuario:string,servidor: string):Observable<Sucursal[]> {
  
        return this._http.post<Sucursal[]>(this.urlbuscasucursal, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    RPTInfDespacho(tiporeport: string,bodega:number,movimiento:number, tipoprod:string,fechaini:string,
        fechafin:string,hdgcodigo:number,esacodigo:number,cmecodigo:number):Observable<UrlReporte[]> {

        return this._http.post<UrlReporte[]>(this.urlinfdespacho, {
            'tiporeport': tiporeport,
            'bodega'    : bodega,
            'movimiento': movimiento,
            'tipoprod'  : tipoprod,
            'fechaini'  : fechaini,
            'fechafin'  : fechafin,
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo
        });
    }  
    
}