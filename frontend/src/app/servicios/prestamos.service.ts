import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Prestamos } from '../models/entity/Prestamos';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { Traspasos} from '../models/entity/Traspasos';
import { UrlReporte } from '../models/entity/Urlreporte';
import { DetalleTraspasos } from '../models/entity/DetalleTraspasos';
import { Productos } from '../models/entity/Productos';
import { StockProducto } from '../models/entity/StockProducto';
import { GrabaTraslado } from '../models/entity/GrabaTraslado';
import { Paramgrabardetalletraspaso } from '../models/entity/Paramgrabardetalletraspaso';
import { environment } from '../../environments/environment';

@Injectable()
export class PrestamosService {
    public urlbuscabodegaorigen   : string = sessionStorage.getItem('enlace').toString().concat('/traebodegasxservicios');// "http://172.25.108.236:8189/traebodegasxservicios";
    public urlbuscatraspaso       : string = sessionStorage.getItem('enlace').toString().concat('/buscatraspasos');//"http://172.25.108.236:8193/buscatraspasos";
    public urlllenatraspaso       : string = sessionStorage.getItem('enlace').toString().concat('/llenatraspaso');//"http://172.25.108.236:8193/llenatraspaso";
    public urlbuscaempresa        : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal       : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal";
    public urldetalletraspaso     : string = sessionStorage.getItem('enlace').toString().concat('/llenadetatraspaso');//"http://172.25.108.236:8193/llenadetatraspaso";
    public urlBuscarpordescripcion: string = sessionStorage.getItem('enlace').toString().concat('/buscaprodpordescripcion');//'http://172.25.108.236:8182/buscaprodpordescripcion'; //Busca productos x descripcion
    public urlBuscarporcodigo     : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporcodigo');//'http://172.25.108.236:8182/buscaprodporcodigo'; 
    public urlBuscastock          : string = sessionStorage.getItem('enlace').toString().concat('/buscastock');//"http://172.25.108.236:8193/buscastock";
    public urlGrabatraspaso       : string = sessionStorage.getItem('enlace').toString().concat('/grabartraspasos');//"http://172.25.108.236:8193/grabartraspasos";
    public urlGrabadetalletraspaso: string = sessionStorage.getItem('enlace').toString().concat('/grabardetalletraspasos');//"http://172.25.108.236:8193/grabardetalletraspasos";
    public urlserviciobodega      : string = sessionStorage.getItem('enlace').toString().concat('/serviciosconbodegas');//'http://172.25.108.236:8189/serviciosconbodegas';
    public urlrptcomprobante      : string = sessionStorage.getItem('enlace').toString().concat('/buscastockenbodegas');//"http://172.25.108.236:";//falta agregar el resto de la direccion

    constructor(public _http: HttpClient) {

    }
    

    BusquedaTraspasos(fechatraspaso: string,servicioorigen: number,serviciodestino:number,
        usuario:string,servidor:string):Observable<Traspasos[]> {

        return this._http.post<Traspasos[]>(this.urlbuscatraspaso, {
            'fechatraspaso'  : fechatraspaso,
            'servicioorigen' : servicioorigen,
            'serviciodestino': serviciodestino,
            'usuario'        : usuario,
            'servidor'       : servidor
        });
    }

    LlenadoTraspasos(idtraspaso: number,usuario:string,servidor:string):Observable<Traspasos[]> {

        return this._http.post<Traspasos[]>(this.urlllenatraspaso, {
            'idtraspaso'  : idtraspaso,
            'usuario'     : usuario,
            'servidor'    : servidor
        });
    }

    BusquedaDetalleTraspasos(idtraspaso,usuario:string,servidor:string):Observable<DetalleTraspasos[]> {

        return this._http.post<DetalleTraspasos[]>(this.urldetalletraspaso, {
            'idtraspaso'  : idtraspaso,
            'usuario'     : usuario,
            'servidor'    : servidor
        });
    }

    buscarProductosporcodigo(codigo: string, tipodeproducto: string,usuario:string,servidor:string): Observable<Productos[]> {

        return this._http.post<Productos[]>(this.urlBuscarporcodigo, {
            'codigo'        : codigo,
            'tipodeproducto': tipodeproducto,
            'usuario'       : usuario,
            'servidor'      : servidor
        });
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               

    buscarProductospordescripcion(descripcion: string, tipodeproducto: string,usuario:string,servidor:string): Observable<Productos[]> {
        return this._http.post<Productos[]>(this.urlBuscarpordescripcion, {
           'descripcion'    : descripcion,
           'tipodeproducto' : tipodeproducto,
           'usuario'        : usuario,
           'servidor'       : servidor
        });
    }

    BuscaStockProd(meinid: number, bodegaorigen: number,usuario:string,servidor:string): Observable<StockProducto[]> {
        return this._http.post<StockProducto[]>(this.urlBuscastock, {
           'meinid'       : meinid,
           'bodegaorigen' : bodegaorigen,
           'usuario'      : usuario,
           'servidor'     : servidor
        });
    }

    GrabaTraslado(paramgrabartraspaso): Observable<GrabaTraslado[]> {
 
        return this._http.post<GrabaTraslado[]>(this.urlGrabatraspaso, {
           'paramgrabartraspaso'  : paramgrabartraspaso
           
        });
    }

    GrabaDetalleTraslado(pargrabardetalletraspaso): Observable<Paramgrabardetalletraspaso[]> {
        return this._http.post<Paramgrabardetalletraspaso[]>(this.urlGrabadetalletraspaso, {
           'pargrabardetalletraspaso'  : pargrabardetalletraspaso
           
        });
    }

    

    RPTComprobantePrestamo(varocid: number):Observable<UrlReporte[]>{
        return this._http.post<UrlReporte[]>(this.urlrptcomprobante, {
            'varocid': varocid
        });
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


}