import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { IngresoOrdenesCompra } from '../../app/models/entity/IngresoOrdenesCompra';
import { HttpClient } from '@angular/common/http';
import { IngresoOrdenCompra2 } from '../models/entity/IngresoOrdenCompra2';
import { ParamGrabaDetallesOC } from '../models/entity/ParamGrabaDetallesOC';
import { BuscaProveedor } from '../models/entity/BuscaProveedor';
import { DoctosAsociados } from '../models/entity/DoctosAsociados';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { UrlReporte } from '../models/entity/Urlreporte';
import { environment } from '../../environments/environment';

@Injectable()
export class IngresoordenescompraService {
    public url                      : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedor');//"http://172.25.108.236:8183/buscaproveedor"; //buscaproveedores
    public urlbuscaproveedorrut     : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedorporrut');//"http://172.25.108.236:8183/buscaproveedorporrut"; //buscaproveedores
    public urlbuscaproveedornombre  : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedorpornombre');//"http://172.25.108.236:8183/buscaproveedorpornombre"; //buscaproveedores
    public urlBuscarordencompra     : string = sessionStorage.getItem('enlace').toString().concat('/buscaordendecompra');//"http://172.25.108.236:8184/buscaordendecompra"; //busca ordencompra
    public urlDetalle               : string = sessionStorage.getItem('enlace').toString().concat('/buscadetalleoc');//"http://172.25.108.236:8184/buscadetalleoc"; //Busca detalle Orden compra
    public urlBuscaFechaEstado      : string = sessionStorage.getItem('enlace').toString().concat('/buscaordenesdecompra');//"http://172.25.108.236:8184/buscaordenesdecompra" // busca OC Fecha y Estado
    public urlBuscaPalabraClave     : string = sessionStorage.getItem('enlace').toString().concat('/buscamedicamentos');//"http://172.25.108.236:8182/buscamedicamentos" //Busca palabra clave
    public urlBuscapordescripcion   : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodpordescripcion');//"http://172.25.108.236:8182/buscaprodpordescripcion"
    public urlIngresocantidad       : string = sessionStorage.getItem('enlace').toString().concat('/ocvaloranterior');//"http://172.25.108.236:8184/ocvaloranterior"// Ingreso cantidad
    public urlcierreoc              : string = sessionStorage.getItem('enlace').toString().concat('/cerrarordendecompra');//"http://172.25.108.236:8184/cerrarordendecompra"
    public urlcostoanterior         : string = sessionStorage.getItem('enlace').toString().concat('/valorcostoanterior');//"http://172.25.108.236:8184/valorcostoanterior"
    public urlgrabaencabezado       : string = sessionStorage.getItem('enlace').toString().concat('/grabarencabezadooc');//"http://172.25.108.236:8184/grabarencabezadooc"
    public urldetalleingresooc      : string = sessionStorage.getItem('enlace').toString().concat('/grabardetalleoc');//"http://172.25.108.236:8184/grabardetalleoc"
    public urlimprimecambiaestadooc : string = sessionStorage.getItem('enlace').toString().concat('/imprimiroc');//"http://172.25.108.236:8184/imprimiroc";
    public urldoctosasoc            : string = sessionStorage.getItem('enlace').toString().concat('/buscadoctosasococ');//"http://172.25.108.236:8184/buscadoctosasococ";
    public urlbuscaempresa          : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal         : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal";
    public urlrptoc                 : string = sessionStorage.getItem('enlace').toString().concat('/obtieneurlinfordencompra');//"http://172.25.108.236:8194/obtieneurlinfordencompra";//obtiene reporte ordencompra

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

    buscarProveedor(numerorutprov: number, descripcionprov: string): Observable<IngresoOrdenesCompra[]> {
        return this._http.post<IngresoOrdenesCompra[]>(this.url, {
            'numerorutprov'  : numerorutprov,
            'descripcionprov': descripcionprov
        });
    }

    buscaProveedorporrut(hdgcodigo:number,numerorutprov: number,usuario:string,servidor:string): Observable<BuscaProveedor[]> {

        return this._http.post<BuscaProveedor[]>(this.urlbuscaproveedorrut, {
            'hdgcodigo'    : hdgcodigo,
            'numerorutprov': numerorutprov,
            'usuario'      : usuario,
            'servidor'     : servidor
        });
    }

    buscaProveedorpornombre(hdgcodigo:number,descripcionprov: string,usuario:string,servidor: string ): Observable<BuscaProveedor[]> {
        return this._http.post<BuscaProveedor[]>(this.urlbuscaproveedornombre, {
            'hdgcodigo'      : hdgcodigo,
            'descripcionprov': descripcionprov,
            'usuario'        : usuario,
            'servidor'       : servidor
        });
    }

    BuscaOrdenCompra(hdgcodigo:number,esacodigo:number,cmecodigo:number,numerodococ:number,usuario:string,servidor:string): Observable<IngresoOrdenesCompra[]>{
        return this._http.post<IngresoOrdenesCompra[]>(this.urlBuscarordencompra, {
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'numerodococ': numerodococ,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    BuscaDetalleOC(hdgcodigo:number,esacodigo:number,cmecodigo:number,numerodococ:number,usuario:string,servidor:string): Observable<IngresoOrdenesCompra[]>{
        return this._http.post<IngresoOrdenesCompra[]>(this.urlDetalle, {
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'numerodococ': numerodococ,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    BuscarOCFechaEstado(hdgcodigo: number,esacodigo: number,cmecodigo: number,estadooc:number,fechadesde:string, 
        fechahasta:string,usuario:string,servidor:string){
        return this._http.post<IngresoOrdenesCompra[]>(this.urlBuscaFechaEstado, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'estadooc'  : estadooc,
            'fechadesde': fechadesde,
            'fechahasta': fechahasta,
            'usuario'   : usuario,
            'servidor'  : servidor
        }); 
    }

    CreaOrdenCompra(hdgcodigo:number,esacodigo:number,cmecodigo:number,proveedorid: number,
        usuario: string,numerodeitems: number,estadooc: number, fechaanulacionoc: string ,bodegaid: number,servidor:string): Observable<IngresoOrdenesCompra> {

 
        return this._http.post<IngresoOrdenesCompra>(this.urlgrabaencabezado, {
            'hdgcodigo'         : hdgcodigo,
            'esacodigo'         : esacodigo,
            'cmecodigo'         : cmecodigo,
            'proveedorid'       : proveedorid,
            'usuario'           : usuario,
            'numerodeitems'     : numerodeitems,
            'estadooc'          : estadooc, 
            'fechaanulacionoc'  : fechaanulacionoc ,
            'bodegaid'          : bodegaid,
            'servidor'          : servidor
        });
    }

    Buscadorpalabraclave(descripcion: string,usuario:string,servidor:string ) : Observable<IngresoOrdenesCompra[]> {
       

        return this._http.post<IngresoOrdenesCompra[]>(this.urlBuscapordescripcion, {
            'descripcion' : descripcion,
            'usuario'     : usuario,
            'servidor'    : servidor
        });
    }

    IngresoCantidad(mein:number,proveedorid:number,usuario:string,servidor:string ) : Observable<IngresoOrdenesCompra[]> {


        return this._http.post<IngresoOrdenesCompra[]>(this.urlIngresocantidad, {
            'mein'       : mein,
            'proveedorid': proveedorid,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    CostoAnterior(hdgcodigo:number,esacodigo:number,cmecodigo, ocdetcodmei:string ,proveedorid:number,usuario:string,servidor:string ) : Observable<IngresoOrdenesCompra[]> {
   

        return this._http.post<IngresoOrdenesCompra[]>(this.urlcostoanterior, {
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'ocdetcodmei': ocdetcodmei,
            'proveedorid': proveedorid,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    CierreOrdenCompra(hdgcodigo: number,esacodigo: number,cmecodigo,numerodococ: number,usuario:string,servidor:string): Observable<IngresoOrdenesCompra[]>{
        return this._http.post<IngresoOrdenesCompra[]>(this.urlcierreoc, {
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'numerodococ': numerodococ,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    GrabaDetalleIngresoOC(paramgrabadetallesoc: ParamGrabaDetallesOC[]): Observable<any>{
        return this._http.post<any>(this.urldetalleingresooc, {
            paramgrabadetallesoc
        });

    }

    CambiaEstado(numerodococ: number,orcoid:number,usuario:string,servidor:string): Observable<IngresoOrdenesCompra[]>{
        return this._http.post<IngresoOrdenesCompra[]>(this.urlimprimecambiaestadooc, {
            'numerodococ': numerodococ,
            'orcoid'     : orcoid,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    BuscaDoctos(orcoid: number,usuario:string,servidor:string):Observable<DoctosAsociados[]>{
        return this._http.post<DoctosAsociados[]>(this.urldoctosasoc, {
            'orcoid'    : orcoid,
            'usuario'   : usuario,
            'servidor'  : servidor
        });
    }

    RPTOrdenCompra(varocid: number):Observable<UrlReporte[]>{
        return this._http.post<UrlReporte[]>(this.urlrptoc, {
            'varocid': varocid
        });
    }

}