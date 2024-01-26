import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { DevolucionCompras } from '../../app/models/entity/DevolucionCompras';
import { HttpClient } from '@angular/common/http';
import { BuscaProveedor } from '../models/entity/BuscaProveedor';
import { GrabaDevolucionCompra } from '../models/entity/GrabaDevolucionCompra';
import { environment } from '../../environments/environment';

@Injectable()
export class DevolucioncomprasService {
    public urlbuscaproveedorrut     : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedorporrut');//"http://172.25.108.236:8183/buscaproveedorporrut"; //buscaproveedores
    public urlbuscaproveedornombre  : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedorpornombre');//"http://172.25.108.236:8183/buscaproveedorpornombre"; //buscaproveedores
    public urlbuscadocto            : string = sessionStorage.getItem('enlace').toString().concat('/datoscabeceraoc');//"http://172.25.108.236:8184/datoscabeceraoc";
    public urldetalledocto          : string = sessionStorage.getItem('enlace').toString().concat('/datosdetalleocdevo');//"http://172.25.108.236:8184/datosdetalleocdevo";
    public urledetalleocdevo        : string = sessionStorage.getItem('enlace').toString().concat('/detalleocdevo');//"http://172.25.108.236:8184/detalleocdevo";
    public urlgrabadevolcompra      : string = sessionStorage.getItem('enlace').toString().concat('/grabadevolucionesoc');//"http://172.25.108.236:8184/grabadevoluciones"

    constructor(public _http: HttpClient) {

    }

    buscaProveedorporrut(hdgcodigo:number,numerorutprov: number,usuario:string,servidor:string): Observable<DevolucionCompras[]> {
    
        return this._http.post<DevolucionCompras[]>(this.urlbuscaproveedorrut, {
            'hdgcodigo'    : hdgcodigo,
            'numerorutprov': numerorutprov,
            'usuario'      : usuario,
            'servidor'     : servidor
        });
    }

    buscaProveedorpornombre(hdgcodigo:number, descripcionprov: string,usuario:string,servidor:string): Observable<BuscaProveedor[]> {
        return this._http.post<BuscaProveedor[]>(this.urlbuscaproveedornombre, {
            'hdgcodigo'      : hdgcodigo,
            'descripcionprov': descripcionprov,
            'usuario'        : usuario,
            'servidor'       : servidor
        });
    }

    BuscaDocumento(fechadocrecepdes : string,fechadocrecephas: string, numerorutprov: number,
        descripcionprov: string,tipodoctoid: number,numerodocrecep:number,usuario:string,servidor:string): Observable<DevolucionCompras[]> {
        return this._http.post<DevolucionCompras[]>(this.urlbuscadocto, {
            'fechadocrecepdes'  : fechadocrecepdes, 
            'fechadocrecephas'  : fechadocrecephas,
            'numerorutprov'     : numerorutprov, 
            'descripcionprov'   : descripcionprov,
            'tipodoctoid'       : tipodoctoid,
            'numerodocrecep'    : numerodocrecep,
            'usuario'           : usuario,
            'servidor'          : servidor
        });
    }

    DetalleDocumento(proveedorid: number,guiatipodocto: number,numerodocrecep:number,usuario:string,servidor:string): Observable<DevolucionCompras[]> {
     
        return this._http.post<DevolucionCompras[]>(this.urldetalledocto, {
            'proveedorid'   : proveedorid,
            'guiatipodocto' : guiatipodocto,
            'numerodocrecep': numerodocrecep,
            'usuario'       : usuario,
            'servidor'      : servidor
        });
    }

    Detalledocdevol(ocdetmovdetid: number,usuario:string,servidor:string): Observable<DevolucionCompras[]> {
       
        return this._http.post<DevolucionCompras[]>(this.urledetalleocdevo, {
            'ocdetmovdetid': ocdetmovdetid,
            'usuario'      : usuario,
            'servidor'     : servidor
        });
    }

    GuardaDevolCompras(paramgrabadevolucionoc):Observable<GrabaDevolucionCompra[]>{
     
        return this._http.post<GrabaDevolucionCompra[]>(this.urlgrabadevolcompra, {
            paramgrabadevolucionoc
        });
    }
}