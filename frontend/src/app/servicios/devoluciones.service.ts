import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { Devoluciones } from '../models/entity/Devoluciones';
import { DispensaSolicitud } from '../models/entity/DispensaSolicitud';
import { DetalleSolicitud } from '../models/entity/DetalleSolicitud';
//import { Paramgrabadevolucion } from '../models/entity/Paramgrabadevolucion';
import { Observable } from 'rxjs';
import { Paramgrabadetallesol } from '../models/entity/Paramgrabadetallesol';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { ServiciosClinicos } from '../models/entity/ServiciosClinicos';
import { environment } from '../../environments/environment';

@Injectable()
export class DevolucionesService {
    public urlbuscasolicadispensar  : string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitud');//"http://172.25.108.236:8191/buscasolicitud"; 
    public urldetallesolicitud      : string = sessionStorage.getItem('enlace').toString().concat('/buscasolicituddet');//"http://172.25.108.236:8191/buscasolicituddet";
    public urlgrabadevolucion       : string = sessionStorage.getItem('enlace').toString().concat('/grabadevoluciones');//"http://172.25.108.236:8191/grabadevoluciones";
    public urlbuscaempresa          : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');///"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal         : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal";
    public urlservcioclinico        : string = sessionStorage.getItem('enlace').toString().concat('/traeclinservicios');//'http://172.25.108.236:8189/traeclinservicios';


    constructor(public _http: HttpClient) {

    }

    BuscaEmpresa(hdgcodigo: number,usuario:string,servidor: string): Observable<Empresas[]> {
        
        return this._http.post<Empresas[]>(this.urlbuscaempresa, {
            'hdgcodigo': hdgcodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaSucursal(hdgcodigo: number, esacodigo: number,usuario:string,servidor: string): Observable<Sucursal[]> {
      
        return this._http.post<Sucursal[]>(this.urlbuscasucursal, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaServicioClinico(hdgcodigo: number, esacodigo: number, cmecodigo: number,usuario:string,servidor: string): Observable<ServiciosClinicos[]> {
        return this._http.post<ServiciosClinicos[]>(this.urlservcioclinico, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaSolicitudADevolver(hdgcodigo:number,fechadesde: string,fechahasta: string,ambito:number,tiporeg:number,
        estadosol:number,servicio:number, identificacion:number,identificaciondoc,usuario:string,servidor: string): Observable<DispensaSolicitud[]> {
     
        return this._http.post<DispensaSolicitud[]>(this.urlbuscasolicadispensar, {
            'hdgcodigo'         : hdgcodigo,
            'fechadesde'        : fechadesde,
            'fechahasta'        : fechahasta,
            'ambito'            : ambito,
            'tiporeg'           : tiporeg,
            'estadosol'         : estadosol,
            'servicio'          : servicio,
            'identificacion'    : identificacion,
            'identificaciondoc' : identificaciondoc,
            'usuario'           : usuario,
            'servidor'          : servidor
        });
    }

    BuscaDetalleSolicitud(soliid: number,usuario:string,servidor: string): Observable<DetalleSolicitud[]> {
      
        return this._http.post<DetalleSolicitud[]>(this.urldetallesolicitud, {
            'soliid' : soliid,
            'usuario'           : usuario,
            'servidor'          : servidor
        });
    }

    Devolucion(paramgrabadetallesol): Observable<Paramgrabadetallesol[]> {

        return this._http.post<Paramgrabadetallesol[]>(this.urlgrabadevolucion, {
            'paramgrabadetallesol' : paramgrabadetallesol
        });
    }
}