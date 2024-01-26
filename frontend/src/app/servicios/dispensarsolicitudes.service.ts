import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { DispensaSolicitud } from '../models/entity/DispensaSolicitud';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DespachoDetalleSolicitud } from '../models/entity/DespachoDetalleSolicitud';

@Injectable()
export class DispensarsolicitudesService {
    public urlbuscasolicadispensar: string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitud');//"http://172.25.108.236:8191/buscasolicitud"; 
    public urlcierrasolicitud     : string = sessionStorage.getItem('enlace').toString().concat('/cerrarsolicitud');//"http://172.25.108.236:8191/cerrarsolicitud";
    public urlgrabadispensacion   : string = sessionStorage.getItem('enlace').toString().concat('/dispensarpaciente');//"http://172.25.108.236:8191/grabadispensaciones";
    public urlgrabarecepcion   : string = sessionStorage.getItem('enlace').toString().concat('/recepciondespachobodega');
   

    constructor(public _http: HttpClient) {

    }   

    BuscaSolicitudADispensar(hdgcodigo:number,fechadesde: string,fechahasta: string,ambito: number,tiporeg:string,estadosol: number,servicio: number,identificacion: number,identificaciondoc:string,usuario:string,servidor: string ): Observable<DispensaSolicitud[]> {
  
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

    CierreSolicitud(soliid:number,usuario:string,servidor: string): Observable<DispensaSolicitud[]> {

        return this._http.post<DispensaSolicitud[]>(this.urlcierrasolicitud, {
            'soliid'    : soliid,
            'usuario'   : usuario,
            'servidor'  : servidor
        });
    }

  
    GrabaDispensacion(paramdespachos: DespachoDetalleSolicitud[]): Observable<DespachoDetalleSolicitud[]> {
       
        return this._http.post<DespachoDetalleSolicitud[]>(this.urlgrabadispensacion, {
            'paramdespachos': paramdespachos
        });
    } 
    
    RecepcionaDispensacion(paramdespachos: DespachoDetalleSolicitud[]): Observable<DespachoDetalleSolicitud[]> {
 
        return this._http.post<DespachoDetalleSolicitud[]>(this.urlgrabarecepcion, {
            'paramdespachos': paramdespachos
        });
    } 
}