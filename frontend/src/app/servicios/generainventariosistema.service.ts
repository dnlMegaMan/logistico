import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
//import { DistribucionComprasEspeciales } from '../models/entity/DistribucionComprasEspeciales';
import { Observable } from 'rxjs';
import { UrlReporte } from '../models/entity/Urlreporte';
import { GeneraInventarioSistema } from '../models/entity/GeneraInventarioSistema';
import { environment } from '../../environments/environment';

@Injectable()
export class GenerainventariosistemaService {
    public urlgenerainv     : string = sessionStorage.getItem('enlace').toString().concat('/generainventario');//"http://172.25.108.236:8195/generainventario";
    
    
    constructor(public _http: HttpClient) {

    }

    GeneraInventario(fechagenerainv:string,bodegainv:number,tipoproductoinv:string,usuario:string,servidor:string):Observable<GeneraInventarioSistema[]> {

        return this._http.post<GeneraInventarioSistema[]>(this.urlgenerainv, {
            'fechagenerainv' : fechagenerainv,
            'bodegainv'      : bodegainv,
            'tipoproductoinv': tipoproductoinv,
            'usuario'        : usuario,
            'servidor'       : servidor
        });
    }
   
}