import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {DetalleOC} from '../models/entity/DetalleOC';
import { EstadoOc } from '../models/entity/EstadoOc';
import { GuiaOc } from '../models/entity/GuiaOc';
import { MedioPago } from '../models/entity/MedioPago';
import { OrdenCompra } from '../models/entity/ordencompra';
import { DetalleMovimientoOc } from '../models/entity/detalleMovimientoOc';
import { TipoDocumento } from '../models/entity/TipoDocumento';
import { UltimaOc } from '../models/entity/UltimaOc';
import { RegistroArticulo } from '../models/entity/registroArticulo';
import { ListaProveedor } from '../models/entity/ListaProveedor';
import { Ciudad } from '../models/entity/Ciudad';
import { Comuna } from '../models/entity/Comuna';
import { Pais } from '../models/entity/Pais';
import { Region } from '../models/entity/Region';
import { MotivoDev } from '../models/entity/MotivoDev';

@Injectable()


export class  OrdenCompraService {

  public urllistaestadooc: string = sessionStorage.getItem('enlaceoc').toString().concat('/listaestadooc');
  public urlHistorialDevoluciones: string = sessionStorage.getItem('enlaceoc').toString().concat('/historialdevoluciones');
  public urlAsociarMeinProv: string = sessionStorage.getItem('enlaceoc').toString().concat('/asociarmeinprov');
  public urllistamediopago: string = sessionStorage.getItem('enlaceoc').toString().concat('/listamediopago');
  public urllistaciudad: string = sessionStorage.getItem('enlaceoc').toString().concat('/listaciudad');
  public urllistacomuna: string = sessionStorage.getItem('enlaceoc').toString().concat('/listacomuna');
  public urllistapais: string = sessionStorage.getItem('enlaceoc').toString().concat('/listapais');
  public urllistaregion: string = sessionStorage.getItem('enlaceoc').toString().concat('/listaregion');
  public urllistatipodocumento: string = sessionStorage.getItem('enlaceoc').toString().concat('/listatipodocumento');
  public urllistamotivodevolucion: string = sessionStorage.getItem('enlaceoc').toString().concat('/listamotivodevolucion');

  public urllistaproveedor: string = sessionStorage.getItem('enlaceoc').toString().concat('/listaproveedor');
  public urlBuscaUltimoOc  : string = sessionStorage.getItem('enlaceoc').toString().concat('/buscarultimaoc');
  public urlBuscaOc  : string = sessionStorage.getItem('enlaceoc').toString().concat('/buscaroc');
  public urlGeneraOc : string = sessionStorage.getItem('enlaceoc').toString().concat('/grabarordencompra');
  public urlModificaOc : string = sessionStorage.getItem('enlaceoc').toString().concat('/modificarordencompra');
  public urlBuscaOcDet  : string = sessionStorage.getItem('enlaceoc').toString().concat('/buscarocdet');
  public urlBuscaOcFiltro  : string = sessionStorage.getItem('enlaceoc').toString().concat('/buscarocfiltro');
  public urlBuscaUltimaRecep  : string = sessionStorage.getItem('enlaceoc').toString().concat('/buscarultimarecep');
  public urlRecepcionaOc :string = sessionStorage.getItem('enlaceoc').toString().concat('/grabarrecepcionoc'); 
  public urlEmitirOc :string = sessionStorage.getItem('enlaceoc').toString().concat('/emitiroc'); 
  public urlAnularOc :string = sessionStorage.getItem('enlaceoc').toString().concat('/anularoc'); 
  public urlRevertirOc :string = sessionStorage.getItem('enlaceoc').toString().concat('/revertiroc'); 
  public urlCerrarOc :string = sessionStorage.getItem('enlaceoc').toString().concat('/cerraroc'); 
  public urlBuscaRegistroArt :string = sessionStorage.getItem('enlaceoc').toString().concat('/buscaregistroart'); 
  public urlBuscaGuiaFiltro  : string = sessionStorage.getItem('enlaceoc').toString().concat('/buscarguiafiltro');
  public urlBuscaNotaFiltro  : string = sessionStorage.getItem('enlaceoc').toString().concat('/buscarnotafiltro');
  public urlGeneraDev : string = sessionStorage.getItem('enlaceoc').toString().concat('/grabardevolucionoc');
  public urlListarMeinBodega : string = sessionStorage.getItem('enlaceoc').toString().concat('/listarmeinbodega');
  public urlbuscaDetalleArticulosProv : string = sessionStorage.getItem('enlaceoc').toString().concat('/buscadetallearticulosprov');

  constructor(private _http: HttpClient) { }

  listaMedioPago( condicion: number, servidor: string, hdgcodigo: number, esacodigo: number, cmecodigo: number, usuario: string): Observable<MedioPago[]> {
    return this._http.post<MedioPago[]>(this.urllistamediopago, {
      'condicion': condicion,
      'servidor' : servidor,
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'usuario'  : usuario
    });
  }

  listaPais(servidor: string): Observable<Pais[]> {
    return this._http.post<Pais[]>(this.urllistapais, {
      'servidor' : servidor
    });
  }

  listaRegion( condicion: number, servidor: string): Observable<Region[]> {
    return this._http.post<Region[]>(this.urllistaregion, {
      'condicion': condicion,
      'servidor' : servidor,
    });
  }

  listaCiudad( condicion: number, servidor: string): Observable<Ciudad[]> {
    return this._http.post<Ciudad[]>(this.urllistaciudad, {
      'condicion': condicion,
      'servidor' : servidor,
    });
  }

  listaComuna( condicion: number, servidor: string): Observable<Comuna[]> {
    return this._http.post<Comuna[]>(this.urllistacomuna, {
      'condicion': condicion,
      'servidor' : servidor,
    });
  }

  listaTipoDocumento(hdgcodigo: number, cmecodigo: number, esacodigo: number, servidor: string, tipo: string): Observable<TipoDocumento[]> {
    return this._http.post<TipoDocumento[]>(this.urllistatipodocumento, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'servidor' : servidor,
      'tipo' : tipo
    });
  }

  listaMotivoDevolucion(hdgcodigo: number, cmecodigo: number, esacodigo: number, servidor: string): Observable<MotivoDev[]> {
    return this._http.post<MotivoDev[]>(this.urllistamotivodevolucion, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'servidor' : servidor
    });
  }

  listaProveedor(servidor: string): Observable<ListaProveedor[]> {
    return this._http.post<ListaProveedor[]>(this.urllistaproveedor, {
      'servidor' : servidor
    });
  }

  listaEstado(servidor: string): Observable<EstadoOc[]> {
    return this._http.post<EstadoOc[]>(this.urllistaestadooc, {
      'servidor' : servidor
    });
  }
  
  BuscarUltimaOc(servidor: string): Observable<UltimaOc[]> {
    return this._http.post<UltimaOc[]>(this.urlBuscaUltimoOc, {
      'servidor' : servidor
    });
  } 

  BuscarUltimaRecep(hdgcodigo: number, cmecodigo: number, esacodigo: number, servidor: string): Observable<DetalleMovimientoOc[]> {
    return this._http.post<DetalleMovimientoOc[]>(this.urlBuscaUltimaRecep, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'servidor' : servidor
    });
  }

  BuscarOc(hdgcodigo: number, cmecodigo: number, esacodigo: number, numoc: number, servidor: string, usuario: string): Observable<DetalleOC[]> {
    return this._http.post<any[]>(this.urlBuscaOc, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'numoc'    : numoc,
      'servidor' : servidor,
      'usuario'  : usuario
    });
  }

  BuscarOcFiltros(hdgcodigo: number, cmecodigo: number, esacodigo: number, estado: number, desde: string, hasta: string, servidor: string, proveedor: number, pantalla: string): Observable<OrdenCompra[]> {
    return this._http.post<OrdenCompra[]>(this.urlBuscaOcFiltro, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'estado'  : estado,
      'desde'  : desde,
      'hasta'  : hasta,
      'servidor' : servidor,
      'proveedor': proveedor,
      'pantalla' : pantalla
    });
  }

  BuscarGuiaFiltros(hdgcodigo: number, cmecodigo: number, esacodigo: number, rut: number, desde: string, hasta: string, tipodoc: number, numdoc: number, servidor: string, provid: number, meinid: number): Observable<any[]> {
    return this._http.post<any[]>(this.urlBuscaGuiaFiltro, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'rut'  : rut,
      'desde'  : desde,
      'hasta'  : hasta,
      'tipodoc' : tipodoc,
      'numdoc' : numdoc,
      'servidor' : servidor,
      'provid' : provid,
      'meinid' : meinid
    });
  }

  BuscarNotaFiltros(hdgcodigo: number, esacodigo: number,cmecodigo:number, rut: number, desde: string, hasta: string, tipodoc: number, numdoc: number, servidor: string, provid: number, meinid: number): Observable<any[]> {
    return this._http.post<any[]>(this.urlBuscaNotaFiltro, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'rut'  : rut,
      'desde'  : desde,
      'hasta'  : hasta,
      'tipodoc' : tipodoc,
      'numdoc' : numdoc,
      'servidor' : servidor,
      'provid' : provid,
      'meinid' : meinid
    });
  }


  BuscarOcDet(hdgcodigo: number, cmecodigo: number, esacodigo: number, numoc: number, servidor: string, codigo: string, descripcion: string): Observable<DetalleOC[]> {
    return this._http.post<any[]>(this.urlBuscaOcDet, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'numoc'    : numoc,
      'servidor' : servidor,
      'codigo' : codigo,
      'descripcion': descripcion
    });
  }


  

  buscarRegistroArticulo(hdgcodigo: number, cmecodigo: number, esacodigo: number, varDetalleOc: DetalleOC, servidor: string): Observable<any> {
    return this._http.post(this.urlBuscaRegistroArt, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'meinid'    : varDetalleOc.odetmeinid,
      'servidor' : servidor
    });
  }

  buscarHistorialDevoluciones(hdgcodigo: number, esacodigo: number,cmecodigo:number, odmoid: number, servidor: string, fecha: string, tipodoc: number, nota: number): Observable<any> {
    return this._http.post(this.urlHistorialDevoluciones, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'odmoid'    : odmoid,
      'servidor' : servidor,
      'fecha'    : fecha,
      'tipodoc'    : tipodoc,
      'nota'    : nota,
    });
  }

  listarMeinBodega(hdgcodigo: number, esacodigo: number, cmecodigo: number, varDetalleOc: DetalleOC[], servidor: string, idbodega: number): Observable<any> {
    return this._http.post(this.urlListarMeinBodega, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'detalleoc'    : varDetalleOc,
      'servidor' : servidor,
      'idbodega' : idbodega
    });
  }

  AsociarMeinProv(hdgcodigo: number, esacodigo: number, cmecodigo: number, codigo: string, proveedor: number, servidor: string): Observable<any>{
    return this._http.post(this.urlAsociarMeinProv, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'codigo'    : codigo,
      'servidor' : servidor,
      'proveedor' : proveedor
    });
  }

  buscaDetalleArticulosProv(hdgcodigo: number, esacodigo: number,cmecodigo:number, servidor: string,proveedor: number): Observable<any>{
    return this._http.post(this.urlbuscaDetalleArticulosProv, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,
      'servidor' : servidor,
      'proveedor' : proveedor
    });
  }
  

  modificarOrdenCompra(varSolicitud: OrdenCompra,servidor: string): Observable<any> {
    return this._http.post(this.urlModificaOc, varSolicitud);
  }

  crearOrdenCompra(varSolicitud: OrdenCompra,servidor: string): Observable<any> {
    return this._http.post(this.urlGeneraOc, varSolicitud);
  }

  crearRecepcion(varGuia: GuiaOc,servidor: string): Observable<any> {
    return this._http.post(this.urlRecepcionaOc, varGuia);
  }

  emitirOrdenCompra(hdgcodigo: number, esacodigo: number, cmecodigo: number, numoc: number, servidor: string): Observable<any> {
    return this._http.post<any[]>(this.urlEmitirOc, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo,  
      'numoc'    : numoc,
      'servidor' : servidor
    });
  }

  anularOrdenCompra(hdgcodigo: number, esacodigo: number, cmecodigo: number, numoc: number, servidor: string, usuario: string): Observable<any> {
    return this._http.post<any[]>(this.urlAnularOc, {
      'hdgcodigo': hdgcodigo,
      'esacodigo': esacodigo,
      'cmecodigo': cmecodigo, 
      'numoc'    : numoc,
      'servidor' : servidor,
      'usuario' : usuario
    });
  }

  revertirOrdenCompra(hdgcodigo: number, esacodigo: number,cmecodigo:number, orcoid: number,orcoprov: number, orcouser: string, servidor: string): Observable<any> {
    return this._http.post<any[]>(this.urlRevertirOc, {
      'hdgcodigo'      : hdgcodigo,
      'esacodigo'      : esacodigo,
      'cmecodigo'      : cmecodigo,
      'orcoid'         : orcoid,
      'orcoprov'       : orcoprov,
      'orcouser'       : orcouser,
      'servidor'       : servidor
    });
  }

  cerrarOrdenCompra(hdgcodigo: number, esacodigo: number,cmecodigo:number, numoc: number, servidor: string): Observable<any> {
    return this._http.post<any[]>(this.urlCerrarOc, {
      'hdgcodigo'      : hdgcodigo,
      'esacodigo'      : esacodigo,
      'cmecodigo'      : cmecodigo,
      'numoc'    : numoc,
      'servidor' : servidor
    });
  }

  crearDevolucion(varSolicitud: any,servidor: string): Observable<any> {
    return this._http.post(this.urlGeneraDev, varSolicitud);
  }


}
