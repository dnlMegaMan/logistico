import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import { DispensarSolicitudes } from '../models/entity/DispensarSolicitudes';
import { Solicitud } from '../models/entity/Solicitud';
import { DetalleSolicitud } from '../models/entity/DetalleSolicitud';
import { environment } from '../../environments/environment';


@Injectable()
export class BuscasolicitudespacientesService {
    public urlbuscasolicadispensar: string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitudes'); 
    public urldetallesolicitud    : string = sessionStorage.getItem('enlace').toString().concat('/buscasolicituddet');
    
    constructor(public _http: HttpClient) {

    }

    
    BuscaSolicitudADispensar(hdgcodigo:number,esacodigo: number, cmecodigo: number,fechadesde: string,
        fechahasta: string,ambito: number,tiporeg:string,estadosol: number,servicio: number,
        identificacion: number,identificaciondoc:string,usuario:string,servidor: string ): Observable<Solicitud[]> {
 
        return this._http.post<Solicitud[]>(this.urlbuscasolicadispensar, {
            'hdgcodigo'         : hdgcodigo,
            'esacodigo'         : esacodigo,
            'cmecodigo'         : cmecodigo,
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
            'soliid'    : soliid,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    
}






