import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { UrlReporte } from '../models/entity/Urlreporte';
import { environment } from '../../environments/environment';

@Injectable()
export class InformeexistenciavalorizadoService {
    public urlrptinforme    : string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinfexistenciasvalorizadas');//"http://172.25.108.236:8194/obtieneurlinfexistenciasvalorizadas";
    
    constructor(public _http: HttpClient) {

    }
    
    RPTInformeExistencias(tiporeport: string, codigobod:number,tiporeg:string,fecha:string,hdgcodigo:number,
        esacodigo:number,cmecodigo:number):Observable<UrlReporte[]> {

        return this._http.post<UrlReporte[]>(this.urlrptinforme, {
            'tiporeport': tiporeport,
            'codigobod' : codigobod,
            'tiporeg'   : tiporeg,
            'fecha'     : fecha,
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo
        });
    }
    
}