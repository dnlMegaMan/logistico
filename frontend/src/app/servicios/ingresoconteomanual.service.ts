import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
//import { DistribucionComprasEspeciales } from '../models/entity/DistribucionComprasEspeciales';
import { Observable } from 'rxjs';
import { IngresoConteoManual } from '../models/entity/IngresoConteoManual';
import { InventarioDetalle } from '../models/entity/InventarioDetalle';
import { environment } from '../../environments/environment';
import { StockProducto } from '../models/entity/StockProducto';
import { RetornaMensaje } from '../models/entity/RetornaMensaje';


@Injectable()
export class IngresoconteomanualService {
    public urlperiodoinv         : string = sessionStorage.getItem('enlace').toString().concat('/periodosinventarios');//"http://172.25.108.236:8187/periodosinventarios";
    public urlbuscainventario    : string = sessionStorage.getItem('enlace').toString().concat('/ConsultaInventario');//"http://172.25.108.236:8195/ConsultaInventario";
    public urlgrabainventario    : string = sessionStorage.getItem('enlace').toString().concat('/grabarinvmanual');//"http://172.25.108.236:8195/grabarinvmanual";
    public urlactualizainventario: string = sessionStorage.getItem('enlace').toString().concat('/actualizainv');//"http://172.25.108.236:8195/actualizainv";
    public urlBuscastock          : string = sessionStorage.getItem('enlace').toString().concat('/buscastock');
    public urlautorizaConteoInvenario: string = sessionStorage.getItem('enlace').toString().concat('/autorizaConteoInvenario');

    constructor(public _http: HttpClient) {

    }

    BuscaPeriodo(bodegainv: number,usuario:string,servidor: string): Observable<IngresoConteoManual[]> {
     
        return this._http.post<IngresoConteoManual[]>(this.urlperiodoinv, {
            'bodegainv': bodegainv,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaDetalleInventario(fechagenerainv: string, bodegainv: number, tipoproductoinv: string,usuario:string,servidor:string, hdgcodigo:number, esacodigo:number, cmecodigo:number): Observable<InventarioDetalle[]> {

        return this._http.post<InventarioDetalle[]>(this.urlbuscainventario, {
            'fechagenerainv' : fechagenerainv,
            'bodegainv'      : bodegainv,
            'tipoproductoinv': tipoproductoinv,
            'usuario'        : usuario,
            'servidor'       : servidor,
            'hdgcodigo'      : hdgcodigo,
            'esacodigo'      : esacodigo,
            'cmecodigo'      : cmecodigo

        });
    }

    BuscaStockProd(hdgcodigo: number, esacodigo: number,cmecodigo:number, meinid: number, bodegaorigen: number,usuario:string,servidor:string): Observable<StockProducto[]> {
        return this._http.post<StockProducto[]>(this.urlBuscastock, {
           'hdgcodigo': hdgcodigo,
           'esacodigo': esacodigo,
           'cmecodigo': cmecodigo,
           'meinid'       : meinid,
           'bodegaorigen' : bodegaorigen,
           'usuario'      : usuario,
           'servidor'     : servidor
        });
    }

    GrabaConteoManual(paraminvmanual, servidor): Observable<InventarioDetalle[]> {
 
        return this._http.post<InventarioDetalle[]>(this.urlgrabainventario, {
            'paraminvmanual': paraminvmanual,
            'servidor': servidor,
        });
    }

    ActualizaInventario(paraminvactualiza): Observable<InventarioDetalle[]> {
        
        return this._http.post<InventarioDetalle[]>(this.urlactualizainventario, {
            'paraminvactualiza': paraminvactualiza

        });
    }

    AutorizaConteoInvenario(invid: number, usuario: string,observaciones:string, servidor: string): Observable<RetornaMensaje> {
      return this._http.post<RetornaMensaje>(this.urlautorizaConteoInvenario, {
        invid,
        usuario,
        observaciones,
        servidor
      });
    }
}