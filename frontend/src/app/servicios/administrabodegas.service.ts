import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { Bodegas } from '../models/entity/Bodegas';
import { Bodegas1 } from '../models/entity/Bodegas1';
import { Bodegas2 } from '../models/entity/Bodegas2';
import { HttpClient } from '@angular/common/http';
import { Servicio } from '../models/entity/Servicio';
import { ParamGrabaproductosaBodega } from '../models/entity/ParamGrabaProductosaBodega';
import { ParamEliminaProductosaBod } from '../models/entity/ParamEliminaProductosaBod';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { AsignaBodega } from '../models/entity/AsignaBodega';
import { environment } from '../../environments/environment';


@Injectable()
export class BodegasService {   
    public urlBuscarpordescripcion: string = sessionStorage.getItem('enlace').toString().concat('/buscaprodpordescripcion');//'http://172.25.108.236:8182/buscaprodpordescripcion'; //Busca productos x descripcion
    public urlBuscarporcodigo     : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporcodigo');//'http://172.25.108.236:8182/buscaprodporcodigo'; //Busca productos x codigo
    public urlbodegasperifericas  : string = sessionStorage.getItem('enlace').toString().concat('/bodegasperifericas');//"http://172.25.108.236:8189/bodegasperifericas"; //buscaproveedores
    public urlservicio            : string = sessionStorage.getItem('enlace').toString().concat('/servicios');//"http://172.25.108.236:8189/servicios"; //busca servicios
    public urlgrababodeganueva    : string = sessionStorage.getItem('enlace').toString().concat('/grababodega');//"http://172.25.108.236:8190/grababodega";
    public urlvalidabodega        : string = sessionStorage.getItem('enlace').toString().concat('/validabodega');//"http://172.25.108.236:8190/validabodega";
    public urlasociabodservi      : string = sessionStorage.getItem('enlace').toString().concat('/asociaservicioabodega');//"http://172.25.108.236:8190/asociaservicioabodega"; 
    public urldesasociabodservi   : string = sessionStorage.getItem('enlace').toString().concat('/desasociaservicioabodega');//"http://172.25.108.236:8190/desasociaservicioabodega"
    public urldesactivabodega     : string = sessionStorage.getItem('enlace').toString().concat('/estadonovigentebodega');//"http://172.25.108.236:8190/estadonovigentebodega";
    public urlactivabodega        : string = sessionStorage.getItem('enlace').toString().concat('/estadovigentebodega');//"http://172.25.108.236:8190/estadovigentebodega";
    public urlprodxbodega         : string = sessionStorage.getItem('enlace').toString().concat('/productosxbodega');//"http://172.25.108.236:8190/productosxbodega";
    public urlasignaprodabodega   : string = sessionStorage.getItem('enlace').toString().concat('/asignaproductosabodega');//"http://172.25.108.236:8190/asignaproductosabodega";
    public urlgrabaprodabod       : string = sessionStorage.getItem('enlace').toString().concat('/grabarproductosabod');//"http://172.25.108.236:8190/grabarproductosabod";
    public urleliminaprodabod     : string = sessionStorage.getItem('enlace').toString().concat('/eliminarproductosabod');//"http://172.25.108.236:8190/eliminarproductosabod";
    public urlbuscaempresa        : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal       : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"
    public urlasignabodega        : string = sessionStorage.getItem('enlace').toString().concat('/bodegasparaasignar');//'http://172.25.108.236:8189/bodegasparaasignar';

    constructor(public _http: HttpClient) {

    }

    BuscaEmpresa(hdgcodigo: number,usuario:string,servidor:String):Observable<Empresas[]> {
        return this._http.post<Empresas[]>(this.urlbuscaempresa, {
            'hdgcodigo': hdgcodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaSucursal(hdgcodigo: number, esacodigo: number,usuario:string,servidor:String):Observable<Sucursal[]> {
        return this._http.post<Sucursal[]>(this.urlbuscasucursal, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    AsignaBodega(hdgcodigo: number,esacodigo: number,cmecodigo:number,usuario:string,servidor:string): Observable<AsignaBodega[]> {
        return this._http.post<AsignaBodega[]>(this.urlasignabodega, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'usuario'   : usuario,
            'servidor'  : servidor
        });
    }

    buscarProductosporcodigo(codigo: string, tipodeproducto: string,usuario:string,servidor:string): Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urlBuscarporcodigo, {
            'codigo'        : codigo,
            'tipodeproducto': tipodeproducto,
            'usuario'       : usuario,
            'servidor'      : servidor
        });
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               

    buscarProductospordescripcion(descripcion: string, tipodeproducto: string,usuario:string,servidor:string): Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urlBuscarpordescripcion, {
           'descripcion'    : descripcion,
           'tipodeproducto' : tipodeproducto,
           'usuario'        : usuario,
           'servidor'       : servidor
        });
    }

    BuscaBodegaPeriferica(usuario: string,servidor:string):Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urlbodegasperifericas, {
            'usuario' : usuario,
            'servidor': servidor
        });
        
    }

    BuscaServicios(hdgcodigo: number,esacodigo:number,cmecodigo:number, bodegacodigo: number,usuario:string,servidor:string):Observable<Servicio[]> {
        return this._http.post<Servicio[]>(this.urlservicio, {
            'hdgcodigo'   : hdgcodigo,
            'esacodigo'   : esacodigo,
            'cmecodigo'   : cmecodigo, 
            'bodegacodigo': bodegacodigo,
            'usuario'     : usuario,
            'servidor'    : servidor
        });
    }

    CreaBodegaNueva(hdgcodigo: number,esacodigo: number,cmecodigo:number,codbodega:number, 
        desbodega: string,codnuevo:string,usuario:string,servidor:string): Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urlgrababodeganueva, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'codbodega' : codbodega,
            'desbodega' : desbodega,
            'codnuevo'  : codnuevo,
            'usuario'   : usuario,
            'servidor'  : servidor
        });
    }

    ValidaBodega(hdgcodigo: number,esacodigo: number,cmecodigo:number,codbodega: number,usuario:string,servidor:string):Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urlvalidabodega, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'codbodega' : codbodega,
            'usuario'   : usuario,
            'servidor'  : servidor
        });
        
    }

    AsociaBodegaServicio(hdgcodigo: number,esacodigo: number,cmecodigo:number,codbodega: number,
        codserbodperi: number,usuario:string,servidor:string):Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urlasociabodservi, {
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'codbodega'     : codbodega,
            'codserbodperi' : codserbodperi,
            'usuario'       : usuario,
            'servidor'      : servidor
        });
        
    }

    DesasociaBodegaServicio(hdgcodigo: number,esacodigo: number,cmecodigo:number,codbodega: number, 
        codserbodperi: number,usuario:string,servidor:string):Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urldesasociabodservi, {
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'codbodega'     : codbodega,
            'codserbodperi' : codserbodperi,
            'usuario'       : usuario,
            'servidor'      : servidor
        });
        
    }

    DesactivaBodega(hdgcodigo: number,esacodigo: number,cmecodigo:number,codbodega: number,usuario:string,servidor:string):Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urldesactivabodega, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'codbodega': codbodega,
            'usuario'  : usuario,
            'servidor' : servidor
        });        
    }

    ActivaBodega(hdgcodigo: number,esacodigo: number,cmecodigo:number,codbodega: number,usuario:string,servidor:string):Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urlactivabodega, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'codbodega': codbodega,
            'usuario'  : usuario,
            'servidor' : servidor
        });        
    }

    BuscaProductoporBodega(hdgcodigo:number,esacodigo:number,cmecodigo:number,codbodega: number,
        usuario: string,servidor:string):Observable<Bodegas1[]> {
        return this._http.post<Bodegas1[]>(this.urlprodxbodega, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo, 
            'codbodega': codbodega,
            'usuario'  : usuario,
            'servidor' : servidor
        });        
    }

    Asignaprodabodega(hdgcodigo:number,esacodigo:number,cmecodigo:number,codbodega: number,
        meincodprod: string,meindesprod: string,  meintipoprod: string,
        usuario:string,servidor: string):Observable<Bodegas2[]> {
        return this._http.post<Bodegas2[]>(this.urlasignaprodabodega, {
            'hdgcodigo'   : hdgcodigo,
            'esacodigo'   : esacodigo,
            'cmecodigo'   : cmecodigo,
            'codbodega'   : codbodega,
            'meincodprod' : meincodprod,
            'meindesprod' : meindesprod,
            'meintipoprod': meintipoprod,
            'usuario'     : usuario,
            'servidor'    : servidor
        });        
    }

    GrabaProductosaBodega(paramgrabaproductosabod):Observable<ParamGrabaproductosaBodega[]>{
        return this._http.post<ParamGrabaproductosaBodega[]>(this.urlgrabaprodabod, {
            paramgrabaproductosabod
        });

    }

    EliminaProductodeBodega(parameliminaproductosabod):Observable<ParamEliminaProductosaBod[]> {
        return this._http.post<ParamEliminaProductosaBod[]>(this.urleliminaprodabod, {
            'parameliminaproductosabod': parameliminaproductosabod
        });        
    }
}