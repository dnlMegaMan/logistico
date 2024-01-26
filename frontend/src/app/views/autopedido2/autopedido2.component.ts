import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
import { Prioridades } from '../../models/entity/Prioridades';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { StockProducto } from 'src/app/models/entity/StockProducto';
import { DespachoSolicitud } from '../../models/entity/DespachoSolicitud';
/*Components */
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { ModalpacienteComponent } from '../modalpaciente/modalpaciente.component';
import { BusquedasolicitudpacientesComponent } from '../busquedasolicitudpacientes/busquedasolicitudpacientes.component';
import { BusquedaplantillasbodegaComponent } from '../busquedaplantillasbodega/busquedaplantillasbodega.component'
import { BusquedasolicitudesComponent } from '../busquedasolicitudes/busquedasolicitudes.component';
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
import { DespachoDetalleSolicitud } from 'src/app/models/entity/DespachoDetalleSolicitud';
import { DispensarsolicitudesService } from 'src/app/servicios/dispensarsolicitudes.service';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { Detalleproducto } from '../../models/producto/detalleproducto';
import { Detallelote } from '../../models/entity/Detallelote';
import { PacientesService } from '../../servicios/pacientes.service';
import { PrioridadesService } from '../../servicios/prioridades.service';
import { EstructuraBodegaServicio } from 'src/app/models/entity/estructura-bodega-servicio';
import { CreasolicitudesService } from '../../servicios/creasolicitudes.service';
import { Console } from 'console';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-autopedido2',
  templateUrl: './autopedido2.component.html',
  styleUrls: ['./autopedido2.component.css'],
  providers: [CreasolicitudesService,DispensarsolicitudesService, DatePipe, InformesService]
})
export class Autopedido2Component implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  /**Para uso dinamico de tabs */
  @ViewChild('tabProducto', { static: false }) tabProductoTabs: TabsetComponent;

  public modelopermisos               : Permisosusuario = new Permisosusuario();
  public pagina                       : number = 5;
  public alerts                       : Array<any> = [];
  public docsidentis                  : Array<DocIdentificacion> = [];
  public tipoambitos                  : Array<TipoAmbito> = [];
  public estadosolicitudes            : Array<EstadoSolicitud> = [];
  // public _Solicitud             : Solicitud;
  public DetalleMedicamentos       : Array<DetalleSolicitud> = [];
  public medicamentosadispensar       : Array<DetalleSolicitud> = [];
  public DetalleMedicamentosPaginacion     : Array<DetalleSolicitud> = [];
  public DetalleMedicamentosPaginacion_aux : Array<DetalleSolicitud> = [];
  public DetalleMedicamentos_aux   : Array<DetalleSolicitud> = [];
  public DetalleMedicamentos_2     : Array<DetalleSolicitud> = [];
  public DetalleInsumos_aux1       : Array<DetalleSolicitud> = [];
  public DetalleMedicamentos_aux1  : Array<DetalleSolicitud> = [];
  public DetalleInsumos            : Array<DetalleSolicitud> = [];
  public DetalleInsumos_2          : Array<DetalleSolicitud> = [];
  public DetalleInsumos_aux        : Array<DetalleSolicitud> = [];
  public insumosadispensar            : Array<DetalleSolicitud> = [];
  public DetalleInsumosPaginacion         : Array<DetalleSolicitud> = [];
  public DetalleInsumosPaginacion_aux     : Array<DetalleSolicitud> = [];
  public grillaMedicamentos           : Array<DetalleSolicitud> = [];
  public grillaInsumos                : Array<DetalleSolicitud> = [];
  public detalleloteprod              : Array<Detallelote> = [];
  public detallelotemed               : Array<Detallelote> = [];
  public FormCreaSolicitud            : FormGroup;
  public FormDetalleSolicitud         : FormGroup;
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
  public doblesolicitud               = false;
  public codprod                      = null;
  idplantilla                         : number;
  public codambito                    = 0;
  esmedicamento                       : boolean;
  public btnlimpiargrillamed          = false;
  public btnlimpiargrillains          = false;
  public imprimirsolicitud            = false;
  public bloqueacantsoli              : boolean = false;

  public BodegaMedicamentos     : number = 0;
  public BodegaInsumos          : number = 0;
  public BodegaControlados      : number = 0;
  public BodegaConsignacion     : number = 0;
  public desactivabtnelimmed    : boolean = false;
  public desactivabtnelimins    : boolean = false;
  public ActivaBotonBuscaGrillaMedicamento = false;
  public ActivaBotonLimpiaBuscaMedicamento = false;
  public ActivaBotonBuscaGrillaInsumo = false;
  public ActivaBotonLimpiaBuscaInsumo = false;
  public lotesMedLength         : number;
  public lotesInsLength         : number;
  public descprod               = null;
  public prioridades            : Array<Prioridades> = [];
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public serviciocodigo         : number = null;
  public agregarproductoygrilla : boolean = false;
  public stockbodegasolicitante : number = 0;
  public ListaEstructuraServicioBodegas : EstructuraBodegaServicio[]=[];
  public existesolicitud        : boolean = false;
  public DespachoSolicitud      : DespachoSolicitud;

  public text                   : string = null;
  public textDetMed             : string = null;
  public textDetIns             : string = null;
  public textErr                : boolean = false;
  public valida                 : boolean;
  public respPermiso            : string;

  // paginacion
  public pageMed : number;
  public pageIns : number;

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
    private PrioridadesService      : PrioridadesService,
    public _creaService             : CreasolicitudesService,
    public translate: TranslateService
  ) {

    this.FormCreaSolicitud = this.formBuilder.group({
      numsolicitud: [{ value: null, disabled: true }, Validators.required],
      esticod   : [{ value: 10, disabled: false }, Validators.required],
      hdgcodigo : [{ value: null, disabled: false }, Validators.required],
      esacodigo : [{ value: null, disabled: false }, Validators.required],
      cmecodigo : [{ value: null, disabled: false }, Validators.required],
      prioridad : [{ value: 1, disabled: false }, Validators.required],
      fecha     : [{ value: new Date(), disabled: true }, Validators.required],
      bodcodigo : [{ value: null, disabled: false }, Validators.required],
      codbodegasuministro: [{ value: null, disabled: false }, Validators.required],
      bsservid  : [{ value: null, disabled: false }, Validators.required],
      glosa     : [{ value: null, disabled: false }, Validators.required],

    });
    this.FormDetalleSolicitud = this.formBuilder.group({
      codigo  : [{ value: null, disabled: false }, Validators.required],
      descripcion: [{ value: null, disabled: false }, Validators.required],
      cantidad: [{ value: null, disabled: false }, Validators.required]
    });
   }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.FormCreaSolicitud.controls.esticod.disable();
    // this.FormCreaSolicitud.controls.numsolicitud.disable();

    this.datosUsuario();
    this.BuscaBodegaSolicitante();
    /* completa combobox */
    this.PrioridadesService.list(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.prioridades = data;
      }, err => {
      }
    );
    this.getParametros();
    this.setDate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
    });
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

  BuscaBodegaSolicitante() {
    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.bodegasSolicitantes = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
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
    this.FormCreaSolicitud.controls.numidentificacion.enable();
  }

  ActivaBotonGrillaSolicitud(){

    if (this.FormCreaSolicitud.get("bodcodigo").value != null
    && this.FormCreaSolicitud.get("bsservid").value != null
    && this.FormCreaSolicitud.get("numsolicitud").value  == null
    && this.FormCreaSolicitud.get("glosa").value != null
    ) {

      return true
    }
    else {

      return false
    }
  }

  BuscarSolicitudes() {
    this._BSModalRef = this._BsModalService.show(BusquedasolicitudesComponent, this.setModalBusquedaSolicitud());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) { }
      else {

        this._solicitudService.BuscaSolicitud(response.soliid, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, 0, 0, 0, 0, 0, "",60,"","").subscribe(
          response_solicitud => {

            this.SeleccionaBodega(response_solicitud[0].bodorigen);

            this.dataPacienteSolicitud = response_solicitud[0];
            this.FormCreaSolicitud.get('bsservid').setValue(response_solicitud[0].codservicioori);

            // this.desactivabtnelim = true;
            this.imprimesolins = false;
            this.FormCreaSolicitud.get('numsolicitud').setValue(this.dataPacienteSolicitud.soliid);
            this.FormCreaSolicitud.get('bodcodigo').setValue(this.dataPacienteSolicitud.bodorigen);
            this.BuscaBodegaSolicitante();
            this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this.dataPacienteSolicitud.fechacreacion, 'dd-MM-yyyy'));
            this.FormCreaSolicitud.get('esticod').setValue(this.dataPacienteSolicitud.estadosolicitud);
            this.FormCreaSolicitud.get('prioridad').setValue(this.dataPacienteSolicitud.prioridadsoli);
            this.FormCreaSolicitud.get('glosa').setValue(this.dataPacienteSolicitud.observaciones);
            this.existesolicitud = true;
            this.imprimirsolicitud = true;
            this.agregarproductoygrilla = false;
            // this.activabtncreasolic =false;
            this.bloqueacantsoli = true;
            this.DetalleMedicamentosPaginacion = [];
            this.DetalleMedicamentos = [];
            this.DetalleMedicamentosPaginacion_aux = [];
            this.DetalleMedicamentos_aux = [];

            this.DetalleInsumosPaginacion = [];
            this.DetalleInsumos = [];
            this.DetalleInsumosPaginacion_aux = [];
            this.DetalleInsumos_aux = [];

            this.dataPacienteSolicitud.solicitudesdet.forEach(element =>{
              if(element.tiporegmein == "I"){
                // var detalle = new DetalleSolicitud()
                // detalle = element
                this.tabProductoTabs.tabs[1].active = true;
                // element.bloqcampogrilla = false;
                // element.bloqcampogrilla2 = false;
                this.DetalleInsumos = this.dataPacienteSolicitud.solicitudesdet;
                this.ActivaBotonBuscaGrillaInsumo = true;
              }else{
                if(element.tiporegmein === 'M'){
                  this.tabProductoTabs.tabs[0].active = true;
                  this.DetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
                  this.ActivaBotonBuscaGrillaMedicamento = true;
                }
              }
            })
            // this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet;
            // this.arregloDetalleProductoSolicitud.forEach(x=>{
            //   x.detallelote.forEach(f=>{
            //     x.fechavto = f.fechavto;
            //   })
            // })
            // this.ActivaBotonBuscaGrilla = true;

            this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // ; // .slice(0,20);
            this.DetalleInsumosPaginacion = this.DetalleInsumos; // ; // .slice(0,20);

            this.DetalleMedicamentos_aux = this.DetalleMedicamentos;
            this.DetalleMedicamentosPaginacion_aux = this.DetalleMedicamentosPaginacion;
            this.DetalleInsumos_aux = this.DetalleInsumos;
            this.DetalleInsumosPaginacion_aux = this.DetalleInsumosPaginacion;

            // this.DetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud; // ; // .slice(0, 20);

            // this.DetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
            // this.DetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
          });
      }
    });
  }

  setModalBusquedaSolicitud() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.solicitudes'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        origen : 'Autopedido',
        paginaorigen: 6
      }
    };
    return dtModal;
  }

  cargaSolicitud(soliid: number) {
    this.DetalleMedicamentos = [];
    this.DetalleMedicamentosPaginacion = [];
    this.DetalleInsumos = [];
    this.DetalleInsumosPaginacion = [];
    /* Tras Crear nueva Solicitud, obtiene datos recien creados y cambia tipo busqueda a 'Solicitud'*/
    this.tipobusqueda = 'Solicitud';
    this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo,
      null,null, null, null, null, null, this.servidor, null, null, null, null, null,
      null,null, 60, "","").subscribe(
        response => {
          if (response != null){
            response.forEach(data => {
              this.dataPacienteSolicitud = data;
            });
            this.imprimirsolicitud = true;
            this.bloqueacantsoli = true;
            this.loading = false;
            this.setDatos();
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

  SeleccionaBodega(codigobodega: number){
    let _EstructuraBodegaServicio: EstructuraBodegaServicio;
    this.FormCreaSolicitud.get('bsservid').setValue(null);

    _EstructuraBodegaServicio= new(EstructuraBodegaServicio);
    _EstructuraBodegaServicio.hdgcodigo = this.hdgcodigo;
    _EstructuraBodegaServicio.esacodigo = this.esacodigo;
    _EstructuraBodegaServicio.cmecodigo = this.cmecodigo;
    _EstructuraBodegaServicio.bsvigente = 'S'
    _EstructuraBodegaServicio.bsfbodcodigo = codigobodega; // this.FormCreaSolicitud.get("bodcodigo").value
    _EstructuraBodegaServicio.servidor = this.servidor;


    this.ListaEstructuraServicioBodegas = [];

     this._BodegasService.ListaEstructuraServicioBodegas(_EstructuraBodegaServicio).subscribe(response => {
      if (response.length == 0) {
        this.agregarproductoygrilla = true;
      }
      else {
        if  (response.length == 1) {
          this.ListaEstructuraServicioBodegas = response
          this.FormCreaSolicitud.get('bsservid').setValue(this.ListaEstructuraServicioBodegas[0].bsservid);
          this.serviciocodigo = this.ListaEstructuraServicioBodegas[0].bsservid;
          this.agregarproductoygrilla = true;
        } else {
          this.ListaEstructuraServicioBodegas = response
        }

      }
     })

  }

  SeleccionaServicio(event:any, serviciocod : number){
    this.agregarproductoygrilla = true;
    this.serviciocodigo = serviciocod;
  }

  cargaSolicitudadispensar(soliid: number, doblesol: boolean) {
    /* Tras Crear nueva Solicitud, obtiene datos recien creados y cambia tipo busqueda a 'Imprimir'*/
    this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
      null, null, null, null, null, this.servidor, null,
      null, null, null, null, null, null, 60, "","").subscribe(
        response => {
          response.forEach(async data => {
            this.dataPacienteSolicitud = data;
            this.DispensarSolicitud(doblesol);
          });
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
      null, null, null, null, null, this.servidor, null, null, null, null, null, null,
      null, 60, "","").subscribe(
        response => {
          /**activa btnimprimir */
          this.imprimirsolicitud = false;
          this.verificanull = false;
          response.forEach(data => {
            this.dataPacienteSolicitud = data;
          });
          this.dataPacienteSolicitud.solicitudesdet.forEach(element => {
            if (element.tiporegmein == "I") {
              this.solins = true;
              this.DetalleInsumos = this.dataPacienteSolicitud.solicitudesdet
              this.DetalleInsumosPaginacion = this.DetalleInsumos; // ; // .slice(0, 20);
              this.loading = false;
            } else {
              if (element.tiporegmein == "M") {
                this.solmedic = true;
                this.DetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
                this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // ; // .slice(0, 20)
                this.loading = false;
              }
            }
          })
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

            /* 1-Limpia 2-asigna variable tipobusqueda 3-Aplica logica vacios 4-setea datos buscados//comentarios @MLobos*/

            this.limpiar();
            this.dataPacienteSolicitud = Retorno

            this.FormCreaSolicitud.get('codservicioactual').setValue(Retorno.codservicioactual);
            this.imprimirsolicitud = false;
            this.tipobusqueda = busqueda;
            this.FormDetalleSolicitud.controls.codigo.enable();
            this.FormDetalleSolicitud.controls.descripcion.enable();
            this.FormDetalleSolicitud.controls.cantidad.enable();
            this.FormDetalleSolicitud.controls.tipodocumento.disable();
            this.FormDetalleSolicitud.controls.numidentificacion.disable();
            this.logicaVacios();
            this.setDatos();
            this.BuscaDatosBodega();
          }
        });
        break;

      case 'Solicitud':
        this._BSModalRef = this._BsModalService.show(BusquedasolicitudpacientesComponent, this.setModal(this.TranslateUtil('key.title.busqueda.de').concat(busqueda)));
        this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
          if (Retorno !== undefined) {

            /* 1-Limpia 2-asigna variable tipobusqueda 3-Aplica logica vacios 4-setea datos buscados//comentarios @MLobos*/

            this._solicitudService.BuscaSolicitud(Retorno.soliid, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0, "", 60,"", "").subscribe(
              response => {
                this.limpiar();
                /**deshabilita btn agregar producto y plantilla */
                this.tipobusqueda = busqueda;
                this.dataPacienteSolicitud = response[0];
                this.BuscaBodegaDeServicio(Retorno.codservicioori);
                this.imprimirsolicitud = true;
                if (this.dataPacienteSolicitud.estadosolicitud === 50) {
                  this.tipobusqueda = this.TranslateUtil('key.total');
                } else {
                  this.tipobusqueda = busqueda;
                }
                if(this.dataPacienteSolicitud.estadosolicitud === 10){
                  this.FormDetalleSolicitud.controls.codigo.enable();
                  this.FormDetalleSolicitud.controls.descripcion.enable();
                  this.FormDetalleSolicitud.controls.cantidad.enable();
                }else{
                  this.FormDetalleSolicitud.controls.codigo.enable();
                }
                this.logicaVacios();
                this.setDatos();
                this.BuscaDatosBodega();
              });
          }
        }
        );
        break;
    }
  }

  BuscaDatosBodega() {
    // A partir de un servicio informa las bodegas asociadas en funcipon de las reglas definidas en la tabla Clin_far_reglas
    if (this.FormCreaSolicitud.get("codservicioactual").value != null) {
      // Se busca los datos asociados al servicio.
      this._BusquedaproductosService.BuscarReglasServicio(this.hdgcodigo, this.esacodigo, this.cmecodigo, 'INPUT-PORDUCTO-SOLICTUD-PACIENTE', null, null, this.FormCreaSolicitud.get("codservicioactual").value, 0, this.servidor).subscribe(
        response => {
          if (response == undefined) {
            return;
          }
          else {
            // seteamos las variables que son general a la solicitu y dispensación.
            this.BodegaMedicamentos = response[0].reglabodegamedicamento;
            this.BodegaInsumos = response[0].reglabodegainsumos;
            this.BodegaControlados = response[0].reglabedegacontrolados;
            this.BodegaConsignacion = response[0].reglabodegaconsignacion;
          }
        }
      );
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
          if (response.length == 0) {
          } else {
            this.FormCreaSolicitud.get('bodcodigo').setValue(response[0].boddescodigo);
            this.BuscaBodegasSuministro(response[0].boddescodigo);
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
        this.FormDetalleSolicitud.reset();
        this.loading = false;
        this.FormDetalleSolicitud.reset();
        this.setProducto(RetornoProductos);
        this.logicaVacios();
      }else{
        this.loading = false;
      }
    });this.loading = false;
  }

  async onBuscarPlantillas() {
    this._BSModalRef = this._BsModalService.show(BusquedaplantillasbodegaComponent, this.setModalBusquedaPlantilla());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) {
        return;
      }
      else {
        let bodega : number = this.FormCreaSolicitud.controls.bodcodigo.value;
        this._BodegasService.BuscaPlantillas(this.servidor, sessionStorage.getItem('Usuario'), this.hdgcodigo, this.esacodigo,
          this.cmecodigo, response.planid, '', '', '', bodega, bodega, '', '', 1, "").subscribe(
            response_plantilla => {
              if (response_plantilla.length == 0) {
              } else {
                this.loading = true;
                if (response_plantilla.length > 0) {
                  let arrPlantillas: Plantillas = new Plantillas();
                  arrPlantillas = response_plantilla[0];
                  this.nomplantilla = arrPlantillas.plandescrip;
                  arrPlantillas.plantillasdet.forEach(async res => {
                    this.bloqueacantsoli = false;
                    this.setPlantilla(res);
                    this.logicaVacios();
                    this.FormDetalleSolicitud.reset();
                  });
                  this.getLotesgrillamedicamentos();
                }
              }
              this.loading = false;
            });
            this.loading = false;
      }
    });
  }

  /**Funcion que devuelve lotes de productos en plantilla */
  async getLotesgrillamedicamentos() {
    await this.setSolicitud();
    this._solicitudService.buscarLotedetalleplantilla(this.solicitudMedicamento).subscribe(dat => {

      this.setLotemedicamento(dat);
      this.getLoteIns();
    }, err => {
      this.alertSwalError.title = 'Error al buscar Lotes';
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
      this.DetalleMedicamentos.forEach(res => {
        lotes.forEach(elemento_lote => {
          if (res.codmei === elemento_lote.codmei) {
            res.detallelote = lotes;
            this.DetalleMedicamentos[0].fechavto = lotes[0].fechavto;
            this.DetalleMedicamentos[0].lote = lotes[0].lote;
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
      this.DetalleMedicamentos.forEach(res => {
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
            }
          }
        });
      });
      this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // ; // .slice(0,20);
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
    this.DetalleInsumos.forEach(res => {
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
          }
        }
      });
    });
  }

  /* Carga datos busqueda en pantalla */
  async setDatos() {
    this.numsolicitud = this.dataPacienteSolicitud.soliid;
    this.FormCreaSolicitud.get('bodcodigo').setValue(this.dataPacienteSolicitud.bodorigen);
    // this.FormCreaSolicitud.get('codbodegasuministro').setValue(this.dataPacienteSolicitud.boddestino);
    this.FormCreaSolicitud.get('numsolicitud').setValue(this.dataPacienteSolicitud.soliid);

    if (this.tipobusqueda === "Paciente") {
      this.FormCreaSolicitud.get('fechahora').setValue(new Date());
      this.FormCreaSolicitud.get('ambito').setValue(this.dataPacienteSolicitud.codambito);
      this.FormCreaSolicitud.controls.estado.disable();
      this.FormCreaSolicitud.controls.ambito.disable();
    } else if (this.tipobusqueda === "Solicitud" || this.tipobusqueda === null || this.tipobusqueda === 'Total') {
      this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this.dataPacienteSolicitud.fechacreacion, 'dd-MM-yyyy HH:mm:ss'));
      // this.FormCreaSolicitud.get('ambito').disable();
      this.FormCreaSolicitud.get('esticod').disable();
      // this.FormCreaSolicitud.get('ambito').setValue(this.dataPacienteSolicitud.codambito);
      this.FormCreaSolicitud.get('esticod').setValue(this.dataPacienteSolicitud.estadosolicitud);
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
      this.DetalleMedicamentos = [];
      this.DetalleMedicamentosPaginacion = [];
      this.DetalleInsumos = [];
      this.DetalleInsumosPaginacion = [];
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
      this.DetalleInsumos = this.dataPacienteSolicitud.solicitudesdet;
      this.DetalleInsumosPaginacion = this.DetalleInsumos; // ; // .slice(0, 20); // <- Llamar Función paginación

      this.DetalleInsumos_aux = this.DetalleInsumos;
      this.DetalleInsumosPaginacion_aux = this.DetalleInsumosPaginacion;
      this.ActivaBotonBuscaGrillaInsumo = true;
      this.tabProductoTabs.tabs[1].active = true;
      this.solmedic = false;
      this.checkInsumosnuevo();
    } else {
      if (this.solmedic == true) {
        this.checkInsumosnuevo();

        this.DetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
        this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // ; // .slice(0, 20);

        this.DetalleMedicamentos_aux = this.DetalleMedicamentos;
        this.DetalleMedicamentosPaginacion_aux = this.DetalleMedicamentosPaginacion;
        this.ActivaBotonBuscaGrillaMedicamento = true;
        this.tabProductoTabs.tabs[0].active = true;
        this.solins = false;
      }
    }
  }

  /* Calculo formulación grilla Productos*/
  cantidadsolicitada(id:number,detalle: DetalleSolicitud) {

    this.alertSwalAlert.title = null;

    if(detalle.detallelote != null || detalle.detallelote != undefined){
      if(detalle.detallelote.length !=0){
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
      if (detalle.cantsoli > detalle.stockorigen) {

        this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.excede.permitido.no.existe.lote');
        this.alertSwalAlert.show();
        // this.errorMsg('Cantidad excede el permitido y/o no existe lote');
        detalle.cantsoli = 0;
        // this.verificalote(detalle);
      }else{
        if (detalle.cantsoli <= 0) {

          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.mayor.a.cero');
          this.alertSwalAlert.show();
          // this.DetalleInsumos[idg].cantsoli = 1;
          // this.DetalleInsumos[idg].cantadespachar = this.DetalleInsumos[idg].cantsoli;
        }
      }

      if (this.tipobusqueda == 'Solicitud') {
        if (detalle.acciond !== 'I') {
          detalle.acciond = 'M';
        }
      }
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
    // this.verificalote(detalle);
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

  cantidadInsumo(id:number,detalle: DetalleSolicitud) {

    this.alertSwalAlert.text = null;
    if(detalle.detallelote != null || detalle.detallelote != undefined){
      if(detalle.detallelote.length !=0){
        if (detalle.cantsoli > detalle.stockorigen) {
          this.errorMsg(this.TranslateUtil('key.mensaje.cantidad.excede.permitido.no.existe.lote'));
          detalle.cantsoli = 0;
          this.verificalote(detalle);
        }
        if (detalle.cantsoli <= 0) {

          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.mayor.a.cero');
          this.alertSwalAlert.show();
          // this.DetalleInsumos[idg].cantsoli = 1;
          // this.DetalleInsumos[idg].cantadespachar = this.DetalleInsumos[idg].cantsoli;
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
      if (detalle.cantsoli > detalle.stockorigen) {

        this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.excede.permitido.no.existe.lote');
        this.alertSwalAlert.show();
        // this.errorMsg('Cantidad excede el permitido y/o no existe lote');
        detalle.cantsoli = 0;
        // this.verificalote(detalle);
      }else{
        if (detalle.cantsoli <= 0) {

          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.mayor.a.cero');
          this.alertSwalAlert.show();
          // this.DetalleInsumos[idg].cantsoli = 1;
          // this.DetalleInsumos[idg].cantadespachar = this.DetalleInsumos[idg].cantsoli;
        }
      }

      if (this.tipobusqueda == 'Solicitud') {
        if (detalle.acciond !== 'I') {
          detalle.acciond = 'M';
        }
      }
      this.logicaVacios();
    }


  }

  limpiar() {
    this.dataPacienteSolicitud = new Solicitud();
    this.accionsolicitud = 'I';
    this.fechaactual = null;
    this.nomplantilla = null;
    this.FormCreaSolicitud.reset();
    this.FormDetalleSolicitud.reset();
    this.DetalleMedicamentos = [];
    this.DetalleMedicamentosPaginacion = [];
    this.DetalleInsumos = [];
    this.DetalleInsumosPaginacion = [];
    this.grillaMedicamentos = [];
    this.grillaInsumos = [];
    this.solicitudMedicamento = new Solicitud();
    this.solicitudInsumo = new Solicitud();
    this.tipobusqueda = null;
    this.FormCreaSolicitud.controls["prioridad"].setValue(1);
    this.FormCreaSolicitud.controls["esticod"].setValue(10);
    this.FormCreaSolicitud.get('prioridad').enable();
    this.FormCreaSolicitud.get('esticod').enable();
    this.solmedic = false;
    this.solins = false;
    this.imprimesolins = false;
    this.FormCreaSolicitud.get('fecha').setValue(new Date());
    this.imprimirsolicitud = false;
    this.verificanull = false;
    this.vaciosmed = true;
    this.vaciosins = true;
    this.doblesolicitud = false
    this.BodegaMedicamentos = 0;
    this.BodegaInsumos = 0;
    this.BodegaControlados = 0;
    this.BodegaConsignacion = 0;
    this.detalleloteprod = [];
    this.desactivabtnelimmed = false;
    this.desactivabtnelimins = false;
    this.FormCreaSolicitud.controls.esticod.disable();
    this.ActivaBotonBuscaGrillaMedicamento = false;
    this.ActivaBotonBuscaGrillaInsumo = false;
    this.bloqueacantsoli = true;
    this.pageMed = 1;
    this.pageIns = 1;
  }

  limpiarGrillamedicamento() {
    let temparrdetalleMedicamentos: Array<DetalleSolicitud> = [];
    this.alertSwalAlert.text = '';
    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.pregunta.borrar.todos.nuevos.elementos');
    this.alertSwalAlert.show().then(resp => {
      if (resp.value) {
        for (let d of this.DetalleMedicamentos) {
          if (d.acciond != 'I') {
            temparrdetalleMedicamentos.push(d)
          }
        }
      }
      this.DetalleMedicamentos = temparrdetalleMedicamentos;
      this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos;
      this.grillaMedicamentos = this.DetalleMedicamentos;
      this.btnlimpiargrillamed = this.DetalleMedicamentos.length ? true : false;
      this.vaciosmed = this.DetalleMedicamentos.length ? false : true;
      this.logicaVacios();
      this.checkMedicamentonuevo();
    });
  }

  /**funcion que habilita/desactiva btnLimpiargrilla Medicamentos */
  checkMedicamentonuevo() {
    const tipogrilla = this.DetalleMedicamentos;
    if (tipogrilla.length || tipogrilla === null) {
      for (let d of tipogrilla) {
        if (d.acciond === 'I') {
          this.btnlimpiargrillamed = true;
          break;
        } else {
          this.btnlimpiargrillamed = false;
        }
      }
    } else { this.btnlimpiargrillamed = false; }
  }

  limpiarGrillainsumo() {
    let temparrdetalleInsumos: Array<DetalleSolicitud> = [];
    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.pregunta.borrar.todos.nuevos.elementos');
    this.alertSwalAlert.show().then(resp => {
      if (resp.value) {
        for (let d of this.DetalleInsumos) {
          if (d.acciond != 'I') {
            temparrdetalleInsumos.push(d)
          }
        }
      }
      this.DetalleInsumos = temparrdetalleInsumos;
      this.DetalleMedicamentosPaginacion = this.DetalleInsumos;
      this.grillaInsumos = this.DetalleInsumos;
      this.btnlimpiargrillains = this.DetalleInsumos.length ? true : false;
      this.vaciosins = this.DetalleInsumos.length ? false : true;
      this.logicaVacios();
      this.checkInsumosnuevo();
    });
  }

  /**funcion que habilita/desactiva btnLimpiargrilla Insumos */
  checkInsumosnuevo() {
    const tipogrilla = this.DetalleInsumos;
    if (tipogrilla.length || tipogrilla === null) {
      for (let d of tipogrilla) {
        if (d.acciond === 'I') {
          this.btnlimpiargrillains = true;
          break;
        } else {
          this.btnlimpiargrillains = false;
        }
      }
    } else { this.btnlimpiargrillains = false; }
  }

  /**Si hay campos vacios grilla desactiva Crear Sol//@Mlobos */
  async logicaVacios() {
    const Swal = require('sweetalert2');
    this.textErr = false;
    this.text = "";
    this.text = "`<h2>"+this.TranslateUtil('key.mensaje.saldo.insuficiente.cantidad.ingresada')+"</h2><br/>";
    await this.vaciosProductosMed();
    await this.vaciosProductosIns();
    if(this.textErr){
      this.verificanull = false;
      Swal.fire({
        html: this.text + this.textDetMed + this.textDetIns +"`",
      });
    }else{
      if (this.vaciosmed === true && this.vaciosins === true ) {
        this.verificanull = false;
      }
      else {
        if(this.vaciosmed === true && this.vaciosins === false){
          if(this.DetalleMedicamentos.length){
            this.verificanull = false;
          } else {
            this.verificanull = true;
          }
        }else{
          if(this.vaciosmed === false && this.vaciosins === true){
            if(this.DetalleInsumos.length){
              this.verificanull = false;
            } else {
              this.verificanull = true;
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

    if (this.DetalleMedicamentos.length) {
      for (var data of this.DetalleMedicamentos) {
        if (data.cantsoli <= 0 || data.cantsoli === null) {
          this.vaciosmed = true;
          return;
        } else {
          if(data.cantsoli > 0){
            stock1=  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, data.meinid, this.FormCreaSolicitud.controls.bodcodigo.value, this.usuario, this.servidor).toPromise();
            if(data.cantsoli > Number(stock1[0].stockactual)){
              if (i === 0) {
                this.textDetMed = "<p>"+this.TranslateUtil('key.saldo.medicamento')+" <strong>" + data.codmei + "</strong> "+this.TranslateUtil('key.es')+": " + stock1[0].stockactual + "</p>";
              } else {
                this.textDetMed = this.textDetMed + "<p>"+this.TranslateUtil('key.saldo.medicamento')+" <strong>" + data.codmei + "</strong> "+this.TranslateUtil('key.es')+": " + stock1[0].stockactual + "</p>";
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
    if (this.DetalleInsumos.length) {
      for (var data of this.DetalleInsumos) {
        if (data.cantsoli <= 0 || data.cantsoli === null) {
          this.vaciosins = true;
          return;
        } else {
          if(data.cantsoli>0){
            stock1=  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, data.meinid, this.FormCreaSolicitud.controls.bodcodigo.value, this.usuario, this.servidor).toPromise();
            if(data.cantsoli > Number(stock1[0].stockactual)){
              if (i === 0) {
                this.textDetIns = "<p>"+this.TranslateUtil('key.saldo.insumo')+" <strong>" + data.codmei + "</strong> "+this.TranslateUtil('key.es')+": " + stock1[0].stockactual + "</p>";
              }else{
                this.textDetIns = this.textDetIns + "<p>"+this.TranslateUtil('key.saldo.insumo')+" <strong>" + data.codmei + "</strong> "+this.TranslateUtil('key.es')+": " + stock1[0].stockactual + "</p>";
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

  async setPlantilla(art: DetallePlantillaBodega) {

    var stock1 :StockProducto[]
    stock1=  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, art.meinid, this.FormCreaSolicitud.value.bodcodigo, this.usuario, this.servidor).toPromise()
    this.stockbodegasolicitante =stock1[0].stockactual;
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
    detalleSolicitud.stockorigen = this.stockbodegasolicitante;
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
    detalleSolicitud.bloqcampogrilla2 = true;
    if (detalleSolicitud.tiporegmein == "M") {
      if (this.tipobusqueda === 'Solicitud' && this.solins) {
        /*debe ingresar solo Insumos*/
        return;
      } else {
        /** si producto existe en grilla, elimina Medicamento y vuelve a ingresar y cambia accion a Modificar*/
        let indx = this.DetalleMedicamentos.findIndex(d => d.codmei === detalleSolicitud.codmei, 1);
        if (indx >= 0) {
          // this.DetalleMedicamentos.splice(indx, 1);
          // detalleSolicitud.acciond = 'M';
        } else {
          detalleSolicitud.acciond = 'I';

          this.DetalleMedicamentos.unshift(detalleSolicitud);
          this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // .slice(0, 20);

          this.DetalleMedicamentos_aux = this.DetalleMedicamentos;
          this.DetalleMedicamentosPaginacion_aux = this.DetalleMedicamentosPaginacion;
          this.checkMedicamentonuevo();
          this.ActivaBotonBuscaGrillaMedicamento = true;
        }
      }
    } else {
      if (this.tipobusqueda === 'Solicitud' && this.solmedic) {
        /*debe ingresar solo Medicamentos*/
        return;
      } else {
        /** si producto existe en grilla, elimina Insumo y vuelve a ingresar */
        let indx = this.DetalleInsumos.findIndex(d => d.codmei === detalleSolicitud.codmei, 1);
        if (indx >= 0) {
          // this.DetalleInsumos.splice(indx, 1);
          // detalleSolicitud.acciond = 'M';
        } else {
          detalleSolicitud.acciond = 'I';

          this.DetalleInsumos.unshift(detalleSolicitud);
          this.DetalleInsumosPaginacion = this.DetalleInsumos; // .slice(0, 20);

          this.DetalleInsumos_aux = this.DetalleInsumos;
          this.DetalleInsumosPaginacion_aux = this.DetalleInsumosPaginacion;
          this.checkInsumosnuevo();
          this.ActivaBotonBuscaGrillaInsumo = true;
        }
        // return;
      }
    }
  }

  async validaduplicado(tipo: string, newprod: DetalleSolicitud) {
    if (tipo === 'M') {
      for (let oldprod of this.DetalleMedicamentos) {
        if (oldprod.codmei === newprod.codmei) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      for (let oldprod of this.DetalleInsumos) {
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
    let cantidad = this.FormDetalleSolicitud.controls.cantidad.value;

    var stock1 :StockProducto[];
    stock1=  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, art.mein, this.FormCreaSolicitud.value.bodcodigo, this.usuario, this.servidor).toPromise()
    this.stockbodegasolicitante =stock1[0].stockactual;


    if(this.stockbodegasolicitante <=0){

      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.producto.no.tiene.stock.bodega');
      this.alertSwalAlert.show();
    }else{
      var detalleSolicitud = new DetalleSolicitud;
      detalleSolicitud.sodeid = 0;
      detalleSolicitud.soliid = 0;
      detalleSolicitud.repoid = 0;
      detalleSolicitud.codmei = art.codigo;
      detalleSolicitud.meinid = art.mein;
      detalleSolicitud.dosis = 0;
      detalleSolicitud.formulacion = 0;
      detalleSolicitud.dias = 0;
      detalleSolicitud.cantsoli = 0;// parseInt(cantidad);
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
      detalleSolicitud.stockorigen = this.stockbodegasolicitante
      detalleSolicitud.bloqcampogrilla = true;
      detalleSolicitud.bloqcampogrilla2 = true;
      if (detalleSolicitud.tiporegmein == "M") {
        if (this.tipobusqueda === 'Solicitud' && this.solins) {
          /*debe ingresar solo Insumos*/
          return;
        } else {
          let codigo_bodega_lote = this.FormCreaSolicitud.controls.bodcodigo.value;
          console.log("this.FormCreaSolicitud.controls.bodcodigo.value : ",this.FormCreaSolicitud.controls.bodcodigo.value);
          console.log("codigo_bodega_lote : ", codigo_bodega_lote);
          this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
            this.cmecodigo, art.codigo, 0, codigo_bodega_lote).subscribe(
              response => {

                if (!response || response.length === 0) {
                  detalleSolicitud.detallelote = [];
                  const indx = this.DetalleMedicamentos.findIndex(x => x.codmei === art.codigo, 1);
                  this.logicaVacios();

                  if (indx >= 0) {
                    this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                    this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.puede.volver.agregar');
                    this.alertSwalError.show();
                  }else{
                    this.DetalleMedicamentos.unshift(detalleSolicitud);

                    this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // .slice(0, 20);

                    this.DetalleMedicamentos_aux = this.DetalleMedicamentos;
                    this.DetalleMedicamentosPaginacion_aux = this.DetalleMedicamentosPaginacion;
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
                    const indx = this.DetalleMedicamentos.findIndex(x => x.codmei === art.codigo, 1);
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
                      this.DetalleMedicamentos.unshift(detalleSolicitud);
                    }
                  }else{
                    if(this.lotesMedLength > 2){
                       /** Cambia a tab Medicamento */
                      this.tabProductoTabs.tabs[0].active = true;
                      /** */
                      this.DetalleMedicamentos.unshift(detalleSolicitud);
                    }
                    var cuentacod = 0;
                    this.DetalleMedicamentos.forEach(x=>{
                      if(x.codmei ===art.codigo){
                        cuentacod ++;
                      }
                    })
                    if(cuentacod >this.lotesMedLength -1  ){
                      const indxmeds = this.DetalleMedicamentos.findIndex(x => x.codmei === art.codigo, 1);
                      this.DetalleMedicamentos.splice(indxmeds,1);
                      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                      this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.no.ingresar.no.lotes.disponible');
                      this.alertSwalError.show();
                    }
                  }
                  this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // .slice(0, 20);
                  this.DetalleMedicamentos_aux = this.DetalleMedicamentos;
                  this.DetalleMedicamentosPaginacion_aux = this.DetalleMedicamentosPaginacion;
                }
              }
            )

            this.ActivaBotonBuscaGrillaMedicamento = true;
            this.checkMedicamentonuevo();
        }
      } else if (detalleSolicitud.tiporegmein == "I") {
        if (this.tipobusqueda === 'Solicitud' && this.solmedic) {
          /*debe ingresar solo Medicamentos*/
          return;
        } else {
          let indice = 0;
          let codigo_bodega_lote = this.FormCreaSolicitud.controls.bodcodigo.value;
          this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
            this.cmecodigo, art.codigo, 0, codigo_bodega_lote).subscribe(
              response => {
                if (!response || response.length === 0) {
                  detalleSolicitud.detallelote = [];
                  const indx = this.DetalleInsumos.findIndex(x => x.codmei === art.codigo, 1);
                  this.logicaVacios();
                  if (indx >= 0) {
                    this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                    this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.puede.volver.agregar');
                    this.alertSwalError.show();
                  }else{
                    this.DetalleInsumos.unshift(detalleSolicitud);
                    this.DetalleInsumosPaginacion = this.DetalleInsumos; // .slice(0, 20);
                    this.DetalleInsumos_aux = this.DetalleInsumos;
                    this.DetalleInsumosPaginacion_aux = this.DetalleInsumosPaginacion;
                  }
                } else {
                  this.lotesInsLength = response.length;
                  detalleSolicitud.detallelote = [];
                  detalleSolicitud.detallelote = response;
                  detalleSolicitud.lote = response[0].lote;
                  detalleSolicitud.fechavto = this.datePipe.transform(response[0].fechavto, 'yyyy-MM-dd');
                  detalleSolicitud.stockorigen = response[0].cantidad;

                  if(this.lotesInsLength === 2 || this.lotesInsLength === 1){
                    const indx = this.DetalleInsumos.findIndex(x => x.codmei === art.codigo, 1);
                    this.logicaVacios();

                    if (indx >= 0) {
                      if(this.lotesInsLength === 2 ){
                        this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                        this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.con.lote.no.agregar');
                        this.alertSwalError.show();
                      }
                      if(this.lotesInsLength === 1){
                        this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                        this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.sin.lote.no.agregar');
                        this.alertSwalError.show();
                      }
                        /** Cambia a tab Insumo */
                      this.tabProductoTabs.tabs[1].active = true;
                      /** */
                      this.DetalleInsumos.unshift(detalleSolicitud);
                    }
                    else{
                      /** Cambia a tab Insumo */
                      this.tabProductoTabs.tabs[1].active = true;
                      /** */
                      this.DetalleInsumos.unshift(detalleSolicitud);
                    }
                  }else{
                    if(this.lotesInsLength > 2){

                       /** Cambia a tab Insumo */
                      this.tabProductoTabs.tabs[1].active = true;
                      /** */
                      this.DetalleInsumos.unshift(detalleSolicitud);
                    }
                    var cuentacod = 0;
                    this.DetalleInsumos.forEach(x=>{
                      if(x.codmei ===art.codigo){
                        cuentacod ++;
                      }
                    });
                    if(cuentacod >this.lotesInsLength -1  ){
                      const indxins = this.DetalleInsumos.findIndex(x => x.codmei === art.codigo, 1);
                      this.DetalleInsumos.splice(indxins,1);
                      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                      this.alertSwalError.text = this.TranslateUtil('key.mensaje.producto.no.ingresar.no.lotes.disponible');
                      this.alertSwalError.show();
                    }
                  }
                  this.DetalleInsumosPaginacion = this.DetalleInsumos; // .slice(0, 20);
                  this.DetalleInsumos_aux = this.DetalleInsumos;
                  this.DetalleInsumosPaginacion_aux = this.DetalleInsumosPaginacion;
                }
              });
              this.ActivaBotonBuscaGrillaInsumo = true;
              this.checkInsumosnuevo();
            }
          }
    }
  }

  setDetallemedicamentos() {
    this.DetalleMedicamentos.forEach(element => {
      var objProducto = new DetalleSolicitud;
      if (this.numsolicitud > 0) {
        objProducto.soliid = this.numsolicitud;
        objProducto.sodeid = element.sodeid;
        objProducto.acciond = element.acciond;
      } else if (this.accionsolicitud == 'M' || this.accionsolicitud == 'E') {
        objProducto.soliid = this.FormCreaSolicitud.controls.numsolicitud.value;
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
    cabeceraSolicitud.cliid = 0;
    cabeceraSolicitud.tipodocpac = 0;
    cabeceraSolicitud.numdocpac = null;
    cabeceraSolicitud.apepaternopac = null;
    cabeceraSolicitud.apematernopac = null;
    cabeceraSolicitud.nombrespac = null;
    cabeceraSolicitud.codambito = 0;
    cabeceraSolicitud.estid = 0;
    cabeceraSolicitud.ctaid = 0;
    cabeceraSolicitud.edadpac = 0;
    cabeceraSolicitud.codsexo = 0;
    cabeceraSolicitud.codservicioactual = this.dataPacienteSolicitud.codservicioactual;
    cabeceraSolicitud.codservicioori = this.FormCreaSolicitud.controls.bsservid.value;
    cabeceraSolicitud.codserviciodes = 0;
    cabeceraSolicitud.boddestino = this.FormCreaSolicitud.value.bodcodigo;
    cabeceraSolicitud.bodorigen = this.FormCreaSolicitud.value.bodcodigo;
    cabeceraSolicitud.tipoproducto = 0;
    cabeceraSolicitud.numeroreceta = 0;
    cabeceraSolicitud.tipomovim = 'C';
    cabeceraSolicitud.tiposolicitud = 60;
    cabeceraSolicitud.estadosolicitud = parseInt(this.FormCreaSolicitud.controls['esticod'].value);
    cabeceraSolicitud.prioridadsoli = 1;
    cabeceraSolicitud.tipodocprof = 0; //this.dataPacienteSolicitud.tipodocprof;
    cabeceraSolicitud.numdocprof = null;
    cabeceraSolicitud.fechacreacion = this.fechaactual;
    cabeceraSolicitud.usuariocreacion = this.usuario;
    cabeceraSolicitud.nombremedico = null;
    cabeceraSolicitud.cuentanumcuenta = '0';
    cabeceraSolicitud.usuario = this.usuario;
    cabeceraSolicitud.servidor = this.servidor;
    cabeceraSolicitud.origensolicitud = 60;
    cabeceraSolicitud.observaciones = this.FormCreaSolicitud.controls.glosa.value;
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
    this.DetalleMedicamentos.forEach(element => {
      var medicamento = new DetalleSolicitud;
      if (this.numsolicitud > 0) {
        if (this.accionsolicitud == 'M') {
          medicamento.soliid = this.FormCreaSolicitud.controls.numsolicitud.value;
          medicamento.sodeid = element.sodeid;
          medicamento.acciond = element.acciond;
          medicamento.fechamodifica = this.fechaactual;
          medicamento.usuariomodifica = this.usuario;
        }
        if (this.accionsolicitud == 'E') {
          medicamento.soliid = this.FormCreaSolicitud.controls.numsolicitud.value;
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
    cabeceraSolicitud.cliid = 0;
    cabeceraSolicitud.tipodocpac = 0;
    cabeceraSolicitud.numdocpac = null;
    cabeceraSolicitud.apepaternopac = null;
    cabeceraSolicitud.apematernopac = null;
    cabeceraSolicitud.nombrespac = null;
    /** Setea codambito para luego llamar al servicio Cargasolicitud */
    // this.codambito = this.FormCreaSolicitud.controls.ambito.value;
    cabeceraSolicitud.codambito = 0;
    cabeceraSolicitud.estid = 0;
    cabeceraSolicitud.ctaid = 0;
    cabeceraSolicitud.edadpac = 0;
    cabeceraSolicitud.codsexo = 0;
    cabeceraSolicitud.codservicioactual = this.dataPacienteSolicitud.codservicioactual;
    cabeceraSolicitud.codservicioori = this.FormCreaSolicitud.controls.bsservid.value;
    cabeceraSolicitud.codserviciodes = 0;
    cabeceraSolicitud.boddestino = this.FormCreaSolicitud.value.bodcodigo;
    cabeceraSolicitud.bodorigen = this.FormCreaSolicitud.value.bodcodigo;
    cabeceraSolicitud.tipoproducto = 0;
    cabeceraSolicitud.numeroreceta = 0;
    cabeceraSolicitud.tipomovim = 'C';
    cabeceraSolicitud.tiposolicitud = 60;
    cabeceraSolicitud.estadosolicitud = parseInt(this.FormCreaSolicitud.controls['esticod'].value);
    cabeceraSolicitud.prioridadsoli = 1;
    cabeceraSolicitud.tipodocprof = 0;
    cabeceraSolicitud.numdocprof = null;
    cabeceraSolicitud.fechacreacion = this.fechaactual;
    cabeceraSolicitud.usuariocreacion = this.usuario;
    cabeceraSolicitud.nombremedico = null;
    cabeceraSolicitud.cuentanumcuenta = '0';
    cabeceraSolicitud.usuario = this.usuario;
    cabeceraSolicitud.servidor = this.servidor;
    cabeceraSolicitud.origensolicitud = 60;
    cabeceraSolicitud.observaciones = this.FormCreaSolicitud.controls.glosa.value;
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
    this.DetalleInsumos.forEach(element => {
      var insumo = new DetalleSolicitud;

      if (this.numsolicitud > 0) {
        if (this.accionsolicitud == 'M') {
          insumo.soliid = this.FormCreaSolicitud.controls.numsolicitud.value;
          insumo.sodeid = element.sodeid;
          insumo.acciond = element.acciond;
          insumo.fechamodifica = this.fechaactual;
          insumo.usuariomodifica = this.usuario;
        }
        if (this.accionsolicitud == 'E') {
          insumo.soliid = this.FormCreaSolicitud.controls.numsolicitud.value;
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
    // this.insumosadispensar = this.DetalleInsumos;
  }

  async setSolicitud() {
    this.fechaactual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    /**Seteamos variables cabecera Solicitud //@Mlobos */
    try {
      await this.setCabeceramedicamentos();

      await this.setCabecerainsumos();
    } catch (err) {
      this.alertSwalError.title = "Error";
      this.alertSwalError.text = err.message;
      this.alertSwalError.show();
    }
  }

  async onGrabar() {
    this.accionsolicitud = 'I';
    this.modalconfirmar("Dispensar");
  }

  async onModificar() {
    this.accionsolicitud = 'M';
    this.numsolicitud = this.FormCreaSolicitud.controls.numsolicitud.value;
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

        if (this.DetalleMedicamentos.length > 0) {
          this.DetalleMedicamentos.forEach(element => {
            element.acciond = "E";
            element.usuarioelimina = this.usuario;
          })
          await this.setSolicitud();
          this.solicitudMedicamento.usuarioelimina = this.usuario;
          this.solicitudMedicamento.estadosolicitud = 110;
          this.solicitudMedicamento.soliid = this.dataPacienteSolicitud.soliid// this.FormSolicitudPaciente.value.numsolicitud;
          this.solicitudMedicamento.accion = "E";
          this.solicitudMedicamento.solicitudesdet = this.DetalleMedicamentos;

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
          if (this.DetalleInsumos.length > 0) {
            this.DetalleInsumos.forEach(element => {
              element.acciond = "E";
              element.usuarioelimina = this.usuario;
            })
            await this.setSolicitud();
            this.solicitudInsumo.usuarioelimina = this.usuario;
            this.solicitudInsumo.estadosolicitud = 110;
            this.solicitudInsumo.soliid = this.dataPacienteSolicitud.soliid// this.FormSolicitudPaciente.value.numsolicitud;
            this.solicitudInsumo.accion = "E";
            this.solicitudInsumo.solicitudesdet = this.DetalleInsumos;
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
            this.DetalleMedicamentos.splice(id, 1);
            this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // .slice(0, 20);
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
            this.DetalleInsumos.splice(id, 1);
            this.DetalleMedicamentosPaginacion = this.DetalleInsumos; // .slice(0, 20);
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
    this.medicamentosadispensar = this.DetalleMedicamentos;
    this.insumosadispensar = this.DetalleInsumos;
    this.DetalleMedicamentos_aux1 = this.DetalleMedicamentos;
    this.DetalleInsumos_aux1 = this.DetalleInsumos;

    await this.saveLoteprod();

    const Swal = require('sweetalert2');
    const result = await Swal.fire({
      title: `¿Desea ${mensaje} la Solicitud?`,
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    });

    if (!result.value) {
      return;
    }

    const { stockCorrecto, mensajeProductosSinStock } = await this.validarStock();
    if (!stockCorrecto) {
      var text = `<h2>`+this.TranslateUtil('key.mensaje.no.puede.generar.despacho')+`</h2><br/> ${mensajeProductosSinStock}`;
      Swal.fire({ html: text });
      this.verificanull = false;
      return;
    }

    this.dispensar(mensaje);
  }

  async dispensar(mensaje : string) {
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
        if (this.solicitudInsumo.solicitudesdet.length == 0 && this.solicitudMedicamento.solicitudesdet.length >= 1) {
          await this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(data => {
            this.solmedic = true;
            this.numsolmedicamento = data.solbodid;
            this.verificanull = false;
            this.tipobusqueda = null;
            /**guarda el detalle con lotes en variable medicamentosadispensar*/
            this.existesolicitud= true;
            this.imprimirsolicitud = true;
            this.imprimesolins = false;
            this.agregarproductoygrilla = false;
            this.medicamentosadispensar = this.DetalleMedicamentos;
            this.DetalleMedicamentos = [];
            this.DetalleMedicamentosPaginacion = [];
            this.cargaSolicitudadispensar(data.solbodid, false);
            this.alertSwal.title = `${mensaje} Medicamentos, Despachada y Recepcionada exitosamente, N°: ` + data.solbodid;
            this.alertSwal.text = "";
            this.alertSwal.show();
          }, err => {
            this.loading = false;
            this.alertSwalError.title = "Error";
            this.alertSwalError.text = err.message;
            this.alertSwalError.show();
          });
        } else {
          if (this.solicitudMedicamento.solicitudesdet.length == 0 && this.solicitudInsumo.solicitudesdet.length >= 1) {
            await this._solicitudService.crearSolicitud(this.solicitudInsumo).subscribe(data => {
              this.alertSwal.title = `${mensaje} Insumos, Despachada y Recepcionada exitosamente, N°: ` + data.solbodid;
              this.alertSwal.text = "";
              this.alertSwal.show();
              this.solins = true;
              this.numsolins = data.solbodid;
              this.numsolinsumo = data.solbodid;
              this.verificanull = false;
              this.tipobusqueda = null;
              this.imprimirsolicitud = true;
              this.existesolicitud = true;
              this.imprimesolins = false;
              this.agregarproductoygrilla = false;
              this.insumosadispensar = this.DetalleInsumos;
              this.DetalleInsumos = [];
              this.DetalleInsumosPaginacion = [];
              this.cargaSolicitudadispensar(data.solbodid, false);
            }, err => {
              this.loading = false;
              this.alertSwalError.title = "Error";
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

  /** Graba y busca solicitud Insumo a dispensar */
  async grabadobleSolInsumo() {
    /** declara que es una doble solicitud */
    this.doblesolicitud = true;
    this._solicitudService.crearSolicitud(this.solicitudInsumo).subscribe(async data => {
      this.insumosadispensar = this.DetalleInsumos;
      this.numsolinsumo = data.solbodid;
      this.solmedic = true;
      this.numsolins = data.solbodid;
      this.verificanull = true;
      this.imprimesolins = true;
      this.agregarproductoygrilla = false;
      this.DetalleInsumos = [];
      this.DetalleMedicamentosPaginacion = [];
      this.imprimirsolicitud = false;
      this.existesolicitud = true;

      await this._solicitudService.BuscaSolicitud(this.numsolinsumo, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
        null, null, null, null, null, this.servidor, null, 0,
        null, null, null, null, null, 60, "","").subscribe(
          response => {
            response.forEach(async data => {
              this.dataPacienteSolicitud = data;
              this.DispensarSolicitud(true);
            });
      });
    });
  }

  /** Graba y busca solicitud Medicamento a dispensar */
  async grabadobleSolMedicamento() {
    this._solicitudService.crearSolicitud(this.solicitudMedicamento).subscribe(async data => {
      this.medicamentosadispensar = this.DetalleMedicamentos;
      this.numsolmedicamento = data.solbodid;
      this.solmedic = true;
      this.numsolicitud = data.solbodid;
      this.DetalleMedicamentos = [];
      this.DetalleMedicamentosPaginacion = [];
      await this._solicitudService.BuscaSolicitud(this.numsolmedicamento, this.hdgcodigo,
        this.esacodigo, this.cmecodigo, null,null, null, null, null, null, this.servidor,
        null, 0, null, null, null, null, null, 60, "","").subscribe(
          response => {
            response.forEach(async data => {
              this.dataPacienteSolicitud = data;
              /**se manda parametro 'false' para evitar que devuelva a funcion grabadobleSolMedicamento() */
              this.DispensarSolicitud(false);
              this.confirmadobleSolicitud();
              /**termina proceso Doble Dispensacion */
            });
          });
    });
  }


  setModal(titulo: string) {

    // let ambito = this.FormCreaSolicitud.get("ambito").value

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
        id_Bodega: this.FormCreaSolicitud.controls.bodcodigo.value,
        // ambito: ambito, //this.FormCreaSolicitud.value.ambito,
        nombrepaciente: this.dataPacienteSolicitud.nombrespac,
        apepaternopac: this.dataPacienteSolicitud.apepaternopac,
        apematernopac: this.dataPacienteSolicitud.apematernopac,
        codservicioactual: this.dataPacienteSolicitud.codservicioactual,
        tipodocumento: this.dataPacienteSolicitud.tipodocpac,
        numeroidentificacion: this.dataPacienteSolicitud.numdocpac,
        buscasolicitud: "Solicitud_Paciente",
        descprod: this.descprod,
        codprod: this.codprod,
        paginaorigen: 0
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
        titulo: this.TranslateUtil('key.title.busqueda.plantilla.bodega.autopedido'),
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipoplantilla: true,
        codbodsolic: this.FormCreaSolicitud.value.bodcodigo,
        tipopedido : 2
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
      this._imprimesolicitudService.RPTImprimeSolicitudAutopedido(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, "pdf", this.numsolmedicamento, 0).subscribe(
          response => {
            this.solic1 = response[0].url;
            this._imprimesolicitudService.RPTImprimeSolicitudAutopedido(this.servidor, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, "pdf", this.numsolinsumo, 0).subscribe(
                data => {
                  this.solic2 = data[0].url;
                  var i = 0;
                  while (i < 2) {
                    if (i == 0) {
                      window.open(this.solic1, "", "");
                    } else{
                      if (i == 1) {
                        window.open(this.solic2, "", "");
                      }
                    }
                    i++;
                  }
                },
                error => {
                  this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.solicitud');
                  this.alertSwalError.show();
                  this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
                  })
                }
              );
          });
    } else {
      this._imprimesolicitudService.RPTImprimeSolicitudAutopedido(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, "pdf", this.dataPacienteSolicitud.soliid, 0).subscribe(
          response => {
            window.open(response[0].url, "", "");
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
    const productos = this.dataPacienteSolicitud.solicitudesdet;
    this.paramdespachos = [];
    var fechavto = null;
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
          this.DetalleMedicamentos_aux1.forEach(x=>{
            if(element.codmei === x.codmei){
              producto.lote = x.lote;
              producto.fechavto = x.fechavto;
            }
          })
        }
        if(element.tiporegmein === 'I'){
          this.DetalleInsumos_aux1.forEach(x=>{
            if(element.codmei === x.codmei){
              producto.lote = x.lote;
              producto.fechavto = x.fechavto;
            }
          });
        }
        producto.bodorigen = this.dataPacienteSolicitud.bodorigen;
        producto.boddestino = this.dataPacienteSolicitud.boddestino;
        producto.codservicioori = this.dataPacienteSolicitud.codservicioori;
        producto.codservicioactual = this.dataPacienteSolicitud.codservicioactual;

        this.paramdespachos.unshift(producto);
      });
      this.DespachoSolicitud = new (DespachoSolicitud);
      this.DespachoSolicitud.paramdespachos = this.paramdespachos;
      /**Graba dispensacion */
      await this._solicitudService.DespacharSolicitudAutopedido(this.DespachoSolicitud).subscribe(async response => {
        if (!this.doblesolicitud) {
          /**carga solicitud NO doble dispensada */
          this.cargaSolicitud(this.dataPacienteSolicitud.soliid);
          this.tipobusqueda = 'Total';
        }
        else {
          /** Carga detalle solicitud doble Dispensada  */
          await this._solicitudService.BuscaSolicitud(this.dataPacienteSolicitud.soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
            null, null, null, null, null, this.servidor, null,
            0, null, null, null, null, null, 60, "","").subscribe(
              async response => {
                this.verificanull = false;
                this.bloqueacantsoli = true;
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
                      element.bloqcampogrilla2 = true;
                    }
                    this.solins = true;
                    this.DetalleInsumos = this.dataPacienteSolicitud.solicitudesdet;
                    this.DetalleInsumosPaginacion = this.DetalleInsumos; // .slice(0, 20);

                    this.DetalleInsumos_aux = this.DetalleInsumos;
                    this.DetalleInsumosPaginacion_aux = this.DetalleInsumosPaginacion;

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
                      this.DetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
                      this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // .slice(0, 20)

                      this.DetalleMedicamentos_aux = this.DetalleMedicamentos;
                      this.DetalleMedicamentosPaginacion_aux = this.DetalleMedicamentosPaginacion;
                      this.ActivaBotonBuscaGrillaMedicamento = true;

                      this.loading = false;
                    }
                  }
                });
                /** Tras dispensar, Si doblesolicitud=true y doblesol=true, genera una solicitud Medicamento // */
                if (doblesol) {
                  /**vacia insumos a dispensar para asignar grilla medicamentos a dispensar */
                  this.insumosadispensar = [];
                  this.grabadobleSolMedicamento();
                }
              });
        }
      });
    }
  }

  async cargaSoldobledispensada(doblesol: boolean) {
    await this._solicitudService.BuscaSolicitud(this.dataPacienteSolicitud.soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null,
      null, null, null, null, null, this.servidor, null,
      null, null, null, null, null, null, 60, "","").subscribe(
        async response => {
          this.verificanull = false;
          response.forEach(async data => {
            this.dataPacienteSolicitud = data;
            await this.asignalotegrilla();
          });
          this.dataPacienteSolicitud.solicitudesdet.forEach(element => {
            if (element.tiporegmein == "I") {
              this.solins = true;
              this.DetalleInsumos = this.dataPacienteSolicitud.solicitudesdet
              this.DetalleInsumosPaginacion = this.DetalleInsumos; // .slice(0, 20);

              this.DetalleInsumos_aux = this.DetalleInsumos;
              this.DetalleInsumosPaginacion_aux = this.DetalleInsumosPaginacion;
              this.ActivaBotonBuscaGrillaInsumo = true;
              this.loading = false;
            } else {
              if (element.tiporegmein == "M") {
                this.solmedic = true;
                this.DetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
                this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // .slice(0, 20)

                this.DetalleMedicamentos_aux = this.DetalleMedicamentos;
                this.DetalleMedicamentosPaginacion_aux = this.DetalleMedicamentosPaginacion;
                this.ActivaBotonBuscaGrillaMedicamento = true;
                this.loading = false;
              }
            }
          });
          /** Tras dispensar, Si doblesolicitud=true y doblesol=true, genera una solicitud Medicamento // */
          if (doblesol) {
            this.insumosadispensar = [];
            this.grabadobleSolMedicamento();
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
    this.FormCreaSolicitud.get('numsolicitud').setValue(this.numsolmedicamento + " " + this.numsolinsumo);
    this.FormCreaSolicitud.get('esticod').setValue(this.dataPacienteSolicitud.estadosolicitud);
    this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitudes.dispensadas.recepcionadas.exitosas');
    this.alertSwal.text = this.TranslateUtil('key.mensaje.solicitud.medicamentos') + this.numsolmedicamento +
      ".   Solicitud Insumos, N°: " + this.numsolinsumo;
    this.alertSwal.show();
    this.loading = false;
  }

  async getProducto(tipo:number) {

    var noexisteprod : boolean = false;
    if(this.FormDetalleSolicitud.controls.codigo.value != null){
      var codProdAux = this.FormDetalleSolicitud.controls.codigo.value.toString();
    }

    switch (tipo) {
      case 1:
        if(this.DetalleMedicamentos.length>0){
          this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
          this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
          this.DetalleMedicamentos,null,null,null,null).subscribe(response => {
          })
        }else{
          noexisteprod= false;
        }
        break;

      case 2:
        if(this.DetalleInsumos.length>0){
          this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
            this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
            this.DetalleInsumos,null,null,null,null).subscribe(response => {
            }
          )
          this.loading = false;
        }else{
          noexisteprod= false;
        }
        break;
    }

    if (!noexisteprod) {
      this.codprod = this.FormDetalleSolicitud.controls.codigo.value;
      if (this.codprod === null || this.codprod === '') {
        this.onBuscarProducto();
      } else {
        var tipodeproducto = 'MIM';
        this.loading = true;
        var controlado = '';
        var controlminimo = '';
        var idBodega = 0;
        var consignacion = '';

        this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
          this.cmecodigo, this.codprod, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
          , this.usuario, null, this.servidor).subscribe(
            response => {
              if (!response.length) {
                this.loading = false;
                this.onBuscarProducto();
              } else if (response.length) {

                if (response.length > 1) {
                  if (noexisteprod === false) {
                    this.onBuscarProducto();
                  }
                } else {
                  this.loading = false;
                  this.FormDetalleSolicitud.reset();
                  this.bloqueacantsoli = false;
                  this.setProducto(response[0]);
                  this.logicaVacios();
                  this.FormDetalleSolicitud.reset();
                }
              }
            }, error => {
              this.loading = false;
            }
          );
      }
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

    const fechalote = value.split('/');
    const fechav = fechalote[0];
    const loteprod = fechalote[1];
    const cantidad = fechalote[2];
    const codmei = fechalote[3];
    this.validaLotemedicamento(loteprod, codmei).then(async (res) => {

      if (res) {
        this.DetalleMedicamentos[indx].fechavto = this.datePipe.transform(fechav, 'dd-MM-yyyy');
        this.DetalleMedicamentos[indx].lote = loteprod;
        this.DetalleMedicamentos[indx].stockorigen = parseInt(cantidad);
        await this.logicaVacios();
        if(detalle.cantsoli > detalle.cantsoli - detalle.cantdespachada){
          if(loteprod !=""){
            this.DetalleMedicamentos[indx].cantadespachar = this.DetalleMedicamentos[indx].cantadespacharresp;
            this.DetalleMedicamentosPaginacion[indx].cantadespachar = this.DetalleMedicamentos[indx].cantadespachar;
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.pendiente');
            this.alertSwalAlert.show();
            this.logicaVacios();
          }
        }else{
          if(detalle.cantsoli <0){
            if(loteprod !=""){
              this.DetalleMedicamentos[indx].cantsoli = 0;
              this.DetalleMedicamentosPaginacion[indx].cantsoli = this.DetalleMedicamentos[indx].cantsoli;
              this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.solicitada.mayor.cero');
              this.alertSwalAlert.show();
            }
          }

          if(detalle.cantsoli > parseInt(cantidad)){
            if (loteprod != '') {
              this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.saldo.lote');
              this.alertSwalAlert.text = `El saldo del lote ${detalle.lote} tiene ${cantidad}, ingresar cantidad menor`;
              this.alertSwalAlert.show();
              
              this.verificanull = false;
              
              // TODO: Preguntar si esto es necesario
              // let codigo_bodega_lote = this.BodegaMedicamentos;
              // if (detalle.consignacion == 'S') {
              //   codigo_bodega_lote = this.BodegaConsignacion
              // }
              // if (detalle.controlado == 'S') {
              //   codigo_bodega_lote = this.BodegaControlados
              // }

              // this._solicitudService
              //   .BuscaLotesProductosxBod(
              //     this.servidor,
              //     this.hdgcodigo,
              //     this.esacodigo,
              //     this.cmecodigo,
              //     codmei,
              //     0,
              //     this.FormCreaSolicitud.controls.bodcodigo.value, //codigo_bodega_lote,
              //   )
              //   .subscribe((response) => {
              //     if (!response || response.length === 0) {
              //       this.DetalleMedicamentos[indx].detallelote = [];
              //     } else {
              //       const loteSeleccionado = response.find((x) => x.lote === detalle.lote);

              //       this.DetalleMedicamentos[indx].detallelote = response;
              //       this.DetalleMedicamentos[indx].lote = loteSeleccionado.lote; // response[0].lote;
              //       this.DetalleMedicamentos[indx].fechavto = loteSeleccionado.fechavto; // response[0].fechavto;
              //       this.DetalleMedicamentos[indx].stockorigen = loteSeleccionado.cantidad; // response[0].cantidad;
              //       this.logicaVacios();
              //     }
              //   });
            }
          }
        }
      } else {

        let codigo_bodega_lote = this.BodegaMedicamentos;
        this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
          this.cmecodigo, codmei, 0, codigo_bodega_lote).subscribe(
            response => {
              if (!response || response.length === 0) {
                this.DetalleMedicamentos[indx].detallelote = [];
              } else {
                this.DetalleMedicamentos[indx].dosis = 0
                this.DetalleMedicamentos[indx].formulacion = 0;
                this.DetalleMedicamentos[indx].dias = 0;
                this.DetalleMedicamentos[indx].cantsoli = 0;
                this.DetalleMedicamentos[indx].detallelote = [];
                this.DetalleMedicamentos[indx].detallelote = response;
                this.DetalleMedicamentos[indx].lote = response[0].lote;
                this.DetalleMedicamentos[indx].fechavto = response[0].fechavto;
                this.DetalleMedicamentos[indx].stockorigen = response[0].cantidad;

                this.logicaVacios();
              }
            });
        return;
      }
    });
  }

  /**
   * Funcion que verifica si el lote y producto en Medicamento existe
   * autor: miguel.lobos@sonda.com
   * ult. fecha mod: 01-02-2021
   */
  async validaLotemedicamento(lote: string, codmei: string) {
    let validaok = false;
    for (let d of this.DetalleMedicamentos) {
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

  changeLoteinsumo(value: string, indx: number,detalle: DetalleSolicitud) {
    const fechalote = value.split('/');
    const fechav = fechalote[0];
    const loteprod = fechalote[1];
    const cantidad = fechalote[2];
    const codmei = fechalote[3];
    this.validaLoteinsumo(loteprod, codmei).then((res) => {
      if (res) {
        this.DetalleInsumos[indx].fechavto = this.datePipe.transform(fechav, 'dd-MM-yyyy');
        this.DetalleInsumos[indx].lote = loteprod;
        this.DetalleInsumos[indx].stockorigen = parseInt(cantidad);
        // this.DetalleInsumos[indx].cantsoli = 0;
        this.logicaVacios();
      } else {
        let codigo_bodega_lote = this.BodegaMedicamentos;
        this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
          this.cmecodigo, codmei, 0, codigo_bodega_lote).subscribe(
            response => {
              if (!response || response.length === 0) {
                this.DetalleInsumos[indx].detallelote = [];
              } else {
                this.DetalleInsumos[indx].detallelote = [];
                this.DetalleInsumos[indx].detallelote = response;
                this.DetalleInsumos[indx].lote = response[0].lote;
                this.DetalleInsumos[indx].fechavto = response[0].fechavto;
                // this.DetalleInsumos[indx].stockorigen = response[0].cantidad;
                this.logicaVacios();
              }
            });
        return;
      }
    }
    );
  }

  async validaLoteinsumo(lote: string, codmei: string) {
    let validaok = false;
    for (let d of this.DetalleInsumos) {
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

  async validaCodigo(valorCodigo: any) {
    this.alertSwal.title = null;
    this.alertSwal.text = null;
    let arrProductos: Array<DetalleSolicitud> = [];
    arrProductos = this.DetalleMedicamentos.concat(this.DetalleInsumos);
    const resultado_medicamnto = arrProductos.find(registro => registro.codmei === valorCodigo);
    if (resultado_medicamnto != undefined) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.articulo.repetido');
      this.alertSwalError.show();
      this.FormDetalleSolicitud.get("codigo").setValue("");
      return false;
    } else { return true; }
  }

  validaDodificagrillaMedicamentos(id: number, detalle: any) {
    if (this.DetalleMedicamentos[id].cantsoli <= 0) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.cantidad.solicitada.mayor.cero');
      this.alertSwalError.show();
      this.FormDetalleSolicitud.get("cantidad").setValue(1);
      return
    }
  }

  validaCantidadDispensada(cantidad: any) {

    this.alertSwal.title = null;
    this.alertSwal.text = null;
    // if (cantidad <= 0) {
    //   this.alertSwalError.title = "Cantidad debe ser mayor a cero";
    //   this.alertSwalError.show();
    //   this.FormDetalleSolicitud.get("cantidad").setValue(1);
    //   return
    // }
  }

  // validacantidadgrillaInsumos(id: number) {

  //   this.alertSwalError.title = null;
  //   this.alertSwalAlert.text = null;
  //   var idg = id;

  //   if (this.DetalleInsumos[idg].cantsoli <= 0) {

  //     this.alertSwalAlert.text = "La cantidad a despachar debe ser mayor a 0";
  //     this.alertSwalAlert.show();
  //     this.DetalleInsumos[idg].cantsoli = 1;
  //     this.DetalleInsumos[idg].cantadespachar = this.DetalleInsumos[idg].cantsoli;
  //   }
  // }



  /** Funciones usadas cuando se requiera asignar lote por producto */
  /** devuelve lotes de productos a grilla Medicamentos */
  LoadComboLotesMed(Articulo: Articulos) {
    let indice = 0;
    let codigo_bodega_lote = this.BodegaMedicamentos;
    if (Articulo.consignacion == 'S') {
      codigo_bodega_lote = this.BodegaConsignacion
    }
    if (Articulo.controlado == 'S') {
      codigo_bodega_lote = this.BodegaControlados
    }
    this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, Articulo.codigo, 0, codigo_bodega_lote).subscribe(
        response => {
          if (response == undefined) {
            this.DetalleMedicamentos[indice].detallelote = [];
          } else {
            this.lotesMedLength = response.length;
            this.DetalleMedicamentos[indice].detallelote = [];
            this.DetalleMedicamentos[indice].detallelote = response;
            this.DetalleMedicamentos[indice].lote = response[0].lote;
            this.DetalleMedicamentos[indice].fechavto = response[0].fechavto;
            this.DetalleMedicamentos[indice].stockorigen = response[0].cantidad;
            this.detallelotemed = response;
          }
        }
      )
  }

  /** devuelve lotes de productos a grilla Insumos */
  LoadComboLotesIns(Articulo: Articulos) {
    let indice = 0;
    let codigo_bodega_lote = this.BodegaMedicamentos;
    if (Articulo.consignacion == 'S') {
      codigo_bodega_lote = this.BodegaConsignacion
    }
    if (Articulo.controlado == 'S') {
      codigo_bodega_lote = this.BodegaControlados
    }
    this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, Articulo.codigo, 0, codigo_bodega_lote).subscribe(
        response => {
          if (response == undefined) {
            this.DetalleInsumos[indice].detallelote = [];
          } else {
            this.DetalleInsumos[indice].detallelote = [];
            this.DetalleInsumos[indice].detallelote = response;
            this.DetalleInsumos[indice].lote = response[0].lote;
            this.DetalleInsumos[indice].fechavto = response[0].fechavto;
            this.DetalleInsumos[indice].stockorigen = response[0].cantidad;
          }
        }
      )
  }

  /**
  * guarda los lotes/fechavto en array para luego setearlos en fuc
  */
  saveLoteprod() {
    const detalleproductos = this.medicamentosadispensar.concat(this.insumosadispensar);

    detalleproductos.forEach((resp) => {
      if (!resp.detallelote || resp.detallelote.length === 0) {
        return;
      }

      const detalle = new Detallelote();
      detalle.codmei = resp.codmei;
      detalle.lote = resp.lote;
      detalle.fechavto = resp.fechavto;
      this.detalleloteprod.push(detalle);
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
      await this.isEliminaMedGrilla(registro)
      await this.DetalleMedicamentos.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimmed = true;

        }
      })

    }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelimmed = false;
      await this.isEliminaMedGrilla(registro);
      await this.DetalleMedicamentos.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimmed = true;

        }
      })
    }

  }

  isEliminaMedGrilla(registro: DetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.DetalleMedicamentos) {
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
    })
  }

  async EliminaProductoDeLaGrilla2() {
    var id
    this.loading = true;
    this.DetalleMedicamentosPaginacion.forEach(detalle=>{

      if (detalle.soliid == 0 && detalle.sodeid == 0) {
        detalle.acciond = 'I';
        id = this.IdgrillaProductosMed(detalle)

        if (detalle.acciond == "I" && id >= 0 && detalle.sodeid == 0) {
          if(detalle.marcacheckgrilla === true){

            // Eliminar registro nuevo la grilla
            this.desactivabtnelimmed = false;
            this.DetalleMedicamentos.splice(id, 1);
            this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // .slice(0, 20);
            this.logicaVacios();
            this.loading = false;
            this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado.exitosamente');
            this.alertSwal.show();
            this.checkMedicamentonuevo();
            this.checkInsumosnuevo();
          }
        }
      }
      else {
        if (detalle.soliid > 0 && detalle.sodeid > 0) {
          id = this.IdgrillaProductosMed(detalle)

          if(detalle.marcacheckgrilla === true){
            this.accionsolicitud = 'M';
            this.desactivabtnelimmed = false;
            this.setCabeceramedicamentos();
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
      }
    })

  }

  IdgrillaProductosMed(registro: DetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.DetalleMedicamentos) {
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
      await this.DetalleInsumos.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimins = true;
        }
      })
    }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelimins = false;
      await this.isEliminaInsGrilla(registro);
      await this.DetalleInsumos.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimins = true;
        }
      })
    }
  }

  isEliminaInsGrilla(registro: DetalleSolicitud) {
    let indice = 0;
    for (const articulo of this.DetalleInsumos) {
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
    this.DetalleInsumosPaginacion.forEach(detalle=>{
      if (detalle.soliid == 0 && detalle.sodeid == 0) {
        detalle.acciond = 'I';
        id = this.IdgrillaProductosIns(detalle)

        if (detalle.acciond == "I" && id >= 0 && detalle.sodeid == 0) {
          if(detalle.marcacheckgrilla === true){
            // Eliminar registro nuevo la grilla

            this.desactivabtnelimins = false;
            this.DetalleInsumos.splice(id, 1);
            this.DetalleInsumosPaginacion = this.DetalleInsumos; // .slice(0, 20);
            this.logicaVacios();
            this.loading = false;
            this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado.exitosamente');
            this.alertSwal.show();
          }
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
    })
  }

  IdgrillaProductosIns(registro: DetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.DetalleInsumos) {
      if (registro.codmei === articulo.codmei) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

  async findArticuloGrillaMedicamento() {
    this.loading = true;
    if ( this.FormDetalleSolicitud.controls.codigo.touched &&
    this.FormDetalleSolicitud.controls.codigo.status !== 'INVALID') {
      var codProdAux = this.FormDetalleSolicitud.controls.codigo.value.toString();
      //Cuando la solicitud aún no se crea
      this.DetalleMedicamentos_2 = [];

      this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
      this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
        this.DetalleMedicamentos,null,null,null,null).subscribe(response => {

        this.DetalleMedicamentos_2=response;
        this.bloqueacantsoli = true;
        this.DetalleMedicamentos = [];
        this.DetalleMedicamentosPaginacion = [];

        this.DetalleMedicamentos = this.DetalleMedicamentos_2;
        this.DetalleMedicamentosPaginacion = this.DetalleMedicamentos; // .slice(0,20);
        this.ActivaBotonLimpiaBuscaMedicamento = true;
        this.loading = false;

        }
      )

    }else{
      this.limpiarCodigoMedicamento();
      this.loading = false;
      return;
    }
  }

  limpiarCodigoMedicamento() {
    this.loading = true;

    this.FormDetalleSolicitud.controls.codigo.reset();
    var codProdAux = '';

    this.DetalleMedicamentos = [];
    this.DetalleMedicamentosPaginacion = [];

    // Llenar Array Auxiliares
    this.DetalleMedicamentos = this.DetalleMedicamentos_aux;
    this.DetalleMedicamentosPaginacion = this.DetalleMedicamentosPaginacion_aux;
    this.ActivaBotonLimpiaBuscaMedicamento = false;

    this.loading = false;
  }

  async findArticuloGrillaInsumo() {
    this.loading = true;

    if ( this.FormDetalleSolicitud.controls.codigo.touched &&
    this.FormDetalleSolicitud.controls.codigo.status !== 'INVALID') {
      var codProdAux = this.FormDetalleSolicitud.controls.codigo.value.toString();
      //Cuando la solicitud aún no se crea
      this.DetalleMedicamentos_2 = [];

      this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
      this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
        this.DetalleInsumos,null,null,null,null).subscribe(response => {

          this.DetalleInsumos_2=response;
          this.bloqueacantsoli = true;
          this.DetalleInsumos = [];
          this.DetalleInsumosPaginacion = [];

          this.DetalleInsumos = this.DetalleInsumos_2;
          this.DetalleInsumosPaginacion = this.DetalleInsumos; // .slice(0,20);
          this.ActivaBotonLimpiaBuscaInsumo = true;
          this.loading = false;

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

    this.FormDetalleSolicitud.controls.codigo.reset();
    var codProdAux = '';

    this.DetalleInsumos = [];
    this.DetalleInsumosPaginacion = [];


    // Llenar Array Auxiliares
    this.DetalleInsumos = this.DetalleInsumos_aux;
    this.DetalleInsumosPaginacion = this.DetalleInsumosPaginacion_aux;
    this.ActivaBotonLimpiaBuscaInsumo = false;

    this.loading = false;
  }

  getProductoDescrip(){
    // this.loading = true;
    this.descprod = this.FormDetalleSolicitud.controls.descripcion.value;
    if (this.descprod === null || this.descprod === '') {
      return;
    } else {

      this.onBuscarProducto();
    }
  }

  BuscaProducto(tipo: number){
    this.descprod = this.FormDetalleSolicitud.controls.descripcion.value;
    this.codprod = this.FormDetalleSolicitud.controls.codigo.value;

    if(this.codprod === null && this.descprod === null ){
      return;
    }else{
      if(this.codprod != null ) {

        this.getProducto(tipo);
      }else{
        if (this.descprod != null ) {

          this.getProductoDescrip();
        }else{
          if(this.codprod != null && this.descprod != null ){

            this.onBuscarProducto();
          }
        }
      }
    }
  }

  getPacienteTipoDoc(){
    this._PacientesService.BuscaPacientesAmbito(this.hdgcodigo, this.cmecodigo, this.esacodigo,
      this.FormCreaSolicitud.controls.tipodocumento.value,
      this.FormCreaSolicitud.controls.numidentificacion.value,null,null, null,null,null,null,
      this.servidor,null,0).subscribe(
        response => {
          if(response.length === 1){
            this.dataPacienteSolicitud = response[0];
            this.imprimirsolicitud = false;
            this.tipobusqueda = 'Paciente';
            this.FormDetalleSolicitud.controls.codigo.enable();
            this.FormDetalleSolicitud.controls.descripcion.enable();
            this.FormDetalleSolicitud.controls.cantidad.enable();
            this.FormCreaSolicitud.controls.tipodocumento.disable();
            this.FormCreaSolicitud.controls.numidentificacion.disable();
            this.FormCreaSolicitud.get('codservicioactual').setValue(this.dataPacienteSolicitud.codservicioactual);
            this.logicaVacios();
            this.setDatos();
            this.BuscaDatosBodega();
          }else{
            if(response.length===0){
              this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.paciente.tipo.documento.ingresado');
              this.alertSwalAlert.show();
            }
          }

        }
      )
  }
  ActivaImprimir(){
    if(this.tipobusqueda==='Paciente'|| this.imprimirsolicitud===false){

      return false; //:false
    }
  }

  async validarStock() {
    let stockCorrecto = true;
    let mensajeProductosSinStock = ""

    for (const medicamento of this.DetalleMedicamentos) {
      const stockMedicamento = await this._creaService
        .BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, medicamento.meinid, this.FormCreaSolicitud.controls.bodcodigo.value, this.usuario, this.servidor)
        .toPromise()
        .then(stock => stock[0].stockactual);

      if(medicamento.cantsoli > stockMedicamento){
        mensajeProductosSinStock += `<p>`+this.TranslateUtil('key.saldo.articulo')+` <strong>${medicamento.codmei}</strong> `+this.TranslateUtil('key.es')+` ${stockMedicamento}</p>`;
        stockCorrecto = false;
      }
    }

    for (const insumo of this.DetalleInsumos) {
      const stockInsumo = await this._creaService
        .BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, insumo.meinid, this.FormCreaSolicitud.controls.bodcodigo.value, this.usuario, this.servidor)
        .toPromise()
        .then(stock => stock[0].stockactual);

      if(insumo.cantsoli > stockInsumo){
        mensajeProductosSinStock += `<p>`+this.TranslateUtil('key.saldo.insumo')+` <strong>${insumo.codmei}</strong> `+this.TranslateUtil('key.es')+` ${stockInsumo}</p>`;
        stockCorrecto = false;
      }
    }

    return { stockCorrecto, mensajeProductosSinStock }
  }
  
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
