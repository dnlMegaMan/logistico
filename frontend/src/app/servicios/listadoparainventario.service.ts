import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ListadoParaInventarios } from '../models/entity/ListadoParaInventarios';
import { HttpClient } from '@angular/common/http';
import { UrlReporte } from '../models/entity/Urlreporte';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { AsignaBodega } from '../models/entity/AsignaBodega';
import { environment } from '../../environments/environment';

@Injectable()
export class ListadoparainventariosService {

    public urlrptcomprobante: string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinflistaconteoinventario');//"http://172.25.108.236:8194/obtieneurlinflistaconteoinventario"
   
    constructor(public _http: HttpClient) {

    }

    
    RPTListadoInventario(tiporeport: string,codigo:number,tiporeg:string,hdgcodigo:number,esacodigo:number,cmecodigo:number):Observable<UrlReporte[]> {
   
        return this._http.post<UrlReporte[]>(this.urlrptcomprobante, {
            'tiporeport': tiporeport,
            'codigo'    : codigo,
            'tiporeg'   : tiporeg,
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo
        });
    }
    
}