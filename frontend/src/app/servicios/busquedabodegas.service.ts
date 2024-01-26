
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Bodegas } from '../../app/models/entity/Bodegas';
import { Servicio } from '../../app/models/entity/Servicio';

@Injectable()
export class BusquedabodegasService {
    
    public urlbuscabod    : string = sessionStorage.getItem('enlace').toString().concat('/bodegasperifericas');
    public urlservicio            : string = sessionStorage.getItem('enlace').toString().concat('/servicios');
    public urlvalidabodega        : string = sessionStorage.getItem('enlace').toString().concat('/validabodega');
    constructor(public _http: HttpClient) {

    }

    BuscaServicios(hdgcodigo: number,esacodigo:number,cmecodigo:number, bodegacodigo: number,usuario:string,servidor:string):Observable<Servicio[]> {
        return this._http.post<Servicio[]>(this.urlservicio, {
            'hdgcodigo'   : hdgcodigo,
            'esacodigo'   : esacodigo,
            'cmecodigo'   : cmecodigo, 
            'bodegacodigo': bodegacodigo,
            'usuario'     : usuario,
            'servidor'    : servidor
        });
      }
    
    BuscaBodega(hdgcodigo: number,esacodigo: number,cmecodigo: number,usuario: string,servidor:string):Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urlbuscabod, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });        
    }   

    ValidaBodega(hdgcodigo: number,esacodigo: number,cmecodigo:number,codbodega: number,usuario:string,servidor:string):Observable<Bodegas[]> {
        return this._http.post<Bodegas[]>(this.urlvalidabodega, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'codbodega' : codbodega,
            'usuario'   : usuario,
            'servidor'  : servidor
        });        
    }
}