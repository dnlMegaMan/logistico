import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { DispensaciondeOrden } from '../models/entity/DispensaciondeOrden';
import { environment } from '../../environments/environment';


@Injectable()
export class DispensaciondeordenService {
    public urlbuscasolicadispensar  : string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitud');//"http://172.25.108.236:8191/buscasolicitud"; 
    public urlcierrasolicitud       : string = sessionStorage.getItem('enlace').toString().concat('/cerrarsolicitud');//"http://172.25.108.236:8191/cerrarsolicitud";
    public urldetallesolicitud      : string = sessionStorage.getItem('enlace').toString().concat('/buscasolicituddet');//"http://172.25.108.236:8191/buscasolicituddet";
    

    constructor(public _http: HttpClient) {

    }

    

    
}