import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Solicitud } from '../models/entity/Solicitud';
import { DespachoSolicitud } from '../models/entity/DespachoSolicitud';
import { EventoSolicitud } from '../models/entity/EventoSolicitud';
import { OrigenSolicitud } from '../models/entity/OrigenSolicitud';
import { EventoDetalleSolicitud } from '../models/entity/EventoDetalleSolicitud';
import { EstadoSolicitud } from '../models/entity/EstadoSolicitud';
import { DespachoDetalleSolicitud } from '../models/entity/DespachoDetalleSolicitud';
import { ProductoRecepcionBodega } from '../models/entity/ProductoRecepcionBodega';
import { ParamDevolBodega } from '../models/entity/ParamDevolBodega';
import { MovimientosFarmacia } from '../models/entity/MovimientosFarmacia';
import { EstructuraReglas } from '../models/entity/estructura-reglas';
import { EstadoRecetaProg } from '../models/entity/EstadoRecetaProg';
import { ConsultaRecetaProgramada } from '../models/entity/ConsultaRecetaProgramada';
import { Receta } from '../models/entity/receta';
import { DetalleSolicitud } from '../models/entity/DetalleSolicitud';
import { DetallePlantillaConsumo } from  '../models/entity/detalle-plantilla-consumo';
import { DetallePlantillaBodega } from '../models/entity/DetallePlantillaBodega';

import { Detalleproducto } from '../models/producto/detalleproducto';
import { Detallelote } from '../models/entity/Detallelote';
import { SaldoLoteBodega } from '../models/entity/SaldoLoteBodega';
import { DetalleSolicitudConsumo } from '../models/entity/detalle-solicitud-consumo';
import { TipoRechazo } from '../models/entity/TipoRechazo';
import { CreacionReceta } from '../models/entity/CreacionReceta';
import { DatosProfesional } from '../models/entity/DatosProfesional';
import { DetalleRecetas } from '../models/entity/detalle-recetas';
import { ConfirmaStockBodSuministroEntrada } from '../models/confirmaStockBodSuministroEntrada';
import { ConfirmaStockBodSuministroSalida } from '../models/confirmaStockBodSuministroSalida';

@Injectable()
export class SolicitudService {
    public urlGenerarSolicitud   : string = sessionStorage.getItem('enlace').toString().concat('/grabarsolicitudes');

    public urlbuscasolic         : string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitudes');
    public urlbuscasolicitudcabecera : string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitudescabecera');

    public urlDespachosolicitud  : string = sessionStorage.getItem('enlace').toString().concat('/despachosolicitudbodega');
    public urlgrabarecepcion   : string = sessionStorage.getItem('enlace').toString().concat('/recepciondespachobodega');
    public urlDevolucionSolicitud : string = sessionStorage.getItem('enlace').toString().concat('/grabadevoluciones');
    public urlRecepcionDevolucion: string = sessionStorage.getItem('enlace').toString().concat('/recepciondevolucionbodega');
    public urlseleventosolicitud : string = sessionStorage.getItem('enlace').toString().concat('/seleventosolicitud');
    public urlselOrigensolicitud : string = sessionStorage.getItem('enlace').toString().concat('/selorigensolicitud');
    public urlseleventodetallesolicitud : string = sessionStorage.getItem('enlace').toString().concat('/seldeteventosolicitud');
    public urlprodrecepcionbodega : string = sessionStorage.getItem('enlace').toString().concat('/productosrecepcionbodega');
    public urlproddevuelvebodega  : string = sessionStorage.getItem('enlace').toString().concat('/productosdevolucionbodega');
    public urlproddespachobodega : string = sessionStorage.getItem('enlace').toString().concat('/productosdespachobodega');
    public target_url : string = sessionStorage.getItem('enlace').toString().concat('/estadosolicitud');
    public urlloteprodbod : string = sessionStorage.getItem('enlace').toString().concat('/lotesdelproddespachar');
    public urlloteprodpac   : string = sessionStorage.getItem('enlace').toString().concat('/lotesdelproddispensar');
    public urlbuscarreglas   : string = sessionStorage.getItem('enlace').toString().concat('/buscareglas');
    public urlentrerecptog  : string = sessionStorage.getItem('enlace').toString().concat('/seldiasentregarecetaprog');
    public urlconsultarecetaprog : string = sessionStorage.getItem('enlace').toString().concat('/selconsultarecetaprog');
    public urlbuscarrecetasficha : string = sessionStorage.getItem('enlace').toString().concat('/buscarrecetasficha');
    public urlbuscarrecetasfichamonitor : string = sessionStorage.getItem('enlace').toString().concat('/buscarrecetasfichamonitor');
    public urlbuscarrecetas      : string = sessionStorage.getItem('enlace').toString().concat('/buscarestructurarecetas');
    public urlbuscalotesfecha      : string = sessionStorage.getItem('enlace').toString().concat('/buscarLotedetalleplantilla');
    public urlDespachosolicautopedido:string = sessionStorage.getItem('enlace').toString().concat('/despacharautopedido');
    public urlproddespachobodutopedido: string = sessionStorage.getItem('enlace').toString().concat('/productosdespachoautopedido');
    public urlDevolucionSolicAutopedido: string = sessionStorage.getItem('enlace').toString().concat('/devolverautopedido');
    public urlprodrecepcionbodegatotal : string = sessionStorage.getItem('enlace').toString().concat('/productosrecepcionbodegatotal');
    public urlsaldolotebod  : string = sessionStorage.getItem('enlace').toString().concat('/getsaldolotesbodega');
    public urlbuscaporlikeelproducto : string = sessionStorage.getItem('enlace').toString().concat('/filtrosolicitudbodega');
    public urlAnulacionDespachosolicitud : string = sessionStorage.getItem('enlace').toString().concat('/anulaciondespachobodega');
    public urlrechazo: string = sessionStorage.getItem('enlace').toString().concat('/combotiporechazo');
    public urlbuscadetallesolic: string = sessionStorage.getItem('enlace').toString().concat('/buscasolicituddet');
    public urlvalidaestado: string = sessionStorage.getItem('enlace').toString().concat('/modestadosolicitud');
    public urlGeneraReceta: string = sessionStorage.getItem('enlace').toString().concat('/generareceta');
    public urlbuscaprof: string = sessionStorage.getItem('enlace').toString().concat('/buscaprofesional');
    public urlconfirmastockbodsuministro: string = sessionStorage.getItem('enlace').toString().concat('/confirmastockbodsuministro');
    public urlEliminaReceta: string = sessionStorage.getItem('enlace').toString().concat('/eliminareceta');
    public urlSolicitudesPendiente: string = sessionStorage.getItem('enlace').toString().concat('/solicitudespendiente');
    public urlAnularDispensacionReceta: string = sessionStorage.getItem('enlace').toString().concat('/anulardispensacionreceta');
    public urlbuscarrecetasmodal      : string = sessionStorage.getItem('enlace').toString().concat('/buscarestructurarecetasmodal');
    public urlbuscasolicitudescabeceramonitor : string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitudescabeceramonitor');

    constructor(public _http: HttpClient) {
    }

    buscarestructurarecetas(_Receta: Receta): Observable<Receta[]> {
        return this._http.post<Receta[]>(this.urlbuscarrecetas, _Receta)
    }

    buscarEncabezadoRecetas(_Receta: Receta): Observable<Receta[]> {
        return this._http.post<Receta[]>(this.urlbuscarrecetasficha, _Receta)
    }

    BuscarReglas(hdgcodigo: number,esacodigo:number,cmecodigo:number,reglatipo:string,reglatipobodega:string,
        bodegacodigo:number,idproducto:number,servidor:string):Observable<any>{
        return this._http.post<EstructuraReglas[]>(this.urlbuscarreglas, {
            'hdgcodigo' :hdgcodigo,
            'esacodigo' :esacodigo,
	        'cmecodigo' :cmecodigo,
	        'reglatipo':reglatipo,
	        'reglatipobodega' :reglatipobodega,
	        'bodegacodigo' :bodegacodigo,
	        'idproducto':idproducto,
	        'servidor' :servidor,
            });
    }

    crearSolicitud(varSolicitud: Solicitud): Observable<any> {
        return this._http.post(this.urlGenerarSolicitud, varSolicitud);
    }

    ModificaSolicitud(varSolicitud: Solicitud): Observable<any> {
        return this._http.post(this.urlGenerarSolicitud, varSolicitud
        );
    }

    EliminarSolicitud(varSolicitud: Solicitud): Observable<any> {
        return this._http.post(this.urlGenerarSolicitud, varSolicitud
        );
    }

    RecepcionaDispensacion(paramdespachos: DespachoDetalleSolicitud[]): Observable<any> {
        return this._http.post<any[]>(this.urlgrabarecepcion, {
            'paramdespachos': paramdespachos
        });
    }

    DespacharSolicitud(varDespachoSolicitud: DespachoSolicitud): Observable<any> {
        return this._http.post(this.urlDespachosolicitud, varDespachoSolicitud
        );
    }

    DevolucionSolicitud(paramdespachos: ParamDevolBodega): Observable<ParamDevolBodega> {
        return this._http.post( this.urlDevolucionSolicitud,paramdespachos);
    }

    RecepcionDevolucionBodegas(paramdespachos: ParamDevolBodega): Observable<ParamDevolBodega> {
        return this._http.post(this.urlRecepcionDevolucion,paramdespachos);
    }

    DespacharSolicitudAutopedido(varDespachoSolicitud: DespachoSolicitud): Observable<any> {
        return this._http.post(this.urlDespachosolicautopedido, varDespachoSolicitud
        );
    }

    DevolucionSolicitudAutopedido(paramdespachos: ParamDevolBodega): Observable<ParamDevolBodega> {
        return this._http.post( this.urlDevolucionSolicAutopedido,paramdespachos);
    }

    BuscaSolicitudCabecera(psbodid: number,phdgcodigo:number,pesacodigo:number,pcmecodigo:number,
        ptiposolicitud:number,pfechaini:string,pfechacfin:string,pbodegaorigen:number,
        pbodegadestino:number,pestcod:number, servidor: string,prioridad:number,
        ambito:number, unidadid:number, piezaid:number,camid:number,tipodocid:number,numdocpac:string,
        filtrodenegocio:string,soliorigen: number,usuario:string,codmei:string,meindescri:string,
        paginaorigen: number, codservicio:string, receid : number, tipoidentificacion : number,
        numeroidentificacion : string, nombrepaciente : string, apellidopaterno : string, apellidomaterno : string):Observable<Solicitud[]>{
        return this._http.post<Solicitud[]>(this.urlbuscasolicitudcabecera, {
            'psbodid'             : psbodid,
            'phdgcodigo'          : phdgcodigo,
            'pesacodigo'          : pesacodigo,
            'pcmecodigo'          : pcmecodigo,
            'ptiposolicitud'      : ptiposolicitud,
            'pfechaini'           : pfechaini,
            'pfechacfin'          : pfechacfin,
            'pbodegaorigen'       : pbodegaorigen,
            'pbodegadestino'      : pbodegadestino,
            'pestcod'             : pestcod,
            'servidor'            : servidor,
            'prioridad'           : prioridad,
            'ambito'              : ambito,
            'unidadid'            : unidadid,
            'piezaid'             : piezaid,
            'camid'               : camid,
            'TipDocId'            : tipodocid,
            'numdocpac'           : numdocpac,
            'filtrodenegocio'     : filtrodenegocio,
            'soliorigen'          : soliorigen,
            'usuario'             : usuario,
            'codmei'              : codmei,
            'meindescri'          : meindescri,
            'paginaorigen'        : paginaorigen,
            'codservicioactual'   : codservicio,
            'receid'              : receid,
            'tipoidentificacion'  : tipoidentificacion,
            'numeroidentificacion': numeroidentificacion,
            'nombrepaciente'      : nombrepaciente,
            'apellidopaterno'     : apellidopaterno,
            'apellidomaterno'     : apellidomaterno
            });
    }


    BuscaSolicitud(psbodid: number,phdgcodigo:number,pesacodigo:number,pcmecodigo:number,
        ptiposolicitud:number,pfechaini:string,pfechacfin:string,pbodegaorigen:number,
        pbodegadestino:number,pestcod:number, servidor: string,prioridad:number,
        ambito:number, unidadid:number, piezaid:number,camid:number,tipodocid:number,numdocpac:string,
        solorigen: number,codmei: string,meindescri: string,fecdevolucion?: string):Observable<Solicitud[]>{
        return this._http.post<Solicitud[]>(this.urlbuscasolic, {
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
            'servidor'      : servidor,
            'prioridad'     : prioridad,
            'ambito'        : ambito,
            'unidadid'      : unidadid,
            'piezaid'       : piezaid,
            'camid'         : camid,
            'TipDocId'      : tipodocid,
            'numdocpac'     : numdocpac,
            'soliorigen'    : solorigen,
            'codmei'        : codmei,
            'meindescri'    : meindescri,
            'fecdevolucion' : fecdevolucion
            });
    }

    BuscaProductoDespachoBodega(hdgcodigo:number,esacodigo:number,cmecodigo:number,servidor: string,
        soliid:number,codmei:string,lote:string,fechavto:string
        ):Observable<ProductoRecepcionBodega[]>{
        return this._http.post<ProductoRecepcionBodega[]>(this.urlproddespachobodega, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'servidor'  : servidor,
            'soliid'    : soliid,
            'codmei'    : codmei,
            'lote'      : lote,
            'fechavto'  : fechavto

        });
    }

    BuscaProductoRecepcionBodega(hdgcodigo:number,esacodigo:number,cmecodigo:number,servidor: string,
        soliid:number,codmei:string,lote:string,fechavto:string
        ):Observable<ProductoRecepcionBodega[]>{

        return this._http.post<ProductoRecepcionBodega[]>(this.urlprodrecepcionbodega, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'servidor'  : servidor,
            'soliid'    : soliid,
            'codmei'    : codmei,
            'lote'      : lote,
            'fechavto'  : fechavto

        });
    }

    BuscaProductoRecepcionBodegaTotal(hdgcodigo:number,esacodigo:number,cmecodigo:number,servidor: string,
        soliid:number):Observable<ProductoRecepcionBodega[]>{

        return this._http.post<ProductoRecepcionBodega[]>(this.urlprodrecepcionbodegatotal, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'servidor'  : servidor,
            'soliid'    : soliid

        });
    }

    BuscaProductosDevueltosBodega(hdgcodigo:number,esacodigo:number,cmecodigo:number,servidor: string,
        soliid:number,codmei:string,lote:string,fechavto:string):Observable<ProductoRecepcionBodega[]>{

        return this._http.post<ProductoRecepcionBodega[]>(this.urlproddevuelvebodega, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'servidor'  : servidor,
            'soliid'    : soliid,
            'codmei'    : codmei,
            'lote'      : lote,
            'fechavto'  : fechavto

        });
    }

    BuscaProductoDespachoBodegaAutopedido(hdgcodigo:number,esacodigo:number,cmecodigo:number,servidor: string,
        soliid:number,codmei:string,lote:string,fechavto:string
        ):Observable<ProductoRecepcionBodega[]>{
        return this._http.post<ProductoRecepcionBodega[]>(this.urlproddespachobodutopedido, {
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'servidor'  : servidor,
            'soliid'    : soliid,
            'codmei'    : codmei,
            'lote'      : lote,
            'fechavto'  : fechavto

        });
    }

    BuscaEventosSolicitud(hdgcodigo: number, esacodigo: number,cmecodigo:number,solid: number, servidor: string):Observable<EventoSolicitud[]>{
        return this._http.post<EventoSolicitud[]>(this.urlseleventosolicitud, {
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'solid'         : solid,
            'servidor'      : servidor
        });
    }

    BuscaEventoDetalleSolicitud(hdgcodigo: number, esacodigo: number, cmecodigo: number, solid: number, sodeid:number, servidor: string):Observable<EventoDetalleSolicitud[]>{
        return this._http.post<EventoDetalleSolicitud[]>(this.urlseleventodetallesolicitud, {
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'solid'         : solid,
            'sodeid'        : sodeid,
            'servidor'      : servidor
        });
    }

    public ListaOrigenSolicitud(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario:string, servidor:string,origen: number): Observable<OrigenSolicitud[]> {
        return this._http.post<OrigenSolicitud[]>(this.urlselOrigensolicitud,{
         'hdgcodigo'     : hdgcodigo,
         'esacodigo'     : esacodigo,
         'cmecodigo'     : cmecodigo,
         'usuario' : usuario,
         'servidor': servidor,
         'origen'  : origen
        });
    }

    public list(usuario:string,servidor:string): Observable<EstadoSolicitud[]> {
        return this._http.post<EstadoSolicitud[]>(this.target_url,{
          'usuario' : usuario,
          'servidor': servidor
        });
    }

    BuscaLotesProductosxBod(servidor:string,hdgcodigo:number,esacodigo:number,cmecodigo:number,
        codmei:string,bodorigen:number,boddestino:number): Observable<Detallelote[]> {

        return this._http.post<Detallelote[]>(this.urlloteprodbod, {
            'servidor'      : servidor,
            'hdgcodigo'     : hdgcodigo,
            'esacodigo'     : esacodigo,
            'cmecodigo'     : cmecodigo,
            'codmei'        : codmei,
            'bodorigen'     : bodorigen,
            'boddestino'    : boddestino
        });
    }

    BuscaLotesProductosxPac(servidor:string,hdgcodigo:number,esacodigo:number,cmecodigo:number,
        codmei:string,bodorigen:number,boddestino:number,cliid: number): Observable<Detallelote[]> {

        return this._http.post<Detallelote[]>(this.urlloteprodpac, {
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

    public EntregaRecetaProg(hdgcodigo:number,esacodigo:number,cmecodigo:number, usuario:string,servidor:string): Observable<EstadoRecetaProg[]> {
        return this._http.post<EstadoRecetaProg[]>(this.urlentrerecptog,{
          'hdgcodigo'     : hdgcodigo,
          'esacodigo'     : esacodigo,
          'cmecodigo'     : cmecodigo,
          'usuario' : usuario,
          'servidor': servidor
        });
    }

    public ConsultaRecetaProgramada(hdgcodigo: number, esacodigo:number,cmecodigo:number,
        servidor:string,usuario:string,cliid: number): Observable<ConsultaRecetaProgramada[]> {
        return this._http.post<ConsultaRecetaProgramada[]>(this.urlconsultarecetaprog,{
          'hdgcodigo': hdgcodigo,
          'esacodigo': esacodigo,
          'cmecodigo': cmecodigo,
          'servidor': servidor,
          'usuario' : usuario,
          'cliid'   : cliid
        });
    }

    public buscarLotedetalleplantilla(_Solicitud: Solicitud): Observable<Detalleproducto[]> {
        return this._http.post<Detalleproducto[]>(this.urlbuscalotesfecha, _Solicitud)
    }

    BuscaSaldoLoteBodega(servidor: string,hdgcodigo:number,cmecodigo:number,idbodega:number,
        idproducto:number,lote:string,fechavencimiento:string ):Observable<SaldoLoteBodega[]>{
        return this._http.post<SaldoLoteBodega[]>(this.urlsaldolotebod, {
            'servidor'       : servidor,
            'hdgcodigo'      : hdgcodigo,
            'cmecodigo'      : cmecodigo,
            'idbodega'       : idbodega,
            'idproducto'     : idproducto,
            'lote'           : lote,
            'fechavencimiento': fechavencimiento,

            });
    }
    // ,
    // filtrodetallereceta: DetalleRecetas[]
    public BuscarProductoPorLike(hdgcodigo:number, esacodigo:number,cmecodigo:number,
        codmei:string,codtipo: number ,usuario:string,servidor:string,
        filtrodetallesolicitud:DetalleSolicitud[],
        filtrodetalleplantillaConsumo: DetallePlantillaConsumo[],
        filtrodetalleplantillabodega: DetallePlantillaBodega[],
        filtrodetallesolicitudconsumo: DetalleSolicitudConsumo[],
        filtrodetallereceta: DetalleRecetas[]): Observable<any[]> {
        return this._http.post<any[]>(this.urlbuscaporlikeelproducto,{
            'hdgcodigo' : hdgcodigo,
            'esacodigo' : esacodigo,
            'cmecodigo' : cmecodigo,
            'codmei'    : codmei,
            'codtipo'   : codtipo,
            'usuario'   : usuario,
            'servidor'  : servidor,
            'filtrodetallesolicitud': filtrodetallesolicitud,
            'filtrodetalleplantillaConsumo': filtrodetalleplantillaConsumo,
            'filtrodetalleplantillabodega' : filtrodetalleplantillabodega,
            'filtrodetallesolicitudconsumo': filtrodetallesolicitudconsumo,
            'filtrodetallereceta'          : filtrodetallereceta
        } )
    }

    AnularDespachoSolicitud(varDespachoSolicitud: DespachoSolicitud): Observable<any> {
        return this._http.post(this.urlAnulacionDespachosolicitud, varDespachoSolicitud
        );
    }

    public TipoRechazo(hdgcodigo: number, esacodigo: number,cmecodigo:number,
        servidor:string): Observable<TipoRechazo[]> {
        return this._http.post<TipoRechazo[]>(this.urlrechazo,{
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'servidor': servidor
        });
    }

    BuscaSolicitudDetalle(soliid: number,usuario: string ,servidor: string):Observable<DetalleSolicitud[]>{
        return this._http.post<DetalleSolicitud[]>(this.urlbuscadetallesolic, {
            'soliid'   : soliid,
            'usuario'  : usuario,
            'servidor' : servidor

            });
    }

    ValidaEstadoSolicitudCargada(soliid: number,soliestado: number ,servidor: string,
        receestado: string,receid: number,bandera:number):Observable<any>{
        return this._http.post<any>(this.urlvalidaestado, {
            'soliid'   : soliid,
            'soliestado': soliestado,
            'receestado': receestado,
            'servidor' : servidor,
            'receid'   : receid,
            'bandera'  : bandera
            });
    }

    CrearReceta(varSolicitud: CreacionReceta): Observable<any> {
        return this._http.post(this.urlGeneraReceta, varSolicitud);
    }

    BuscaProfesional(servidor: string,codtipidentificacion: number,
        clinumidentificacion: string, paternoprof: string, maternoprof:string,
        nombresprof: string ):Observable<DatosProfesional[]>{
        return this._http.post<DatosProfesional[]>(this.urlbuscaprof, {
            'servidor' : servidor,
            'codtipidentificacion' : codtipidentificacion,
            'clinumidentificacion'  : clinumidentificacion,
            'paternoprof'           : paternoprof,
            'maternoprof'           : maternoprof,
            'nombresprof'           : nombresprof

            });
    }

    ConfirmaStockBodSuministro(datos: ConfirmaStockBodSuministroEntrada):Observable<ConfirmaStockBodSuministroSalida>{
        return this._http.post<ConfirmaStockBodSuministroSalida>(this.urlconfirmastockbodsuministro, datos);
    }

  buscarEncabezadoRecetasMonitor(_Receta: Receta): Observable<Receta[]> {
    return this._http.post<Receta[]>(this.urlbuscarrecetasfichamonitor, _Receta)
  }

  EliminarReceta(varSolicitud: CreacionReceta): Observable<any> {
  return this._http.post(this.urlEliminaReceta, varSolicitud);
  }

  BuscarSolicitudesPendiente(servidor:string, hdgcodigo:number,esacodigo:number,cmecodigo:number,usuario:string):Observable<any> {
    return this._http.post(this.urlSolicitudesPendiente,{
      'servidor' : servidor,
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'usuario' : usuario
    });
  }

  AnularDispensacionReceta(servidor:string, hdgcodigo:number,
    esacodigo:number,cmecodigo:number,usuario:string,soliid:number,receid:number,motivo:string):Observable<any> {
    return this._http.post(this.urlAnularDispensacionReceta,{
      'servidor' : servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario'  : usuario,
      'soliid'   : soliid,
      'receid'   : receid,
      'motivo'   : motivo
    });
  }

  buscarestructurarecetasmodal(_Receta: Receta): Observable<Receta[]> {
    return this._http.post<Receta[]>(this.urlbuscarrecetasmodal, _Receta)
  }

BuscaSolicitudCabeceraMonitor(phdgcodigo:number,pesacodigo:number,pcmecodigo:number,
  pfechaini:string,pfechacfin:string,servidor: string,usuario:string):Observable<Solicitud[]>{
  return this._http.post<Solicitud[]>(this.urlbuscasolicitudescabeceramonitor, {
      'phdgcodigo'          : phdgcodigo,
      'pesacodigo'          : pesacodigo,
      'pcmecodigo'          : pcmecodigo,
      'pfechaini'           : pfechaini,
      'pfechacfin'          : pfechacfin,
      'servidor'            : servidor,
      'usuario'             : usuario
      });
  }
}
