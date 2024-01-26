import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { BodegasService } from '../../servicios/bodegas.service';
import { EstadoSolicitud } from '../../models/entity/EstadoSolicitud';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { CreasolicitudesService } from '../../servicios/creasolicitudes.service';
import { Prioridades } from '../../models/entity/Prioridades';
import { PrioridadesService } from '../../servicios/prioridades.service';
import { EstadoSolicitudBodega } from '../../models/entity/EstadoSolicitudBodega';
import { EstadosolicitudbodegaService } from '../../servicios/estadosolicitudbodega.service';
import { SolicitudService } from '../../servicios/Solicitudes.service'
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
import { DespachoSolicitud } from '../../models/entity/DespachoSolicitud';
import { DespachoDetalleSolicitud } from 'src/app/models/entity/DespachoDetalleSolicitud';
import { BusquedaplantillasbodegaComponent } from '../busquedaplantillasbodega/busquedaplantillasbodega.component'
import { Plantillas } from 'src/app/models/entity/PlantillasBodegas';
import { DetallePlantillaBodega } from 'src/app/models/entity/DetallePlantillaBodega';
import { EstructuraBodegaServicio } from 'src/app/models/entity/estructura-bodega-servicio';
import { observable } from 'rxjs';
import { Detalleproducto } from 'src/app/models/producto/detalleproducto';
import { convertActionBinding } from '@angular/compiler/src/compiler_util/expression_converter';
import { Detallelote } from '../../models/entity/Detallelote';

declare var $: any;

@Component({
  selector: 'app-despachocostoservicio',
  templateUrl: './despachocostoservicio.component.html',
  styleUrls: ['./despachocostoservicio.component.css'],
  providers: [CreasolicitudesService, DatePipe, InformesService]
})
export class DespachocostoservicioComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos         : Permisosusuario = new Permisosusuario();
  public FormCreaSolicitud      : FormGroup;
  public FormDespachoSolicitud  : FormGroup;
  public estadossolbods         : Array<EstadoSolicitudBodega> = [];
  public estadossolicitudes     : Array<EstadoSolicitud> = [];
  public tiposderegistros       : Array<TipoRegistro> = [];
  public prioridades            : Array<Prioridades> = [];
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public bodegassuministro      : Array<BodegasrelacionadaAccion> = [];
  public varDetalleSolicitud    : Array<DetalleSolicitud> = [];
  public _Solicitud             : Solicitud;   /* Solictud de creación y modificaicíón */
  public arregloDetalleProductoSolicitudPaginacion: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitud: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitudPaginacion_aux: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitud_aux: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitud_2: Array<DetalleSolicitud> = [];
  public arrProdadespachar      : Array<DetalleSolicitud> = [];
  public detalleEliminar        : any = null;
  public locale                 = 'es';
  public bsConfig               : Partial<BsDatepickerConfig>;
  public colorTheme             = 'theme-blue';
  public usuario                = environment.privilegios.usuario;
  public servidor               = environment.URLServiciosRest.ambiente;
  public elimininaproductogrilla: boolean = false;
  public existesolicitud        : boolean = false;
  public hdgcodigo              : number;
  public esacodigo              : number;
  public cmecodigo              : number;
  public _DetalleSolicitud      : DetalleSolicitud;
  public productoselec          : Articulos;
  tipoproducto                  : number = 0;
  stockbodegasolicitante        : number = 0;
  stockbodegasuministro         : number = 0;
  grabadetallesolicitud         : DetalleSolicitud[] = [];
  private _BSModalRef           : BsModalRef;
  onClose                       : any;
  bsModalRef                    : any;
  editField                     : any;
  public grabadetalle           : DetalleSolicitud[] = [];
  public tipobusqueda           = null;
  public loading                = false;
  public DespachoSolicitud      : DespachoSolicitud;
  public listaDetalleDespacho   : Array<DespachoDetalleSolicitud> = [];
  public desactivabtnelim       : boolean = false;
  public nomplantilla           : string;
  public codigoingresado        : boolean = false;
  public cantidadingresada      : boolean = false;
  public activabtnprodplant     : boolean = false;
  public codprod                = null;
  public cantmed                : number = 0;
  public activabtncreasolic     : boolean = false;
  paramrecepcion                : DespachoDetalleSolicitud[]=[];
  public activabtnplant         : boolean = false;
  descprod: any;
  public codexiste              : boolean = false;
  public desactivabtnagregar    : boolean = false;
  public ListaEstructuraServicioBodegas : EstructuraBodegaServicio[]=[];
  public bloqueacantsoli        : boolean = false;
  public serviciocodigo         : number = null;
  public plantilla              : Plantillas = new Plantillas();
  public stockbodega            : number = 0;
  public detalleslotes          : Detallelote[] = [];
  public verificanull           = false;
  public vacios                 = true;
  public vaciolote              : boolean = true;
  public ActivaBotonLimpiaBusca : boolean = false;
  public ActivaBotonBuscaGrilla : boolean = false;
  public lotesMedLength         : number;

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
    public _BusquedaproductosService: BusquedaproductosService,
    private _imprimesolicitudService: InformesService,
    private _buscasolicitudService: SolicitudService
  ) {

    this.FormCreaSolicitud = this.formBuilder.group({
      numsolicitud: [{ value: null, disabled: false }, Validators.required],
      esticod   : [{ value: 10, disabled: false }, Validators.required],
      hdgcodigo : [{ value: null, disabled: false }, Validators.required],
      esacodigo : [{ value: null, disabled: false }, Validators.required],
      cmecodigo : [{ value: null, disabled: false }, Validators.required],
      prioridad : [{ value: 1, disabled: false }, Validators.required],
      fecha     : [new Date(), Validators.required],
      bodcodigo : [{ value: null, disabled: false }, Validators.required],
      codbodegasuministro: [{ value: null, disabled: false }, Validators.required],
      bsservid  : [{ value: null, disabled: false }, Validators.required],
      glosa     : [{ value: null, disabled: false }, Validators.required],
    });

    this.FormDespachoSolicitud = this.formBuilder.group({
      codigoproducto: [{ value: null, disabled: false }, Validators.required],
      descripcion   : [{ value: null, disabled: false }, Validators.required],
      cantidad      : [{ value: null, disabled: false }, Validators.required]
    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.BuscaBodegaSolicitante();

    this.setDate();
    this.FormCreaSolicitud.controls.numsolicitud.disable();
    this.FormCreaSolicitud.controls.esticod.disable();

    this.PrioridadesService.list(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.prioridades = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.EstadoSolicitudBodegaService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.estadossolbods = data;
      }, err => {
        console.log(err.error);
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
        if (response != null){
          this.bodegasSolicitantes = response;
        }
      },
      error => {
        alert("Error al Buscar Bodegas de cargo");
      }
    );
  }

  // BuscaBodegaSuministro(codigo_eve_origen: number, codbodega_solicitante: number) {
  //   this._BodegasService.listaBodegaRelacionadaAccion(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor, codbodega_solicitante, 1).subscribe(
  //     response => {
  //       this.bodegassuministro = response;
  //     },
  //     error => {
  //       alert("Error al Buscar Bodegas de Destino");
  //     }
  //   );
  // }

  BuscarSolicitudes() {
    this._BSModalRef = this._BsModalService.show(BusquedasolicitudesComponent, this.setModalBusquedaSolicitud());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) { }
      else {

        this._solicitudService.BuscaSolicitud(response.soliid, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0, "",60,"","").subscribe(
          response_solicitud => {

            this.SeleccionaBodega(response_solicitud[0].bodorigen);

            this._Solicitud = response_solicitud[0];
            this.FormCreaSolicitud.get('bsservid').setValue(response_solicitud[0].codservicioori);

            // this.desactivabtnelim = true;
            this.FormCreaSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
            this.FormCreaSolicitud.get('bodcodigo').setValue(this._Solicitud.bodorigen);
            this.BuscaBodegasSuministro(this._Solicitud.bodorigen);
            // this.FormCreaSolicitud.get('codbodegasuministro').setValue(this._Solicitud.boddestino);
            this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
            this.FormCreaSolicitud.get('esticod').setValue(this._Solicitud.estadosolicitud);
            this.FormCreaSolicitud.get('prioridad').setValue(this._Solicitud.prioridadsoli);
            this.FormCreaSolicitud.get('glosa').setValue(this._Solicitud.observaciones);
            this.existesolicitud = true;
            this.activabtncreasolic =false;
            this.bloqueacantsoli = true;
            this.arregloDetalleProductoSolicitudPaginacion = [];
            this.arregloDetalleProductoSolicitud = [];
            this.arregloDetalleProductoSolicitudPaginacion_aux = [];
            this.arregloDetalleProductoSolicitud_aux = [];

            this._Solicitud.solicitudesdet.forEach(element =>{
              if(element.tiporegmein == "I"){
                // var detalle = new DetalleSolicitud()
                // detalle = element
                element.bloqcampogrilla = false;
                element.bloqcampogrilla2 = false;
              }
            })
            this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet;
            this.arregloDetalleProductoSolicitud.forEach(x=>{
              x.detallelote.forEach(f=>{
                x.fechavto = f.fechavto;
              })
            })
            this.ActivaBotonBuscaGrilla = true;
            this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);

            this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
            this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
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
        titulo: 'Búsqueda de Solicitudes', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        origen : 'Autopedido',
        paginaorigen: 6
      }
    };
    return dtModal;
  }

  // codigo_ingresado(codigo: string){
  //   console.log("valid",this.FormDespachoSolicitud2.valid)
  //   if(codigo != null){
  //     this.codigoingresado = true;
  //     console.log("entra al codigo ingresado", this.codigoingresado,codigo)
  //   }else{
  //     // if(codigo == null){
  //       this.codigoingresado = false;
  //       console.log("no tiene al codigo ingresado", this.codigoingresado,codigo)
  //     // }
  //   }
  // }

    // cantidad_ingresada(cantidad : number){
    //   if(cantidad >0){
    //     this.cantidadingresada = true;
    //     console.log("entra la cantida ingresa", this.cantidadingresada,cantidad)
    //   }else{
    //     if(cantidad==null){
    //       this.cantidadingresada = false;
    //       console.log("No tiene la cantida ingresa", this.cantidadingresada,cantidad)
    //     }
    //   }

    //   if(this.codigoingresado == true && this.cantidadingresada == true){
    //     this.activabtnprodplant = true;
    //   }else{
    //     if(this.codigoingresado == false || this.cantidadingresada == false){
    //     this.activabtnprodplant = false;
    //     }
    //   }
    // }


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

  ActivaBotonCrearSolicitud(){

    if (this.FormCreaSolicitud.get("bodcodigo").value != null
      && this.FormCreaSolicitud.get("bsservid").value != null
      && this.FormCreaSolicitud.get("numsolicitud").value  == null
      && this.FormCreaSolicitud.get("glosa").value !=null
      && this.arregloDetalleProductoSolicitud.length > 0
      && this.verificanull == true
    ) {

      return true
    }
    else {

      return false
    }
  }

  SeleccionaBodega(codigobodega: number){
    // console.log("Selecciona bodega",codigobodega)

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
      if (response != null){
        if (response.length != 0) {
          if  (response.length == 1) {
            this.ListaEstructuraServicioBodegas = response
            this.FormCreaSolicitud.get('bsservid').setValue(this.ListaEstructuraServicioBodegas[0].bsservid);
            this.serviciocodigo = this.ListaEstructuraServicioBodegas[0].bsservid;
          } else {
            this.ListaEstructuraServicioBodegas = response
          }
        }
      }
     });
  }

  SeleccionaServicio(event:any, serviciocod : number){

    this.serviciocodigo = serviciocod;
  }

  addArticuloGrilla() {
    this.alertSwalError.title = null;
    this.alertSwalError.text = null;
    if(this.FormCreaSolicitud.value.bodcodigo == null){
      this.alertSwalAlert.title = "Debe Seleccionar la Bodega";
      this.alertSwalAlert.show();
    }else{
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) { }
      else {
        // console.log("respon",response)
        this.productoselec = response;

        this.StockProducto(this.productoselec.mein);
        this.loading = false;

      }
    },
    error => {
      this.loading = false;
      this.alertSwalError.title = "Error: ";
      this.alertSwalError.text = "No se encontró producto";
      this.alertSwalError.show();
    }
    )

  }

    // this.codprod = this.FormDespachoSolicitud.controls.codigoproducto.value;
    // if(this.codprod === null || this.codprod === ''){
    //   return;
    // } else{
    //   this.stockbodegasolicitante = 0;
    //   this.stockbodegasuministro  = 0;

    //   this.loading = true;

    //   this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
    //   this.cmecodigo, this.codprod, null, 0, 0, 0, null, this.FormCreaSolicitud.value.bodcodig, null, null,null,
    //   this.usuario, this.servidor).subscribe(
    //     response => {
    //       if (response.length == 0) {
    //         this.loading = false;
    //         this.alertSwalAlert.title = "Advertencia: ";
    //         this.alertSwalAlert.text = "No existe coincidencia por el criterio buscado";
    //         this.alertSwalAlert.show();
    //         response = [];
    //       }
    //       else {
    //         if (response.length > 0) {
    //           this.productoselec = response[0];

    //           this.StockProducto(this.productoselec.mein);
    //           this.loading = false;
    //           }
    //       }
    //     },
    //     error => {
    //       this.loading = false;
    //       this.alertSwalError.title = "Error: ";
    //       this.alertSwalError.text = error.message;
    //       this.alertSwalError.show();
    //     }
    //   );
    // }
  }

  async StockProducto(mein: number){
    var stock1 :StockProducto[]
    this.alertSwalError.title =null;
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.codexiste = false;
    //  console.log("mein a buscar",mein)

    try {

      stock1=  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, mein, this.FormCreaSolicitud.value.bodcodigo, this.usuario, this.servidor).toPromise()
      this.stockbodegasolicitante =stock1[0].stockactual;
    }
    catch(e) {
      // this.alertSwalAlert.title = "No existe stock en bodega origen para el producto buscado";
      // this.alertSwalAlert.text = "Puede que el producto no exista en la bodega de Solicitante";
      // this.alertSwalAlert.show();
    };

    stock1 = [];
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.codexiste = false;
    const DetalleMovimiento = new (DetalleSolicitud);
    DetalleMovimiento.codmei = this.productoselec.codigo;
    DetalleMovimiento.meindescri = this.productoselec.descripcion;
    DetalleMovimiento.stockorigen = this.stockbodegasolicitante;
    // DetalleMovimiento.stockdestino = this.stockbodegasuministro;
    DetalleMovimiento.meinid = this.productoselec.mein;
    DetalleMovimiento.descunidadmedida = this.productoselec.desunidaddespacho;
    DetalleMovimiento.usuariomodifica = this.usuario;
    DetalleMovimiento.cantsoli = 0;//this.FormDespachoSolicitud.value.cantidad;
    DetalleMovimiento.sodeid = 0;
    DetalleMovimiento.soliid = 0;
    DetalleMovimiento.acciond = "I";
    DetalleMovimiento.cantadespachar = 0;
    DetalleMovimiento.cantdespachada = 0;
    DetalleMovimiento.cantdevolucion = 0;
    DetalleMovimiento.pendientedespacho = 0;
    DetalleMovimiento.dias = 0;
    DetalleMovimiento.dosis = 0;
    DetalleMovimiento.formulacion = 0;
    DetalleMovimiento.cantrecepcionado = 0;
    DetalleMovimiento.marca = "I";
    DetalleMovimiento.lote = null;
    DetalleMovimiento.fechavto = null;
    DetalleMovimiento.controlado = this.productoselec.controlado;
    DetalleMovimiento.consignacion = this.productoselec.consignacion;

    DetalleMovimiento.tiporegmein = this.productoselec.tiporegistro;
    DetalleMovimiento.bloqcampogrilla = true;
    DetalleMovimiento.bloqcampogrilla2 = true;

    this.grabadetalle.unshift(DetalleMovimiento);

    if(DetalleMovimiento.tiporegmein == "I"){
      this._buscasolicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, DetalleMovimiento.codmei,0,  this.FormCreaSolicitud.value.bodcodigo  ).subscribe(
          response => {
            if (response == undefined || response === null){
              DetalleMovimiento.detallelote = [];
              this.arregloDetalleProductoSolicitud.unshift(DetalleMovimiento);
              this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
              this.logicaVacios();
              this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
              this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
            }
            else {
              this.ActivaBotonBuscaGrilla = true;
              this.lotesMedLength = response.length;
              if(response.length === 2 || response.length === 1){
                DetalleMovimiento.detallelote = [];
                DetalleMovimiento.detallelote = response;
                if(response.length === 1){
                  DetalleMovimiento.lote = response[0].glscombo;
                  DetalleMovimiento.fechavto = response[0].fechavto;
                }

                const indx = this.arregloDetalleProductoSolicitud.findIndex(x => x.codmei === this.productoselec.codigo, 1);
                if (indx >= 0) {
                  this.alertSwalError.title = "Código ya existe en la grilla";
                  this.alertSwalError.show();
                  this.codexiste = true;
                }
                else{
                  if (this.codexiste == false){
                    this.arregloDetalleProductoSolicitud.unshift(DetalleMovimiento);
                  }
                }
              }else{
                if(response.length>2){
                  this.detalleslotes = response;

                  DetalleMovimiento.detallelote = [];
                  DetalleMovimiento.detallelote = response;
                  this.arregloDetalleProductoSolicitud.unshift(DetalleMovimiento);
                  this.logicaVacios();
                  this.arregloDetalleProductoSolicitud.forEach(x=>{
                  });
                }else{
                  this.logicaVacios();
                }
                var cuentacod = 0;
                this.arregloDetalleProductoSolicitud.forEach(x=>{
                  if(x.codmei ===DetalleMovimiento.codmei){
                    cuentacod ++;
                  }
                })
                if(cuentacod > this.lotesMedLength -1  ){
                  const indxmeds = this.arregloDetalleProductoSolicitud.findIndex(x => x.codmei === DetalleMovimiento.codmei, 1);
                  this.arregloDetalleProductoSolicitud.splice(indxmeds,1);
                  this.alertSwalError.title = "Código ya existe en la grilla";
                  this.alertSwalError.text = "Ya no puede ingresar el Producto, no hay lotes disponibles para asignar";
                  this.alertSwalError.show();
                }
              }
              this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
              this.logicaVacios();
              this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
              this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
              console.log("datos en la grilla", this.arregloDetalleProductoSolicitud,
              this.arregloDetalleProductoSolicitudPaginacion);
            }
          });
    }else{
      if(DetalleMovimiento.tiporegmein =="M"){
        // console.log("es medicamento",DetalleMovimiento.tiporegmein)
        this.alertSwalAlert.title = "Advertencia: ";
        this.alertSwalAlert.text = "Solo debe ingresar Insumos";
        this.alertSwalAlert.show();
      }
    }
    stock1=[];
    this.FormDespachoSolicitud.reset();
    this.codprod = null;
  }


  async StockProducto1(mein: number){
    var stock1 :StockProducto[]
    this.alertSwalError.title =null;
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.codexiste = false;
    //  console.log("mein a buscar",mein)
    try {

      stock1=  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, mein, this.FormCreaSolicitud.value.bodcodigo, this.usuario, this.servidor).toPromise()
      this.stockbodegasolicitante =stock1[0].stockactual;
    }
    catch(e) {
      // this.alertSwalAlert.title = "No existe stock en bodega origen para el producto buscado";
      // this.alertSwalAlert.text = "Puede que el producto no exista en la bodega de Solicitante";
      // this.alertSwalAlert.show();
    };

    stock1 = [];
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.codexiste = false;
    const DetalleMovimiento = new (DetalleSolicitud);
    DetalleMovimiento.codmei = this.productoselec.codigo;
    DetalleMovimiento.meindescri = this.productoselec.descripcion;
    DetalleMovimiento.stockorigen = this.stockbodegasolicitante;
    // DetalleMovimiento.stockdestino = this.stockbodegasuministro;
    DetalleMovimiento.meinid = this.productoselec.mein;
    DetalleMovimiento.descunidadmedida = this.productoselec.desunidaddespacho;
    DetalleMovimiento.usuariomodifica = this.usuario;
    DetalleMovimiento.cantsoli = 0;//this.FormDespachoSolicitud.value.cantidad;
    DetalleMovimiento.sodeid = 0;
    DetalleMovimiento.soliid = 0;
    DetalleMovimiento.acciond = "I";
    DetalleMovimiento.cantadespachar = 0;
    DetalleMovimiento.cantdespachada = 0;
    DetalleMovimiento.cantdevolucion = 0;
    DetalleMovimiento.pendientedespacho = 0;
    DetalleMovimiento.dias = 0;
    DetalleMovimiento.dosis = 0;
    DetalleMovimiento.formulacion = 0;
    DetalleMovimiento.cantrecepcionado = 0;
    DetalleMovimiento.marca = "I";
    DetalleMovimiento.lote = null;
    DetalleMovimiento.fechavto = null;
    DetalleMovimiento.controlado = this.productoselec.controlado;
    DetalleMovimiento.consignacion = this.productoselec.consignacion;

    DetalleMovimiento.tiporegmein = this.productoselec.tiporegistro;
    DetalleMovimiento.bloqcampogrilla = true;
    DetalleMovimiento.bloqcampogrilla2 = true;

    this.grabadetalle.unshift(DetalleMovimiento);
    // this.prodencontrado = false;
    if(DetalleMovimiento.tiporegmein == "I"){
      this.arregloDetalleProductoSolicitud.unshift(DetalleMovimiento);
      this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);

      this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
      this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
      this.ActivaBotonBuscaGrilla = true;
      const indx = this.arregloDetalleProductoSolicitud.findIndex(x => x.codmei === this.productoselec.codigo, 1);
      this.logicaVacios();
      console.log("indx",indx)
      if (indx >= 0) {
        this.alertSwalError.title = "Código ya existe en la grilla";
        this.alertSwalError.show();
        this.arregloDetalleProductoSolicitud.splice(indx,1)
        this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0,20);
        this.codexiste = true;
      }else{
        if (this.codexiste == false){
          this.arregloDetalleProductoSolicitud.unshift(DetalleMovimiento);
          this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
          }
        }
    }else{
      if(DetalleMovimiento.tiporegmein =="M"){
        // console.log("es medicamento",DetalleMovimiento.tiporegmein)
        this.alertSwalAlert.title = "Advertencia: ";
        this.alertSwalAlert.text = "Solo debe ingresar Insumos";
        this.alertSwalAlert.show();
      }
    }
    if(this.FormCreaSolicitud.value.bodcodigo !=null){
      this.activabtncreasolic= true;
      // console.log("no está seleccionada la bodega",this.activabtncreasolic);
    }
    this._buscasolicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, DetalleMovimiento.codmei,0,  this.FormCreaSolicitud.value.bodcodigo  ).subscribe(
        response => {
          if (response == undefined || response=== null){
            DetalleMovimiento.detallelote = [];
          }
          else {
            if(response.length>=2){


              this.detalleslotes = response;
              // console.log("obtiene lotes para el producto:",DetalleMovimiento.codmei, DetalleMovimiento.detallelote , this.detalleslotes)
              DetalleMovimiento.detallelote = [];
              DetalleMovimiento.detallelote = response;
              this.logicaVacios();
              // console.log("obtiene lotes para el producto:",DetalleMovimiento.codmei, DetalleMovimiento.detallelote , this.detalleslotes)
              // detalleSolicitud.lote = this.detalleslotes[0].lote;
              // detalleSolicitud.fechavto = this.detalleslotes[0].fechavto;
              // console.log("carga lotes en la grilla del detalle d lotes",detalleSolicitud.detallelote);
              //Compara el producto ingresado, para ver que no exista el producto
              this.arregloDetalleProductoSolicitud.forEach(x=>{
                // console.log("recorre grilla",x)
                // if(x.detallelote.length == 1){
                  // console.log("detalleSolicitud.codmei,x.codmei,detalleSolicitud.lote,x.lote, detalleSolicitud.fechavto, x.fechavto",
                  // DetalleMovimiento.codmei,x.codmei,DetalleMovimiento.lote, x.lote,DetalleMovimiento.fechavto,x.fechavto)

                  // if(DetalleMovimiento.codmei == x.codmei && DetalleMovimiento.lote == x.lote && DetalleMovimiento.fechavto == x.fechavto){

                  //   this.alertSwalAlert.title = "Este producto ya tiene este lote ingresado en la grilla";
                  //   this.alertSwalAlert.show();
                  //   // this.btnAgregar = false;
                  // }else{
                  //   // console.log("el lote es distinto y se guarda en la grilla", detalleSolicitud.lote,x.lote)
                  //   // this.btnAgregar = true;
                  // }
                // }else{
                  // if(x.detallelote.length >0){
                  //   console.log("Hay mas de un lote")
                  //   if(detalleSolicitud.codmei == x.codmei && detalleSolicitud.lote == x.lote && detalleSolicitud.fechavto == x.fechavto){
                  //     console.log("compara en la grilla el producto con lote, ",detalleSolicitud.codmei, x.codmei,
                  //      detalleSolicitud.lote , x.lote, detalleSolicitud.fechavto, x.fechavto)
                  //     this.alertSwalAlert.title = "Este producto ya tiene este lote ingresado en la grilla";
                  //     this.alertSwalAlert.show();
                  //     // this.btnAgregar = false;
                  //   }
                  // }
                // }

              })
            }else{
              this.logicaVacios();
            }

            // this.setLotemedicamento(response);


          }

        }
      )

    stock1=[];

    this.FormDespachoSolicitud.reset();
    this.codprod = null;
    // this.LoadComboLotes();
    // console.log(mein);
    // this.LoadComboLotesNew();

  }

  setModalBusquedaProductos() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: 'Búsqueda de Productos', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Medico',
        id_Bodega: this.FormCreaSolicitud.value.bodcodigo,
        descprod: this.descprod,//
        codprod: this.FormDespachoSolicitud.value.codigoproducto //this.codprod
      }
    };
    return dtModal;
  }

  getProducto(codigo: any) {
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    if(this.FormCreaSolicitud.value.bodcodigo == null){
      this.alertSwalAlert.title = "Debe Seleccionar la Bodega";
      this.alertSwalAlert.show();
    }else{

      // console.log("codigo")
      // var codproducto = this.lForm.controls.codigo.value;
      this.codprod = this.FormDespachoSolicitud.controls.codigoproducto.value;
      this.descprod = this.FormDespachoSolicitud.controls.descripcion.value;
      console.log("cod y desc", codigo, this.codprod,this.descprod)
      if(this.codprod === null || this.codprod === '' || this.descprod === null || this.descprod ===''){
        console.log("Levanta modal", codigo, this.codprod)
        this.addArticuloGrilla();

      } else{
        var tipodeproducto = 'MIM';
        this.loading = true;
        var controlado = '';
        var controlminimo = '';
        var idBodega = this.FormCreaSolicitud.value.bodcodigo;
        var consignacion = '';
        // console.log("bodega",idBodega)
        this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
          this.cmecodigo, codigo, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
          , this.usuario, null, this.servidor).subscribe(
            response => {
              if (response != null){
                if (response.length == 0) {
                  // console.log('no existe el codigo');
                  this.loading = false;
                  // this.addArticuloGrilla();
                } else {
                  if (response.length > 1) {

                    // this.addArticuloGrilla();
                    this.loading = false;
                    this.addArticuloGrilla();
                  }else{
                    if (response.length ==1) {
                      this.loading = false;
                      this.productoselec = response[0];
                      console.log("producto ingresado",this.productoselec)
                      this.StockProducto(response[0].mein)

                    }
                  }
                }
              }
            }, error => {
              this.loading = false;
              console.log('error');
            }
          );
      }
    }
  }


  cambio_cantidad(id: number, property: string, registro: DetalleSolicitud) {
    if (this.arregloDetalleProductoSolicitudPaginacion[id]["sodeid"] == 0) {
      this.arregloDetalleProductoSolicitudPaginacion[id]["acciond"] = "I";
      this.arregloDetalleProductoSolicitud[id][property] = this.arregloDetalleProductoSolicitudPaginacion[id][property];
    } else {

      this.arregloDetalleProductoSolicitudPaginacion[id]["acciond"] = "M";
      this.arregloDetalleProductoSolicitud[id][property] = this.arregloDetalleProductoSolicitudPaginacion[id][property];

    }

  }

  async validacantidadgrilla(id: number,despacho: DetalleSolicitud){
    console.log("valida cant grilla",despacho)
    var idg =0;
    var stock :StockProducto[];
    this.stockbodega = 0;
    this.alertSwalAlert.title= null;
    this.alertSwalAlert.text = null;
    // console.log("Valida cantidad ",despacho)
    if(this.IdgrillaDevolucion(despacho)>=0){
      idg = this.IdgrillaDevolucion(despacho)
      // if(despacho.detallelote !=undefined || despacho.lote == null){
      //   this.alertSwalAlert.text = "Debe seleccionar lote";
      //   this.alertSwalAlert.show();

      // }else{
        stock= await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, despacho.meinid, this.FormCreaSolicitud.value.bodcodigo, this.usuario, this.servidor).toPromise()
        // console.log("stock",stock);
        if(despacho.cantsoli>stock[0].stockactual){
          this.arregloDetalleProductoSolicitud[idg].cantsoli =0;
          this.alertSwalAlert.text = "La cantidad a despachar sobrepasa a stock disponible de "+stock[0].stockactual+",  en la bodega";
          this.alertSwalAlert.show();
          this.logicaVacios();
        }

        if(this.arregloDetalleProductoSolicitud[idg].cantsoli <=0){
          this.alertSwalAlert.text = "La cantidad a despachar debe ser mayor a 0";
          this.alertSwalAlert.show();



          if(despacho.nomplantilla !=null){
            this.plantilla.plantillasdet.forEach(data=>{
              if(despacho.codmei == data.codmei){
                this.arregloDetalleProductoSolicitud[idg].cantsoli = data.cantsoli;
                this.arregloDetalleProductoSolicitudPaginacion[idg].cantsoli=this.arregloDetalleProductoSolicitud[idg].cantsoli
              }
            })
          }else{
            this.arregloDetalleProductoSolicitud[idg].cantsoli =0;
            this.arregloDetalleProductoSolicitudPaginacion[idg].cantsoli=this.arregloDetalleProductoSolicitud[idg].cantsoli
          }
          this.logicaVacios();
          // console.log("valida cantidad menor a c+0")
        }else{
          if(this.arregloDetalleProductoSolicitud[idg].cantsoli>9999999999){
            this.alertSwalAlert.text = "Debe ingresar una cantidad menor "
            this.alertSwalAlert.show();
            if(despacho.nomplantilla !=null){
              this.plantilla.plantillasdet.forEach(data=>{
                if(despacho.codmei == data.codmei){
                  this.arregloDetalleProductoSolicitud[idg].cantsoli = data.cantsoli;
                  this.arregloDetalleProductoSolicitudPaginacion[idg].cantsoli=this.arregloDetalleProductoSolicitud[idg].cantsoli
                }
              })
            }else{
              this.arregloDetalleProductoSolicitud[idg].cantsoli =0;
              this.arregloDetalleProductoSolicitudPaginacion[idg].cantsoli=this.arregloDetalleProductoSolicitud[idg].cantsoli
            }
            // console.log("valida cantidad mayor",this.arregloDetalleProductoSolicitud[idg].cantsoli)
            this.logicaVacios();
          }
        }

        if(despacho.detallelote != undefined){
          despacho.detallelote.forEach(dl=>{
            // console.log("Recorre el detalle lotes para verificar el cantsoli con el saldo",dl)
            if(despacho.codmei == dl.codmei && despacho.lote == dl.lote){

              if(despacho.cantsoli > dl.cantidad){
                this.arregloDetalleProductoSolicitud[idg].cantsoli =0;
                this.alertSwalAlert.title ="La cantidad solicitada, excede a "+ dl.cantidad +",  disponible en el lote";
                this.alertSwalAlert.show();
                this.logicaVacios();
              }
            }
          })
        }



    }
    this.logicaVacios();
  }

  IdgrillaDevolucion(registro: DetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.arregloDetalleProductoSolicitud) {
      if (registro.codmei === articulo.codmei) {

        return indice;
      }
      indice++;
    }
    return -1;
  }

  async onBuscarPlantillas(){
    this._BSModalRef = this._BsModalService.show(BusquedaplantillasbodegaComponent, this.setModalBusquedaPlantilla());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) {
       }
      else {
        let bodega : number = this.FormCreaSolicitud.controls.bodcodigo.value;
        this._BodegasService.BuscaPlantillas(this.servidor, sessionStorage.getItem('Usuario'), this.hdgcodigo,
        this.esacodigo,this.cmecodigo, response.planid, '', '', '', bodega,
        bodega, '', '', 1,"").subscribe(async response_plantilla => {
          if (response_plantilla.length != 0) {

            this.loading = true;
            if (response_plantilla.length > 0) {

              let arrPlantillas: Plantillas = new Plantillas();
              arrPlantillas = response_plantilla[0];

              if (arrPlantillas.bodorigen == 0) {
                this.activabtncreasolic = false;
              }
              this.FormCreaSolicitud.get('bodcodigo').setValue(arrPlantillas.bodorigen);

              // this.FormCreaSolicitud.value.bodcodigo = arrPlantillas.bodorigen;

              this.SeleccionaBodega(this.FormCreaSolicitud.value.bodcodigo);
              this.FormCreaSolicitud.get('bsservid').setValue(this.serviciocodigo);
              // this.FormCreaSolicitud.value.bsservid = this.serviciocodigo

              // probar con plantilla cedic mq de vbodega medic quirurgico
              // console.log("bodega", this.FormCreaSolicitud.value.bodcodigo)
              this.nomplantilla = arrPlantillas.plandescrip;
              this.plantilla = arrPlantillas;
              await arrPlantillas.plantillasdet.forEach(res => {

                 this.setPlantilla(res);
                this.loading = false;

              });

            }
          }
        });
      }
    });
  }

  setModalBusquedaPlantilla() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: 'Búsqueda de Plantilla Procedimiento', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipoplantilla: true,
        codbodsolic: this.FormCreaSolicitud.value.bodcodigo

      }
    };
    return dtModal;
  }

  async setPlantilla(art: DetallePlantillaBodega) {
    console.log("set planilla",art)
    this.codexiste = false;
    const indx = this.arregloDetalleProductoSolicitud.findIndex(x => x.codmei === art.codmei, 1);
    console.log("ind:",indx)

    // this.arregloDetalleProductoSolicitud.forEach(x=>{
    //   if(x.codmei === art.codmei){
    //     this.alertSwalError.title = "Código: "+ art.codmei+"  ya existe en la grilla";
    //       this.alertSwalError.show();
    //   }
    // })


    if (indx >= 0) {
      console.log("tiene producto repetido")
      // this.alertSwalError.title = "Código ya existe en la grilla";
      // this.alertSwalError.show();
    }else{

      var stock1 :StockProducto[]
      stock1=  await this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, art.meinid, this.FormCreaSolicitud.value.bodcodigo, this.usuario, this.servidor).toPromise()
      this.stockbodegasolicitante =stock1[0].stockactual;

      var detalleSolicitud = new DetalleSolicitud;
      detalleSolicitud.sodeid            = 0;
      detalleSolicitud.soliid            = 0; //num solicitud
      detalleSolicitud.repoid            = 0;
      detalleSolicitud.codmei            = art.codmei;
      detalleSolicitud.meinid            = art.meinid;
      detalleSolicitud.dosis             = 1;
      detalleSolicitud.formulacion       = 1;
      detalleSolicitud.dias              = 1;
      detalleSolicitud.cantsoli          = 0; //art.cantsoli;
      detalleSolicitud.pendientedespacho = 0;
      detalleSolicitud.cantdespachada    = 0;
      detalleSolicitud.cantdevolucion    = 0;
      detalleSolicitud.estado            = 1; // Solicitado
      detalleSolicitud.observaciones     = null;
      detalleSolicitud.fechamodifica     = null;
      detalleSolicitud.usuariomodifica   = null;
      detalleSolicitud.fechaelimina      = null;
      detalleSolicitud.usuarioelimina    = null;
      detalleSolicitud.viaadministracion = null;
      detalleSolicitud.meindescri        = art.meindescri;
      detalleSolicitud.stockorigen       = this.stockbodegasolicitante;
      detalleSolicitud.stockdestino      = null;
      detalleSolicitud.acciond           = null;
      detalleSolicitud.marca             = null;
      detalleSolicitud.fechavto          = null;
      detalleSolicitud.lote              = null;
      detalleSolicitud.cantadespachar    = 0;
      detalleSolicitud.descunidadmedida  = null;
      detalleSolicitud.tiporegmein       = art.tiporegmein;
      detalleSolicitud.acciond           = 'I';
      detalleSolicitud.nomplantilla      = this.nomplantilla;
      detalleSolicitud.cantrecepcionado  = 0;
      detalleSolicitud.bloqcampogrilla   = true;
      detalleSolicitud.bloqcampogrilla2  = true;

      if (detalleSolicitud.tiporegmein == "I") {

        const indx = this.arregloDetalleProductoSolicitud.findIndex(x => x.codmei === art.codmei, 1);
        // if (indx >= 0) {

        //   this.alertSwalError.title = "Código ya existe en la grilla";
        //   this.alertSwalError.show();
        //   this.codexiste = true;
        //   console.log("prod repetido en la grilla,",art.codmei,this.codexiste)
        // }else{
          if(this.codexiste == false){
            console.log("codigo no repetido")
            // this.LoadComboLotesNewGrilla(detalleSolicitud.codmei,detalleSolicitud.cantsoli);
            this._buscasolicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
              this.cmecodigo,detalleSolicitud.codmei,0,  this.FormCreaSolicitud.value.bodcodigo  ).subscribe(
                response => {
                  if (response == undefined || response === null){
                    detalleSolicitud.detallelote = [];
                  }else {
                    this.detalleslotes = response;
                    if(this.detalleslotes.length ==1){
                      if(detalleSolicitud.cantsoli > this.detalleslotes[0].cantidad){
                        this.alertSwalAlert.title ="La cantidad a despachar es mayor al saldo del lote " + this.detalleslotes[0].lote;
                        this.alertSwalAlert.text ="La cantidad solicitada sobrepasa "+ this.detalleslotes[0].cantidad+ ", que es el stock del lote";
                        this.alertSwalAlert.show();
                        detalleSolicitud.detallelote = response;
                      }else{
                        detalleSolicitud.detallelote = response;
                        detalleSolicitud.lote = this.detalleslotes[0].glscombo;
                        detalleSolicitud.fechavto = this.detalleslotes[0].fechavto;
                      }
                    }
                    if(this.detalleslotes.length>=2){ //tiene lotes
                    detalleSolicitud.detallelote = [];
                    detalleSolicitud.detallelote = response;
                    this.logicaVacios();
                    }else{  //No tiene lotes
                      this.logicaVacios();
                    }
                  }
                });
            this.arregloDetalleProductoSolicitud.unshift(detalleSolicitud);
            this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
            this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
            this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
            this.ActivaBotonBuscaGrilla = true;
          }
      } else{
        if(detalleSolicitud.tiporegmein =="M"){
          this.cantmed ++;
          this.alertSwalAlert.text = "La plantilla tiene medicamentos ";
          this.alertSwalAlert.show();
        }
      }
      if(this.FormCreaSolicitud.value.bodcodigo >0){
        this.activabtncreasolic= true;
      }
    }
  }

  limpiar() {
    this.FormCreaSolicitud.reset();
    this.arregloDetalleProductoSolicitudPaginacion = [];
    this.arregloDetalleProductoSolicitud = [];
    this.ListaEstructuraServicioBodegas  = [];
    this.FormCreaSolicitud.get('fecha').setValue(new Date());
    this.existesolicitud = false;
    this.FormCreaSolicitud.controls["esticod"].setValue(10);
    this.FormCreaSolicitud.controls["prioridad"].setValue(1);
    this.grabadetalle = [];
    this.desactivabtnelim = false;
    this.activabtncreasolic = false;
    this.FormDespachoSolicitud.reset();
    this.activabtnplant = false;
    this.FormDespachoSolicitud.controls.codigoproducto.enable();
    this.FormDespachoSolicitud.controls.cantidad.enable();
    this.desactivabtnagregar= false;
    this.bloqueacantsoli = false;
    this.serviciocodigo = null;
    this.codexiste = false;
    this.detalleslotes = [];
    this.verificanull = false;
    this.ActivaBotonBuscaGrilla = false;
  }

  ConfirmaEliminaProductoDeLaGrilla(registro: DetalleSolicitud, id: number) {
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
        this.EliminaProductoDeLaGrilla(registro, id);
      }
    })
  }

  EliminaProductoDeLaGrilla(registro: DetalleSolicitud, id: number) {

    if (registro.acciond === "I" && id >= 0 && registro.sodeid === 0) {
      // Eliminar registro nuevo la grilla
      if(this.isEliminaMed(registro)<0){

      }else{

        this.arregloDetalleProductoSolicitud.splice(this.isEliminaMed(registro), 1);
        this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
      }
    }

  }

  isEliminaMed(registro: DetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.arregloDetalleProductoSolicitud) {
      if (registro.codmei === articulo.codmei) {
        // console.log("registro,codmei",articulo,indice)
        return indice;
      }
      indice++;
    }
    return -1;
  }

  ConfirmaGenerarSolicitud() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿ Genera solicitud ?',
      text: "Confirmar la creación de la Solicitud",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.generarSolicitud();
      }
    })
  }

  generarSolicitud() {
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
    this._Solicitud.boddestino = this.FormCreaSolicitud.value.bodcodigo;
    this._Solicitud.tipoproducto = this.tipoproducto;
    this._Solicitud.tiporeceta = null;
    this._Solicitud.numeroreceta = 0;
    this._Solicitud.tipomovim = 'C';
    this._Solicitud.tiposolicitud = 60;
    this._Solicitud.estadosolicitud = this.FormCreaSolicitud.value.esticod;
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
    this._Solicitud.observaciones = this.FormCreaSolicitud.controls.glosa.value;
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
    this._Solicitud.origensolicitud = 60;
    this._Solicitud.codservicioori = this.FormCreaSolicitud.value.bsservid;
    this._Solicitud.codserviciodes = this.FormCreaSolicitud.value.bsservid;

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
      detalleSolicitud.lote = element.lote;
      detalleSolicitud.fechavto = element.fechavto;

      this.grabadetallesolicitud.push(detalleSolicitud);

    });
    //** Guarda grilla con lote */
    //** @ */
    this.arrProdadespachar = this.grabadetallesolicitud;
    /** */
    this._Solicitud.solicitudesdet = this.grabadetallesolicitud;

    this._solicitudService.crearSolicitud(this._Solicitud).subscribe(
      response => {
        if (response != null){
          this._solicitudService.BuscaSolicitud(response.solbodid, this.hdgcodigo, this.esacodigo,
            this.cmecodigo,null, null, null, null, null, null, this.servidor, null, null, null, null,
            null, null, null,60,"","").subscribe(
              respuestasolicitud => {
                this._Solicitud = null;
                this._Solicitud = respuestasolicitud[0];
                // console.log("solic buscada despues d grabar",this._Solicitud)
                this.activabtncreasolic = false;
                this.DespacharSolicitud(this._Solicitud.soliid);
                this.FormCreaSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
                this.existesolicitud= true;
                this.activabtnplant = true;
                // this.FormDespachoSolicitud.controls.codigoproducto.disable();
                this.FormDespachoSolicitud.controls.cantidad.disable();
                this.desactivabtnagregar = true;
              },
              error => {
                console.log("Error :", error);
              }
            );
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = "Error al generar solicitud";
        this.alertSwalError.show();
      }
    );
  }

  async DespacharSolicitud(soliid:number){
    if (this.arregloDetalleProductoSolicitud.length > 0) {
      this.DespachoSolicitud = new (DespachoSolicitud);
      this.DespachoSolicitud.paramdespachos = this._Solicitud.solicitudesdet;// this.arregloDetalleProductoSolicitud;
      this.DespachoSolicitud.paramdespachos.forEach(element=>{

        element.hdgcodigo = this.hdgcodigo;
        element.esacodigo = this.esacodigo;
        element.cmecodigo = this.cmecodigo;
        element.bodorigen =this._Solicitud.bodorigen;
        element.boddestino = this._Solicitud.boddestino;
        element.servidor = this.servidor;
        element.cantadespachar = element.cantsoli;
        element.usuariodespacha = this.usuario;
        element.soliid  = soliid;
        this.arregloDetalleProductoSolicitud.forEach(dat=>{
          // console.log("recorre el detalle de la grikka pantalla",dat)
          if(element.codmei == dat.codmei){
            // console.log("compara codigos para asignar lote",element.codmei,dat.codmei)
            element.lote = dat.lote;
            element.fechavto = dat.fechavto;
          }
        })

        // element.sodeid = this._Solicitud.solicitudesdet[indice].sodeid;
        element.consumo = "S";
      }
      );

      try {
        this._solicitudService.DespacharSolicitudAutopedido(this.DespachoSolicitud).subscribe(
          response => {
            if (response != null){
              if (response.respuesta == 'OK') {
                this.alertSwal.title = "Solicitud creada N°:" + soliid +".  Despachada y Recepcionada con éxito";
                this.alertSwal.show();
                this._solicitudService.BuscaSolicitud(soliid, this.hdgcodigo, this.esacodigo,
                  this.cmecodigo, null, null, null, null, null, null, this.servidor, 0, 0, 0, 0,
                  0, 0, "",60,"","").subscribe(
                  response => {
                    if (response != null) {
                      this._Solicitud = response[0];
                      /**Habilita btn eliminar prod */
                      this.bloqueacantsoli = true;
                      this.verificanull = false;
                      this.FormCreaSolicitud.get('bodcodigo').setValue(response[0].bodorigen);
                      this.FormCreaSolicitud.get('fecha').setValue(new Date(response[0].fechacreacion));
                      this.FormCreaSolicitud.get('esticod').setValue(response[0].estadosolicitud);
                      this.FormCreaSolicitud.get('prioridad').setValue(response[0].prioridadsoli);
                      this.FormCreaSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
                      response[0].solicitudesdet.forEach(element =>{
                        element.backgroundcolor = (element.tienelote == "N")?'gris':'amarillo';
                      });
                      this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet.slice(0,50);
                      this.arregloDetalleProductoSolicitud.forEach(x=>{
                        x.detallelote.forEach(f=>{
                          x.fechavto = f.fechavto;
                        });
                      });
                      this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;
                    }
                  },
                  error => {
                    console.log(error);
                    this.alertSwalError.title = "Error al Buscar solicitudes, puede que no exista";
                    this.alertSwalError.show();
                  });
              }
            }
          },
          error => {
            console.log(error);
            this.alertSwalError.title = "Error al Despachar la Solicitud";
            this.alertSwalError.text = error;
            this.alertSwalError.show();

          });
      } catch (err) {
        alert("Error : " + err)
      }
    }
  }


  setModalEventoDetalleSolicitud() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: 'Eventos Detalle Solicitud', // Parametro para de la otra pantalla
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
        titulo: 'Eventos Solicitud', // Parametro para de la otra pantalla
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
    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;
    this.bodegassuministro = [];

    this._BodegasService.listaBodegaRelacionadaAccion(this.hdgcodigo, this.esacodigo, this.cmecodigo, usuario, servidor, codigobodegasolicitante,1).subscribe(
      data => {
        this.bodegassuministro = data;
      }, err => {
        console.log(err.error);
      }
    );
  }

  setModalMensajeExitoEliminar(numerotransaccion: number) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-m',
      initialState: {
        titulo: 'Eliminar Solicitud', // Parametro para de la otra pantalla
        mensaje: 'Solicitud Eliminada Exitosamente',
        informacion: 'La solicitud eliminada es:',
        mostrarnumero: numerotransaccion,
        estado: 'CANCELADO',
      }
    };
    return dtModal;
  }

  setModalMensajeErrorEliminar() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-m',
      initialState: {
        titulo: 'Eliminar Solicitud', // Parametro para de la otra pantalla
        mensaje: 'Solicitud no pudo ser eliminada',
        informacion: 'Intente nuevamente',
        estado: 'CANCELADO',
      }
    };
    return dtModal;
  }


  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(startItem, endItem);
  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
  }

  onImprimir() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿Desea Imprimir Solicitud ?',
      text: "Confirmar Búsqueda",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
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
            // window.open(response[0].url, "", "", true);
            window.open(response[0].url, "", "");
          }
        },
        error => {
          console.log(error);
          this.alertSwalError.title = "Error al Imprimir Listado";
          this.alertSwalError.show();
          this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
          })
        }
      );

  }

  limpiarGrillamedicamento() {
    if (this.arregloDetalleProductoSolicitud.length){
      this.alertSwalAlert.title = '¿Borrar todos los elementos en la tabla?';
      this.alertSwalAlert.show().then(resp => {
        if (resp.value){
          this.arregloDetalleProductoSolicitud = [];
          this.arregloDetalleProductoSolicitudPaginacion = [];
          // this.grillaMedicamentos = [];
        }
        // this.logicaVacios();
      }
      );
    }
  }

  /**asigna fecha vencimiento a producto segun seleccion lote en grilla  */
  setLote1(value: string, indx: number,registro: DetalleSolicitud) {
    // console.log("value",value,"registro:", registro)
    const fechaylote = value.split('/');
    const fechav = fechaylote[0];
    const loteprod = fechaylote[1];
    const cantidad = fechaylote[2];
    const codmei = fechaylote[3];
    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;
    // console.log("fechavto",fechav,"loteprod",loteprod,cantidad,codmei, registro);
    if(loteprod==""){
      this.alertSwalAlert.text = "Debe Seleccionar lote";
      this.alertSwalAlert.show();
      // fechav
      registro.fechavto = null;
    }else{
      this.arregloDetalleProductoSolicitud[indx].fechavto = fechav;
      this.arregloDetalleProductoSolicitud[indx].lote = loteprod;

      this.detalleslotes.forEach(element=>{
        // console.log("recorre lotes para comparar datps",element);
        if(registro.cantsoli > element.cantidad){
          // console.log("registrocantsoli",registro.cantsoli,"element-cantidad", element.cantidad)
          this.alertSwalAlert.title = "El valor solicitado sobrepasa a "+element.cantidad+", del stock seleccionado";
          this.alertSwalAlert.show();
          this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
            this.cmecodigo, codmei, 0,  this.FormDespachoSolicitud.value.bodcodigo   ).subscribe(
            response => {
              if (response == undefined || response=== null){
                this.arregloDetalleProductoSolicitud[indx].detallelote = [];
                }else {
                  this.arregloDetalleProductoSolicitud[indx].detallelote = [];
                  this.arregloDetalleProductoSolicitud[indx].detallelote = response;
                  this.arregloDetalleProductoSolicitud[indx].lote = response[0].lote;
                  this.arregloDetalleProductoSolicitud[indx].fechavto = response[0].fechavto;
                  this.arregloDetalleProductoSolicitudPaginacion[indx].detallelote =this.arregloDetalleProductoSolicitud[indx].detallelote;
                }
            });
        }
      })
    }
  }

  /**Funcion que devuelve lotes de productos a grilla */
  LoadComboLotes(){
    let indice = 0;
    indice = 0;
    this.arregloDetalleProductoSolicitud.forEach(element => {
      this._buscasolicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, element.codmei,0,  this.FormCreaSolicitud.value.bodcodigo  ).subscribe(
          response => {
            if (response == undefined || response=== null){
              this.arregloDetalleProductoSolicitud[indice].detallelote = [];
            }else {
              this.detalleslotes = response;
              this.arregloDetalleProductoSolicitud[indice].detallelote = [];
              this.arregloDetalleProductoSolicitud[indice].detallelote = response;
              this.setLotemedicamento(response);
            }
            indice++;
          }
        )
    });
  }

  /**Funcion que devuelve lotes de productos a grilla */
  LoadComboLotesNew(){
    let indice = 0;
    this._buscasolicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, this.productoselec.codigo,0,  this.FormCreaSolicitud.value.bodcodigo  ).subscribe(
        response => {
          if (response == undefined || response === null){
            this.arregloDetalleProductoSolicitud[indice].detallelote = [];
          }else {
            this.detalleslotes = response;
            this.arregloDetalleProductoSolicitud[indice].detallelote = [];
            this.arregloDetalleProductoSolicitud[indice].detallelote = response;
          }
        }
      )
  }


  /**agrega los lotes y fecha vto a la grilla Medicamentos */
  async setLotemedicamento(data: any) {
    this.arregloDetalleProductoSolicitud.forEach(res => {
        data.forEach(x => {
          if (res.codmei === x.codmei) {
            res.fechavto = x.fechavto;
            res.lote = x.lote;

          }
        });
      });
  }

  LoadComboLotesNewGrilla(codigo: string,cantsoli: number){
    let indice = 0;
    this.alertSwalAlert.title = null;
    this._buscasolicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, codigo,0,  this.FormCreaSolicitud.value.bodcodigo  ).subscribe(
        response => {
          if (response == undefined || response === null){
            this.arregloDetalleProductoSolicitud[indice].detallelote = [];
          }else {
            this.detalleslotes = response;
            if(this.detalleslotes.length>=2){ //tiene lotes
            this.arregloDetalleProductoSolicitud[indice].detallelote = [];
            this.arregloDetalleProductoSolicitud[indice].detallelote = response;
            this.logicaVacios();
            }else{  //No tiene lotes
              this.logicaVacios();
            }
          }
        });
  }

  setLote(value: string, indx: number,detalle: DetalleSolicitud) {

    const fechalote = value.split('/');
    const fechav = fechalote[0];
    const loteprod = fechalote[1];
    const cantidad = parseInt(fechalote[2]);
    const codmei = fechalote[3];
    this.validaLotemedicamento(loteprod, codmei,fechav,detalle.detallelote).then( (res) =>{
      if(res) {
        this.arregloDetalleProductoSolicitud[indx].fechavto = fechav;
        this.arregloDetalleProductoSolicitud[indx].lote = loteprod;
        this.logicaVacios();
        if(detalle.cantsoli > cantidad){
          if(loteprod != ""){
            this.alertSwalAlert.title ="La cantidad a despachar es mayor al saldo del lote";
            this.alertSwalAlert.text = "El saldo del lote "+detalle.lote+" tiene "+ cantidad +", ingresar cantidad menor";
            this.alertSwalAlert.show();
            this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, codmei, 0,  this.FormCreaSolicitud.value.bodcodigo   ).subscribe(
              response => {
                if (response == undefined || response=== null){
                  this.arregloDetalleProductoSolicitud[indx].detallelote = [];
                  }else {
                    this.arregloDetalleProductoSolicitud[indx].detallelote = [];
                    this.arregloDetalleProductoSolicitud[indx].detallelote = response;
                    this.arregloDetalleProductoSolicitud[indx].lote = null;//response[0].lote;
                    this.arregloDetalleProductoSolicitud[indx].fechavto = null; //response[0].fechavto;
                    this.logicaVacios();
                  }
              });
          }
        }
      } else {
        let codigo_bodega_lote = this.FormCreaSolicitud.value.bodcodigo;
        this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, codmei, 0,  codigo_bodega_lote  ).subscribe(
        response => {
          if (response == undefined || response=== null){
            this.arregloDetalleProductoSolicitud[indx].detallelote = [];
            }else {

              this.arregloDetalleProductoSolicitud[indx].detallelote = [];
              this.arregloDetalleProductoSolicitud[indx].detallelote = response;
              this.arregloDetalleProductoSolicitud[indx].lote = null; //response[0].lote;
              this.arregloDetalleProductoSolicitud[indx].fechavto = null; //response[0].fechavto;

              this.logicaVacios();
            }
        });
        return;
      }
    });
    // this.logicaVacios();
  }

  async validaLotemedicamento(lote: string, codmei: string,fechavto: string,detallelote: any) {
    // console.log("entra a funcona validalote medicamento",lote,codmei,fechavto)
    let validaok = false;
    for(let d of this.arregloDetalleProductoSolicitud) {
      if(d.codmei === codmei && d.lote === lote && d.fechavto === fechavto) {
        // console.log("compara los codigos y lotes si son iguales",d.codmei ,codmei, d.lote,lote,d.fechavto, fechavto)
        this.alertSwalAlert.title = `El Lote  ${d.lote} ya existe en la grilla`;
        this.alertSwalAlert.text = `Seleccione otro lote disponible`;
        this.alertSwalAlert.show();
        validaok = false;
        // console.log("validaok",validaok)
        break;
      }
      else {
        validaok = true;
        // console.log("validaok true, entra al else de que los datos no son iguales",validaok)
      }
    }
    return validaok;
  }

  async CambioCheck(registro: DetalleSolicitud,id:number,event:any,marcacheckgrilla: boolean){

    if(event.target.checked){
      registro.marcacheckgrilla = true;
      this.desactivabtnelim = true;
      await this.isEliminaInsGrilla(registro)
      await this.arregloDetalleProductoSolicitud.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;
          // console.log("recorre la grilla para ver si hay check",d.marcacheckgrilla,this.desactivabtnelim)
        }
      })
     }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelim = false;
      await this.isEliminaInsGrilla(registro);
      await this.arregloDetalleProductoSolicitud.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;

        }
      })

    }
    // console.log("chec modificado",registro)
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

  EliminaProductoDeLaGrilla2() {

    this.arregloDetalleProductoSolicitudPaginacion.forEach(dat=>{

      if (dat.acciond === "I"  && dat.sodeid === 0) {
        if(dat.marcacheckgrilla ===true){

          if(this.isEliminaIns2(dat)<0){

            this.logicaVacios();
          }else{

            this.desactivabtnelim = false;

            this.arregloDetalleProductoSolicitud.splice(this.isEliminaMed(dat), 1);
            this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
            this.logicaVacios();
          }
        }else{
          // console.log("marcacheckgrilla es falso por lo que no elimina",dat.marcacheckgrilla)
          this.logicaVacios();
        }

      }
    })

  }

  isEliminaIns2(registro: DetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.arregloDetalleProductoSolicitud) {
      if (registro.codmei === articulo.codmei) {

        return indice;
      }
      indice++;
    }
    return -1;
  }

  async logicaVacios() {
    await this.vaciosProductos();
    await this.logicaVaciosLote();
    console.log("this.vacios:",this.vacios,"this.vacioslotes:",this.vaciolote)
    if (this.vacios === true && this.vaciolote === true) {
      this.verificanull = false;
    }
    else {if (this.vacios === true && this.vaciolote === false){
      this.verificanull = false;
    }else {
      if(this.vacios === false && this.vaciolote === true){
        this.verificanull = false;
      }else{
        this.verificanull = true;

      }

    }
  }

  }
  vaciosProductos() {
    if (this.arregloDetalleProductoSolicitudPaginacion.length) {
      for (var data of this.arregloDetalleProductoSolicitudPaginacion) {
        // console.log("data",data)
        if (data.cantsoli <= 0 ||  data.cantsoli === null) {

          this.vacios = true;
          // console.log("datacantsoli 0?",data.cantsoli,this.vacios)
          return;
        } else {

          this.vacios = false;
          // return

        }
      }
    }
  }

  logicaVaciosLote(){
    if (this.arregloDetalleProductoSolicitudPaginacion.length) {
      for (var data of this.arregloDetalleProductoSolicitudPaginacion) {
        // console.log("data.detallelote:",data.detallelote)
        if(data.detallelote !=null){
          // console.log("datadetaale.ote:",data.lote,"data.detallelote.length",data.detallelote.length)
          if(data.detallelote.length===0){
            // console.log("teien lengt 1 por lo que no hay lotes")
            this.vaciolote = false;
          }else{
            if (data.lote === null || data.lote === "" || data.lote === undefined){
              this.vaciolote = true;
              // console.log("data.lote:",data.lote)
              return
            }else{
              this.vaciolote = false;
              // return;
            }
          }

        }else{

          this.vaciolote = false;
        }
      }
    }
  }

  vaciosProductos2() {
    if (this.arregloDetalleProductoSolicitudPaginacion.length) {
      for (var data of this.arregloDetalleProductoSolicitudPaginacion) {
        if(data.detallelote !=null){
          console.log("1",data.lote)
          if (data.cantsoli <= 0 || data.cantsoli === null || data.lote === null) {
            this.vacios = true;

            return;
          }else{
            this.vacios = false;

          }
        }
        else{
          console.log("3")
          if (data.cantsoli <= 0 || data.cantsoli === null) {
            this.vacios = true;
            return;
          } else {
            this.vacios = false;
          }
        }

      }
    }else{

      this.vacios = true;
    }
  }

  async findArticuloGrilla() {
    this.loading = true;
    // console.log('this.FormDatosProducto.controls.codigo.value : ' , this.FormDatosProducto.controls.codigo);
    if ( this.FormDespachoSolicitud.controls.codigoproducto.touched &&
        this.FormDespachoSolicitud.controls.codigoproducto.status !== 'INVALID') {
        var codProdAux = this.FormDespachoSolicitud.controls.codigoproducto.value.toString();
      if(this.FormCreaSolicitud.controls.numsolicitud.value >0){

        this.arregloDetalleProductoSolicitud = [];
        this.arregloDetalleProductoSolicitudPaginacion = [];

        this._solicitudService.BuscaSolicitud(this.FormCreaSolicitud.controls.numsolicitud.value,
          this.hdgcodigo, this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0,
           -1, 0, 0, 0, 0, "",60,codProdAux,"").subscribe(
          response_solicitud => {

            this.SeleccionaBodega(response_solicitud[0].bodorigen);

            this._Solicitud = response_solicitud[0];
            this.FormCreaSolicitud.get('bsservid').setValue(response_solicitud[0].codservicioori);

            // this.desactivabtnelim = true;
            this.FormCreaSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
            this.FormCreaSolicitud.get('bodcodigo').setValue(this._Solicitud.bodorigen);
            this.BuscaBodegasSuministro(this._Solicitud.bodorigen);
             // this.FormCreaSolicitud.get('codbodegasuministro').setValue(this._Solicitud.boddestino);
            this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
            this.FormCreaSolicitud.get('esticod').setValue(this._Solicitud.estadosolicitud);
            this.FormCreaSolicitud.get('prioridad').setValue(this._Solicitud.prioridadsoli);
            this.existesolicitud = true;
            this.activabtncreasolic =false;
            this.bloqueacantsoli = true;
            this.arregloDetalleProductoSolicitudPaginacion = [];
            this.arregloDetalleProductoSolicitud = [];

            this._Solicitud.solicitudesdet.forEach(element => {
              if (element.tiporegmein == "I") {

                this.arregloDetalleProductoSolicitud.unshift(element); //this._PlantillaConsumo.detplantillaconsumo;
                this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);

                element.bloqcampogrilla = false;
                element.bloqcampogrilla2 = false;
              }
            })

            this.arregloDetalleProductoSolicitud.forEach(x => {
              x.detallelote.forEach(f => {
                x.fechavto = f.fechavto;
              })
            })
            this.ActivaBotonBuscaGrilla = true;
            this.ActivaBotonLimpiaBusca = true;
            this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
          }
        );
        this.loading = false;
        return;
      }else{ //Cuando la plantilla aún no se crea
        this.arregloDetalleProductoSolicitud_2 = [];
        if(this.FormCreaSolicitud.controls.numsolicitud.value === null){

          this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
            this.cmecodigo,codProdAux,1,this.usuario,this.servidor,
            this.arregloDetalleProductoSolicitud,null,null,null,null).subscribe(response => {
              if (response != null) {
                this.arregloDetalleProductoSolicitud_2=response;
                this.arregloDetalleProductoSolicitud = [];
                this.arregloDetalleProductoSolicitudPaginacion = [];
                this.arregloDetalleProductoSolicitud = this.arregloDetalleProductoSolicitud_2;
                this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0,20);
                this.ActivaBotonLimpiaBusca = true;
                this.loading = false;
              } else {
                this.loading = false;
              }
            });
        }
        this.loading = false;
      }
    }else{
      this.limpiarCodigo();
      this.loading = false;
      return;
    }
  }

  limpiarCodigo() {
    this.loading = true;

    this.FormDespachoSolicitud.controls.codigoproducto.reset();
    var codProdAux = '';

    this.arregloDetalleProductoSolicitud = [];
    this.arregloDetalleProductoSolicitudPaginacion = [];


    // Llenar Array Auxiliares
    this.arregloDetalleProductoSolicitud = this.arregloDetalleProductoSolicitud_aux;
    this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitudPaginacion_aux;
    this.ActivaBotonLimpiaBusca = false;

    this.loading = false;
  }

}
