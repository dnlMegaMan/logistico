import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BodegaDestino } from '../models/entity/BodegaDestino';
import { BodegaCargo } from '../models/entity/BodegaCargo';
import { BodegasTodas } from '../models/entity/BodegasTodas';
import { BodegasrelacionadaAccion } from '../models/entity/BodegasRelacionadas';
import { Bodegas }  from '../models/entity/Bodegas';
import { Servicio } from '../models/entity/Servicio';
import { ParamGrabaproductosaBodega } from '../models/entity/ParamGrabaProductosaBodega';
import { Plantillas } from 'src/app/models/entity/PlantillasBodegas';
import { BodegasDespachadoras } from '../models/entity/BodegasDespachadoras';
import { ProductoAFraccionar } from '../models/entity/ProductoAFraccionar';
import { ProductoFraccionado } from '../models/entity/ProductoFraccionado';
import { GrabaProductoFraccionado } from '../models/entity/GrabaProductoFraccionado';
import { EliminaProductoFraccionado } from '../models/entity/EliminaProductoFraccionado';
import { BodegasPorServicio } from '../models/entity/BodegasPorServcio';
import { EstructuraBodega } from '../models/entity/estructura-bodega';
import { TipoParametro }   from '../models/entity/tipo-parametro';
import { ServicioUnidadBodegas } from '../models/entity/servicio-unidad-bodegas';
import { ProductosBodegas } from '../models/entity/productos-bodegas';
import { BodegaSolicitante } from '../models/entity/bodega-solicitante';
import { ControlStockMinimo } from '../models/entity/control-stock-minimo';
import { RetornaMensaje } from '../models/entity/RetornaMensaje';
import { BodegasControladas } from '../models/entity/BodegasControladas';
import { UsuariosBodegas } from '../models/entity/usuarios-bodegas';
import { TipoRelacionBodega } from '../models/entity/tipo-relacion-bodega';
import { EstructuraRelacionBodega } from '../models/entity/estructura-relacion-bodega';
import { LibroControlado } from '../models/entity/LibroControlado';
import { EstructuraBodegaServicio } from '../models/entity/estructura-bodega-servicio';
import { ConsultaFraccionado } from '../models/entity/ConsultaFraccionamiento';
import { BodegasFraccionables } from '../models/entity/BodegasFraccionables';
import { DevolucionFraccionado } from '../models/entity/DevolucionFraccionado';
import { DevolucionFraccionamiento } from '../models/entity/DevolucionFraccionamiento';
import { TipoPedidoPlantillaBodega } from '../models/entity/TipoPedidoPlantillaBodega';
import { BuscaLotesSistema } from '../models/entity/BuscaLotesSistema';
import { DetalleConsultaConsumoLote } from '../models/entity/DetalleConsultaConsumoLote';
import { ListaCobros } from '../models/entity/ListaCobro';
import { Mensaje } from '../models/entity/Mensaje';
import { BodegaMantenedorReglas } from '../models/entity/bodega-mantenedor-reglas';
import { BodegaConLote } from '../models/entity/bodega-con-lote';


@Injectable()

export class BodegasService {

  public urltodos: string = sessionStorage.getItem('enlace').toString().concat('/bodegascargo');
  public urlbodegacargo: string = sessionStorage.getItem('enlace').toString().concat('/selbodegasolicitante');
  public urlbodegadestino: string = sessionStorage.getItem('enlace').toString().concat('/selbodegasuministro');
  public urlbodegasTodas: string = sessionStorage.getItem('enlace').toString().concat('/selbodegasolicitante');
  public urlcombobodegadevpac: string = sessionStorage.getItem('enlace').toString().concat('/combobodegadevpac');

  public urlbodegasSuministro: string = sessionStorage.getItem('enlace').toString().concat('/selbodegasuministro');
  public urlSuminostroaorigen: string = sessionStorage.getItem('enlace').toString().concat('/selsuministroaorigen');

  public urlprodxbodega      : string = sessionStorage.getItem('enlace').toString().concat('/productosxbodega');
  public urlservicio         : string = sessionStorage.getItem('enlace').toString().concat('/servicios');
  public urlgrababodeganueva : string = sessionStorage.getItem('enlace').toString().concat('/grababodega');
  public urlasociabodservi   : string = sessionStorage.getItem('enlace').toString().concat('/asociaservicioabodega');

  public urlgrabaprodabod    : string = sessionStorage.getItem('enlace').toString().concat('/grabarproductosabod');
  public urlcreaplantilla :string =  sessionStorage.getItem('enlace').toString().concat('/grabarplantillas');

  public urlbuscaplant :string =  sessionStorage.getItem('enlace').toString().concat('/buscaplantillas');
  public urlbuscaplantillascabecera :string =  sessionStorage.getItem('enlace').toString().concat('/buscaplantillascabecera');

  public urlbuscaboddespachadora: string = sessionStorage.getItem('enlace').toString().concat('/bodegasdespachadoras');
  public urlproductosafraccionar: string = sessionStorage.getItem('enlace').toString().concat('/productosafraccionar');
  public urlproductosafraccionados : string = sessionStorage.getItem('enlace').toString().concat('/productosfraccionados');
  public urlfraccion   :string = sessionStorage.getItem('enlace').toString().concat('/grabafraccionados');
  public urleliminafraccionado : string = sessionStorage.getItem('enlace').toString().concat('/eliminafraccionados');
  public urlajustestock     : string = sessionStorage.getItem('enlace').toString().concat('/creaajustestockmanual');
  public urlbodegaxservicio : string = sessionStorage.getItem('enlace').toString().concat('/traebodegasxservicios');

  public urleliminaprodabod     : string = sessionStorage.getItem('enlace').toString().concat('/eliminarproductosabod');

  public urlbuscarEstructuraBodegas : string = sessionStorage.getItem('enlace').toString().concat('/buscarEstructuraBodegas');
  public urlbuscarCabeceraBodegas : string = sessionStorage.getItem('enlace').toString().concat('/buscarcabecerabodegas');

  public urlguardarEstructuraBodegas: string = sessionStorage.getItem('enlace').toString().concat('/grabarestructurabodega')
  public urllistatipobodega         : string = sessionStorage.getItem('enlace').toString().concat('/listatipobodega');
  public urllistatipoproducto       : string = sessionStorage.getItem('enlace').toString().concat('/listatipoproducto');
  public urlbuscabodcontrolada      : string = sessionStorage.getItem('enlace').toString().concat('/bodegascontrolados');
  public urldesasociaServicioBodega : string = sessionStorage.getItem('enlace').toString().concat('/desasociaservicioabodega');

  public urlbuscabodegacontrolSyckminimo : string = sessionStorage.getItem('enlace').toString().concat('/buscabodegacontrolstockminimo');

  public urldesasociaUsuarioBodega: string = sessionStorage.getItem('enlace').toString().concat('/desasociausuarioabodega');

  public urlistaTipoRelacionBodega: string = sessionStorage.getItem('enlace').toString().concat('/listartiporelacionbodegas');

  public urldesasociaRelacionBodega: string = sessionStorage.getItem('enlace').toString().concat('/desasociarelacionbodega');
  public urlprodbodegakardex  : string = sessionStorage.getItem('enlace').toString().concat('/selcierrekardexbodinv');

  public urlbodegadespachareceta : string = sessionStorage.getItem('enlace').toString().concat('/selbodegadespachareceta');

  public urlListaEstructuraServicioBodegas : string = sessionStorage.getItem('enlace').toString().concat('/ListaEstructuraServicioBodegas');
  public urlconsultafraccion : string = sessionStorage.getItem('enlace').toString().concat('/selConsultaFraccionamiento')
  public urlbuscabodfraccionable:string = sessionStorage.getItem('enlace').toString().concat('/selbodegafraccionable');
  public urldevolfraccion : string = sessionStorage.getItem('enlace').toString().concat('/devolucionfraccionado')
  public urlbuscapedido   : string = sessionStorage.getItem('enlace').toString().concat('/tipopedidoplantillabodega');
  public urlbuscalotessist : string = sessionStorage.getItem('enlace').toString().concat('/buscalotes');
  public urlbuscaprodporlote: string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporlote');
  public urlconsumolote : string = sessionStorage.getItem('enlace').toString().concat('/consultaconsumolotes');
  public urlBuscaBodegasConLotes : string = sessionStorage.getItem('enlace').toString().concat('/consultabodegalotes');
  public urlbuscalistacobros : string = sessionStorage.getItem('enlace').toString().concat('/obtenerlistacobromedicamento');
  public urlfactorconversionproducto : string = sessionStorage.getItem('enlace').toString().concat('/grabarfactorconversionproducto');
  public urlBodegasMantenedorDeReglas: string = sessionStorage.getItem('enlace').toString().concat('/buscabodegasmantenedorreglas');


  constructor(private _http: HttpClient) {

  }

  buscarBodegasMantenedorReglas(
    hdgcodigo:number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string,
  ): Observable<BodegaMantenedorReglas[]> {
    return this._http.post<BodegaMantenedorReglas[]>(this.urlBodegasMantenedorDeReglas, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      usuario,
      servidor,
    });
  }

  ListaEstructuraServicioBodegas(BodegaServivio: EstructuraBodegaServicio): Observable<EstructuraBodegaServicio[]> {
    return this._http.post<EstructuraBodegaServicio[]>(this.urlListaEstructuraServicioBodegas,BodegaServivio);
}


  listarTipoRelacionBodegas(hdgcodigo:number,cmecodigo : number, esacodigo: number, servidor : string, usuario:string): Observable<TipoRelacionBodega[]> {
    return this._http.post<TipoRelacionBodega[]>(this.urlistaTipoRelacionBodega,{
    hdgcodigo: hdgcodigo,
    cmecodigo: cmecodigo,
    esacodigo: esacodigo,
    servidor : servidor
    });
  }

  buscabodegacontrolstockminimo(hdgcodigo:number, esacodigo:number,cmecodigo:number,usuario:string,servidor:string,fechainicio:string,fechatermino:string,idbodegasolicita:number, idbodegasuministro:number,idarticulo:number):
  Observable<ControlStockMinimo[]> { return  this._http.post<ControlStockMinimo[]>(this.urlbuscabodegacontrolSyckminimo,{
    hdgcodigo: hdgcodigo,
    esacodigo: esacodigo,
    cmecodigo: cmecodigo,
    usuario : usuario ,
    servidor : servidor,
    fechainicio : fechainicio,
    fechatermino : fechatermino,
    idbodegasolicita : idbodegasolicita,
    idbodegasuministro: idbodegasuministro,
    idarticulo : idarticulo,
  });
}


desasociaBodegaEstructuraBodegas(hdgcodigo:number,cmecodigo : number,codbodegaorigen : number,codbodegarelacion:number, servidor : string, usuario:string): Observable<EstructuraRelacionBodega[]> {
  return this._http.post<EstructuraRelacionBodega[]>(this.urldesasociaRelacionBodega,{
  hdgcodigo: hdgcodigo,
  cmecodigo: cmecodigo,
  codbodegaorigen: codbodegaorigen,
  codbodegarelacion:codbodegarelacion,
  usuario:usuario,
  servidor : servidor
  });
}


desasociaUsuarioEstructuraBodegas(hdgcodigo:number,cmecodigo : number, esacodigo : number, bodegacodigo : number,userid : number, bouid:number, servidor : string, usuario:string): Observable<UsuariosBodegas[]> {
  return this._http.post<UsuariosBodegas[]>(this.urldesasociaUsuarioBodega,{
  hdgcodigo: hdgcodigo,
  cmecodigo: cmecodigo,
  esacodigo : esacodigo,
  bodegacodigo: bodegacodigo,
  userid: userid,
  bouid:bouid,
  usuario:usuario,
  servidor : servidor
  });
}


  desasociaServicioEstructuraBodegas(hdgcodigo:number,cmecodigo : number,codbodega : number,idservicio : number, servidor : string, usuario:string): Observable<ServicioUnidadBodegas[]> {
    return this._http.post<ServicioUnidadBodegas[]>(this.urldesasociaServicioBodega,{
    hdgcodigo: hdgcodigo,
    cmecodigo: cmecodigo,
    codbodega: codbodega,
    idservicio: idservicio,
    usuario:usuario,
    servidor : servidor
    });
  }


  listatipobodega(hdgcodigo:number, cmecodigo : number, esacodigo : number, usuario : string, servidor : string): Observable<TipoParametro[]> {
    return this._http.post<TipoParametro[]>(this.urllistatipobodega,{
    hdgcodigo: hdgcodigo,
    cmecodigo: cmecodigo,
    esacodigo : esacodigo,
    usuario: usuario,
    servidor : servidor
    });
  }

  listatipoproducto(hdgcodigo:number, cmecodigo : number, esacodigo : number, usuario : string, servidor : string): Observable<TipoParametro[]> {
    return this._http.post<TipoParametro[]>(this.urllistatipoproducto,{
    hdgcodigo: hdgcodigo,
    cmecodigo: cmecodigo,
    esacodigo : esacodigo,
    usuario: usuario,
    servidor : servidor
    });
  }

  listaEstructuraBodegas(hdgcodigo:number,cmecodigo : number,codbodega : number,
    fbocodigobodega:string, desbodega : string,estado : string,tipoproducto : string,
    tipobodega : string, usaurio : string,servidor : string, codmei : string
    ): Observable<EstructuraBodega[]> {
    return this._http.post<EstructuraBodega[]>(this.urlbuscarEstructuraBodegas,{
    hdgcodigo: hdgcodigo,
    cmecodigo: cmecodigo,
    codbodega: codbodega,
    fbocodigobodega: fbocodigobodega,
    desbodega: desbodega,
    estado   : estado,
    tipoproducto : tipoproducto,
    tipobodega : tipobodega,
    usuario   : usaurio,
    servidor : servidor,
    codmei: codmei
    });
  }


  listaCabeceraBodegas(hdgcodigo:number,cmecodigo : number, esacodigo : number, codbodega : number,fbocodigobodega: string,desbodega : string,estado : string,tipoproducto : string,tipobodega : string, usaurio : string,servidor : string
    ): Observable<EstructuraBodega[]> {
    return this._http.post<EstructuraBodega[]>(this.urlbuscarCabeceraBodegas,{
    hdgcodigo: hdgcodigo,
    cmecodigo: cmecodigo,
    codbodega: codbodega,
    esacodigo : esacodigo,
    fbocodigobodega: fbocodigobodega,
    desbodega: desbodega,
    estado   : estado,
    tipoproducto : tipoproducto,
    tipobodega : tipobodega,
    usuario   : usaurio,
    servidor : servidor
    });
  }

  guardarEstructuraBodegas(Bodega: EstructuraBodega): Observable<any> {
    return this._http.post(this.urlguardarEstructuraBodegas,Bodega);
}




  grabaEstructuraBodegas(hdgcodigo:number,cmecodigo : number,codbodega : number,desbodega : string,estado : string,tipoproducto : string,tipobodega : string, servidor : string
    ): Observable<EstructuraBodega[]> {
    return this._http.post<EstructuraBodega[]>(this.urlbuscarEstructuraBodegas,{
    hdgcodigo: hdgcodigo,
    cmecodigo: cmecodigo,
    codbodega: codbodega,
    desbodega: desbodega,
    estado   : estado,
    tipoproducto : tipoproducto,
    tipobodega : tipobodega,
    servidor : servidor
    });
  }



  listaBodegaCargoTodas(usuario: string, servidor: string): Observable<BodegaCargo[]> {
    return this._http.post<BodegaCargo[]>(this.urltodos, {
      'usuario': usuario,
      'servidor': servidor
    });
  }


   listaBodegaCargoSucursal(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string
  ): Observable<BodegaCargo[]> {
        return this._http.post<BodegaCargo[]>(this.urlbodegacargo, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario': usuario,
      'servidor': servidor
    });
  }

   listaBodegaDestinoSucursal(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string): Observable<BodegaDestino[]> {
       return this._http.post<BodegaDestino[]>(this.urlbodegasTodas, {//this.urlbodegadestino
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario': usuario,
      'servidor': servidor
    });
  }

  listaBodegaTodasSucursal(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string): Observable<BodegasTodas[]> {
    return this._http.post<BodegasTodas[]>(this.urlbodegasTodas, {
   'hdgcodigo': hdgcodigo,
   'esacodigo': esacodigo,
   'cmecodigo': cmecodigo,
   'usuario': usuario,
   'servidor': servidor
    });
  }

  listaBodegaDespachoReceta(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string,
    servidor: string,): Observable<BodegasTodas[]> {
    return this._http.post<BodegasTodas[]>(this.urlbodegadespachareceta, {
   'hdgcodigo': hdgcodigo,
   'esacodigo': esacodigo,
   'cmecodigo': cmecodigo,
   'usuario': usuario,
   'servidor': servidor
    });
  }

  listaBodegaRelacionadaAccion(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string, bodcodigosolicita:number, tiporegori:number): Observable<BodegasrelacionadaAccion[]> {
    return this._http.post<BodegasrelacionadaAccion[]>(this.urlbodegasSuministro, {
      'hdgcodigo'         : hdgcodigo,
      'esacodigo'         : esacodigo,
      'cmecodigo'         : cmecodigo,
      'usuario'           : usuario,
      'servidor'          : servidor,
      'bodcodigosolicita' :bodcodigosolicita,
      'tiporegori'        :tiporegori
    });
  }

  listaBodegaOrigenAccion(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string, bodcodigosolicita:number, tiporegori:number): Observable<BodegaSolicitante[]> {
    return this._http.post<BodegaSolicitante[]>(this.urlSuminostroaorigen, {
      'hdgcodigo'         : hdgcodigo,
      'esacodigo'         : esacodigo,
      'cmecodigo'         : cmecodigo,
      'usuario'           : usuario,
      'servidor'          : servidor,
      'bodcodigosolicita' :bodcodigosolicita,
      'tiporegori'        :tiporegori
    });
  }

  BuscaProductoporBodega(hdgcodigo:number,esacodigo:number,cmecodigo:number,codbodega: number,
    usuario: string,servidor:string):Observable<Bodegas[]> {
    return this._http.post<Bodegas[]>(this.urlprodxbodega, {
        'hdgcodigo': hdgcodigo,
        'esacodigo': esacodigo,
        'cmecodigo': cmecodigo,
        'codbodega': codbodega,
        'usuario'  : usuario,
        'servidor' : servidor
    });
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

  CreaBodegaNueva(hdgcodigo: number,esacodigo: number,cmecodigo:number,codbodega:number,
    desbodega: string,codnuevo:string,usuario:string,servidor:string): Observable<Bodegas[]> {
    return this._http.post<Bodegas[]>(this.urlgrababodeganueva, {
        'hdgcodigo' : hdgcodigo,
        'esacodigo' : esacodigo,
        'cmecodigo' : cmecodigo,
        'codbodega' : codbodega,
        'desbodega' : desbodega,
        'codnuevo'  : codnuevo,
        'usuario'   : usuario,
        'servidor'  : servidor
    });
  }

  AsociaBodegaServicio(hdgcodigo: number,esacodigo: number,cmecodigo:number,codbodega: number,
    codserbodperi: number,usuario:string,servidor:string):Observable<Bodegas[]> {
    return this._http.post<Bodegas[]>(this.urlasociabodservi, {
        'hdgcodigo'     : hdgcodigo,
        'esacodigo'     : esacodigo,
        'cmecodigo'     : cmecodigo,
        'codbodega'     : codbodega,
        'codserbodperi' : codserbodperi,
        'usuario'       : usuario,
        'servidor'      : servidor
    });

  }

  EliminaProductodeBodega(registroeliminar:ProductosBodegas):Observable<any> {
    return this._http.post(this.urleliminaprodabod, registroeliminar);
  }

  GrabaProductosaBodega(paramgrabaproductosabod):Observable<ParamGrabaproductosaBodega[]>{
   return this._http.post<ParamGrabaproductosaBodega[]>(this.urlgrabaprodabod, {
        paramgrabaproductosabod
    });

  }

  crearPlantilla(plantillas: Plantillas):Observable<any>{
    return this._http.post(this.urlcreaplantilla, plantillas
    );
  }

  BuscaPlantillasCabecera(servidor: string,usuario:string,phdgcodigo:number,pesacodigo:number,pcmecodigo:number,
    pplanid: number,pplandescrip:string,
    pfechaini:string,pfechafin:string,pbodegaorigen:number,
    pbodegadestino:number,pplanvigente:string,pserviciocod:string, pplantipo:number,
    tipopedido: number):Observable<Plantillas[]>{
    return this._http.post<Plantillas[]>(this.urlbuscaplantillascabecera, {
      'servidor'      : servidor,
      'usuario'       : usuario,
      'phdgcodigo'    : phdgcodigo,
      'pesacodigo'    : pesacodigo,
      'pcmecodigo'    : pcmecodigo,
      'pplanid'       : pplanid,
      'pplandescrip'  : pplandescrip,
      'pfechaini'     : pfechaini,
      'pfechafin'     : pfechafin,
      'pbodegaorigen' : pbodegaorigen,
      'pbodegadestino': pbodegadestino,
      'pplanvigente'  : pplanvigente,
      'pserviciocod'  : pserviciocod,
      'pplantipo'     : pplantipo,
      'tipopedido'    : tipopedido

    });
  }

  BuscaPlantillas(servidor: string,usuario:string,phdgcodigo:number,pesacodigo:number,pcmecodigo:number,
    pplanid: number,pplandescrip:string,
    pfechaini:string,pfechafin:string,pbodegaorigen:number,
    pbodegadestino:number,pplanvigente:string,pserviciocod:string,
    pplantipo:number, codmei:string):Observable<Plantillas[]>{
    return this._http.post<Plantillas[]>(this.urlbuscaplant, {
      'servidor'      : servidor,
      'usuario'       : usuario,
      'phdgcodigo'    : phdgcodigo,
      'pesacodigo'    : pesacodigo,
      'pcmecodigo'    : pcmecodigo,
      'pplanid'       : pplanid,
      'pplandescrip'  : pplandescrip,
      'pfechaini'     : pfechaini,
      'pfechafin'     : pfechafin,
      'pbodegaorigen' : pbodegaorigen,
      'pbodegadestino': pbodegadestino,
      'pplanvigente'  : pplanvigente,
      'pserviciocod'  : pserviciocod,
      'pplantipo'     : pplantipo,
      'codmei'        : codmei

    });
  }

  ModificaPlantilla(Plantillas: Plantillas): Observable<any> {
    return this._http.post(this.urlcreaplantilla, Plantillas
    );
  }

  EliminarSolicitud(Plantillas: Plantillas): Observable<any> {
      return this._http.post(this.urlcreaplantilla, Plantillas
      );

  }

  BuscaBodegasDespachadora(hdgcodigo:number,esacodigo:number,cmecodigo:number,usuario: string,
    servidor: string):Observable<BodegasDespachadoras[]>{
    return this._http.post<BodegasDespachadoras[]>(this.urlbuscaboddespachadora, {
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'usuario'   : usuario,
      'servidor'  : servidor
    });
  }

  GrabaFraccionamiento(datosparagrabar: GrabaProductoFraccionado[]):Observable<GrabaProductoFraccionado[]>{
    return this._http.post<GrabaProductoFraccionado[]>(this.urlfraccion, {
        datosparagrabar
    });
  }

  BuscaProductoenlaBodega(hdgcodigo:number,esacodigo:number,cmecodigo:number,boddesp:number,
    codmei:string,descprod:string, usuario: string,
    servidor: string):Observable<ProductoAFraccionar[]>{
    return this._http.post<ProductoAFraccionar[]>(this.urlproductosafraccionar, {
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'boddesp'   : boddesp,
      'codmei'    : codmei,
      'descprod'  : descprod,
      'usuario'   : usuario,
      'servidor'  : servidor
    });
  }

  BuscaProductosFraccionados(hdgcodigo:number,esacodigo:number,cmecodigo:number, meinidori:number, usuario: string,
    servidor: string,boddesp: number):Observable<ProductoFraccionado[]>{
    return this._http.post<ProductoFraccionado[]>(this.urlproductosafraccionados, {
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'meinidori' : meinidori,
      'usuario'   : usuario,
      'servidor'  : servidor,
      'boddesp'   : boddesp
    });
  }

  EliminaProductoFraccionadoDeGrilla(datosparaeliminar: GrabaProductoFraccionado[]):Observable<EliminaProductoFraccionado[]>{

    return this._http.post<EliminaProductoFraccionado[]>(this.urleliminafraccionado, {
        datosparaeliminar
    });

  }

  GrabarAjusteStock(hdgcodigo: number,esacodigo:number, cmecodigo:number,servidor: string,
    usuario: string,bodcodigo:number, meinid:number,meincod:string ,stockanterior:number,
    stocknuevo:number,motivoajuste: number):Observable<RetornaMensaje[]>{

    return this._http.post<RetornaMensaje[]>(this.urlajustestock, {
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'servidor'  : servidor,
      'usuario'   : usuario,
      'bodcodigo' : bodcodigo,
      'meinid'    : meinid,
      'meincod'   : meincod,
      'stockanterior': stockanterior,
      'stocknuevo' : stocknuevo,
      'motivoajuste': motivoajuste
    });
  }

  BuscaBodegaporServicio(hdgcodigo: number,esacodigo: number,cmecodigo: number,serviciocodigo:number,
  usuario: string,servidor: string):Observable<BodegasPorServicio[]>{
    return this._http.post<BodegasPorServicio[]>(this.urlbodegaxservicio, {
      'hdgcodigo'     : hdgcodigo,
      'esacodigo'     : esacodigo,
      'cmecodigo'     : cmecodigo,
      'serviciocodigo': serviciocodigo,
      'usuario'       : usuario,
      'servidor'      : servidor
    });
  }

  BuscaBodegasControlados(hdgcodigo:number,esacodigo:number,cmecodigo:number,usuario: string,
    servidor: string):Observable<BodegasControladas[]>{
    return this._http.post<BodegasControladas[]>(this.urlbuscabodcontrolada, {
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'usuario'   : usuario,
      'servidor'  : servidor
    });
  }

  BuscaProductoBodegaControl(servidor: string,hdgcodigo: number,esacodigo: number,cmecodigo: number,
    codbodega:number):Observable<LibroControlado[]>{
    return this._http.post<LibroControlado[]>(this.urlprodbodegakardex, {
      'servidor' : servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'codbodega': codbodega

    });
  }

  ConsultaFraccionamiento(hdgcodigo: number,esacodigo:number,cmecodigo: number,usuario:string,
    servidor:string,fbodcodigo:number, fechadesde:string, fechahasta:string,idprodorigen:number,
    idproddestino:number ):Observable<ConsultaFraccionado[]>{
    return this._http.post<ConsultaFraccionado[]>(this.urlconsultafraccion, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario'  : usuario,
      'servidor' : servidor,
      'fbodcodigo': fbodcodigo,
      'fechadesde': fechadesde,
      'fechahasta': fechahasta,
      'idprodorigen': idprodorigen,
      'idproddestino': idproddestino
    });
  }

  BuscaBodegasFraccionable(hdgcodigo:number,esacodigo:number,cmecodigo:number,usuario: string,
    servidor: string):Observable<BodegasFraccionables[]>{
    return this._http.post<BodegasFraccionables[]>(this.urlbuscabodfraccionable, {
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'usuario'   : usuario,
      'servidor'  : servidor
    });
  }

  DevolucionFraccionamiento(servidor: string,usuario: string,hdgcodigo:number,esacodigo:number,
    cmecodigo: number,codbodega: number,devolucionfraccionamiento: DevolucionFraccionamiento[]):Observable<GrabaProductoFraccionado[]>{
    return this._http.post<GrabaProductoFraccionado[]>(this.urldevolfraccion, {
      'servidor'  : servidor,
      'usuario'   : usuario,
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'codbodega' : codbodega,
      'devolucionfraccionamiento': devolucionfraccionamiento
    });
  }

  BuscaTipoPedido(hdgcodigo: number, cmecodigo: number, esacodigo: number, servidorbd: string):Observable<TipoPedidoPlantillaBodega[]>{
    return this._http.post<TipoPedidoPlantillaBodega[]>(this.urlbuscapedido, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'servidorbd'  : servidorbd
    });
  }

  BuscaLotesDelSistema(servidor: string,hdgcodigo:number,esacodigo:number,cmecodigo: number,
    lote: string, meinid:number, codbodega: string, fechainicio:string, fechatermino: string,
    saldo: number):Observable<BuscaLotesSistema[]>{
    return this._http.post<BuscaLotesSistema[]>(this.urlbuscalotessist, {
      'servidor'  : servidor,
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'lote'      : lote,
      'meinid'    : meinid,
      'codbodega' : codbodega,
      'fechainicio': fechainicio,
      'fechatermino': fechatermino,
      'saldo'      : saldo
    });
  }

  BuscaProductoporLotes(servidor: string,hdgcodigo:number,esacodigo:number,cmecodigo: number,
    usuario: string, lote: string, fechavencimiento: string ):Observable<any>{
    return this._http.post<any>(this.urlbuscaprodporlote, {
      'servidor'  : servidor,
      'hdgcodigo' : hdgcodigo,
      'esacodigo' : esacodigo,
      'cmecodigo' : cmecodigo,
      'usuario' : usuario,
      'lote'      : lote,
      'fechavencimiento' : fechavencimiento
    });
  }

  ConsumoLotes(servidor: string,usuario: string,phdgcodigo: number,pesacodigo: number,
    pcmecodigo: number,Lote: string,MeinID: number,FechaInicio: string,
    FechaTermino: string,TipoConsulta: number, tiposMovimiento?: number[]):Observable<DetalleConsultaConsumoLote[]>{
    return this._http.post<DetalleConsultaConsumoLote[]>(this.urlconsumolote, {
      'servidor'     : servidor,
      'usuario'      : usuario,
      'phdgcodigo'   : phdgcodigo,
      'pesacodigo'   : pesacodigo,
      'pcmecodigo'   : pcmecodigo,
      'Lote'         : Lote,
      'MeinID'       : MeinID,
      'FechaInicio'  : FechaInicio,
      'FechaTermino' : FechaTermino,
      'TipoConsulta' : TipoConsulta,
      'TiposMovimiento' : tiposMovimiento ? tiposMovimiento : [],
    });
  }

  buscaBodegasConLotes(
    hdgcodigo: number, esacodigo:number, cmecodigo:number, servidor: string, usuario: string,
    lote: string, codigoProducto: string, 
  ): Promise<BodegaConLote[]> {
    return this._http.post<BodegaConLote[]>(this.urlBuscaBodegasConLotes, {
      hdgcodigo,
      esacodigo,
      cmecodigo,
      servidor,
      lote,
      codigoProducto,
    })
    .toPromise()
  }

  listaCobros(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string,
    servidor: string,): Observable<ListaCobros[]> {
    return this._http.post<ListaCobros[]>(this.urlbuscalistacobros, {
   'hdgcodigo': hdgcodigo,
   'esacodigo': esacodigo,
   'cmecodigo': cmecodigo,
   'usuario': usuario,
   'servidor': servidor
    });
  }

  GrabaFactorConversionProducto(servidor : string,hdgcodigo : number,esacodigo : number,
    cmecodigo : number,usuario : string,factorconversionproductodetalle: GrabaProductoFraccionado[]):Observable<any>{
    return this._http.post<any>(this.urlfactorconversionproducto, {
        'servidor'  : servidor,
        'hdgcodigo' : hdgcodigo,
        'esacodigo' : esacodigo,
        'cmecodigo' : cmecodigo,
        'usuario'   : usuario,
        'factorconversionproductodetalle' : factorconversionproductodetalle
    });
  }

  combobodegadevpac(hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string, servidor: string,cliid:number): Observable<BodegaDestino[]> {
      return this._http.post<BodegaDestino[]>(this.urlcombobodegadevpac, {//this.urlbodegadestino
    'hdgcodigo': hdgcodigo,
    'esacodigo': esacodigo,
    'cmecodigo': cmecodigo,
    'usuario': usuario,
    'servidor': servidor,
    'cliid': cliid
    });
  }
}
