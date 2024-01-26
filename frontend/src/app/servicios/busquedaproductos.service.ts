
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { Articulos } from '../../app/models/entity/mantencionarticulos';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Reglas } from '../models/entity/reglas';
import { SaldosProductosBodegas } from '../models/entity/SaldosProductosBodegas';
import { ProductosBodegas } from '../models/entity/productos-bodegas';
import { ProductoConLote } from '../models/entity/producto-con-lote';

@Injectable()
export class BusquedaproductosService {

    public urlBuscarpordescripcion  : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodpordescripcion');
    public urlBuscarporcodigo       : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporcodigo');
    public urlBuscarPpoPresForma    : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporprincipio');
    public urlBuscarReglasServicio  : string = sessionStorage.getItem('enlace').toString().concat('/buscareglasservicios');
    public urlBuscasaldosporbodega  : string = sessionStorage.getItem('enlace').toString().concat('/buscastockbodegas');
    public urlBuscarporcodigoProv   : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporcodigoprov');
    public urlBusquedaProductosConLote: string = sessionStorage.getItem('enlace').toString().concat('/consultaproductolotes');



    constructor(public _http: HttpClient) {

    }

    BuscarReglasServicio(hdgcodigo: number,esacodigo:number,cmecodigo:number,reglatipo: string,reglatipobodega:string, bodegacodigo:number,codigoservicio:string,id_producto:number, servidor:string): Observable<Reglas[]> {
        return this._http.post<Reglas[]>(this.urlBuscarReglasServicio, {
          'hdgcodigo':hdgcodigo,
	        'cmecodigo':cmecodigo,
	        'reglatipo' : reglatipo,
	        'reglatipobodega' : reglatipobodega,
	        'bodegacodigo' : bodegacodigo,
	        'codigoservicio': codigoservicio,
	        'id_producto' : id_producto,
	        'servidor' : servidor,
          'esacodigo': esacodigo
        });
    }

    BuscarArticulosPorCodigo(hdgcodigo: number,esacodigo:number,cmecodigo:number,
        codigo: string,usuario:string,servidor:string): Observable<Articulos[]> {
        return this._http.post<Articulos[]>(this.urlBuscarporcodigo, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'codigo'    : codigo,
            'usuario'   : usuario,
            'servidor'  : servidor
        });
    }

    BuscarArticulosPorCodigoProv(hdgcodigo: number,esacodigo:number,cmecodigo:number,
        codigo: string,servidor:string, proveedor: number): Observable<Articulos[]> {
        return this._http.post<Articulos[]>(this.urlBuscarporcodigoProv, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'codigo'    : codigo,
            'servidor'  : servidor,
            'proveedor' : proveedor
        });
    }

    BuscarArticulosFiltros(hdgcodigo: number,esacodigo:number,cmecodigo:number,codigo: string,
        descripcion: string,codpact:number,codpres:number,codffar:number, tipodeproducto:string,
        idbodega:number,controlminimo:string,controlado:string, consignacion:string, usuario:string,
        bodegaproductos:  ProductosBodegas[],servidor:string): Observable<Articulos[]> {
        return this._http.post<Articulos[]>(this.urlBuscarpordescripcion, {
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'descripcion'   : descripcion,
            'tipodeproducto': tipodeproducto,
            'princactivo'   :codpact,
            'presentacion'  :codpres,
            'FormaFarma'    : codffar,
            'codigo'        : codigo,
            'idbodega'      : idbodega,
            'controlminimo' :controlminimo,
            'controlado'    : controlado,
            'consignacion'  : consignacion,
            'usuario'       : usuario,
            'bodegaproductos': bodegaproductos,
            'servidor'      : servidor
        });
    }

    BuscarArticulosFiltrosOc(hdgcodigo: number,esacodigo:number,cmecodigo:number,codigo: string,
        descripcion: string,codpact:number,codpres:number,codffar:number, tipodeproducto:string,
        idbodega:number,controlminimo:string,controlado:string, consignacion:string, usuario:string,
        bodegaproductos:  ProductosBodegas[],servidor:string,pantalla: string, proveedor: number, tipodoc: number, numdoc: number): Observable<Articulos[]> {
        return this._http.post<Articulos[]>(this.urlBuscarpordescripcion, {
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'descripcion'   : descripcion,
            'tipodeproducto': tipodeproducto,
            'princactivo'   :codpact,
            'presentacion'  :codpres,
            'FormaFarma'    : codffar,
            'codigo'        : codigo,
            'idbodega'      : idbodega,
            'controlminimo' :controlminimo,
            'controlado'    : controlado,
            'consignacion'  : consignacion,
            'usuario'       : usuario,
            'bodegaproductos': bodegaproductos,
            'pantalla'      : pantalla,
            'proveedor'     : proveedor,
            'servidor'      : servidor,
            'tipodoc'       : tipodoc,
            'numdoc' : numdoc
        });
    }

    BuscarPpoPresForma(hdgcodigo: number,esacodigo:number,cmecodigo:number,descripcion: string,usuario:string,servidor:string): Observable<Articulos[]> {
        return this._http.post<Articulos[]>(this.urlBuscarPpoPresForma, {
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'descripcion': descripcion,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    BuscarSaldosPorBodegas(meinid: number,servidor:string,hdgcodigo: number,esacodigo:number,
        cmecodigo: number, usuario: string): Observable<SaldosProductosBodegas[]> {
        return this._http.post<SaldosProductosBodegas[]>(this.urlBuscasaldosporbodega, {
            'meinid'     : meinid,
            'servidor'   : servidor,
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'usuario'    : usuario
        });
    }

    BuscarArticulosFiltroDevol(hdgcodigo: number,esacodigo:number,cmecodigo:number,codigo: string,
        descripcion: string,codpact:number,codpres:number,codffar:number, tipodeproducto:string,
        idbodega:number,controlminimo:string,controlado:string, consignacion:string, usuario:string,
        servidor:string,clinumidentificacion:string): Observable<Articulos[]> {
        return this._http.post<Articulos[]>(this.urlBuscarpordescripcion, {
            'hdgcodigo'            : hdgcodigo,
            'esacodigo'            : esacodigo,
            'cmecodigo'            : cmecodigo,
            'descripcion'          : descripcion,
            'tipodeproducto'       : tipodeproducto,
            'princactivo'          :codpact,
            'presentacion'         :codpres,
            'FormaFarma'           : codffar,
            'codigo'               : codigo,
            'idbodega'             : idbodega,
            'controlminimo'        :controlminimo,
            'controlado'           : controlado,
            'consignacion'         : consignacion,
            'usuario'              : usuario,
            'servidor'             : servidor,
            'clinumidentificacion' : clinumidentificacion
        });
    }

    buscarProductosConLote(
        hdgcodigo: number, esacodigo:number, cmecodigo:number, servidor: string, usuario: string,
        lote: string, codigo: string, descripcion: string,
    ): Promise<ProductoConLote[]> {
        return this._http.post<ProductoConLote[]>(this.urlBusquedaProductosConLote, {
            hdgcodigo,
            esacodigo,
            cmecodigo,
            servidor,
            lote,
            codigo,
            descripcion,
        })
        .toPromise();
    }
}
