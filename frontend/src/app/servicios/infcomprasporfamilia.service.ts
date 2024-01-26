import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { UrlReporte } from '../models/entity/Urlreporte';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { Familia } from '../models/entity/Familia';
import { environment } from '../../environments/environment';
//import { AsignaBodega } from '../models/entity/AsignaBodega';

@Injectable()
export class InfcomprasporfamiliaService {
    public urlcomprasfam   : string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinfcomprasporfamilia');//"http://172.25.108.236:8194/obtieneurlinfajustesprecios";
    public urlbuscafamilia : string = sessionStorage.getItem('enlace').toString().concat('/familia');//"http://172.25.108.236:8181/familia"
    public urlbuscaempresa : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal: string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"
       
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

    BuscaFamilias(tiporegistro: string,usuario:string,servidor:string): Observable<Familia[]> {
        
        return this._http.post<Familia[]>(this.urlbuscafamilia, {
            'tiporegistro': tiporegistro,
            'usuario'     : usuario,
            'servidor'    : servidor
        });
    }

    RPTInfComprasPorFamilia(tiporeport: string,tipoprod:string,cod:number, fechaini:string,
        fechafin:string,familia:string, subfam: string,hdgcodigo:number,esacodigo:number,cmecodigo:number):Observable<UrlReporte[]> {
        
        return this._http.post<UrlReporte[]>(this.urlcomprasfam, {
            'tiporeport': tiporeport,
            'tipoprod'  : tipoprod,
            'cod'       : cod,
            'fechaini'  : fechaini,
            'fechafin'  : fechafin,
            'familia'   : familia,
            'subfam'    : subfam,
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo
        });
    }  
    
}