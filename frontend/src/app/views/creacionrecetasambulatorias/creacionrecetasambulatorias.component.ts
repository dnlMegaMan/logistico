import { Component, OnInit, ViewChild, HostListener, ElementRef} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

/* Models */
import { DocIdentificacion } from '../../models/entity/DocIdentificacion';
import { Solicitud } from '../../models/entity/Solicitud';
import { DetalleSolicitud } from '../../models/entity/DetalleSolicitud';
import { Articulos } from '../../models/entity/mantencionarticulos';
import { DevuelveDatosUsuario } from '../../models/entity/DevuelveDatosUsuario';
import { CreacionReceta } from 'src/app/models/entity/CreacionReceta';
import { DetalleReceta } from 'src/app/models/entity/DetalleReceta';
import { DatosProfesional } from 'src/app/models/entity/DatosProfesional';
import { DetalleRecetas } from 'src/app/models/entity/detalle-recetas';
import { Receta } from 'src/app/models/entity/receta';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';

/*Components */
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { BusquedapacientesComponent } from '../busquedapacientes/busquedapacientes.component';
import { ModalbusquedaprofesionalComponent } from '../modalbusquedaprofesional/modalbusquedaprofesional.component';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BusquedarecetasComponent } from '../busquedarecetas/busquedarecetas.component';

/*Services */
import { DocidentificacionService } from '../../servicios/docidentificacion.service';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { TipoambitoService } from '../../servicios/tiposambito.service';
import { InformesService } from '../../servicios/informes.service';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { PacientesService } from '../../servicios/pacientes.service'
import { BodegasService } from '../../servicios/bodegas.service';

import { ListaCobros } from 'src/app/models/entity/ListaCobro';
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-creacionrecetasambulatorias',
  templateUrl: './creacionrecetasambulatorias.component.html',
  styleUrls: ['./creacionrecetasambulatorias.component.css'],
  providers: [InformesService],
})
export class CreacionrecetasambulatoriasComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;

  public modelopermisos : Permisosusuario = new Permisosusuario();
  public locale         = 'es';
  public bsConfig       : Partial<BsDatepickerConfig>;
  public colorTheme     = 'theme-blue';

  public alerts                          : Array<any> = [];
  public articulos                       : Array<Articulos> = [];
  public articulos2                      : Articulos;
  public docsidentis                     : Array<DocIdentificacion> = [];
  public docsidentisMedico                     : Array<DocIdentificacion> = [];

  public arrdetalleSolicitud             : Array<DetalleSolicitud> = [];
  public ArrdetalleSolicitud             : Array<DetalleReceta> = [];
  public arrdetalleSolicitudMed          : Array<DetalleRecetas> = [];
  public arrdetalleSolicitudPaginacion   : Array<DetalleSolicitud> = [];
  public arrdetalleSolicitudMedPaginacion: Array<DetalleRecetas> = [];
  public arrdetalleSolicitudMedPaginacion_aux: Array<DetalleRecetas> = [];
  public arrdetalleSolicitudMed_aux      : Array<DetalleRecetas> = [];
  public arrdetalleSolicitudMed_2        : Array<DetalleSolicitud> = [];

  public FormDatosPaciente      : FormGroup;
  public FormDatosProducto      : FormGroup;

  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  private _BSModalRef           : BsModalRef;
  public dataPacienteSolicitud  : Solicitud = new Solicitud();
  public _Solicitud             : Solicitud = new Solicitud();

  public PacienteSolicitud      : Solicitud = new Solicitud();
  public CreaRecetas            : CreacionReceta= new CreacionReceta();
  public datosprofesional       : DatosProfesional = new DatosProfesional();

  public servidor           = environment.URLServiciosRest.ambiente;
  public usuario            = environment.privilegios.usuario;
  public hdgcodigo          : number;
  public esacodigo          : number;
  public cmecodigo          : number;

  public existsolicitud     = false;
  public vacios             = true;
  public nuevasolicitud     = false;
  public tipobusqueda       = "Paciente";

  public loading            = false;
  public agregarproducto    = false;
  public accion             = 'I';
  public cantentregas       : number = 0;
  public diasentrega        : number = 0;
  public resid              : number = 0;
  public _Receta            : Receta;
  public ambito             : boolean = true;
  public codambito          : number = 3;
  public Receta             : Receta = new Receta();
  public bloqueacamposgrilla: boolean = false;
  public bloqueacamposgrilla2: boolean = false;
  public btnmodificar       : boolean = false;
  public btncrea            : boolean = false;
  public numreceta          : number ;
  public codprod            = null;
  public desactivabtnelim   : boolean = false;
  public ActivaBotonLimpiaBusca : boolean = false;
  public ActivaBotonBuscaGrilla : boolean = false;
  public listacobros        : Array<ListaCobros> = [];

  /**Usado para la funcion logicavacios()//@ML */
  public verificanull   = false;
  public activabtnbuscaprof : boolean = false;
  public desactivabtnbuscapac: boolean = true;
  public bodegacontrolado : string;
  public numeroreceta   : number;
  public activabtnbuscareceta: boolean = true;

  /** si bodegacontrolado = true no permite agregar otro producto */
  public codbodega = 0;
  public isbodegacontrolado = false;

  constructor(
    public datePipe                   : DatePipe,
    public localeService              : BsLocaleService,
    public DocidentificacionService   : DocidentificacionService,
    public formBuilder                : FormBuilder,
    public _BsModalService            : BsModalService,
    public _solicitudService          : SolicitudService,
    public _tipoambitoService         : TipoambitoService,
    private router                    : Router,
    private route                     : ActivatedRoute,
    public _PacientesService          : PacientesService,
    public _BodegasService            : BodegasService,
    private _imprimesolicitudService  : InformesService,
    public _BusquedaproductosService  : BusquedaproductosService,
    public translate: TranslateService
  ) {

    this.FormDatosPaciente = this.formBuilder.group({
      fechahora               : [new Date(), Validators.required],
      tipodocumento           : [{ value: null, disabled: true }, Validators.required],
      numidentificacion       : [{ value: null, disabled: true }, Validators.required],
      nombrepaciente          : [{ value: null, disabled: true }, Validators.required],
      sexo                    : [{ value: null, disabled: true }, Validators.required],
      edad                    : [{ value: null, disabled: true }, Validators.required],
      tipodocumentomed        : [{ value: null, disabled: false}, Validators.required],
      numidentificacionmedico : [{ value: null, disabled: false }, Validators.required],
      nombremedico            : [{ value: null, disabled: false }, Validators.required],
      apellidopatemedico      : [{ value: null, disabled: false }, Validators.required],
      apellidomatemedico      : [{ value: null, disabled: false }, Validators.required],
      bodcodigo               : [{ value: null, disabled: false }, Validators.required],
      numeroreceta            : [{ value: null, disabled: false }, Validators.required],
      receobservacion         : [{ value: null, disabled: false }, Validators.required],
      cobroincluido           : [{ value: null, disabled: false }, Validators.required],
      previsionpaciente       : [{ value: null, disabled: true }, Validators.required],
      plancotizante           : [{ value: null, disabled: true  }, Validators.required],
      bonificacion            : [{ value: null, disabled: true  }, Validators.required],
    });

    // this.FormDatosProducto = this.formBuilder.group({
    //   codigo  : [{ value: null, disabled: false }, Validators.required]
    // });
   }

  ngOnInit() {
    this.FormDatosProducto = this.formBuilder.group({
      codigo  : [{ value: null, disabled: false }, Validators.required],
      descripcion  : [{ value: null, disabled: false },]
    });
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario   = sessionStorage.getItem('Usuario').toString();

    this.FormDatosProducto.disable();

    this.FormDatosPaciente.controls.fechahora.disable();
    this.FormDatosPaciente.controls.tipodocumentomed.disable();
    this.FormDatosPaciente.controls.nombremedico.disable();
    this.FormDatosPaciente.controls.numidentificacionmedico.disable();
    this.FormDatosPaciente.controls.apellidopatemedico.disable();
    this.FormDatosPaciente.controls.apellidomatemedico.disable();
    this.FormDatosPaciente.controls.bodcodigo.disable();
    this.FormDatosPaciente.controls.cobroincluido.disable();

    this.setDate();
    this.datosUsuario();
    this.getParametros();
    this.getParametrosMedico();
    this.BuscaBodegaSolicitante();
    this.BuscaListaCobros();

    this.resid = 0;
    this.codambito = 3;
    this.ambito = false;
    this.FormDatosPaciente.controls.bodcodigo.disable();
    this.route.paramMap.subscribe(param => {
      if (param.has("id_reseta")) {
        this.resid = parseInt(param.get("id_reseta"), 10);
      }
    })

    if (this.resid != 0  )
      this.CargaPacienteReceta(this.resid);
  }

  ngOnDestroy(){
    if(this._Receta != undefined){
      if(this._Receta.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }

  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  datosUsuario() {
    var datosusuario = new DevuelveDatosUsuario();
    datosusuario = JSON.parse(sessionStorage.getItem('Login'));
    this.hdgcodigo = datosusuario[0].hdgcodigo;
    this.esacodigo = datosusuario[0].esacodigo;
    this.cmecodigo = datosusuario[0].cmecodigo;
  }

  async getParametros() {
    try {
      this.loading = true;
      this.docsidentis = await this.DocidentificacionService.list(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), false)
        .toPromise();
    } catch (err) {
      this.loading = false;
      this.uimensaje('danger', err.message, 7000);
    }
    this.loading = false;
  }

  async getParametrosMedico() {
    try {
      this.loading = true;         
        this.docsidentisMedico = await this.DocidentificacionService.list(this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), true)
        .toPromise();  
    } catch (err) {
      this.loading = false;
      this.uimensaje('danger', err.message, 7000);
    }
    this.loading = false;
  }

  uimensaje(status: string, texto: string, time: number = 0) {
    this.alerts = [];
    if (time !== 0) {
      this.alerts.push({
        type: status,
        msg: texto,
        timeout: time
      });
    } else {
      this.alerts.push({
        type: status,
        msg: texto
      });
    }
  }

  BuscaBodegaSolicitante() {
    this._BodegasService.listaBodegaDespachoReceta(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.bodegasSolicitantes = response;
        }
      },       error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  BuscaListaCobros() {
    this._BodegasService.listaCobros(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.listacobros = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  CargaPacienteReceta(numreceta: number) {
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.arrdetalleSolicitudMed = [];
    this.arrdetalleSolicitud= [];
    this.arrdetalleSolicitudMedPaginacion = [];
    this.arrdetalleSolicitudMed_aux = [];
    this.arrdetalleSolicitudMedPaginacion_aux = [];
    this.loading = true;
    // Cargando recetas apcientes
    this._Receta = new (Receta);
    this._Receta.recenumero = numreceta;
    this._Receta.hdgcodigo = this.hdgcodigo;
    this._Receta.esacodigo = this.esacodigo;
    this._Receta.cmecodigo = this.cmecodigo;
    this._Receta.servidor  = this.servidor;

    this._solicitudService.buscarestructurarecetas(this._Receta).subscribe(
      response => {
        if (response != null){
          if (response.length != 0) {
            if (response.length > 0) {

              this._Receta = response[0];

              if(this._Receta.recesolid >0 && this._Receta.receestadodespacho === 50){
                this.alertSwalAlert.title = "La receta N° " + this._Receta.recenumero+" ya fue dispensada en la solicitud: "+ this._Receta.recesolid;
                this.alertSwalAlert.show();
                this.loading = false;
                return
              }else{
                  if(this._Receta.receambito == 1 ||this._Receta.receambito== 2){
                    this.ambito = false;
                  }else{
                    if(this._Receta.receambito == 3){
                      this.ambito = true;
                    }
                  }

                  if(this._Receta.cajanumerocomprobante === 0){
                    this.FormDatosPaciente.controls.bodcodigo.disable();
                    this.FormDatosPaciente.controls.numeroreceta.disable();
                    this.FormDatosProducto.controls.codigo.disable();
                    this.FormDatosProducto.controls.descripcion.disable();
                    this.FormDatosPaciente.controls.cobroincluido.disable();
                    this.agregarproducto = false;
                    this.ActivaBotonBuscaGrilla = false;
                    this.desactivabtnbuscapac = false;
                    this.activabtnbuscareceta = false;
                    this.isbodegacontrolado = true;
                  }else{
                    this.FormDatosPaciente.controls.bodcodigo.disable();
                    this.FormDatosPaciente.controls.numeroreceta.disable();
                    this.FormDatosProducto.controls.codigo.disable();
                    this.FormDatosProducto.controls.descripcion.disable();
                    this.FormDatosPaciente.controls.receobservacion.disable();
                    this.agregarproducto = false;
                    this.ActivaBotonBuscaGrilla = false;
                    this.desactivabtnbuscapac = false;
                    this.activabtnbuscareceta = false;
                    this.isbodegacontrolado = true;
                    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.receta.se.encuentra.pagada');
                    this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                    this.alertSwalAlert.show();
                  }
                  this.btncrea = true;
                  if(this._Receta.recesolid >0 && this._Receta.receestadodespacho === 40){

                  }
                  this.FormDatosPaciente.get('tipodocumento').setValue(this._Receta.recetipdocpacglosa);
                  this.FormDatosPaciente.get('numidentificacion').setValue(this._Receta.recedocumpac);
                  this.FormDatosPaciente.get('nombrepaciente').setValue(this._Receta.recenombrepaciente);
                  this.FormDatosPaciente.get('plancotizante').setValue(this._Receta.plancotizante);
                  this.FormDatosPaciente.get('bonificacion').setValue(this._Receta.bonificacion);
                  this.FormDatosPaciente.get('numeroreceta').setValue(this._Receta.recenumero);
                  this.FormDatosPaciente.get('tipodocumentomed').setValue(response[0].recetipdocprof);
                  this.FormDatosPaciente.get('numidentificacionmedico').setValue(response[0].recedocumprof);
                  this.FormDatosPaciente.get('nombremedico').setValue(response[0].profnombre);
                  this.FormDatosPaciente.get('apellidopatemedico').setValue(response[0].profapepaterno);
                  this.FormDatosPaciente.get('apellidomatemedico').setValue(response[0].profapematerno);
                  this.FormDatosPaciente.get('receobservacion').setValue(response[0].receobservacion);
                  this.FormDatosPaciente.controls['cobroincluido'].setValue(response[0].codcobroincluido);

                  if( this._Receta.recetadetalle === null ){
                    this.loading = false;
                    return;

                  }
                  this._Receta.recetadetalle.forEach(element => {
                    var detreceta = new DetalleRecetas;
                    detreceta.redemeincodmei   = element.redemeincodmei;
                    detreceta.redemeindescri   = element.redemeindescri;
                    detreceta.rededosis        = element.rededosis;
                    detreceta.redeveces        = element.redeveces;
                    detreceta.redetiempo       = element.redetiempo;
                    detreceta.redecantidadsolo = element.redecantidadsolo;
                    detreceta.redecantidadadesp = element.redecantidadadesp;
                    detreceta.acciond           = "I";
                    detreceta.meinid            = element.meinid;
                    detreceta.meincontrolado    = element.meincontrolado;
                    detreceta.meintiporeg       = element.meintiporeg;
                    detreceta.bloqcampogrilla   = false;
                    detreceta.bloqcampogrilla3  = false;
                    detreceta.cantidadpagadacaja= element.cantidadpagadacaja;
                    detreceta.redeglosaposologia= element.redeglosaposologia;

                    this.dataPacienteSolicitud.cliid         = this._Receta.rececliid;
                    this.dataPacienteSolicitud.tipodocpac    = this._Receta.recetipdocpac;
                    this.dataPacienteSolicitud.numdocpac     = this._Receta.recedocumpac;
                    this._Solicitud.descidentificacion       = null;
                    this.dataPacienteSolicitud.apepaternopac = this._Receta.cliapepaterno;
                    this.dataPacienteSolicitud.apematernopac = this._Receta.cliapematerno;
                    this.dataPacienteSolicitud.nombrespac    = this._Receta.clinombres;
                    this.dataPacienteSolicitud.codambito     = this._Receta.receambito;
                    this.codambito = this._Receta.receambito;
                    this.dataPacienteSolicitud.ctaid         = this._Receta.recectaid;
                    this.dataPacienteSolicitud.codservicioactual = this._Receta.rececodservicio;
                    this.dataPacienteSolicitud.undglosa      = this._Receta.receglosaunidad;
                    this.dataPacienteSolicitud.camglosa      = this._Receta.receglosacama;
                    this.dataPacienteSolicitud.pzagloza      = this._Receta.receglosapieza;
                    this.dataPacienteSolicitud.tipodocprof   = this._Receta.recetipdocprof;
                    this.dataPacienteSolicitud.numdocprof    = this._Receta.recedocumprof;
                    this.dataPacienteSolicitud.nombremedico  = this._Receta.recenombremedico;
                    this.dataPacienteSolicitud.estid         = this._Receta.pestid;
                    this.dataPacienteSolicitud.solirecetipo  = this._Receta.recetipo;
                    this.dataPacienteSolicitud.receid        = this._Receta.receid;
                    this.dataPacienteSolicitud.numeroreceta  = this._Receta.recenumero;
                    this.dataPacienteSolicitud.cuentanumcuenta = this._Receta.ctanumcta.toString();

                    this.arrdetalleSolicitudMed.unshift(detreceta);
                    this.arrdetalleSolicitud.unshift(detreceta);
                    this.arrdetalleSolicitudMedPaginacion = this.arrdetalleSolicitudMed.slice(0,20);
                  })

                  this.arrdetalleSolicitudMed_aux = this.arrdetalleSolicitudMed;
                  this.arrdetalleSolicitudMedPaginacion_aux = this.arrdetalleSolicitudMedPaginacion

                  if(this.FormDatosPaciente.value.bodcodigo>0){
                  }

                  if(this.FormDatosPaciente.value.bodcodigo != null){
                    this.nuevasolicitud = true;
                  }

                  this.loading = false;


                  if(response[0].bandera ===2){

                    this.FormDatosProducto.controls.codigo.disable();
                    this.FormDatosProducto.controls.descripcion.disable();
                    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                    this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                    this.alertSwalAlert.show();
                  }
              }

              if(this._Receta.bandera === 2){

                this.verificanull = false;
                this.agregarproducto = false;
                this.FormDatosPaciente.disable();
                this.arrdetalleSolicitudMed.forEach(x=>{
                  x.bloqcampogrilla = false;
                })
                this.arrdetalleSolicitudMedPaginacion = this.arrdetalleSolicitudMed.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.receta.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                this.alertSwalAlert.show();
              }else{
                this.ValidaEstadoSolicitud(2,'CargaPacienteReceta');
              }
            }
          }
      } else {
        this.loading = false;
      }
    },
    error => {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.receta');
      this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.producido.buscar.receta');
      this.alertSwalError.show();
      this.loading = false;
    });
  }

  BuscarPaciente() {
    this.arrdetalleSolicitudMed = [];
    this.arrdetalleSolicitudMedPaginacion = [];
    this.arrdetalleSolicitud = [];
    this.arrdetalleSolicitudPaginacion =[];

    this._BSModalRef = this._BsModalService.show(BusquedapacientesComponent, this.setModal("Busqueda de Paciente"));
    this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
      if (Retorno !== undefined) {
        this.FormDatosPaciente.reset();
        this.FormDatosPaciente.get('fechahora').setValue(new Date());
        this.activabtnbuscaprof = true;
        if(Retorno.codambito == 1){ // aMBULATORIO

          this.ambito = false;
          this.dataPacienteSolicitud = new Solicitud();
          this.FormDatosPaciente.controls.tipodocumentomed.enable();
          this.dataPacienteSolicitud.cliid = Retorno.cliid;
          this.dataPacienteSolicitud.tipodocpac = Retorno.tipoidentificacion;
          this.dataPacienteSolicitud.numdocpac = Retorno.docuidentificacion;
          this.dataPacienteSolicitud.descidentificacion = Retorno.descidentificacion;
          this.dataPacienteSolicitud.apepaternopac = Retorno.apepaternopac;
          this.dataPacienteSolicitud.apematernopac = Retorno.apematernopac;
          this.dataPacienteSolicitud.nombrespac = Retorno.nombrespac;
          this.dataPacienteSolicitud.codambito = 1;
          this.dataPacienteSolicitud.edad = Retorno.edad;
          this.dataPacienteSolicitud.codsexo = Retorno.codsexo;
          this.dataPacienteSolicitud.ppnpaciente = Retorno.cliid;
          this.dataPacienteSolicitud.ctaid = Retorno.ctaid;
          this.dataPacienteSolicitud.estid = Retorno.estid;
          this.dataPacienteSolicitud.glsexo = Retorno.glsexo;
          this.dataPacienteSolicitud.glstipidentificacion = Retorno.glstipidentificacion;
          this.dataPacienteSolicitud.camglosa = Retorno.camaactual;
          this.dataPacienteSolicitud.previsionpaciente = Retorno.previsionpaciente;
          this.dataPacienteSolicitud.plancotizante = Retorno.plancotizante;
          this.dataPacienteSolicitud.bonificacion = Retorno.bonificacion;
          this.FormDatosPaciente.get('tipodocumento').setValue(this.dataPacienteSolicitud.descidentificacion);
          this.FormDatosPaciente.get('numidentificacion').setValue(this.dataPacienteSolicitud.numdocpac);
          this.FormDatosPaciente.get('nombrepaciente').setValue(`${this.dataPacienteSolicitud.nombrespac} ${this.dataPacienteSolicitud.apepaternopac} ${this.dataPacienteSolicitud.apematernopac}`);
          this.FormDatosPaciente.get('previsionpaciente').setValue(this.dataPacienteSolicitud.previsionpaciente)
          this.FormDatosPaciente.get('sexo').setValue(this.dataPacienteSolicitud.glsexo);
          this.FormDatosPaciente.get('edad').setValue(this.dataPacienteSolicitud.edad);
          this.FormDatosPaciente.get('plancotizante').setValue(this.dataPacienteSolicitud.plancotizante);
          this.FormDatosPaciente.get('bonificacion').setValue(this.dataPacienteSolicitud.bonificacion);

        }
        this.existsolicitud = false;
        this.nuevasolicitud = false;
      }
    })
  }

  setModal(titulo: string) {
    const dtModal: ModalOptions = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo        : titulo,
        hdgcodigo     : this.hdgcodigo,
        esacodigo     : this.esacodigo,
        cmecodigo     : this.cmecodigo,
        tipo_busqueda : 'Medicamentos',
        id_Bodega     : this.FormDatosPaciente.controls.bodcodigo.value,
        cliid         : this.dataPacienteSolicitud.cliid,
        ambito        : this.dataPacienteSolicitud.codambito,
        tipodocumeto  : this.dataPacienteSolicitud.tipodocpac,
        numeroidentificacion: this.dataPacienteSolicitud.numdocpac,
        origen        : 'Solicitud_Receta',
        codprod       : this.FormDatosProducto.value.codigo,
        descprod      : this.FormDatosProducto.value.descripcion,
        pagina        : 'Creación'
      }
    };

    return dtModal;
  }

  SeleccionTipoDoc(){
    this.FormDatosPaciente.controls.nombremedico.enable();
    this.FormDatosPaciente.controls.numidentificacionmedico.enable();
    this.FormDatosPaciente.controls.apellidopatemedico.enable();
    this.FormDatosPaciente.controls.apellidomatemedico.enable();
  }

  getMedicoTipoDoc(){
    if (this.FormDatosPaciente.controls.numidentificacionmedico.value === null) {
      return;
    } else {
      this._solicitudService.BuscaProfesional(this.servidor,
        this.FormDatosPaciente.controls.tipodocumentomed.value,
        this.FormDatosPaciente.controls.numidentificacionmedico.value,
        this.FormDatosPaciente.controls.apellidopatemedico.value,
      this.FormDatosPaciente.controls.apellidomatemedico.value,
      this.FormDatosPaciente.controls.nombremedico.value).subscribe(
        response => {
          if (response != null){
            if(response.length >1){
              this.BuscaProfesional();
            }else{
              if(response.length == 1){
                this.datosprofesional = response[0];
                this.desactivabtnbuscapac = false;
                this.FormDatosPaciente.get('tipodocumentomed').setValue(response[0].codtipidentificacion);
                this.FormDatosPaciente.get('numidentificacionmedico').setValue(response[0].clinumidentificacion);
                this.FormDatosPaciente.get('nombremedico').setValue(response[0].nombreprof);
                this.FormDatosPaciente.get('apellidopatemedico').setValue(response[0].paternoprof);
                this.FormDatosPaciente.get('apellidomatemedico').setValue(response[0].maternoprof);

                this.FormDatosPaciente.controls.bodcodigo.enable();
                this.FormDatosPaciente.controls.tipodocumentomed.disable();
                this.FormDatosPaciente.controls.nombremedico.disable();
                this.FormDatosPaciente.controls.numidentificacionmedico.disable();
                this.FormDatosPaciente.controls.apellidopatemedico.disable();
                this.FormDatosPaciente.controls.apellidomatemedico.disable();
              }
            }
          }
        });
    }
  }

  BuscaProfesional() {
    this._BSModalRef = this._BsModalService.show(ModalbusquedaprofesionalComponent, this.setModalBuscaProfesional("Busqueda Profesionales: "));
    this._BSModalRef.content.onClose.subscribe((Retorno: DatosProfesional) => {

      this.datosprofesional = Retorno;
      this.desactivabtnbuscapac = false;
      this.FormDatosPaciente.get('tipodocumentomed').setValue(Retorno.codtipidentificacion);
      this.FormDatosPaciente.get('numidentificacionmedico').setValue(Retorno.clinumidentificacion);
      this.FormDatosPaciente.get('nombremedico').setValue(Retorno.nombreprof);
      this.FormDatosPaciente.get('apellidopatemedico').setValue(Retorno.paternoprof);
      this.FormDatosPaciente.get('apellidomatemedico').setValue(Retorno.maternoprof);

      this.FormDatosPaciente.controls.bodcodigo.enable();
      this.FormDatosPaciente.controls.tipodocumentomed.disable();
      this.FormDatosPaciente.controls.nombremedico.disable();
      this.FormDatosPaciente.controls.numidentificacionmedico.disable();
      this.FormDatosPaciente.controls.apellidopatemedico.disable();
      this.FormDatosPaciente.controls.apellidomatemedico.disable();
    })
  }

  setModalBuscaProfesional(titulo: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo        : titulo,
        tipodocumento : this.FormDatosPaciente.controls.tipodocumentomed.value,
        numidentificacion: this.FormDatosPaciente.controls.numidentificacionmedico.value,
        nombres       : this.FormDatosPaciente.controls.nombremedico.value,
        apepaterno    : this.FormDatosPaciente.controls.apellidopatemedico.value,
        apematerno    : this.FormDatosPaciente.controls.apellidomatemedico.value,
      }
    };
    return dtModal;
  }

  SeleccionaBodegaActivaBtnAgregar(bodcodigo: number) {
    this.agregarproducto = true;

    this.FormDatosProducto.controls.codigo.enable();
    this.FormDatosPaciente.controls.cobroincluido.enable();

    this.codbodega = bodcodigo;
    this.logicaBodega();
  }

  ActivaBotonModificar(){
    if(this._Receta != undefined){
      if(this._Receta.receid >0 ){
        this.btnmodificar = true;
      }else{
        this.btnmodificar = false;
      }
    } else {
      this.btnmodificar = false;
    }
  }

  getRecetas(numeroreceta: string){
    const Swal = require('sweetalert2');
    this.numreceta = parseInt(numeroreceta);

    if(this.numreceta === null || Number.isNaN(this.numreceta) ||numeroreceta ===null){
      this.BuscarRecetas();
    }
    else{
      this._Receta = new (Receta);
      this._Receta.recenumero = this.numreceta;
      this._Receta.hdgcodigo = this.hdgcodigo;
      this._Receta.esacodigo = this.esacodigo;
      this._Receta.cmecodigo = this.cmecodigo;
      this._Receta.servidor  = this.servidor;
      this._solicitudService.buscarestructurarecetas(this._Receta).subscribe(
        response => {
          if (response != null){
            if (response.length == 0) {
              this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.numero.receta.buscada.no.existe');
              this.alertSwalAlert.show();
            } else {
              if (response.length > 0) {
                this.arrdetalleSolicitudMedPaginacion = [];
                this.arrdetalleSolicitudMed = [];
                switch (response[0].receambito) {
                  case 1: // Ambulatorio
                      this.CargaPacienteReceta(response[0].receid);

                  break;

                  default:
                    break;
                }
              }
            }
          }
        },
        error => {
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.receta');
            this.alertSwalError.show();
            this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
          })
        }
      )
    }
  }

  BuscarRecetas() {
    var pasoparemetro: string;
    pasoparemetro = this.FormDatosPaciente.get("nombrepaciente").value;
    if(pasoparemetro === null){
      pasoparemetro = " ";
    }

    const Swal = require('sweetalert2');
    this._BSModalRef = this._BsModalService.show(BusquedarecetasComponent, this.setModalBuscaReceta("Busqueda Recetas: "));
    this._BSModalRef.content.onClose.subscribe((Retorno: Receta) => {
      if (Retorno !== undefined) {
        this.existsolicitud = true;
        this.agregarproducto = true;

        switch (Retorno.receambito) {
          case 1: // Ambulatorio
              this.CargaPacienteReceta(Retorno.receid);
          break;
          default:
            break;
        }
      }
    })
  }

  setModalBuscaReceta(titulo: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo        : titulo,
        hdgcodigo     : this.hdgcodigo,
        esacodigo     : this.esacodigo,
        cmecodigo     : this.cmecodigo,
        pagina        : 'Creación',
        origen        : 'Solicitud_Receta',
      }
    };
    return dtModal;
  }

  getProducto() {
    this.codprod = this.FormDatosProducto.controls.codigo.value;
    this.alertSwalAlert.title = null;
    var validacodigo = false;
    if (this.codprod === null || this.codprod === '') {
      this.onBuscarProducto();

    } else {
      this.loading = true;
      const tipodeproducto = 'MIM';
      const controlado = '';
      const controlminimo = '';
      var idBodega = 0;
      const consignacion = '';
      if (this.FormDatosPaciente.controls.bodcodigo.value > 0) {
        idBodega = this.FormDatosPaciente.controls.bodcodigo.value;
      }
      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
        this.cmecodigo, this.codprod, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
        , this.usuario, null, this.servidor).subscribe(
          response => {
            if (response != null){
              if (!response.length) {
                this.loading = false;
              } else if (response.length) {
                if(response.length > 1){
                  this.onBuscarProducto();
                  this.loading = false;
                }else{
                  if(response.length == 1){
                    this.loading = false;
                    this.articulos2 = response[0];
                    this.FormDatosProducto.reset();
                    this.bodegasSolicitantes.forEach(x=>{
                      if( this.FormDatosPaciente.controls.bodcodigo.value === x.bodcodigo){
                        this.bodegacontrolado = x.bodcontrolado;
                        return
                      }
                    })
                    if(this.bodegacontrolado ==='N'){
                      if(this.articulos2.controlado === 'N'){
                        this.bloqueacamposgrilla= true;
                        this.bloqueacamposgrilla2 = true;
                        this.btncrea = true;
                        this.FormDatosPaciente.controls.bodcodigo.disable();
                        this.FormDatosProducto.controls.descripcion.disable();
                        this.setArray(this.articulos2);
                      }else{
                        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.puede.ingresar.medicamentos.controlados');
                        this.alertSwalAlert.show();
                      }
                    }else{
                      if(this.bodegacontrolado ==='S'){
                        if(this.articulos2.controlado === 'S'){
                          this.bloqueacamposgrilla= true;
                          this.bloqueacamposgrilla2 = true;
                          this.btncrea = true;
                          this.FormDatosPaciente.controls.bodcodigo.disable();
                          this.FormDatosProducto.controls.descripcion.disable();
                          this.setArray(this.articulos2);
                        }else{
                          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.ingresar.medicamentos.controlados');
                          this.alertSwalAlert.show();
                        }
                      }
                    }
                  }
                }
              }
            }
            this.focusField.nativeElement.focus();
            this.logicaBodega();
          }, error => {
            this.loading = false;
          }
        );
    }

  }

  buscarProductoPorDescripcion() {
    const { descripcion } = this.FormDatosProducto.value;
    if (!descripcion || descripcion.trim() === '') {
      return;
    }

    this.onBuscarProducto();   
  }

  onBuscarProducto() {
    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModal("Búsqueda de Productos"));
    this._BSModalRef.content.onClose.subscribe((RetornoProductos: Articulos | undefined) => {
      if (RetornoProductos !== undefined) {
        this.articulos2 = RetornoProductos;
        this.bodegasSolicitantes.forEach(x=>{
          if( this.FormDatosPaciente.controls.bodcodigo.value === x.bodcodigo){
            this.bodegacontrolado = x.bodcontrolado;
            return
          }
        })
        if(this.bodegacontrolado ==='N'){
          if(this.articulos2.controlado === 'N'){
            this.bloqueacamposgrilla= true;
            this.bloqueacamposgrilla2 = true;
            this.btncrea = true;
            this.FormDatosPaciente.controls.bodcodigo.disable();
            this.setArray(this.articulos2);
          }else{
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.puede.ingresar.medicamentos.controlados');
            this.alertSwalAlert.show();
          }
        }else{
          if(this.bodegacontrolado ==='S'){
            if(this.articulos2.controlado === 'S'){
              this.bloqueacamposgrilla= true;
              this.bloqueacamposgrilla2 = true;
              this.btncrea = true;
              this.FormDatosPaciente.controls.bodcodigo.disable();
              this.setArray(this.articulos2);
            }else{
              this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.ingresar.medicamentos.controlados');
              this.alertSwalAlert.show();
            }
          }
        }

        if (this.existsolicitud == false) {
          this.nuevasolicitud = true;
        }
      }
      this.logicaBodega();
    });
  }

  async setArray(art: Articulos) {
    let indice : number;
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.alertSwalError.title = null;

    var detalleReceta = new DetalleRecetas;
    detalleReceta.redeid            = 0;
    detalleReceta.redemeincodmei    = art.codigo;
    detalleReceta.rededosis         = 0;
    detalleReceta.redeveces         = 0;
    detalleReceta.redetiempo        = 0;
    detalleReceta.redecantidadsolo  = 0;
    detalleReceta.redemeindescri    = art.descripcion;
    detalleReceta.redeglosaposologia= '';
    detalleReceta.acciond           = this.accion;
    detalleReceta.redecantidadadesp = 0;
    detalleReceta.meintiporeg       = art.tiporegistro;
    detalleReceta.meincontrolado    = art.controlado;
    detalleReceta.bloqcampogrilla   = true;
    detalleReceta.bloqcampogrilla3  = true;
    detalleReceta.stock = Number(art.saldo);
    if (detalleReceta.meintiporeg == "M") {
      const indx = this.arrdetalleSolicitudMed.findIndex(x => x.redemeincodmei === this.articulos2.codigo, 1);
      if (indx >= 0) {
        this.alertSwalError.title= this.TranslateUtil('key.mensaje.codigo.existe.grilla');
        this.alertSwalError.text = null;
        this.alertSwalError.show();
      }
      else{
        this.ActivaBotonBuscaGrilla = true;
        this.arrdetalleSolicitudMed.unshift(detalleReceta);
        this.arrdetalleSolicitudMedPaginacion = this.arrdetalleSolicitudMed.slice(0, 20);
        this.logicaVacios();
      }
    }else{
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.ingresar.medicamentos.receta');
      this.alertSwalAlert.show();
    }
    this.arrdetalleSolicitudMedPaginacion = this.arrdetalleSolicitudMed.slice(0, 20);
    this.arrdetalleSolicitudMed_aux = this.arrdetalleSolicitudMed;
    this.arrdetalleSolicitudMedPaginacion_aux = this.arrdetalleSolicitudMedPaginacion;
    this.FormDatosProducto.reset();

    if(this.esacodigo === 2){
      if(this.FormDatosPaciente.controls.bodcodigo.value === 6){
          this.agregarproducto = false;
      }
    }else{
      if(this.FormDatosPaciente.controls.bodcodigo.value === 78){
          this.agregarproducto = false;
      }
    }
  }

  limpiarCodigo() {
    var codProdAux = '';
    this.arrdetalleSolicitudMed = [];
    this.arrdetalleSolicitudMedPaginacion = [];
    // Llenar Array Auxiliares
    this.arrdetalleSolicitudMed = this.arrdetalleSolicitudMed_aux;
    this.arrdetalleSolicitudMedPaginacion = this.arrdetalleSolicitudMedPaginacion_aux;
    this.ActivaBotonLimpiaBusca = false;
    this.FormDatosProducto.controls.codigo.setValue('');

  }

  /* Calculo formulación grilla Productos*/
  setCantidadsolicitada(detalle: DetalleRecetas) {

    this.alertSwalAlert.title = null;
    let dosis, dias, total: number = 0;
    dosis = detalle.rededosis;
    dias = detalle.redetiempo;
    total = dosis * detalle.redeveces;
    detalle.redecantidadsolo = total * dias;
    if (dosis < 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.la.dosis.debe.ser.mayor.cero');
      this.alertSwalAlert.show();
      detalle.rededosis = 0;
    }
    if (dias < 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.dias.ingresar.mayor.cero');
      this.alertSwalAlert.show();
      detalle.redetiempo = 0;
    }
    if (detalle.redeveces < 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.veces.al.dia.mayor.cero');
      this.alertSwalAlert.show();
      detalle.redeveces = 0;
    }
    if (detalle.redecantidadsolo < 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.cantidad.dispensar.mayor.cero');
      this.alertSwalAlert.show();
    }
    detalle.redecantidadadesp = detalle.redecantidadsolo;
    /* Si la busqueda es 'Solicitud'..
    si acciond=I (inserta) entonces mantiene..de lo contrario acciond=M (modifica) */
    if (this.tipobusqueda == 'Solicitud') {
      if (detalle.acciond !== 'I') {
        detalle.acciond = 'M';
      }
    }
    /** Verifica check Progr. */
    if (detalle.marcacheckgrilla == true) {
      detalle.redetiempo = this.diasentrega;
      detalle.redecantidadsolo = total * detalle.redetiempo;
      detalle.redecantidadadesp = Math.round((detalle.redecantidadsolo) / this.cantentregas);
    } else if (detalle.marcacheckgrilla == false) {
      detalle.redetiempo = 0;
    }
    this.logicaVacios();
  }

  async CambioCheck(registro: DetalleRecetas,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      registro.marcacheckgrilla = true;
      this.desactivabtnelim = true;
      await this.isEliminaInsGrilla(registro)
      await this.arrdetalleSolicitudMed.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;
        }
      })
     }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelim = false;
      await this.isEliminaInsGrilla(registro);
      await this.arrdetalleSolicitudMed.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;
        }
      })
    }
  }

  isEliminaInsGrilla(registro: DetalleRecetas) {
    let indice = 0;
    for (const articulo of this.arrdetalleSolicitudMed) {
      if (registro.redemeincodmei === articulo.redemeincodmei ) {
        articulo.marcacheckgrilla = registro.marcacheckgrilla;
        return indice;
      }
      indice++;
    }
    return -1;
  }

  ConfirmaEliminaProductoDeLaGrilla2() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.eliminacion.producto.receta'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion.producto'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.EliminaProductoDeLaGrilla2();
      }
    })
  }

  EliminaProductoDeLaGrilla2() {
    this.arrdetalleSolicitudMedPaginacion.forEach(dat=>{
      if (dat.acciond === "I"  && dat.redeid === 0 || dat.redeid === undefined) {
        if(dat.marcacheckgrilla ===true){
          if(this.isEliminaIns2(dat)<0){
            this.logicaVacios();
          }else{
            this.desactivabtnelim = false;
            this.arrdetalleSolicitudMed.splice(this.isEliminaIns2(dat), 1);
            this.arrdetalleSolicitudMedPaginacion = this.arrdetalleSolicitudMed.slice(0, 20);
            this.logicaVacios();
          }
        }else{
          this.logicaVacios();
        }
      }
    })
  }

  isEliminaIns2(registro: DetalleRecetas) {
    let indice = 0;
    for (const articulo of this.arrdetalleSolicitudMed) {
      if (registro.redemeincodmei === articulo.redemeincodmei) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

  async logicaVacios() {
      await this.vaciosProductos();
      if (this.vacios === true ) {
        this.verificanull = false;
      }else{
        this.verificanull = true;
      }
  }

  vaciosProductos() {
    if (this.arrdetalleSolicitudMedPaginacion.length) {
      for (var data of this.arrdetalleSolicitudMedPaginacion) {
        if (data.rededosis <= 0 || data.redeveces <= 0 || data.redetiempo <= 0 ||
          data.redecantidadsolo <=0 || data.rededosis === null || data.redeveces === null ||
          data.redetiempo === null || data.redecantidadsolo === null) {

          this.vacios = true;
          return;
        } else {
            this.vacios = false;
        }
      }
    }else{
      this.vacios= true;
    }
  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arrdetalleSolicitudMedPaginacion = this.arrdetalleSolicitudMed.slice(startItem, endItem);
  }

  CrearRecetas(){
    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;
    this.ArrdetalleSolicitud = [];
    try {
      this.CreaRecetas = new CreacionReceta();
      this.CreaRecetas.hdgcodigo = this.hdgcodigo;
      this.CreaRecetas.esacodigo = this.esacodigo;
      this.CreaRecetas.cmecodigo = this.cmecodigo;
      this.CreaRecetas.ambito    = this.dataPacienteSolicitud.codambito;
      this.CreaRecetas.tipo      = 'MANUAL';
      if(this.FormDatosPaciente.controls.numeroreceta.value === null){
        this.CreaRecetas.numero  = 0;
      }else{
        this.CreaRecetas.numero  = parseInt(this.FormDatosPaciente.controls.numeroreceta.value);
      }
      this.CreaRecetas.subreceta = 1;
      this.CreaRecetas.fecha     = '';
      this.CreaRecetas.fechaentrega = ''
      this.CreaRecetas.fichapaci = 0;
      this.CreaRecetas.ctaid     = this.dataPacienteSolicitud.ctaid;
      this.CreaRecetas.urgid     = 0;
      this.CreaRecetas.dau       = 0;
      this.CreaRecetas.clid      = this.dataPacienteSolicitud.cliid;
      this.CreaRecetas.tipdocpac = this.dataPacienteSolicitud.tipodocpac;
      if (this.dataPacienteSolicitud.numdocpac == undefined) {
        this.CreaRecetas.documpac ='';
      } else {
        this.CreaRecetas.documpac = this.dataPacienteSolicitud.numdocpac.trim();
      }
      this.CreaRecetas.nombrepaciente = this.dataPacienteSolicitud.nombrespac +' '+ this.dataPacienteSolicitud.apepaternopac +' '+ this.dataPacienteSolicitud.apematernopac;
      this.CreaRecetas.tipdocprof     = this.datosprofesional.codtipidentificacion;
      this.CreaRecetas.documprof      = this.datosprofesional.clinumidentificacion;
      this.CreaRecetas.nombremedico   = this.datosprofesional.nombreprof +' '+ this.datosprofesional.paternoprof +' '+ this.datosprofesional.maternoprof;
      this.CreaRecetas.especialidad   = this.datosprofesional.especialidad;
      this.CreaRecetas.rolprof        = this.datosprofesional.rolprofesional;
      this.CreaRecetas.codunidad      = '';
      this.CreaRecetas.glosaunidad    = this.dataPacienteSolicitud.undglosa;
      this.CreaRecetas.codservicio    = this.dataPacienteSolicitud.codservicioactual;
      this.CreaRecetas.glosaservicio  = '';
      this.CreaRecetas.codcama        = this.dataPacienteSolicitud.cama;
      this.CreaRecetas.camglosa       = this.dataPacienteSolicitud.camglosa
      this.CreaRecetas.codpieza       = this.dataPacienteSolicitud.codpieza;
      this.CreaRecetas.pzagloza       = this.dataPacienteSolicitud.pzagloza;
      this.CreaRecetas.tipoprevision  = null;
      this.CreaRecetas.glosaprevision = null;
      this.CreaRecetas.previsionpac   = null;
      this.CreaRecetas.glosaprevpac   = null;
      this.CreaRecetas.estadoreceta   = 'PE'
      this.CreaRecetas.servidor       = this.servidor;
      this.CreaRecetas.receobservacion= this.FormDatosPaciente.controls.receobservacion.value;
      this.CreaRecetas.codcobroincluido = this.FormDatosPaciente.controls.cobroincluido.value;
      this.CreaRecetas.codbodega      = this.FormDatosPaciente.controls.bodcodigo.value;
      this.arrdetalleSolicitudMed.forEach(x=>{
        var temporal = new DetalleReceta;
        temporal.redeid     = x.redeid;
        temporal.codigoprod = x.redemeincodmei;
        temporal.descriprod = x.redemeindescri;
        temporal.dosis      = x.rededosis;
        temporal.tiempo     = x.redetiempo;
        temporal.veces      = x.redeveces;
        temporal.glosaposo  = x.redeglosaposologia;
        temporal.cantidadsolici= x.redecantidadsolo;
        temporal.cantidadadespa= 0;
        temporal.estadoprod = 'PE';
        temporal.acciond    = x.acciond;

        this.ArrdetalleSolicitud.unshift(temporal);
      })
      this.CreaRecetas.recetadetalle  = this.ArrdetalleSolicitud;

      if(this._Receta!=undefined){
        this.CreaRecetas.receid    = this._Receta.receid;
        this.CreaRecetas.recetadetalle.forEach(x=>{
          x.acciond = 'M';
        });
        this.modalconfirmarReceta("Modificar Receta","Modifica");
      }else{
        this.CreaRecetas.receid    = 0;

        this.modalconfirmarReceta("Creación Receta","Crea");
      }
    } catch (err) {
      this.alertSwalError.title = "Error";
      this.alertSwalError.text = err.message;
      this.alertSwalError.show();
    }
  }

  modalconfirmarReceta(mensaje: string, accion: string) {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿'.concat(mensaje).concat('?'),
      text: "Confirmar la acción",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then(async (result) => {
      if (result.value) {
        this.loading = true;
        try {
          this._solicitudService.CrearReceta(this.CreaRecetas).subscribe(response => {
            this.numeroreceta = Number(response);
            this.alertSwal.title = mensaje.concat(" Exitosa N°").concat(response);
            this.alertSwal.show();

            this.verificanull = false;
            this.btnmodificar = false;
            this.arrdetalleSolicitudMed.forEach(x=>{
              x.bloqcampogrilla= false;
              x.bloqcampogrilla3= false;
            })
            this.arrdetalleSolicitudMedPaginacion = this.arrdetalleSolicitudMed.slice(0,20);
            this.FormDatosProducto.controls.codigo.disable();
            this.FormDatosProducto.controls.descripcion.disable();
            this.FormDatosPaciente.controls.numeroreceta.disable();
            this.agregarproducto = false;
            this.ActivaBotonBuscaGrilla = false;
            this.activabtnbuscareceta = false;
            this.CargaPacienteReceta(this.numeroreceta);

            this.loading = false;
          })
          this.loading = false;
        } catch (err) {
          this.loading = false;
          this.alertSwalError.text = err.message;
          this.alertSwalError.show();
        };
      }
    });
  }

  limpiar() {
    if(this._Receta != undefined){
      if(this._Receta.bandera != 2){
        this.ValidaEstadoSolicitud(1,'limpiar');
      }
    }
    this.loading = true;
    this.dataPacienteSolicitud = new Solicitud();;
    this.FormDatosPaciente.reset();
    this._Receta = null;
    this.arrdetalleSolicitud = [];
    this.ArrdetalleSolicitud = [];
    this.arrdetalleSolicitudPaginacion = [];
    this.arrdetalleSolicitudMed = [];
    this.arrdetalleSolicitudMedPaginacion = [];
    this.arrdetalleSolicitudMed_aux = [];
    this.arrdetalleSolicitudMedPaginacion_aux = [];
    this.arrdetalleSolicitudMed_2 = [];
    this.articulos = [];
    this.articulos = null;
    this.FormDatosPaciente.get('fechahora').setValue(new Date());
    this.existsolicitud = false;
    this.nuevasolicitud = false;
    this.agregarproducto = false;
    this.loading = false;
    this.existsolicitud = false;
    this.bloqueacamposgrilla = false;
    this.FormDatosPaciente.controls.bodcodigo.disable();
    this.bloqueacamposgrilla2 = false;
    this.btncrea = false;
    this.btnmodificar = false;
    this.numreceta = null;
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.FormDatosPaciente.controls.numeroreceta.enable();
    this.desactivabtnelim = false;
    this.verificanull = false;
    this.ActivaBotonBuscaGrilla = false;
    this.FormDatosPaciente.controls.nombremedico.disable();
    this.FormDatosPaciente.controls.numidentificacionmedico.disable();
    this.FormDatosPaciente.controls.apellidopatemedico.disable();
    this.FormDatosPaciente.controls.apellidomatemedico.disable();
    this.FormDatosPaciente.controls.tipodocumentomed.disable();
    this.FormDatosPaciente.controls.bodcodigo.disable();
    this.activabtnbuscaprof = false;
    this.desactivabtnbuscapac = true;
    this.FormDatosPaciente.controls.numeroreceta.enable();
    this.FormDatosPaciente.controls.receobservacion.enable();
    this.activabtnbuscareceta = true;
    this.FormDatosProducto.reset();

  }

  Salir() {

    if(this._Receta != undefined){
      if(this._Receta.bandera != 2){
        this.ValidaEstadoSolicitud(1,'salir');
      }
    }

    this.route.paramMap.subscribe(param => {
      if (param.has("retorno_pagina")) {

        switch (param.get("retorno_pagina")) {
          case "consultarecetasambulatoria":
            this.router.navigate(['consultarecetasambulatoria']);
            break;
            case "monitorejecutivo":
              this.router.navigate(['monitorejecutivo']);
              break;
          default:
            this.router.navigate(['home']);
        }
      } else {
        this.router.navigate(['home']);
      }
    })
  }

  ValidaEstadoSolicitud(bandera: number, nada:string){
    var recetaid : number = 0;
    var soliid   : number = 0;
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.soliid === undefined){
        soliid = 0;
      }else{
        soliid = this.dataPacienteSolicitud.soliid;
      }
    } else {
      soliid = 0;
    }

    if(this._Receta != undefined){
      if(this._Receta.receid === undefined){
        recetaid = 0;
      }else{
        recetaid = this._Receta.receid;
      }
    } else {
      recetaid = 0;
    }

    this._solicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,
      ' ',recetaid,bandera).subscribe(
      response => { });
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {​​​​​​​​
    if(this._Receta != undefined){
      if(this._Receta.bandera != 2){
        this.ValidaEstadoSolicitud(1,'HostListener');
      }
    }
  }​​​​​​​​

  /** no permite agregar mas de 1 producto para bodega controlado */
  logicaBodega() {
    const { bodcontrolado } = this.bodegasSolicitantes.find((b) => b.bodcodigo === this.codbodega);
    if( bodcontrolado === "S" &&
        this.arrdetalleSolicitudMedPaginacion.length > 0 ) {
      this.isbodegacontrolado = true;
      this.FormDatosProducto.disable();
    }else {
      this.FormDatosProducto.enable();
      this.isbodegacontrolado = false;
    }

  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }

}
