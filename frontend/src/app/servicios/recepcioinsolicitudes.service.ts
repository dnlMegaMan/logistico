import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Solicitud } from '../models/entity/Solicitud';
import { DespachoSolicitud } from '../models/entity/DespachoSolicitud';
import { DevolucionSolicitud } from '../models/entity/DevolucionSolicitud';
import { EventoSolicitud } from '../models/entity/EventoSolicitud';
import { OrigenSolicitud } from '../models/entity/OrigenSolicitud';

@Injectable()
export class RecepcionsolicitudesService {
    public urlGenerarSolicitud: string = sessionStorage.getItem('enlace').toString().concat('/grabarsolicitudes');
    public urlbuscasolic: string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitudes');
    public urlDespachosolicitud: string = sessionStorage.getItem('enlace').toString().concat('/grabardispensaciones');
    public urlDevolucionSolicitud: string = sessionStorage.getItem('enlace').toString().concat('/grabadevoluciones');
    public urlseleventosolicitud: string = sessionStorage.getItem('enlace').toString().concat('/seleventosolicitud');
    public urlselOrigensolicitud: string = sessionStorage.getItem('enlace').toString().concat('/selorigensolicitud');
    
    constructor(public _http: HttpClient) {
    }


    crearSolicitud(varSolicitud: Solicitud): Observable<any> {
        return this._http.post(this.urlGenerarSolicitud, varSolicitud
        );

    }

    ModificaSolicitud(varSolicitud: Solicitud): Observable<any> {
        return this._http.post(this.urlGenerarSolicitud, varSolicitud
        );

    }

    EliminarSolicitud(varSolicitud: Solicitud): Observable<any> {
        return this._http.post(this.urlGenerarSolicitud, varSolicitud
        );

    }



    DespacharSolicitud(varDespachoSolicitud: DespachoSolicitud): Observable<any> {
        return this._http.post(this.urlDespachosolicitud, varDespachoSolicitud
        );
    }


    DevolucionSolicitud(varDevolucionolicitud: DevolucionSolicitud): Observable<any> {
        return this._http.post(this.urlDevolucionSolicitud, varDevolucionolicitud
        );
    }


    BuscaSolicitud(psbodid: number, phdgcodigo: number, pesacodigo: number, pcmecodigo: number,
        ptiposolicitud: number, pfechaini: string, pfechacfin: string, pbodegaorigen: number,
        pbodegadestino: number, pestcod: number, ambito: number, tiporeg: string, servicio: number,
        identificacion: number, identificaciondoc: string, usuario: string, servidor: string): Observable<Solicitud[]> {
        return this._http.post<Solicitud[]>(this.urlbuscasolic, {
            'psbodid': psbodid,
            'phdgcodigo': phdgcodigo,
            'pesacodigo': pesacodigo,
            'pcmecodigo': pcmecodigo,
            'ptiposolicitud': ptiposolicitud,
            'pfechaini': pfechaini,
            'pfechacfin': pfechacfin,
            'pbodegaorigen': pbodegaorigen,
            'pbodegadestino': pbodegadestino,
            'pestcod': pestcod,
            'ambito': ambito,
            'tiporeg': tiporeg,
            'servicio': servicio,
            'identificacion': identificacion,
            'identificaciondoc': identificaciondoc,
            'usuario': usuario,
            'servidor': servidor
        });
    }

    BuscaEventosSolicitud(solid: number, servidor: string): Observable<EventoSolicitud[]> {
        return this._http.post<EventoSolicitud[]>(this.urlseleventosolicitud, {
            'solid': solid,
            'servidor': servidor
        });
    }


    public ListaOrigenSolicitud(usuario: string, servidor: string): Observable<OrigenSolicitud[]> {
        return this._http.post<OrigenSolicitud[]>(this.urlselOrigensolicitud, {
            'usuario': usuario,
            'servidor': servidor
        });
    }
}