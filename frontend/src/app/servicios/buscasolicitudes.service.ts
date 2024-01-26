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
import { Grabadetallesolicitudbod } from '../models/entity/Grabadetallesolicitudbod';


@Injectable()
export class BuscasolicitudesService {
    
    public urlbuscaempresa       : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal      : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"
    public buscabodega           : string = sessionStorage.getItem('enlace').toString().concat('/bodegas');//'http://172.25.108.236:8189/bodegas';
    public urlbuscasolic         : string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitudes');
    public urlretornadetsolic    : string = sessionStorage.getItem('enlace').toString().concat('/retornadetsolicitudbod');
    public urleliminaencsolic    : string = sessionStorage.getItem('enlace').toString().concat('/grabarencabsolicitudbod');
    public urleliminadetallesolic: string = sessionStorage.getItem('enlace').toString().concat('/grabardetasolicitudbod');

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

    BodegasVigentes(hdgcodigo: number, esacodigo: number,cmecodigo:number,usuario:string,servidor:string):Observable<BodegaVigente[]> {
     
        return this._http.post<BodegaVigente[]>(this.buscabodega, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaSolicitud(psbodid: number,phdgcodigo:number,pesacodigo:number,pcmecodigo:number,
        ptiposolicitud:number,pfechaini:string,pfechacfin:string,pbodegaorigen:number,
        pbodegadestino:number,pestcod:number, servidor: string):Observable<GrabaSolicitud[]>{
      
        return this._http.post<GrabaSolicitud[]>(this.urlbuscasolic, {
            'psbodid'       : psbodid,
            'phdgcodigo'    : phdgcodigo,
            'pesacodigo'    : pesacodigo,
            'pcmecodigo'    : pcmecodigo,
            'ptiposolicitud': ptiposolicitud,
            'pfechaini'     : pfechaini,
            'pfechacfin'    : pfechacfin,
            'pbodegaorigen' : pbodegaorigen,
            'pbodegadestino': pbodegadestino,
            'pestcod'       : pestcod, 
            'servidor'      : servidor
        });
    }

    DetalleSolicitud(solbodid: number, servidor: string):Observable<GrabaSolicitud[]>{

        return this._http.post<GrabaSolicitud[]>(this.urlretornadetsolic, {
            'solbodid': solbodid, 
            'servidor': servidor
        });
    }

    GrabaElimacionCabeceraSolicitud(sboid: number,hdgcodigo:number,esacodigo:number,cmecodigo:number,
        bodegaorigen:number, bodegadestino:number, prioridadcod:number,esticod:number,
        usuariocrea:string,fechacrea:string,usuariomodif:string,fechamodif:string,usuarioelimina:string,
        fechaelimina:string, servidor:string): Observable<GrabaSolicitud[]> {
        return this._http.post<GrabaSolicitud[]>(this.urleliminaencsolic, {
            'sboid'         : sboid,
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'bodegaorigen'  : bodegaorigen, 
            'bodegadestino' : bodegadestino, 
            'prioridadcod'  : prioridadcod,
            'esticod'       : esticod,
            'usuariocrea'   : usuariocrea,
            'fechacrea'     : fechacrea,
            'usuariomodif'  : usuariomodif,
            'fechamodif'    : fechamodif,
            'usuarioelimina': usuarioelimina,
            'fechaelimina'  : fechaelimina,
            'servidor'      : servidor
        });
    }

    GrabaEliminacionDetalleSolicitud(grabadetsolicitudbod):Observable<Grabadetallesolicitudbod[]>{
  
        return this._http.post<Grabadetallesolicitudbod[]>(this.urleliminadetallesolic, {
            'grabadetsolicitudbod': grabadetsolicitudbod
        });
    }
    GrabaModificaCabeceraSolicitud(sboid: number,hdgcodigo:number,esacodigo:number,cmecodigo:number,
        bodegaorigen:number, bodegadestino:number, prioridadcod:number,esticod:number,
        usuariocrea:string,fechacrea:string,usuariomodif:string,fechamodif:string,usuarioelimina:string,
        fechaelimina:string, servidor:string): Observable<GrabaSolicitud[]> {
        return this._http.post<GrabaSolicitud[]>(this.urleliminaencsolic, {
            'sboid'         : sboid,
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'bodegaorigen'  : bodegaorigen, 
            'bodegadestino' : bodegadestino, 
            'prioridadcod'  : prioridadcod,
            'esticod'       : esticod,
            'usuariocrea'   : usuariocrea,
            'fechacrea'     : fechacrea,
            'usuariomodif'  : usuariomodif,
            'fechamodif'    : fechamodif,
            'usuarioelimina': usuarioelimina,
            'fechaelimina'  : fechaelimina,
            'servidor'      : servidor
        });
    }
}