import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { ConsultaKardex } from '../../app/models/entity/ConsultaKardex';
import { HttpClient } from '@angular/common/http';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { BodegaVigente } from '../models/entity/BodegaVigente';
import { Productos } from '../models/entity/Productos';
import { StockProducto } from '../models/entity/StockProducto';
import { GrabaSolicitud } from '../models/entity/GrabaSolicitud';
import { environment } from '../../environments/environment';
import { BodegaCargo } from '../models/entity/BodegaCargo';
import { Paramgrabadespachos } from '../models/entity/Paramgrabadespachos';


@Injectable()
export class DespachosolicitudesService {
    public urlbuscaempresa       : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal      : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"
    public buscabodega           : string = sessionStorage.getItem('enlace').toString().concat('/bodegas');//'http://172.25.108.236:8189/bodegas';
    public urlbuscasolic          : string = sessionStorage.getItem('enlace').toString().concat('/retconsultaencsolicitudbod');
    public urlretornadetsolic     : string = sessionStorage.getItem('enlace').toString().concat('/retornadetsolicitudbod');
    public urlbuscabodegaorigen   : string = sessionStorage.getItem('enlace').toString().concat('/bodegascargo');
    public urlretornasolic        : string = sessionStorage.getItem('enlace').toString().concat('/retornaencsolicitudbod');
    public urlgrabadespacho       : string = sessionStorage.getItem('enlace').toString().concat('/grabadespachos');

    constructor(public _http: HttpClient) {
    }
    

    BuscaSolicitud(psbodid: number,phdgcodigo:number,pesacodigo:number,pcmecodigo:number,
        fechaini:string,fechacfin:string,pbodegaorigen:number,pbodegadestino:number,
        pestcod:number, servidor: string):Observable<GrabaSolicitud[]>{
   
        return this._http.post<GrabaSolicitud[]>(this.urlbuscasolic, {
            'psbodid': psbodid,
            'phdgcodigo'    : phdgcodigo,
            'pesacodigo'    : pesacodigo,
            'pcmecodigo'    : pcmecodigo,
            'fechaini'      : fechaini,
            'fechacfin'     : fechacfin,
            'pbodegaorigen' : pbodegaorigen,
            'pbodegadestino': pbodegadestino,
            'pestcod'       : pestcod, 
            'servidor'      : servidor
        });
    }
    retornaSolicitud(solbodid: number, servidor: string):Observable<GrabaSolicitud[]>{

        return this._http.post<GrabaSolicitud[]>(this.urlretornasolic, {
            'solbodid': solbodid,
            'servidor': servidor
        });
    }

    DetalleSolicitud(solbodid: number, servidor: string):Observable<GrabaSolicitud[]>{
  
        return this._http.post<GrabaSolicitud[]>(this.urlretornadetsolic, {
            'solbodid': solbodid, 
            'servidor': servidor
        });
    }

    DespachoDeSolicitud(paramgrabadespachos):Observable<Paramgrabadespachos[]>{
  
        return this._http.post<Paramgrabadespachos[]>(this.urlgrabadespacho, {
            'paramgrabadespachos': paramgrabadespachos 
        });
    }
}