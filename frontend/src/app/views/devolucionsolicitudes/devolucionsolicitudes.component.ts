import { Component, OnInit, ViewChild,HostListener, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { DevolucionDetalleSolicitud } from 'src/app/models/entity/DevolucionDetalleSolicitud';
import { Solicitud } from 'src/app/models/entity/Solicitud';
import { DespachoDetalleSolicitud } from 'src/app/models/entity/DespachoDetalleSolicitud';
import { Detallelote } from '../../models/entity/Detallelote';
import { ProductoRecepcionBodega } from 'src/app/models/entity/ProductoRecepcionBodega';
import { ParamDetDevolBodega } from '../../models/entity/ParamDetDevolBodega';
import { ParamDevolBodega } from '../../models/entity/ParamDevolBodega';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BusquedasolicitudesComponent } from '../busquedasolicitudes/busquedasolicitudes.component';
import { EventosDetallesolicitudComponent } from '../eventos-detallesolicitud/eventos-detallesolicitud.component';
import { EventosSolicitudComponent } from '../eventos-solicitud/eventos-solicitud.component';
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';
import { InformesService } from '../../servicios/informes.service';
import { CreasolicitudesService } from 'src/app/servicios/creasolicitudes.service';
import { StockProducto } from 'src/app/models/entity/StockProducto';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-devolucionsolicitudes',
  templateUrl: './devolucionsolicitudes.component.html',
  styleUrls: ['./devolucionsolicitudes.component.css'],
  providers: [ InformesService]
})
export class DevolucionsolicitudesComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalGrilla', { static: false }) alertSwalGrilla: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;

  public modelopermisos                   : Permisosusuario = new Permisosusuario();
  public FormDevolucionSolicitud          : FormGroup;
  public FormDevolucionDetalle            : FormGroup;
  public FormDatosProducto                : FormGroup;
  public arreegloDetalleSolicitud         : Array<DetalleSolicitud> = [];
  public arreegloDetalleSolicitudpaginacion: Array<DetalleSolicitud> = [];
  public arreegloDetalleSolicitud_aux     : Array<DetalleSolicitud> = [];
  public arreegloDetalleSolicitudpaginacion_aux: Array<DetalleSolicitud> = [];
  public arreegloDetalleSolicitud_2         : Array<DetalleSolicitud> = [];
  public listadetallesolicitud            : Array<DetalleSolicitud> = [];
  public DevolucionBodega                 : ParamDevolBodega;
  public arregloDetalleDevolucionSolicitud: Array<DevolucionDetalleSolicitud> = [];
  public ListaDevolucionDetalleSolicitud  : Array<DevolucionDetalleSolicitud> = [];
  public paramdevolucion                  : DespachoDetalleSolicitud[]=[];
  public varDevolucionDetalleSolicitud    : DevolucionDetalleSolicitud;
  public detallessolicitudes              : Array<DespachoDetalleSolicitud> = [];
  public detallessolicitudespaginacion    : Array<DespachoDetalleSolicitud> = [];
  public productosrecepcionadospaginacion : Array<ProductoRecepcionBodega> =[];
  public productosrecepcionados           : Array<ParamDetDevolBodega> =[];
  public arrParamDetDevolBodega           : Array<ParamDetDevolBodega> = [];
  public solicitudseleccion               : Array<ProductoRecepcionBodega> = [];
  public detalleslotes                    : Detallelote[]=[];
  public hdgcodigo                        : number;
  public esacodigo                        : number;
  public cmecodigo                        : number;
  public mfdeid                           : number;
  public solicitud                        : number;
  public numsolic                         : boolean = false;
  public existsolicitud                   : boolean = false;
  public validadato                       : boolean = false;
  public servidor                         = environment.URLServiciosRest.ambiente;
  public usuario                          = environment.privilegios.usuario;
  public _DetalleSolicitud                : DetalleSolicitud;
  public _Solicitud                       : Solicitud;
  public _Solicitud2                      : Solicitud[];
  public fechavto                         : string;
  public fechavto1                        : string;
  public lote                             : string;
  public locale                           = 'es';
  public bsConfig                         : Partial<BsDatepickerConfig>;
  public colorTheme                       = 'theme-blue';
  private _BSModalRef                     : BsModalRef;
  public loading                          : boolean = false;
  public activabtnimprime                 : boolean = false;
  public activabtndevoltotal              : boolean = false;
  public desactivabtnelim                 : boolean = false;
  public vacios                           : boolean = true;
  public verificanull                     : boolean = false;
  public bloqbtnagregar                   : boolean = false;
  public ActivaBotonBuscaGrilla           : boolean = false;
  public ActivaBotonLimpiaBusca           : boolean = false;
  public descprod                         = null;
  public estado_aux                       : number;

  cantpendiente           : number = 10;
  retornosolicitud        : any;
  retornosolicituddetalle : any;
  onClose                 : any;
  bsModalRef              : any;
  editField               : any;

  constructor(
    private formBuilder             : FormBuilder,
    public _BsModalService          : BsModalService,
    public datePipe                 : DatePipe,
    public localeService            : BsLocaleService,
    public _SolicitudService        : SolicitudService,
    public _buscasolicitudService   : SolicitudService,
    private _imprimesolicitudService: InformesService,
    private router                  : Router,
    private route                   : ActivatedRoute,
    public _creaService             : CreasolicitudesService,
    public translate: TranslateService
  ) {

    this.FormDevolucionSolicitud = this.formBuilder.group({
      numsolicitud  : [{ value: null, disabled: true }, Validators.required],
      esticod       : [{ value: null, disabled: true }, Validators.required],
      hdgcodigo     : [{ value: null, disabled: false }, Validators.required],
      esacodigo     : [{ value: null, disabled: false }, Validators.required],
      cmecodigo     : [{ value: null, disabled: false }, Validators.required],
      prioridad     : [{ value: null, disabled: true }, Validators.required],
      fechamostrar  : [{ value: new Date(), disabled: true}, Validators.required],
      bodorigen     : [{ value: null, disabled: true }, Validators.required],
      boddestino    : [{ value: null, disabled: true }, Validators.required]
    });

    this.FormDevolucionDetalle = this.formBuilder.group({
      codigo  : [{ value: null, disabled: false }, Validators.required],
      descripcion : [{ value: null, disabled: false }, Validators.required],

    });

    // this.FormDatosProducto = this.formBuilder.group({
    //   codigo  : [{ value: null, disabled: false }, Validators.required],
    //   descripcion : [{ value: null, disabled: false }, Validators.required],
    // });
  }

  ngOnInit() {
    this.FormDatosProducto = this.formBuilder.group({
      codigo  : [{ value: null, disabled: false }, Validators.required],
      descripcion : [{ value: null, disabled: false }, Validators.required],
    });
    this.setDate();
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

  }

  ngOnDestroy(){
    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }


  BuscarSolicitudes() {
    this.loading = true;
    this.detallessolicitudespaginacion = [];
    this.detallessolicitudes = [];


    if(this._Solicitud != undefined){

      if(this._Solicitud.bandera === 1){  //Si bandera es =2 solicitud tomada
        this.ValidaEstadoSolicitud(1,'BuscaSolicitudes');
      }
    }
    this._BSModalRef = this._BsModalService.show(BusquedasolicitudesComponent, this.setModalBusquedaSolicitud());
    this._BSModalRef.content.onClose.subscribe((RetornoSolicitudes: Solicitud) => {
      if (RetornoSolicitudes == undefined) { }
      else {

        this._SolicitudService.BuscaSolicitud(RetornoSolicitudes.soliid, this.hdgcodigo,
          this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, 0, 0, 0, 0,
          0, "", 0, "","").subscribe(
            response => {
              if (response != null) {
                this._Solicitud = response[0];
                if (this._Solicitud.soliid > 0) {
                  this.numsolic = true;
                }
                this.estado_aux = this._Solicitud.estadosolicitud;
                this.existsolicitud = true;
                var fechacreacion;
                if(this._Solicitud.estadosolicitud ==70 && this.detallessolicitudes.length==0){
                  this.activabtndevoltotal = true;
                }
                this.FormDevolucionSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
                this.FormDevolucionSolicitud.get('boddestino').setValue(this._Solicitud.boddestinodesc);
                this.FormDevolucionSolicitud.get('bodorigen').setValue(this._Solicitud.bodorigendesc);
                fechacreacion = this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy');
                this.FormDevolucionSolicitud.get('fechamostrar').setValue(fechacreacion);
                this.FormDevolucionSolicitud.get('esticod').setValue(this._Solicitud.estadosolicitudde);
                this.FormDevolucionSolicitud.get('prioridad').setValue(this._Solicitud.desprioridadsoli);
                this.solicitud = this._Solicitud.soliid;

                if(this._Solicitud.estadosolicitud == 10 || this._Solicitud.estadosolicitud == 50 ||
                  this._Solicitud.estadosolicitud == 40 || this._Solicitud.estadosolicitud == 110){
                  this.bloqbtnagregar = true;
                  this.FormDevolucionDetalle.controls.codigo.disable();
                }
                this.arreegloDetalleSolicitud = response[0].solicitudesdet;
                this.arreegloDetalleSolicitudpaginacion = this.arreegloDetalleSolicitud.slice(0, 20);
                this.arreegloDetalleSolicitud_aux = this.arreegloDetalleSolicitud;
                this.arreegloDetalleSolicitudpaginacion_aux = this.arreegloDetalleSolicitudpaginacion;
                this.ActivaBotonBuscaGrilla = true;

                if(this._Solicitud.bandera === 2){ //Si bandera es =2 solicitud tomada
                  this.verificanull = false;
                  this.bloqbtnagregar = true;
                  this.FormDevolucionDetalle.disable();
                  if(this.detallessolicitudes.length > 0){
                    this.detallessolicitudes.forEach(x=>{
                      x.bloqcampogrilla = false;
                      x.bloqcampogrilla2 = false;
                    });
                    this.detallessolicitudespaginacion = this.detallessolicitudes.slice( 0,20);
                    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                    this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                    this.alertSwalAlert.show();
                  }else{
                    this.detallessolicitudespaginacion = this.detallessolicitudes.slice( 0,20);
                    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                    this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                    this.alertSwalAlert.show();
                  }
                }else{
                  this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
                }
              }
            });
      }
    });
  }

  ValidaEstadoSolicitud(bandera: number, nada:string){
    // console.log("Valida estado solicitud",this._Solicitud)
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


    this._SolicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,
      ' ',recetaid,bandera).subscribe(
      response => { });

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
        filtrodenegocio:"POR DEVOLVER",
        origen: 'Otros',
        paginaorigen: 4
      }
    };
    return dtModal;
  }

  BuscaproductoaDevolver(productos:any){
    const resultado = this.detallessolicitudes.find(registro => registro.codmei === productos.trim());

    if (resultado != undefined) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.repetido');
      this.alertSwalError.show();
      return
    }

    this.arreegloDetalleSolicitud.forEach(element => {
      if (element.codmei.trim() === productos.trim()) {
        this.validadato = true;
      }
    });

    if (this.validadato == false) {
      // console.log("No existe dato");
      this.FormDevolucionDetalle.reset();
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.valor.codigo.ingresado.no.pertenece.solicitud');
      this.alertSwalError.show();
    }

    this.productosrecepcionados = [];
    this.productosrecepcionadospaginacion = [];
    this._SolicitudService.BuscaProductoRecepcionBodega(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.servidor,
      this.solicitud,
      this.FormDevolucionDetalle.value.codigo,
      this.lote,
      this.fechavto,
    ).subscribe(
      response => {
        if (response != null) {
          this.activabtndevoltotal = false;
          if (response.length > 1) {
            this.alertSwalGrilla.reverseButtons = true;
            this.alertSwalGrilla.title = this.TranslateUtil('key.mensaje.seleccione.producto.devolver');
            this.alertSwalGrilla.show();
            this.productosrecepcionados = response;
            this.productosrecepcionados.forEach(dat => {
              if (dat.cantpendientedevolver == 0) {
                dat.checkgrilla = true;
              } else {
                if (dat.cantpendientedevolver > 0) {
                  dat.checkgrilla = false;
                }
              }
            });
            this.productosrecepcionadospaginacion = this.productosrecepcionados.slice(0, 20)
          } else {
            if (response.length == 1) {
              this.solicitudseleccion = [];
              this.solicitudseleccion = response;
              this.onConfirm();
            }
          }
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.productos.recepcionados');
        this.alertSwalError.text = error;
        this.alertSwalError.show();
      }
    );

    this.validadato = false;
    this.FormDevolucionDetalle.reset();
  }

  onCheck(event: any, productorecepcionado: ProductoRecepcionBodega) {

    // this.solicitudseleccion=[];
    if (event.target.checked) {
      // if (this.inArray( productorecepcionado) < 0) {
        this.solicitudseleccion.push(productorecepcionado);
        // console.log("producto guardado con el check",this.solicitudseleccion)
      // } else {
          // if(this.inArray(productorecepcionado) ==0)// && productorecepcionado.cantdevuelta< productorecepcionado.cantrecepcionada)
          // {
          //   console.log("Existe",productorecepcionado.cantdevuelta, productorecepcionado.cantrecepcionada)
          //   this.solicitudseleccion.push(productorecepcionado);
          //   console.log("agregar d nuevo", this.solicitudseleccion);
          // }
          // else{
          // return;//}
      // }
    } else {
      // console.log("check no seleccionado")
      this.solicitudseleccion.splice(this.inArray( productorecepcionado), 1);
    }
  }

  onConfirm() {
    // console.log("datos a ingresar a la grilla 2",this.solicitudseleccion)

    this.solicitudseleccion.forEach(data => {
      var temporal = new DespachoDetalleSolicitud;
      temporal.lote = data.lote;
      temporal.fechavto = data.fechavto;
      temporal.cantidadadevolver = (data.cantrecepcionada - data.cantdevuelta);
      temporal.mfdeid = data.mfdeid;
      temporal.cantrecepcionado = data.cantrecepcionada;
      temporal.cantdevolucion = data.cantdevuelta;
      temporal.codmei = data.codmei;
      temporal.meindescri = data.meindescri;
      temporal.meinid = data.meinid;
      temporal.cantsoli = data.cantsoli;
      temporal.cantdespachada = data.cantdespachada;
      temporal.sodeid = data.sodeid;
      temporal.cantrecepcionada = data.cantrecepcionada;
      temporal.bloqcampogrilla = true;
      // console.log("solictud seleccion",this.solicitudseleccion);
      if (temporal.cantidadadevolver > 0) {
        this.detallessolicitudes.unshift(temporal);
      } else {

        this.alertSwalError.title = this.TranslateUtil('key.mensaje.producto.no.tiene.cantidad.suficiente.devolver');
        this.alertSwalError.text = this.TranslateUtil('key.title.error');
        this.alertSwalError.show();
        return
      }
      // this.detallessolicitudes.unshift(temporal);
    })
    // console.log("Datos a la grillaaaa 2",this.detallessolicitudes)

    this.detallessolicitudespaginacion = this.detallessolicitudes.slice(0,20);
    this.logicaVacios();
    this.FormDevolucionDetalle.reset(); this.detalleslotes=[];
    this.productosrecepcionadospaginacion=[]
    this.productosrecepcionados=[]
    this.solicitudseleccion = [];
  }

  onCancel() {
    this.solicitudseleccion = [];
  }

  inArray( seleccion: any) {
    /* devuelve index si objeto existe en array
     0= objeto a devolver
     1= objeto verificar/eliminar en seleccion */
    let indice = 0;
    for (const objeto of this.solicitudseleccion) {
      if ( seleccion.mfdeid === objeto.mfdeid ) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

  validacantidadgrilla(id: number,despacho: DespachoDetalleSolicitud){
    var idg =0;

    if(despacho.sodeid>0){
      if(this.IdgrillaDevolucion(despacho)>=0){
        idg = this.IdgrillaDevolucion(despacho)

        if(this.detallessolicitudes[idg].cantidadadevolver > this.detallessolicitudes[idg].cantrecepcionado- this.detallessolicitudes[idg].cantdevolucion ){

          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.devolver.debe.ser.menor.igual.cantidad.recepcionada');
          this.alertSwalAlert.show();
          // this.listaDetalleDespacho[idg].cantidadarecepcionar = this.listaDetalleDespacho[idg].cantdespachada- this.listaDetalleDespacho[idg].cantrecepcionada;
          this.detallessolicitudes[idg].cantidadadevolver = this.detallessolicitudes[idg].cantrecepcionado   - this.detallessolicitudes[idg].cantdevolucion
          this.detallessolicitudespaginacion[idg].cantidadadevolver = this.detallessolicitudes[idg].cantidadadevolver;
          this.logicaVacios();
        }else{
          if(this.detallessolicitudes[idg].cantidadadevolver <=0){
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.cero');
            this.alertSwalAlert.show();
            this.detallessolicitudes[idg].cantidadadevolver = this.detallessolicitudes[idg].cantrecepcionado   - this.detallessolicitudes[idg].cantdevolucion
            this.detallessolicitudespaginacion[idg].cantidadadevolver = this.detallessolicitudes[idg].cantidadadevolver;
            this.logicaVacios();
          }else{
            if(despacho.cantidadadevolver < despacho.cantrecepcionado- despacho.cantdevolucion || despacho.cantidadarecepcionar >0){
              this.logicaVacios();
            }
          }

        }
      }
    }
  }

  IdgrillaDevolucion(registro: DespachoDetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.detallessolicitudes) {
      if (registro.codmei === articulo.codmei) {

        return indice;
      }
      indice++;
    }
    return -1;
  }

  /* Confirmar guardado de movimiento previamente */
  async ConfirmarEnviarDevolucion(datos: any) {
    const Swal = require('sweetalert2');

    const confirmaDevolucion = await Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.devolver.productos'),
      html: this.TranslateUtil('key.mensaje.confirmar.devolucion.productos'),
      type: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
    }).then((result) => result.value);

    if (!confirmaDevolucion) {
      return;
    }

    // Revisar Stock
    const { stockBueno, detalleStockMalos } = await this.validaStock(this.detallessolicitudes);
    if (!stockBueno) {
      await Swal.fire({
        type: 'error',
        title: this.TranslateUtil('key.mensaje.articulos.sin.stock.suficiente'),
        html: detalleStockMalos,
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
        confirmButtonColor: '#3085d6',
        width: '700px',
      });
      return;
    }

    this.DevolucionSolictud(this.detallessolicitudes);
  }

  private async validaStock(detallesSolicitud: DespachoDetalleSolicitud[]) {
    let stockBueno = true;
    let stockMalos = '';

    for (const detalle of detallesSolicitud) {
      const stockActual = await this._creaService
        .BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, detalle.meinid, this._Solicitud.bodorigen, this.usuario, this.servidor)
        .toPromise()
        .then((stock) => stock[0].stockactual);

      if (detalle.cantidadadevolver > stockActual) {
        stockMalos +=
          '<tr>' +
          `  <td class="text-left">${detalle.codmei.trim()}</td>` +
          `  <td class="text-left">${detalle.meindescri.trim()}</td>` +
          `  <td>${stockActual}</td>` +
          `  <td>${detalle.cantidadadevolver}</td>` +
          '</tr>';
        stockBueno = false;
      }
    }

    const tablaArticulosSinStock =
      '<table class="mt-3 table">' +
      '  <thead>' +
      '    <tr>' +
      '      <th scope="col" class="text-left">Código</th>' +
      '      <th scope="col" class="text-left">Artículo</th>' +
      '      <th scope="col">Stock</th>' +
      '      <th scope="col">A devolver</th>' +
      '    </tr>' +
      '  </thead>' +
      '  <tbody>' +
      `    ${stockMalos}` +
      '  </tbody>' +
      '</table>';

    return {
      stockBueno,
      detalleStockMalos: stockBueno ? '' : tablaArticulosSinStock,
    };
  }

  /* Guardar movimimientos */
  private DevolucionSolictud(datos: any) {
    this.paramdevolucion=[];
    this.detallessolicitudes.forEach(element => {
      var temporal = new ParamDetDevolBodega  // new DespachoDetalleSolicitud
      temporal.soliid            = this.solicitud;
      temporal.sodeid            = element.sodeid;
      temporal.cantsoli          = element.cantsoli;
      temporal.cantdespachada    = element.cantrecepcionada;
      temporal.cantdevolucion    = element.cantdevolucion;
      temporal.cantrecepcionado  = element.cantrecepcionado;
      temporal.mfdeid            = element.mfdeid;
      temporal.cantrecepcionada  = element.cantrecepcionada;
      temporal.cantdevuelta      = element.cantdevuelta;
      temporal.cantidadadevolver = element.cantidadadevolver;
      temporal.lote              = element.lote;
      temporal.fechavto          = element.fechavto;
      this.paramdevolucion.push(temporal);
    });

    this.DevolucionBodega = new (ParamDevolBodega);
    this.DevolucionBodega.hdgcodigo = this.hdgcodigo;
    this.DevolucionBodega.esacodigo = this.esacodigo;
    this.DevolucionBodega.cmecodigo = this.cmecodigo;
    this.DevolucionBodega.servidor = this.servidor;
    this.DevolucionBodega.usuariodespacha = this.usuario;

    this.DevolucionBodega.paramdetdevolbodega = this.paramdevolucion;
    // console.log("datos a devolvr final", this.DevolucionBodega)
    try {
      this._SolicitudService.DevolucionSolicitud(this.DevolucionBodega).subscribe(
        response => {
          if (response != null) {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.devolucion.exitosa');
            this.alertSwal.show();
            this.detallessolicitudespaginacion =[];
            this.detallessolicitudes=[];
            this._buscasolicitudService.BuscaSolicitud(this.solicitud, this.hdgcodigo, this.esacodigo, this.cmecodigo, null, null, null, null, null, null, this.servidor, 0, 0, 0, 0, 0, 0, "",0, "","").subscribe(
              response => {
                if (response != null) {
                  var fechacreacion;
                  this.estado_aux = this._Solicitud.estadosolicitud;
                  this.FormDevolucionSolicitud.get('numsolicitud').setValue(response[0].soliid);
                  this.FormDevolucionSolicitud.get('boddestino').setValue(response[0].boddestinodesc);
                  this.FormDevolucionSolicitud.get('bodorigen').setValue(response[0].bodorigendesc);
                  fechacreacion= this.datePipe.transform(response[0].fechacreacion, 'dd-MM-yyyy');
                  this.FormDevolucionSolicitud.get('fechamostrar').setValue(fechacreacion);
                  this.FormDevolucionSolicitud.get('esticod').setValue(response[0].estadosolicitudde);
                  this.FormDevolucionSolicitud.get('prioridad').setValue(response[0].desprioridadsoli);
                  this.activabtnimprime = true;
                  this.numsolic = true;
                  this.arreegloDetalleSolicitud= response[0].solicitudesdet;
                  this.arreegloDetalleSolicitudpaginacion = this.arreegloDetalleSolicitud.slice(0,20);
                  this.logicaVacios();
                  if(this._Solicitud.bandera === 2){
                    this.verificanull = false;
                    this.activabtndevoltotal = false;
                    this.bloqbtnagregar = false;
                    this.FormDevolucionDetalle.disable();
                    if(this.detallessolicitudes.length >0){
                      this.detallessolicitudes.forEach(x=>{
                        x.bloqcampogrilla = false;
                        x.bloqcampogrilla2 = false;
                      })
                      this.detallessolicitudespaginacion = this.detallessolicitudes.slice( 0,20);
                      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                      this.alertSwalAlert.show();
                    }
                  }else{
                    this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
                  }
                }
          }, error => {
            console.log(error);
            this.alertSwalError.title=this.TranslateUtil('key.mensaje.no.encuentra.solicitudes');
            this.alertSwalError.text = error;
            this.alertSwalError.show();
          });
          this.productosrecepcionados=[]; this.productosrecepcionadospaginacion=[];
          this.solicitudseleccion = [];
          this.detallessolicitudes=[];
          this.paramdevolucion =[];
        }
      },error => {
        console.log(error);
        this.alertSwalError.title=this.TranslateUtil('key.mensaje.error.devolver.solicitud');
        this.alertSwalError.text = error;
        this.alertSwalError.show();
      });
    }
    catch (err) {
      alert("Error : " + err)
    }
  }

  Limpiar() {
    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'limpiar');
      }
    }
    this.FormDevolucionSolicitud.reset();
    this.FormDevolucionDetalle.reset();
    this.detallessolicitudespaginacion  = [];
    this.detallessolicitudes            = [];
    this.arreegloDetalleSolicitudpaginacion=[];
    this.arreegloDetalleSolicitud       = [];
    this.paramdevolucion                = [];
    this.numsolic                       = false;
    this._Solicitud                     = null;
    this.existsolicitud                 = false;
    this.validadato                     = false;
    this.activabtnimprime               = false;
    this.solicitudseleccion             = [];
    this.activabtndevoltotal            = false;
    this.desactivabtnelim               = false;
    this.bloqbtnagregar                 = false;
    this.ActivaBotonBuscaGrilla         = false;
    this._Solicitud                     = undefined;
  }
  cambio_cantidad(id: number, property: string, registro:DespachoDetalleSolicitud ) {
    if (this.detallessolicitudespaginacion[id]["sodeid"] == 0) {
      this.detallessolicitudespaginacion[id]["acciond"] = "I";
    }
    if (this.detallessolicitudespaginacion[id]["sodeid"] > 0) {
      this.detallessolicitudespaginacion[id]["acciond"] = "M";
    }
    this.detallessolicitudespaginacion[id][property] = this.detallessolicitudespaginacion[id][property]

  }

  updateList(id: number, property: string, event: any) {
    var editField = event.target.textContent;
    if (property == 'cantidadadevolver') {
      if (this.detallessolicitudes[id].cantdespachada - this.detallessolicitudes[id].cantdevolucion >= parseInt(editField)) {
        this.detallessolicitudespaginacion[id][property] = parseInt(editField);
        this.detallessolicitudes[id][property] = this.detallessolicitudespaginacion[id][property];

      } else { //console.log("entra al else")

      }
    }
  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;

  }

  /* Función búsqueda con paginación */

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arreegloDetalleSolicitudpaginacion = this.arreegloDetalleSolicitud.slice(startItem, endItem);
  }

  pageChangedDespacho(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detallessolicitudespaginacion = this.detallessolicitudes.slice(startItem, endItem);
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

  onImprimir(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.imprimir.devolucion.solicitud'),
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

    this._imprimesolicitudService.RPTImprimeDevolucionSolicitudBodega(this.servidor,this.hdgcodigo,this.esacodigo,
    this.cmecodigo,"pdf",this._Solicitud.soliid).subscribe(
      response => {
        if (response != null) {
          window.open(response[0].url, "", "");
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.devolucion.solicitud');
        this.alertSwalError.show();
        this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
        })
      }
    );
  }


  ActivaBotonDevolver()
  {
     if (this.detallessolicitudespaginacion.length >0    ) {
      return true
     } else {
      return false
     }
  }


  ActivaBotonImprimir()
  {
    let cantidad_devuelta =0;


    this.arreegloDetalleSolicitudpaginacion.forEach(element => {
      cantidad_devuelta = cantidad_devuelta + element.cantdevolucion
     });

     if (cantidad_devuelta >0) {
      return true
     } else {
      return false
     }


  }

  ConfirmaEliminaProductoDeLaGrilla(registro: DespachoDetalleSolicitud, id: number) {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.eliminacion.producto.devolucion'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion.producto'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.EliminaProductoDeLaGrilla(registro, id);
      }
    })
  }

  EliminaProductoDeLaGrilla(registro: DespachoDetalleSolicitud, id: number) {

    this.detallessolicitudes.splice(id, 1);
    this.detallessolicitudespaginacion = this.detallessolicitudes.slice(0,20);
    this.activabtndevoltotal = true;
  }

  async ConfirmarDevolucionCompleta() {
    const Swal = require('sweetalert2');

    const confirmaDevolucionCompleta = await Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.devolver.solicitud.completa'),
      type: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
    }).then((result) => result.value);

    if (!confirmaDevolucionCompleta) {
      return;
    }

    this.DevolverSolicitudCompleta();
  }

  private async DevolverSolicitudCompleta() {
    const Swal = require('sweetalert2');

    // Buscar productos a devolver
    this.solicitudseleccion = await this._SolicitudService
      .BuscaProductoRecepcionBodegaTotal(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,
        this.solicitud,
      )
      .toPromise();

    const detalleDevolucion = this.solicitudseleccion.map((data) => {
      const temporal = new DespachoDetalleSolicitud();
      temporal.lote = data.lote;
      temporal.fechavto = data.fechavto;
      temporal.cantidadadevolver = data.cantrecepcionada - data.cantdevuelta;
      temporal.mfdeid = data.mfdeid;
      temporal.cantrecepcionado = data.cantrecepcionada;
      temporal.cantdevolucion = data.cantdevuelta;
      temporal.codmei = data.codmei;
      temporal.meindescri = data.meindescri;
      temporal.meinid = data.meinid;
      temporal.cantsoli = data.cantsoli;
      temporal.cantdespachada = data.cantdespachada;
      temporal.sodeid = data.sodeid;
      temporal.cantrecepcionada = data.cantrecepcionada;
      temporal.soliid = data.soliid;
      temporal.bloqcampogrilla = true;

      return temporal;
    });

    // Revisar que cantidad a devolver este buena
    const productosSinCantidad = detalleDevolucion.filter((d) => d.cantidadadevolver <= 0);
    if (productosSinCantidad.length > 0) {
      const articulosMalos = productosSinCantidad
        .map((d) => `<p>Artículo ${d.codmei} tiene cantidad a devolver ${d.cantidadadevolver} </p>`)
        .join(' ');

      await Swal.fire({
        type: 'error',
        title: this.TranslateUtil('key.mensaje.productos.sin.cantidad.suficiente.para.devolver'),
        html: articulosMalos,
        confirmButtonColor: '#3085d6',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      });
      return;
    }

    // Revisar stock
    const { stockBueno, detalleStockMalos } = await this.validaStock(detalleDevolucion);
    if (!stockBueno) {
      await Swal.fire({
        type: 'error',
        title: this.TranslateUtil('key.mensaje.articulos.sin.stock.suficiente'),
        html: detalleStockMalos,
        confirmButtonColor: '#3085d6',
        width: '700px',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      });
      return;
    }

    // Realizar devolucion
    this.detallessolicitudes = detalleDevolucion;
    this.DevolucionSolictud(this.detallessolicitudes);
  }

  async CambioCheck(registro: DespachoDetalleSolicitud,id:number,event:any,marcacheckgrilla: boolean){
    // console.log("registro de chec",registro)
    if(event.target.checked){
      registro.marcacheckgrilla = true;
      this.desactivabtnelim = true;
      await this.isEliminaIdGrilla(registro)
      await this.detallessolicitudes.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;
          // console.log("recorre la grilla para ver si hay check",d.marcacheckgrilla,this.desactivabtnelim)
        }
      })
     }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelim = false;
      await this.isEliminaIdGrilla(registro);
      await this.detallessolicitudes.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;

        }
      })

    }
    // console.log("chec modificado",registro)
  }

  isEliminaIdGrilla(registro: DespachoDetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.detallessolicitudes) {
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
    // console.log("Valor a eliminar:")

    this.detallessolicitudespaginacion.forEach(registro=>{
      if (registro.acciond == "" && this.IdgrillaDevolucion(registro) >= 0 && registro.sodeid > 0) {
        // Elominar registro nuevo la grilla
        if(registro.marcacheckgrilla === true){

          this.desactivabtnelim = false;
          this.detallessolicitudes.splice(this.IdgrillaDevolucion(registro), 1);
          this.detallessolicitudespaginacion = this.detallessolicitudes.slice(0, 20);
          this.logicaVacios();
        }
      } else {
        // elimina uno nuevo pero que se ha modificado la cantidad
        if(registro.marcacheckgrilla === true){

          this.desactivabtnelim = false;
          this.detallessolicitudes.splice(this.IdgrillaDevolucion(registro), 1);
          this.detallessolicitudespaginacion = this.detallessolicitudes.slice(0, 20);
          this.logicaVacios();
          // elimina uno que ya existe
          //this.arregloDetalleProductoSolicitud[id].acciond = 'E';
          //this.ModificarSolicitud("M");
        }
      }
    })
    if(this.detallessolicitudespaginacion.length===0){
      this.activabtndevoltotal = true;
    }
  }

  async logicaVacios() {
    this.vaciosProductos();
    if (this.vacios === true) {
      this.verificanull = false;
    }
    else {
      this.verificanull = true;
    }

  }

  vaciosProductos() {
    if (this.detallessolicitudespaginacion.length) {
      for (var data of this.detallessolicitudespaginacion) {

          if (data.cantidadadevolver <= 0 || data.cantidadadevolver === null) {
            this.vacios = true;

            return;
          }else{
            this.vacios = false;

          }
      }
    }else{

      this.vacios = true;
    }
  }

  async findArticuloGrilla() {
    this.loading = true;
    var codProdAux = "";
    var descProdAux = "";
    let _DetalleDespacho  : DespachoDetalleSolicitud;
    // console.log('this.FormDatosProducto.controls.codigo.value : ' , this.FormDatosProducto.controls.codigo);
    if ( this.FormDatosProducto.controls.codigo.touched &&
    this.FormDatosProducto.controls.codigo.status !== 'INVALID') {

      codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
    }
    if ( this.FormDatosProducto.controls.descripcion.touched &&
    this.FormDatosProducto.controls.descripcion.status !== 'INVALID') {

      descProdAux = this.FormDatosProducto.controls.descripcion.value.toString();
    }

      if(this.FormDevolucionSolicitud.controls.numsolicitud.value >0){


        this._SolicitudService.BuscaSolicitud(this.FormDevolucionSolicitud.controls.numsolicitud.value,
          this.hdgcodigo,this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, 0,
          0, 0, 0, 0, "", 0,codProdAux,descProdAux).subscribe(response => {

            if(response[0].solicitudesdet.length > 0 ){
              this.arreegloDetalleSolicitud = [];
              this.arreegloDetalleSolicitudpaginacion = [];
              this._Solicitud = response[0];
              if (this._Solicitud.soliid > 0) {
                this.numsolic = true;
              }

              this.existsolicitud = true;
              this.FormDatosProducto.reset();
              var fechacreacion;
              if(this._Solicitud.estadosolicitud ==70 && this.detallessolicitudes.length==0){
                this.activabtndevoltotal = true;
              }
              this.FormDevolucionSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
              this.FormDevolucionSolicitud.get('boddestino').setValue(this._Solicitud.boddestinodesc);
              this.FormDevolucionSolicitud.get('bodorigen').setValue(this._Solicitud.bodorigendesc);
              fechacreacion = this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy');

              this.FormDevolucionSolicitud.get('fechamostrar').setValue(fechacreacion);
              this.FormDevolucionSolicitud.get('esticod').setValue(this._Solicitud.estadosolicitudde);
              this.FormDevolucionSolicitud.get('prioridad').setValue(this._Solicitud.desprioridadsoli);
              this.solicitud = this._Solicitud.soliid;
              this.focusField.nativeElement.focus();
              if(this._Solicitud.estadosolicitud == 10 || this._Solicitud.estadosolicitud == 50 ||
                this._Solicitud.estadosolicitud == 40 || this._Solicitud.estadosolicitud == 110){
                this.bloqbtnagregar = true;
                this.FormDevolucionDetalle.controls.codigo.disable();
              }
              this.arreegloDetalleSolicitud = response[0].solicitudesdet;
              this.arreegloDetalleSolicitudpaginacion = this.arreegloDetalleSolicitud.slice(0, 20);

              this.ActivaBotonLimpiaBusca = true;
            }else{
              this.FormDatosProducto.reset();
              this.ActivaBotonLimpiaBusca = false;
            }
          }
        );

        this.ActivaBotonBuscaGrilla = true;
        // this.ActivaBotonLimpiaBusca = true;
        this.loading = false;
        return;
      }else{ //Cuando la plantilla aún no se crea
        this.arreegloDetalleSolicitud_2 = [];
        if(this.FormDevolucionSolicitud.controls.numsolicitud.value === null){
          this.arreegloDetalleSolicitud.forEach(x=>{
            if(x.codmei === codProdAux){
              this.arreegloDetalleSolicitud_2.unshift(x);
            }
          })
          this.arreegloDetalleSolicitud = [];
          this.arreegloDetalleSolicitudpaginacion = [];
          this.arreegloDetalleSolicitud = this.arreegloDetalleSolicitud_2;
          this.arreegloDetalleSolicitudpaginacion = this.arreegloDetalleSolicitudpaginacion.slice(0,20);
          this.ActivaBotonLimpiaBusca = true;
        }
      }

  }

  limpiarCodigo() {
    this.loading = true;

    this.FormDatosProducto.controls.codigo.reset();
    var codProdAux = '';

    this.arreegloDetalleSolicitud = [];
    this.arreegloDetalleSolicitudpaginacion = [];


    // Llenar Array Auxiliares
    this.arreegloDetalleSolicitud = this.arreegloDetalleSolicitud_aux;
    this.arreegloDetalleSolicitudpaginacion = this.arreegloDetalleSolicitudpaginacion_aux;
    this.ActivaBotonLimpiaBusca = false;

    this.loading = false;
  }

  getProductoDescrip(){
    this.loading = true;
    this.descprod = this.FormDatosProducto.controls.descripcion.value;
    if (this.descprod === null || this.descprod === '') {
      return;
      // this.addArticuloGrilla();
    } else {

      // this.onBuscarProducto();
      this.loading = false;

      // console.log("bodcodigo", idBodega);
    }
  }

  salir(){
    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'salir');
      }
    }

    this.route.paramMap.subscribe(param=>{
      if (param.has("id_solicitud")) {
        this.router.navigate(['monitorejecutivo']);
      } else {
        this.router.navigate(['home']);
      }
    })
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {​​​​​​​​
    console.log("Processing beforeunload...");
    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
  }
  
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }​​​​​​​​
}
