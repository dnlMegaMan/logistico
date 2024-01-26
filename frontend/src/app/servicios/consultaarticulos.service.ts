import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { ConsultaArticulos } from '../../app/models/entity/ConsultaArticulos';
import { HttpClient } from '@angular/common/http';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { environment } from '../../environments/environment';

@Injectable()
export class ConsultaarticulosService {
    public urlBuscarporcodigo     : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporcodigo');//"http://172.25.108.236:8182/buscaprodporcodigo"; //Busca productos
    public urlBuscarpordescripcion: string = sessionStorage.getItem('enlace').toString().concat('/buscaprodpordescripcion');//"http://172.25.108.236:8182/buscaprodpordescripcion"; //Busca productosx descripcion
    public urlbuscaempresa        : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal       : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"

    
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

    buscarProductosporcodigo(hdgcodigo:number,esacodigo:number,cmecodigo:number ,codigo: string,tipodeproducto:string,usuario:string,servidor:string): Observable<ConsultaArticulos[]> {
     
        return this._http.post<ConsultaArticulos[]>(this.urlBuscarporcodigo, {
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'codigo'        : codigo,
            'tipodeproducto':tipodeproducto,
            'usuario'       : usuario,
            'servidor'      : servidor
        });
    }

    buscarProductospordescripcion(hdgcodigo:number,esacodigo:number,cmecodigo:number,descripcion: string, tipodeproducto:string,usuario:string,servidor:string): Observable<ConsultaArticulos[]> {
     
        return this._http.post<ConsultaArticulos[]>(this.urlBuscarpordescripcion, {
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'descripcion'   : descripcion,
            'tipodeproducto': tipodeproducto,
            'usuario'       : usuario,
            'servidor'      : servidor
        });
    }
}
