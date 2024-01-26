import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { DatePipe } from '@angular/common';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
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
import { BodegaDestino } from '../../models/entity/BodegaDestino';
import { StockProducto } from 'src/app/models/entity/StockProducto';
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
import { Router, ActivatedRoute } from '@angular/router';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { InformesService } from '../../servicios/informes.service';
import { Plantillas } from 'src/app/models/entity/PlantillasBodegas';
import { DetallePlantillaBodega } from '../../models/entity/DetallePlantillaBodega';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { DespachoDetalleSolicitud } from 'src/app/models/entity/DespachoDetalleSolicitud';
import { DispensarsolicitudesService } from 'src/app/servicios/dispensarsolicitudes.service';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { Detalleproducto } from '../../models/producto/detalleproducto';
import { Detallelote } from '../../models/entity/Detallelote';
import { PacientesService } from '../../servicios/pacientes.service';
import { CreasolicitudesService } from '../../servicios/creasolicitudes.service';
import { Paciente } from 'src/app/models/entity/Paciente';
import { ServicioService } from 'src/app/servicios/servicio.service';
import { ServicioLogistico } from 'src/app/models/entity/ServicioLogistico';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-creadispensasolicitudpaciente',
  templateUrl: './creadispensasolicitudpaciente.component.html',
  styleUrls: ['./creadispensasolicitudpaciente.component.css'],
  providers: [InformesService, DispensarsolicitudesService, CreasolicitudesService]
})
export class CreadispensasolicitudpacienteComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;
  /**Para uso dinamico de tabs */
  @ViewChild('tabProducto', { static: false }) tabProductoTabs: TabsetComponent;

  public modelopermisos               : Permisosusuario = new Permisosusuario();
  public pagina                       : number = 4;
  public alerts                       : Array<any> = [];
  public docsidentis                  : Array<DocIdentificacion> = [];
  public tipoambitos                  : Array<TipoAmbito> = [];
  public estadosolicitudes            : Array<EstadoSolicitud> = [];
  public arrdetalleMedicamentos       : Array<DetalleSolicitud> = [];
  public medicamentosadispensar       : Array<DetalleSolicitud> = [];
  public arrMedicamentopaginacion     : Array<DetalleSolicitud> = [];
  public arrMedicamentopaginacion_aux : Array<DetalleSolicitud> = [];
  public arrdetalleMedicamentos_aux   : Array<DetalleSolicitud> = [];
  public arrdetalleMedicamentos_2     : Array<DetalleSolicitud> = [];
  public arrdetalleInsumos_aux1       : Array<DetalleSolicitud> = [];
  public arrdetalleMedicamentos_aux1  : Array<DetalleSolicitud> = [];
  public arrdetalleInsumos            : Array<DetalleSolicitud> = [];
  public arrdetalleInsumos_2          : Array<DetalleSolicitud> = [];
  public arrdetalleInsumos_aux        : Array<DetalleSolicitud> = [];
  public insumosadispensar            : Array<DetalleSolicitud> = [];
  public arrInsumospaginacion         : Array<DetalleSolicitud> = [];
  public arrInsumospaginacion_aux     : Array<DetalleSolicitud> = [];
  public grillaMedicamentos           : Array<DetalleSolicitud> = [];
  public grillaInsumos                : Array<DetalleSolicitud> = [];
  public detalleloteprod              : Array<Detallelote> = [];
  public detallelotemed               : Array<Detallelote> = [];
  public FormDatosPaciente            : FormGroup;
  public FormDatosProducto            : FormGroup;
  private _BSModalRef                 : BsModalRef;
  public dataPacienteSolicitud        : Solicitud = new Solicitud();// Guarda datos de la busqueda
  public solmedicamento               : Solicitud = new Solicitud();
  public solinsumo                    : Solicitud = new Solicitud();
  public solicitudMedicamento         : Solicitud = new Solicitud();
  public solicitudInsumo              : Solicitud = new Solicitud();
  public varListaDetalleDespacho      : DetalleSolicitud = new DetalleSolicitud();
  public servidor                     = environment.URLServiciosRest.ambiente;
  public usuario                      = environment.privilegios.usuario;
  public hdgcodigo                    : number;
  public esacodigo                    : number;
  public cmecodigo                    : number;
  public numsolins                    : number;
  public numsolicitud                 = 0;
  public bodorigen                    : string;
  public boddestino                   : string;
  /**Usado para la funcion logicavacios()//@ML */
  public verificanull                 = false;
  public vaciosmed                    = true;
  public vaciosins                    = true;
  public tipobusqueda                 = null;
  public loading                      = false;
  public solmedic                     : boolean = false;
  public solins                       : boolean = false;
  public imprimesolins                : boolean = false;
  public accionsolicitud              = 'I';
  public locale                       = 'es';
  public bsConfig                     : Partial<BsDatepickerConfig>;
  public colorTheme                   = 'theme-blue';
  public bodegassuministro            : Array<BodegasrelacionadaAccion> = [];
  public solic1                       : string;
  public solic2                       : string;
  public fechaactual                  : string;
  public nomplantilla                 : string;
  public es_controlado                : string;
  public es_consignacion              : string;
  public numsolmedicamento            = null;
  public numsolinsumo                 = null;
  public paramdespachos               : Array<DespachoDetalleSolicitud> = [];
  public bodegasdestino               : Array<BodegaDestino> = [];
  public doblesolicitud               = false;
  public codprod                      = null;
  idplantilla                         : number;
  public codambito                    = 0;
  esmedicamento                       : boolean;
  public btnlimpiargrillamed          = false;
  public btnlimpiargrillains          = false;
  public imprimirsolicitud            = false;
  public pacientex                    : Array<Paciente> = [];

  public BodegaMedicamentos     : number = 0;
  public BodegaInsumos          : number = 0;
  public BodegaControlados      : number = 0;
  public BodegaConsignacion     : number = 0;
  public desactivabtnelimmed    : boolean = false;
  public desactivabtnelimins    : boolean = false;
  public ActivaBotonBuscaGrilla = false;
  public ActivaBotonLimpiaBusca = false;
  public ActivaBotonBuscaGrillaInsumo = false;
  public ActivaBotonLimpiaBuscaInsumo = false;
  public lotesMedLength         : number;
  public lotesInsLength         : number;
  public descprod               = null;
  public estado_aux             : number;
  public activaagregar          : boolean = false;
  public cantidadSolicitada     : boolean = false;
  public text                   : string = null;
  public textDetMed             : string = null;
  public textDetIns             : string = null;
  public textErr                : boolean = false;
  public origensolicitud        : number = 41;

  public servicios          : Array<ServicioLogistico> = [];

  public valida       : boolean;
  public respPermiso  : string;

  public optMed : string = "DESC";
  public optIns : string = "DESC";

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
    private dispensasolicitudService: DispensarsolicitudesService,
    public _BusquedaproductosService: BusquedaproductosService,
    public _PacientesService        : PacientesService,
    private route                   : ActivatedRoute,
    private router                  : Router,
    public _creaService             : CreasolicitudesService,
    public _ServicioService         : ServicioService,
    public translate: TranslateService
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
      codservicioactual : [{ value: null, disabled: false }, Validators.required],
      servicio          : [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    this.FormDatosProducto = new FormGroup({
      codigo: new FormControl(),
      descripcion: new FormControl(),
      cantidad: new FormControl()
    });
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.FormDatosPaciente.controls.estado.disable();
    this.FormDatosPaciente.controls.ambito.disable();
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
    });
  }

  ngOnDestroy(){
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
  }

  ValidaEstadoSolicitud( bandera: number, nada:string){
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
    this._solicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,' ',
    recetaid,bandera).subscribe(response => {});
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

  BuscaBodegaDestino() {

    this._BodegasService.listaBodegaDestinoSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo,this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.bodegasdestino = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.destino'));
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

  cargaSolicitud(soliid: number) {
    this.arrdetalleMedicamentos = [];
    this.arrMedicamentopaginacion = [];
    this.arrdetalleInsumos = [];
    this.arrInsumospaginacion = [];
    /* Tras Crear nueva Solicitud, obtiene datos recien creados y cambia tipo busqueda a 'Solicitud'*/
    this.tipobusqueda = 'Solicitud';
    this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo,
      null,null, null, null, null, null, this.servidor, null, this.codambito, null, null, null,
      null,null, 0, "","").subscribe(
        response => {
          if (response != null){
            response.forEach(data => {
              this.dataPacienteSolicitud = data;
            });
            this.imprimirsolicitud = true;
            this.loading = false;
            this.estado_aux = this.dataPacienteSolicitud.estadosolicitud;
            this.setDatos();
            if(this.dataPacienteSolicitud.bandera === 2){
              this.verificanull = false;
              // this.activaagregar = false;
              this.FormDatosProducto.disable();
              if(this.arrdetalleMedicamentos.length >0){
                this.arrdetalleMedicamentos.forEach(x=>{
                  x.bloqcampogrilla = false;
                  x.bloqcampogrilla2 = false;
                })
                this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');

                this.alertSwalAlert.show();
              }
              if(this.arrdetalleInsumos.length >0){
                this.arrdetalleInsumos.forEach(x=>{
                  x.bloqcampogrilla = false;
                  x.bloqcampogrilla2 = false;
                })
                this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');

                this.alertSwalAlert.show();
              }

            }else{
              this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
            }
          } else {
            this.loading = false;
          }
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error');
          this.alertSwalError.text = error.message;
          this.alertSwalError.show();
        }
      );
  }

  cargaSolicitudadispensar(soliid: number, doblesol: boolean) {
    /* Tras Crear nueva Solicitud, obtiene datos recien creados y cambia tipo busqueda a 'Imprimir'*/
    this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
      null, null, null, null, null, this.servidor, null,
      this.FormDatosPaciente.controls.ambito.value, null, null, null, null, null, 0, "","").subscribe(
        response => {
          if (response != null){
            response.forEach(async data => {
              this.dataPacienteSolicitud = data;
              this.DispensarSolicitud(doblesol);
            });
          }
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error');
          this.alertSwalError.text = error.message;
          this.alertSwalError.show();
        }
      );
  }


  // Carga datos tras crear doble solicitud M y I
  async cargaDoblesolicitud(soliid: number) {
    this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
      null, null, null, null, null, this.servidor, null, this.codambito, null, null, null, null,
      null, 0, "","").subscribe(
        response => {
          if (response != null){
            /**activa btnimprimir */
            this.imprimirsolicitud = false;
            this.verificanull = false;
            response.forEach(data => {
              this.dataPacienteSolicitud = data;
            });
            this.dataPacienteSolicitud.solicitudesdet.forEach(element => {
              if (element.tiporegmein == "I") {
                this.solins = true;
                this.arrdetalleInsumos = this.dataPacienteSolicitud.solicitudesdet
                this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0, 20);
                this.loading = false;
              } else {
                if (element.tiporegmein == "M") {
                  this.solmedic = true;
                  this.arrdetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
                  this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0, 20)
                  this.loading = false;
                }
              }
            });
          } else {
            this.loading = false;
          }
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error');
          this.alertSwalError.text = error.message;
          this.alertSwalError.show();
        }
      );
  }

  SeleccionaBodega(){
    this.cargarComboServicio(this.FormDatosPaciente.controls.bodcodigo.value);
  }

  async cargarComboServicio(bodcodigo : number){
    this.FormDatosPaciente.get('servicio').disable();

    try {
      this.servicios = await this._ServicioService
        .servicioporbodega(
          this.usuario,
          this.servidor,
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          bodcodigo,
        )
        .toPromise();

      if (!this.servicios || this.servicios.length === 0) {
        this.servicios = [];
        this.activaagregar = true;
        this.FormDatosProducto.get('codigo').enable();
        this.FormDatosProducto.get('descripcion').enable();
        return;
      }

      this.FormDatosPaciente.patchValue({
        servicio: this.servicios[0].servcodigo,
      });
      this.SeleccionaServicio();
      this.FormDatosPaciente.get('servicio').enable();
      this.FormDatosProducto.get('codigo').enable();
      this.FormDatosProducto.get('descripcion').enable();
      this.activaagregar = true;
    } catch (error) {
      console.error('[ERROR AL BUSCAR SERVICIOS] ', error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.servicios');
      this.alertSwalError.text = error.message;
      await this.alertSwalError.show();
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

  onBuscar(busqueda: string, pacientesEncontrados: Paciente[] = []) {
    this.loading = false;
    if (this.hdgcodigo == null || this.esacodigo == null || this.cmecodigo == null) {
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.debe.agregar.empresa.sucursal');
      this.alertSwalAlert.show();
      return;
    }
    switch (busqueda) {
      case 'Paciente':
        this._BSModalRef = this._BsModalService.show(ModalpacienteComponent, this.setModal(`Busqueda de ${busqueda}`, pacientesEncontrados));
        this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
          if (Retorno !== undefined) {

            /* 1-Limpia 2-asigna variable tipobusqueda 3-Aplica logica vacios 4-setea datos buscados//comentarios @MLobos*/

            this.limpiar();
            this.dataPacienteSolicitud = Retorno

            this.FormDatosPaciente.get('codservicioactual').setValue(Retorno.codservicioactual);
            this.imprimirsolicitud = false;
            this.tipobusqueda = busqueda;
            this.FormDatosProducto.controls.cantidad.enable();
            this.FormDatosPaciente.controls.bodcodigo.enable();
            this.FormDatosPaciente.controls.tipodocumento.disable();
            this.FormDatosPaciente.controls.numidentificacion.disable();
            this.logicaVacios();
            this.setDatos();
            // this.BuscaDatosBodega();
          }else{
            this.ValidaEstadoSolicitud(2,'BuscaPacientes');
          }
        });
        break;

      case 'Solicitud':

        if(this.dataPacienteSolicitud != undefined){

          if(this.dataPacienteSolicitud.bandera === 1){  //Si bandera es =2 solicitud tomada
            this.ValidaEstadoSolicitud(1,'BuscaSolicitudes');
          }
        }
        this._BSModalRef = this._BsModalService.show(BusquedasolicitudpacientesComponent, this.setModal(`Busqueda de ${busqueda}`));
        this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
          if (Retorno !== undefined) {

            /* 1-Limpia 2-asigna variable tipobusqueda 3-Aplica logica vacios 4-setea datos buscados//comentarios @MLobos*/

            this._solicitudService.BuscaSolicitud(Retorno.soliid, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0, "", 0,"", "").subscribe(
              response => {
                if (response != null){
                  this.limpiar();
                  /**deshabilita btn agregar producto y plantilla */
                  this.tipobusqueda = busqueda;
                  this.dataPacienteSolicitud = response[0];
                  // this.BuscaBodegaDeServicio(Retorno.codservicioori);
                  this.estado_aux = this.dataPacienteSolicitud.estadosolicitud;
                  this.imprimirsolicitud = true;
                  if (this.dataPacienteSolicitud.estadosolicitud === 50) {
                    this.tipobusqueda = 'Total';
                  } else {
                    this.tipobusqueda = busqueda;
                  }
                  if(this.dataPacienteSolicitud.estadosolicitud === 10){

                    this.FormDatosProducto.controls.codigo.enable();
                    this.FormDatosProducto.controls.descripcion.enable();
                    this.FormDatosProducto.controls.cantidad.enable();
                    this.activaagregar = true;
                  }else{

                    this.FormDatosProducto.controls.codigo.enable();
                    this.FormDatosProducto.controls.descripcion.disable();
                    this.FormDatosProducto.controls.cantidad.disable();
                    this.activaagregar = true;
                  }
                  this.logicaVacios();
                  this.setDatos();
                  // this.BuscaDatosBodega();

                  if(this.dataPacienteSolicitud.bandera === 2){
                    this.verificanull = false;
                    this.activaagregar = false;
                    this.FormDatosProducto.disable();
                    if(this.arrdetalleMedicamentos.length >0){
                      this.arrdetalleMedicamentos.forEach(x=>{
                        x.bloqcampogrilla = false;
                        x.bloqcampogrilla2 = false;
                      })
                      this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice( 0,20);
                      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');

                      this.alertSwalAlert.show();
                    }
                    if(this.arrdetalleInsumos.length >0){
                      this.arrdetalleInsumos.forEach(x=>{
                        x.bloqcampogrilla = false;
                        x.bloqcampogrilla2 = false;
                      })
                      this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice( 0,20);
                      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');

                      this.alertSwalAlert.show();
                    }
                  }else{
                    this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
                  }
                }
              });
          }else{
            this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
          }
        }
        );
        break;
    }

  }

  BuscaDatosBodega() {
    // A partir de un servicio informa las bodegas asociadas en funcipon de las reglas definidas en la tabla Clin_far_reglas
    if (this.FormDatosPaciente.get("unidad").value != null) {
      // Se busca los datos asociados al servicio.
      this._BusquedaproductosService.BuscarReglasServicio(this.hdgcodigo, this.esacodigo, this.cmecodigo, 'INPUT-PORDUCTO-SOLICTUD-PACIENTE', null, null, this.FormDatosPaciente.get("unidad").value, 0, this.servidor).subscribe(
        response => {
          if (response != null){
            if (response != undefined ) {
              // seteamos las variables que son general a la solicitu y dispensación.
              this.BodegaMedicamentos = response[0].reglabodegamedicamento;
              this.BodegaInsumos = response[0].reglabodegainsumos;
              this.BodegaControlados = response[0].reglabedegacontrolados;
              this.BodegaConsignacion = response[0].reglabodegaconsignacion;
            }
          }
        });

    }

  }

  desactivabtneliminar() {
    if (this.dataPacienteSolicitud.estadosolicitud !== 10
    ) {
      return true

    } else {
      return false

    }

  }

  BuscaBodegaDeServicio(codservicioori: number) {
    this._BodegasService.BuscaBodegaporServicio(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      codservicioori, this.usuario, this.servidor).subscribe(
        response => {
          if (response != null){
            if (response.length != 0) {
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
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModal("Busqueda de Productos"));
    this._BSModalRef.content.onClose.subscribe((RetornoProductos: Articulos) => {
      if (RetornoProductos !== undefined) {
        if(Number(RetornoProductos.saldo) < 1){
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.puede.agregar.con.saldo.cero');
          this.alertSwalAlert.show();
        }else{
          this.FormDatosProducto.reset();
          this.loading = false;
          this.FormDatosProducto.reset();
          this.codprod = null;
          this.descprod = null;
          this.setProducto(RetornoProductos);
          this.logicaVacios();
        }
      }else{
        this.codprod = null;
        this.descprod = null;
        this.FormDatosProducto.reset();
        this.loading = false;
      }
    });this.loading = false;
  }

  async onBuscarPlantillas() {
    if(!this.textErr){
      var stock1 :StockProducto[];
      this._BSModalRef = this._BsModalService.show(BusquedaplantillasbodegaComponent, this.setModalBusquedaPlantilla());
      this._BSModalRef.content.onClose.subscribe((response: any) => {
        if (response != undefined) {
          let bodega : number = this.FormDatosPaciente.controls.bodcodigo.value;
          this._BodegasService.BuscaPlantillas(this.servidor, sessionStorage.getItem('Usuario'), this.hdgcodigo, this.esacodigo,
            this.cmecodigo, response.planid, '', '', '', bodega, bodega, '', '', 2, "").subscribe(
              response_plantilla => {
                if (response_plantilla.length) {
                  this.loading = true;
                  let arrPlantillas: Plantillas = new Plantillas();
                  arrPlantillas = response_plantilla[0];
                  this.nomplantilla = arrPlantillas.plandescrip;
                  arrPlantillas.plantillasdet.forEach(async res => {
                    this.FormDatosPaciente.controls.bodcodigo.disable();
                    stock1 =  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, res.meinid, this.FormDatosPaciente.controls.bodcodigo.value, this.usuario, this.servidor).toPromise();
                    if(stock1[0].stockactual >= res.cantsoli && stock1[0].stockactual >0){
                      this.setPlantilla(res);
                      this.logicaVacios();
                      this.FormDatosProducto.reset();
                    }
                  });
                  this.getLotesgrillamedicamentos();
                }
                this.loading = false;
              });
              this.loading = false;
        }
      });
    } else {
      this.codprod = null;
      this.descprod = null;
      this.FormDatosProducto.reset();
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.favor.corregir.errores.antes.continuar');
      this.alertSwalAlert.show();
    }
  }

  /**Funcion que devuelve lotes de productos en plantilla */
  async getLotesgrillamedicamentos() {
    await this.setSolicitud();
    this._solicitudService.buscarLotedetalleplantilla(this.solicitudMedicamento).subscribe(dat => {
      this.setLotemedicamento(dat);
      this.getLoteIns();
    }, err => {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.lotes');
      this.alertSwalError.show();
    });
  }

  /**agrega los lotes y fecha vto a la grilla Medicamentos */
  /* cuando llega desde la busqueda de artículos y no de las plantillas */

  async setLotemedicamentoindividual(data: any) {

    if (data === undefined || data === null) {
      return;
    } else {
      var lotes: Array<Detalleproducto> = data;
      this.arrdetalleMedicamentos.forEach(res => {
        lotes.forEach(elemento_lote => {
          if (res.codmei === elemento_lote.codmei) {
            res.detallelote = lotes;
            this.arrdetalleMedicamentos[0].fechavto = lotes[0].fechavto;
            this.arrdetalleMedicamentos[0].lote = lotes[0].lote;

            return
          }
        });
      });
    }
  }

  /**agrega los lotes y fecha vto a la grilla Medicamentos */
  async setLotemedicamento(data: any) {
    if (data === undefined || data === null) {
      return;
    } else {
      var lotes: Array<Detalleproducto> = data;
      this.arrdetalleMedicamentos.forEach(res => {
        lotes.forEach(x => {
          if (res.codmei === x.codmei) {
            res.detallelote = x.detallelote;
            if (x.detallelote != undefined || x.detallelote != null) { //lo comenté porque no tomaba este código y noentraba
              if (x.detallelote.length==1) {
                res.fechavto = this.datePipe.transform(x.detallelote[0].fechavto, 'dd-MM-yyyy');
                res.lote = x.detallelote[0].lote;
              } else {
                // no tiene lote
              }
            }else{
              res.detallelote =[];
            }
          }
        });
      });
      this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0,20);
    }
  }

  async getLoteIns() {
    this._solicitudService.buscarLotedetalleplantilla(this.solicitudInsumo).subscribe(dat => {
      this.setLoteinsumo(dat);
    }, err => {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.lotes');
      this.alertSwalError.show();
    });
  }

  /**agrega los lotes y fecha vto a la grilla Insumos */
  async setLoteinsumo(data: any) {
    var lotes: Array<Detalleproducto> = data;
    this.arrdetalleInsumos.forEach(res => {
      lotes.forEach(x => {
        if (res.codmei === x.codmei) {
          res.detallelote = x.detallelote;
          if (x.detallelote != undefined || x.detallelote != null) {
            if (x.detallelote.length) {
              res.fechavto = this.datePipe.transform(x.detallelote[0].fechavto, 'dd-MM-yyyy');
              res.lote = x.detallelote[0].lote;
            } else {
              // no tiene lote

            }
          }else{
            res.detallelote = [];
          }
        }
      });
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
    this.FormDatosPaciente.get('edad').setValue(this.dataPacienteSolicitud.edad);//<- FALTA
    this.FormDatosPaciente.get('numcuenta').setValue(this.dataPacienteSolicitud.cuentanumcuenta);
    this.FormDatosPaciente.get('medico').setValue(this.dataPacienteSolicitud.nombremedico);
    this.FormDatosPaciente.get('ubicacion').setValue(this.dataPacienteSolicitud.pzagloza);
    // this.FormDatosPaciente.get('bodcodigo').setValue(this.dataPacienteSolicitud.bodorigen);
    this.FormDatosPaciente.controls["bodcodigo"].setValue(this.dataPacienteSolicitud.bodorigen);

    this.FormDatosPaciente.get('codbodegasuministro').setValue(this.dataPacienteSolicitud.boddestino);
    this.FormDatosPaciente.get('numsolicitud').setValue(this.dataPacienteSolicitud.soliid);
    this.FormDatosPaciente.get('unidad').setValue(this.dataPacienteSolicitud.undglosa);
    this.FormDatosPaciente.get('pieza').setValue(this.dataPacienteSolicitud.pzagloza);
    this.FormDatosPaciente.get('cama').setValue(this.dataPacienteSolicitud.camglosa);

    if (this.tipobusqueda === "Paciente") {
      this.FormDatosPaciente.get('fechahora').setValue(new Date());
      this.FormDatosPaciente.get('ambito').setValue(this.dataPacienteSolicitud.codambito);
      this.FormDatosPaciente.controls.estado.disable();
      this.FormDatosPaciente.controls.ambito.disable();
    } else if (this.tipobusqueda === "Solicitud" || this.tipobusqueda === null || this.tipobusqueda === 'Total') {
      this.FormDatosPaciente.get('fechahora').setValue(this.datePipe.transform(this.dataPacienteSolicitud.fechacreacion, 'dd-MM-yyyy HH:mm:ss'));
      this.FormDatosPaciente.get('ambito').disable();
      this.FormDatosPaciente.get('estado').disable();
      this.FormDatosPaciente.get('ambito').setValue(this.dataPacienteSolicitud.codambito);
      this.FormDatosPaciente.get('estado').setValue(this.dataPacienteSolicitud.estadosolicitud);
      if (this.dataPacienteSolicitud.solicitudesdet.length) {
        //**Si tiene detalle de producto ejecuta funcion //@Mlobos */
        this.cargaGrillaproductos();
      }
    }
    this.checkSoleliminada();
    this.loading = false;
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
      if (element.tiporegmein == "I") {
        this.solins = true;
      } else {
        if (element.tiporegmein == "M") {
          this.solmedic = true;
        }
      }
    });
    if (this.solins == true) {
      this.arrdetalleInsumos = this.dataPacienteSolicitud.solicitudesdet;
      this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0, 20); // <- Llamar Función paginación

      this.arrdetalleInsumos_aux = this.arrdetalleInsumos;
      this.arrInsumospaginacion_aux = this.arrInsumospaginacion;
      this.ActivaBotonBuscaGrillaInsumo = true;
      this.tabProductoTabs.tabs[1].active = true;
      this.solmedic = false;
      this.checkInsumosnuevo();
    } else {
      if (this.solmedic == true) {
        this.checkInsumosnuevo();

        this.arrdetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
        this.arrMedicamentopaginacion = this.arrdetalleMedicamentos//.slice(0, 20);

        this.arrdetalleMedicamentos_aux = this.arrdetalleMedicamentos;
        this.arrMedicamentopaginacion_aux = this.arrMedicamentopaginacion;
        this.ActivaBotonBuscaGrilla = true;
        this.tabProductoTabs.tabs[0].active = true;
        this.solins = false;
      }
    }
  }

  /* Calculo formulación grilla Productos*/
  async cantidadsolicitada(detalle: DetalleSolicitud) {
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    let dosis, dias, total: number = 0;
    dosis = detalle.dosis;
    dias = detalle.dias;
    total = dosis * detalle.formulacion;
    detalle.cantsoli = total * dias;
    if(dosis <0){
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.la.dosis.debe.ser.mayor.cero');
      this.alertSwalAlert.show();
      detalle.dosis = 0;
    }
    if(dias < 0){
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.la.dosis.debe.ser.mayor.cero');
      this.alertSwalAlert.show();
      detalle.dias = 0;
    }
    if(detalle.formulacion < 0){
      this.alertSwalAlert.title =  this.TranslateUtil('key.mensaje.veces.al.dia.mayor.cero')
      ;
      this.alertSwalAlert.show();
      detalle.formulacion = 0;
    }
    if(detalle.cantsoli < 0){
      this.alertSwalAlert.title =  this.TranslateUtil('key.mensaje.cantidad.dispensar.mayor.cero')
      ;
      this.alertSwalAlert.show();
    }

    if(detalle.detallelote != undefined){
      if(detalle.detallelote.length !=0 ){
        detalle.detallelote.forEach(det=>{
          if(detalle.lote == det.lote && det.codmei == detalle.codmei && detalle.fechavto == det.fechavto){
            if (detalle.cantsoli > detalle.stockorigen) {
              detalle.dosis = 0;
              detalle.formulacion = 0;
              detalle.dias = 0;
              detalle.cantsoli = 0;
              this.verificalote(detalle);
              this.errorMsg(this.TranslateUtil('key.mensaje.cantidad.excede.permitido.no.existe.lote'));
            }
          }
        })
      }else{
        this.logicaVacios();
      }
    }else{
      this.logicaVacios();
    }

    /* Si la busqueda es 'Solicitud'..
    si acciond=I (inserta) entonces mantiene..
    de lo contrario acciond=M (modifica) */
    if (this.tipobusqueda == 'Solicitud') {
      if (detalle.acciond !== 'I') {
        detalle.acciond = 'M';
      }
    }
  }

  verificalote(detalle: DetalleSolicitud) {
    detalle.lote = detalle.lote === undefined || detalle.lote === null? '' : detalle.lote;
    if (detalle.lote.length) {
      this.logicaVacios();
    } else {
      this.verificanull = false;
    }
  }

  errorMsg(mensaje) {
    this.alertSwalError.text = `Error: ${mensaje}`;
    this.alertSwalError.show();
    this.loading = false;
  }

  cantidadInsumo(detalle: DetalleSolicitud) {
    if(detalle.detallelote != undefined){
      if(detalle.detallelote.length !=0 ){
        if (detalle.cantsoli > detalle.stockorigen) {
          this.errorMsg(this.TranslateUtil('key.mensaje.cantidad.excede.permitido.no.existe.lote'));
          detalle.cantsoli = 0;
          this.verificalote(detalle);
        }
        if (this.tipobusqueda == 'Solicitud') {
          if (detalle.acciond !== 'I') {
            detalle.acciond = 'M';
          }
        }
        this.verificalote(detalle);
      }else{
        this.logicaVacios();
      }
    }else{
      this.logicaVacios();
    }

  }

  limpiar() {
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'limpiar');
      }
    }
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
    this.codprod = null;
    this.descprod = null;
    this.FormDatosPaciente.controls["ambito"].setValue(3);
    this.FormDatosPaciente.controls["estado"].setValue(10);
    this.FormDatosPaciente.get('ambito').enable();
    this.FormDatosPaciente.get('estado').enable();
    this.solmedic = false;
    this.solins = false;
    this.imprimesolins = false;
    this.FormDatosPaciente.get('fechahora').setValue(new Date());
    /* Desactivan btn barra inferior //*/
    this.imprimirsolicitud = false; //btnImprimir
    this.verificanull = false;
    this.vaciosmed = true;
    this.vaciosins = true;
    /** */
    this.doblesolicitud = false
    this.BodegaMedicamentos = 0;
    this.BodegaInsumos = 0;
    this.BodegaControlados = 0;
    this.BodegaConsignacion = 0;
    this.detalleloteprod = [];
    this.desactivabtnelimmed = false;
    this.desactivabtnelimins = false;
    this.FormDatosPaciente.controls.ambito.disable()
    this.FormDatosPaciente.controls.estado.disable();
    this.FormDatosProducto.controls.codigo.disable();
    this.FormDatosProducto.controls.descripcion.disable();
    this.FormDatosProducto.controls.cantidad.disable();
    this.FormDatosPaciente.controls.tipodocumento.enable();
    this.FormDatosPaciente.controls.numidentificacion.disable();
    this.FormDatosPaciente.controls.servicio.disable();
    this.ActivaBotonBuscaGrilla = false;
    this.ActivaBotonBuscaGrillaInsumo = false;
    this.textErr = false;
    this.FormDatosPaciente.controls.bodcodigo.disable();
    this.activaagregar = false;
    // this.dataPacienteSolicitud = undefined;
  }

  /**Funcion que remueve todos los productos nuevos ingresados acciond="I"
  * 15-12-2020 @MLobos
 */
  limpiarGrillamedicamento() {
    let temparrdetalleMedicamentos: Array<DetalleSolicitud> = [];
    this.alertSwalAlert.text = '';
    this.alertSwalAlert.title =  this.TranslateUtil('key.mensaje.pregunta.borrar.todos.nuevos.elementos');
    this.alertSwalAlert.show().then(resp => {
      if (resp.value) {
        for (let d of this.arrdetalleMedicamentos) {
          if (d.acciond != 'I') {
            temparrdetalleMedicamentos.push(d)
          }
        }
      }
      this.arrdetalleMedicamentos = temparrdetalleMedicamentos;
      this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;
      this.grillaMedicamentos = this.arrdetalleMedicamentos;
      this.btnlimpiargrillamed = this.arrdetalleMedicamentos.length ? true : false;
      this.vaciosmed = this.arrdetalleMedicamentos.length ? false : true;
      this.logicaVacios();
      this.checkMedicamentonuevo();
    });
  }

  /**funcion que habilita/desactiva btnLimpiargrilla Medicamentos */
  checkMedicamentonuevo() {
    if (!this.arrdetalleMedicamentos) {
      this.btnlimpiargrillamed = false;
      return;
    }

    this.btnlimpiargrillamed = this.arrdetalleMedicamentos.some(med => med.acciond === 'I');
  }

  limpiarGrillainsumo() {
    let temparrdetalleInsumos: Array<DetalleSolicitud> = [];
    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.pregunta.borrar.todos.nuevos.elementos');
    this.alertSwalAlert.show().then(resp => {
      if (resp.value) {
        for (let d of this.arrdetalleInsumos) {
          if (d.acciond != 'I') {
            temparrdetalleInsumos.push(d)
          }
        }
      }
      this.arrdetalleInsumos = temparrdetalleInsumos;
      this.arrInsumospaginacion = this.arrdetalleInsumos;
      this.grillaInsumos = this.arrdetalleInsumos;
      this.btnlimpiargrillains = this.arrdetalleInsumos.length ? true : false;
      this.vaciosins = this.arrdetalleInsumos.length ? false : true;
      this.logicaVacios();
      this.checkInsumosnuevo();
    });
  }

  /**funcion que habilita/desactiva btnLimpiargrilla Insumos */
  checkInsumosnuevo() {
    if (!this.arrdetalleInsumos) {
      this.btnlimpiargrillains = false;
      return;
    }

    this.btnlimpiargrillains = this.arrdetalleInsumos.some(insumo => insumo.acciond === 'I');
  }

  /**Si hay campos vacios grilla desactiva Crear Sol//@Mlobos */
  async logicaVacios() {
    const Swal = require('sweetalert2');
    this.textErr = false;
    this.text = "";
    this.text = "`<h2>"+this.TranslateUtil('key.mensaje.saldo.insuficiente.cantidad.ingresada')+"</h2><br/>";
    await this.vaciosProductosMed()
    await this.vaciosProductosIns()
    if(this.textErr){
      this.verificanull = false;
      Swal.fire({
        html: this.text + this.textDetMed + this.textDetIns +"`",
      });
    }else{
      if (this.vaciosmed === true && this.vaciosins === true ) {
        this.verificanull = false;
      } else {
        if(this.vaciosmed === true && this.vaciosins === false){
          if(this.arrdetalleInsumos.length > 0 && this.arrdetalleMedicamentos.length == 0){
            this.verificanull = true;
          } else {
            this.verificanull = false;
          }
        }else{
          if(this.vaciosmed === false && this.vaciosins === true){
             if(this.arrdetalleMedicamentos.length > 0 && this.arrdetalleInsumos.length == 0){
              this.verificanull = true;
            } else {
              this.verificanull = false;
            }
          }else{
            this.verificanull = true;
          }
        }
      }
    }
  }

  async vaciosProductosMed() {
    const Swal = require('sweetalert2');
    var stock1 :StockProducto[];
    this.textDetMed = "";
    var i = 0;
    if (this.arrdetalleMedicamentos.length > 0) {
      for (const data of this.arrdetalleMedicamentos) {
        if (data.dosis <= 0 || data.formulacion <= 0 || data.dias <= 0 ||
          data.dosis === null || data.formulacion === null || data.dias === null) {
          this.vaciosmed = true;
          return;
        } else {
          if(data.cantsoli > 0){
            stock1=  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, data.meinid, this.FormDatosPaciente.controls.bodcodigo.value, this.usuario, this.servidor).toPromise();
            if(data.cantsoli > Number(stock1[0].stockactual)){
              if (i === 0) {
                this.textDetMed = "<p>"+ this.TranslateUtil('key.saldo.medicamento')+"<strong>" + data.codmei + " </strong> "+this.TranslateUtil('key.es')+": " + stock1[0].stockactual + "</p>";
              } else {
                this.textDetMed = this.textDetMed + "<p>"+ this.TranslateUtil('key.saldo.medicamento')+" <strong>" + data.codmei + "</strong> "+this.TranslateUtil('key.es')+": " + stock1[0].stockactual + "</p>";
              }
              this.vaciosmed = true;
              this.textErr = true;
            }else{
              this.vaciosmed = false;
            }
          }
        }
      }
    }else{
      this.vaciosmed = true;
    }
  }

  async vaciosProductosIns(){
    const Swal = require('sweetalert2');
    var stock1 :StockProducto[];
    this.textDetIns = "";
    var i = 0;
    if (this.arrdetalleInsumos.length > 0) {
      for (var data of this.arrdetalleInsumos) {
        if (data.cantsoli <= 0 || data.cantsoli === null) {
          this.vaciosins = true;
          return;
        } else {
          if(data.cantsoli>0){
            stock1=  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, data.meinid, this.FormDatosPaciente.controls.bodcodigo.value, this.usuario, this.servidor).toPromise();
            if(data.cantsoli > Number(stock1[0].stockactual)){
              if (i === 0) {
                this.textDetIns = "<p>"+ this.TranslateUtil('key.saldo.insumo')+" <strong>" + data.codmei + "</strong> "+this.TranslateUtil('key.es')+": " + stock1[0].stockactual + "</p>";
              }else{
                this.textDetIns = this.textDetIns + "<p>"+ this.TranslateUtil('key.saldo.insumo')+" <strong>" + data.codmei + "</strong> "+this.TranslateUtil('key.es')+": " + stock1[0].stockactual + "</p>";
              }
              this.vaciosmed = true;
              this.textErr = true;
              i++;
            }else{
              this.vaciosins = false;
            }
          }
        }
      }
    }else{
      this.vaciosins = true;
    }
  }

  /**
   * Ajustes: se cambia logica para no ingresar prod existentes..
   * Al modificar solo agrega tipo de productos asociados a la solicitud.
   * autor: MLobos miguel.lobos@sonda.com
   * fecha: 21-12-2020
   */
  async setPlantilla(art: DetallePlantillaBodega) {
    this.idplantilla = art.planid;
    var detalleSolicitud = new DetalleSolicitud;
    detalleSolicitud.sodeid = 0;
    detalleSolicitud.soliid = 0;
    detalleSolicitud.repoid = 0;
    detalleSolicitud.codmei = art.codmei;
    detalleSolicitud.meinid = art.meinid;
    detalleSolicitud.dosis = 0;
    detalleSolicitud.formulacion = 0;
    detalleSolicitud.dias = 0
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
      if (this.tipobusqueda === 'Solicitud' && this.solins) {
        /*debe ingresar solo Insumos*/
        return;
      } else {
        /** si producto existe en grilla, elimina Medicamento y vuelve a ingresar y cambia accion a Modificar*/
        let indx = this.arrdetalleMedicamentos.findIndex(d => d.codmei === detalleSolicitud.codmei, 1);
        if (indx >= 0) {
          // this.arrdetalleMedicamentos.splice(indx, 1);
          // detalleSolicitud.acciond = 'M';
        } else {
          detalleSolicitud.acciond = 'I';
          this.arrdetalleMedicamentos.unshift(detalleSolicitud);
          this.arrMedicamentopaginacion = this.arrdetalleMedicamentos //.slice(0, 20);

          this.optMed = "DESC";
          this.arrdetalleMedicamentos.sort(function (a, b) {
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
          this.checkMedicamentonuevo();
          this.ActivaBotonBuscaGrilla = true;
        }
      }
    } else {
      if (this.tipobusqueda === 'Solicitud' && this.solmedic) {
        /*debe ingresar solo Medicamentos*/
        return;
      } else {
        /** si producto existe en grilla, elimina Insumo y vuelve a ingresar */
        let indx = this.arrdetalleInsumos.findIndex(d => d.codmei === detalleSolicitud.codmei, 1);
        if (indx >= 0) {
          // this.arrdetalleInsumos.splice(indx, 1);
          // detalleSolicitud.acciond = 'M';
        } else {
          detalleSolicitud.acciond = 'I';

          this.arrdetalleInsumos.unshift(detalleSolicitud);
          this.arrInsumospaginacion = this.arrdetalleInsumos// .slice(0, 20);
          this.optIns = "DESC"
          this.arrdetalleInsumos.sort(function (a, b) {
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
          this.checkInsumosnuevo();
          this.ActivaBotonBuscaGrillaInsumo = true;
        }
        // return;
      }
    }
  }

  async validaduplicado(tipo: string, newprod: DetalleSolicitud) {
    if (tipo === 'M') {
      for (let oldprod of this.arrdetalleMedicamentos) {
        if (oldprod.codmei === newprod.codmei) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      for (let oldprod of this.arrdetalleInsumos) {
        if (oldprod.codmei === newprod.codmei) {
          return true;
        } else {
          return false;
        }
      }

    }
  }

  async setProducto(art: Articulos) {
    this.alertSwalError.title = null;
    this.alertSwalError.text = null;
    this.descprod = null;
    this.codprod = null;
    let cantidad = this.FormDatosProducto.controls.cantidad.value;
    if (cantidad === undefined || cantidad <= 0) {
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
    detalleSolicitud.cantsoli = 0;//parseInt(cantidad);
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
      // await this.LoadComboLotesMed(art);
      if (this.tipobusqueda === 'Solicitud' && this.solins) {
        /*debe ingresar solo Insumos*/
        return;
      } else {
        let codigo_bodega_lote = this.FormDatosPaciente.controls.bodcodigo.value;

        this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
          this.cmecodigo, art.codigo, 0, codigo_bodega_lote).subscribe(
            response => {
              if (!response || response.length === 0) {
                detalleSolicitud.detallelote = [];
                const indx = this.arrdetalleMedicamentos.findIndex(x => x.codmei === art.codigo, 1);
                this.logicaVacios();
                if (indx >= 0) {
                  this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                  this.alertSwalError.text = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                  this.alertSwalError.show();
                }else{
                  this.arrdetalleMedicamentos.unshift(detalleSolicitud);
                  this.arrMedicamentopaginacion = this.arrdetalleMedicamentos; //.slice(0, 20);
                  this.optMed = "DESC";
                  this.arrdetalleMedicamentos_aux = this.arrdetalleMedicamentos;
                  this.arrMedicamentopaginacion_aux = this.arrMedicamentopaginacion;
                  this.logicaVacios();
                }

              } else {
                this.lotesMedLength = response.length;
                detalleSolicitud.detallelote = [];
                detalleSolicitud.detallelote = response;
                detalleSolicitud.lote = response[0].lote;
                detalleSolicitud.fechavto = this.datePipe.transform(response[0].fechavto, 'dd-MM-yyyy');
                detalleSolicitud.stockorigen = response[0].cantidad;
                if(this.lotesMedLength === 2 || this.lotesMedLength === 1){
                  const indx = this.arrdetalleMedicamentos.findIndex(x => x.codmei === art.codigo, 1);
                  this.logicaVacios();
                  if (indx >= 0) {
                    if(this.lotesMedLength === 2 ){
                      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                      this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.con.lote.no.agregar');
                      this.alertSwalError.show();
                    }
                    if(this.lotesMedLength === 1){
                      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                      this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.sin.lote.no.agregar');
                      this.alertSwalError.show();
                    }
                  }
                  else{
                     /** Cambia a tab Medicamento */
                    this.tabProductoTabs.tabs[0].active = true;
                     /** */
                    this.arrdetalleMedicamentos.unshift(detalleSolicitud);
                  }
                }else{
                  if(this.lotesMedLength > 2){
                     /** Cambia a tab Medicamento */
                    this.tabProductoTabs.tabs[0].active = true;
                    /** */
                    this.arrdetalleMedicamentos.unshift(detalleSolicitud);
                  }
                  var cuentacod = 0;
                  this.arrdetalleMedicamentos.forEach(x=>{
                    if(x.codmei ===art.codigo){
                      cuentacod ++;
                    }
                  })
                  if(cuentacod >this.lotesMedLength -1  ){
                    const indxmeds = this.arrdetalleMedicamentos.findIndex(x => x.codmei === art.codigo, 1);
                    this.arrdetalleMedicamentos.splice(indxmeds,1);
                    this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                    this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.no.ingresar.no.lotes.disponible');
                    this.alertSwalError.show();
                  }
                }
                this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0, 20);
                this.arrdetalleMedicamentos_aux = this.arrdetalleMedicamentos;
                this.arrMedicamentopaginacion_aux = this.arrMedicamentopaginacion;
              }
              this.logicaVacios();
              this.checkMedicamentonuevo();
            }
          );
            this.ActivaBotonBuscaGrilla = true;
      }
    } else if (detalleSolicitud.tiporegmein == "I") {
      // this.LoadComboLotesIns(art);
      if (this.tipobusqueda === 'Solicitud' && this.solmedic) {
        /*debe ingresar solo Medicamentos*/
        return;
      } else {

        let indice = 0;
        let codigo_bodega_lote = this.FormDatosPaciente.controls.bodcodigo.value;
        this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
          this.cmecodigo, art.codigo, 0, codigo_bodega_lote).subscribe(
            response => {
              if (!response || response.length === 0) {
                detalleSolicitud.detallelote = [];
                const indx = this.arrdetalleInsumos.findIndex(x => x.codmei === art.codigo, 1);
                this.logicaVacios();
                if (indx >= 0) {
                  this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                  this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.puede.volver.agregar');
                  this.alertSwalError.show();
                }else{
                  this.arrdetalleInsumos.unshift(detalleSolicitud);
                  this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0, 20);
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
                }

              } else {
                // this.arrdetalleInsumos[indice].detallelote = [];
                // this.arrdetalleInsumos[indice].detallelote = response;
                // this.arrdetalleInsumos[indice].lote = response[0].lote;
                // this.arrdetalleInsumos[indice].fechavto = response[0].fechavto;
                // this.arrdetalleInsumos[indice].stockorigen = response[0].cantidad;
                this.lotesInsLength = response.length;
                detalleSolicitud.detallelote = [];
                detalleSolicitud.detallelote = response;
                detalleSolicitud.lote = response[0].lote;
                detalleSolicitud.fechavto = this.datePipe.transform(response[0].fechavto, 'dd-MM-yyyy');
                detalleSolicitud.stockorigen = response[0].cantidad;

                if(this.lotesInsLength === 2 || this.lotesInsLength === 1){
                  const indx = this.arrdetalleInsumos.findIndex(x => x.codmei === art.codigo, 1);
                  this.logicaVacios();

                  if (indx >= 0) {
                    if(this.lotesInsLength === 2 ){
                      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                      this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.con.lote.no.agregar');
                      this.alertSwalError.show();
                    }
                    // else{
                      if(this.lotesInsLength === 1){
                        this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                        this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.sin.lote.no.agregar');
                        this.alertSwalError.show();
                      }
                      // else{
                        if(this.lotesInsLength >= this.lotesInsLength){
                        }
                        /** Cambia a tab Insumo */
                      this.tabProductoTabs.tabs[1].active = true;
                      /** */
                      this.arrdetalleInsumos.unshift(detalleSolicitud);
                    //   }
                    // }
                    // this.codexiste = true;
                  }
                  else{
                    /** Cambia a tab Insumo */
                    this.tabProductoTabs.tabs[1].active = true;
                    /** */
                    this.arrdetalleInsumos.unshift(detalleSolicitud);


                  }
                }else{
                  if(this.lotesInsLength > 2){

                     /** Cambia a tab Insumo */
                    this.tabProductoTabs.tabs[1].active = true;
                    /** */
                    this.arrdetalleInsumos.unshift(detalleSolicitud);
                  }
                  var cuentacod = 0;
                  this.arrdetalleInsumos.forEach(x=>{
                    if(x.codmei ===art.codigo){
                      cuentacod ++;
                    }
                  })
                  if(cuentacod >this.lotesInsLength -1  ){
                    const indxins = this.arrdetalleInsumos.findIndex(x => x.codmei === art.codigo, 1);
                    this.arrdetalleInsumos.splice(indxins,1);
                    this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                    this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.no.ingresar.no.lotes.disponible');
                    this.alertSwalError.show();
                  }
                }
                this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0, 20);
                this.arrdetalleInsumos_aux = this.arrdetalleInsumos;
                this.arrInsumospaginacion_aux = this.arrInsumospaginacion;
              }
              this.logicaVacios();
              this.checkInsumosnuevo();
            }
          );
            this.ActivaBotonBuscaGrillaInsumo = true;
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
    cabeceraSolicitud.idplantilla = this.idplantilla;
    cabeceraSolicitud.pagina = this.pagina;
    /** asigna grilla medicamentos */
    this.setGrillamedicamentos();
    cabeceraSolicitud.solicitudesdet = this.grillaMedicamentos;
    this.solicitudMedicamento = cabeceraSolicitud;
  }

  async setGrillamedicamentos() {
    this.grillaMedicamentos = [];
    this.arrdetalleMedicamentos.forEach(element => {
      var medicamento = new DetalleSolicitud;
      if (this.numsolicitud > 0) {
        if (this.accionsolicitud == 'M') {
          medicamento.soliid = this.FormDatosPaciente.controls.numsolicitud.value;
          medicamento.sodeid = element.sodeid;
          medicamento.acciond = element.acciond;
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
      } else {
        if (this.accionsolicitud = 'I') {
          medicamento.soliid = 0;
          medicamento.sodeid = 0;
          medicamento.acciond = this.accionsolicitud;
        }
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
      medicamento.estado = 1;
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
      medicamento.fechavto = element.fechavto;
      medicamento.lote = element.lote;
      medicamento.cantadespachar = 0;
      medicamento.descunidadmedida = null;
      medicamento.tiporegmein = element.tiporegmein;
      medicamento.idplantilla = this.idplantilla;
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
    cabeceraSolicitud.idplantilla = this.idplantilla;
    cabeceraSolicitud.pagina = this.pagina;
    /** asigna grilla medicamentos */
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
          insumo.acciond = element.acciond;
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
      insumo.estado = 1;
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
      insumo.fechavto = element.fechavto;
      insumo.lote = element.lote;
      insumo.cantadespachar = 0;
      insumo.descunidadmedida = null;
      insumo.tiporegmein = element.tiporegmein;
      insumo.idplantilla = this.idplantilla;
      this.grillaInsumos.push(insumo);
    });
    // this.insumosadispensar = this.arrdetalleInsumos;
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
      this.loading = false;
    }
  }

  async onGrabar() {
    this.accionsolicitud = 'I';
    this.modalconfirmar("Dispensación");
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
      cancelButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then(async (result) => {
      if (result.value) {
        this.loading = true;

        if (this.arrdetalleMedicamentos.length > 0) {
          this.arrdetalleMedicamentos.forEach(element => {
            element.acciond = "E";
            element.usuarioelimina = this.usuario;
          })
          await this.setSolicitud();
          this.solicitudMedicamento.usuarioelimina = this.usuario;
          this.solicitudMedicamento.estadosolicitud = 110;
          this.solicitudMedicamento.soliid = this.dataPacienteSolicitud.soliid// this.FormSolicitudPaciente.value.numsolicitud;
          this.solicitudMedicamento.accion = "E";
          this.solicitudMedicamento.solicitudesdet = this.arrdetalleMedicamentos;

          this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(data => {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.eliminada');
            this.alertSwal.show();
            this.loading = false;
          }, err => {
            this.loading = false;
            this.alertSwalError.title = this.TranslateUtil('key.title.error');
            this.alertSwalError.text = err.message;
            this.alertSwalError.show();
          }
          );
        } else {
          if (this.arrdetalleInsumos.length > 0) {
            this.arrdetalleInsumos.forEach(element => {
              element.acciond = "E";
              element.usuarioelimina = this.usuario;
            })
            await this.setSolicitud();
            this.solicitudInsumo.usuarioelimina = this.usuario;
            this.solicitudInsumo.estadosolicitud = 110;
            this.solicitudInsumo.soliid = this.dataPacienteSolicitud.soliid// this.FormSolicitudPaciente.value.numsolicitud;
            this.solicitudInsumo.accion = "E";
            this.solicitudInsumo.solicitudesdet = this.arrdetalleInsumos;
            this._solicitudService.crearSolicitud(this.solicitudInsumo).subscribe(data => {
              this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.eliminada');
              this.alertSwal.show();
              this.loading = false;
            }, err => {
              this.loading = false;
              this.alertSwalError.title = this.TranslateUtil('key.title.error');
              this.alertSwalError.text = err.message;
              this.alertSwalError.show();
            }
            );
          }
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
            this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0, 20);
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
    this.alertSwal.title = null;
    this.alertSwal.text = null;
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'HostListener');
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
    this.alertSwal.title = null;
    this.alertSwal.text = null;
    const Swal = require('sweetalert2');
    Swal.fire({
      title:  this.TranslateUtil('key.mensaje.pregunta.eliminar'),
      text:  this.TranslateUtil('key.mensaje.confirmar.accion'),
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
            this.arrInsumospaginacion = this.arrdetalleInsumos//.slice(0, 20);
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
    this.alertSwal.title = null;
    this.alertSwal.text = null;
    this.medicamentosadispensar = this.arrdetalleMedicamentos;
    this.insumosadispensar = this.arrdetalleInsumos;

    this.arrdetalleMedicamentos_aux1 = this.arrdetalleMedicamentos;
    this.arrdetalleInsumos_aux1 = this.arrdetalleInsumos;
    await this.saveLoteprod();
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿ Desea '.concat(mensaje).concat(' la Solicitud?'),
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then(async (result) => {
      if (result.value) {
        if(this.valida){
          this.dispensar(mensaje);
        }else{
          var text = "`<h2>"+this.TranslateUtil('key.mensaje.no.puede.generar.despacho')+"</h2><br/>" + this.respPermiso + "`";
          Swal.fire({
            html: text,
          });
        }
      }
    });
    this.validaStock();
  }

  async dispensar(mensaje: string){
    this.loading = true;
        /**Define Solicitud antes de enviar */
        await this.setSolicitud();
        /** Modificar */
        if (this.accionsolicitud == 'M') {
          this.solicitudMedicamento.accion = 'M';
          this.solicitudInsumo.accion = "M";
          this.solicitudMedicamento.usuariomodifica = this.usuario;
          this.solicitudInsumo.usuariomodifica = this.usuario;
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
        // ***
        if(this.solicitudInsumo.solicitudesdet !== undefined  && this.solicitudMedicamento.solicitudesdet !== undefined){
          if (this.solicitudInsumo.solicitudesdet.length == 0 && this.solicitudMedicamento.solicitudesdet.length >= 1) {
            await this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(data => {
              this.solmedic = true;
              this.numsolmedicamento = data.solbodid;
              this.verificanull = false;
              this.tipobusqueda = null;
              /**guarda el detalle con lotes en variable medicamentosadispensar*/
              this.imprimirsolicitud = true;
              this.FormDatosPaciente.controls.bodcodigo.disable();
              this.medicamentosadispensar = this.arrdetalleMedicamentos;
              this.arrdetalleMedicamentos = [];
              this.arrMedicamentopaginacion = [];
              this.cargaSolicitudadispensar(data.solbodid, false);
              this.alertSwal.title = `${mensaje} Medicamentos exitosamente, N°: ` + data.solbodid;
              this.alertSwal.text = "";
              this.alertSwal.show();
            }, err => {
              this.loading = false;
              this.alertSwalError.title = this.TranslateUtil('key.title.error');
              this.alertSwalError.text = err.message;
              this.alertSwalError.show();
            });
          } else {
            if (this.solicitudMedicamento.solicitudesdet.length == 0 && this.solicitudInsumo.solicitudesdet.length >= 1) {
              await this._solicitudService.crearSolicitud(this.solicitudInsumo).subscribe(data => {
                this.alertSwal.title = `${mensaje} Insumos exitosamente, N°: ` + data.solbodid;
                this.alertSwal.text = "";
                this.alertSwal.show();
                this.solins = true;
                this.numsolins = data.solbodid;
                this.numsolinsumo = data.solbodid;
                this.verificanull = false;
                this.tipobusqueda = null;
                this.imprimirsolicitud = true;
                this.FormDatosPaciente.controls.bodcodigo.disable();
                this.insumosadispensar = this.arrdetalleInsumos;
                this.arrdetalleInsumos = [];
                this.arrInsumospaginacion = [];
                this.cargaSolicitudadispensar(data.solbodid, false);
              }, err => {
                this.loading = false;
                this.alertSwalError.title = this.TranslateUtil('key.title.error');
                this.alertSwalError.text = err.message;
                this.alertSwalError.show();
              });
            } else {
              if (this.solicitudMedicamento.solicitudesdet.length >= 1 && this.solicitudInsumo.solicitudesdet.length >= 1) {
                try {
                  await this.grabadobleSolInsumo();
                } catch {
                  this.loading = false;
                  this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.crear.solicitud.insumos');
                  this.alertSwalError.show();
                }
              }
            }
          }
        }
  }

  /** Graba y busca solicitud Insumo a dispensar */
  async grabadobleSolInsumo() {
    /** declara que es una doble solicitud */
    this.doblesolicitud = true;
    this._solicitudService.crearSolicitud(this.solicitudInsumo).subscribe(async data => {
      this.insumosadispensar = this.arrdetalleInsumos;
      this.numsolinsumo = data.solbodid;
      this.solmedic = true;
      this.numsolins = data.solbodid;
      this.verificanull = true;
      this.imprimesolins = true;
      this.FormDatosPaciente.controls.bodcodigo.disable();
      this.arrdetalleInsumos = [];
      this.arrInsumospaginacion = [];
      this.imprimirsolicitud = false;

      await this._solicitudService.BuscaSolicitud(this.numsolinsumo, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
        null, null, null, null, null, this.servidor, null, this.FormDatosPaciente.controls.ambito.value,
        null, null, null, null, null, 0, "","").subscribe(
          response => {
            if (response != null){
              response.forEach(async data => {
                this.dataPacienteSolicitud = data;
                this.DispensarSolicitud(true);
              });
            }
          });
    });
  }

  /** Graba y busca solicitud Medicamento a dispensar */
  async grabadobleSolMedicamento() {
    this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(async data => {
      this.medicamentosadispensar = this.arrdetalleMedicamentos;
      this.numsolmedicamento = data.solbodid;
      this.solmedic = true;
      this.numsolicitud = data.solbodid;
      this.arrdetalleMedicamentos = [];
      this.arrMedicamentopaginacion = [];
      await this._solicitudService.BuscaSolicitud(this.numsolmedicamento, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
        null, null, null, null, null, this.servidor, null, this.FormDatosPaciente.controls.ambito.value,
        null, null, null, null, null, 0, "","").subscribe(
          response => {
            if (response != null){
              response.forEach(async data => {
                this.dataPacienteSolicitud = data;
                /**se manda parametro 'false' para evitar que devuelva a funcion grabadobleSolMedicamento() */
                this.DispensarSolicitud(false);
                this.confirmadobleSolicitud();
                /**termina proceso Doble Dispensacion */
              });
            }
          });
    });
  }

  /**
   * @param pacientes
   * Los pacientes que se encontraron en una busqueda previa.
   */
  setModal(titulo: string, pacientes: Paciente[] = []) {

    let ambito = this.FormDatosPaciente.get("ambito").value

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
        id_Bodega: Number(this.FormDatosPaciente.controls.bodcodigo.value),
        ambito: ambito, //this.FormDatosPaciente.value.ambito,
        nombrepaciente: this.dataPacienteSolicitud.nombrespac,
        apepaternopac: this.dataPacienteSolicitud.apepaternopac,
        apematernopac: this.dataPacienteSolicitud.apematernopac,
        codservicioactual: this.dataPacienteSolicitud.codservicioactual,
        tipodocumento: this.dataPacienteSolicitud.tipodocpac,
        numeroidentificacion: this.dataPacienteSolicitud.numdocpac,
        buscasolicitud: "Solicitud_Paciente",
        descprod: this.descprod,
        codprod: this.codprod,
        paginaorigen: 8,
        omitirBusquedaUrgencia: pacientes.filter(p => p.codambito === 2).length === 0,
        omitirBusquedaHospitalizado: pacientes.filter(p => p.codambito === 3).length === 0,
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
        titulo: this.TranslateUtil('key.title.eventos.solicitud'), // Parametro para de la otra pantalla
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
        titulo: this.TranslateUtil('key.title.eventos.detalle.solicitud'),
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
    this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(startItem, endItem);
  }

  pageChangedinsumo(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(startItem, endItem);
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
    this.alertSwal.title = null;
    this.alertSwal.text = null;
    if (this.imprimesolins == true) {


      this._imprimesolicitudService.RPTImprimeSolicitud(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, "pdf", this.numsolicitud, this.FormDatosPaciente.controls.ambito.value).subscribe(
          response => {
            if (response != null){
              this.solic1 = response[0].url;
              this._imprimesolicitudService.RPTImprimeSolicitud(this.servidor, this.hdgcodigo, this.esacodigo,
                this.cmecodigo, "pdf", this.numsolins, this.FormDatosPaciente.controls.ambito.value).subscribe(
                  data => {
                    this.solic2 = data[0].url;
                    var i = 0;
                    while (i < 2) {

                      if (i == 0) {
                        // window.open(this.solic1, "", "", true);
                        window.open(this.solic1, "", "");

                      } else
                        if (i == 1) {

                          window.open(this.solic2, "", "");

                        }
                      i++;
                    }
                },error => {
                  this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.solicitud');
                  this.alertSwalError.show();
                  this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
                  })
                }
              );
            }
          });
    } else {
      this._imprimesolicitudService.RPTImprimeSolicitud(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, "pdf", this.dataPacienteSolicitud.soliid, this.dataPacienteSolicitud.codambito).subscribe(
          response => {
            if (response != null){
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





  /**funcion revisa si existen codmei duplicados@MLobos */
  /**
   * se pide modificar para que vuelva admitir duplicados
   * autor: M.Lobos miguel.lobos@sonda.com
   * fecha: 29-01-2021
   * @param esgrabar
   */
  async checkDuplicados(esgrabar: boolean) {
    if (esgrabar === true) {
      this.onGrabar();
    } else {
      this.onModificar();
    }
  }

  /** Metodo que carga la grilla guardada con lote a la solicitud ya creada ..
   * guardada en el objeto dataPacienteSolicitud
  */
  async asignalotegrilla() {
    if (this.insumosadispensar.length) {
      this.insumosadispensar.forEach(x => {
        this.esmedicamento = false;
        this.dataPacienteSolicitud.solicitudesdet.forEach(y => {
          x.sodeid = y.sodeid;
          x.lote = y.lote;
          x.fechavto = y.fechavto;
        });
      });
    } else {
      this.medicamentosadispensar.forEach(x => {
        this.esmedicamento = true;
        this.dataPacienteSolicitud.solicitudesdet.forEach(y => {
          x.sodeid = y.sodeid;
          x.lote = y.lote;
          x.fechavto = y.fechavto;
        });
      });
    }
  }

  async DispensarSolicitud(doblesol: boolean) {
    // await this.asignalotegrilla();
    const productos = this.dataPacienteSolicitud.solicitudesdet;
    this.paramdespachos = [];
    var fechavto = null;
    var lote = '';
    if (productos !== undefined || !productos.length) {
      productos.forEach(element => {
        var producto: DespachoDetalleSolicitud = new DespachoDetalleSolicitud;
        producto.soliid    = element.soliid
        producto.hdgcodigo = this.hdgcodigo;
        producto.esacodigo = this.esacodigo;
        producto.cmecodigo = this.cmecodigo;
        producto.sodeid = element.sodeid;
        producto.codmei = element.codmei;
        producto.meinid = element.meinid;
        producto.cantsoli = element.cantsoli;
        producto.cantadespachar = element.cantsoli;
        producto.cantdespachada = element.cantdespachada;
        producto.observaciones = element.observaciones;
        producto.usuariodespacha = this.usuario;
        producto.estid = this.dataPacienteSolicitud.estid;
        producto.ctaid = this.dataPacienteSolicitud.ctaid;
        producto.cliid = this.dataPacienteSolicitud.cliid;
        producto.valcosto = 0;
        producto.valventa = 0;
        producto.unidespachocod = 0;
        producto.unicompracod = 0;
        producto.incobfon = null;
        producto.numdocpac = null;
        producto.cantdevolucion = element.cantdevolucion;
        producto.tipomovim = "C";
        producto.servidor = this.servidor;

        if(element.tiporegmein==='M'){
          this.arrdetalleMedicamentos_aux1.forEach(x=>{
            if(element.codmei === x.codmei){
              if (producto.lote === undefined && lote != x.lote) {
                lote = x.lote;
                producto.lote = x.lote;
                producto.fechavto = x.fechavto;
              }
            }
          });
        }
        if(element.tiporegmein === 'I'){
          this.arrdetalleInsumos_aux1.forEach(x=>{
            if(element.codmei === x.codmei){
              if (producto.lote === undefined) {
                lote = x.lote;
                producto.lote = x.lote;
                producto.fechavto = x.fechavto;
              }
            }
          });
        }
        producto.bodorigen = this.dataPacienteSolicitud.bodorigen;
        producto.boddestino = this.dataPacienteSolicitud.boddestino;
        producto.codservicioori = this.dataPacienteSolicitud.codservicioori;
        producto.codservicioactual = this.dataPacienteSolicitud.codservicioactual;

        this.paramdespachos.unshift(producto);
      });
      /**Graba dispensacion */
      await this.dispensasolicitudService.GrabaDispensacion(this.paramdespachos).subscribe(async response => {
        if (response != null){
          if (!this.doblesolicitud) {
            /**carga solicitud NO doble dispensada */
            this.cargaSolicitud(this.dataPacienteSolicitud.soliid);
            this.tipobusqueda = 'Total';

            } else {
            /** Carga detalle solicitud doble Dispensada  */
            await this._solicitudService.BuscaSolicitud(this.dataPacienteSolicitud.soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
              null, null, null, null, null, this.servidor, null,
              this.FormDatosPaciente.controls.ambito.value, null, null, null, null, null, 0, "","").subscribe(
                async response => {
                  if (response != null){
                    this.verificanull = false;
                    response.forEach(async data => {
                      this.dataPacienteSolicitud = data;
                      await this.asignalotegrilla();
                    });
                    this.dataPacienteSolicitud.solicitudesdet.forEach(element => {
                      if (element.tiporegmein == "I") {
                        if(this.dataPacienteSolicitud.estadosolicitud !=40){
                          element.bloqcampogrilla = false;
                        }else{
                          element.bloqcampogrilla = true;
                        }
                        this.solins = true;
                        this.arrdetalleInsumos = this.dataPacienteSolicitud.solicitudesdet;
                        this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0, 20);

                        this.arrdetalleInsumos_aux = this.arrdetalleInsumos;
                        this.arrInsumospaginacion_aux = this.arrInsumospaginacion;

                        this.ActivaBotonBuscaGrillaInsumo = true;
                        this.loading = false;
                      } else {
                        if (element.tiporegmein == "M") {
                          if(this.dataPacienteSolicitud.estadosolicitud !=40){
                            element.bloqcampogrilla = false;
                          }else{
                            element.bloqcampogrilla = true;
                          }

                          this.solmedic = true;
                          this.arrdetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
                          this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0, 20)

                          this.arrdetalleMedicamentos_aux = this.arrdetalleMedicamentos;
                          this.arrMedicamentopaginacion_aux = this.arrMedicamentopaginacion;
                          this.ActivaBotonBuscaGrilla = true;

                          this.loading = false;
                        }
                      }
                    });
                    if(this.dataPacienteSolicitud.estadosolicitud != 10){
                      this.activaagregar = true;
                      this.FormDatosProducto.controls.descripcion.disable();
                      this.FormDatosProducto.controls.cantidad.disable();
                    }
                    /** Tras dispensar, Si doblesolicitud=true y doblesol=true, genera una solicitud Medicamento // */
                    if (doblesol) {
                      /**vacia insumos a dispensar para asignar grilla medicamentos a dispensar */
                      this.insumosadispensar = [];
                      this.grabadobleSolMedicamento();
                    }
                  }
                });
          }
        }
      });
    }
  }

  async cargaSoldobledispensada(doblesol: boolean) {
    await this._solicitudService.BuscaSolicitud(this.dataPacienteSolicitud.soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
      null, null, null, null, null, this.servidor, null,
      this.FormDatosPaciente.controls.ambito.value, null, null, null, null, null, 0, "","").subscribe(
        async response => {
          if (response != null){
            this.verificanull = false;
            response.forEach(async data => {
              this.dataPacienteSolicitud = data;
              await this.asignalotegrilla();
            });
            this.dataPacienteSolicitud.solicitudesdet.forEach(element => {
              if (element.tiporegmein == "I") {
                this.solins = true;
                this.arrdetalleInsumos = this.dataPacienteSolicitud.solicitudesdet
                this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0, 20);

                this.arrdetalleInsumos_aux = this.arrdetalleInsumos;
                this.arrInsumospaginacion_aux = this.arrInsumospaginacion;
                this.ActivaBotonBuscaGrillaInsumo = true;
                this.loading = false;
              } else {
                if (element.tiporegmein == "M") {
                  this.solmedic = true;
                  this.arrdetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
                  this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;//.slice(0, 20)

                  this.arrdetalleMedicamentos_aux = this.arrdetalleMedicamentos;
                  this.arrMedicamentopaginacion_aux = this.arrMedicamentopaginacion;
                  this.ActivaBotonBuscaGrilla = true;
                  this.loading = false;
                }
              }
            });
            /** Tras dispensar, Si doblesolicitud=true y doblesol=true, genera una solicitud Medicamento // */
            if (doblesol) {
              this.insumosadispensar = [];
              this.grabadobleSolMedicamento();
            }
          }
        });
  }

  grabaSolmedicamento() {
    this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(async data => {
      this.numsolmedicamento = data.solbodid;
      this.solins = true;
      this.numsolicitud = data.solbodid;
      await this.cargaDoblesolicitud(this.numsolmedicamento);
      await this.confirmadobleSolicitud();

    });
    return;
  }

  confirmadobleSolicitud() {
    this.alertSwal.title = null;
    this.alertSwal.text = null;
    this.imprimesolins = true;
    this.imprimirsolicitud = true;

    this.FormDatosPaciente.get('numsolicitud').setValue(this.numsolmedicamento + " " + this.numsolinsumo);
    this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitudes.dispensadas.exitosas');
    this.alertSwal.text =  this.TranslateUtil('key.mensaje.solicitud.medicamentos')+", N°: " + this.numsolmedicamento +
      ".   Solicitud Insumos, N°: " + this.numsolinsumo;

    this.arrdetalleMedicamentos.forEach(element => {
      element.bloqcampogrilla = false;
    });
    this.arrdetalleInsumos.forEach(element => {
      element.bloqcampogrilla = false;
    });

    this.alertSwal.show();
    this.loading = false;
  }

  async getProducto(tipo:number) {
    if(!this.textErr){
      var noexisteprod : boolean = false;
      if(this.FormDatosProducto.controls.codigo.value != null){
        var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
      }

      switch (tipo) {
        case 1:
          if(this.arrdetalleMedicamentos.length>0){
            this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
            this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
            this.arrdetalleMedicamentos,null,null,null,null).toPromise();
            false;
          }else{
            noexisteprod= false;
          }
          break;

        case 2:
          if(this.arrdetalleInsumos.length>0){
            this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
              this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
              this.arrdetalleInsumos,null,null,null,null).toPromise();
            this.loading = false;
          }else{
            noexisteprod= false;
          }
          break;
      }

      if (!noexisteprod) {
        this.codprod = this.FormDatosProducto.controls.codigo.value;
        if (this.codprod === null || this.codprod === '') {
          this.onBuscarProducto();
        } else {
          var tipodeproducto = 'MIM';
          this.loading = true;
          var controlado = '';
          var controlminimo = '';
          var idBodega = Number(this.FormDatosPaciente.controls.bodcodigo.value);
          var consignacion = '';
          this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
            this.cmecodigo, this.codprod, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
            , this.usuario, null, this.servidor).subscribe(
              response => {
                if (response != null){
                  if (!response.length) {
                    this.loading = false;
                    this.onBuscarProducto();
                  } else if (response.length) {
                    if (response.length > 1) {
                      if (noexisteprod === false) {
                        this.onBuscarProducto();
                      }
                    } else {
                      if(Number(response[0].saldo) <1){
                        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.producto.saldo.cero.no.puede.cargarse');
                        this.alertSwalAlert.show();
                        this.FormDatosProducto.reset();
                        this.loading = false;
                      }else{
                        this.loading = false;
                        this.FormDatosProducto.reset();
                        this.FormDatosPaciente.controls.bodcodigo.disable();
                        this.setProducto(response[0]);
                        this.FormDatosProducto.reset();
                        this.focusField.nativeElement.focus();
                      }
                    }
                    this.logicaVacios();
                  }
                } else {
                  this.loading = false;
                }
              }, error => {
                this.loading = false;
              }
            );
        }
      }
    } else {
      this.codprod = null;
      this.descprod = null;
      this.FormDatosProducto.reset();
      this.alertSwalAlert.title =  this.TranslateUtil('key.mensaje.favor.corregir.errores.antes.continuar');
      this.alertSwalAlert.show();
    }
  }


  /**
   * Mod: Se asigna fecha vencimiento a producto segun seleccion lote en grilla Medicamento
   * .. verifica si existe lote con mismo cod producto
   * Autor: miguel.lobos@sonda.com
   * Fecha Update: 02-02-2021
   *
   * Mod: se verifica vacios
   * Autor: miguel.lobos@sonda.com
   * Fecha Update: 16-03-2021
  */
  changeLotemedicamento(value: string, indx: number,detalle:DetalleSolicitud) {
    let lote = new Detallelote;
    if (detalle.detallelote.length) {
      if (parseInt(value) != 0) {
        for (const element of detalle.detallelote) {
          if (element.row == parseInt(value)) {
            lote = element;
            break;
          }
        }
        const fechav = lote.fechavto;
        const loteprod = lote.lote;
        const cantidad = lote.cantidad;
        const codmei = lote.codmei;
        this.validaLotemedicamento(lote.lote, lote.codmei).then(async (res) => {
          if (res) {
            if(this.arrdetalleMedicamentos[indx].cantsoli > cantidad ){
            }
            this.arrdetalleMedicamentos[indx].fechavto = this.datePipe.transform(fechav, 'dd-MM-yyyy');
            this.arrdetalleMedicamentos[indx].lote = loteprod;
            this.arrdetalleMedicamentos[indx].stockorigen = cantidad;
            await this.logicaVacios();
            if(detalle.cantsoli > detalle.cantsoli-detalle.cantdespachada){
              if(loteprod !=""){
                this.arrdetalleMedicamentos[indx].cantadespachar = this.arrdetalleMedicamentos[indx].cantadespacharresp;
                this.arrMedicamentopaginacion[indx].cantadespachar = this.arrdetalleMedicamentos[indx].cantadespachar;
                this.alertSwalAlert.title =  this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.pendiente');
                this.alertSwalAlert.show();
                this.logicaVacios();
              }
            }else{
              if(detalle.cantsoli <0){
                if(loteprod !=""){
                  this.arrdetalleMedicamentos[indx].cantsoli = 0; //this.arrdetalleMedicamentos[indx].cantsoliresp;
                  this.arrMedicamentopaginacion[indx].cantsoli = this.arrdetalleMedicamentos[indx].cantsoli;
                  this.alertSwalAlert.text =  this.TranslateUtil('key.mensaje.cantidad.solicitada.mayor.cero');
                  this.alertSwalAlert.show();
                }
              }

              if(detalle.cantsoli > cantidad ){
                if(loteprod != ""){
                  this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.saldo.lote');
                  this.alertSwalAlert.text = "El saldo del lote "+detalle.lote+" tiene "+ cantidad +", ingresar cantidad menor";
                  this.alertSwalAlert.show();

                  let codigo_bodega_lote = this.FormDatosPaciente.controls.bodcodigo.value;
                  this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
                    this.cmecodigo, codmei, 0,  codigo_bodega_lote  ).subscribe(
                    response => {
                      if (response == undefined || response=== null){
                        this.arrdetalleMedicamentos[indx].detallelote = [];
                      }else {
                        this.arrdetalleMedicamentos[indx].detallelote = [];
                        this.arrdetalleMedicamentos[indx].detallelote = response;
                        this.arrdetalleMedicamentos[indx].lote = response[0].lote;
                        this.arrdetalleMedicamentos[indx].fechavto = response[0].fechavto;
                        this.arrdetalleMedicamentos[indx].stockorigen = response[0].cantidad;

                        this.logicaVacios();
                      }
                    }
                  );

                }
              }
            }
          } else {
            let codigo_bodega_lote = this.FormDatosPaciente.controls.bodcodigo.value;//this.BodegaMedicamentos;
            this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, codmei, 0, codigo_bodega_lote).subscribe(
                response => {
                  if (response == undefined || response=== null) {
                    this.arrdetalleMedicamentos[indx].detallelote = [];
                  } else {
                    this.arrdetalleMedicamentos[indx].dosis = 0
                    this.arrdetalleMedicamentos[indx].formulacion = 0;
                    this.arrdetalleMedicamentos[indx].dias = 0;
                    this.arrdetalleMedicamentos[indx].cantsoli = 0;
                    this.arrdetalleMedicamentos[indx].detallelote = [];
                    this.arrdetalleMedicamentos[indx].detallelote = response;
                    this.arrdetalleMedicamentos[indx].lote = response[0].lote;
                    this.arrdetalleMedicamentos[indx].fechavto = response[0].fechavto;
                    this.arrdetalleMedicamentos[indx].stockorigen = response[0].cantidad;

                    this.logicaVacios();
                  }
                });
            return;
          }
        });
      } else {
        this.verificanull = false;
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.seleccionar.lote');
        this.alertSwalAlert.show();
      }
    }
  }

  /**
   * Funcion que verifica si el lote y producto en Medicamento existe
   * autor: miguel.lobos@sonda.com
   * ult. fecha mod: 01-02-2021
   */
  async validaLotemedicamento(lote: string, codmei: string) {
    let validaok = false;
    for (let d of this.arrdetalleMedicamentos) {
      if (d.codmei === codmei && d.lote === lote) {
        this.alertSwalAlert.title = '';
        this.alertSwalAlert.text = `Lote ${d.lote} ya existe`;
        this.alertSwalAlert.show();
        validaok = false;
        break;
      }
      else {
        validaok = true;
      }
    }
    return validaok;
  }

  /**
   * Update: asigna fecha vencimiento a producto segun seleccion lote en grilla Insumo
   * .. verifica si existe lote con mismo cod producto
   * Autor: miguel.lobos@sonda.com
   * Fecha Update: 02-02-2021
  */
  changeLoteinsumo(value: string, indx: number,detalle:DetalleSolicitud) {
    let lote = new Detallelote;
    if (detalle.detallelote.length) {
      if (parseInt(value) != 0) {
        for (const element of detalle.detallelote) {
          if (element.row == parseInt(value)) {
            lote = element;
            break;
          }
        }
        const fechav = lote.fechavto;
        const loteprod = lote.lote;
        const cantidad = lote.cantidad;
        const codmei = lote.codmei;
        this.validaLoteinsumo(loteprod, codmei).then((res) => {
          if (res) {
            this.arrdetalleInsumos[indx].fechavto = this.datePipe.transform(fechav, 'dd-MM-yyyy');
            this.arrdetalleInsumos[indx].lote = loteprod;
            this.arrdetalleInsumos[indx].stockorigen = cantidad;
            // this.arrdetalleInsumos[indx].cantsoli = 0;
            this.logicaVacios();
          } else {
            let codigo_bodega_lote = this.FormDatosPaciente.controls.bodcodigo.value;//this.BodegaMedicamentos;
            this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, codmei, 0, codigo_bodega_lote).subscribe(
                response => {
                  if (response == undefined || response=== null) {
                    this.arrdetalleInsumos[indx].detallelote = [];
                  } else {
                    this.arrdetalleInsumos[indx].detallelote = [];
                    this.arrdetalleInsumos[indx].detallelote = response;
                    this.arrdetalleInsumos[indx].lote = response[0].lote;
                    this.arrdetalleInsumos[indx].fechavto = response[0].fechavto;
                    // this.arrdetalleInsumos[indx].stockorigen = response[0].cantidad;
                    this.logicaVacios();
                  }
                });
            return;
          }
        }
        );
      } else {
        this.verificanull = false;
        this.alertSwalAlert.title = "Debe Seleccionar un Lote";
        this.alertSwalAlert.show();
      }
    }
  }

  /**
   * Funcion que verifica si el lote y producto en grilla Insumo existe
   * autor: miguel.lobos@sonda.com
   * ult. fecha mod: 02-02-2021
   */
  async validaLoteinsumo(lote: string, codmei: string) {
    let validaok = false;
    for (let d of this.arrdetalleInsumos) {
      if (d.codmei === codmei && d.lote === lote) {
        this.alertSwalAlert.text = `Lote ${d.lote} ya existe`;
        this.alertSwalAlert.show();
        validaok = false;
        break;
      }
      else {
        validaok = true;
      }
    }
    return validaok;
  }

  /**
   * Funcion que valida si existe previamente el codigo producto
   * @param valorCodigo = codigo producto
   * miguel.lobos@sonda.com
   * 29-01-2021
   */
  async validaCodigo(valorCodigo: any) {
    this.alertSwal.title = null;
    this.alertSwal.text = null;
    let arrProductos: Array<DetalleSolicitud> = [];
    arrProductos = this.arrdetalleMedicamentos.concat(this.arrdetalleInsumos);
    const resultado_medicamnto = arrProductos.find(registro => registro.codmei === valorCodigo);
    if (resultado_medicamnto != undefined) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.articulo.repetido');
      this.alertSwalError.show();
      this.FormDatosProducto.get("codigo").setValue("");
      return false;
    } else { return true; }
  }

  validaDodificagrillaMedicamentos(id: number, detalle: any) {
    if (this.arrdetalleMedicamentos[id].cantsoli <= 0) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.ser.mayor.cero');
      this.alertSwalError.show();
      this.FormDatosProducto.get("cantidad").setValue(1);
      return
    }
  }


  validaCantidadDispensada(cantidad: any) {

    this.alertSwal.title = null;
    this.alertSwal.text = null;
    // if (cantidad <= 0) {
    //   this.alertSwalError.title = "Cantidad debe ser mayor a cero";
    //   this.alertSwalError.show();
    //   this.FormDatosProducto.get("cantidad").setValue(1);
    //   return
    // }
  }

  validacantidadgrillaInsumos(id: number) {

    this.alertSwalError.title = null;
    this.alertSwalAlert.text = null;
    var idg = id;

    if (this.arrdetalleInsumos[idg].cantsoli <= 0) {

      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.cero');
      this.alertSwalAlert.show();
      this.arrdetalleInsumos[idg].cantsoli = 1;
      this.arrdetalleInsumos[idg].cantadespachar = this.arrdetalleInsumos[idg].cantsoli;
    }
  }


  /**
   * Se activa con las siguientes condiciones
   * Solicitud sin numero, Paciente identificado, grrilla de medicamneto o grilla de insumos con datos
   * Si no existe un antidad en cero
   */
  ActivaBotonDispensar() {
    this.FormDatosPaciente.get('numsolicitud').value == null

    if ((this.FormDatosPaciente.get('numsolicitud').value == null || this.FormDatosPaciente.get('numsolicitud').value == 0)
      && this.FormDatosPaciente.get('nombrepaciente').value != null
      && this.FormDatosPaciente.get('estado').value != null
      && this.FormDatosPaciente.get('ambito').value != null
      && (this.arrdetalleInsumos.length > 0 || this.arrdetalleMedicamentos.length > 0)
    ) {
      return true

    } else {
      return false
    }
  }

  ActivaBotonAgregarProducto() {
    if ((this.FormDatosPaciente.get('numsolicitud').value == null || this.FormDatosPaciente.get('numsolicitud').value == 0)
      && this.FormDatosPaciente.get('nombrepaciente').value != null
      && this.FormDatosPaciente.get('estado').value != null
      && this.FormDatosPaciente.get('ambito').value != null
    ) {
      return true

    } else {
      return false
    }
  }

  ActivaBotonAgregarPlantilla() {
    if ((this.FormDatosPaciente.get('numsolicitud').value == null || this.FormDatosPaciente.get('numsolicitud').value == 0)
      && this.FormDatosPaciente.get('nombrepaciente').value != null
      && this.FormDatosPaciente.get('estado').value != null
      && this.FormDatosPaciente.get('ambito').value != null
    ) {
      return true;
    } else {
      return false;
    }
  }

  /** Funciones usadas cuando se requiera asignar lote por producto */
  /** devuelve lotes de productos a grilla Medicamentos */
  LoadComboLotesMed(Articulo: Articulos) {
    let indice = 0;
    let codigo_bodega_lote = this.FormDatosPaciente.controls.bodcodigo.value;//this.BodegaMedicamentos;
    if (Articulo.consignacion == 'S') {
      codigo_bodega_lote = this.BodegaConsignacion
    }
    if (Articulo.controlado == 'S') {
      codigo_bodega_lote = this.BodegaControlados
    }
    this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, Articulo.codigo, 0, codigo_bodega_lote).subscribe(
        response => {
          if (response == undefined || response=== null) {
            this.arrdetalleMedicamentos[indice].detallelote = [];
          } else {
            this.lotesMedLength = response.length;
            this.arrdetalleMedicamentos[indice].detallelote = [];
            this.arrdetalleMedicamentos[indice].detallelote = response;
            this.arrdetalleMedicamentos[indice].lote = response[0].lote;
            this.arrdetalleMedicamentos[indice].fechavto = response[0].fechavto;
            this.arrdetalleMedicamentos[indice].stockorigen = response[0].cantidad;
            this.detallelotemed = response;
          }
        }
      )
  }

  /** devuelve lotes de productos a grilla Insumos */
  LoadComboLotesIns(Articulo: Articulos) {
    let indice = 0;
    let codigo_bodega_lote = this.FormDatosPaciente.controls.bodcodigo.value;//this.BodegaMedicamentos;
    if (Articulo.consignacion == 'S') {
      codigo_bodega_lote = this.BodegaConsignacion
    }
    if (Articulo.controlado == 'S') {
      codigo_bodega_lote = this.BodegaControlados
    }
    this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, Articulo.codigo, 0, codigo_bodega_lote).subscribe(
        response => {
          if (response == undefined || response=== null) {
            this.arrdetalleInsumos[indice].detallelote = [];
          } else {
            this.arrdetalleInsumos[indice].detallelote = [];
            this.arrdetalleInsumos[indice].detallelote = response;
            this.arrdetalleInsumos[indice].lote = response[0].lote;
            this.arrdetalleInsumos[indice].fechavto = response[0].fechavto;
            this.arrdetalleInsumos[indice].stockorigen = response[0].cantidad;
          }
        }
      )
  }

  /**
  * guarda los lotes/fechavto en array para luego setearlos en fuc
  */
  saveLoteprod() {
    const detalleproductos: Array<DetalleSolicitud> = this.medicamentosadispensar.concat(this.insumosadispensar);
    detalleproductos.forEach(resp => {
      let detalle: Detallelote = new Detallelote();
      if (resp.detallelote === undefined) {
        return;
      } else {
        if (resp.detallelote = null){
          if (resp.detallelote.length) {
            detalle.codmei = resp.codmei;
            detalle.lote = resp.lote;
            detalle.fechavto = this.datePipe.transform(resp.fechavto, 'dd-MM-yyyy');
            this.detalleloteprod.push(detalle);
          }
        }
      }
    }, err => {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.proceso');
      this.alertSwalError.show();
    });
  }

  setLoteproducto() {
    if (this.detalleloteprod.length) {
      this.detalleloteprod.forEach(res => {
        let indx = this.paramdespachos.findIndex(x => x.codmei === res.codmei);
        if (indx >= 0) {
          this.paramdespachos[indx].lote = res.lote;
          this.paramdespachos[indx].fechavto = res.fechavto;
        }
      });
    }
  }

  async CambioCheckMed(registro: DetalleSolicitud,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      registro.marcacheckgrilla = true;
      this.desactivabtnelimmed = true;
      this.desactivabtnelimmed = true;
    }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelimmed = false;
      await this.isEliminaMedGrilla(registro);
      await this.arrdetalleMedicamentos.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimmed = true;
        }
      });
    }
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
      title: '¿ Confirme eliminación de producto de la solicitud ?',
      text: "Confirmar la eliminación del producto",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.EliminaProductoDeLaGrilla2();
      }
    })
  }

  async EliminaProductoDeLaGrilla2() {
    this.loading = true;

    var arrMedicamentoEliminar : Array<DetalleSolicitud> = [];
    var arrMedicamentoFiltro : Array<DetalleSolicitud> = this.arrdetalleMedicamentos;
    var elimina : boolean = true;
    arrMedicamentoFiltro.forEach((detalle,index)=>{
      if (detalle.soliid == 0) {
        if(!detalle.marcacheckgrilla){
          this.desactivabtnelimmed = false;
          arrMedicamentoEliminar.unshift(detalle);
        }
      } else {
        if (detalle.soliid > 0 && detalle.sodeid > 0) {
          if(detalle.marcacheckgrilla === true){
            this.accionsolicitud = 'M';
            this.desactivabtnelimmed = false;
            this.setCabeceramedicamentos();
            this.solicitudMedicamento.accion = "M"
            this.solicitudMedicamento.soliid = detalle.soliid;
            this.solicitudMedicamento.usuariomodifica = this.usuario;
            this.solicitudMedicamento.usuariocreacion = null;
            this.solicitudMedicamento.fechacreacion = null;
            this.solicitudMedicamento.solicitudesdet[index].acciond = 'E';
            this.solicitudMedicamento.solicitudesdet[index].codmei = detalle.codmei;
            this.solicitudMedicamento.solicitudesdet[index].meindescri = detalle.meindescri;
            this.solicitudMedicamento.solicitudesdet[index].meinid = detalle.meinid;
            this.solicitudMedicamento.solicitudesdet[index].sodeid = detalle.sodeid;
            this.solicitudMedicamento.solicitudesdet[index].soliid = detalle.soliid;
            this.solicitudMedicamento.solicitudesdet[index].usuarioelimina = this.usuario;
            this.loading = false;
            this.guardaProdeliminado(this.solicitudMedicamento);
          }
        }
      }
    });
    if (elimina) {
      this.arrdetalleMedicamentos = [];
      this.arrdetalleMedicamentos = arrMedicamentoEliminar;

      this.optMed = "DESC";
      this.arrdetalleMedicamentos.sort(function (a, b) {
        if (a.meindescri > b.meindescri) {
          return 1;
        }
        if (a.meindescri < b.meindescri) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    }
    this.logicaVacios();
    this.loading = false;
    this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado.exitosamente');
    this.alertSwal.show();
    this.checkMedicamentonuevo();
    this.checkInsumosnuevo();
    this.desactivabtnelimmed = this.arrdetalleMedicamentos.some(med => med.marcacheckgrilla);
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
      registro.marcacheckgrilla = true;
      this.desactivabtnelimins = true;
      await this.isEliminaInsGrilla(registro)
      await this.arrdetalleInsumos.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimins = true;
        }
      })
    }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelimins = false;
      await this.isEliminaInsGrilla(registro);
      await this.arrdetalleInsumos.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimins = true;
        }
      })
    }
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
    var id
    this.loading = true;
    var arrInsumoEliminar : Array<DetalleSolicitud> = [];
    var arrInsumoFiltro : Array<DetalleSolicitud> = this.arrdetalleInsumos;
    var elimina : boolean = true;
    arrInsumoFiltro.forEach((detalle,index)=>{
      if (detalle.soliid == 0 ) {
        if(detalle.marcacheckgrilla !== true){
          this.desactivabtnelimmed = false;
          arrInsumoEliminar.unshift(detalle);
        }

      }
      else {
        if (detalle.soliid > 0 && detalle.sodeid > 0) {
          id = this.IdgrillaProductosIns(detalle)
          if(detalle.marcacheckgrilla === true){
            this.accionsolicitud = 'M';
            this.desactivabtnelimins = false;
            this.setCabecerainsumos();
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
      }
    });
    if (elimina) {
      this.arrdetalleInsumos = [];
      this.arrdetalleInsumos = arrInsumoEliminar;
      this.arrdetalleInsumos.sort(function (a, b) {
        if (a.meindescri > b.meindescri) {
          return 1;
        }
        if (a.meindescri < b.meindescri) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    }

    this.desactivabtnelimins = false;
    // this.arrdetalleInsumos.splice(id, 1);
    this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0, 20);
    this.logicaVacios();
    this.loading = false;
    this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado.exitosamente');
    this.alertSwal.show();
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
    const codigo: string = this.FormDatosProducto.value.codigo;
    const descripcion: string = this.FormDatosProducto.value.descripcion;

    if ((!codigo || codigo.trim() === '') && (!descripcion || descripcion.trim() === '')) {
      return;
    }

    this.loading = true;
    if ( this.FormDatosProducto.controls.codigo.touched &&
    this.FormDatosProducto.controls.codigo.status !== 'INVALID') {
      var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
      //Cuando la solicitud aún no se crea
      this.arrdetalleMedicamentos_2 = [];

      this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
      this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
        this.arrdetalleMedicamentos,null,null,null,null).subscribe(response => {
          if (response != null){
            this.arrdetalleMedicamentos_2=response;
            this.arrdetalleMedicamentos = [];
            this.arrMedicamentopaginacion = [];
            this.arrdetalleMedicamentos = this.arrdetalleMedicamentos_2;
            this.arrMedicamentopaginacion = this.arrdetalleMedicamentos;
            this.ActivaBotonLimpiaBusca = true;
            this.loading = false;
          } else {
            this.loading = false;
          }
        });
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
      //Cuando la solicitud aún no se crea
      this.arrdetalleMedicamentos_2 = [];

      this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
      this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
        this.arrdetalleInsumos,null,null,null,null).subscribe(response => {
          if (response != null){
            this.arrdetalleInsumos_2=response;
            this.arrdetalleInsumos = [];
            this.arrInsumospaginacion = [];
            this.arrdetalleInsumos = this.arrdetalleInsumos_2;
            this.arrInsumospaginacion = this.arrdetalleInsumos;//.slice(0,20);
            this.ActivaBotonLimpiaBuscaInsumo = true;
            this.loading = false;
          } else {
            this.loading = false;
          }
          this.focusField.nativeElement.focus();
        }
      )
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
    // this.loading = true;
    if(!this.textErr){
      this.descprod = this.FormDatosProducto.controls.descripcion.value;
      if (this.descprod === null || this.descprod === '') {
        return;
      } else {
        this.onBuscarProducto();
      }
    } else {
      this.codprod = null;
      this.descprod = null;
      this.FormDatosProducto.reset();
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.favor.corregir.errores.antes.continuar');
      this.alertSwalAlert.show();
    }
  }

  BuscaProducto(tipo: number) {
    const existe = (str: string) => str !== null && str !== undefined && str.trim() !== '';

    this.descprod = this.FormDatosProducto.controls.descripcion.value;
    this.codprod = this.FormDatosProducto.controls.codigo.value;

    if (existe(this.codprod) && existe(this.descprod)) {
      this.onBuscarProducto();
    }
    else if (existe(this.codprod) && !existe(this.descprod) ) {
      this.getProducto(tipo);
      this.focusField.nativeElement.focus();
    }
    else if (!existe(this.codprod) && existe(this.descprod)) {
      this.getProductoDescrip();
    }
    else { // NO hay codigo ni descripcion
      this.onBuscarProducto();
    }
  }

  async getPacienteTipoDoc() {
    const numeroIdentificacion = this.FormDatosPaciente.controls.numidentificacion.value;
    const tipoDocumento = this.FormDatosPaciente.controls.tipodocumento.value;

    if (!numeroIdentificacion || numeroIdentificacion.trim() == '') {
      this.onBuscar('Paciente');
      return;
    }

    try {
      this.loading = true;

      const pacientes = await this._PacientesService
        .BuscaPacientesAmbito(
          this.hdgcodigo,
          this.cmecodigo,
          this.esacodigo,
          tipoDocumento,
          numeroIdentificacion,
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
        .toPromise()
        .then(ps => ps.filter(p => p.codambito === 2 || p.codambito === 3));

      this.loading = false;

      if (!pacientes || pacientes.length === 0) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.paciente.tipo.documento.ingresado');
        await this.alertSwalAlert.show();
        return;
      }

      if (pacientes.length === 1) {
        this.cargarDatosPaciente(pacientes[0]);
        return;
      }

      this.alertSwalAlert.title = this.TranslateUtil('key.paciente.encuentra.mas.ambito.o.mas.una.cuenta.abierta');
      await this.alertSwalAlert.show();

      if (this.esacodigo === 3) {
        // esacodigo = 3 = Intersalud
        const paciente = pacientes.find((paciente) => paciente.codambito !== 1);

        if (paciente) {
          this.dataPacienteSolicitud = paciente;
        }
      } else {
        this.dataPacienteSolicitud = pacientes[0];
      }

      this.onBuscar('Paciente', pacientes);
    } catch (error) {
      this.loading = false;
      console.error('[ERROR BUSQUEDA PACIENTE] ', error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.paciente');
      await this.alertSwalAlert.show();
    }
  }

  private cargarDatosPaciente(paciente: Paciente) {
    this.dataPacienteSolicitud = paciente;
    this.imprimirsolicitud = false;
    this.activaagregar = false;
    this.tipobusqueda = 'Paciente';
    this.FormDatosProducto.get('codigo').disable();
    this.FormDatosProducto.get('descripcion').disable();
    this.FormDatosProducto.get('cantidad').enable();
    this.FormDatosPaciente.get('tipodocumento').disable();
    this.FormDatosPaciente.get('numidentificacion').disable();
    this.FormDatosPaciente.get('bodcodigo').enable();
    this.FormDatosPaciente.get('codservicioactual').setValue(this.dataPacienteSolicitud.codservicioactual);
    this.setDatos();
  }

  ActivaImprimir(){
    if(this.tipobusqueda==='Paciente'|| this.imprimirsolicitud===false){
      return false; //:false
    }
  }

  cambioPes(){
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {​​​​​​​​
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'HostListener');
      }
    }
  }​​​​​​​​

  async validaStock(){
    this.valida = true;
    var stock : StockProducto[];
    var index : number = 0;
    this.arrdetalleMedicamentos.forEach(async element =>  {
      stock =  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, element.meinid, this.dataPacienteSolicitud.boddestino, this.usuario, this.servidor).toPromise()
        if(element.cantadespachar > stock[0].stockactual){
          if (index === 0) {
            this.respPermiso = "<p>"+this.TranslateUtil('key.saldo.articulo')+" <strong>" + element.codmei + "</strong>"+ this.TranslateUtil('key.es') + stock[0].stockactual + "</p>";
          } else {
            this.respPermiso = this.respPermiso + "<p>"+this.TranslateUtil('key.saldo.articulo')+ "<strong>" + element.codmei + "</strong>" + this.TranslateUtil('key.es') + stock[0].stockactual + "</p>";
          }
          index++;
          this.valida = false;
        }
    });
    this.arrdetalleInsumos.forEach(async element =>  {
      stock =  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, element.meinid, this.dataPacienteSolicitud.boddestino, this.usuario, this.servidor).toPromise()
        if(element.cantadespachar > stock[0].stockactual){
          if (index === 0) {
            this.respPermiso = "<p>"+this.TranslateUtil('key.saldo.articulo')+" <strong>" + element.codmei + "</strong>" + this.TranslateUtil('key.es') + stock[0].stockactual + "</p>";
          } else {
            this.respPermiso = this.respPermiso + "<p>"+this.TranslateUtil('key.saldo.articulo')+" <strong>" + element.codmei + "</strong> " + this.TranslateUtil('key.es') + stock[0].stockactual + "</p>";
          }
          index++;
          this.valida = false;
        }
    });

    return this.valida
  }

  sortbyMed(opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.optMed === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.optMed = "DESC"
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.optMed = "ASC"
    }

    switch (opt) {
      case 'descripcion':
        this.arrdetalleMedicamentos.sort(function (a, b) {
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
        this.arrdetalleMedicamentos.sort(function (a, b) {
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
        this.arrdetalleInsumos.sort(function (a, b) {
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
        this.arrdetalleInsumos.sort(function (a, b) {
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

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
