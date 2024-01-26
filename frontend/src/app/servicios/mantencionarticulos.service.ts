import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { Articulos } from '../../app/models/entity/mantencionarticulos';
import { Familia } from '../models/entity/Familia';
import { HttpClient } from '@angular/common/http';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { environment } from '../../environments/environment';
import { ProductosCheck } from '../models/entity/ProductosCheck';
import { Clasificacion } from '../models/entity/Clasificacion';

@Injectable()
export class MantencionarticulosService {
    public url                      : string = sessionStorage.getItem('enlace').toString().concat('/grabamedicamento');
    public urlBuscarpordescripcion  : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodpordescripcion');
    public urlBuscarporcodigo       : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporcodigo');
    public urlActualizar            : string = sessionStorage.getItem('enlace').toString().concat('/actualizamedicamento');
    public urlEliminar              : string = sessionStorage.getItem('enlace').toString().concat('/eliminamedicamento');
    public urlbuscafamilia          : string = sessionStorage.getItem('enlace').toString().concat('/familia');
    public urlbuscaholding          : string = sessionStorage.getItem('enlace').toString().concat('/buscaholding');
    public urlbuscaempresa          : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');
    public urlbuscasucursal         : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');
    public urlgrabacheckmedicamento : string = sessionStorage.getItem('enlace').toString().concat('/grabacheckmedicamento');
    public urlclasificacionProducto : string = sessionStorage.getItem('enlace').toString().concat('/clasificacionProducto');

    
    constructor(public _http: HttpClient) {

    }

    getMantencionarticulos() {
        return "texto desde el servicio";
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

    AddArticulos(producto: Articulos): Observable<Articulos> {
        return this._http.post<Articulos>(this.url, producto);
    }

    BuscarArticulosPorCodigo(hdgcodigo: number,esacodigo:number,cmecodigo:number,codigo: string,usuario:string,servidor:string): Observable<Articulos[]> {

        return this._http.post<Articulos[]>(this.urlBuscarporcodigo, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'codigo'    : codigo,
            'usuario'   : usuario,
            'servidor'  : servidor
        });
    }

    BuscarArituculosPorDescripcion(hdgcodigo: number,esacodigo:number,cmecodigo:number,descripcion: string,usuario:string,servidor:string): Observable<Articulos[]> {
        return this._http.post<Articulos[]>(this.urlBuscarpordescripcion, {
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'descripcion': descripcion,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    EliminaArticulos(mein: number,usuario:string, servidor:string): Observable<any> {
        return this._http.post<any>(this.urlEliminar, {
            'mein'    : mein,
            'usuario' : usuario,
            'servidor': servidor
        });
    }

    UpdateArticulos(producto: Articulos): Observable<Articulos> {
        console.log(producto);

        return this._http.post<Articulos>(this.urlActualizar, producto);
    }

    BuscaFamilias(tiporegistro: string,usuario:string,servidor:string): Observable<Familia[]> {
        return this._http.post<Familia[]>(this.urlbuscafamilia, {
            'tiporegistro': tiporegistro,
            'usuario'     : usuario,
            'servidor'    : servidor
        });
    }

    ClasificacionProducto(usuario:string,servidor:string): Observable<Clasificacion[]> {
        return this._http.post<Clasificacion[]>(this.urlclasificacionProducto, {
            'usuario'     : usuario,
            'servidor'    : servidor
        });
    }

    AddOrUpdateProductosCheck(producto: ProductosCheck): Observable<ProductosCheck> {
        return this._http.post<Articulos>(this.urlgrabacheckmedicamento, producto);
    }
}
