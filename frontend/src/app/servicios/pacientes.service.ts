import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ListaPacientes } from '../models/entity/ListaPacientes'
import { Paciente } from '../models/entity/Paciente';
import { Solicitudespacienteproducto } from '../models/entity/Solicitudespacienteproducto';
import { Recepciondevolucionpaciente } from '../models/entity/Recepciondevolucionpaciente';
import { env } from 'process';
import { SolicitudPacienteDevuelta } from '../models/entity/SolicitudPacienteDevuelta';
import { DespachoSolicitud } from '../models/entity/DespachoSolicitud';
import { ParamDevolPacRechazo } from 'src/app/models/entity/ParamDevolPacRechazo';
import { UsuarioAutorizado } from '../models/entity/UsuarioAutorizado';
import { ConsultaPacientePorBodegas } from '../models/entity/ConsultaPacientePorBodegas';
import { SolicitudesPacProd } from '../models/entity/SolicitudesPacProd';

@Injectable()

export class PacientesService {

  public pacientes_url: string = sessionStorage.getItem('enlace').toString().concat('/buscapaciente');//ambulatorio
  public pacientesambito_url: string = sessionStorage.getItem('enlace').toString().concat('/buscapacienteambito');//hospitalizado urgencia
  public solicitudesPacienteProducto_url: string = sessionStorage.getItem('enlace').toString().concat('/solicitudespacienteproducto');
  public devolucionpaciente_url: string = sessionStorage.getItem('enlace').toString().concat('/recepciondevolucionpaciente');
  public devoldispcuentapaciente: string = sessionStorage.getItem('enlace').toString().concat('/devolverdispensacioncuentapaciente')
  public buscasolicdevolpac: string = sessionStorage.getItem('enlace').toString().concat('/buscasolicitudesdevolpac');
  public urldevolpacrechazo: string = sessionStorage.getItem('enlace').toString().concat('/recedevolpacrechazo');
  public urlusuariorecepcion: string = sessionStorage.getItem('enlace').toString().concat('/validausuariorechazo');
  public urlconsumopacbod: string = sessionStorage.getItem('enlace').toString().concat('/consultacargopacientebod');

  constructor(public _http: HttpClient) { }

  BuscaListaPacientes(hdgcodigo: number, cmecodigo: number, esacodigo: number, tipodocumento: number,
    documentoid: string, paterno: string, materno: string, nombres: string,
    usuario: string, servidor: string)
    :Observable<ListaPacientes[]> { return this._http.post<ListaPacientes[]>(this.pacientes_url, {

      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'tipodocumento': tipodocumento,
      'documentoid': documentoid,
      'paterno': paterno,
      'materno': materno,
      'nombres': nombres,
      'usuario': usuario,
      'servidor': servidor
    });
  }

  BuscaPacientes(hdgcodigo: number, cmecodigo: number, tipodocumento: number,
    documentoid: string, paterno: string, materno: string, nombres: string, cliid:number,
    usuario: string, servidor: string)
    :Observable<Paciente[]> { return this._http.post<Paciente[]>(this.pacientes_url, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'tipodocumento': tipodocumento,
      'documentoid': documentoid,
      'paterno': paterno,
      'materno': materno,
      'nombres': nombres,
      'cliid'  : cliid,
      'usuario': usuario,
      'servidor': servidor
    });
  }

  BuscaPacientesAmbito(hdgcodigo: number, cmecodigo: number, esacodigo: number,codtipoid: number,
    rutpac: string, paterno: string,materno: string, nombres: string, unidadid: number,
    piezaid: number, camid: number,servidor: string,serviciocod: string, ambito:number, soloCuentasAbiertas = true)
    :Observable<Paciente[]> { return this._http.post<Paciente[]>(this.pacientesambito_url, {
      'hdgcodigo': hdgcodigo,
      'cmecodigo': cmecodigo,
      'esacodigo': esacodigo,
      'codtipoid': codtipoid,
      'rutpac'   : rutpac,
      'paterno': paterno,
      'materno': materno,
      'nombres': nombres,
      'unidadid': unidadid,
      'piezaid': piezaid,
      'camid': camid,
      'servidor': servidor,
      'serviciocod': serviciocod,
      'ambito' : ambito,
      'soloCuentasAbiertas': soloCuentasAbiertas
    });
  }

  BuscaSolicitudesPacienteProducto(hdgcodigo: number, esacodigo: number, cmecodigo: number,
    servidor: string, cliid: number, ctaid: number,estid: number, bodcodigo: number, codmei: string, soliid: number, lote: string,
    fechavto: string): Observable<SolicitudesPacProd[]> {
    return this._http.post<SolicitudesPacProd[]>(this.solicitudesPacienteProducto_url, {
        'hdgcodigo' : hdgcodigo,
        'esacodigo' : esacodigo,
        'cmecodigo' : cmecodigo,
        'servidor'  : servidor,
        'cliid'     : cliid,
        'ctaid'     : ctaid,
        'estid'     : estid,
        'bodcodigo' : bodcodigo,
        'codmei'    : codmei,
        'soliid'    : soliid,
        'lote'      : lote,
        'fechavto'  : fechavto
    });
  }

  Recepciondevolucionpaciente(recepciondevolucionpaciente: Recepciondevolucionpaciente): Observable<Recepciondevolucionpaciente> {
    return this._http.post(this.devolucionpaciente_url, recepciondevolucionpaciente);
  }

  Generardevolucionpaciente(recepciondevolucionpaciente: DespachoSolicitud): Observable<any[]> {
    return this._http.post<any[]>(this.devoldispcuentapaciente, recepciondevolucionpaciente);
  }

  BuscaSolicitudesDevueltasPaciente(servidor: string,hdgcodigo:number,esacodigo:number,cmecodigo: number,
    codbodega: number,codservicio: number, soliid: number, nompac: string,apepaterpac: string,
    apematerpac: string,tipodoc: string,idenpac: string,fecdesde: string,
    fechasta: string): Observable<SolicitudPacienteDevuelta[]> {
    return this._http.post<SolicitudPacienteDevuelta[]>(this.buscasolicdevolpac, {
      'servidor'    : servidor,
      'hdgcodigo'   : hdgcodigo,
      'esacodigo'   : esacodigo,
      'cmecodigo'   : cmecodigo,
      'codbodega'   : codbodega,
      'codservicio' : codservicio,
      'soliid'      : soliid,
      'nompac'      : nompac,
      'apepaterpac' : apepaterpac,
      'apematerpac' : apematerpac,
      'tipodoc'     : tipodoc,
      'idenpac'     : idenpac,
      'fecdesde'    : fecdesde,
      'fechasta'    : fechasta
    });
  }

  RecepcioDevolucionPacienteRechazo(paramDevolPacRechazo : ParamDevolPacRechazo): Observable<ParamDevolPacRechazo> {
    return this._http.post(this.urldevolpacrechazo, paramDevolPacRechazo);
  }

  ValidaUsuarioParaRecepcionarDevolucion(usuario: string,clave: string,
    servidor: string,     ): Observable<UsuarioAutorizado> {
    return this._http.post<UsuarioAutorizado>(this.urlusuariorecepcion, {
      'usuario'   : usuario,
      'clave'   : clave,
      'servidor'    : servidor
    });
  }

  /**
   * @param cuenta 
   * Con formato `<cuenta>-<subcuenta>`
   * 
   * @returns 
   */
  ConsumoPacientesPorBodegas(servidor: string,hdgcodigo: number,esacodigo: number,
    cmecodigo:number,fechadesde: string,fechahasta:string,rut:string,
     nombre:string, paterno:string,materno:string,folio:string,ficha:string,nrosolicitud:string,
     nroreceta:string,codproducto:string, producto:string,tipidentificacion:number,
     codbodega: number, numcuenta?: number, numsubcuenta?: number,
  ): Observable<ConsultaPacientePorBodegas[]> {
    return this._http.post<ConsultaPacientePorBodegas[]>(this.urlconsumopacbod, {
      'servidor'          : servidor,
      'hdgcodigo'         : hdgcodigo,
      'esacodigo'         : esacodigo,
      'cmecodigo'         : cmecodigo,
      'fechadesde'        : fechadesde,
      'fechahasta'        : fechahasta,
      'rut'               : rut,
      'nombre'            : nombre,
      'paterno'           : paterno,
      'materno'           : materno,
      'folio'             : folio,
      'ficha'             : ficha,
      'nrosolicitud'      : nrosolicitud,
      'nroreceta'         : nroreceta,
      'codproducto'       : codproducto,
      'producto'          : producto,
      'tipidentificacion' : tipidentificacion,
      'codbodega'         : codbodega,
      'numcuenta'         : numcuenta,
      'numsubcuenta'      : numsubcuenta,
    });
  }

}
