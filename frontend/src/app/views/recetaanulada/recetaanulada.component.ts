import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { BodegaDestino } from 'src/app/models/entity/BodegaDestino';
import { BusquedarecetasanuladasComponent } from './busquedarecetasanuladas/busquedarecetasanuladas.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-recetaanulada',
  templateUrl: './recetaanulada.component.html',
  styleUrls: ['./recetaanulada.component.css'],
  providers: [InformesService],
})
export class RecetaanuladaComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  /**Para uso dinamico de tabs */
  @ViewChild('tabProducto', { static: false }) tabProductoTabs: TabsetComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;

  public modelopermisos               : Permisosusuario = new Permisosusuario();
  public pagina                       : number = 6;
  //Array
  public alerts                       : Array<any> = [];
  public docsidentis                  : Array<DocIdentificacion> = [];
  public tipoambitos                  : Array<TipoAmbito> = [];
  public estadosolicitudes            : Array<EstadoSolicitud> = [];
  public arrdetalleMedicamentos       : Array<DetalleSolicitud> = [];
  public arrdetalleMedicamentos_2     : Array<DetalleSolicitud> = [];
  public grillaMedicamentos           : Array<DetalleSolicitud> = [];
  public grillaInsumos                : Array<DetalleSolicitud> = [];
  //Obj
  public FormDatosPaciente            : FormGroup;
  public FormDatosProducto            : FormGroup;
  private _BSModalRef                 : BsModalRef;
  public dataPacienteSolicitud        : Solicitud = new Solicitud();// Guarda datos de la busqueda
  public solmedicamento               : Solicitud = new Solicitud();
  public solicitudMedicamento         : Solicitud = new Solicitud();
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
  public evento                       : boolean = false;

  public optMed : string = "DESC";
  public optIns : string = "DESC";

  public page :number;

  /** indica si solicitud es medicamento o insumos */
  public tieneProductos = false;

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
    public translate: TranslateService
  ) {
    this.FormDatosPaciente = this.formBuilder.group({
      tipodocumento      : [{ value: null, disabled: false }, Validators.required],
      numidentificacion  : [{ value: null, disabled: false }, Validators.required],
      numcuenta          : [{ value: null, disabled: true }, Validators.required],
      nombrepaciente     : [{ value: null, disabled: true }, Validators.required],
      edad               : [{ value: null, disabled: true }, Validators.required],
      unidad             : [{ value: null, disabled: true }, Validators.required],
      sexo               : [{ value: null, disabled: true }, Validators.required],
      ambito             : [{ value: 3, disabled: false }, Validators.required],
      estado             : [{ value: 10, disabled: false }, Validators.required],
      numsolicitud       : [{ value: null, disabled: true }, Validators.required],
      pieza              : [{ value: null, disabled: true }, Validators.required],
      cama               : [{ value: null, disabled: true }, Validators.required],
      fechahora          : [{ value: new Date(), disabled: true }, Validators.required],
      ubicacion          : [{ value: null, disabled: true }, Validators.required],
      medico             : [{ value: null, disabled: true }, Validators.required],
      bodcodigo          : [{ value: null, disabled: false }, Validators.required],
      codbodegasuministro: [{ value: null, disabled: false }, Validators.required],
      numeroreceta       : [{ value: null, disabled: true }, Validators.required],
    });
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
    this.FormDatosPaciente.disable();
    this.FormDatosProducto.disable();
    this.datosUsuario();
    /* completa combobox */
    this.BuscaBodegaDestino();
    this.getParametros();
    this.setDate();
    this.limpiar();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setSolpaciente();
    });
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
    });
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

  cargaSolicitud(solid: any) {
    const soliid = parseInt(solid);
    this.arrdetalleMedicamentos = [];
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
            this.evento = true;
          }
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = "Error";
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
      case 'Solicitud':
        this._BSModalRef = this._BsModalService.show(BusquedarecetasanuladasComponent, this.setModal(this.TranslateUtil('key.title.busqueda.recetas.anuladas')));
        this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
          if (Retorno !== undefined) {
            this.busquedaSolicitud(Retorno.soliid, busqueda);
          }
        });
        break;
    }
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
        paginaorigen: 12
      }
    };
    return dtModal;
  }

  async busquedaSolicitud(numsol, busqueda) {
    const soliid = parseInt(numsol);
    this.loading = true;
    try {
      const solicitud = await this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, 0, '', '', 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0, '', 0, "","").toPromise();
      await this.limpiar();
      const codservori = solicitud[0].codservicioori;
      this.dataPacienteSolicitud = solicitud[0];
      this.estado_aux = this.dataPacienteSolicitud.estadosolicitud;
      this.FormDatosPaciente.disable();
      // await this.BuscaBodegaDeServicio(codservori); //se desconoce su utilidad
      this.imprimirsolicitud = true;
      await this.setDatos();
      this.evento = true;
      this.loading = false;
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
        this.setProducto(RetornoProductos);
        this.FormDatosProducto.reset();
        this.loading = false;
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
                        this.FormDatosProducto.reset();
                        this.setProducto(response[0]);
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
    this.FormDatosPaciente.get('numeroreceta').setValue(this.dataPacienteSolicitud.numeroreceta);
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
      this.FormDatosPaciente.get('fechahora').setValue(this.datePipe.transform(this.dataPacienteSolicitud.fechacreacion, 'dd-MM-yyyy HH:mm:ss'));
      this.FormDatosPaciente.get('ambito').disable();
      this.FormDatosPaciente.get('estado').disable();
      this.FormDatosPaciente.get('estado').setValue(this.dataPacienteSolicitud.estadosolicitud);
      if (this.dataPacienteSolicitud.solicitudesdet.length) {
        //**Si tiene detalle de producto ejecuta funcion */
        this.cargaGrillaproductos();
      }
    }
    this.loading = false;
  }

  cargaGrillaproductos() {
    this.dataPacienteSolicitud.solicitudesdet.forEach(element => {

      this.tieneProductos = true;

      if(this.dataPacienteSolicitud.estadosolicitud == 50 || this.dataPacienteSolicitud.estadosolicitud == 60
      || this.dataPacienteSolicitud.estadosolicitud == 70 || this.dataPacienteSolicitud.estadosolicitud ==75){

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
    if (this.solmedic == true) {
      this.tabProductoTabs.tabs[0].active = true;
      this.arrdetalleMedicamentos = this.dataPacienteSolicitud.solicitudesdet;
      this.arrdetalleMedicamentos.forEach(element => {
        element.marcacheckgrilla = false;
      });
      this.ActivaBotonBuscaGrilla = true;
      this.solins = false;
    }
  }

  limpiar() {
    this.numsolmedicamento = null;
    this.numsolinsumo = null;
    this.dataPacienteSolicitud = new Solicitud();
    this.accionsolicitud = 'I';
    this.fechaactual = null;
    this.nomplantilla = null;
    this.FormDatosPaciente.reset();
    this.FormDatosProducto.reset();
    this.arrdetalleMedicamentos = [];
    this.grillaMedicamentos = [];
    this.grillaInsumos = [];
    this.solicitudMedicamento = new Solicitud();
    this.tipobusqueda = null;
    this.solmedic = false;
    this.solins = false;
    this.imprimesolins = false;
    this.desactivabtnelimmed = false;
    this.desactivabtnelimins = false;
    this.bloqbtn = false;
    this.ActivaBotonBuscaGrilla = false;
    this.ActivaBotonBuscaGrillaInsumo = false;
    this.FormDatosPaciente.disable();
    this.activaagregar = false;
    this.evento = false;
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

        this.optMed = "DESC"
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
        this.ActivaBotonBuscaGrilla = true;
      }

    } else if (detalleSolicitud.tiporegmein == "I") {
      if(this.tipobusqueda==='Solicitud' && this.solmedic) {
        /*debe ingresar solo Medicamentos*/
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.puede.ingresar.insumos');
        this.alertSwalAlert.show();
        return;
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
    cabeceraSolicitud.codservicioactual = this.dataPacienteSolicitud.codservicioactual;
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

  async setSolicitud() {
    this.fechaactual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    /**Seteamos variables cabecera Solicitud //@Mlobos */
    try {
      await this.setCabeceramedicamentos();
    } catch (err) {
      this.alertSwalError.title = "Error";
      this.alertSwalError.text = err.message;
      this.alertSwalError.show();
    }
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

  onImprimir() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.imprimir.receta'),
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
    });
  }

  ImprimirSolicitud() {
  this._imprimesolicitudService.RPTImprimeRecetaAnulada(this.servidor, this.hdgcodigo, this.esacodigo,
    this.cmecodigo, "pdf", this.dataPacienteSolicitud.soliid, this.dataPacienteSolicitud.codambito).subscribe(
      response => {
        if (response != null) {
          window.open(response[0].url, "", "");
        }
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.recetas');
        this.alertSwalError.show();
        console.log(error);
        this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
        })
      }
    );
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

                this.arrdetalleMedicamentos = this.arrdetalleMedicamentos_2;
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
    this.arrdetalleMedicamentos = [];
    this.ActivaBotonLimpiaBusca = false;
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
    this.descprod = this.FormDatosProducto.controls.descripcion.value;
    this.codprod = this.FormDatosProducto.controls.codigo.value;

    if(this.codprod === null && this.descprod === null ){
      this.onBuscarProducto();
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

  salir(){
    this.route.paramMap.subscribe(param => {
      this.router.navigate(['home']);
    })
  }​​​​​​​

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

  BuscaBodegaDestino() {
    this._BodegasService.listaBodegaDestinoSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo,this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegasdestino = response;
        }
    }, error => {
      alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.destino'));
    });
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
