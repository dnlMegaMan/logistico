import { Component, OnInit, ViewChild , HostListener, ElementRef} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { BodegasService } from '../../servicios/bodegas.service';
import { CreasolicitudesService } from '../../servicios/creasolicitudes.service';
import { Prioridades } from '../../models/entity/Prioridades';
import { PrioridadesService } from '../../servicios/prioridades.service';
import { EstadoSolicitudBodega } from '../../models/entity/EstadoSolicitudBodega';
import { EstadosolicitudbodegaService } from '../../servicios/estadosolicitudbodega.service';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Solicitud } from '../../models/entity/Solicitud';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { BusquedasolicitudesComponent } from '../busquedasolicitudes/busquedasolicitudes.component';
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { EventosSolicitudComponent } from '../eventos-solicitud/eventos-solicitud.component';
import { EventosDetallesolicitudComponent } from '../eventos-detallesolicitud/eventos-detallesolicitud.component';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { InformesService } from '../../servicios/informes.service';
import { StockProducto } from 'src/app/models/entity/StockProducto';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosBodegas } from 'src/app/models/entity/productos-bodegas';
import { ServicioUnidadBodegas } from 'src/app/models/entity/servicio-unidad-bodegas';
import { UsuariosBodegas } from 'src/app/models/entity/usuarios-bodegas';
import { EstructuraRelacionBodega } from 'src/app/models/entity/estructura-relacion-bodega';
import { EstructuraBodega } from 'src/app/models/entity/estructura-bodega';
import { BusquedaplantillasbodegaComponent } from '../busquedaplantillasbodega/busquedaplantillasbodega.component'
import { Plantillas } from 'src/app/models/entity/PlantillasBodegas';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-solicitudes-manuales',
  templateUrl: './solicitudes-manuales.component.html',
  styleUrls: ['./solicitudes-manuales.component.css'],
  providers: [CreasolicitudesService, DatePipe, InformesService]
})
export class SolicitudesManualesComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;


  public modelopermisos         : Permisosusuario = new Permisosusuario();
  public pagina                 : number = 1;
  public FormCreaSolicitud      : FormGroup;
  public FormDatosProducto      : FormGroup;
  public estadossolbods         : Array<EstadoSolicitudBodega> = [];

  public prioridades            : Array<Prioridades> = [];
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public bodegassuministro      : Array<BodegasrelacionadaAccion> = [];

  public _Solicitud             : Solicitud;   /* Solictud de creación y modificaicíón */
  public arregloDetalleProductoSolicitudPaginacion: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitud: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitudPaginacion_aux: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitud_aux: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitud_2: Array<DetalleSolicitud> = [];
  public detalleEliminar: any = null;
  public locale                 = 'es';
  public bsConfig               : Partial<BsDatepickerConfig>;
  public colorTheme             = 'theme-blue';
  public usuario                = environment.privilegios.usuario;
  public servidor               = environment.URLServiciosRest.ambiente;

  public existesolicitud        : boolean = false;
  public solicitudCentral       : boolean = false;
  public hdgcodigo              : number;
  public esacodigo              : number;
  public cmecodigo              : number;
  public _DetalleSolicitud      : DetalleSolicitud;
  public productoselec          : Articulos;
  tipoproducto                  : number = 0;
  stockbodegasolicitante        : number = 0;
  stockbodegasuministro         : number = 0;
  grabadetallesolicitud         : DetalleSolicitud[] = [];
  onClose                       : any;
  private _BSModalRef           : BsModalRef;
  bsModalRef                    : any;
  editField                     : any;
  public grabadetalle           : DetalleSolicitud[] = [];
  public activabtnlimpiagrill   : boolean = false;
  public activabtncreasolic     : boolean = false;
  public btnimprsolicitud       : boolean = false;
  public btnevento              : boolean = false;
  public activaagregar          : boolean = false;
  public activabtneliminargrilla: boolean = false;
  public codexiste              : boolean = false;
  public btnlimpiargrilla       = false;
  public activabtneliminarsolic : boolean = false;
  public loading                = false;
  public codprod                = null;
  public descprod               = null;
  public bloqcantsoli           : boolean = false;
  public desactivabtnelim       :boolean = false;
  public vacios                 = true;
  public bodtipoproducto        : string = null;

  public ActivaBotonLimpiaBusca : boolean = false;
  public ActivaBotonBuscaGrilla : boolean = false;
  public Plantilla              : Plantillas;

  // Variables Auxiliares
  public numsolicitudaux        : number = 0;
  public esticodaux             : number = 0;
  public prioridadaux           : number = 0;
  public fechaaux               : string = "";
  public bodcodigoaux           : number = 0;
  public codbodegasuministroaux : number = 0;
  public arregloDetalleProductoSolicitudPaginacionaux : Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitudaux           : Array<DetalleSolicitud> = [];
  public msj                    : boolean = false;
  public cantsolimsj            : boolean = false;
  public tipoproductoaux        : string= "";
  public tipobodega             : string = "";
  public codigobodega           : number;

  // Variables para toma de solicitud
  public verificanull           : boolean = false;
  public agregarproducto        : boolean = false;
  public estado_aux             : number = 0;
  public txtBtnGrabar           : string = "GENERAR SOLICITUD";

  public valoranterior = null;
  public xnumeropedido : boolean = false;

  // Arreglo para eliminar articulo de la grilla
  public listaDetalleEliminado: Array<DetalleSolicitud> = [];

  constructor(
    private formBuilder             : FormBuilder,
    private EstadoSolicitudBodegaService: EstadosolicitudbodegaService,
    private PrioridadesService      : PrioridadesService,
    public _BsModalService          : BsModalService,
    public localeService            : BsLocaleService,
    public datePipe                 : DatePipe,
    public _BodegasService          : BodegasService,
    public _solicitudService        : SolicitudService,
    public _creaService             : CreasolicitudesService,
    private _imprimesolicitudService: InformesService,
    public _BusquedaproductosService: BusquedaproductosService,
    private router                  : Router,
    private route                   : ActivatedRoute,
    private _bodegasService: BodegasService,
    public translate: TranslateService
  ) {
    this.FormCreaSolicitud = this.formBuilder.group({
      numsolicitud: [{ value: null, disabled: true }, Validators.required],
      esticod   : [{ value: 10, disabled: true }, Validators.required],
      hdgcodigo : [{ value: null, disabled: false }, Validators.required],
      esacodigo : [{ value: null, disabled: false }, Validators.required],
      cmecodigo : [{ value: null, disabled: false }, Validators.required],
      prioridad : [{ value: 1, disabled: false }, Validators.required],
      fecha     : [new Date(), Validators.required],
      bodcodigo : [{ value: null, disabled: false }, Validators.required],
      codbodegasuministro: [{ value: null, disabled: false }, Validators.required],
      numpedido: [{ value: null, disabled: true }, Validators.required],
    });

    // this.FormDatosProducto = this.formBuilder.group({
    //   codigo  : [{ value: null, disabled: false }, Validators.required],
    //   descripcion:[{ value: null, disabled: false}, Validators.required],
    //   cantidad: [{ value: null, disabled: false }, Validators.required]
    // });

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
    this.BuscaBodegaSolicitante();

    this.setDate();
    this.FormCreaSolicitud.controls.fecha.disable();
    this.FormDatosProducto.controls.codigo.disable();
    this.FormDatosProducto.controls.descripcion.disable();
    this.PrioridadesService.list(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.prioridades = data;
      }, err => {

      }
    );

    this.EstadoSolicitudBodegaService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.estadossolbods = data;
      }, err => {

      }
    );
  }


  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  BuscaBodegaSolicitante() {
    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegasSolicitantes = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  ActivaBtnAgregarTextBox(codbodega: number){
      this.codigobodega = codbodega;

      this.bodegassuministro.forEach(x=>{
        if(codbodega === x.bodcodigo){
          this.tipobodega = x.bodtipobodega;
          return;
        }
      })
      this.activaagregar = true;
      this.FormDatosProducto.controls.codigo.enable();
      this.FormDatosProducto.controls.descripcion.enable();

      if (this.arregloDetalleProductoSolicitud.length) {
        this.arregloDetalleProductoSolicitud.forEach(element => {
          if(this.tipobodega === 'G'){
            this._creaService.ConsultaSaldoWS(this.esacodigo,this.hdgcodigo,
              this.codigobodega,element.codmei,this.servidor).subscribe(
              response => {
                if (response != null) {
                  element.stockdestino =Number(response.Cantidad);
                }
              }
            )
          }else{
            this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, element.meinid, this.codigobodega,
              this.usuario, this.servidor).subscribe(
              response => {
                if (response != null) {
                  element.stockdestino = response[0].stockactual;
                }
              }
            )
          }
        });
      }

  }

  BuscarSolicitudes() {

    if(this._Solicitud != undefined){

      if(this._Solicitud.bandera === 1){  //Si bandera es =2 solicitud tomada
        this.ValidaEstadoSolicitud(1,'BuscaSolicitudes');
      }
    }
    this._BSModalRef = this._BsModalService.show(BusquedasolicitudesComponent, this.setModalBusquedaSolicitud());
    this._BSModalRef.content.onClose.subscribe((response_cabecera: Solicitud) => {
      if (response_cabecera != undefined) {
        this._solicitudService.BuscaSolicitud(response_cabecera.soliid, this.hdgcodigo,
        this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, 0, 0, 0, 0, 0, "",
        0,"","").subscribe(
          response => {
            if (response != null) {
              this._Solicitud = response[0];
              this.activabtnlimpiagrill = true;
              this.btnimprsolicitud = true;
              this.btnevento = true;
              this.estado_aux = this._Solicitud.estadosolicitud;
              this.FormDatosProducto.controls.codigo.enable();
              this.FormCreaSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
              this.FormCreaSolicitud.get('bodcodigo').setValue(this._Solicitud.bodorigen);
              this.BuscaBodegasSuministro(this._Solicitud.bodorigen);
              this.FormCreaSolicitud.get('codbodegasuministro').setValue(this._Solicitud.boddestino);
              this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
              this.FormCreaSolicitud.get('esticod').setValue(this._Solicitud.estadosolicitud);
              this.FormCreaSolicitud.get('numpedido').setValue(this._Solicitud.numpedido);
              this.FormCreaSolicitud.get('prioridad').setValue(this._Solicitud.prioridadsoli);
              this.existesolicitud = true;
              this.arregloDetalleProductoSolicitudPaginacion = [];
              this.arregloDetalleProductoSolicitud = [];
              this.arregloDetalleProductoSolicitudPaginacionaux = [];
              this.arregloDetalleProductoSolicitudaux = [];
              if(this._Solicitud.tipobodsuministro === 'G') {
                this.xnumeropedido = true;
              }
              this._Solicitud.solicitudesdet.forEach(x=>{
                if(x.tipobodsuministro === 'G'){
                  this.xnumeropedido = true;
                  this._creaService.ConsultaSaldoWS(this.esacodigo,this.hdgcodigo,
                    this._Solicitud.boddestino,x.codmei,
                    this.servidor).subscribe(
                    response => {
                      if (response != null) {
                        x.stockdestino = Number(response.Cantidad);
                      }
                    });
                }
                this.arregloDetalleProductoSolicitud.unshift(x);
              });

              this.arregloDetalleProductoSolicitud.forEach(x=>{
                if(this._Solicitud.estadosolicitud === 10){
                  x.bloqcampogrilla = true;
                }else{
                  x.bloqcampogrilla = false;
                }
              })

              // SET VARIABLES AUXILIARES
              this.numsolicitudaux        = this._Solicitud.soliid;
              this.esticodaux             = this._Solicitud.estadosolicitud;
              this.prioridadaux           = this._Solicitud.prioridadsoli;
              this.fechaaux               = this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy');
              this.bodcodigoaux           = this._Solicitud.bodorigen;
              this.codbodegasuministroaux = this._Solicitud.boddestino;

              this.arregloDetalleProductoSolicitudaux = this.arregloDetalleProductoSolicitud;
              this.arregloDetalleProductoSolicitudPaginacionaux = this.arregloDetalleProductoSolicitudPaginacion;

              this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
              this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;

              this.checkProdnuevo();
              if (this._Solicitud.estadosolicitud === 10){
                this.existesolicitud = true;
                this.activabtneliminargrilla = true;
                this.activabtneliminarsolic = true;
                this.FormDatosProducto.controls.descripcion.enable();
                this.ActivaBotonBuscaGrilla = true;
                this.bloqcantsoli = false;
                this.activaagregar = true;
              } else {
                this.existesolicitud = false;
                this.activabtnlimpiagrill = false;
                this.activaagregar = false;
                this.activabtneliminargrilla = false;
                this.activabtneliminarsolic = false;
                this.ActivaBotonBuscaGrilla = false;
                this.FormDatosProducto.controls.descripcion.disable();
                this.bloqcantsoli = true;
              }
              if(this._Solicitud.bandera === 2){ //Si bandera es =2 solicitud tomada
                this.verificanull = false;
                this.agregarproducto = false;
                this.existesolicitud = false;
                this.bloqcantsoli = true;
                this.FormCreaSolicitud.disable();
                this.FormDatosProducto.disable();
                this.arregloDetalleProductoSolicitud.forEach(x=>{
                  x.bloqcampogrilla = false;
                  x.bloqcampogrilla2 = false;
                })
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                this.alertSwalAlert.show();
              }else{
                this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
              }

              if(this._Solicitud.tipobodsuministro === "G"){
                this.FormCreaSolicitud.disable();
                this.FormDatosProducto.disable();
                this.activaagregar = false;
                this.activabtneliminarsolic = false;
                this.solicitudCentral = false;
                this.btnevento = false;
                this.bloqcantsoli = true;
                this.arregloDetalleProductoSolicitud.forEach(element=>{
                  element.bloqcampogrilla = false;
                });
              }
              this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;//.slice( 0,20);
            }
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
        origen: 'Otros'
      }
    };
    return dtModal;
  }

  /**
   * Agrega el producto a la grilla y si es necesario lo agrega al inventario de la bodega
   * solicitante en caso de que no exista en esta
   */
  async alTenerSeleccionadoArticulo(articuloSeleccionado: Articulos) {
    if (articuloSeleccionado === null || articuloSeleccionado === undefined) {
      throw new Error('Articulo seleccionado es null o undefined');
    }

    this.loading = true;
    let articulosBodegaSolicitante: Articulos[] = [];
    try {
      articulosBodegaSolicitante = await this._BusquedaproductosService
        .BuscarArticulosFiltros(
          this.hdgcodigo, this.esacodigo, this.cmecodigo, articuloSeleccionado.codigo, null,
          null, null, null, 'MIM', this.FormCreaSolicitud.get('bodcodigo').value, '', '', '',
          this.usuario, null, this.servidor,
        )
        .toPromise();
    } catch (error) {
      this.loading = false;
      console.error('[ERROR BUSCAR PRODUCTO EN BODEGA SOLICITANTE]:  ', error);
      alert('Error al buscar articulo en bodega solicitante');
      return;
    }

    if (articulosBodegaSolicitante.length === 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.producto.no.existe.bodega.solicitante');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.pregunta.seguro.desea.agregar.producto');

      const respuesta = await this.alertSwalAlert.show();
      if (!respuesta.value) {
        this.loading = false;
        return;
      }

      if (this.bodtipoproducto === 'M' && articuloSeleccionado.tiporegistro !== 'M') {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.bodega.permite.solo.medicamentos');
        await this.alertSwalAlert.show();
        return;
      }

      if (this.bodtipoproducto === 'I' && articuloSeleccionado.tiporegistro !== 'I') {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.bodega.permite.solo.insumos');
        await this.alertSwalAlert.show();
        return;
      }

      this.tipoproductoaux = articuloSeleccionado.tiporegistro;
      this.productoselec = articuloSeleccionado;
      this.FormDatosProducto.reset();

      try {
        await this.agregarArticuloABodegaSolicitante(articuloSeleccionado);
      } catch (error) {
        this.loading = false;
        console.error('[ERROR AGREGAR PRODUCTO EN BODEGA SOLICITANTE]:  ', error);
        alert('Error al agregar el producto a la grilla');
        return;
      }

      await this.agregarArticuloAGrilla(articuloSeleccionado);

      this.loading = false;
    } else {
      if (!articuloSeleccionado.vigencia) {
        const Swal = require('sweetalert2');
        const result = await Swal.fire({
          title: articuloSeleccionado.mensaje,
          text: this.TranslateUtil('key.mensaje.pregunta.desea.continuar'),
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
        });

        if (result.value) {
          this.productoselec = articuloSeleccionado;
          this.FormDatosProducto.reset();
          await this.agregarArticuloAGrilla(articuloSeleccionado);
        }
      } else {
        this.productoselec = articuloSeleccionado;
        this.FormDatosProducto.reset();
        await this.agregarArticuloAGrilla(articuloSeleccionado);
      }

      this.loading = false;
    }
  }

  private async agregarArticuloABodegaSolicitante(articuloBodegaSuministro: Articulos) {
    // PREPARAR INFO DEL PRODUCTO
    const idBodega = this.FormCreaSolicitud.get('bodcodigo').value;
    const producto_nuevo = new (ProductosBodegas);

    producto_nuevo.accion = "I";
    producto_nuevo.bodid = idBodega;
    producto_nuevo.controlminimo = "N";
    producto_nuevo.glosaproducto = articuloBodegaSuministro.descripcion;
    producto_nuevo.hdgcodigo = this.hdgcodigo;
    producto_nuevo.meinid = articuloBodegaSuministro.mein;
    producto_nuevo.mameincodmei = articuloBodegaSuministro.codigo;
    producto_nuevo.nivelreposicion = 0;
    producto_nuevo.ptoasignacion = 0;
    producto_nuevo.ptoreposicion = 0;
    producto_nuevo.stockactual = 0;
    producto_nuevo.stockcritico = 0;
    producto_nuevo.principioactivo = articuloBodegaSuministro.principioactivo;
    producto_nuevo.presentacion = articuloBodegaSuministro.presentacion;
    producto_nuevo.formafarma = articuloBodegaSuministro.formafarma;
    producto_nuevo.glosaunidad = articuloBodegaSuministro.glosaunidaddespacho;
    producto_nuevo.glosatipoproducto = articuloBodegaSuministro.desctiporegistro;
    producto_nuevo.stockcriticoresp = producto_nuevo.stockcritico;
    producto_nuevo.nivelreposicionresp = producto_nuevo.nivelreposicion;
    producto_nuevo.controlminimoresp = producto_nuevo.controlminimo;
    producto_nuevo.bloqcampogrilla = true;

    // GRABAR LOS CAMBIOS EN LA BODEGA
    var _bodega_guardar = new (EstructuraBodega);
    var _bodega_productos_guardar: ProductosBodegas[] = [];
    var _bodega_servicio_guardar: ServicioUnidadBodegas[] = [];
    var _bodega_usuarios_guardar: UsuariosBodegas[] = [];
    var _bodega_relacion_guardar: EstructuraRelacionBodega[] = [];

    _bodega_guardar.accion = "M";

    _bodega_guardar.hdgcodigo = this.hdgcodigo;
    _bodega_guardar.esacodigo = this.esacodigo;
    _bodega_guardar.cmecodigo = this.cmecodigo;
    _bodega_guardar.codbodega = this.FormCreaSolicitud.get('bodcodigo').value;
    _bodega_guardar.tipoproducto = this.tipoproductoaux;
    this.bodegasSolicitantes.forEach(element => {
      if (element.bodcodigo === _bodega_guardar.codbodega){
        _bodega_guardar.estado = element.bodestado;
        _bodega_guardar.desbodega = element.boddescripcion;
        _bodega_guardar.tipobodega = element.bodtipobodega;
        _bodega_guardar.modificable = element.bodmodificable;
        _bodega_guardar.fbodfraccionable = element.bodfraccionable;
      }
    });

    _bodega_guardar.glosatipobodega = null;
    _bodega_guardar.glosatiproducto = null;
    _bodega_guardar.servidor = this.servidor;
    _bodega_guardar.fbodfraccionable = (producto_nuevo as any).fraccionable;

    _bodega_productos_guardar[0] = producto_nuevo;
    _bodega_guardar.productosbodega = _bodega_productos_guardar;
    _bodega_guardar.serviciosunidadbodega = _bodega_servicio_guardar;
    _bodega_guardar.usuariosbodega = _bodega_usuarios_guardar;
    _bodega_guardar.relacionbodegas = _bodega_relacion_guardar;

    await this._bodegasService.guardarEstructuraBodegas(_bodega_guardar).toPromise();

    this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.agregado')+" a " + _bodega_guardar.desbodega;
    this.alertSwal.show();
  }

  private async agregarArticuloAGrilla(articuloSeleccionado: Articulos) {
    // OBTENER STOCK
    try {
      // Busca el stock en la bodega de bodega solicitante
      this.stockbodegasolicitante = await this._creaService
        .BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, articuloSeleccionado.mein, this.FormCreaSolicitud.value.bodcodigo, this.usuario, this.servidor)
        .toPromise()
        .then((stock) => stock[0].stockactual);
    }
    catch(err) {
      console.error('[ERROR BUSCAR STOCK PRODUCTO EN BODEGA SOLICITANTE] ', err);
      alert(`Error al buscar stock de producto con código: ${articuloSeleccionado.mein}`);
      return;
    };

  // TODO: Aclarar porque se hacia esta distincion por codigo y si aplica aún
    //   if(this.FormCreaSolicitud.value.codbodegasuministro!=2 &&
    //     this.FormCreaSolicitud.value.codbodegasuministro != 3 &&
    //     this.FormCreaSolicitud.value.codbodegasuministro !=18 &&
    //     this.FormCreaSolicitud.value.codbodegasuministro != 1
    //     ){
    //     this.alertSwalAlert.title = "No existe stock en bodega Suministro para el producto buscado";
    //     this.alertSwalAlert.text = "Puede que el producto no exista en la bodega de Suministro";
    //     this.alertSwalAlert.show();
    //   }
    // };

    // AGREGAR A LA GRILLA
    const DetalleMovimiento = new (DetalleSolicitud);
    DetalleMovimiento.codmei = articuloSeleccionado.codigo;
    DetalleMovimiento.meindescri = articuloSeleccionado.descripcion;
    DetalleMovimiento.stockorigen = this.stockbodegasolicitante;

    if(this.tipobodega === 'G'){
      this._creaService.ConsultaSaldoWS(this.esacodigo,this.hdgcodigo,
        this.codigobodega,articuloSeleccionado.codigo,this.servidor).subscribe(
        response => {
          if (response != null) {
            DetalleMovimiento.stockdestino =Number(response.Cantidad);
          }
        }
      )
    }else{
      this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, articuloSeleccionado.mein, this.codigobodega,
        this.usuario, this.servidor).subscribe(
         response => {
          if (response != null) {
            DetalleMovimiento.stockdestino = response[0].stockactual;
          }
         }
       )
    }

    DetalleMovimiento.stockdestino = this.stockbodegasuministro;
    DetalleMovimiento.meinid = articuloSeleccionado.mein;
    DetalleMovimiento.descunidadmedida = articuloSeleccionado.desunidaddespacho;
    DetalleMovimiento.usuariomodifica = this.usuario;
    DetalleMovimiento.cantsoli = null;
    DetalleMovimiento.sodeid = 0;
    DetalleMovimiento.soliid = 0;
    DetalleMovimiento.acciond = "I";
    DetalleMovimiento.cantadespachar = 0;
    DetalleMovimiento.cantdespachada = 0;
    DetalleMovimiento.cantdevolucion = 0;
    DetalleMovimiento.cantrecepcionado = 0;
    DetalleMovimiento.pendientedespacho = 0;
    DetalleMovimiento.dias = 0;
    DetalleMovimiento.dosis = 0;
    DetalleMovimiento.formulacion = 0;
    DetalleMovimiento.marca = "I";
    DetalleMovimiento.bloqcampogrilla = true;

    this.grabadetalle.unshift(DetalleMovimiento);
    this.activabtnlimpiagrill = true;
    this.activabtneliminargrilla = true;

    const indx = this.arregloDetalleProductoSolicitud.findIndex(x => x.codmei === articuloSeleccionado.codigo, 1);
    if (indx >= 0) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
      this.alertSwalError.show();
      this.codexiste = true;
    } else if (this.codexiste == false){
      this.arregloDetalleProductoSolicitud.unshift(DetalleMovimiento);
      this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;
      this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
      this.arregloDetalleProductoSolicitudaux = this.arregloDetalleProductoSolicitud;
      this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
      this.arregloDetalleProductoSolicitudPaginacionaux = this.arregloDetalleProductoSolicitudPaginacion;
      this.ActivaBotonBuscaGrilla = true;
      this.checkProdnuevo();
    }

    this.activabtncreasolic = !this.existesolicitud

    this.logicaVacios();

    this.validaCantidad();
  }

  private buscarProductoEnModal() {
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((articuloSeleccionado: Articulos | undefined) => {
      if (articuloSeleccionado === undefined) {
        return;
      }

      // this.stockbodegasolicitante = 0;
      // this.stockbodegasuministro  = 0;
      this.alTenerSeleccionadoArticulo(articuloSeleccionado);
    });

  }

  validaCantidad() {
    if(this.arregloDetalleProductoSolicitud.length) {
      for(let dat of this.arregloDetalleProductoSolicitud) {
        if(dat.cantsoli <= 0) {
          if(dat.cantsoli <0){
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.cero');
            this.alertSwalAlert.show();
          }
          this.activabtncreasolic = false;
          this.existesolicitud  = false;
          dat.cantsoli = 0;
          break;
        } else {
          this.activabtncreasolic = true;
          this.existesolicitud  = true;
        }
      }
      this.logicaVacios();
    } else {
      this.activabtncreasolic = false;
      this.existesolicitud  = false;
      this.logicaVacios();
    }

  }

  setModalBusquedaProductos() {
    this.codprod = this.FormDatosProducto.controls.codigo.value;
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.productos'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Medico',
        id_Bodega: this.FormCreaSolicitud.value.codbodegasuministro,
        codprod: this.codprod,
        descprod: this.descprod
      }
    };
    return dtModal;
  }

  cambio_cantidad(id: number, property: string, registro: DetalleSolicitud){
      this.arregloDetalleProductoSolicitudaux.forEach(element => {
        if(registro.soliid === element.soliid){
          if(registro.cantsoli !== element.cantsoli){
            this.cantsolimsj = true;
          }
        }
      });

      this.validaCantidad();
      if (this.arregloDetalleProductoSolicitudPaginacion[id]["sodeid"] == 0) {
        this.arregloDetalleProductoSolicitudPaginacion[id]["acciond"] = "I";
        this.arregloDetalleProductoSolicitud[id][property] = this.arregloDetalleProductoSolicitudPaginacion[id][property];
      } else {
        this.arregloDetalleProductoSolicitudPaginacion[id]["acciond"] = "M";
        this.arregloDetalleProductoSolicitud[id][property] = this.arregloDetalleProductoSolicitudPaginacion[id][property];
      }
  }

  limpiar() {
    const Swal = require('sweetalert2');
    if(
      this.numsolicitudaux        !== this.FormCreaSolicitud.get('numsolicitud').value ||
      this.esticodaux             !== this.FormCreaSolicitud.get('esticod').value ||
      this.prioridadaux           !== this.FormCreaSolicitud.get('prioridad').value ||
      this.fechaaux               !== this.FormCreaSolicitud.get('fecha').value ||
      this.bodcodigoaux           !== this.FormCreaSolicitud.get('bodcodigo').value ||
      this.codbodegasuministroaux !== this.FormCreaSolicitud.get('codbodegasuministro').value ){
      this.msj = true;
    }

    if(this.arregloDetalleProductoSolicitudPaginacionaux.length !== this.arregloDetalleProductoSolicitudPaginacion.length ||
    this.arregloDetalleProductoSolicitudaux.length !== this.arregloDetalleProductoSolicitud.length ){
      this.msj = true;
    }

    if(this.msj || this.cantsolimsj){
      Swal.fire({
        title: this.TranslateUtil('key.button.limpiar.L'),
        text: this.TranslateUtil('key.mensaje.pregunta.seguro.desea.limpiar.campos'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {

          if(this._Solicitud != undefined){
            if(this._Solicitud.bandera != 2){
              this.ValidaEstadoSolicitud(1,'limpiar');
            }
          }
          this.FormCreaSolicitud.reset();
          this.arregloDetalleProductoSolicitudPaginacion = [];
          this.arregloDetalleProductoSolicitud = [];
          this.FormCreaSolicitud.get('fecha').setValue(new Date());
          this.existesolicitud = false;
          this.FormCreaSolicitud.controls["esticod"].setValue(10);
          this.FormCreaSolicitud.controls["prioridad"].setValue(1);
          this.grabadetalle = [];
          this.activabtnlimpiagrill = false;
          this.activabtncreasolic = false;
          this.existesolicitud = false;
          this.btnimprsolicitud = false;
          this.btnevento = false;
          this.activaagregar = false;
          this.activabtneliminargrilla = false;
          this.FormDatosProducto.reset();
          this.FormDatosProducto.controls.codigo.disable();
          this.FormDatosProducto.controls.descripcion.disable();
	        this.ActivaBotonBuscaGrilla = false;

          this.numsolicitudaux        = 0;
          this.esticodaux             = 0;
          this.prioridadaux           = 0;
          this.fechaaux               = "";
          this.bodcodigoaux           = 0;
          this.codbodegasuministroaux = 0;
          this.arregloDetalleProductoSolicitudPaginacionaux = [];
          this.arregloDetalleProductoSolicitudaux = [];
          this.arregloDetalleProductoSolicitudPaginacion_aux = [];
          this.arregloDetalleProductoSolicitud_aux = [];
          this.stockbodegasuministro = null;
          this.stockbodegasolicitante = null;
          this.descprod = null;
          this.codprod = null;
          this.txtBtnGrabar = "GENERAR SOLICITUD";
          this._Solicitud = undefined;

          this.FormCreaSolicitud.controls.prioridad.enable();
          this.FormCreaSolicitud.controls.bodcodigo.enable();
          this.FormCreaSolicitud.controls.codbodegasuministro.enable();
          this.bloqcantsoli = false;
          this.solicitudCentral = true;
          this.xnumeropedido = false;
        }
      });
    }else{
      if(this.FormCreaSolicitud.controls.esticod.value != 39){
        this.ValidaEstadoSolicitud(1,'salir');
      }
      this.FormCreaSolicitud.reset();
      this.arregloDetalleProductoSolicitudPaginacion = [];
      this.arregloDetalleProductoSolicitud = [];
      this.FormCreaSolicitud.get('fecha').setValue(new Date());
      this.existesolicitud = false;
      this.FormCreaSolicitud.controls["esticod"].setValue(10);
      this.FormCreaSolicitud.controls["prioridad"].setValue(1);
      this.grabadetalle = [];
      this.activabtnlimpiagrill = false;
      this.activabtncreasolic = false;
      this.existesolicitud = false;
      this.btnimprsolicitud = false;
      this.btnevento = false;
      this.activaagregar = false;
      this.activabtneliminargrilla = false;
      this.FormDatosProducto.reset();
      this.FormDatosProducto.controls.codigo.disable();
      this.FormDatosProducto.controls.descripcion.disable();
      this.ActivaBotonBuscaGrilla = false;
      this.xnumeropedido = false;
      this.numsolicitudaux        = 0;
      this.esticodaux             = 0;
      this.prioridadaux           = 0;
      this.fechaaux               = "";
      this.bodcodigoaux           = 0;
      this.codbodegasuministroaux = 0;
      this.arregloDetalleProductoSolicitudPaginacionaux = [];
      this.arregloDetalleProductoSolicitudaux = [];
      this.arregloDetalleProductoSolicitudPaginacion_aux = [];
      this.arregloDetalleProductoSolicitud_aux = [];
      this.stockbodegasuministro = null;
      this.stockbodegasolicitante = null;
      this.descprod = null;
      this.codprod = null;
      this.txtBtnGrabar = this.TranslateUtil('key.button.generar.solicitud');
      this._Solicitud = undefined;

      this.FormCreaSolicitud.controls.prioridad.enable();
      this.FormCreaSolicitud.controls.bodcodigo.enable();
      this.FormCreaSolicitud.controls.codbodegasuministro.enable();
      this.bloqcantsoli = false;
      this.solicitudCentral = true;
    }
  }

  isEliminaMed(registro: DetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.arregloDetalleProductoSolicitud) {
      if (registro.codmei === articulo.codmei) {

        return indice;
      }
      indice++;
    }
    return -1;
  }

  ConfirmaGenerarSolicitud() {
    this.loading = true;
    this.existesolicitud = false;
    this.txtBtnGrabar = "Generando..."
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.generar.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.creacion.solicitud'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.generarSolicitud();
      } else {
        this.existesolicitud = true;
        this.txtBtnGrabar = this.TranslateUtil('key.button.generar.solicitud');
        this.loading = false;
      }
    })
  }

  generarSolicitud() {
    this.loading = true;
    /* vienen seteadas en el ambiente */
    var fechaajuste = new Date();
    var fechaactual = this.datePipe.transform(fechaajuste, 'yyyy-MM-dd');

    this._Solicitud = new Solicitud();
    this._Solicitud.soliid = 0;
    this._Solicitud.hdgcodigo = this.hdgcodigo;
    this._Solicitud.esacodigo = this.esacodigo;
    this._Solicitud.cmecodigo = this.cmecodigo;
    this._Solicitud.cliid = 0;
    this._Solicitud.tipodocpac = 0;
    this._Solicitud.numdocpac = null;
    this._Solicitud.apepaternopac = null;
    this._Solicitud.apematernopac = null;
    this._Solicitud.nombrespac = null;
    this._Solicitud.codambito = 0;
    this._Solicitud.estid = 0;
    this._Solicitud.ctaid = 0;
    this._Solicitud.edadpac = 0;
    this._Solicitud.tipoedad = null;
    this._Solicitud.codsexo = 0;
    this._Solicitud.codservicioori = 0;
    this._Solicitud.codserviciodes = 0;
    this._Solicitud.bodorigen = this.FormCreaSolicitud.value.bodcodigo;
    this._Solicitud.boddestino = this.FormCreaSolicitud.value.codbodegasuministro;
    this._Solicitud.tipoproducto = this.tipoproducto;
    this._Solicitud.tiporeceta = null;
    this._Solicitud.numeroreceta = 0;
    this._Solicitud.tipomovim = 'C';
    this._Solicitud.tiposolicitud = 30;
    this._Solicitud.estadosolicitud = this.FormCreaSolicitud.controls.esticod.value;
    this._Solicitud.prioridadsoli = this.FormCreaSolicitud.value.prioridad;
    this._Solicitud.tipodocprof = 0;
    this._Solicitud.numdocprof = null;
    this._Solicitud.alergias = null;
    this._Solicitud.cama = null;
    this._Solicitud.fechacreacion = fechaactual;
    this._Solicitud.usuariocreacion = this.usuario;
    this._Solicitud.fechamodifica = null;
    this._Solicitud.usuariomodifica = null;
    this._Solicitud.fechaelimina = null;
    this._Solicitud.usuarioelimina = null;
    this._Solicitud.fechacierre = null;
    this._Solicitud.usuariocierre = null;
    this._Solicitud.observaciones = null;
    this._Solicitud.ppnpaciente = 0;
    this._Solicitud.convenio = null;
    this._Solicitud.diagnostico = null;
    this._Solicitud.nombremedico = null;
    this._Solicitud.cuentanumcuenta = '0';
    this._Solicitud.bodorigendesc = null;
    this._Solicitud.boddestinodesc = null;
    this._Solicitud.usuario = this.usuario;
    this._Solicitud.servidor = this.servidor;
    this._Solicitud.accion = "I";
    this._Solicitud.origensolicitud = 30;
    this._Solicitud.pagina = this.pagina;

    this.grabadetallesolicitud = [];


    this.arregloDetalleProductoSolicitud.forEach(element => {
      var detalleSolicitud = new DetalleSolicitud;
      detalleSolicitud.sodeid = 0;
      detalleSolicitud.soliid = 0; //num solicitud
      detalleSolicitud.codmei = element.codmei;
      detalleSolicitud.meinid = element.meinid;
      detalleSolicitud.dosis = 0;
      detalleSolicitud.formulacion = 0;
      detalleSolicitud.dias = 0;
      detalleSolicitud.cantsoli = element.cantsoli; //cantidad solicitada
      detalleSolicitud.cantdespachada = 0;
      detalleSolicitud.cantdevolucion = 0;
      detalleSolicitud.estado = 1; // Solicitado
      detalleSolicitud.observaciones = null;
      detalleSolicitud.fechamodifica = null;
      detalleSolicitud.usuariomodifica = null;
      detalleSolicitud.fechaelimina = null;
      detalleSolicitud.usuarioelimina = null;
      detalleSolicitud.viaadministracion = null;
      detalleSolicitud.meindescri = null;
      detalleSolicitud.stockorigen = this.stockbodegasolicitante;
      detalleSolicitud.stockdestino = this.stockbodegasuministro;
      detalleSolicitud.acciond = element.acciond;
      detalleSolicitud.cantadespachar = 0;
      detalleSolicitud.pendientedespacho = 0;
      detalleSolicitud.repoid = 0;
      detalleSolicitud.marca = element.marca;   // S o N
      detalleSolicitud.acciond = 'I';

      this.grabadetallesolicitud.push(detalleSolicitud);

    });
    this.listaDetalleEliminado = [];
    this._Solicitud.solicitudesdet = this.grabadetallesolicitud;
    this._solicitudService.crearSolicitud(this._Solicitud).subscribe(
      response => {
        if(response.idpedidofin700 >0 ){
          this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.creada')+" N°: ".concat(response['solbodid'] + "\n N°Pedido Fin700: ".concat(response['idpedidofin700']));
        }else{
          this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.creada')+" N°: ".concat(response['solbodid']);
        }
        this.alertSwal.show();
        this._solicitudService.BuscaSolicitud(response.solbodid, this.hdgcodigo, this.esacodigo,
          this.cmecodigo,null, null, null, null, null, null, this.servidor, null, null, null,
          null, null, null, null,0,"","").subscribe(
            respuestasolicitud => {
              if( respuestasolicitud === null || respuestasolicitud === undefined ){
                return;
              }else {
                this._Solicitud = respuestasolicitud[0];
                this.estado_aux = this._Solicitud.estadosolicitud;
                this.FormCreaSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
                this.FormCreaSolicitud.get('bodcodigo').setValue(this._Solicitud.bodorigen);
                this.BuscaBodegasSuministro(this._Solicitud.bodorigen);
                this.FormCreaSolicitud.get('codbodegasuministro').setValue(this._Solicitud.boddestino);
                this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
                this.FormCreaSolicitud.get('esticod').setValue(this._Solicitud.estadosolicitud);
                this.FormCreaSolicitud.get('prioridad').setValue(this._Solicitud.prioridadsoli);
                this.FormCreaSolicitud.get('numpedido').setValue(this._Solicitud.numpedido);

                this.existesolicitud= true;
                this.activabtncreasolic = false;
                this.activabtneliminarsolic = true;
                this.btnimprsolicitud = true;
                this.btnevento = true;
                this.arregloDetalleProductoSolicitudPaginacion = [];
                this.arregloDetalleProductoSolicitud = [];
                this._Solicitud.solicitudesdet.forEach(x=>{
                  if(x.tipobodsuministro === 'G'){
                    this.xnumeropedido = true;
                    this._creaService.ConsultaSaldoWS(this.esacodigo,this.hdgcodigo,
                      this._Solicitud.boddestino,x.codmei,
                      this.servidor).subscribe(
                      response => {
                        if (response != null) {
                          x.stockdestino = Number(response.Cantidad);
                        }
                      });
                  }
                });
                this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet;
                this.arregloDetalleProductoSolicitud.forEach(x=>{
                  if(this._Solicitud.estadosolicitud === 10){
                    x.bloqcampogrilla = true;
                  }else{
                    x.bloqcampogrilla = false;
                  }
                })
                this.txtBtnGrabar = this.TranslateUtil('key.button.generar.solicitud');

                this.loading = false;

                if(this._Solicitud.bandera === 2){
                  this.verificanull = false;
                  this.agregarproducto = false;
                  this.FormCreaSolicitud.disable();
                  this.FormDatosProducto.disable();
                  this.arregloDetalleProductoSolicitud.forEach(x=>{
                    x.bloqcampogrilla = false;
                    x.bloqcampogrilla2 = false;

                  this._creaService.ConsultaSaldoWS(this.esacodigo,this.hdgcodigo,
                        this.codigobodega, x.codmei,this.servidor).subscribe(
                        response => {
                          x.stockdestino =Number(response.Cantidad);
                        }
                      )
                  });

                  this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                  this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');

                  this.alertSwalAlert.show();

                }else{
                  this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
                }

                if(this._Solicitud.tipobodsuministro === "G"){
                  this.FormCreaSolicitud.disable();
                  this.FormDatosProducto.disable();
                  this.activaagregar = false;
                  this.activabtneliminarsolic = false;
                  this.solicitudCentral = false;
                  this.bloqcantsoli = true;
                  this.xnumeropedido = true;
                  this.arregloDetalleProductoSolicitud.forEach(element=>{
                    element.bloqcampogrilla = false;
                  });
                }

                /** */

                if (this.arregloDetalleProductoSolicitud.length) {
                  this.arregloDetalleProductoSolicitud.forEach(element => {
                    if(this.tipobodega === 'G'){
                      this._creaService.ConsultaSaldoWS(this.esacodigo,this.hdgcodigo,
                        this.codigobodega,element.codmei,this.servidor).subscribe(
                        response => {
                          element.stockdestino =Number(response.Cantidad);
                        }
                      )
                    }else{
                      this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, element.meinid, this.codigobodega,
                        this.usuario, this.servidor).subscribe(
                        response => {
                          element.stockdestino = response[0].stockactual;
                        }
                      )
                    }
                  });
                }

                /** */
                this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;//.slice(0,20);

              }
            }
          );
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.solicitud');
        this.alertSwalError.show();
      }
    );
  }

  ConfirmaModificarSolicitud() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.modificar.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.modificacion.solicitud'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.detalleEliminar = null;
        this.ModificarSolicitud("M");
      }
    })
  }

  ModificarSolicitud(Accion: String) {
    /* Si se modifica _Solictud ya contiene la información original */
    /* vienen seteadas en el ambiente */
    var fechaactual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    /* Sólo se setean los valores posoble de actualizar de la cabecera */
    this._Solicitud.bodorigen = this.FormCreaSolicitud.value.bodcodigo;
    this._Solicitud.boddestino = this.FormCreaSolicitud.value.codbodegasuministro;
    this._Solicitud.estadosolicitud = this.FormCreaSolicitud.controls.esticod.value;
    this._Solicitud.prioridadsoli = this.FormCreaSolicitud.value.prioridad;
    this._Solicitud.fechamodifica = fechaactual;
    this._Solicitud.usuariomodifica = this.usuario;
    if (Accion == 'E') {
      this._Solicitud.fechaelimina = fechaactual;
      this._Solicitud.usuarioelimina = this.usuario;
      this._Solicitud.fechacierre = fechaactual;
      this._Solicitud.usuariocierre = this.usuario;
      this._Solicitud.observaciones = this.TranslateUtil('key.mensaje.solicitud.eliminada');

      this._Solicitud.accion = "E";
    }

    if (Accion == 'M') {
      this._Solicitud.accion = "M";
      this._Solicitud.fechamodifica = fechaactual;
      this._Solicitud.usuariomodifica = this.usuario;
    }
    this._Solicitud.usuario = this.usuario;
    this._Solicitud.servidor = this.servidor;
    /* Detalle de solicitu, solo viaja la modificada y eliminada */
    this.grabadetallesolicitud = [];

    this.arregloDetalleProductoSolicitud.forEach(element => {
      var _detalleSolicitud = new DetalleSolicitud;

      _detalleSolicitud = element;

      if (element.acciond == 'M') {
        _detalleSolicitud.codmei = element.codmei;
        _detalleSolicitud.meinid = element.meinid;
        _detalleSolicitud.cantsoli = element.cantsoli; //cantidad solicitada
        _detalleSolicitud.fechamodifica = fechaactual;
        _detalleSolicitud.usuariomodifica = this.usuario;
        _detalleSolicitud.stockorigen = this.stockbodegasolicitante;
        _detalleSolicitud.stockdestino = this.stockbodegasuministro;
        _detalleSolicitud.acciond = "M";
        _detalleSolicitud.marca = element.marca;   // S o N
        this.grabadetallesolicitud.unshift(_detalleSolicitud);
      }

      if (element.acciond == 'E') {
        _detalleSolicitud.observaciones = this.TranslateUtil('key.mensaje.registro.eliminado');

        _detalleSolicitud.fechaelimina = fechaactual;
        _detalleSolicitud.usuarioelimina = this.usuario;
        _detalleSolicitud.marca = element.marca;   // S o N
        _detalleSolicitud.acciond = "E";

        this.grabadetallesolicitud.unshift(_detalleSolicitud);
      }

      if (element.acciond == 'I') {
        _detalleSolicitud.observaciones = this.TranslateUtil('key.mensaje.registro.eliminado');

        _detalleSolicitud.fechaelimina = fechaactual;
        _detalleSolicitud.usuarioelimina = this.usuario;
        _detalleSolicitud.marca = element.marca;   // S o N
        _detalleSolicitud.acciond = "I";

        this.grabadetallesolicitud.unshift(_detalleSolicitud);
      }
    });

    this.listaDetalleEliminado = [];
    this._Solicitud.solicitudesdet = this.grabadetallesolicitud;
    this._solicitudService.ModificaSolicitud(this._Solicitud).subscribe(
      response => {
        this.alertSwal.title = "Solicitud "+ this._Solicitud.soliid +" modificada";
        this.alertSwal.show();

        this.FormCreaSolicitud.get('numsolicitud').setValue(response.solbodid);

        /* Recarga la solictud para verificar que guardó la información en forma correcta */
        this._solicitudService.BuscaSolicitud(response.solbodid, this.hdgcodigo, this.esacodigo,
          this.cmecodigo, null, null, null, null, null, null, this.servidor, null, null, null,
          null, null, null, null,0,"","").subscribe(
            respuestasolicitud => {
              this._Solicitud = respuestasolicitud[0];
              this.estado_aux = this._Solicitud.estadosolicitud;
              this.activabtncreasolic = false;
              this.activabtncreasolic = true;
              this.btnevento = true;
              this.FormCreaSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
              this.FormCreaSolicitud.get('bodcodigo').setValue(this._Solicitud.bodorigen);
              this.BuscaBodegasSuministro(this._Solicitud.bodorigen);
              this.FormCreaSolicitud.get('codbodegasuministro').setValue(this._Solicitud.boddestino);
              this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
              this.FormCreaSolicitud.get('esticod').setValue(this._Solicitud.estadosolicitud);
              this.FormCreaSolicitud.get('prioridad').setValue(this._Solicitud.prioridadsoli);
              this.FormCreaSolicitud.get('numpedido').setValue(this._Solicitud.numpedido);

              this._Solicitud.solicitudesdet.forEach(x=>{
                if(x.tipobodsuministro === 'G'){
                  this.xnumeropedido = true;
                }
              });

              this.arregloDetalleProductoSolicitudPaginacion = [];
              this.arregloDetalleProductoSolicitud = [];
              this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet;
              this.arregloDetalleProductoSolicitud.forEach(x=>{
                if(this._Solicitud.estadosolicitud === 10){
                  x.bloqcampogrilla = true;
                }else{
                  x.bloqcampogrilla = false;
                }
              });

              this._Solicitud.solicitudesdet.forEach(x=>{
                if(x.tipobodsuministro === 'G'){
                  this.xnumeropedido = true;
                  this._creaService.ConsultaSaldoWS(this.esacodigo,this.hdgcodigo,
                    this._Solicitud.boddestino,x.codmei,
                    this.servidor).subscribe(
                    response => {
                      if (response != null) {
                        x.stockdestino = Number(response.Cantidad);
                      }
                    });
                }
              });
              this.grabadetalle = [];
              if(this._Solicitud.estadosolicitud === 10 || this._Solicitud.estadosolicitud ==40){
                this.existesolicitud =true;
              }else{
                this.existesolicitud = false;
              }

              if(this._Solicitud.estadosolicitud === 39){
                this.verificanull = false;
                this.agregarproducto = false;
                this.FormCreaSolicitud.disable();
                this.FormDatosProducto.disable();
                this.arregloDetalleProductoSolicitud.forEach(x=>{
                  x.bloqcampogrilla = false;
                  x.bloqcampogrilla2 = false;
                })
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');

                this.alertSwalAlert.show();


              }else{
                this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
              }

              if(this._Solicitud.tipobodsuministro === "G"){
                this.FormCreaSolicitud.disable();
                this.FormDatosProducto.disable();
                this.activaagregar = false;
                this.activabtneliminarsolic = false;
                this.solicitudCentral = false;
                this.btnevento = false;
                this.bloqcantsoli = true;
                this.arregloDetalleProductoSolicitud.forEach(element=>{
                  element.bloqcampogrilla = false;
                });
              }

              this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;//.slice( 0,20);
            },
            error => {

            }
          );
      },
      error => {

        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.modificar.solicitud');
        this.alertSwalError.show();
      }
    );
  }

  ConfirmaEliminarSolicitud() {
    // sE CONFIRMA Eliminar Solicitud
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.eliminar.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion.solicitud'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ModificarSolicitud("E");
      }
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
        _Solicitud: this._Solicitud,
        _DetalleSolicitud: this._DetalleSolicitud,
      }
    };
    return dtModal;
  }

  eventosDetalleSolicitud(registroDetalle: DetalleSolicitud) {
    this._DetalleSolicitud = new (DetalleSolicitud);
    this._DetalleSolicitud = registroDetalle;

    this._BSModalRef = this._BsModalService.show(EventosDetallesolicitudComponent, this.setModalEventoDetalleSolicitud());
    this._BSModalRef.content.onClose.subscribe((Respuesta: any) => {

    })
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
        _Solicitud: this._Solicitud,
      }
    };
    return dtModal;
  }

  eventosSolicitud() {
    // sE CONFIRMA Eliminar Solicitud
    this._BSModalRef = this._BsModalService.show(EventosSolicitudComponent, this.setModalEventoSolicitud());
    this._BSModalRef.content.onClose.subscribe((Respuesta: any) => {

    })
  }

  BuscaBodegasSuministro(codigobodegasolicitante: number) {
    // if( this.verificaGrilla() ) {
      var servidor = environment.URLServiciosRest.ambiente;
      var usuario = environment.privilegios.usuario;
      this.bodegassuministro = [];

      this.bodegasSolicitantes.forEach(x => {
        if(codigobodegasolicitante === x.bodcodigo){
          this.bodtipoproducto = x.bodtipoproducto;
        }
      });

      this._BodegasService.listaBodegaRelacionadaAccion(this.hdgcodigo, this.esacodigo, this.cmecodigo, usuario, servidor, codigobodegasolicitante,1).subscribe(
        data => {
          this.bodegassuministro = data;
        }, err => {

        }
      );
    // } else { return; }

  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(startItem, endItem);
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
    this._imprimesolicitudService.RPTImprimeSolicitudBodega(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, "pdf", this._Solicitud.soliid).subscribe(
        response => {
          if (response != null) {
            window.open(response[0].url, "", "");
          }
        },
        error => {

          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.listado');
          this.alertSwalError.show();
          this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
          })
        }
      );

  }

  /**
   * Funcion que remueve todos los elementos nuevos o con acciond='I'
   * 15-12-2020 @MLobos
   */
  async limpiarGrilla() {
    let temparregloDetalleProductoSolicitud: Array<DetalleSolicitud> = [];
    if (this.arregloDetalleProductoSolicitud.length){
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.pregunta.borrar.todos.nuevos.elementos');
      this.alertSwalAlert.show().then(resp => {
        if (resp.value){
          for(let d of this.arregloDetalleProductoSolicitud){
            if(d.acciond != 'I') {
              temparregloDetalleProductoSolicitud.push(d)
            }
          }
        }

        this.arregloDetalleProductoSolicitud = temparregloDetalleProductoSolicitud;
        this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;
        this.btnlimpiargrilla = this.arregloDetalleProductoSolicitud.length?true:false;

        this.validaCantidad();
        this.checkProdnuevo();
      });
    }
  }

    /**funcion que habilita/desactiva btnLimpiargrilla */
  checkProdnuevo() {
    const tipogrilla = this.arregloDetalleProductoSolicitud;
    if (tipogrilla.length || tipogrilla === null) {
      for(let d of tipogrilla){
        if(d.acciond === 'I') {
          this.btnlimpiargrilla = true;
          break;
        } else {
          this.btnlimpiargrilla = false;
        }
      }
    } else{ this.btnlimpiargrilla = false; }
  }

  async getProducto(producto: any) {
    let noexisteprod : boolean = false;
    let codProdAux = producto.toString();
    this.arregloDetalleProductoSolicitud_2 = [];

    if(this.FormCreaSolicitud.controls.esticod.value ===10 ){
      noexisteprod = false;
    }

    if(this.arregloDetalleProductoSolicitud.length > 0){
      await this._solicitudService
        .BuscarProductoPorLike(
          this.hdgcodigo, this.esacodigo, this.cmecodigo,codProdAux,1, this.usuario, this.servidor,
          this.arregloDetalleProductoSolicitud, null, null, null, null,
        )
        .toPromise()
        .then(respuesta => {
          this.arregloDetalleProductoSolicitud_2 = respuesta;

          noexisteprod = !respuesta || respuesta.length > 0;

          if(noexisteprod === true){
            this.arregloDetalleProductoSolicitud = [];
            this.arregloDetalleProductoSolicitudPaginacion = [];
            this.arregloDetalleProductoSolicitud = this.arregloDetalleProductoSolicitud_2;
            this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud; //.slice(0,20);
            this.ActivaBotonLimpiaBusca = true;
            this.loading = false;
          }
        });
      } else {
        noexisteprod= false;
      }

      if (noexisteprod) {
        return;
      }

      this.codprod = this.FormDatosProducto.controls.codigo.value;
      if (this.codprod === null || this.codprod === '') {
        return;
      }

      try {
        this.loading = true;

        // Busca producto directamente en bodega de suministro
        const articulos = await this._BusquedaproductosService
        .BuscarArticulosFiltros(
          this.hdgcodigo, this.esacodigo, this.cmecodigo, this.codprod, null, null, null, null,
          'MIM', this.FormCreaSolicitud.get('codbodegasuministro').value, '', '', '', this.usuario,
          null, this.servidor,
        )
        .toPromise()

        this.loading = false;

        if (articulos == null || articulos.length === 0) {
          this.buscarProductoEnModal();
          return;
        }

        if(articulos.length > 1 && noexisteprod === false) {
          this.buscarProductoEnModal();
          return;
        }

        // SOLO HAY 1 PRODUCTO
        if(!articulos[0].vigencia){
          const Swal = require('sweetalert2');
          const result = await Swal.fire({
            title: articulos[0].mensaje,
            text: this.TranslateUtil('key.mensaje.pregunta.desea.continuar'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
          });

          if (result.value) {
            this.productoselec = articulos[0];
            this.FormDatosProducto.reset();
            await this.alTenerSeleccionadoArticulo(articulos[0]);
          }
        } else {
          this.productoselec = articulos[0];
          this.FormDatosProducto.reset();
          await this.alTenerSeleccionadoArticulo(articulos[0]);
          // this.focusField.nativeElement.focus();
        }
      } catch (error) {
        console.error('[ERROR AGREGAR PRODUCTO POR CODIGO]: ', error)
        alert('Error al agregar producto');
      }
      finally {
        this.loading = false;
      }
  }

  async CambioCheck(registro: DetalleSolicitud,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      this.listaDetalleEliminado.unshift(registro);
     }else{
      var i = this.listaDetalleEliminado.indexOf( registro );
      if ( i !== -1 ) {
        this.listaDetalleEliminado.splice( i, 1 );
      }
    }
  }

  isEliminaInsGrilla(registro: DetalleSolicitud) {
    let indice = 0;
    for (const articulo of this.arregloDetalleProductoSolicitud) {
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

  EliminaProductoDeLaGrilla2() {
    if(this.listaDetalleEliminado.length){
      for (const element of this.listaDetalleEliminado) {
        var i = this.arregloDetalleProductoSolicitud.indexOf( element );
        if ( i !== -1 ) {
          if (element.sodeid > 0) {
            this.arregloDetalleProductoSolicitud[i].acciond = 'E';
            this.grabadetalle = [];
            this.ModificarSolicitud("M");
          } else {
            this.arregloDetalleProductoSolicitud.splice( i, 1 );
            this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;//.slice(0,20);
            this.logicaVacios();
          }
        }
      }
    }
  }

  async logicaVacios() {
    this.vaciosProductos();
    if (this.vacios === true) {
      this.activabtncreasolic = false;
    }
    else {

      /**
       * 25/01/2022: desactiva botón crear si no se selecciona bodega.(@mlobosh)
       */
      if (this.FormCreaSolicitud.controls.bodcodigo.value === 0 ){
        this.activabtncreasolic = false;

      } else {
        this.activabtncreasolic = true;

      }

    }

  }

  vaciosProductos() {
    if (this.arregloDetalleProductoSolicitudPaginacion.length) {
      for (var data of this.arregloDetalleProductoSolicitudPaginacion) {
        if (data.cantsoli <= 0 || data.cantsoli === null) {
          this.vacios = true;
          return;
        } else {
          this.vacios = false;
        }
      }
    }else{
      this.vacios = true;
    }
  }

  async findArticuloGrilla() {
    const codigoProducto: string | null = this.FormDatosProducto.get('codigo')!.value;

    if (!codigoProducto || codigoProducto.trim() === '') {
      this.limpiarCodigo();
      this.loading = false;
      return;
    }

    try {
      this.loading = true;
      this.arregloDetalleProductoSolicitud_2 = [];

      const response = await this._solicitudService
        .BuscarProductoPorLike(
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          codigoProducto,
          1,
          this.usuario,
          this.servidor,
          this.arregloDetalleProductoSolicitud,
          null,
          null,
          null,
          null,
        )
        .toPromise();

      if (response == null) {
        this.loading = false;
        return;
      }

      this.arregloDetalleProductoSolicitud_2 = response;
      this.arregloDetalleProductoSolicitud = [];
      this.arregloDetalleProductoSolicitudPaginacion = [];
      this.arregloDetalleProductoSolicitud = this.arregloDetalleProductoSolicitud_2;
      this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud; //.slice(0,20);
      this.ActivaBotonLimpiaBusca = true;
    } catch (error) {
      alert('Error al buscar artículo en grilla.');
    } finally {
      this.loading = false;
    }
  }

  limpiarCodigo() {
    this.loading = true;

    this.FormDatosProducto.controls.codigo.reset();
    var codProdAux = '';

    this.arregloDetalleProductoSolicitud = [];
    this.arregloDetalleProductoSolicitudPaginacion = [];

    // Llenar Array Auxiliares
    this.arregloDetalleProductoSolicitud = this.arregloDetalleProductoSolicitud_aux;
    this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitudPaginacion_aux;
    this.ActivaBotonLimpiaBusca = false;

    this.loading = false;
  }

  salir() {
    const Swal = require('sweetalert2');

    if(
      this.numsolicitudaux        !== this.FormCreaSolicitud.get('numsolicitud').value ||
      this.esticodaux             !== this.FormCreaSolicitud.get('esticod').value ||
      this.prioridadaux           !== this.FormCreaSolicitud.get('prioridad').value ||
      this.fechaaux               !== this.FormCreaSolicitud.get('fecha').value ||
      this.bodcodigoaux           !== this.FormCreaSolicitud.get('bodcodigo').value ||
      this.codbodegasuministroaux !== this.FormCreaSolicitud.get('codbodegasuministro').value ){
      this.msj = true;
    }

    if(this.arregloDetalleProductoSolicitudPaginacionaux.length !== this.arregloDetalleProductoSolicitudPaginacion.length ||
    this.arregloDetalleProductoSolicitudaux.length !== this.arregloDetalleProductoSolicitud.length ){
      this.msj = true;
    }

    if(this.msj){
      Swal.fire({
        title: this.TranslateUtil('key.button.limpiar.L'),
        text: this.TranslateUtil('key.mensaje.pregunta.seguro.desea.limpiar.campos'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
          if(this._Solicitud != undefined){
            if(this._Solicitud.bandera != 2){
              this.ValidaEstadoSolicitud(1,'salir');
            }
          }
          this.route.paramMap.subscribe(param => {
            this.router.navigate(['home']);
          })
        }
      });
    }else{
      if(this._Solicitud != undefined){
        if(this._Solicitud.bandera != 2){
          this.ValidaEstadoSolicitud(1,'salir');
        }
      }
      this.route.paramMap.subscribe(param => {
        this.router.navigate(['home']);
      })
    }
  }

  getProductoDescrip() {
    this.descprod = this.FormDatosProducto.controls.descripcion.value;
    if (this.descprod === null || this.descprod === '') {
      return;
    } else {
      this.buscarProductoEnModal();
    }
  }

  BuscaProducto( codigo: any, descripcion: any ){
    // this.descprod = this.FormDatosProducto.controls.descripcion.value;
    // this.codprod = this.FormDatosProducto.controls.codigo.value;
    this.descprod = descripcion;
    this.codprod = codigo;
    if(this.codprod === null && this.descprod === null ){
      return;
    }else{
      if(this.codprod !== null ) {
        this.getProducto(this.codprod);
      }else{
        if (this.descprod !== null ) {
          this.getProductoDescrip();
        }else{
          if(this.codprod != null && this.descprod != null ){
            this.buscarProductoEnModal();
          }
        }
      }
    }
  }

  BuscarPlantillas() {
    this.loading = true
    var stock1 :StockProducto;

    this._BSModalRef = this._BsModalService.show(BusquedaplantillasbodegaComponent, this.setModalBusquedaPlantilla());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
    let bodegaO : number = this.FormCreaSolicitud.controls.bodcodigo.value;
    let bodegaD : number = this.FormCreaSolicitud.controls.codbodegasuministro.value;
      this._BodegasService.BuscaPlantillas(this.servidor, sessionStorage.getItem('Usuario'), this.hdgcodigo, this.esacodigo,
        this.cmecodigo, response.planid, '', '', '', bodegaO, bodegaD, '', '', 1,"").subscribe(
          response_plantilla=> {
            if (response_plantilla.length !== 0) {
              this.loading = true;
              if (response_plantilla.length > 0) {
                this.Plantilla = response_plantilla[0];

                this.Plantilla.plantillasdet.forEach(element => {
                  const indx = this.arregloDetalleProductoSolicitudPaginacion.findIndex(x => x.codmei === element.codmei, 1);
                  if(indx < 0){
                    var temporal = new DetalleSolicitud;
                    temporal.acciond ='I';
                    temporal.codmei = element.codmei;
                    this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
                    this.cmecodigo, element.codmei, null, null, null, null, 'MIM',
                    this.FormCreaSolicitud.controls.bodcodigo.value, '', '', '', this.usuario,
                    null, this.servidor).subscribe(response => {
                      if (response != null) {
                        temporal.descunidadmedida = response[0].desunidaddespacho
                      }
                    });
                    temporal.meinid = element.meinid;
                    this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, element.meinid, this.FormCreaSolicitud.value.bodcodigo,
                    this.usuario, this.servidor).subscribe(
                      response_stock=> {
                      this.stockbodegasolicitante =response_stock[0].stockactual;
                      temporal.stockorigen=response_stock[0].stockactual;
                      }
                    )
                    temporal.meindescri = element.meindescri;

                    this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, element.meinid, this.FormCreaSolicitud.value.codbodegasuministro,
                    this.usuario, this.servidor).subscribe(stock2=> {
                      this.stockbodegasuministro = stock2[0].stockactual;
                      temporal.stockdestino = stock2[0].stockactual;
                    })
                    temporal.cantdespachada = 0;
                    temporal.cantrecepcionado = 0;
                    temporal.cantsoli = element.cantsoli;
                    temporal.cantdevolucion = 0;
                    temporal.bloqcampogrilla = true;
                    temporal.nomplantilla = this.Plantilla.plandescrip;
                    temporal.marca = "I";
                    temporal.soliid = 0;
                    temporal.sodeid = 0;

                    this.arregloDetalleProductoSolicitud.unshift(temporal);
                    this.loading = false;
                  }
                });

                this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;//.slice(0, 20);
                this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
                this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
                this.ActivaBotonBuscaGrilla = true;
                this.logicaVacios();
              }
            }
            this.loading = false;
          }
        );
    });

    this.loading = false;

  }

  setModalBusquedaPlantilla() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.plantilla'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipoplantilla: true,
        codsolicitante: this.FormCreaSolicitud.value.bodcodigo,
        codsuministro: this.FormCreaSolicitud.value.codbodegasuministro,
        tipopedido: 1
      }
    };
    return dtModal;
  }

  ValidaEstadoSolicitud(bandera: number, nada:string){

    var recetaid : number = 0;
    var soliid   : number = 0;
    if(this._Solicitud != undefined){
      if(this._Solicitud.soliid === undefined){
        soliid = 0;
      }else{
        soliid = this._Solicitud.soliid;
      }
    } else {
      soliid = 0;
    }


    this._solicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,
      ' ',recetaid,bandera).subscribe(
      response => { });
  }

  ngOnDestroy(){

    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }

  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {​​​​​​​​

    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
  }​​

  /**
   * alerta de objetos en grilla tras cambio bodega
   * @mlobos
   *
   * 24/1/2022
   *  se agrega validacion cuando se cambia bodega solicitante = 0
   *  mlobosh@sonda.com
  */
  async verificaSuministros( value: number ) {
    if( value !== this.valoranterior ) {
      if( this.arregloDetalleProductoSolicitudPaginacion.length > 0 ) {

        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.existen.objetos.grilla');
        this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.pregunta.desea.cambiar.bodega');
        this.alertSwalAlert.show().then( (val) => {

          if( val.value ) {
            if (this.FormCreaSolicitud.controls.bodcodigo.value === 0 ){
              this.activabtncreasolic = false;
              return;

            } else {
              this.ActivaBtnAgregarTextBox(this.FormCreaSolicitud.value.codbodegasuministro);
              return true;

            }



          }else{
            this.FormCreaSolicitud.controls.codbodegasuministro.setValue(this.valoranterior);
            return false;
          }

        });


      } else {
        this.ActivaBtnAgregarTextBox(this.FormCreaSolicitud.value.codbodegasuministro);
        return true;

      }

    }
  }

  /**
   * 24/1/2022
   *  se agrega validacion cuando se cambia bodega solicitante = 0
   *  mlobosh@sonda.com
   */
  async verificaSolicitante( value: number ) {
    if( value !== this.valoranterior ) {

      if( this.arregloDetalleProductoSolicitudPaginacion.length > 0 ) {

        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.existen.objetos.grilla');
        this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.pregunta.desea.cambiar.bodega');
        this.alertSwalAlert.show().then( (val) => {

          if( val.value ) {
            if (value === 0 ){
              this.activabtncreasolic = false;
              return;

            } else {
              this.BuscaBodegasSuministro(this.FormCreaSolicitud.value.bodcodigo);
              return true;

            }
          }else{
            this.FormCreaSolicitud.controls.bodcodigo.setValue(this.valoranterior);
            return false;

           }

        });

      } else {
        this.BuscaBodegasSuministro(this.FormCreaSolicitud.value.bodcodigo);
        return true;

      }
    }
  }​​​​​​
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
