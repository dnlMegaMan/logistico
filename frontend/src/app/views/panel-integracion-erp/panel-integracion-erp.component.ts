import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';

import { DatePipe, UpperCasePipe } from '@angular/common';

import { Validators, FormGroup, FormBuilder, Form } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';


import { MovimientoInterfaz } from 'src/app/models/entity/movimiento-interfaz';
import { InterfacesService } from 'src/app/servicios/interfaces.service';


import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { MovimientoInterfazBodegas } from 'src/app/models/entity/movimiento-interfaz-bodegas';
import { EstructuraFin700 } from 'src/app/models/entity/estructura-fin700';
import { SolicitudConsumoService } from 'src/app/servicios/solicitud-consumo.service';
import { SolicitudConsumo } from 'src/app/models/entity/solicitud-consumo';
import { analyzeFileForInjectables } from '@angular/compiler';
import { ConsultaSolConsumoERP } from 'src/app/models/entity/consulta-sol-consumo-erp';
import { Solicitud } from '../../models/entity/Solicitud';
import { EstadosTraspasosFin700 } from 'src/app/models/entity/EstadosTraspasosFin700';
import { ModaldetallesolicitudMonitorERPComponent } from '../modaldetallesolicitud-monitor-erp/modaldetallesolicitud-monitor-erp.component';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { BodegasService } from 'src/app/servicios/bodegas.service';
import { Servicio } from 'src/app/models/entity/Servicio';
import { EstructuraunidadesService } from 'src/app/servicios/estructuraunidades.service';
import { UnidadesOrganizacionales } from 'src/app/models/entity/unidades-organizacionales';
import { UnidadesOrganizacionalesService } from 'src/app/servicios/unidades-organizacionales.service';
import { EstadoSolicitudBodega } from 'src/app/models/entity/EstadoSolicitudBodega';
import { EstadosolicitudbodegaService } from 'src/app/servicios/estadosolicitudbodega.service';
import { InformesService } from 'src/app/servicios/informes.service';
import { FiltroERP } from 'src/app/models/entity/FiltroERP';
import { ReportesVisorErpService } from 'src/app/servicios/reportes-visor-erp.service';
import { ComponenteDesactivable } from 'src/app/models/componente-desactivable';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-panel-integracion-erp',
  templateUrl: './panel-integracion-erp.component.html',
  styleUrls: ['./panel-integracion-erp.component.css'],
  providers: [InformesService]
})
export class PanelIntegracionERPComponent implements OnInit, ComponenteDesactivable {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('alertSwalGrilla', { static: false }) alertSwalGrilla: SwalComponent;

  public locale = 'es';
  public bsConfig: Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';

  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public loading = false;
  public lForm: FormGroup;
  public FormFiltroBod: FormGroup;
  public FormFiltroPac: FormGroup;
  public FormEstadoMovPac: FormGroup;
  public FormFiltroSolGS: FormGroup;
  public FormFiltroSolBC: FormGroup;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public bodegassuministro      : Array<BodegasTodas> = [];
  public servicios              : Array<Servicio> = [];

  public listabodegas: Array<MovimientoInterfazBodegas> = [];
  public listabodegasPaginacion: Array<MovimientoInterfazBodegas> = [];
  public listabodegas2: Array<MovimientoInterfazBodegas> = [];

  public listabodegas_aux: Array<MovimientoInterfazBodegas> = [];
  public listabodegasPaginacion_aux: Array<MovimientoInterfazBodegas> = [];

  public listapacientes: Array<MovimientoInterfaz> = [];
  public listapacientesPaginacion: Array<MovimientoInterfaz> = [];
  public listapacientes2: Array<MovimientoInterfaz> = [];

  public listapacientesPaginacion_aux: Array<MovimientoInterfaz> = [];
  public listapacientes_aux: Array<MovimientoInterfaz> = [];

  public listasolicitudes: Array<SolicitudConsumo> = [];
  public listasolicitudesPaginacion: Array<SolicitudConsumo> = [];

  public listasolicitudesacentrales: Array<Solicitud> = [];
  public listasolicitudesacentralesPaginacion: Array<Solicitud> = [];


  public _PageChangedEvent: PageChangedEvent;


  public canidad_movimiento_bodegas: number;
  public canidad_movimiento_pacientes: number;
  public cantidad_solicitudes: number;
  public cantidad_solicitudes_a_centrales: number;

  public opcion_bodegas: boolean;
  public opcion_pacientes: boolean;
  public opcion_solicitudes: boolean;
  public opcion_solicitudes_a_centrales: boolean;

  //public tiempo_refresco = interval(120000);

  public _MovimientoInterfazBodegas: MovimientoInterfazBodegas;
  public _MovimientoInterfaz : MovimientoInterfaz;
  public respuestaerp : number;

  public optBod = "DESC";
  public optPac = "DESC";
  public optSolGS = "ASC";
  public optSolBC = "DESC";

  public filtro : FiltroERP;
  public selOpc : string = null;
  public tipoDoc : string = "pdf";

  public page: number;

  public estadostraspasos: Array<EstadosTraspasosFin700> = [];
  public ccostosolicitante: Array<UnidadesOrganizacionales> = [];
  public estadossolbods: Array<EstadoSolicitudBodega> = [];

  private _BSModalRef           : BsModalRef;

  estadoEnvioTransaccionesConError: 'inicial' | 'enviando' | 'envio-exitoso' | 'envio-fallido'  = 'inicial'

  constructor(
    private _interfacesService           : InterfacesService,
    private _solicitudConsumoService     : SolicitudConsumoService,
    public datePipe                      : DatePipe,
    public localeService                 : BsLocaleService,
    public formBuilder                   : FormBuilder,
    public _BsModalService               : BsModalService,
    public _BodegasService               : BodegasService,
    public estructuraunidadesService     : EstructuraunidadesService,
    public _unidadesorganizacionaes      : UnidadesOrganizacionalesService,
    private EstadoSolicitudBodegaService : EstadosolicitudbodegaService,
    private _imprimesolicitudService     : InformesService,
    private reportesERPService           : ReportesVisorErpService,
    public translate: TranslateService
  ) {
    this.lForm = this.formBuilder.group({
      fechadesde: [new Date(), Validators.required],
      fechahasta: [new Date(), Validators.required],
      selecciontodopacientes: [{ value: null, disabled: false }, Validators.required],
      selecciontodobodegas: [{ value: null, disabled: false }, Validators.required],
      selecciontodosolicitudes: [{ value: null, disabled: false }, Validators.required],
      selecciontodosolicitudesacentrales: [{ value: null, disabled: false }, Validators.required],
    });

    this.FormFiltroBod = this.formBuilder.group({
      id                    : [{ value: null, disabled: false }, Validators.required],
      estado                : [{ value: null, disabled: false }, Validators.required],
      tipomovim             : [{ value: null, disabled: false }, Validators.required],
      soliid                : [{ value: null, disabled: false }, Validators.required],
      fecha                 : [{ value: null, disabled: false }, Validators.required],
      codbodegasolicitantes : [{ value: null, disabled: false }, Validators.required],
      codbodegasuministro   : [{ value: null, disabled: false }, Validators.required],
      referencia            : [{ value: null, disabled: false }, Validators.required],
    });

    this.FormFiltroPac = this.formBuilder.group({
      id        : [{ value: null, disabled: false }, Validators.required],
      soliid    : [{ value: null, disabled: false }, Validators.required],
      fecha     : [{ value: null, disabled: false }, Validators.required],
      receta    : [{ value: null, disabled: false }, Validators.required],
      cuenta    : [{ value: null, disabled: false }, Validators.required],
      rut       : [{ value: null, disabled: false }, Validators.required],
      paciente  : [{ value: null, disabled: false }, Validators.required],
      servicio  : [{ value: null, disabled: false }, Validators.required],
      estado    : [{ value: null, disabled: false }, Validators.required],
      referencia: [{ value: null, disabled: false }, Validators.required],
    });

    this.FormFiltroSolGS = this.formBuilder.group({
      id                 : [{ value: null, disabled: false }, Validators.required],
      fechasolicitud     : [{ value: null, disabled: false }, Validators.required],
      glosacentrocosto   : [{ value: null, disabled: false }, Validators.required],
      glosa              : [{ value: null, disabled: false }, Validators.required],
      glosaestado        : [{ value: null, disabled: false }, Validators.required],
      referenciacontable : [{ value: null, disabled: false }, Validators.required],
      errorerp           : [{ value: null, disabled: false }, Validators.required],
    });

    this.FormFiltroSolBC = this.formBuilder.group({
      id                 : [{ value: null, disabled: false }, Validators.required],
      fechacreacion      : [{ value: null, disabled: false }, Validators.required],
      bodorigendesc      : [{ value: null, disabled: false }, Validators.required],
      boddestinodesc     : [{ value: null, disabled: false }, Validators.required],
      estadosolicitudde  : [{ value: null, disabled: false }, Validators.required],
      nropedidofin700erp : [{ value: null, disabled: false }, Validators.required],
      errorerp           : [{ value: null, disabled: false }, Validators.required],
    });

    this.FormEstadoMovPac = this.formBuilder.group({
      estado: [{ value: null, disabled: false }, Validators.required],
    });

  }

  ngOnInit() {

    this.setDate();

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.canidad_movimiento_bodegas = 0;
    this.canidad_movimiento_pacientes = 0;
    this.cantidad_solicitudes = 0;
    this.cantidad_solicitudes_a_centrales = 0;

    this.lForm.get("selecciontodopacientes").setValue(false);
    this.lForm.get("selecciontodobodegas").setValue(false);
    this.lForm.get("selecciontodosolicitudes").setValue(false);
    this.lForm.get("selecciontodosolicitudesacentrales").setValue(false);

    this.opcion_bodegas = false;
    this.opcion_pacientes = false;
    this.opcion_solicitudes = false;
    this.opcion_solicitudes_a_centrales = false;

    this.CargaCombos();
  }
  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  async BuscarMovimientoInterfazERP() {
    try {
      await this.setDatos();
      //BUSCA MOVIMIENTOS DE BODEGAS
      const responseBodega = await this._interfacesService.listarmovimientointerfazbodegascab(this._MovimientoInterfazBodegas).toPromise();
      if (responseBodega != null) {
        if (responseBodega.length != 0) {
          this.listabodegas = responseBodega;
          this.listabodegas_aux = responseBodega;
          this.listabodegasPaginacion = this.listabodegas//.slice(0, 20);
          this.listabodegasPaginacion_aux = this.listabodegas//.slice(0, 20);
          this.canidad_movimiento_bodegas = this.listabodegas.length;
          this.optBod = "DESC";
        }
      }
      //BUSCA MOVIMIENTOS  DE PACIENTES
      const responsePaciente = await this._interfacesService.listamovimientointerfazpacientecab(this._MovimientoInterfazBodegas).toPromise();
      if (responsePaciente != null) {
        if (responsePaciente.length != 0) {
          this.listapacientes = responsePaciente;
          this.listapacientes_aux = this.listapacientes;
          this.listapacientesPaginacion = this.listapacientes;//.slice(0, 20);
          this.listapacientesPaginacion_aux = this.listapacientes;//.slice(0, 20);
          this.canidad_movimiento_pacientes = this.listapacientes.length;
          this.optPac = "DESC";
        }
      }
      //BUSCA MOVIMIENTOS DE SOLICITUDES QUE NO SON DE MEDICAMENTOS O INSUMOS CLÍNICOS
      const respuestasolicitud = await this._solicitudConsumoService.buscarsolicitudconsumocabecera(0, this.hdgcodigo, this.esacodigo, this.cmecodigo,
        0, 0, 0, 0, 0, 0, "", "", this.usuario, this.servidor, this._MovimientoInterfaz.fechainicio,
        this._MovimientoInterfaz.fechatermino).toPromise();
      if (respuestasolicitud != null) {
        if (respuestasolicitud.length != 0) {
          this.listasolicitudes = respuestasolicitud;
          this.listasolicitudesPaginacion = this.listasolicitudes;//.slice(0,20);
          this.cantidad_solicitudes = this.listasolicitudes.length;
          this.optSolGS = "ASC";
        }
      }
      //BUSCA MOVIMIENTOS DE SOLICITUDES A BODEGAS CENTRALES
      const respuestasolicitudCentrales = await this._interfacesService.buscarsolicitudacentrales(this.hdgcodigo, this.esacodigo, this.cmecodigo,
        this.usuario, this.servidor, this._MovimientoInterfaz.fechainicio,
        this._MovimientoInterfaz.fechatermino).toPromise();
      if (respuestasolicitudCentrales != null) {
        if (respuestasolicitudCentrales.length != 0) {
          this.listasolicitudesacentrales = respuestasolicitudCentrales;
          this.listasolicitudesacentrales.forEach(x=>{
            x.marcacabecera = false;
          });
          this.listasolicitudesacentralesPaginacion = this.listasolicitudesacentrales;//.slice(0,20);
          this.cantidad_solicitudes_a_centrales = this.listasolicitudesacentrales.length;
          this.optSolBC = "DESC";
        }
      }
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.alertSwalError.title = "Error";
      this.alertSwalError.text = error.message
      this.alertSwalError.show();
    }
  }

  setDatos(){
    const fechadesde = this.datePipe.transform(this.lForm.value.fechadesde, 'yyyy-MM-dd');
    const fechahasta = this.datePipe.transform(this.lForm.value.fechahasta, 'yyyy-MM-dd');
    this.FormFiltroBod.reset();
    this.FormEstadoMovPac.reset();

    this.listapacientes = [];
    this.listapacientesPaginacion = [];
    this.canidad_movimiento_pacientes = 0;

    this.listabodegas = [];
    this.listabodegasPaginacion = [];
    this.canidad_movimiento_bodegas = 0;
    this.listabodegas_aux = [];
    this.listabodegasPaginacion_aux = [];

    this.listabodegas_aux = [];
    this.listabodegasPaginacion_aux = [];

    this.listasolicitudes = [];
    this.listasolicitudesPaginacion = [];
    this.cantidad_solicitudes = 0;

    this.listasolicitudesacentrales = [];
    this.listasolicitudesacentralesPaginacion = [];
    this.cantidad_solicitudes_a_centrales = 0;

    this.loading = true;

    this._MovimientoInterfazBodegas = new (MovimientoInterfazBodegas);
    this._MovimientoInterfaz = new (MovimientoInterfaz);

    this._MovimientoInterfazBodegas.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this._MovimientoInterfazBodegas.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this._MovimientoInterfazBodegas.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this._MovimientoInterfazBodegas.fechainicio = fechadesde;
    this._MovimientoInterfazBodegas.fechatermino = fechahasta;
    this._MovimientoInterfazBodegas.servidor = this.servidor;

    this._MovimientoInterfaz.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this._MovimientoInterfaz.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this._MovimientoInterfaz.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this._MovimientoInterfaz.fechainicio = fechadesde;
    this._MovimientoInterfaz.fechatermino = fechahasta;
    this._MovimientoInterfaz.servidor = this.servidor;
  }

  refrescar() {
    this.descartarMensajeEnvioFin700()
    this.BuscarMovimientoInterfazERP()
    this.lForm.get("selecciontodopacientes").setValue(false);
    this.lForm.get("selecciontodobodegas").setValue(false);
    this.lForm.get("selecciontodosolicitudes").setValue(false);
    this.lForm.get("selecciontodosolicitudesacentrales").setValue(false);
  }

  eleccionopcion(opcion: string) {
  this.page = 1;
    this.selOpc = opcion;
    switch (opcion) {
      case 'BODEGAS': {
        this.opcion_bodegas = true;
        this.opcion_pacientes = false;
        this.opcion_solicitudes = false;
        this.opcion_solicitudes_a_centrales = false;
        this.lForm.get("selecciontodobodegas").setValue(false);
        break;
      }
      case 'PACIENTES': {
        this.opcion_bodegas = false;
        this.opcion_pacientes = true;
        this.opcion_solicitudes = false;
        this.opcion_solicitudes_a_centrales = false;
        this.lForm.get("selecciontodopacientes").setValue(false);

        break;
      }
      case 'SOLICITUDES': {
        this.opcion_bodegas = false;
        this.opcion_pacientes = false;
        this.opcion_solicitudes = true;
        this.opcion_solicitudes_a_centrales = false;
        this.lForm.get("selecciontodosolicitudes").setValue(false);

        break;
      }
      case 'SOLICITUDESACENTRALES': {
        this.opcion_bodegas = false;
        this.opcion_pacientes = false;
        this.opcion_solicitudes = false;
        this.opcion_solicitudes_a_centrales = true;
        this.lForm.get("selecciontodosolicitudesacentrales").setValue(false);

        break;
      }
      default: {
        this.opcion_bodegas = false;
        this.opcion_pacientes = true;
        this.opcion_solicitudes = false;
        this.opcion_solicitudes_a_centrales = false;
        break;
      }
    }
  }

  Enviar_bodegas(registro: MovimientoInterfazBodegas) {

    this.alertSwalError.text = null;
    this.alertSwalError.title = null;
    this.alertSwalError.titleText = null;
    this.alertSwal.title = null;
    this.loading = true;
    registro.usuario = sessionStorage.getItem('Usuario').toString();
    registro.servidor = this.servidor;

    var _EstructuraFin700 = new (EstructuraFin700)

    _EstructuraFin700.hdgcodigo = registro.hdgcodigo;
    _EstructuraFin700.esacodigo = registro.esacodigo;
    _EstructuraFin700.cmecodigo = registro.cmecodigo;

    _EstructuraFin700.idagrupador = 0;
    _EstructuraFin700.numeromovimiento = registro.id
    _EstructuraFin700.soliid = registro.soliid;
    _EstructuraFin700.servidor = this.servidor;
    _EstructuraFin700.tipomovimiento = registro.codtipmov;

    this._interfacesService.enviarErp(_EstructuraFin700).subscribe(
      response => {
        if (response == undefined || response === null) {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.hay.respuesta.servidor');
          this.alertSwalError.show();
          this.loading = false;
          this.refrescar();
          return;
        }else{
          this.respuestaerp = Number(response)
          if(this.respuestaerp > 0 ){
            this.alertSwal.title = this.TranslateUtil('key.mensaje.envio.erp.realizado');
            this.alertSwal.show();
            this.loading = false;
            this.refrescar();
          }else{
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.se.realiza.con.observaciones');
            this.alertSwalAlert.show();
            this.loading = false;
            this.refrescar();
          }
          return;
        }
      }
    )
  }

  Enviar_pacientes(registro: MovimientoInterfaz) {
    this.alertSwal.title = null
    this.alertSwalError.title = null;
    this.loading = true;
    registro.usuario = sessionStorage.getItem('Usuario').toString();
    registro.servidor = this.servidor;

    var _EstructuraFin700 = new (EstructuraFin700)

    _EstructuraFin700.hdgcodigo = registro.hdgcodigo;
    _EstructuraFin700.esacodigo = registro.esacodigo;
    _EstructuraFin700.cmecodigo = registro.cmecodigo;
    
    _EstructuraFin700.idagrupador = registro.idagrupador;
    _EstructuraFin700.soliid = registro.soliid;
    _EstructuraFin700.servidor = this.servidor;
    _EstructuraFin700.tipomovimiento = registro.codtipmov;

    this._interfacesService.enviarErp(_EstructuraFin700).subscribe(
      response => {
        if (response == undefined || response === null) {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.hay.respuesta.servidor');
          this.alertSwalError.show();
          this.loading = false;
          this.refrescar();
          return;
        } else {
          this.respuestaerp = Number(response)
          if(this.respuestaerp > 0 ){
            this.alertSwal.title = this.TranslateUtil('key.mensaje.envio.erp.realizado');
            this.alertSwal.show();
            this.loading = false;
            this.refrescar();
          }else{
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.se.realiza.con.observaciones');
            this.alertSwalAlert.show();
            this.loading = false;
            this.refrescar();
          }
          return;
        }
      });
  }

  Enviar_Solicitud(registro: SolicitudConsumo) {
    this.alertSwal.title = null
    this.alertSwalError.title = null;
    this.loading = true;
    var _ConsultaSolConsumoERP = new (ConsultaSolConsumoERP)
    _ConsultaSolConsumoERP.hdgcodigo = registro.hdgcodigo;
    _ConsultaSolConsumoERP.servidor  = this.servidor;
    _ConsultaSolConsumoERP.idsolicitud = registro.id;
    _ConsultaSolConsumoERP.tipo = 'CON';

    const respose = this._interfacesService.wsLogIntegraPedido(_ConsultaSolConsumoERP).subscribe(
      response => {
        if (response == undefined || response === null) {
          this.alertSwal.title = this.TranslateUtil('key.mensaje.no.hay.respuesta.servidor');
          this.alertSwal.show();
          this.loading = false;
          this.refrescar();
          return;
        }else {
          this.respuestaerp = Number(response)
          if(this.respuestaerp > 0 ){
            this.alertSwal.title = this.TranslateUtil('key.mensaje.envio.erp.realizado');
            this.alertSwal.show();
            this.loading = false;
            this.refrescar();
          }else{
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.se.realiza.con.observaciones');
            this.alertSwalAlert.show();
            this.loading = false;
            this.refrescar();
          }
          return;
        }
      }
    );
  }

  Enviar_Solicitud_A_Central(registro: Solicitud) {
    this.alertSwal.title = null
    this.alertSwalError.title = null;
    this.loading = true;
    var _ConsultaSolConsumoERP = new (ConsultaSolConsumoERP)
    _ConsultaSolConsumoERP.hdgcodigo = registro.hdgcodigo;
    _ConsultaSolConsumoERP.servidor  = this.servidor;
    _ConsultaSolConsumoERP.idsolicitud = registro.soliid;
    _ConsultaSolConsumoERP.tipo ='SOL';

    const respose = this._interfacesService.wsLogIntegraPedido(_ConsultaSolConsumoERP).subscribe(
      response => {
        if (response == undefined || response === null) {
          this.alertSwal.title = this.TranslateUtil('key.mensaje.no.hay.respuesta.servidor');
          this.alertSwal.show();
          this.loading = false;
          this.refrescar();
          return;
        }else {
          this.respuestaerp = Number(response)
          if(this.respuestaerp > 0 ){
            this.alertSwal.title = this.TranslateUtil('key.mensaje.envio.erp.realizado');
            this.alertSwal.show();
            this.loading = false;
            this.refrescar();
          }else{
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.se.realiza.con.observaciones');
            this.alertSwalAlert.show();
            this.loading = false;
            this.refrescar();
          }
          return;
        }
    });
  }

  pageChangedMovimientosBodegas(event: PageChangedEvent): void {
    // const startItem = (event.page - 1) * event.itemsPerPage;
    // const endItem = event.page * event.itemsPerPage;
    this.listabodegasPaginacion = this.listabodegas//.slice(startItem, endItem);
  }

  pageChangedMovimientosSolicitudes(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listasolicitudesPaginacion = this.listasolicitudes.slice(startItem, endItem);
  }

  pageChangedMovimientosPacientes(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listapacientesPaginacion = this.listapacientes.slice(startItem, endItem);
  }

  pageChangedMovimientosSolicitudesACentrales(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listasolicitudesacentralesPaginacion = this.listasolicitudesacentrales.slice(startItem, endItem);
  }

  cambio_check_paciente(id: number, property: string, event: any) {
    if (event.target.checked == false) {
      this.listapacientesPaginacion[id][property] = false;
      this.listapacientes[id][property] = this.listapacientesPaginacion[id][property]
    } else {
      this.listapacientesPaginacion[id][property] = true;
      this.listapacientes[id][property] = this.listapacientesPaginacion[id][property]
    }
  }

  cambio_check_solicitud(id: number, property: string, event: any) {
    if (event.target.checked == false) {
      this.listasolicitudesPaginacion[id][property] = false;
      this.listasolicitudes[id][property] = this.listasolicitudesPaginacion[id][property]
    } else {
      this.listasolicitudesPaginacion[id][property] = true;
      this.listasolicitudes[id][property] = this.listasolicitudesPaginacion[id][property]
    }
  }

  cambio_check_solicitud_central(id: number, property: string, event: any) {
    if (event.target.checked == false) {
      this.listasolicitudesacentralesPaginacion[id][property] = false;
      this.listasolicitudesacentrales[id][property] = this.listasolicitudesacentralesPaginacion[id][property]
    } else {
      this.listasolicitudesacentralesPaginacion[id][property] = true;
      this.listasolicitudesacentrales[id][property] = this.listasolicitudesacentralesPaginacion[id][property]
    }
  }

  cambio_checktodo_paciente(event: any) {
    var indice: number = 0;

    if (event.target.checked == true) {
      this.listapacientes.forEach(element => {
        if (element.interpestado == 'PENDIENTE' || element.interpestado == 'OBSERVADO') {
          this.listapacientes[indice].marca = true;
        }
        indice++;
      });
      this.listapacientesPaginacion = this.listapacientes;//.slice(0, 20);
    } else {
      this.listapacientes.forEach(element => {
        if (element.interpestado == 'PENDIENTE' || element.interpestado == 'OBSERVADO') {
          this.listapacientes[indice].marca = false;
        }
        indice++;
      });
      this.listapacientesPaginacion = this.listapacientes;//.slice(0, 20);
    }
  }

  cambio_checktodo_bodegas(event: any) {
    var indice: number = 0;

    if (event.target.checked == true) {
      this.listabodegas.forEach(element => {
        if (element.interpestado == 'PENDIENTE' || element.interpestado == 'OBSERVADO') {
          this.listabodegas[indice].marca = true;
        }
        indice++;
      });
      this.listabodegasPaginacion = this.listabodegasPaginacion//.slice(0, 20);
    } else {
      this.listabodegas.forEach(element => {
        if (element.interpestado == 'PENDIENTE' || element.interpestado == 'OBSERVADO') {
          this.listabodegas[indice].marca = false;
        }
        indice++;
      });
      this.listabodegasPaginacion = this.listabodegas;//.slice(0,20);
    }
  }

  cambio_checktodo_solicitud(event: any) {
    var indice: number = 0;

    if (event.target.checked == true) {
      this.listasolicitudes.forEach(element => {
        if (element.referenciacontable == 0) {
          this.listasolicitudes[indice].marca = true;
        }
        indice++;
      });
      this.listasolicitudesPaginacion = this.listasolicitudes;//.slice(0,20);
    } else {
      this.listasolicitudes.forEach(element => {
        if (element.referenciacontable == 0) {
          this.listasolicitudes[indice].marca = false;
        }
        indice++;
      });
      this.listasolicitudesPaginacion = this.listasolicitudes;//.slice(0,20);
    }
  }

  cambio_checktodo_solicitud_central(event: any) {
    var indice: number = 0;

    if (event.target.checked == true) {
      this.listasolicitudesacentrales.forEach(element => {
        if (element.nropedidofin700erp == 0) {
          this.listasolicitudesacentrales[indice].marcacabecera = true;
        }
        indice++;
      });
      this.listasolicitudesacentralesPaginacion = this.listasolicitudesacentrales;//.slice(0,20);
    } else {
      this.listasolicitudesacentrales.forEach(element => {
        if (element.nropedidofin700erp == 0) {
          this.listasolicitudesacentrales[indice].marcacabecera = false;
        }
        indice++;
      });
      this.listasolicitudesacentralesPaginacion = this.listasolicitudesacentrales;//.slice(0,20);
    }
  }

  SeleccionaEstadoMovBodega(value: string){
    this.listabodegas2 = [];
    // var codydesc = value.split('/')
    var codigo : string ;
    var descripcion : string;

    if(value === '1'){
      this.listabodegas = this.listabodegas_aux;
      this.listabodegasPaginacion = this.listabodegas//.slice(0,20);
    }else{
      this.estadostraspasos.forEach(x=>{
        if(Number(value)=== x.codigo){
          descripcion = x.descripcion;
          return;
        }
      })

      this.listabodegas_aux.forEach(x=>{
        var temporal = new MovimientoInterfazBodegas
        if(x.interpestado ===descripcion){
          temporal = x;

          this.listabodegas2.unshift(temporal);
        }
      });
      this.listabodegas = [];
      this.listabodegasPaginacion = [];
      this.listabodegas = this.listabodegas2;
      this.listabodegasPaginacion = this.listabodegas//.slice(0,20);
    }

  }

  filtrarSolicitudMovBod(value: number){
    this.listabodegas = [];
    this.listabodegasPaginacion = [];
    if(value > 0){
      this.listabodegasPaginacion.forEach(element => {
        if(element.soliid === Number(value)){
          this.listabodegas.unshift(element);
        }
      });
      this.listabodegasPaginacion = this.listabodegas;//.slice(0,20);
    } else {
      this.SeleccionaEstadoMovBodega(this.FormFiltroBod.controls.estado.value);
    }
  }

  SeleccionaTipoMovimBod(value:string){
    this.listabodegas2 = [];
    if(value === 'vacio'){
      this.listabodegas = this.listabodegas_aux;
      this.listabodegasPaginacion = this.listabodegas//.slice(0,20);
    }else{
      this.listabodegas.forEach(x=>{
        var temporal = new MovimientoInterfazBodegas
        if(x.tipomovimiento ===value){
          temporal = x;

          this.listabodegas2.unshift(temporal);
        }
      })
      this.listabodegas = [];
      this.listabodegasPaginacion = [];
      this.listabodegas = this.listabodegas2;
      this.listabodegasPaginacion = this.listabodegas//.slice(0,20);
    }
  }

  SeleccionaEstadoMovPaciente(value: string){
    this.listapacientes2 = [];

    var descripcion : string;
    if(value === '1'){
      this.listapacientes = this.listapacientes_aux;
      this.listapacientesPaginacion = this.listapacientes;//.slice(0,20);
    }else{
      this.estadostraspasos.forEach(x=>{
        if(Number(value)=== x.codigo){
          descripcion = x.descripcion;
          return;
        }
      });

      this.listapacientes_aux.forEach(x=>{
        var temporal = new MovimientoInterfaz
        if(x.interpestado ===descripcion){
          temporal = x;
          this.listapacientes2.unshift(temporal);
        }
      });
      this.listapacientes = [];
      this.listapacientesPaginacion = [];
      this.listapacientes = this.listapacientes2;
      this.listapacientesPaginacion = this.listapacientes;//.slice(0,20);
    }
  }

  LevantaDetalle(movimientobod:MovimientoInterfazBodegas, movimientopac : MovimientoInterfaz){
    if (movimientobod != null) {
      movimientobod.fechainicio = this.datePipe.transform(this.lForm.value.fechadesde, 'yyyy-MM-dd');
      movimientobod.fechatermino = this.datePipe.transform(this.lForm.value.fechahasta, 'yyyy-MM-dd');
    }
    if (movimientopac != null) {
      movimientopac.fechainicio = this.datePipe.transform(this.lForm.value.fechadesde, 'yyyy-MM-dd');
      movimientopac.fechatermino = this.datePipe.transform(this.lForm.value.fechahasta, 'yyyy-MM-dd');
    }
    this._BSModalRef = this._BsModalService.show(ModaldetallesolicitudMonitorERPComponent, this.setModal(movimientobod, movimientopac));
    this._BSModalRef.content.onClose.subscribe((Response : any) => {
      this.limpiarFiltros();
      this.BuscarMovimientoInterfazERP();
    });
  }

  setModal(movimientobod:MovimientoInterfazBodegas, movimientopac : MovimientoInterfaz) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.detalle.solicitud'),
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Medico',
        servidor: this.servidor,
        movimientobod: movimientobod,
        movimientopac: movimientopac
      }
    };
    return dtModal;
  }

  CargaCombos() {
    this._interfacesService.EstadosTraspasosFin700(this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.estadostraspasos = response;
          this.FormFiltroBod.get("estado").setValue(0);
        }
      },
    error => {
      alert(this.TranslateUtil('key.mensaje.error.buscar.estados'));
    });
    // Cargar combos
    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegasSolicitantes = response;
          this.bodegassuministro   = response;
        }
      },
    error => {
      alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
    });

    this.estructuraunidadesService.BuscarServicios(this.hdgcodigo,this.esacodigo,this.cmecodigo,this.usuario,this.servidor,3,'').subscribe(
      response => {
        if (response != null) {
          this.servicios = response;
        }
      },
    error => {
      alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
    });

    this._unidadesorganizacionaes.buscarCentroCosto("", 0, "CCOS", "", "", 0, this.cmecodigo, 0, 0, "S", sessionStorage.getItem('Usuario'), null,this.servidor).subscribe(
      response => {
        if (response != null) {
          this.ccostosolicitante = response;
        }
      },
      error => {
        alert("Error al Cargar Centros de Costos");
      }
    );

    this.EstadoSolicitudBodegaService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, sessionStorage.getItem('Usuario'), this.servidor).subscribe(
      data => {
        this.estadossolbods = data;
    });
  }

  limpiarFiltros() {
    this.descartarMensajeEnvioFin700()
    this.FormFiltroBod.reset();
    this.FormFiltroPac.reset();
    this.FormFiltroSolGS.reset();
    this.FormFiltroSolBC.reset();
    if(this.listabodegas != null){
      this.filtroBodega();
    }
    if(this.listapacientes != null){
      this.filtroPaciente();
    }
    if(this.listasolicitudes != null){
      this.filtroSolGS();
    }
  }

  filtroBodega(){
    this.listabodegasPaginacion = [];
    this.listabodegasPaginacion = this.listabodegas_aux//.slice(0,20);
    var valida : boolean = false;
    var id     : number = this.FormFiltroBod.controls.id.value;
    var soliid : number = this.FormFiltroBod.controls.soliid.value;
    var estado : string = this.FormFiltroBod.controls.estado.value;
    var fecha : string = this.FormFiltroBod.controls.fecha.value;
    var codbodegasuministro : string = this.FormFiltroBod.controls.codbodegasuministro.value;
    var codbodegasolicitantes : string = this.FormFiltroBod.controls.codbodegasolicitantes.value;
    var referencia : number = this.FormFiltroBod.controls.referencia.value;

    var listabodegasFiltro : Array<MovimientoInterfazBodegas> = this.listabodegas;
    var listaFiltro : Array<MovimientoInterfazBodegas> = [];

    if(id != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.id === id){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(soliid != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.soliid === soliid){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(estado != " " && estado != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.interpestado === estado){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(fecha != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.fecha.slice(0,-9) === this.datePipe.transform(fecha, 'dd-MM-yyyy')){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }


    if(codbodegasuministro != "" && codbodegasuministro != " " && codbodegasuministro != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.bodegadestino === codbodegasuministro){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(codbodegasolicitantes != "" && codbodegasolicitantes != " " && codbodegasolicitantes != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.bodegaorigen === codbodegasolicitantes){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(referencia != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.referenciacontable === referencia){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if (valida) {
      this.listabodegasPaginacion = listaFiltro//.slice(0,20);
    } else {
      this.listabodegasPaginacion = this.listabodegas//.slice(0,20);
    }
  }

  filtroPaciente(){
    this.listapacientesPaginacion = [];
    this.listapacientesPaginacion = this.listapacientes_aux;//.slice(0,20);
    var valida     : boolean = false;
    var id         : number = this.FormFiltroPac.controls.id.value;
    var soliid     : number = this.FormFiltroPac.controls.soliid.value;
    var fecha      : string = this.FormFiltroPac.controls.fecha.value;
    var receta     : number = this.FormFiltroPac.controls.receta.value;
    var cuenta     : number = this.FormFiltroPac.controls.cuenta.value;
    var rut        : string = this.FormFiltroPac.controls.rut.value;
    var paciente   : string = this.FormFiltroPac.controls.paciente.value;
    var servicio   : string = this.FormFiltroPac.controls.servicio.value;
    var estado     : string = this.FormFiltroPac.controls.estado.value;
    var referencia : string = this.FormFiltroPac.controls.referencia.value;

    var listaPacienteFiltro : Array<MovimientoInterfaz> = this.listapacientes;
    var listaFiltro : Array<MovimientoInterfaz> = [];

    if(id != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        if(element.fdeid === id){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if(soliid != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        if(element.soliid === soliid){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if(fecha != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        if(element.fecha.slice(0,-9) === this.datePipe.transform(fecha, 'dd-MM-yyyy')){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if(receta != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        if(element.numeroreceta === receta){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if(cuenta != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        if(element.ctanumcuenta === cuenta){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if(rut != "" && rut != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        if(element.identificacion.trim() === rut.trim()){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if(paciente != "" && paciente != " " && paciente != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        let posicion = element.paciente.indexOf(paciente.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if(servicio != "" && servicio != " " && servicio != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        if(element.servicio === servicio){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if(estado != "" && estado != " " && estado != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        if(element.interpestado === estado){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if(referencia != "" && referencia != " " && referencia != null){
      listaFiltro = [];
      valida = true;
      listaPacienteFiltro.forEach((element, index) => {
        if(element.referenciacontable == referencia){
          listaFiltro.unshift(element);
        }
      });
      listaPacienteFiltro = listaFiltro;
    }

    if (valida) {
      this.listapacientesPaginacion = listaFiltro;//.slice(0,20);
    } else {
      this.listapacientesPaginacion = this.listapacientes;//.slice(0,20);
    }
  }

  filtroSolGS(){
    this.listasolicitudesPaginacion = [];
    this.listasolicitudesPaginacion = this.listasolicitudes;//.slice(0,20);
    var valida : boolean = false;

    var  id                 : number = this.FormFiltroSolGS.controls.id.value;
    var  fechasolicitud     : string = this.FormFiltroSolGS.controls.fechasolicitud.value;
    var  glosacentrocosto   : string = this.FormFiltroSolGS.controls.glosacentrocosto.value;
    var  glosa              : string = this.FormFiltroSolGS.controls.glosa.value;
    var  glosaestado        : string = this.FormFiltroSolGS.controls.glosaestado.value;
    var  referenciacontable : string = this.FormFiltroSolGS.controls.referenciacontable.value;
    var  errorerp           : string = this.FormFiltroSolGS.controls.errorerp.value;

    var listabodegasFiltro : Array<SolicitudConsumo> = this.listasolicitudes;
    var listaFiltro : Array<SolicitudConsumo> = [];

    if(id != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.id === id){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(glosa != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.glosa.toUpperCase().indexOf(glosa.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(glosacentrocosto != "" && glosacentrocosto != " " && glosacentrocosto != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.glosacentrocosto === glosacentrocosto){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(fechasolicitud != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.fechasolicitud.slice(0,-9) === this.datePipe.transform(fechasolicitud, 'dd-MM-yyyy')){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(glosaestado != "" && glosaestado != " " && glosaestado != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.glosaestado === glosaestado){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(referenciacontable != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.referenciacontable.toString().indexOf(referenciacontable);
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(errorerp != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.errorerp.toUpperCase().indexOf(errorerp.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if (valida) {
      this.listasolicitudesPaginacion = listaFiltro;//.slice(0,20);
    } else {
      this.listasolicitudesPaginacion = this.listasolicitudes;//.slice(0,20);
    }
  }

  filtroSolBC(){
    this.listasolicitudesacentralesPaginacion = [];
    this.listasolicitudesacentralesPaginacion = this.listasolicitudesacentrales;//.slice(0,20);
    var valida : boolean = false;

    var id                 : string = this.FormFiltroSolBC.controls.id.value;
    var fechacreacion      : string = this.FormFiltroSolBC.controls.fechacreacion.value;
    var bodorigendesc      : string = this.FormFiltroSolBC.controls.bodorigendesc.value;
    var boddestinodesc     : string = this.FormFiltroSolBC.controls.boddestinodesc.value;
    var estadosolicitudde  : string = this.FormFiltroSolBC.controls.estadosolicitudde.value;
    var nropedidofin700erp : string = this.FormFiltroSolBC.controls.nropedidofin700erp.value;
    var errorerp           : string = this.FormFiltroSolBC.controls.errorerp.value;

    var listabodegasFiltro : Array<Solicitud> = this.listasolicitudesacentrales;
    var listaFiltro : Array<Solicitud> = [];

    if(id != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.soliid.toString().indexOf(id);
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(fechacreacion != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.fechacreacion.slice(0,-9) === this.datePipe.transform(fechacreacion, 'dd-MM-yyyy')){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(bodorigendesc != "" && bodorigendesc != " " && bodorigendesc != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.bodorigendesc === bodorigendesc){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(boddestinodesc != "" && boddestinodesc != " " && boddestinodesc != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.boddestinodesc === boddestinodesc){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(estadosolicitudde != "" && estadosolicitudde != " " && estadosolicitudde != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.estadosolicitudde === estadosolicitudde){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(nropedidofin700erp != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.nropedidofin700erp.toString().indexOf(nropedidofin700erp);
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(errorerp != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.errorerp.toUpperCase().indexOf(errorerp.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if (valida) {
      this.listasolicitudesacentralesPaginacion = listaFiltro;//.slice(0,20);
    } else {
      this.listasolicitudesacentralesPaginacion = this.listasolicitudesacentrales;//.slice(0,20);
    }
  }

  sortbyBod(opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.optBod === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.optBod = "DESC"
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.optBod = "ASC"
    }

    switch (opt) {
      case 'id':
        this.listabodegas.sort(function (a, b) {
          if (a.id > b.id) {
            return rtn1;
          }
          if (a.id < b.id) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'soliid':
        this.listabodegas.sort(function (a, b) {
          if (a.soliid > b.soliid) {
            return rtn1;
          }
          if (a.soliid < b.soliid) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'fecha':
        this.listabodegas.sort(function (a, b) {
          if (a.fecha > b.fecha) {
            return rtn1;
          }
          if (a.fecha < b.fecha) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'bodegaorigen':
        this.listabodegas.sort(function (a, b) {
          if (a.bodegaorigen > b.bodegaorigen) {
            return rtn1;
          }
          if (a.bodegaorigen < b.bodegaorigen) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'bodegadestino':
        this.listabodegas.sort(function (a, b) {
          if (a.bodegadestino > b.bodegadestino) {
            return rtn1;
          }
          if (a.bodegadestino < b.bodegadestino) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'interpestado':
        this.listabodegas.sort(function (a, b) {
          if (a.interpestado > b.interpestado) {
            return rtn1;
          }
          if (a.interpestado < b.interpestado) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'referenciacontable':
        this.listabodegas.sort(function (a, b) {
          if (a.referenciacontable > b.referenciacontable) {
            return rtn1;
          }
          if (a.referenciacontable < b.referenciacontable) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      default:
        break;
    }

  }

  sortbyPac(opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.optPac === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.optPac = "DESC"
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.optPac = "ASC"
    }

    switch (opt) {
      case 'id':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.fdeid > b.fdeid) {
            return rtn1;
          }
          if (a.fdeid < b.fdeid) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'soliid':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.soliid > b.soliid) {
            return rtn1;
          }
          if (a.soliid < b.soliid) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'fecha':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.fecha > b.fecha) {
            return rtn1;
          }
          if (a.fecha < b.fecha) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'numeroreceta':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.numeroreceta > b.numeroreceta) {
            return rtn1;
          }
          if (a.numeroreceta < b.numeroreceta) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'ctanumcuenta':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.ctanumcuenta > b.ctanumcuenta) {
            return rtn1;
          }
          if (a.ctanumcuenta < b.ctanumcuenta) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'identificacion':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.identificacion > b.identificacion) {
            return rtn1;
          }
          if (a.identificacion < b.identificacion) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'paciente':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.paciente > b.paciente) {
            return rtn1;
          }
          if (a.paciente < b.paciente) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'servicio':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.servicio > b.servicio) {
            return rtn1;
          }
          if (a.servicio < b.servicio) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'interpestado':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.interpestado > b.interpestado) {
            return rtn1;
          }
          if (a.interpestado < b.interpestado) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'referenciacontable':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.referenciacontable > b.referenciacontable) {
            return rtn1;
          }
          if (a.referenciacontable < b.referenciacontable) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      default:
        break;
    }
  }

  sortbySolGS (opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.optSolGS === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.optSolGS = "DESC";
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.optSolGS = "ASC"
    }

    switch (opt) {
      case 'id':
        this.listasolicitudesPaginacion.sort(function (a, b) {
          if (a.id > b.id) {
            return rtn1;
          }
          if (a.id < b.id) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'fechasolicitud':
        this.listasolicitudesPaginacion.sort(function (a, b) {
          if (a.fechasolicitud > b.fechasolicitud) {
            return rtn1;
          }
          if (a.fechasolicitud < b.fechasolicitud) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'glosacentrocosto':
        this.listasolicitudesPaginacion.sort(function (a, b) {
          if (a.glosacentrocosto > b.glosacentrocosto) {
            return rtn1;
          }
          if (a.glosacentrocosto < b.glosacentrocosto) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'glosa':
        this.listasolicitudesPaginacion.sort(function (a, b) {
          if (a.glosa > b.glosa) {
            return rtn1;
          }
          if (a.glosa < b.glosa) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'glosaestado':
        this.listasolicitudesPaginacion.sort(function (a, b) {
          if (a.glosaestado > b.glosaestado) {
            return rtn1;
          }
          if (a.glosaestado < b.glosaestado) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'referenciacontable':
        this.listasolicitudesPaginacion.sort(function (a, b) {
          if (a.referenciacontable > b.referenciacontable) {
            return rtn1;
          }
          if (a.referenciacontable < b.referenciacontable) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'errorerp':
        this.listasolicitudesPaginacion.sort(function (a, b) {
          if (a.errorerp > b.errorerp) {
            return rtn1;
          }
          if (a.errorerp < b.errorerp) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      default:
        break;
    }
  }

  sortbySolBC (opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.optSolBC === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.optSolBC = "DESC";
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.optSolBC = "ASC"
    }

    switch (opt) {
      case 'id':
        this.listasolicitudesacentralesPaginacion.sort(function (a, b) {
          if (a.soliid > b.soliid) {
            return rtn1;
          }
          if (a.soliid < b.soliid) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'fechacreacion':
        this.listasolicitudesacentralesPaginacion.sort(function (a, b) {
          if (a.fechacreacion > b.fechacreacion) {
            return rtn1;
          }
          if (a.fechacreacion < b.fechacreacion) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'bodorigendesc':
        this.listasolicitudesacentralesPaginacion.sort(function (a, b) {
          if (a.bodorigendesc > b.bodorigendesc) {
            return rtn1;
          }
          if (a.bodorigendesc < b.bodorigendesc) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'glosa':
        this.listasolicitudesacentralesPaginacion.sort(function (a, b) {
          if (a.glosa > b.glosa) {
            return rtn1;
          }
          if (a.glosa < b.glosa) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'boddestinodesc':
        this.listasolicitudesacentralesPaginacion.sort(function (a, b) {
          if (a.boddestinodesc > b.boddestinodesc) {
            return rtn1;
          }
          if (a.boddestinodesc < b.boddestinodesc) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'estadosolicitudde':
        this.listasolicitudesacentralesPaginacion.sort(function (a, b) {
          if (a.estadosolicitudde > b.estadosolicitudde) {
            return rtn1;
          }
          if (a.estadosolicitudde < b.estadosolicitudde) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'nropedidofin700erp':
        this.listasolicitudesacentralesPaginacion.sort(function (a, b) {
          if (a.nropedidofin700erp > b.nropedidofin700erp) {
            return rtn1;
          }
          if (a.nropedidofin700erp < b.nropedidofin700erp) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'errorerp':
        this.listasolicitudesacentralesPaginacion.sort(function (a, b) {
          if (a.errorerp > b.errorerp) {
            return rtn1;
          }
          if (a.errorerp < b.errorerp) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      default:
        break;
    }
  }

  async generarExcelDetalleMovimientoBodega(movimientoBodega: MovimientoInterfazBodegas) {
    const debeGenerarReporte = await this.abrirDialogoConfirmacionImpresion(
      '¿Desea Imprimir el Detalle del Movimiento?',
    );

    if (!debeGenerarReporte) {
      return;
    }

    try {
      await this.reportesERPService.generarExcelDetalleMovimientoBodega(movimientoBodega);
    } catch (error) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.excel.detalle.movimiento');
      this.alertSwalError.show();
    }
  }

  async generarExcelDetallePaciente(movimientoPaciente: MovimientoInterfaz) {
    const debeGenerarReporte = await this.abrirDialogoConfirmacionImpresion(
      '¿Desea Imprimir el detalle del paciente?',
    );

    if (!debeGenerarReporte) {
      return;
    }

    try {
      await this.reportesERPService.generarExcelDetallePaciente(
        movimientoPaciente,
        this.datePipe.transform(this.lForm.value.fechadesde, 'yyyy-MM-dd'),
        this.datePipe.transform(this.lForm.value.fechahasta, 'yyyy-MM-dd'),
      );
    } catch (error) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.excel.detalle.paciente');
      this.alertSwalError.show();
    }
  }

  async generarExcelGrillaCompleta() {
    switch (this.selOpc) {
      case 'BODEGAS': {
        const debeImprimir = await this.abrirDialogoConfirmacionImpresion(
          '¿Quiere imprimir el movimiento de bodegas?',
        );

        if (!debeImprimir) {
          return;
        }

        try {
          await this.reportesERPService.generarExcelMovimientosBodega(this.listabodegas);
        } catch (error) {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.excel.movimientos.bodegas');
          this.alertSwalError.show();
        }

        break;
      }

      case 'PACIENTES': {
        const debeImprimir = await this.abrirDialogoConfirmacionImpresion(
          '¿Quiere imprimir el movimiento de pacientes?',
        );

        if (!debeImprimir) {
          return;
        }

        try {
          await this.reportesERPService.generarExcelMovimientosPacientes(this.listapacientes);
        } catch (error) {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.excel.detalle.paciente');
          this.alertSwalError.show();
        }
        break;
      }

      case 'SOLICITUDES': {
        const debeImprimir = await this.abrirDialogoConfirmacionImpresion(
          '¿Quiere imprimir el movimiento de solicitudes consumo gasto servicio?',
        );

        if (!debeImprimir) {
          return;
        }

        try {
          await this.reportesERPService.generarExcelSolicitudesConsumoGastoServicio(
            this.listasolicitudes,
          );
        } catch (error) {
          this.alertSwalError.title =
          this.TranslateUtil('key.mensaje.error.generar.excel.movimientos.solicitudes.consumo.gasto.servicio');
          this.alertSwalError.show();
        }
        break;
      }

      case 'SOLICITUDESACENTRALES': {
        const debeImprimir = await this.abrirDialogoConfirmacionImpresion(
          '¿Quiere imprimir el movimiento de solicitudes a bodegas centrales?',
        );

        if (!debeImprimir) {
          return;
        }

        try {
          await this.reportesERPService.generarExcelMovimientoBodegasCentrales(
            this.listasolicitudesacentrales,
          );
        } catch (error) {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.excel.solicitudes.centrales');
          this.alertSwalError.show();
        }
        break;
      }

      default:
        throw new Error(
          `[MONITOR INTERFAZ DE MOVIMIENTOS ERP] Opción desconocida al generar Excel grilla: "${this.selOpc}"`,
        );
    }
  }

  private async abrirDialogoConfirmacionImpresion(mensaje: string) {
    const Swal = require('sweetalert2');

    const {value: debeGenerarReporte} = await Swal.fire({
      title: mensaje,
      text: this.TranslateUtil('key.mensaje.confirmar.impresion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
    });

    return !!debeGenerarReporte;
  }

  async hacerEnvioMasivoFin700() {
    const debeEnviarFin700 = await this.abrirDialogoConfirmacionEnvioFin700();

    if (!debeEnviarFin700) {
      return;
    }

    try {
      this.lForm.disable();

      const fechaDesde = this.datePipe.transform(this.lForm.value.fechadesde, 'dd-MM-yyyy');

      this.estadoEnvioTransaccionesConError = 'enviando';

      await this._interfacesService
        .envioMasivoFin700(
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.usuario,
          this.servidor,
          fechaDesde,
        )
        .toPromise();

      this.estadoEnvioTransaccionesConError = 'envio-exitoso';
    } catch (error) {
      console.error('[REPROCESAR TRANSACCIONES PENDIENTES]. ', error);

      this.estadoEnvioTransaccionesConError = 'envio-fallido';
    } finally {
      this.lForm.enable();
    }
  }

  private async abrirDialogoConfirmacionEnvioFin700() {
    const Swal = require('sweetalert2');

    const {value: debeEnviarFin700} = await Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.reprocesar.todas.transacciones.pendientes'),
      text: this.TranslateUtil('key.mensaje.no.abandonar.pagina.terminar.transacciones'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
    });

    return !!debeEnviarFin700;
  }

  descartarMensajeEnvioFin700() {
    this.estadoEnvioTransaccionesConError = 'inicial'
  }

  mensajeDesactivacionFallida() {
    return this.TranslateUtil('key.mensaje.no.salir.hasta.terminen.reprocesar.todos.movimientos.pendientes')
  }

  puedeDesactivar(): boolean {
    return !this.estaEnviandoAFin700()
  }

  estaEnviandoAFin700() {
    return this.estadoEnvioTransaccionesConError === 'enviando'
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
