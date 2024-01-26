import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { RecepcionOrdenesCompra } from '../../app/models/entity/RecepcionOrdenesCompra';
import { Recepcionorden2} from '../../app/models/entity/Recepcionorden2';
import { DetalleGrillaRecepcion } from '../../app/models/entity/DetalleGrillaRecepcion';
import { HttpClient } from '@angular/common/http';
import { GrabaRecepcion } from '../../app/models/entity/GrabaRecepcion';
import { BuscaProveedor } from '../models/entity/BuscaProveedor';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { environment } from '../../environments/environment';

@Injectable()
export class RecepcionordenescompraService {
    public url                       : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedor');//"http://172.25.108.236:8183/buscaproveedor"; //buscaproveedores
    public urlbuscaproveedorrut      : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedorporrut');//"http://172.25.108.236:8183/buscaproveedorporrut"; 
    public urlbuscaproveedornombre   : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedorpornombre');//"http://172.25.108.236:8183/buscaproveedorpornombre";
    public urlBuscadordencompra      : string = sessionStorage.getItem('enlace').toString().concat('/buscaordendecompra');//"http://172.25.108.236:8184/buscaordendecompra"; //busca ordencompra
    public urlDetalle                : string = sessionStorage.getItem('enlace').toString().concat('/buscadetalleoc');//"http://172.25.108.236:8184/buscadetalleoc"; //Busca detalle Orden compra
    public urlBuscaFechaEstado       : string = sessionStorage.getItem('enlace').toString().concat('/buscaordenesdecompra');//"http://172.25.108.236:8184/buscaordenesdecompra" // busca OC Fecha y Estado
    public urlOCProveedor            : string = sessionStorage.getItem('enlace').toString().concat('/ocproveedor');//"http://172.25.108.236:8184/ocproveedor" // busca oc de proveedor
    public urlBuscaSubdetalleOC      : string = sessionStorage.getItem('enlace').toString().concat('/detalleguiaoc');//"http://172.25.108.2361:8184/detalleguiaoc" // busca subdetalleoc
    public urlBuscaDatosguia         : string = sessionStorage.getItem('enlace').toString().concat('/rescataguia');//"http://172.25.108.236:8184/rescataguia" //busca datosguia
    public urlgrabadetallerecepcionoc: string = sessionStorage.getItem('enlace').toString().concat('/grabardetallerecepoc');//"http://172.25.108.236:8184/grabardetallerecepoc" //grabarecepcion
    public urlbuscaempresa           : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal          : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"

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
    BuscadorOrdenCompra(hdgcodigo: number,esacodigo:number,cmecodigo:number,numerodococ:number,usuario:string,servidor:string): Observable<RecepcionOrdenesCompra[]>{
        return this._http.post<RecepcionOrdenesCompra[]>(this.urlBuscadordencompra, {
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'numerodococ': numerodococ,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }
   
    BuscaDetalleOC(hdgcodigo: number,esacodigo:number,cmecodigo: number,numerodococ: number,usuario:string,servidor:string): Observable<RecepcionOrdenesCompra[]>{
        return this._http.post<RecepcionOrdenesCompra[]>(this.urlDetalle, {
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'numerodococ': numerodococ,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    
    buscaProveedor(numerorutprov: number, descripcionprov: string): Observable<RecepcionOrdenesCompra[]> {
        return this._http.post<RecepcionOrdenesCompra[]>(this.url, {
            'numerorutprov'  : numerorutprov,
            'descripcionprov': descripcionprov
        });
    }

    buscaProveedorporrut(hdgcodigo:number, numerorutprov: number,usuario:string,servidor:string): Observable<BuscaProveedor[]> {
  
        return this._http.post<RecepcionOrdenesCompra[]>(this.urlbuscaproveedorrut, {
            'hdgcodigo'    : hdgcodigo,
            'numerorutprov': numerorutprov,
            'usuario'      : usuario,
            'servidor'     : servidor
        });
    }
    buscaProveedorpornombre(hdgcodigo:number,descripcionprov: string,usuario:string,servidor:string ): Observable<BuscaProveedor[]> {
        return this._http.post<BuscaProveedor[]>(this.urlbuscaproveedornombre, {
            'hdgcodigo'      : hdgcodigo,
            'descripcionprov': descripcionprov,
            'usuario'        : usuario,
            'servidor'       : servidor
            
        });
    }


    buscaProveedorOC(proveedorid: number,usuario:string,servidor:string):Observable<RecepcionOrdenesCompra[]> {
        return this._http.post<RecepcionOrdenesCompra[]>(this.urlOCProveedor, {
            'proveedorid': proveedorid,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }
    BuscaSubDetalleOC(hdgcodigo: number,esacodigo: number,cmecodigo:number,ocodetid:number,numerodococ: number,usuario:string,servidor:string):Observable<RecepcionOrdenesCompra[]> {
        return this._http.post<RecepcionOrdenesCompra[]>(this.urlBuscaSubdetalleOC, {
            'hdgcodigo'  : hdgcodigo,
            'esacodigo'  : esacodigo,
            'cmecodigo'  : cmecodigo,
            'ocodetid'   : ocodetid ,
            'numerodococ': numerodococ,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }
    BuscaDatosGuia(numerodococ: number, proveedorid: number, tipdocid: number,usuario:string,servidor:string ):Observable<Recepcionorden2[]> {
        return this._http.post<Recepcionorden2[]>(this.urlBuscaDatosguia, {
            'numerodococ': numerodococ,
            'proveedorid': proveedorid, 
            'tipdocid'   : tipdocid,
            'usuario'    : usuario,
            'servidor'   : servidor 
        });
    }

    GrabaRecepcionOC(paramgrabarecepcionoc):Observable<GrabaRecepcion[]>{
 
        return this._http.post<GrabaRecepcion[]>(this.urlgrabadetallerecepcionoc, {
            paramgrabarecepcionoc
        });
    }    
}