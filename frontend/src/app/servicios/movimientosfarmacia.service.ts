import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { MovimientosFarmacia } from '../models/entity/MovimientosFarmacia';
import { HttpClient } from '@angular/common/http';
import { BodegaCargo } from '../models/entity/BodegaCargo';
import { BodegaDestino } from '../models/entity/BodegaDestino';
import { environment } from '../../environments/environment';
import { EnvioMovimientosDevolucion } from '../models/entity/EnvioMovimientosFarmaciaDetDevol'
import { ValidaCantidadDevuelta } from '../models/entity/ValidaCantidadDevuelta';


@Injectable()

export class MovimientosfarmaciaService {
    public url                  : string = sessionStorage.getItem('enlace').toString().concat('/movimientosfarmacia');
    public url_guardaMovimiento : string = sessionStorage.getItem('enlace').toString().concat('/grabarmovimientos');
    public urlbodegacargo       : string = sessionStorage.getItem('enlace').toString().concat('/bodegascargo');
    public urlbodegadestino     : string = sessionStorage.getItem('enlace').toString().concat('/bodegasdestino');
    public urlRecuperaMovimiento: string = sessionStorage.getItem('enlace').toString().concat('/buscamovimientos');
    public urlguardarDetalleDevolucuines : string = sessionStorage.getItem('enlace').toString().concat('/grabarmovimientosdevol');
    public urlloteprod          : string = sessionStorage.getItem('enlace').toString().concat('/lotesdelprodpac');
    public urlvalidacantdevolver: string = sessionStorage.getItem('enlace').toString().concat('/validacantdevuelvepac');
    public urlguardaMovimiento : string = sessionStorage.getItem('enlace').toString().concat('/grabarmovimientosfarmacia');
    public urlloteprodbod       : string = sessionStorage.getItem('enlace').toString().concat('/lotesdelprodbod');
    public urlvalidacantdevolverbod : string = sessionStorage.getItem('enlace').toString().concat('/validacantdevuelvebod');

    constructor(public _http: HttpClient) {

    }  

    BodegasCargo(hdgcodigo: number, esacodigo: number,cmecodigo:number,usuario:string,servidor:string
        ):Observable<BodegaCargo[]> {
        
        return this._http.post<BodegaCargo[]>(this.urlbodegacargo, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BodegasDestino(hdgcodigo: number, esacodigo: number,cmecodigo:number,usuario:string,servidor:string):Observable<BodegaDestino[]> {
       
        return this._http.post<BodegaDestino[]>(this.urlbodegadestino, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaListaMovimietos(hdgcodigo: number, esacodigo: number,cmecodigo:number,tipomov: number,
        fechamovdesde: string, fechamovhasta: string, movimfarid: number, movimfecha: string, cliid :number,
        usuario:string,servidor:string): Observable<MovimientosFarmacia[]> {
        return this._http.post<MovimientosFarmacia[]>(this.url, {
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'tipomov'       : tipomov,
            'fechamovdesde' : fechamovdesde,
            'fechamovhasta' : fechamovhasta,
            'movimfarid'    : movimfarid,
            'movimfecha'    : movimfecha,
            'cliid'         : cliid, 
            'usuario'       : usuario,
            'servidor'      : servidor
        });
    }

    RecuperaMovimiento(hdgcodigo: number, esacodigo: number,cmecodigo:number, movimfarid:number, usuario:string,servidor:string  ): Observable<MovimientosFarmacia[]> {
        return this._http.post<MovimientosFarmacia[]>(this.urlRecuperaMovimiento, {
            'hdgcodigo'      : hdgcodigo,
            'esacodigo'      : esacodigo,
            'cmecodigo'      : cmecodigo,
            'movimfarid'     : movimfarid,
            'usuario'        : usuario,
            'servidor'       : servidor,
           });
    }

    GuardarMovimietos(MovimientosFarmacia:MovimientosFarmacia): Observable<MovimientosFarmacia[]> {
        return this._http.post<MovimientosFarmacia[]>(this.url_guardaMovimiento,MovimientosFarmacia);
    }

    GuardarMovimietosDevoluciones(EnvioMovimientosFarmaciaDetDevol:EnvioMovimientosDevolucion): Observable<EnvioMovimientosDevolucion[]> {
        return this._http.post<EnvioMovimientosDevolucion[]>(this.urlguardarDetalleDevolucuines,EnvioMovimientosFarmaciaDetDevol);
    }

    BuscaLotesProductos(servidor:string,hdgcodigo:number,esacodigo:number,cmecodigo:number,
        codmei:string,bodorigen:number,boddestino:number,cliid:number): Observable<MovimientosFarmacia[]> {
  
        return this._http.post<MovimientosFarmacia[]>(this.urlloteprod, {
            'servidor'      : servidor,
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'codmei'        : codmei,
            'bodorigen'     : bodorigen,
            'boddestino'    : boddestino,
            'cliid'         : cliid
           });
    }

    BuscaLotesProductosBodega(servidor:string,hdgcodigo:number,esacodigo:number,cmecodigo:number,
        codmei:string,bodorigen:number,boddestino:number): Observable<MovimientosFarmacia[]> {
        return this._http.post<MovimientosFarmacia[]>(this.urlloteprodbod, {
            'servidor'      : servidor,
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'codmei'        : codmei,
            'bodorigen'     : bodorigen,
            'boddestino'    : boddestino
           });
    }

    ValidaCantDevolver(servidor:string,hdgcodigo:number,esacodigo:number,cmecodigo:number,cliid:number,
        codmei:string,lote:string,cantidadadevolver:number,): Observable<ValidaCantidadDevuelta> {
        return this._http.post<ValidaCantidadDevuelta>(this.urlvalidacantdevolver, {
            'servidor'      : servidor,
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'codmei'        : codmei,
            'lote'          : lote,
            'cantidadadevolver' : cantidadadevolver,
            'cliid'         : cliid
           });
    }

    ValidaCantDevolverBod(servidor:string,hdgcodigo:number,esacodigo:number,bodorigen:number,
        boddestino:number, cmecodigo:number,codmei:string,lote:string,cantidadadevolver:number,): Observable<ValidaCantidadDevuelta> {
        return this._http.post<ValidaCantidadDevuelta>(this.urlvalidacantdevolverbod, {
            'servidor'      : servidor,
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'codmei'        : codmei,
            'lote'          : lote,
            'cantidadadevolver' : cantidadadevolver,
            'bodorigen'     : bodorigen,
            'boddestino'    : boddestino
           });
    }

    GrabaMovimiento(MovimientosFarmacia:MovimientosFarmacia): Observable<MovimientosFarmacia[]> {
        return this._http.post<MovimientosFarmacia[]>(this.urlguardaMovimiento,MovimientosFarmacia);
    }

  }