import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { DatePipe } from '@angular/common';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
/* Tabs */
import { TabsetComponent } from 'ngx-bootstrap/tabs';
/* Models */
import { DocIdentificacion } from '../../models/entity/DocIdentificacion';
import { Solicitud } from '../../models/entity/Solicitud';
import { DetalleSolicitud } from '../../models/entity/DetalleSolicitud';
import { Articulos } from '../../models/entity/mantencionarticulos';
import { TipoAmbito } from '../../models/entity/TipoAmbito';
import { EstadoSolicitud } from '../../models/entity/EstadoSolicitud';
import { DevuelveDatosUsuario } from '../../models/entity/DevuelveDatosUsuario';
/*Components */
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { ModalpacienteComponent } from '../modalpaciente/modalpaciente.component';
import { BusquedasolicitudpacientesComponent } from '../busquedasolicitudpacientes/busquedasolicitudpacientes.component';
import { BusquedaplantillasbodegaComponent } from '../busquedaplantillasbodega/busquedaplantillasbodega.component'
/*Services */
import { DocidentificacionService } from '../../servicios/docidentificacion.service';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { TipoambitoService } from '../../servicios/tiposambito.service';
import { EventosSolicitudComponent } from '../eventos-solicitud/eventos-solicitud.component';
import { EventosDetallesolicitudComponent } from '../eventos-detallesolicitud/eventos-detallesolicitud.component';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { InformesService } from '../../servicios/informes.service';
import { Plantillas } from 'src/app/models/entity/PlantillasBodegas';
import { DetallePlantillaBodega } from '../../models/entity/DetallePlantillaBodega';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { BodegaDestino } from 'src/app/models/entity/BodegaDestino';
import { ServicioLogistico } from 'src/app/models/entity/ServicioLogistico';
import { ServicioService } from 'src/app/servicios/servicio.service';
import { Paciente } from 'src/app/models/entity/Paciente';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-solicitudpaciente',
  templateUrl: './solicitudpaciente.component.html',
  styleUrls: ['./solicitudpaciente.component.css'],
  providers: [InformesService],
})
export class SolicitudpacienteComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  /**Para uso dinamico de tabs */
  @ViewChild('tabProducto', { static: false }) tabProductoTabs: TabsetComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;

  public modelopermisos               : Permisosusuario = new Permisosusuario();
  public pagina                       : number = 2;
  //Array
  public alerts                       : Array<any> = [];
  public docsidentis                  : Array<DocIdentificacion> = [];
  public tipoambitos                  : Array<TipoAmbito> = [];
  public estadosolicitudes            : Array<EstadoSolicitud> = [];
  public arrdetalleMedicamentos       : Array<DetalleSolicitud> = [];
  public arrMedicamentopaginacion     : Array<DetalleSolicitud> = [];
  public arrdetalleMedicamentos_aux   : Array<DetalleSolicitud> = [];
  public arrMedicamentopaginacion_aux : Array<DetalleSolicitud> = [];
  public arrdetalleMedicamentos_2     : Array<DetalleSolicitud> = [];
  public arrdetalleInsumos            : Array<DetalleSolicitud> = [];
  public arrdetalleInsumos_2          : Array<DetalleSolicitud> = [];
  public arrInsumospaginacion         : Array<DetalleSolicitud> = [];
  public arrdetalleInsumos_aux        : Array<DetalleSolicitud> = [];
  public arrInsumospaginacion_aux     : Array<DetalleSolicitud> = [];
  public grillaMedicamentos           : Array<DetalleSolicitud> = [];
  public grillaInsumos                : Array<DetalleSolicitud> = [];
  //Obj
  public FormDatosPaciente            : FormGroup;
  public FormDatosProducto            : FormGroup;
  private _BSModalRef                 : BsModalRef;
  public dataPacienteSolicitud        : Solicitud = new Solicitud();// Guarda datos de la busqueda
  public solmedicamento               : Solicitud = new Solicitud();
  public solinsumo                    : Solicitud = new Solicitud();
  public solicitudMedicamento         : Solicitud = new Solicitud();
  public solicitudInsumo              : Solicitud = new Solicitud();
  public varListaDetalleDespacho      : DetalleSolicitud = new DetalleSolicitud();
  //Var
  public servidor     = environment.URLServiciosRest.ambiente;
  public usuario      = environment.privilegios.usuario;
  public hdgcodigo    : number;
  public esacodigo    : number;
  public cmecodigo    : number;
  public numsolins    : number;
  public numsolicitud : number = 0;
  public bodorigen    : string;
  public boddestino   : string;
  /**Usado para la funcion logicavacios()//@ML */
  public verificanull = false;
  /**/
  public vacios             = true;
  public tipobusqueda       = null;
  public loading            = false;
  public solmedic           : boolean = false;
  public solins             : boolean = false;
  public imprimesolins      : boolean = false;
  public accionsolicitud    = 'I';
  public locale             = 'es';
  public bsConfig           : Partial<BsDatepickerConfig>;
  public colorTheme         = 'theme-blue';
  public bodegasdestino     : Array<BodegaDestino> = [];
  public servicios          : Array<ServicioLogistico> = [];
  public bodegassuministro  : Array<BodegasrelacionadaAccion> = [];
  public solic1             : string;
  public solic2             : string;
  public modificarsolicitud = false;
  /**usado para activar btnImprimir al crear 2 solicitud //@Mlobos */
  public imprimirsolicitud            = false;
  public fechaactual                  : string;
  public nomplantilla                 : string;
  es_controlado                       : string;
  es_consignacion                     : string;
  public numsolmedicamento            = null;
  public numsolinsumo                 = null;
  public codambito                    = null;
  public btnlimpiargrillamed          = false;
  public btnlimpiargrillains          = false;
  public soliid                       = sessionStorage.getItem('detallecargo');
  public codprod                      = null;
  public descprod                     = null;
  public btnvolver                    = this.soliid === undefined || this.soliid === null?false:true;
  public desactivabtnelimmed          : boolean = false;
  public desactivabtnelimins          : boolean = false;
  public bloqbtn                      : boolean = false;
  public ActivaBotonLimpiaBusca       : boolean = false;
  public ActivaBotonBuscaGrilla       : boolean = false;
  public ActivaBotonBuscaGrillaInsumo : boolean = false;
  public ActivaBotonLimpiaBuscaInsumo : boolean = false;
  public activaagregar                : boolean = false;
  public estado_aux                   : number;
  public origensolicitud              : number = 40;

  public optMed : string = "DESC";
  public optIns : string = "DESC";

  /** indica si solicitud es medicamento o insumos */
  public tieneProductos = false;

  public pageDetMed : number;
  public pageDetIns : number;


  // Arreglo para eliminar articulo de la grilla
  public listaDetalleEliminadoMed: Array<DetalleSolicitud> = [];
  public listaDetalleEliminadoIns: Array<DetalleSolicitud> = [];

  /** indica si fue eliminada */
  public iseliminada = false;

  constructor(
    public datePipe                 : DatePipe,
    public localeService            : BsLocaleService,
    public DocidentificacionService : DocidentificacionService,
    public formBuilder              : FormBuilder,
    public _BsModalService          : BsModalService,
    public _solicitudService        : SolicitudService,
    public _tipoambitoService       : TipoambitoService,
    public _estadosolicitudesService: SolicitudService,
    public _BodegasService          : BodegasService,
    private _imprimesolicitudService: InformesService,
    private route                   : ActivatedRoute,
    private router                  : Router,
    public _BusquedaproductosService: BusquedaproductosService,
    public _PacientesService        : PacientesService,
    public _ServicioService         : ServicioService,
    public translate                : TranslateService
  ) {
    this.FormDatosPaciente = this.formBuilder.group({
      tipodocumento     : [{ value: null, disabled: false }, Validators.required],
      numidentificacion : [{ value: null, disabled: false }, Validators.required],
      numcuenta         : [{ value: null, disabled: true }, Validators.required],
      nombrepaciente    : [{ value: null, disabled: true }, Validators.required],
      edad              : [{ value: null, disabled: true }, Validators.required],
      unidad            : [{ value: null, disabled: true }, Validators.required],
      sexo              : [{ value: null, disabled: true }, Validators.required],
      ambito            : [{ value: 3, disabled: false }, Validators.required],
      estado            : [{ value: 10, disabled: false }, Validators.required],
      numsolicitud      : [{ value: null, disabled: true }, Validators.required],
      pieza             : [{ value: null, disabled: true }, Validators.required],
      cama              : [{ value: null, disabled: true }, Validators.required],
      fechahora         : [{ value: new Date(), disabled: true }, Validators.required],
      ubicacion         : [{ value: null, disabled: true }, Validators.required],
      medico            : [{ value: null, disabled: true }, Validators.required],
      bodcodigo         : [{ value: null, disabled: false }, Validators.required],
      codbodegasuministro: [{ value: null, disabled: false }, Validators.required],
      servicio          : [{ value: null, disabled: false }, Validators.required],
    });
    // this.FormDatosProducto = this.formBuilder.group({
    //   codigo      : [{ value: null, disabled: false }, Validators.required],
    //   descripcion : [{ value: null, disabled : true}, Validators.required],
    //   cantidad    : [{ value: null, disabled: false }, Validators.required]
    // });
    // this.soliid = sessionStorage.getItem('detallecargo');

  }

  ngOnInit() {
    this.FormDatosProducto = this.formBuilder.group({
      codigo      : [{ value: null, disabled: false }, Validators.required],
      descripcion : [{ value: null, disabled : true}, Validators.required],
      cantidad    : [{ value: null, disabled: false }, Validators.required]
    });
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.FormDatosPaciente.controls.ambito.disable();
    this.FormDatosPaciente.controls.estado.disable();
    this.FormDatosPaciente.controls.servicio.disable();
    this.FormDatosProducto.controls.codigo.disable();
    this.FormDatosProducto.controls.descripcion.disable();
    this.FormDatosProducto.controls.cantidad.disable();
    this.FormDatosPaciente.controls.numidentificacion.disable();
    this.FormDatosPaciente.controls.bodcodigo.disable();
    this.datosUsuario();
    /* completa combobox */
    this.BuscaBodegaDestino();
    this.getParametros();
    this.setDate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setSolpaciente();
    });
  }

  ngOnDestroy(){
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
  }

  setSolpaciente() {
    if (this.soliid === undefined || this.soliid === null) {
      return;
    } else {
      sessionStorage.removeItem('detallecargo');
      this.busquedaSolicitud(this.soliid, 'Solicitud');
    }
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

  BuscaBodegasSuministro(codigobodegasolicitante: number) {

    this.bodegassuministro = [];
    this._BodegasService.listaBodegaRelacionadaAccion(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      this.usuario, this.servidor, codigobodegasolicitante, 1).subscribe(
        data => {
          this.bodegassuministro = data;
        }, err => {
        }
      );
  }

  async getParametros() {
    try {
      this.docsidentis = await this.DocidentificacionService.list(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), false)
        .toPromise();
      this.tipoambitos = await this._tipoambitoService.list(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor)
        .toPromise();
      this.estadosolicitudes = await this._estadosolicitudesService.list(this.usuario, this.servidor)
        .toPromise();
    } catch (err) {
      this.alertSwalAlert.text = err.message;
      this.alertSwalAlert.show();
    }
  }

  SeleccionTipoDoc(){
    this.FormDatosPaciente.controls.numidentificacion.enable();
  }

  cargaSolicitud(solid: any) {
    const soliid = parseInt(solid);
    this.arrdetalleMedicamentos = [];
    this.arrMedicamentopaginacion = [];
    this.arrdetalleInsumos = [];
    this.arrInsumospaginacion = [];
    /* Tras Crear nueva Solicitud, obtiene datos recien creados y cambia tipo busqueda a 'Solicitud'*/
    this.tipobusqueda = 'Solicitud';

    this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
      null, null, null, null, null, this.servidor, null, this.codambito, null, null, null, null, null,0, "","").subscribe(
        async response => {
          if (response != null) {
            this.dataPacienteSolicitud = response[0];
            this.imprimirsolicitud = true;
            this.tipobusqueda = "Solicitud";
            this.loading = false;
            this.setDatos();
            this.estado_aux = this.dataPacienteSolicitud.estadosolicitud;

            if(this.dataPacienteSolicitud.bandera === 2){ //Si bandera es =2 solicitud tomada
              this.verificanull = false;
              this.activaagregar = false;
              this.FormDatosProducto.disable();
              if(this.arrdetalleMedicamentos.length >0){

                this.tieneProductos = true;

                this.arrdetalleMedicamentos.forEach(x=>{
                  x.bloqcampogrilla = false;
                  x.bloqcampogrilla2 = false;
                });

                this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                this.alertSwalAlert.show();
              }else{
                this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                this.alertSwalAlert.show();
              }
              if(this.arrdetalleInsumos.length > 0){

                this.tieneProductos = true;

                this.arrdetalleInsumos.forEach(x=>{
                  x.bloqcampogrilla = false;
                  x.bloqcampogrilla2 = false;
                })
                this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');

                this.alertSwalAlert.show();
              }else{
                this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                this.alertSwalAlert.show();
              }
            }else{
              this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
            }
          }
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error');
          this.alertSwalError.text = error.message;
          this.alertSwalError.show();
        }
      );
  }

  // Carga solicitud doble creada
  async cargaDoblesolicitud(soliid: number) {
    this.arrdetalleMedicamentos = [];
    this.arrMedicamentopaginacion = [];
    this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
      null, null, null, null, null, this.servidor, null, this.codambito, null, null, null, null, null,0, "","").subscribe(
        response => {
          if (response != null) {
            /** Activar solo btn Imprimir */
            this.imprimirsolicitud = true;
            this.verificanull = false;
            this.modificarsolicitud = false;
            /***/
            response.forEach(data => {
              this.dataPacienteSolicitud = data;
            });
            this.loading = false;
            this.tipobusqueda = 'Total';
            this.dataPacienteSolicitud.solicitudesdet.forEach(element => {
              if (element.tiporegmein == "I") {
                this.solins = true;
                this.arrdetalleInsumos = this.dataPacienteSolicitud.solicitudesdet
                element.bloqcampogrilla = true;
                this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0,20);
                this.loading = false;
              } else {
                if (element.tiporegmein == "M") {
                  this.solmedic = true;
                  this.arrdetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
                  element.bloqcampogrilla = true;
                  this.arrMedicamentopaginacion = this.arrdetalleMedicamentos.slice(0, 20)
                  this.loading = false;
                }
              }
            })
            if(this.dataPacienteSolicitud.bandera === 2){ //Si bandera es =2 solicitud tomada
              this.verificanull = false;
              this.activaagregar = false;
              this.FormDatosProducto.disable();
              if(this.arrdetalleMedicamentos.length >0){

                this.tieneProductos = true;

                this.arrdetalleMedicamentos.forEach(x=>{
                  x.bloqcampogrilla = false;
                  x.bloqcampogrilla2 = false;
                })
                this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                this.alertSwalAlert.show();
              }else{
                this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                this.alertSwalAlert.show();
              }
              if(this.arrdetalleInsumos.length >0){

                this.tieneProductos = true;

                this.arrdetalleInsumos.forEach(x=>{
                  x.bloqcampogrilla = false;
                  x.bloqcampogrilla2 = false;
                })
                this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');

                this.alertSwalAlert.show();
              }else{
                this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                this.alertSwalAlert.show();
              }
            }else{
              this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
            }
          }
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error');
          this.alertSwalError.text = error.message;
          this.alertSwalError.show();
        }
      );
  }

  onBuscar(busqueda: string) {
    this.loading = false;
    if (this.hdgcodigo == null || this.esacodigo == null || this.cmecodigo == null) {
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.debe.agregar.empresa.sucursal');
      this.alertSwalAlert.show();
      return;
    }

    switch (busqueda) {
      case 'Paciente':
        this._BSModalRef = this._BsModalService.show(ModalpacienteComponent, this.setModal(this.TranslateUtil('key.title.busqueda.de').concat(busqueda)));
        this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
          if (Retorno !== undefined) {
            this.limpiar();
            this.cargarInformacionPaciente(Retorno, busqueda);
          } else {
            this.loading = false;
            this.ValidaEstadoSolicitud(2, 'BuscaPaciente');
          }
        });
        break;
      case 'Solicitud':
        if(this.dataPacienteSolicitud != undefined){
          if(this.dataPacienteSolicitud.bandera === 1){  //Si bandera es =2 solicitud tomada
            this.ValidaEstadoSolicitud(1,'BuscaSolicitudes');
          }
        }
        this._BSModalRef = this._BsModalService.show(BusquedasolicitudpacientesComponent, this.setModal("Busqueda de ".concat(busqueda)));
        this._BSModalRef.content.onClose.subscribe((Retorno: any) => {



          if (Retorno !== undefined) {
            this.busquedaSolicitud(Retorno.soliid, busqueda);
          }else{
            this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
          }

        }
        );
        break;
    }
  }

  /**
   * funcion que tras buscar solicitud Limpia, asigna tipobusqueda, aplica logica vacios y setea datos buscados
   * fecha mod : 11-02-2021
   * @param_numsol = numero de solcitud entrante
   * @param_busqueda = el tipo de busqueda que ejecuta el servicio, puede ser Solicitud, Paciente, null o Total
   * autor: Miguel L. miguel.lobos@sonda.com
   */
  async busquedaSolicitud(numsol, busqueda) {
    // tslint:disable-next-line: radix
    const soliid = parseInt(numsol);
    this.loading = true;
    try {
      const solicitud = await this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, 0, '', '', 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0, '', 0, "","").toPromise();

      await this.limpiar();
      const codservori = solicitud[0].codservicioori;
      this.dataPacienteSolicitud = solicitud[0];
      this.estado_aux = this.dataPacienteSolicitud.estadosolicitud;
      /** verifica si solicitud es despachado total */
      if(this.dataPacienteSolicitud.estadosolicitud === 50) {
        this.tipobusqueda = 'Total';
      } else {
        this.tipobusqueda = busqueda;
      }
      if(this.dataPacienteSolicitud.estadosolicitud == 50 || this.dataPacienteSolicitud.estadosolicitud == 60
        || this.dataPacienteSolicitud.estadosolicitud == 70 || this.dataPacienteSolicitud.estadosolicitud ==75
        || this.dataPacienteSolicitud.estadosolicitud == 78){
          this.bloqbtn = true;
          this.FormDatosProducto.controls.codigo.enable();
      }
      if(this.dataPacienteSolicitud.estadosolicitud === 10 || this.dataPacienteSolicitud.estadosolicitud === 40){
        this.FormDatosProducto.controls.codigo.enable();
        this.FormDatosProducto.controls.descripcion.enable();
        this.FormDatosProducto.controls.cantidad.enable();
        this.activaagregar = true;
      }

      // await this.BuscaBodegaDeServicio(codservori); //se desconoce su utilidad
      this.imprimirsolicitud = true;
      await this.logicaVacios();
      await this.setDatos();
      this.loading = false;

      if(this.dataPacienteSolicitud.bandera === 2){ //Si bandera es =2 solicitud tomada
        this.verificanull = false;
        this.activaagregar = false;
        this.FormDatosProducto.disable();
        if(this.arrdetalleMedicamentos.length >0){

          this.tieneProductos = true;

          this.arrdetalleMedicamentos.forEach(x=>{
            x.bloqcampogrilla = false;
            x.bloqcampogrilla2 = false;
          })
          this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
          this.alertSwalAlert.show();
        }else{
          this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
          this.alertSwalAlert.show();
        }
        if(this.arrdetalleInsumos.length >0){

          this.tieneProductos = true;

          this.arrdetalleInsumos.forEach(x=>{
            x.bloqcampogrilla = false;
            x.bloqcampogrilla2 = false;
          })
          this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice( 0,20);
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
          this.alertSwalAlert.show();
        }else{
          this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
          this.alertSwalAlert.show();
        }

      }else{
        this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
      }
    } catch {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.error.proceso');
      this.alertSwalAlert.show();
      this.loading = false;
    }
  }

  BuscaBodegaDeServicio(codservicioori: number) {
    this._BodegasService.BuscaBodegaporServicio(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      codservicioori, this.usuario, this.servidor).subscribe(
        response => {
          if (response != null) {
            if (response.length == 0) {
            } else {
              this.FormDatosPaciente.get('bodcodigo').setValue(response[0].boddescodigo);
              this.BuscaBodegasSuministro(response[0].boddescodigo);
            }
          }
        },
        error => {
          this.loading = false;
          this.uimensaje('danger', this.TranslateUtil('key.mensaje.error.buscar.bodegas.servicio'), 3000);
        }
      );
  }

  /* Metodo que agrega un nuevo producto */
  onBuscarProducto() {
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModal(this.TranslateUtil('key.title.busqueda.productos')));
    this._BSModalRef.content.onClose.subscribe((RetornoProductos: Articulos) => {
      if (RetornoProductos !== undefined) {
        this.validaCodigo(RetornoProductos.codigo).then((result) => {
          if(result) {
            this.setProducto(RetornoProductos);
            this.FormDatosProducto.reset();
            this.loading = false;
            this.logicaVacios();
          }
        });
      }else{
        this.loading = false;
      }
    },error => {
        this.loading = false;
      }
    );
    this.loading = false;
  }

  async getProducto(tipo: number) {
      var noexisteprod : boolean = false;
      if(this.FormDatosProducto.controls.codigo.value!=null){
        var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
      }
      switch (tipo) {
        case 1:
          if(this.arrdetalleMedicamentos.length>0){

            this.tieneProductos = true;

            this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
            this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
            this.arrdetalleMedicamentos,null,null,null,null).subscribe(response => { });
          }else{
            noexisteprod= false;
          }
          break;
        case 2:
          if(this.arrdetalleInsumos.length>0){

            this.tieneProductos = true;

            this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
              this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
              this.arrdetalleInsumos,null,null,null,null).subscribe(response => { });
            this.loading = false;
          }else{
            noexisteprod= false;
          }
          break;
      }
      if(!noexisteprod ){
        this.codprod = this.FormDatosProducto.controls.codigo.value;
        if (this.codprod === null || this.codprod === '') {
          return;
        } else {
          this.loading = true;
          const tipodeproducto = 'MIM';
          const controlado = '';
          const controlminimo = '';
          const idBodega = 0;
          const consignacion = '';

          this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
            this.cmecodigo, this.codprod, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
            , this.usuario, null, this.servidor).subscribe(
              response => {
                if (response != null) {
                  if (!response.length) {
                    this.loading = false;
                    this.onBuscarProducto();
                  } else if (response.length) {
                    if(response.length > 1){
                      if(noexisteprod === false){
                        this.onBuscarProducto();
                      }
                    }else{
                      if(response.length === 1){
                        this.loading = false;
                        this.validaCodigo(response[0].codigo).then((result) => {
                          if(result) {
                            this.FormDatosProducto.reset();
                            this.setProducto(response[0]);
                            this.logicaVacios();
                            this.focusField.nativeElement.focus()
                          }
                        });
                      }
                    }
                  }
                }
                this.loading = false;
              }, error => {
                this.loading = false;
              });
        }
      }
  }

  onBuscarPlantillas() {
    this._BSModalRef = this._BsModalService.show(BusquedaplantillasbodegaComponent, this.setModalBusquedaPlantilla());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) {
      } else {
        let bodega : number = this.FormDatosPaciente.controls.bodcodigo.value;
        this._BodegasService.BuscaPlantillas(this.servidor, sessionStorage.getItem('Usuario'), this.hdgcodigo, this.esacodigo,
          this.cmecodigo, response.planid, '', '', '', bodega, bodega, '', '', 2,"").subscribe(
            response_plantilla => {
              if (response_plantilla.length != 0) {
                this.loading = true;
                if (response_plantilla.length > 0) {
                  let arrPlantillas: Plantillas = new Plantillas();
                  arrPlantillas = response_plantilla[0];
                  this.nomplantilla = arrPlantillas.plandescrip;
                  arrPlantillas.plantillasdet.forEach(res => {
                    this.setPlantilla(res);
                    this.logicaVacios();
                  });
                }
                this.loading = false;
              }
            });
      }
    });
  }

  /* Carga datos busqueda en pantalla */
  async setDatos() {
    this.numsolicitud = this.dataPacienteSolicitud.soliid;
    this.FormDatosPaciente.get('tipodocumento').setValue(this.dataPacienteSolicitud.tipodocpac);
    this.FormDatosPaciente.get('numidentificacion').setValue(this.dataPacienteSolicitud.numdocpac);
    this.FormDatosPaciente.get('nombrepaciente').setValue(this.dataPacienteSolicitud.apepaternopac.concat(" ")
      .concat(this.dataPacienteSolicitud.apematernopac).concat(" ")
      .concat(this.dataPacienteSolicitud.nombrespac));
    this.FormDatosPaciente.get('sexo').setValue(this.dataPacienteSolicitud.glsexo);
    this.FormDatosPaciente.get('edad').setValue(this.dataPacienteSolicitud.edad);
    this.FormDatosPaciente.get('numcuenta').setValue(this.dataPacienteSolicitud.cuentanumcuenta);
    this.FormDatosPaciente.get('medico').setValue(this.dataPacienteSolicitud.nombremedico);
    this.FormDatosPaciente.get('ubicacion').setValue(this.dataPacienteSolicitud.pzagloza);
    this.FormDatosPaciente.get('bodcodigo').setValue(this.dataPacienteSolicitud.bodorigen);
    this.FormDatosPaciente.get('codbodegasuministro').setValue(this.dataPacienteSolicitud.boddestino);
    this.FormDatosPaciente.get('numsolicitud').setValue(this.dataPacienteSolicitud.soliid);
    this.FormDatosPaciente.get('unidad').setValue(this.dataPacienteSolicitud.undglosa);
    this.FormDatosPaciente.get('pieza').setValue(this.dataPacienteSolicitud.pzagloza);
    this.FormDatosPaciente.get('cama').setValue(this.dataPacienteSolicitud.camglosa);
    this.FormDatosPaciente.get('ambito').setValue(this.dataPacienteSolicitud.codambito);
    if (this.tipobusqueda === "Paciente") {
      this.FormDatosPaciente.get('fechahora').setValue(new Date());
      this.FormDatosPaciente.get('ambito').setValue(this.dataPacienteSolicitud.codambito);
      this.FormDatosPaciente.controls.ambito.disable()
      this.FormDatosPaciente.controls.estado.disable();
    } else if (this.tipobusqueda === "Solicitud" || this.tipobusqueda === null || this.tipobusqueda === 'Total') {
      await this.completarComboServicioAlBuscarSolicitud(this.dataPacienteSolicitud.bodorigen, this.dataPacienteSolicitud.codservicioactual);
      this.FormDatosPaciente.get('fechahora').setValue(this.datePipe.transform(this.dataPacienteSolicitud.fechacreacion, 'dd-MM-yyyy HH:mm:ss'));
      this.FormDatosPaciente.get('ambito').disable();
      this.FormDatosPaciente.get('estado').disable();
      this.FormDatosPaciente.get('estado').setValue(this.dataPacienteSolicitud.estadosolicitud);
      if(this.FormDatosPaciente.controls.estado.value == 80){
        this.iseliminada = true;
      }
      if (this.dataPacienteSolicitud.solicitudesdet.length) {
        //**Si tiene detalle de producto ejecuta funcion */
        this.cargaGrillaproductos();
      }

      /**
       * se bloquea combo bodegas al estar despachada total
       * inc=263 | 13/12/2021 | @mlobos
       */
      if( this.dataPacienteSolicitud.estadosolicitud === 50 ) {
        this.FormDatosPaciente.get('bodcodigo').disable();
        this.FormDatosPaciente.get('servicio').disable();
      }
    }

    this.checkSoleliminada();
    this.loading = false;
  }

  private async completarComboServicioAlBuscarSolicitud(codigoBodega: number, codigoServicio: string) {
    try {
      this.servicios = await this._ServicioService
        .servicioporbodega(
          this.usuario,
          this.servidor,
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          codigoBodega,
        )
        .toPromise();

      if (!this.servicios || this.servicios.length === 0) {
        this.servicios = [];
      }

      if (!this.servicios.some((s) => s.servcodigo === codigoServicio)) {
        this.servicios = [];
        this.FormDatosPaciente.controls.servicio.reset();

        this.alertSwalAlert.title = `Servicio "${codigoServicio}" no se encuentra asociado a la bodega`;
        await this.alertSwalAlert.show();
      } else {
        this.FormDatosPaciente.patchValue({ servicio: codigoServicio });
      }
    } catch (error) {
      console.error('[ERROR AL CARGAR COMBO SERVICIOS] ', error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.cargar.servicios');
      this.alertSwalError.text = error.message;
      await this.alertSwalError.show();
    }
  }

  checkSoleliminada() {
    if (this.dataPacienteSolicitud.estadosolicitudde === 'ELIMINADA') {
      this.arrdetalleMedicamentos = [];
      this.arrMedicamentopaginacion = [];
      this.arrdetalleInsumos = [];
      this.arrInsumospaginacion = [];
      this.tipobusqueda = null;
    }
  }

  cargaGrillaproductos() {
    this.dataPacienteSolicitud.solicitudesdet.forEach(element => {

      this.tieneProductos = true;

      if(this.dataPacienteSolicitud.estadosolicitud == 50 || this.dataPacienteSolicitud.estadosolicitud == 60
      || this.dataPacienteSolicitud.estadosolicitud == 70 || this.dataPacienteSolicitud.estadosolicitud ==75
      || this.dataPacienteSolicitud.estadosolicitud == 78){

        element.bloqcampogrilla = false;

      }else{
        element.bloqcampogrilla = true;
      }
      if (element.tiporegmein == "I") {
        this.solins = true;
      } else {
        if (element.tiporegmein == "M") {
          this.solmedic = true;
        }
      }
    });
    if (this.solins == true) {
      this.tabProductoTabs.tabs[1].active = true;
      this.arrdetalleInsumos = this.dataPacienteSolicitud.solicitudesdet
      this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0,20); // <- Llamar Función paginación

      this.arrdetalleInsumos_aux = this.arrdetalleInsumos;
      this.arrInsumospaginacion_aux = this.arrInsumospaginacion;

      this.ActivaBotonBuscaGrillaInsumo = true;
      this.solmedic = false;
      this.checkInsumosnuevo();
    } else {
      if (this.solmedic == true) {
        this.tabProductoTabs.tabs[0].active = true;
        this.arrdetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
        this.arrdetalleMedicamentos.forEach(element => {
          element.marcacheckgrilla = false;
        });
        this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0,20);

        this.arrdetalleMedicamentos_aux = this.arrdetalleMedicamentos;
        this.arrMedicamentopaginacion_aux = this.arrdetalleMedicamentos;

        this.ActivaBotonBuscaGrilla = true;
        this.solins = false;
        this.checkMedicamentonuevo();
      }
    }
  }

  /* Calculo formulación grilla Productos //@MLobos*/
  cantidadsolicitada(detalle: DetalleSolicitud) {
    var dosis, dias, total: number = 0;
    dosis = detalle.dosis;
    dias = detalle.dias;
    total = dosis * detalle.formulacion;
    detalle.cantsoli = total * dias;
    /* Si la busqueda es 'Solicitud'..
    si acciond=I (inserta) entonces mantiene..
    de lo contrario acciond=M (modifica) */
    if (this.tipobusqueda == 'Solicitud') {
      if (detalle.acciond !== 'I') {
        detalle.acciond = 'M';
      }
    }
    this.logicaVacios();
  }

  cantidadInsumo(detalle: DetalleSolicitud) {
    /**Verifica si es un nuevo producto "I" o uno existente a modificiar "M" */
    if (this.tipobusqueda == 'Solicitud') {
      if (detalle.acciond !== 'I') {
        detalle.acciond = 'M';
      }
    }
    this.logicaVacios();
  }

  limpiar() {
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'limpiar');
      }
    }

    // this.dataPacienteSolicitud = null;
    this.numsolmedicamento = null;
    this.numsolinsumo = null;
    this.dataPacienteSolicitud = new Solicitud();
    this.accionsolicitud = 'I';
    this.fechaactual = null;
    this.nomplantilla = null;
    this.FormDatosPaciente.reset();
    this.FormDatosProducto.reset();
    this.arrdetalleMedicamentos = [];
    this.arrMedicamentopaginacion = [];
    this.arrdetalleInsumos = [];
    this.arrInsumospaginacion = [];
    this.grillaMedicamentos = [];
    this.grillaInsumos = [];
    this.solicitudMedicamento = new Solicitud();
    this.solicitudInsumo = new Solicitud();
    this.tipobusqueda = null;
    this.FormDatosPaciente.controls["ambito"].setValue(3);
    this.FormDatosPaciente.controls["estado"].setValue(10);
    this.FormDatosPaciente.get('ambito').enable();
    this.FormDatosPaciente.get('estado').enable();
    this.solmedic = false;
    this.solins = false;
    this.imprimesolins = false;
    this.FormDatosPaciente.get('fechahora').setValue(new Date());
    this.desactivabtnelimmed = false;
    this.desactivabtnelimins = false;
    this.bloqbtn = false;
    this.FormDatosPaciente.controls.ambito.disable()
    this.FormDatosPaciente.controls.estado.disable();
    this.ActivaBotonBuscaGrilla = false;
    this.ActivaBotonBuscaGrillaInsumo = false;
    this.FormDatosProducto.controls.codigo.disable();
    this.FormDatosProducto.controls.descripcion.disable();
    this.FormDatosProducto.controls.cantidad.disable();
    this.FormDatosPaciente.controls.tipodocumento.enable();
    this.FormDatosPaciente.controls.numidentificacion.disable();
    this.activaagregar = false;
    /* Desactivan btn barra inferior //@MLobosh*/
    this.verificanull = false;
    this.modificarsolicitud = false;
    this.imprimirsolicitud = false;
    this.vacios = true;
    /** btn limpiar nuevos productos med/insumo grilla */
    this.btnlimpiargrillamed = false;
    this.btnlimpiargrillains = false;
    this.iseliminada = false;

    /** habilita combo bodega */
    this.FormDatosPaciente.controls.bodcodigo.enable();

  }

  async limpiarGrillamedicamento() {
    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.pregunta.borrar.todos.nuevos.elementos');
    this.alertSwalAlert.showCancelButton = true;

    const resp = await this.alertSwalAlert.show();
    if (!resp.value) {
      return;
    }

    this.arrdetalleMedicamentos = this.arrdetalleMedicamentos.filter((med) => med.acciond != 'I');
    this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;
    this.grillaMedicamentos = this.arrdetalleMedicamentos;

    this.btnlimpiargrillamed = this.arrdetalleMedicamentos.length !== 0;
    this.vacios = this.arrdetalleMedicamentos.length === 0;

    this.logicaVacios();
    this.checkMedicamentonuevo();
  }

  async limpiarGrillainsumo() {
    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.pregunta.borrar.todos.nuevos.elementos');
    this.alertSwalAlert.showCancelButton = true;

    const resp = await this.alertSwalAlert.show();
    if (!resp.value) {
      return;
    }

    this.arrdetalleInsumos = this.arrdetalleInsumos.filter((ins) => ins.acciond != 'I');
    this.arrInsumospaginacion = this.arrdetalleInsumos;
    this.grillaInsumos = this.arrdetalleInsumos;

    this.btnlimpiargrillains = this.arrdetalleInsumos.length !== 0;
    this.vacios = this.arrdetalleInsumos.length === 0;

    this.logicaVacios();
    this.checkInsumosnuevo();
  }

  /**Si hay campos vacios grilla desactiva Crear Sol//@Mlobos */
  async logicaVacios() {
    this.vaciosProductos()
    if (this.vacios === true) {
      this.verificanull = false;
    }
    else {
      this.verificanull = true;
    }
  }

  vaciosProductos() {
    if (this.arrMedicamentopaginacion.length) {
      for (var data of this.arrMedicamentopaginacion) {
        if (data.dosis <= 0 || data.formulacion <= 0 || data.dias <= 0 ||
          data.dosis === null || data.formulacion === null || data.dias === null) {
          this.vacios = true;
          return;
        } else {
          this.vacios = false;
        }
      }
    }
    if (this.arrInsumospaginacion.length) {
      for (var data of this.arrInsumospaginacion) {
        if (data.cantsoli <= 0 || data.cantsoli === null) {
          this.vacios = true;
          return;
        } else {
          this.vacios = false;
        }
      }
    }
  }

  /**
   * Ajustes: se cambia logica para no ingresar prod existentes..
   * Al modificar solo agrega tipo de productos asociados a la solicitud.
   * autor: MLobos miguel.lobos@sonda.com
   * fecha: 21-12-2020
   */
  async setPlantilla(art: DetallePlantillaBodega) {
    var detalleSolicitud = new DetalleSolicitud;
    detalleSolicitud.sodeid = 0;
    detalleSolicitud.soliid = 0;
    detalleSolicitud.repoid = 0;
    detalleSolicitud.codmei = art.codmei;
    detalleSolicitud.meinid = art.meinid;
    detalleSolicitud.dosis = 0;
    detalleSolicitud.formulacion = 0;
    detalleSolicitud.dias = 0;
    detalleSolicitud.cantsoli = art.cantsoli;
    detalleSolicitud.pendientedespacho = 0;
    detalleSolicitud.cantdespachada = 0;
    detalleSolicitud.cantdevolucion = 0;
    detalleSolicitud.estado = 1;
    detalleSolicitud.observaciones = null;
    detalleSolicitud.fechamodifica = null;
    detalleSolicitud.usuariomodifica = null;
    detalleSolicitud.fechaelimina = null;
    detalleSolicitud.usuarioelimina = null;
    detalleSolicitud.viaadministracion = null;
    detalleSolicitud.meindescri = art.meindescri;
    detalleSolicitud.stockorigen = null;
    detalleSolicitud.stockdestino = null;
    detalleSolicitud.acciond = null;
    detalleSolicitud.marca = null;
    detalleSolicitud.fechavto = null;
    detalleSolicitud.lote = null;
    detalleSolicitud.cantadespachar = 0;
    detalleSolicitud.descunidadmedida = null;
    detalleSolicitud.tiporegmein = art.tiporegmein;
    detalleSolicitud.nomplantilla = this.nomplantilla;
    detalleSolicitud.bloqcampogrilla = true;
    if (detalleSolicitud.tiporegmein == "M") {
      if(this.tipobusqueda==='Solicitud' && this.solins) {
        /*debe ingresar solo Insumos*/
        return;
      } else {
        /** si producto existe en grilla, elimina Medicamento y vuelve a ingresar y cambia accion a Modificar*/
        let indx = this.arrdetalleMedicamentos.findIndex(d => d.codmei ===  detalleSolicitud.codmei, 1);
        if(indx >= 0) {
        } else {
          detalleSolicitud.acciond = 'I';

        this.arrdetalleMedicamentos.unshift(detalleSolicitud);
        this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0,20);

        this.optMed = "DESC"
        this.arrMedicamentopaginacion.sort(function (a, b) {
          if (a.meindescri > b.meindescri) {
          return 1;
          }
          if (a.meindescri < b.meindescri) {
          return -1;
          }
          // a must be equal to b
          return 0;
        });

        this.arrdetalleMedicamentos_aux = this.arrdetalleMedicamentos;
        this.arrMedicamentopaginacion_aux = this.arrdetalleMedicamentos;
        this.ActivaBotonBuscaGrilla = true;
        this.checkMedicamentonuevo();
        }
      }
    } else if (detalleSolicitud.tiporegmein == "I") {
        if(this.tipobusqueda ==='Solicitud' && this.solmedic) {
          /*debe ingresar solo Medicamentos*/
          return;
        } else {
          /** si producto existe en grilla, elimina Insumo y vuelve a ingresar */
          let indx = this.arrdetalleInsumos.findIndex(d => d.codmei ===  detalleSolicitud.codmei, 1);
          if(indx >= 0) {
            // this.arrdetalleInsumos.splice(indx, 1);
            // detalleSolicitud.acciond = 'M';
          } else {
            detalleSolicitud.acciond = 'I';

          this.arrdetalleInsumos.unshift(detalleSolicitud);
          this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0,20);

          this.optIns = "DESC"
          this.arrInsumospaginacion.sort(function (a, b) {
            if (a.meindescri > b.meindescri) {
            return 1;
            }
            if (a.meindescri < b.meindescri) {
            return -1;
            }
            // a must be equal to b
            return 0;
          });

          this.arrdetalleInsumos_aux = this.arrdetalleInsumos;
          this.arrInsumospaginacion_aux = this.arrInsumospaginacion;
          this.ActivaBotonBuscaGrillaInsumo = true;
          this.checkInsumosnuevo();
          }
        }
      }
  }

  /**funcion que habilita/desactiva btnLimpiargrilla Medicamentos */
  checkMedicamentonuevo() {
    const tipogrilla = this.arrdetalleMedicamentos;
    if (tipogrilla.length || tipogrilla === null) {
      for(let d of tipogrilla){
        if(d.acciond === 'I') {
          this.btnlimpiargrillamed = true;
          break;
        } else {
          this.btnlimpiargrillamed = false;
        }
      }
    } else{ this.btnlimpiargrillamed = false; }
  }

  /**funcion que habilita/desactiva btnLimpiargrilla Insumos */
  checkInsumosnuevo() {
    const tipogrilla = this.arrdetalleInsumos;
    if (tipogrilla.length || tipogrilla === null) {
      for(let d of tipogrilla){
        if(d.acciond === 'I') {
          this.btnlimpiargrillains = true;
          break;
        } else {
          this.btnlimpiargrillains = false;
        }
      }
    } else{ this.btnlimpiargrillains = false; }
  }

  setProducto(art: Articulos) {
    this.codprod = null;
    this.descprod = null;
    let cantidad = this.FormDatosProducto.controls.cantidad.value;
    if(cantidad === undefined || cantidad <= 0) {
      cantidad = 1;
    }
    var detalleSolicitud = new DetalleSolicitud;
    detalleSolicitud.sodeid = 0;
    detalleSolicitud.soliid = 0;
    detalleSolicitud.repoid = 0;
    detalleSolicitud.codmei = art.codigo;
    detalleSolicitud.meinid = art.mein;
    detalleSolicitud.dosis = 0;
    detalleSolicitud.formulacion = 0;
    detalleSolicitud.dias = 0;
    // tslint:disable-next-line: radix
    detalleSolicitud.cantsoli = parseInt(cantidad);
    detalleSolicitud.pendientedespacho = 0;
    detalleSolicitud.cantdespachada = 0;
    detalleSolicitud.cantdevolucion = 0;
    detalleSolicitud.estado = 1;
    detalleSolicitud.observaciones = null;
    detalleSolicitud.fechamodifica = null;
    detalleSolicitud.usuariomodifica = null;
    detalleSolicitud.fechaelimina = null;
    detalleSolicitud.usuarioelimina = null;
    detalleSolicitud.viaadministracion = null;
    detalleSolicitud.meindescri = art.descripcion;
    detalleSolicitud.stockorigen = null;
    detalleSolicitud.stockdestino = null;
    detalleSolicitud.acciond = null;
    detalleSolicitud.marca = null;
    detalleSolicitud.fechavto = null;
    detalleSolicitud.lote = null;
    detalleSolicitud.cantadespachar = 0;
    detalleSolicitud.descunidadmedida = art.desunidaddespacho;
    detalleSolicitud.tiporegmein = art.tiporegistro;
    detalleSolicitud.nomplantilla = null;
    this.es_controlado = art.controlado;
    this.es_consignacion = art.consignacion;
    detalleSolicitud.controlado = this.es_controlado;
    detalleSolicitud.consignacion = this.es_consignacion;
    detalleSolicitud.acciond = 'I';
    detalleSolicitud.bloqcampogrilla = true;
    if (detalleSolicitud.tiporegmein == "M") {
      if(this.tipobusqueda==='Solicitud' && this.solins) {
        /*debe ingresar solo Insumos*/
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.puede.ingresar.medicamento');
        this.alertSwalAlert.show();
        return;
      } else {
        /** Cambia a tab Medicamento */
        this.tabProductoTabs.tabs[0].active = true;
        /** */
        this.arrdetalleMedicamentos.unshift(detalleSolicitud);
        this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0,20);

        this.optMed = "DESC"
        this.arrMedicamentopaginacion.sort(function (a, b) {
          if (a.meindescri > b.meindescri) {
          return 1;
          }
          if (a.meindescri < b.meindescri) {
          return -1;
          }
          // a must be equal to b
          return 0;
        });

        this.arrdetalleMedicamentos_aux = this.arrdetalleMedicamentos;
        this.arrMedicamentopaginacion_aux = this.arrMedicamentopaginacion;
        this.ActivaBotonBuscaGrilla = true;
        this.checkMedicamentonuevo();
      }

    } else if (detalleSolicitud.tiporegmein == "I") {
      if(this.tipobusqueda==='Solicitud' && this.solmedic) {
        /*debe ingresar solo Medicamentos*/
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.puede.ingresar.insumos');
        this.alertSwalAlert.show();
        return;
      } else {
        /** Cambia a tab Insumo */
        this.tabProductoTabs.tabs[1].active = true;
        /** */
        this.arrdetalleInsumos.unshift(detalleSolicitud);
        this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0,20);

        this.optIns = "DESC"
        this.arrInsumospaginacion.sort(function (a, b) {
          if (a.meindescri > b.meindescri) {
          return 1;
          }
          if (a.meindescri < b.meindescri) {
          return -1;
          }
          // a must be equal to b
          return 0;
        });

        this.arrdetalleInsumos_aux = this.arrdetalleInsumos;
        this.arrInsumospaginacion_aux = this.arrInsumospaginacion;
        this.ActivaBotonBuscaGrillaInsumo = true;
        this.checkInsumosnuevo();
      }
    }
  }

  setDetallemedicamentos() {
    this.arrdetalleMedicamentos.forEach(element => {
      var objProducto = new DetalleSolicitud;
      if (this.numsolicitud > 0) {
        objProducto.soliid = this.numsolicitud;
        objProducto.sodeid = element.sodeid;
        objProducto.acciond = element.acciond;
      } else if (this.accionsolicitud == 'M' || this.accionsolicitud == 'E') {
        objProducto.soliid = this.FormDatosPaciente.controls.numsolicitud.value;
        objProducto.sodeid = element.sodeid;
        objProducto.acciond = element.acciond;
        objProducto.fechamodifica = this.fechaactual;
        objProducto.usuariomodifica = this.usuario;
      } else {
        objProducto.soliid = 0;
        objProducto.sodeid = 0;
        objProducto.acciond = element.acciond;
      }
      objProducto.repoid = 0;
      objProducto.codmei = element.codmei;
      objProducto.meinid = element.meinid;
      objProducto.dosis = element.dosis;
      objProducto.formulacion = element.formulacion;
      objProducto.dias = element.dias;
      objProducto.cantsoli = element.cantsoli;
      objProducto.pendientedespacho = 0;
      objProducto.cantdespachada = 0;
      objProducto.cantdevolucion = 0;
      objProducto.estado = 1;
      objProducto.observaciones = null;
      objProducto.fechamodifica = null;
      objProducto.usuariomodifica = null;
      objProducto.fechaelimina = null;
      objProducto.usuarioelimina = null;
      objProducto.viaadministracion = null;
      objProducto.meindescri = element.meindescri;
      objProducto.stockorigen = null;
      objProducto.stockdestino = null;
      objProducto.marca = null;
      objProducto.fechavto = null;
      objProducto.lote = null;
      objProducto.cantadespachar = 0;
      objProducto.descunidadmedida = null;
      objProducto.tiporegmein = element.tiporegmein;
      this.grillaMedicamentos.push(objProducto);
    });

  }

  async setCabeceramedicamentos() {
    let cabeceraSolicitud = new Solicitud();
    /**set variables a null */
    for (var key in cabeceraSolicitud) {
      if (cabeceraSolicitud.hasOwnProperty(key)) {
        cabeceraSolicitud[key] = null;
      }
    }
    /**set var necesarias */
    cabeceraSolicitud.hdgcodigo = this.hdgcodigo;
    cabeceraSolicitud.esacodigo = this.esacodigo;
    cabeceraSolicitud.cmecodigo = this.cmecodigo;
    cabeceraSolicitud.cliid = this.dataPacienteSolicitud.cliid;
    cabeceraSolicitud.tipodocpac = this.dataPacienteSolicitud.tipodocpac;
    cabeceraSolicitud.numdocpac = this.dataPacienteSolicitud.numdocpac.trim();
    cabeceraSolicitud.apepaternopac = this.dataPacienteSolicitud.apepaternopac;
    cabeceraSolicitud.apematernopac = this.dataPacienteSolicitud.apematernopac;
    cabeceraSolicitud.nombrespac = this.dataPacienteSolicitud.nombrespac;

    /** Setea codambito para luego llamar al servicio Cargasolicitud */
    this.codambito = this.FormDatosPaciente.controls.ambito.value;
    cabeceraSolicitud.codambito = parseInt(this.FormDatosPaciente.controls.ambito.value);
    cabeceraSolicitud.estid = this.dataPacienteSolicitud.estid;
    cabeceraSolicitud.ctaid = this.dataPacienteSolicitud.ctaid;
    cabeceraSolicitud.edadpac = 0;
    cabeceraSolicitud.codsexo = this.dataPacienteSolicitud.codsexo;
    cabeceraSolicitud.codservicioactual = this.FormDatosPaciente.controls.servicio.value;
    cabeceraSolicitud.codservicioori = this.dataPacienteSolicitud.codservicioori;
    cabeceraSolicitud.codserviciodes = 0;
    cabeceraSolicitud.boddestino = this.FormDatosPaciente.controls.bodcodigo.value;
    cabeceraSolicitud.bodorigen = this.FormDatosPaciente.controls.bodcodigo.value;
    if (cabeceraSolicitud.boddestino > 0){
      this.bodegasdestino.forEach(element => {
        if(cabeceraSolicitud.boddestino === element.bodcodigo){
          cabeceraSolicitud.tipoboddestino = element.bodtipobodega;
          cabeceraSolicitud.tipobodorigen = element.bodtipobodega;
        }
      });
    }
    cabeceraSolicitud.tipoproducto = 0;
    cabeceraSolicitud.numeroreceta = 0;
    cabeceraSolicitud.tipomovim = 'C';
    cabeceraSolicitud.tiposolicitud = 40;
    cabeceraSolicitud.estadosolicitud = parseInt(this.FormDatosPaciente.controls.estado.value);
    cabeceraSolicitud.prioridadsoli = 1;
    cabeceraSolicitud.tipodocprof = this.dataPacienteSolicitud.tipodocprof;
    cabeceraSolicitud.numdocprof = this.dataPacienteSolicitud.numdocprof;
    cabeceraSolicitud.fechacreacion = this.fechaactual;
    cabeceraSolicitud.usuariocreacion = this.usuario;
    cabeceraSolicitud.nombremedico = this.dataPacienteSolicitud.nombremedico;
    cabeceraSolicitud.cuentanumcuenta = this.dataPacienteSolicitud.cuentanumcuenta;
    cabeceraSolicitud.usuario = this.usuario;
    cabeceraSolicitud.servidor = this.servidor;
    cabeceraSolicitud.origensolicitud = this.origensolicitud;
    cabeceraSolicitud.pagina = this.pagina;
    /* Datos paciente */
    cabeceraSolicitud.codpieza = this.dataPacienteSolicitud.codpieza;
    cabeceraSolicitud.camid = this.dataPacienteSolicitud.camid;
    cabeceraSolicitud.piezaid = this.dataPacienteSolicitud.piezaid;
    cabeceraSolicitud.glsexo = this.dataPacienteSolicitud.glsexo;
    cabeceraSolicitud.glstipidentificacion = this.dataPacienteSolicitud.glstipidentificacion;
    cabeceraSolicitud.glsambito = this.dataPacienteSolicitud.glsambito;
    cabeceraSolicitud.undglosa = this.dataPacienteSolicitud.undglosa;
    cabeceraSolicitud.camglosa = this.dataPacienteSolicitud.camglosa;
    cabeceraSolicitud.pzagloza = this.dataPacienteSolicitud.pzagloza;
    cabeceraSolicitud.edad = this.dataPacienteSolicitud.edad;
    cabeceraSolicitud.controlado = this.es_controlado;
    cabeceraSolicitud.consignacion = this.es_consignacion;
    cabeceraSolicitud.solitiporeg = "M";

    /** asigna grilla medicamentos */
    this.setGrillamedicamentos();
    cabeceraSolicitud.solicitudesdet = this.grillaMedicamentos;
    this.solicitudMedicamento = cabeceraSolicitud;

  }

  /**
   * Ajuste: condicion para variable acciond para agregar nuevo producto a solicitud creada
   * fecha: 21-12-2020
   * autor: MLobos miguel.lobos@sonda.com
   */
  async setGrillamedicamentos() {
    this.grillaMedicamentos = [];
    this.arrdetalleMedicamentos.forEach(element => {
      var medicamento = new DetalleSolicitud;
      if (this.numsolicitud > 0) {
        if (this.accionsolicitud == 'M') {
          medicamento.soliid = this.FormDatosPaciente.controls.numsolicitud.value;
          medicamento.sodeid = element.sodeid;
          if(element.acciond===null||!element.acciond.length||element.acciond===''){
            medicamento.acciond = this.accionsolicitud;
          } else{
            medicamento.acciond = element.acciond;
          }
          medicamento.fechamodifica = this.fechaactual;
          medicamento.usuariomodifica = this.usuario;
        }
        if (this.accionsolicitud == 'E') {
          medicamento.soliid = this.FormDatosPaciente.controls.numsolicitud.value;
          medicamento.sodeid = element.sodeid;
          medicamento.acciond = this.accionsolicitud;
          medicamento.fechaelimina = this.fechaactual;
          medicamento.usuarioelimina = this.usuario;
        }
      } else if (this.accionsolicitud = 'I') {
        medicamento.soliid = 0;
        medicamento.sodeid = 0;
        medicamento.acciond = this.accionsolicitud;
      }
      medicamento.repoid = 0;
      medicamento.codmei = element.codmei;
      medicamento.meinid = element.meinid;
      medicamento.dosis = element.dosis;
      medicamento.formulacion = element.formulacion;
      medicamento.dias = element.dias;
      medicamento.cantsoli = element.cantsoli;
      medicamento.pendientedespacho = 0;
      medicamento.cantdespachada = 0;
      medicamento.cantdevolucion = 0;
      medicamento.estado = 10;
      medicamento.observaciones = null;
      medicamento.fechamodifica = null;
      medicamento.usuariomodifica = null;
      medicamento.fechaelimina = null;
      medicamento.usuarioelimina = null;
      medicamento.viaadministracion = null;
      medicamento.meindescri = element.meindescri;
      medicamento.stockorigen = null;
      medicamento.stockdestino = null;
      medicamento.marca = null;
      medicamento.fechavto = null;
      medicamento.lote = null;
      medicamento.cantadespachar = 0;
      medicamento.descunidadmedida = null;
      medicamento.tiporegmein = element.tiporegmein;
      this.grillaMedicamentos.push(medicamento);
    });

  }

  async setCabecerainsumos() {
    let cabeceraSolicitud = new Solicitud();
    /**set variables a null */
    for (var key in cabeceraSolicitud) {
      if (cabeceraSolicitud.hasOwnProperty(key)) {
        cabeceraSolicitud[key] = null;
      }
    }
    /**set var necesarias */
    cabeceraSolicitud.hdgcodigo = this.hdgcodigo;
    cabeceraSolicitud.esacodigo = this.esacodigo;
    cabeceraSolicitud.cmecodigo = this.cmecodigo;
    cabeceraSolicitud.cliid = this.dataPacienteSolicitud.cliid;
    cabeceraSolicitud.tipodocpac = this.dataPacienteSolicitud.tipodocpac;
    cabeceraSolicitud.numdocpac = this.dataPacienteSolicitud.numdocpac.trim();
    cabeceraSolicitud.apepaternopac = this.dataPacienteSolicitud.apepaternopac;
    cabeceraSolicitud.apematernopac = this.dataPacienteSolicitud.apematernopac;
    cabeceraSolicitud.nombrespac = this.dataPacienteSolicitud.nombrespac;
    /** Setea codambito para luego llamar al servicio Cargasolicitud */


    this.codambito = this.FormDatosPaciente.controls.ambito.value;
    cabeceraSolicitud.codambito = parseInt(this.FormDatosPaciente.controls['ambito'].value);
    cabeceraSolicitud.estid = this.dataPacienteSolicitud.estid;
    cabeceraSolicitud.ctaid = this.dataPacienteSolicitud.ctaid;
    cabeceraSolicitud.edadpac = 0;
    cabeceraSolicitud.codsexo = this.dataPacienteSolicitud.codsexo;
    cabeceraSolicitud.codservicioactual = this.FormDatosPaciente.controls.servicio.value;
    cabeceraSolicitud.codservicioori = this.dataPacienteSolicitud.codservicioori;
    cabeceraSolicitud.codserviciodes = 0;
    cabeceraSolicitud.boddestino = this.FormDatosPaciente.controls.bodcodigo.value;
    cabeceraSolicitud.bodorigen = this.FormDatosPaciente.controls.bodcodigo.value;
    if (cabeceraSolicitud.boddestino > 0){
      this.bodegasdestino.forEach(element => {
        if(cabeceraSolicitud.boddestino === element.bodcodigo){
          cabeceraSolicitud.tipoboddestino = element.bodtipobodega;
          cabeceraSolicitud.tipobodorigen = element.bodtipobodega;
        }
      });
    }
    cabeceraSolicitud.tipoproducto = 0;
    cabeceraSolicitud.numeroreceta = 0;
    cabeceraSolicitud.tipomovim = 'C';
    cabeceraSolicitud.tiposolicitud = 40;
    cabeceraSolicitud.estadosolicitud = parseInt(this.FormDatosPaciente.controls['estado'].value);
    cabeceraSolicitud.prioridadsoli = 1;
    cabeceraSolicitud.tipodocprof = this.dataPacienteSolicitud.tipodocprof;
    cabeceraSolicitud.numdocprof = this.dataPacienteSolicitud.numdocprof;
    cabeceraSolicitud.fechacreacion = this.fechaactual;
    cabeceraSolicitud.usuariocreacion = this.usuario;
    cabeceraSolicitud.nombremedico = this.dataPacienteSolicitud.nombremedico;
    cabeceraSolicitud.cuentanumcuenta = this.dataPacienteSolicitud.cuentanumcuenta;
    cabeceraSolicitud.usuario = this.usuario;
    cabeceraSolicitud.servidor = this.servidor;
    cabeceraSolicitud.origensolicitud = this.origensolicitud;
    cabeceraSolicitud.pagina = this.pagina;
    /* Datos paciente */
    cabeceraSolicitud.codpieza = this.dataPacienteSolicitud.codpieza;
    cabeceraSolicitud.camid = this.dataPacienteSolicitud.camid;
    cabeceraSolicitud.piezaid = this.dataPacienteSolicitud.piezaid;
    cabeceraSolicitud.glsexo = this.dataPacienteSolicitud.glsexo;
    cabeceraSolicitud.glstipidentificacion = this.dataPacienteSolicitud.glstipidentificacion;
    cabeceraSolicitud.glsambito = this.dataPacienteSolicitud.glsambito;
    cabeceraSolicitud.undglosa = this.dataPacienteSolicitud.undglosa;
    cabeceraSolicitud.camglosa = this.dataPacienteSolicitud.camglosa;
    cabeceraSolicitud.pzagloza = this.dataPacienteSolicitud.pzagloza;
    cabeceraSolicitud.edad = this.dataPacienteSolicitud.edad;
    cabeceraSolicitud.controlado = this.es_controlado;
    cabeceraSolicitud.consignacion = this.es_consignacion;
    cabeceraSolicitud.solitiporeg = "I";
    /** asigna grilla insumos */
    this.setGrillainsumos();
    cabeceraSolicitud.solicitudesdet = this.grillaInsumos;
    this.solicitudInsumo = cabeceraSolicitud;
  }

  async setGrillainsumos() {
    this.grillaInsumos = [];
    this.arrdetalleInsumos.forEach(element => {
      var insumo = new DetalleSolicitud;
      if (this.numsolicitud > 0) {
        if (this.accionsolicitud == 'M') {
          insumo.soliid = this.FormDatosPaciente.controls.numsolicitud.value;
          insumo.sodeid = element.sodeid;
          if(element.acciond===null||!element.acciond.length||element.acciond===''){
            insumo.acciond = this.accionsolicitud;
          } else{
            insumo.acciond = element.acciond;
          }
          insumo.fechamodifica = this.fechaactual;
          insumo.usuariomodifica = this.usuario;
        }
        if (this.accionsolicitud == 'E') {
          insumo.soliid = this.FormDatosPaciente.controls.numsolicitud.value;
          insumo.sodeid = element.sodeid;
          insumo.acciond = this.accionsolicitud;
          insumo.fechaelimina = this.fechaactual;
          insumo.usuarioelimina = this.usuario;
        }
      } else {
        if (this.accionsolicitud = 'I') {
          insumo.soliid = 0;
          insumo.sodeid = 0;
          insumo.acciond = this.accionsolicitud;
        }
      }
      insumo.repoid = 0;
      insumo.codmei = element.codmei;
      insumo.meinid = element.meinid;
      insumo.dosis = 0;
      insumo.formulacion = 0;
      insumo.dias = 0;
      insumo.cantsoli = element.cantsoli;
      insumo.pendientedespacho = 0;
      insumo.cantdespachada = 0;
      insumo.cantdevolucion = 0;
      insumo.estado = 10;
      insumo.observaciones = null;
      insumo.fechamodifica = null;
      insumo.usuariomodifica = null;
      insumo.fechaelimina = null;
      insumo.usuarioelimina = null;
      insumo.viaadministracion = null;
      insumo.meindescri = element.meindescri;
      insumo.stockorigen = null;
      insumo.stockdestino = null;
      insumo.marca = null;
      insumo.fechavto = null;
      insumo.lote = null;
      insumo.cantadespachar = 0;
      insumo.descunidadmedida = null;
      insumo.tiporegmein = element.tiporegmein;
      this.grillaInsumos.push(insumo);
    });
  }

  async setSolicitud() {
    this.fechaactual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    /**Seteamos variables cabecera Solicitud //@Mlobos */
    try {
      await this.setCabeceramedicamentos();
      await this.setCabecerainsumos();
    } catch (err) {
      this.alertSwalError.title = this.TranslateUtil('key.title.error');
      this.alertSwalError.text = err.message;
      this.alertSwalError.show();
    }
  }

  async onGrabar() {
    this.accionsolicitud = 'I';
    this.modalconfirmar("Crear");
  }

  async onModificar() {
    this.accionsolicitud = 'M';
    this.numsolicitud = this.FormDatosPaciente.controls.numsolicitud.value;
    this.modalconfirmar("Modificar");
  }

  async onEliminarSolicitud() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.eliminar.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then(async (result) => {
      if (result.value) {
        this.loading = true;
        if( this.tieneProductos ) {
          if(this.arrdetalleInsumos.length > 0) {
            await this.eliminarSolInsumo();
          }
          if(this.arrdetalleMedicamentos.length > 0) {
            await this.eliminarSolMedicamento();
          }
          if (this.arrdetalleMedicamentos.length === 0 && this.arrdetalleInsumos.length === 0){
            await this.eliminarSolMedicamento();
          }
          this.loading = false;
        } else {

          await this.setSolicitud();
          this.solicitudMedicamento.usuarioelimina = this.usuario;
          this.solicitudMedicamento.estadosolicitud = 110;
          this.solicitudMedicamento.soliid = this.dataPacienteSolicitud.soliid;// this.FormSolicitudPaciente.value.numsolicitud;
          this.solicitudMedicamento.accion = "E";
          this.solicitudMedicamento.bandera = 1;

          if(this.dataPacienteSolicitud != undefined){
            if(this.dataPacienteSolicitud.bandera != 2){
              this.ValidaEstadoSolicitud(1,'destroy');
            }
          }
          this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(data => {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.eliminada');
            this.alertSwal.show();
            this.loading = false;
            this.cargaSolicitud(data.solbodid);
          }, err => {
            this.loading = false;
            this.alertSwalError.title = this.TranslateUtil('key.title.error');
            this.alertSwalError.text = err.message;
            this.alertSwalError.show();
          });

          this.loading = false;

        }

      }
    });

  }

  //Elimina medicamento desde la grilla
  async onEliminarMed(detalle: DetalleSolicitud, id: number) {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.eliminar'),
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then(async (result) => {
      if (result.value) {
        this.loading = true;
        if (detalle.soliid == 0 && detalle.sodeid == 0) {
          detalle.acciond = 'I';
          if (detalle.acciond == "I" && id >= 0 && detalle.sodeid == 0) {
            // Eliminar registro nuevo la grilla
            this.arrdetalleMedicamentos.splice(id, 1);
            this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0,20);
            this.logicaVacios();
            this.loading = false;
            this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado.exitosamente');
            this.alertSwal.show();
            this.checkMedicamentonuevo();
            this.checkInsumosnuevo();
          }
        }
        else {
          if (detalle.soliid > 0 && detalle.sodeid > 0) {
            this.accionsolicitud = 'M';
            await this.setCabeceramedicamentos();
            this.solicitudMedicamento.accion = "M"
            this.solicitudMedicamento.soliid = detalle.soliid;
            this.solicitudMedicamento.usuariomodifica = this.usuario;
            this.solicitudMedicamento.usuariocreacion = null;
            this.solicitudMedicamento.fechacreacion = null;
            this.solicitudMedicamento.solicitudesdet[id].acciond = 'E';
            this.solicitudMedicamento.solicitudesdet[id].codmei = detalle.codmei;
            this.solicitudMedicamento.solicitudesdet[id].meindescri = detalle.meindescri;
            this.solicitudMedicamento.solicitudesdet[id].meinid = detalle.meinid;
            this.solicitudMedicamento.solicitudesdet[id].sodeid = detalle.sodeid;
            this.solicitudMedicamento.solicitudesdet[id].soliid = detalle.soliid;
            this.solicitudMedicamento.solicitudesdet[id].usuarioelimina = this.usuario;
            this.loading = false;
            /** Luego de setear el producto a eliminar procede a grabar solicitud//@ML */
            this.guardaProdeliminado(this.solicitudMedicamento);
          }
        }
      } else {
        detalle.acciond = null;
      }
    });
  }

  guardaProdeliminado(solicitud: Solicitud) {
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'salir');
      }
    }

    this._solicitudService.crearSolicitud(solicitud).subscribe(data => {

      this.loading = false;
      this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado.exitosamente');
      this.alertSwal.show();
      this.cargaSolicitud(this.numsolicitud);
    }, err => {
      this.loading = false;
      this.alertSwalError.title = this.TranslateUtil('key.title.error');
      this.alertSwalError.text = err.message;
      this.alertSwalError.show();
    }
    );
  }

  // Elimina Insumo desde la Grilla
  async onEliminarIns(detalle: DetalleSolicitud, id: number) {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.eliminar'),
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then(async (result) => {
      if (result.value) {
        this.loading = true;
        if (detalle.soliid == 0 && detalle.sodeid == 0) {
          detalle.acciond = 'I';
          if (detalle.acciond == "I" && id >= 0 && detalle.sodeid == 0) {
            // Eliminar registro nuevo la grilla
            this.arrdetalleInsumos.splice(id, 1);
            this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0,20);
            this.logicaVacios();
            this.loading = false;
            this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado.exitosamente');
            this.alertSwal.show();
          }
        }
        else {
          if (detalle.soliid > 0 && detalle.sodeid > 0) {
            this.accionsolicitud = 'M';
            await this.setCabecerainsumos();
            this.solicitudInsumo.accion = "M";
            this.solicitudInsumo.soliid = detalle.soliid
            this.solicitudInsumo.usuariomodifica = this.usuario;
            this.solicitudInsumo.usuariocreacion = null;
            this.solicitudInsumo.fechacreacion = null;
            this.solicitudInsumo.solicitudesdet[id].acciond = 'E';
            this.solicitudInsumo.solicitudesdet[id].codmei = detalle.codmei;
            this.solicitudInsumo.solicitudesdet[id].meindescri = detalle.meindescri;
            this.solicitudInsumo.solicitudesdet[id].meinid = detalle.meinid;
            this.solicitudInsumo.solicitudesdet[id].sodeid = detalle.sodeid;
            this.solicitudInsumo.solicitudesdet[id].soliid = detalle.soliid;
            this.solicitudInsumo.solicitudesdet[id].usuarioelimina = this.usuario;
            /** Luego de setear el producto a eliminar procede a grabar solicitud//@ML */
            this.guardaProdeliminado(this.solicitudInsumo);
          }
        }
      } else {
        detalle.acciond = null;
      }
    });
  }

  async modalconfirmar(mensaje: string) {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿ Desea '.concat(mensaje).concat(' la Solicitud?'),
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText:  this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then(async (result) => {
      if (result.value) {
        this.loading = true;
        /**Define Solicitud antes de enviar */
        await this.setSolicitud();
        /** Modificar */
        if (this.accionsolicitud == 'M') {
          this.solicitudMedicamento.accion = 'M';
          this.solicitudInsumo.accion = "M";
          this.solicitudMedicamento.usuariomodifica = this.usuario;
          this.solicitudInsumo.usuariomodifica = this.usuario;
          this.solicitudMedicamento.bandera = 1;
          this.solicitudInsumo.bandera = 1;
          if (this.numsolicitud > 0 && this.numsolins > 0) {
            this.solicitudMedicamento.soliid = this.numsolicitud;
            this.solicitudInsumo.soliid = this.numsolins;

          } else {
            this.solicitudMedicamento.soliid = this.dataPacienteSolicitud.soliid;
            this.solicitudInsumo.soliid = this.dataPacienteSolicitud.soliid;
          }
        } else {
          if (this.accionsolicitud == 'I') {
            this.solicitudMedicamento.soliid = 0; // id Medicamentos
            this.solicitudInsumo.soliid = 0; // id Insumo
            this.solicitudMedicamento.accion = 'I'; //insertar
            this.solicitudInsumo.accion = 'I';
          }
        }
        this.numsolicitud = 0;
        this.numsolins = 0;
        // reseteo de bandera
        if(this.dataPacienteSolicitud != undefined){
          if(this.dataPacienteSolicitud.bandera != 2){
            this.ValidaEstadoSolicitud(1,'destroy');
          }
        }

        if (this.solicitudInsumo.solicitudesdet.length == 0 && this.solicitudMedicamento.solicitudesdet.length >= 1) {
          await this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(data => {
            this.alertSwal.title = `${ mensaje } `+this.TranslateUtil('key.mensaje.solicitud.medicamentos.exitoso')+`, N°: ` + data.solbodid;
            this.numsolmedicamento = data.solbodid;
            this.alertSwal.text = "";
            this.alertSwal.show();
            this.loading = false;
            this.solmedic = true;
            this.numsolicitud = data.solbodid;
            this.verificanull = true;
            this.cargaSolicitud(data.solbodid);
          }, err => {
            this.loading = false;
            this.alertSwalError.title = "Error";
            this.alertSwalError.text = err.message;
            this.alertSwalError.show();
          });
        } else {
          if (this.solicitudMedicamento.solicitudesdet.length == 0 && this.solicitudInsumo.solicitudesdet.length >= 1) {
            await this._solicitudService.crearSolicitud(this.solicitudInsumo).subscribe(data => {
              this.alertSwal.title = `${ mensaje } `+this.TranslateUtil('key.mensaje.solicitud.insumos.exitoso')+`, N°: ` + data.solbodid;
              this.alertSwal.text = "";
              this.alertSwal.show();
              this.loading = false;
              this.solins = true;
              this.numsolins = data.solbodid;
              this.verificanull = true;
              this.cargaSolicitud(data.solbodid);
            }, err => {
              this.loading = false;
              this.alertSwalError.title = this.TranslateUtil('key.title.error');
              this.alertSwalError.text = err.message;
              this.alertSwalError.show();
            });
          } else {
            if (this.solicitudMedicamento.solicitudesdet.length >= 1 && this.solicitudInsumo.solicitudesdet.length >= 1) {
              try {
                await this.grabadobleSolicitud();
              } catch {
                this.loading = false;
                this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.crear.solicitud.insumos');
                this.alertSwalError.show();
              }
            }
          }
        }
      }
    });
  }

  async grabadobleSolicitud() {
    this._solicitudService.crearSolicitud(this.solicitudInsumo).subscribe(async data => {
      this.numsolinsumo = data.solbodid;
      this.solmedic = true;
      this.numsolins = data.solbodid;
      this.verificanull = true;
      this.imprimesolins = true;

      await this.cargaDoblesolicitud(this.numsolinsumo);
      await this.grabadobleSolicitudmedicamento();
    });
  }

  grabadobleSolicitudmedicamento() {
    this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(async data => {
      this.numsolmedicamento = data.solbodid;
      this.solins = true;
      this.numsolicitud = data.solbodid;
      await this.cargaDoblesolicitud(this.numsolmedicamento);
      this.loading = true;
      await this.confirmadobleSolicitud();
    });
    return;
  }

  confirmadobleSolicitud() {
    this.imprimesolins = true;
    this.imprimirsolicitud = true;
    this.tipobusqueda = 'Solicitud';
    this.FormDatosPaciente.get('numsolicitud').setValue(this.numsolmedicamento + " " + this.numsolinsumo);
    this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitudes.exitosas');
    this.alertSwal.text = this.TranslateUtil('key.mensaje.solicitud.medicamentos') + this.numsolmedicamento + ".   "+this.TranslateUtil('key.mensaje.solicitud.insumos')+", N°: " + this.numsolinsumo;
    this.alertSwal.show();
    this.loading = false;
  }

  setModal(titulo: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: titulo,
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Medico',
        id_Bodega: this.FormDatosPaciente.controls.bodcodigo.value,
        ambito: this.FormDatosPaciente.controls.ambito.value, //this.FormDatosPaciente.value.ambito,
        nombrepaciente: this.dataPacienteSolicitud.nombrespac,
        apepaternopac: this.dataPacienteSolicitud.apepaternopac,
        apematernopac: this.dataPacienteSolicitud.apematernopac,
        codservicioactual: this.dataPacienteSolicitud.codservicioactual,
        tipodocumento: this.dataPacienteSolicitud.tipodocpac,
        numeroidentificacion: this.dataPacienteSolicitud.numdocpac,
        buscasolicitud: "Solicitud_Paciente",
        descprod: this.descprod,
        codprod: this.codprod,
        paginaorigen: 10
      }
    };
    return dtModal;
  }

  setModalBusquedaPlantilla() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.plantilla.procedimiento'),
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipoplantilla: false
      }
    };
    return dtModal;
  }

  eventosSolicitud() {
    this._BSModalRef = this._BsModalService.show(EventosSolicitudComponent, this.setModalEventoSolicitud());
    this._BSModalRef.content.onClose.subscribe();
  }

  setModalEventoSolicitud() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.eventos.solicitud'),
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        _Solicitud: this.dataPacienteSolicitud
      }
    };
    return dtModal;
  }

  eventosDetalleSolicitud(registroDetalle: DetalleSolicitud) {
    this.varListaDetalleDespacho = new (DetalleSolicitud);
    this.varListaDetalleDespacho = registroDetalle;
    this._BSModalRef = this._BsModalService.show(EventosDetallesolicitudComponent, this.setModalEventoDetalleSolicitud());
    this._BSModalRef.content.onClose.subscribe((Respuesta: any) => {
    })
  }

  setModalEventoDetalleSolicitud() {

    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.eventos.detalle.solicitud'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        _Solicitud: this.dataPacienteSolicitud,
        _DetalleSolicitud: this.varListaDetalleDespacho,
      }
    };
    return dtModal;
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
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

  pageChangedmedicamento(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arrMedicamentopaginacion = this.arrdetalleMedicamentos.slice(startItem, endItem);
  }

  pageChangedinsumo(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arrInsumospaginacion = this.arrdetalleInsumos.slice(startItem, endItem);
  }

  onImprimir() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.imprimir.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.impresion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ImprimirSolicitud();
      }
    })

  }

  ImprimirSolicitud() {

    if (this.imprimesolins == true) {
      this._imprimesolicitudService.RPTImprimeSolicitud(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, "pdf", this.numsolicitud, this.FormDatosPaciente.value.ambito).subscribe(
          response => {
            if (response != null) {
              this.solic1 = response[0].url;
              this._imprimesolicitudService.RPTImprimeSolicitud(this.servidor, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, "pdf", this.numsolins, this.FormDatosPaciente.value.ambito).subscribe(
              data => {
                if (response != null) {
                  this.solic2 = data[0].url;
                  var i = 0;
                  while (i < 2) {
                    if (i == 0) {
                      window.open(this.solic1, "", "");
                    } else
                      if (i == 1) {
                        window.open(this.solic2, "", "");
                      }
                    i++;
                  }
                }
              },error => {
                this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.solicitud');
                this.alertSwalError.show();
                this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
                })
              });
            }
          });
    } else {
      this._imprimesolicitudService.RPTImprimeSolicitud(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, "pdf", this.dataPacienteSolicitud.soliid, this.dataPacienteSolicitud.codambito).subscribe(
          response => {
            if (response != null) {
              window.open(response[0].url, "", "");
            }
          },
          error => {
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.solicitud');
            this.alertSwalError.show();
            this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
            })
          }
        );
    }
  }

  /**
   * funcion revisa si existen codmei duplicados pero no evita que grabe/modifique
   * author: @MLobos
   * 11-03-2021
   * */
  async checkDuplicados(esgrabar: boolean) {
    let arrProductos: Array<DetalleSolicitud> = [];
    // une ambas grillas
    arrProductos = this.arrdetalleMedicamentos.concat(this.arrdetalleInsumos);
    // si existen datos
    if (arrProductos.length) {
      // define var locales
      let esDuplicado : boolean;
      let codprod = null;
      var arrValue = arrProductos.map(x => x.codmei);
      arrValue.some((item, idx) => {
        codprod = item;
        return esDuplicado = arrValue.indexOf(item) != idx;
      });
      //si existen devuelve mensaje de alerta //
      if (esDuplicado === true) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.existe.codigo.duplicado');
        this.alertSwalAlert.show().then(ok => {
          if (ok.value) {
            //var esgrabar define si se desea Grabar o Modificar
            if (esgrabar === true) {
              this.onGrabar();
            } else {
              this.onModificar();
            }
          }
        });
      }
      else {
        if (esgrabar === true) {
          this.onGrabar();
        } else {
          this.onModificar();
        }
      }
    } else{ return; }
  }

  desactivabtneliminar(){
    if ( this.dataPacienteSolicitud.estadosolicitud !== 10 ) {
     return true;
    } else {
     return false;
    }
  }

  /**
   * funcion revisa si existen codmei duplicados y evita insertarlo en grilla
   * miguel.lobos@
   * 11-03-2021
   * */
  async validaCodigo(valorCodigo: any){
    this.alertSwal.title = null;
    this.alertSwal.text = null;
    let arrProductos: Array<DetalleSolicitud> = [];
    arrProductos = this.arrdetalleMedicamentos.concat(this.arrdetalleInsumos);
    const resultado_medicamnto = arrProductos.find( registro => registro.codmei === valorCodigo );
    if  ( resultado_medicamnto != undefined )
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.articulo.repetido');
      this.alertSwalError.show();
      this.FormDatosProducto.controls.codigo.setValue('');
      return false;
    } else { return true; }
  }

  validaCantidadDispensada(cantidad: number) {

    this.alertSwal.title = null;
    this.alertSwal.text = null;
    // if  ( cantidad <= 0 )
    // {
    //   this.alertSwalError.title = 'Cantidad debe ser mayor a cero';
    //   this.alertSwalError.show();
    //   // this.FormDatosProducto.controls.cantidad.setValue(1);
    //   return;
    // }
  }

  async CambioCheckMed(registro: DetalleSolicitud,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      this.listaDetalleEliminadoMed.unshift(registro);
     }else{
      var i = this.listaDetalleEliminadoMed.indexOf( registro );
      if ( i !== -1 ) {
        this.listaDetalleEliminadoMed.splice( i, 1 );
      }
    }

    registro.marcacheckgrilla = event.target.checked;
    // if(event.target.checked){
    //   registro.marcacheckgrilla = true;
    //   this.desactivabtnelimmed = true;
    //   await this.isEliminaMedGrilla(registro)
    //   await this.arrdetalleMedicamentos.forEach(d=>{
    //     if(d.marcacheckgrilla === true){
    //       this.desactivabtnelimmed = true;
    //     }
    //   });
    // }else{
    //   registro.marcacheckgrilla = false;
    //   this.desactivabtnelimmed = false;
    //   await this.isEliminaMedGrilla(registro);
    //   await this.arrdetalleMedicamentos.forEach(d=>{
    //     if(d.marcacheckgrilla === true){
    //       this.desactivabtnelimmed = true;
    //     }
    //   });
    // }
  }

  debeBloquearBotonEliminarProductos() {
    if (this.listaDetalleEliminadoMed.length === 0 || this.arrMedicamentopaginacion.length === 0) {
      return true;
    }

    return !this.arrMedicamentopaginacion.some(medicamento => medicamento.marcacheckgrilla);
  }

  isEliminaMedGrilla(registro: DetalleSolicitud) {
    let indice = 0;
    for (const articulo of this.arrdetalleMedicamentos) {
      if (registro.codmei === articulo.codmei && registro.sodeid === articulo.sodeid) {
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
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.eliminacion.producto'),
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
    });
  }

  async EliminaProductoDeLaGrilla2() {
    if(this.listaDetalleEliminadoMed.length){
      for (const element of this.listaDetalleEliminadoMed) {
        var i = this.arrdetalleMedicamentos.indexOf( element );
        if ( i !== -1 ) {
          if (element.sodeid > 0) {
            this.loading = true;
            this.accionsolicitud = 'M';
            this.desactivabtnelimmed = false;
            this.setCabeceramedicamentos();
            this.solicitudMedicamento.accion = "M"
            this.solicitudMedicamento.soliid = element.soliid;
            this.solicitudMedicamento.usuariomodifica = this.usuario;
            this.solicitudMedicamento.usuariocreacion = null;
            this.solicitudMedicamento.fechacreacion = null;
            this.solicitudMedicamento.solicitudesdet[i].acciond = 'E';
            this.solicitudMedicamento.solicitudesdet[i].codmei = element.codmei;
            this.solicitudMedicamento.solicitudesdet[i].meindescri = element.meindescri;
            this.solicitudMedicamento.solicitudesdet[i].meinid = element.meinid;
            this.solicitudMedicamento.solicitudesdet[i].sodeid = element.sodeid;
            this.solicitudMedicamento.solicitudesdet[i].soliid = element.soliid;
            this.solicitudMedicamento.solicitudesdet[i].usuarioelimina = this.usuario;
            this.loading = false;
            this.guardaProdeliminado(this.solicitudMedicamento);
          } else {
            this.arrdetalleMedicamentos.splice( i, 1 );
            this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//;//.slice(0,20);
            this.loading = false;
            this.logicaVacios();
          }
        }
      }
    }
  }

  IdgrillaProductosMed(registro: DetalleSolicitud) {
    let indice = 0;
    for (const articulo of this.arrdetalleMedicamentos) {
      if (registro.codmei === articulo.codmei) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

  async CambioCheckIns(registro: DetalleSolicitud,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      this.listaDetalleEliminadoIns.unshift(registro);
     }else{
      var i = this.listaDetalleEliminadoIns.indexOf( registro );
      if ( i !== -1 ) {
        this.listaDetalleEliminadoIns.splice( i, 1 );
      }
    }

    registro.marcacheckgrilla = event.target.checked;
    // if(event.target.checked){
    //   registro.marcacheckgrilla = true;
    //   this.desactivabtnelimins = true;
    //   await this.isEliminaInsGrilla(registro)
    //   await this.arrdetalleInsumos.forEach(d=>{
    //     if(d.marcacheckgrilla === true){
    //       this.desactivabtnelimins = true;
    //     }
    //   });
    // }else{
    //   registro.marcacheckgrilla = false;
    //   this.desactivabtnelimins = false;
    //   await this.isEliminaInsGrilla(registro);
    //   await this.arrdetalleInsumos.forEach(d=>{
    //     if(d.marcacheckgrilla === true){
    //       this.desactivabtnelimins = true;
    //     }
    //   });
    // }
  }

   debeBloquearBotonEliminarInsumos() {
    if (this.listaDetalleEliminadoIns.length === 0 || this.arrInsumospaginacion.length === 0) {
      return true;
    }

    return !this.arrInsumospaginacion.some(insumo => insumo.marcacheckgrilla);
  }

  isEliminaInsGrilla(registro: DetalleSolicitud) {
    let indice = 0;
    for (const articulo of this.arrdetalleInsumos) {
      if (registro.codmei === articulo.codmei && registro.sodeid === articulo.sodeid) {
        articulo.marcacheckgrilla = registro.marcacheckgrilla;
        return indice;
      }
      indice++;
    }
    return -1;
  }

  ConfirmaEliminaInsumoDeLaGrilla2() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.eliminacion.producto'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion.producto'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.EliminaInsumoDeLaGrilla2();
      }
    })
  }

  async EliminaInsumoDeLaGrilla2() {
    if(this.listaDetalleEliminadoIns.length){
      for (const element of this.listaDetalleEliminadoIns) {
        var i = this.arrdetalleInsumos.indexOf( element );
        if ( i !== -1 ) {
          if (element.sodeid > 0) {
            this.loading = true;
            this.accionsolicitud = 'M';
            this.desactivabtnelimins = false;
            this.setCabecerainsumos();
            this.solicitudInsumo.accion = "M";
            this.solicitudInsumo.soliid = element.soliid
            this.solicitudInsumo.usuariomodifica = this.usuario;
            this.solicitudInsumo.usuariocreacion = null;
            this.solicitudInsumo.fechacreacion = null;
            this.solicitudInsumo.solicitudesdet[i].acciond = 'E';
            this.solicitudInsumo.solicitudesdet[i].codmei = element.codmei;
            this.solicitudInsumo.solicitudesdet[i].meindescri = element.meindescri;
            this.solicitudInsumo.solicitudesdet[i].meinid = element.meinid;
            this.solicitudInsumo.solicitudesdet[i].sodeid = element.sodeid;
            this.solicitudInsumo.solicitudesdet[i].soliid = element.soliid;
            this.solicitudInsumo.solicitudesdet[i].usuarioelimina = this.usuario;
            this.guardaProdeliminado(this.solicitudInsumo);
            this.loading = false;
          } else {
            this.arrdetalleInsumos.splice( i, 1 );
            this.arrInsumospaginacion = this.arrdetalleInsumos;
            this.loading = false;
            this.logicaVacios();
          }
        }
      }
    }

    // var id;
    // this.arrInsumospaginacion.forEach(detalle=>{
    //   if (detalle.soliid == 0 && detalle.sodeid == 0) {
    //     detalle.acciond = 'I';
    //     id = this.IdgrillaProductosIns(detalle)
    //     if (detalle.acciond == "I" && id >= 0 && detalle.sodeid == 0) {
    //       if(detalle.marcacheckgrilla === true){
    //         // Eliminar registro nuevo la grilla
    //         this.desactivabtnelimins = false;
    //         this.arrdetalleInsumos.splice(id, 1);
    //         this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0,20);
    //         this.optIns = "DESC"
    //         this.arrInsumospaginacion.sort(function (a, b) {
    //           if (a.meindescri > b.meindescri) {
    //           return 1;
    //           }
    //           if (a.meindescri < b.meindescri) {
    //           return -1;
    //           }
    //           // a must be equal to b
    //           return 0;
    //         });
    //         this.logicaVacios();
    //         this.loading = false;
    //         this.alertSwal.title = "Producto eliminado exitosamente";
    //         this.alertSwal.show();
    //       }
    //     }
    //   }
    //   else {
    //     if (detalle.soliid > 0 && detalle.sodeid > 0) {
    //       id = this.IdgrillaProductosIns(detalle)
    //       if(detalle.marcacheckgrilla === true){
    //         this.accionsolicitud = 'M';
    //         this.desactivabtnelimins = false;
    //         this.setCabecerainsumos();
    //         this.solicitudInsumo.accion = "M";
    //         this.solicitudInsumo.soliid = detalle.soliid
    //         this.solicitudInsumo.usuariomodifica = this.usuario;
    //         this.solicitudInsumo.usuariocreacion = null;
    //         this.solicitudInsumo.fechacreacion = null;
    //         this.solicitudInsumo.solicitudesdet[id].acciond = 'E';
    //         this.solicitudInsumo.solicitudesdet[id].codmei = detalle.codmei;
    //         this.solicitudInsumo.solicitudesdet[id].meindescri = detalle.meindescri;
    //         this.solicitudInsumo.solicitudesdet[id].meinid = detalle.meinid;
    //         this.solicitudInsumo.solicitudesdet[id].sodeid = detalle.sodeid;
    //         this.solicitudInsumo.solicitudesdet[id].soliid = detalle.soliid;
    //         this.solicitudInsumo.solicitudesdet[id].usuarioelimina = this.usuario;
    //         /** Luego de setear el producto a eliminar procede a grabar solicitud//@ML */
    //         this.guardaProdeliminado(this.solicitudInsumo);
    //       }
    //     }
    //   }
    // })
  }

  IdgrillaProductosIns(registro: DetalleSolicitud) {
    let indice = 0;
    for (const articulo of this.arrdetalleInsumos) {
      if (registro.codmei === articulo.codmei) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

  async findArticuloGrillaMedicamento() {
    this.loading = true;
    if ( this.FormDatosProducto.controls.codigo.touched &&
        this.FormDatosProducto.controls.codigo.status !== 'INVALID') {
        var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
        this.arrdetalleMedicamentos_2 = [];
          this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
            this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
            this.arrdetalleMedicamentos,null,null,null,null).subscribe(response => {
              if(response != null){
                this.arrdetalleMedicamentos_2=response;

                this.arrdetalleMedicamentos = [];
                this.arrMedicamentopaginacion = [];

                this.arrdetalleMedicamentos = this.arrdetalleMedicamentos_2;
                this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0,20);
                this.ActivaBotonLimpiaBusca = true;
                this.loading = false;
              }else{
                this.FormDatosProducto.reset();
                this.loading = false;
                this.focusField.nativeElement.focus();
              }
            })
        this.loading = false;
    }else{
      this.limpiarCodigoMedicamento();
      this.loading = false;
      return;
    }
  }

  limpiarCodigoMedicamento() {
    this.loading = true;

    this.FormDatosProducto.controls.codigo.reset();
    var codProdAux = '';

    this.arrdetalleMedicamentos = [];
    this.arrMedicamentopaginacion = [];


    // Llenar Array Auxiliares
    this.arrdetalleMedicamentos = this.arrdetalleMedicamentos_aux;
    this.arrMedicamentopaginacion = this.arrMedicamentopaginacion_aux;
    this.ActivaBotonLimpiaBusca = false;

    this.loading = false;
  }

  async findArticuloGrillaInsumo() {
    this.loading = true;
    if ( this.FormDatosProducto.controls.codigo.touched &&
        this.FormDatosProducto.controls.codigo.status !== 'INVALID') {
      var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
      this.arrdetalleMedicamentos_2 = [];
      this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
      this.cmecodigo,codProdAux,1,this.usuario,this.servidor,this.arrdetalleInsumos,
      null,null,null,null).subscribe(response => {
        if (response != null) {
          this.arrdetalleInsumos_2=response;

          this.arrdetalleInsumos = [];
          this.arrInsumospaginacion = [];

          this.arrdetalleInsumos = this.arrdetalleInsumos_2;
          this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0,20);
          this.ActivaBotonLimpiaBuscaInsumo = true;
        }
        this.focusField.nativeElement.focus();
        this.loading = false;
      });
      this.loading = false;
    }else{
      this.limpiarCodigoInsumo();
      this.loading = false;
      return;
    }
  }

  limpiarCodigoInsumo() {
    this.loading = true;

    this.FormDatosProducto.controls.codigo.reset();
    var codProdAux = '';

    this.arrdetalleInsumos = [];
    this.arrInsumospaginacion = [];

    // Llenar Array Auxiliares
    this.arrdetalleInsumos = this.arrdetalleInsumos_aux;
    this.arrInsumospaginacion = this.arrInsumospaginacion_aux;
    this.ActivaBotonLimpiaBuscaInsumo = false;

    this.loading = false;
  }

  getProductoDescrip(){
    this.loading = true;
    this.descprod = this.FormDatosProducto.controls.descripcion.value;
    if (this.descprod === null || this.descprod === '') {
      this.loading = false;
      return;
      // this.addArticuloGrilla();
    } else {

      this.onBuscarProducto();
      this.loading = false;
    }
  }

  BuscaProducto(tipo: number){
    const existe = (str: string) => str != null && str != undefined && str.trim() !== ''; //RF-891175

    this.descprod = this.FormDatosProducto.controls.descripcion.value;
    this.codprod = this.FormDatosProducto.controls.codigo.value;

    if (existe(this.codprod) && existe(this.descprod)) {
      this.onBuscarProducto();
    }
    else if (existe(this.codprod) && !existe(this.descprod)) {
      this.getProducto(tipo);
    }
    else if (!existe(this.codprod) && existe(this.descprod)) {
      this.getProductoDescrip();
    }
    else {
      // No hay codigo ni descripcion
      this.onBuscarProducto();
    }
  }

  async getPacienteTipoDoc() {
    const numeroDocumento = this.FormDatosPaciente.controls.numidentificacion.value;
    if (!numeroDocumento || numeroDocumento.trim() === '') {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.n.documento.no.vacio');
      await this.alertSwalAlert.show();
      return;
    }

    try {
      this.loading = true;

      const pacientes = await this._PacientesService
        .BuscaPacientesAmbito(
          this.hdgcodigo,
          this.cmecodigo,
          this.esacodigo,
          this.FormDatosPaciente.controls.tipodocumento.value,
          this.FormDatosPaciente.controls.numidentificacion.value,
          null,
          null,
          null,
          null,
          null,
          null,
          this.servidor,
          null,
          0,
        )
        .toPromise();

      if (pacientes == null || pacientes.length === 0) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.paciente.tipo.documento.ingresado');
        await this.alertSwalAlert.show();
        return;
      }

      if (pacientes.length === 1) {
        this.cargarInformacionPaciente(pacientes[0], 'Paciente');
        return;
      }

      // Hay mas de un paciente
      const existePacienteEnAmbito = this.tipoambitos
        .filter((ambito) => ambito.ambitocodigo !== 1) // Ignora ambulatorios
        .map((ambito) => pacientes.some((p) => p.codambito === ambito.ambitocodigo))
        .filter((x) => x === true);

      if (existePacienteEnAmbito.length === 0) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.paciente.encontrado.ningun.ambito');
        await this.alertSwalAlert.show();
      } else if (existePacienteEnAmbito.length === 1) {
        this.cargarInformacionPaciente(pacientes[0], 'Paciente');
      } else {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.paciente.encontrado.en.mas.un.ambito');
        await this.alertSwalAlert.show();

        this.dataPacienteSolicitud = pacientes[0];  // Para que autorellene el modal
        this.onBuscar('Paciente');
      }
    } catch (error) {
      console.error('[BUSQUEDA PACIENTE POR TIPO DOC] ', error)

      alert('Error buscando paciente por tipo de documento');
    } finally {
      this.loading = false;
    }
  }

  private cargarInformacionPaciente(paciente: Paciente, tipoBusqueda: string) {
    this.dataPacienteSolicitud = paciente;
    this.imprimirsolicitud = false;
    this.tipobusqueda = tipoBusqueda;
    this.FormDatosProducto.controls.codigo.enable();
    this.FormDatosProducto.controls.descripcion.enable();
    this.FormDatosProducto.controls.cantidad.enable();
    this.FormDatosPaciente.controls.bodcodigo.enable();
    this.FormDatosPaciente.controls.tipodocumento.disable();
    this.FormDatosPaciente.controls.numidentificacion.disable();

    this.activaagregar = true;

    this.logicaVacios();
    this.setDatos();
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

    if(this.numsolmedicamento != undefined || this.numsolmedicamento != null){
      soliid = this.numsolmedicamento;
      this._solicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,
      ' ',recetaid,bandera).subscribe(
      response => { });
    }

    if(this.numsolinsumo != undefined || this.numsolinsumo != null){
      soliid = this.numsolinsumo;
      this._solicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,
      ' ',recetaid,bandera).subscribe(
      response => { });
    }

    if(this.numsolmedicamento != undefined || this.numsolmedicamento != null ||
       this.numsolinsumo === undefined || this.numsolinsumo === null){
      this._solicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,
        ' ',recetaid,bandera).subscribe(
        response => { });
    }
  }

  salir(){
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'salir');
      }
    }
    this.route.paramMap.subscribe(param => {
      this.router.navigate(['home']);
    })
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {​​​​​​​​
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
  }​​​​​​​​

  sortbyMed(opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.optIns === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.optIns = "DESC"
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.optIns = "ASC"
    }

    switch (opt) {
      case 'descripcion':
      this.arrMedicamentopaginacion.sort(function (a, b) {
        if (a.meindescri > b.meindescri) {
        return rtn1;
        }
        if (a.meindescri < b.meindescri) {
        return rtn2;
        }
        // a must be equal to b
        return 0;
      });
      break;
      case 'codigo':
      this.arrMedicamentopaginacion.sort(function (a, b) {
        if (a.codmei > b.codmei) {
        return rtn1;
        }
        if (a.codmei < b.codmei) {
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

  sortbyIns(opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.optIns === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.optIns = "DESC"
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.optIns = "ASC"
    }

    switch (opt) {
      case 'descripcion':
      this.arrInsumospaginacion.sort(function (a, b) {
        if (a.meindescri > b.meindescri) {
        return rtn1;
        }
        if (a.meindescri < b.meindescri) {
        return rtn2;
        }
        // a must be equal to b
        return 0;
      });
      break;
      case 'codigo':
      this.arrInsumospaginacion.sort(function (a, b) {
        if (a.codmei > b.codmei) {
        return rtn1;
        }
        if (a.codmei < b.codmei) {
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

  SeleccionaBodega(){
    this.cargarComboServicio(this.FormDatosPaciente.controls.bodcodigo.value);
  }

  async cargarComboServicio(bodcodigo: number) {
    this.FormDatosPaciente.controls.servicio.disable();

    try {
      this.servicios = await this._ServicioService
        .servicioporbodega(
          this.usuario,
          this.servidor,
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          bodcodigo
        )
        .toPromise();

      if (!this.servicios || this.servicios.length === 0) {
        this.servicios = [];
        this.FormDatosProducto.controls.codigo.enable();
        this.FormDatosProducto.controls.descripcion.enable();
        return;
      }

      this.FormDatosPaciente.controls.servicio.enable();
      this.FormDatosPaciente.patchValue({
        servicio: this.servicios[0].servcodigo,
      });

      this.SeleccionaServicio();
    } catch (err) {
      console.error("[ERROR AL CARGAR COMBO SERVICIOS] ", err);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.cargar.servicios');
      this.alertSwalError.text = err.message;
      this.alertSwalError.show();
    }
  }

  SeleccionaServicio(){
    const servicio :string = this.FormDatosPaciente.controls.servicio.value;
    if (servicio != ""){
      this.activaagregar = true;
      this.FormDatosProducto.controls.codigo.enable();
      this.FormDatosProducto.controls.descripcion.enable();
    } else {
      this.activaagregar = false;
      this.FormDatosProducto.controls.codigo.disable();
      this.FormDatosProducto.controls.descripcion.disable();
    }
  }

  BuscaBodegaDestino() {
    this._BodegasService.listaBodegaDestinoSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo,this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegasdestino = response;
        }
      },
      error => {
        alert("Error al Buscar Bodegas de Destino");
      }
    );
  }

  async eliminarSolMedicamento() {

    this.arrdetalleMedicamentos.forEach(element => {
      element.acciond = "E";
      element.usuarioelimina = this.usuario;
    })

    await this.setSolicitud();
    this.solicitudMedicamento.usuarioelimina = this.usuario;
    this.solicitudMedicamento.estadosolicitud = 110;
    this.solicitudMedicamento.soliid = this.dataPacienteSolicitud.soliid;
    this.solicitudMedicamento.accion = "E";
    this.solicitudMedicamento.bandera = 1;
    this.solicitudMedicamento.solicitudesdet = this.arrdetalleMedicamentos;
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
    this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(data => {
      this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.eliminada');
      this.alertSwal.show();
      this.loading = false;
      this.cargaSolicitud(data.solbodid);
    }, err => {
      this.loading = false;
      this.alertSwalError.title = this.TranslateUtil('key.title.error');
      this.alertSwalError.text = err.message;
      this.alertSwalError.show();
    });

  }

  async eliminarSolInsumo() {

      this.arrdetalleInsumos.forEach(element => {
        element.acciond = "E";
        element.usuarioelimina = this.usuario;
      })
      await this.setSolicitud();
      this.solicitudInsumo.usuarioelimina = this.usuario;
      this.solicitudInsumo.estadosolicitud = 110;
      this.solicitudInsumo.soliid = this.dataPacienteSolicitud.soliid;
      this.solicitudInsumo.accion = "E";
      this.solicitudInsumo.solicitudesdet = this.arrdetalleInsumos;

      this._solicitudService.crearSolicitud(this.solicitudInsumo).subscribe(data => {
        this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.eliminada');
        this.alertSwal.show();
        this.loading = false;
        this.cargaSolicitud(data.solbodid);
      }, err => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.title.error');
        this.alertSwalError.text = err.message;
        this.alertSwalError.show();
      });

  }

  volver() {
    const estadoNavegacionJson = localStorage.getItem('estadoNavegacion');
    if (!estadoNavegacionJson) {
      this.router.navigate(['busquedacuentas']);  // Para mantener la funcionalidad anterior
      return;
    }

    const estadoNavegacion = JSON.parse(estadoNavegacionJson);
    this.router.navigate([estadoNavegacion.ruta]);
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
