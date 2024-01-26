import { Component, OnInit,ViewChild, HostListener, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';
import { Solicitud } from 'src/app/models/entity/Solicitud';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { MovimientosFarmacia } from '../../models/entity/MovimientosFarmacia'
import { MovimientosFarmaciaDet } from '../../models/entity/MovimientosFarmaciaDet'
import { MovimientosfarmaciaService } from '../../servicios/movimientosfarmacia.service';
import { EventosSolicitudComponent } from '../eventos-solicitud/eventos-solicitud.component';
import { EventosDetallesolicitudComponent } from '../eventos-detallesolicitud/eventos-detallesolicitud.component';
import { DespachoDetalleSolicitud } from 'src/app/models/entity/DespachoDetalleSolicitud';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { BusquedasolicitudesComponent } from '../busquedasolicitudes/busquedasolicitudes.component';
import { Detallelote } from '../../models/entity/Detallelote';
import { ProductoRecepcionBodega } from 'src/app/models/entity/ProductoRecepcionBodega';
import { ParamDetRecepDevolBodega } from '../../models/entity/ParamDetRecepDevolBodega';
import { ParamRecepDevolBodega } from '../../models/entity/ParamRecepDevolBodega';
import { InformesService } from '../../servicios/informes.service';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { element } from 'protractor';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-recepciondevolucionentrebodegas',
  templateUrl: './recepciondevolucionentrebodegas.component.html',
  styleUrls: ['./recepciondevolucionentrebodegas.component.css'],
  providers: [SolicitudService, InformesService]
})
export class RecepciondevolucionentrebodegasComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalGrilla', { static: false }) alertSwalGrilla: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;


  public modelopermisos                 : Permisosusuario = new Permisosusuario();
  public FormRecepcionDevolucion        : FormGroup;
  public FormRecepcionDevolucionDetalle : FormGroup;
  public FormDatosProducto              : FormGroup;
  public hdgcodigo                      : number;
  public esacodigo                      : number;
  public cmecodigo                      : number;
  public solicitud                      : number;
  public usuario                        = environment.privilegios.usuario;
  public servidor                       = environment.URLServiciosRest.ambiente;
  public detallessolicitudes            : Array<DespachoDetalleSolicitud> = [];
  public detallessolicitudespaginacion  : Array<DespachoDetalleSolicitud> = [];
  public _Solicitud                     : Solicitud;
  public detalleslotes                  : Detallelote[]=[];
  public _DetalleSolicitud              : DetalleSolicitud;
  public arreegloDetalleSolicitud         : Array<DetalleSolicitud> = [];
  public arreegloDetalleSolicitudpaginacion: Array<DetalleSolicitud> = [];
  public listaDetalleSolicitud          : Array<DetalleSolicitud> = [];
  public listaDetalleSolicitudpaginacion: Array<DetalleSolicitud> = [];
  public listaDetalleSolicitud_aux      : Array<DetalleSolicitud> = [];
  public listaDetalleSolicitudpaginacion_aux: Array<DetalleSolicitud> = [];
  public listaDetalleSolicitud_2        : Array<DetalleSolicitud> = [];
  public numsolic                       : boolean = false;
  public validadato                       : boolean = false;
  _MovimientosFarmacia                  : MovimientosFarmacia;
  public arregloMovimientosFarmaciaDet  : Array<MovimientosFarmaciaDet> = [];
  public arregloMovimientosFarmaciaDetPaginacion: Array<MovimientosFarmaciaDet> = [];
  public alerts                         : Array<any> = [];
  public fechavto                       : string
  public fechavto1                      : string;
  public lote                           : string;
  public paramrecepcion                 : ParamDetRecepDevolBodega[]=[];
  public locale                         = 'es';
  public bsConfig                       : Partial<BsDatepickerConfig>;
  public colorTheme                     = 'theme-blue';
  private _BSModalRef                   : BsModalRef;
  public productosrecepcionadospaginacion : Array<ProductoRecepcionBodega> =[];
  public productosrecepcionados         : Array<ProductoRecepcionBodega> =[];
  public solicitudseleccion             : Array<ProductoRecepcionBodega> = [];
  public RecepcionBodega                : ParamRecepDevolBodega;
  public activabtnrecepdevol            : boolean = false;
  public activabtnimprime               : boolean = false;
  public vacios                         : boolean = true;
  public bloqbtnagregar                 : boolean = false;
  public loading                        : boolean = false;
  public ActivaBotonBuscaGrilla         : boolean = false;
  public ActivaBotonLimpiaBusca         : boolean = false;
  public estado_aux                     : number;

  constructor(
    private formBuilder                 : FormBuilder,
    public _BsModalService              : BsModalService,
    public datePipe                     : DatePipe,
    public localeService                : BsLocaleService,
    public _SolicitudService            : SolicitudService,
    public _buscasolicitudService       : SolicitudService,
    public _MovimientosfarmaciaService  : MovimientosfarmaciaService,
    private _imprimesolicitudService    : InformesService,
    private router                      : Router,
    private route                       : ActivatedRoute,
    public translate: TranslateService
  ) {
    this.FormRecepcionDevolucion = this.formBuilder.group({
      numsolicitud  : [{ value: null, disabled: true }, Validators.required],
      esticod       : [{ value: null, disabled: true }, Validators.required],
      hdgcodigo     : [{ value: null, disabled: false }, Validators.required],
      esacodigo     : [{ value: null, disabled: false }, Validators.required],
      cmecodigo     : [{ value: null, disabled: false }, Validators.required],
      prioridad     : [{ value: null, disabled: true }, Validators.required],
      fechamostrar  : [{ value: new Date(), disabled: true }, Validators.required],
      bodorigen     : [{ value: null, disabled: true }, Validators.required],
      boddestino    : [{ value: null, disabled: true }, Validators.required],

    });

    // this.FormRecepcionDevolucionDetalle = this.formBuilder.group({
    //   codigo  : [{ value: null, disabled: false }, Validators.required],
    // });
    // this.FormDatosProducto = this.formBuilder.group({
    //   codigo  : [{ value: null, disabled: false }, Validators.required]
    // });

  }

  ngOnInit() {
    this.FormRecepcionDevolucionDetalle = this.formBuilder.group({
      codigo  : [{ value: null, disabled: false }, Validators.required],
    });
    this.FormDatosProducto = this.formBuilder.group({
      codigo  : [{ value: null, disabled: false }, Validators.required]
    });
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.setDate();
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

  Limpiar() {
    if (this._Solicitud != undefined && this._Solicitud.bandera != 2) {
      this.ValidaEstadoSolicitud(1, 'limpiar');
    }

    this.FormRecepcionDevolucion.reset();
    this.FormRecepcionDevolucionDetalle.reset();
    this.listaDetalleSolicitudpaginacion = [];
    this.listaDetalleSolicitud = [];
    this.detallessolicitudespaginacion = [];
    this.detallessolicitudes = [];
    this.productosrecepcionadospaginacion = [];
    this.productosrecepcionados = [];
    this.activabtnrecepdevol = false;
    this.activabtnimprime = false;
    this.solicitudseleccion = [];
    this.bloqbtnagregar = false;
    this.FormRecepcionDevolucionDetalle.controls.codigo.enable();
    this.ActivaBotonBuscaGrilla = false;
    this._Solicitud = undefined;
    this.numsolic = false;
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud.slice(startItem, endItem);
  }

  pageChangedRecepcion(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detallessolicitudespaginacion = this.detallessolicitudes.slice(startItem, endItem);
  }

  BuscarSolicitud() {

    this.loading = true;
    console.log("this.solicitudpaciente", this._Solicitud)
    if(this._Solicitud != undefined){
      console.log("this.solicitudpaciente.bandera", this._Solicitud.bandera)
      if(this._Solicitud.bandera === 1){  //Si bandera es =2 solicitud tomada
        this.ValidaEstadoSolicitud(1,'BuscaSolicitudes');
      }
    }
    this._BSModalRef = this._BsModalService.show(BusquedasolicitudesComponent, this.setModalBusquedaSolicitud());
    this._BSModalRef.content.onClose.subscribe((RetornoSolicitudes: Solicitud) => {
      if (RetornoSolicitudes == undefined) { }
      else {

        this._SolicitudService.BuscaSolicitud(RetornoSolicitudes.soliid, this.hdgcodigo,
        this.esacodigo, this.cmecodigo, 0,"","", 0,0,0,this.servidor, 0,0,0,0,0,0,"",0, "","").subscribe(
        response => {
          if (response != null) {
            this._Solicitud = new (Solicitud);
            this._Solicitud = response[0];
            this.estado_aux = this._Solicitud.estadosolicitud;
            this.FormRecepcionDevolucion.get('numsolicitud').setValue(this._Solicitud.soliid);
            if (this._Solicitud.soliid > 0) {
              this.numsolic = true;
              this.solicitud= this._Solicitud.soliid;
              this.FormRecepcionDevolucion.get('numsolicitud').setValue(this._Solicitud.soliid);
              this.FormRecepcionDevolucion.get('boddestino').setValue(this._Solicitud.boddestinodesc);
              this.FormRecepcionDevolucion.get('bodorigen').setValue(this._Solicitud.bodorigendesc);
              this.FormRecepcionDevolucion.get('fechamostrar').setValue(new Date(this._Solicitud.fechacreacion));
              this.FormRecepcionDevolucion.get('esticod').setValue(this._Solicitud.estadosolicitudde);
              this.FormRecepcionDevolucion.get('prioridad').setValue(this._Solicitud.desprioridadsoli);

              if(this._Solicitud.estadosolicitud == 10 || this._Solicitud.estadosolicitud == 50 ||
                this._Solicitud.estadosolicitud == 40 || this._Solicitud.estadosolicitud == 110){
                this.bloqbtnagregar = true;
                this.FormRecepcionDevolucionDetalle.controls.codigo.disable();
              }
              this.listaDetalleSolicitud = response[0].solicitudesdet;
              this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud.slice(0, 20);
              this.ActivaBotonBuscaGrilla = true;
              this.loading = false;
              this.listaDetalleSolicitud_aux = this.listaDetalleSolicitud;
              this.listaDetalleSolicitudpaginacion_aux = this.listaDetalleSolicitudpaginacion;

              if(this._Solicitud.bandera === 2){ //Si bandera es =2 solicitud tomada
                this.activabtnrecepdevol = false;
                this.bloqbtnagregar = true;
                this.FormRecepcionDevolucionDetalle.disable();

                this.detallessolicitudes.forEach(x=>{
                  x.bloqcampogrilla = false;
                x.bloqcampogrilla2 = false;
                })
                this.detallessolicitudespaginacion = this.detallessolicitudes.slice( 0,20);
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                this.alertSwalAlert.show();

              }else{
                this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
              }
            }
          }
        });
      }
    }
    );
  }

  ValidaEstadoSolicitud(bandera: number, nada:string){
    console.log("Valida estado solicitud",this._Solicitud)
    // console.log("Datos a enviar N soli, estado",this._Solicitud.estadosolicitud,this._Solicitud.soliid)
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

  LlenaFormulario(Solicitud){
    this.FormRecepcionDevolucion.get('boddestino').setValue(this._Solicitud.boddestinodesc);
    this.FormRecepcionDevolucion.get('bodorigen').setValue(this._Solicitud.bodorigendesc);
    this.FormRecepcionDevolucion.get('fechamostrar').setValue(new Date(this._Solicitud.fechacreacion));
    this.FormRecepcionDevolucion.get('esticod').setValue(this._Solicitud.estadosolicitudde);
    this.FormRecepcionDevolucion.get('prioridad').setValue(this._Solicitud.desprioridadsoli);
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
        origen: 'Otros',
        paginaorigen: 5
      }
    };
    return dtModal;
  }

  codigo_ingresado(datosIngresados:any) {
    /* Si existe el código en la solicitud se propone la cantidad */
    this.listaDetalleSolicitud.forEach(element => {
      if (element.codmei.trim() == datosIngresados.codigo.trim()) {
        this.FormRecepcionDevolucionDetalle.get('cantidad').setValue(element.cantdevolucion);
        this.detalleslotes= element.detallelote;
        this.detalleslotes.forEach(element =>{
          this.FormRecepcionDevolucionDetalle.get('lote').setValue(element.lote);
        })
      }
    })
  }

  cambiofecha(lote: string){
    for(let lotes of this.detalleslotes) {
      if(lote == lotes.lote) {

        this.fechavto1=this.datePipe.transform(lotes.fechavto, 'dd-MM-yyyy');
        this.fechavto = lotes.fechavto;
        this.FormRecepcionDevolucionDetalle.get('fechavto').setValue(this.fechavto1);
        this.lote = lotes.lote;
      }
    }
  }

  BuscaproductoaRecepcionar(productos:any){
    this.listaDetalleSolicitud.forEach(element => {
      if (element.codmei.trim() == productos.codigo.trim()) {
        this.validadato= true;
      }

    });
    if(this.validadato == false){

      this.FormRecepcionDevolucionDetalle.reset();
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.valor.codigo.ingresado.no.pertenece.solicitud');
      this.alertSwalError.show();

    }

    this.productosrecepcionados = [];
    this._SolicitudService.BuscaProductosDevueltosBodega(this.hdgcodigo,this.esacodigo,this.cmecodigo,
      this.servidor,this.solicitud,this.FormRecepcionDevolucionDetalle.value.codigo,
      this.lote,this.fechavto).subscribe(
      response => {
        if (response != null) {
          if(response.length >1){
            this.alertSwalGrilla.reverseButtons = true;
            this.alertSwalGrilla.title = this.TranslateUtil('key.mensaje.seleccione.producto.devuelto.recepcionar');
            this.alertSwalGrilla.show();

            this.productosrecepcionados= response;
            this.productosrecepcionados.forEach(dat=>{
              if(dat.cantpendienterecepdevol == 0){
                dat.checkgrilla = true;
              }else{
                if(dat.cantpendienterecepdevol>0){
                  dat.checkgrilla = false;
                }
              }
            });
            this.productosrecepcionadospaginacion = this.productosrecepcionados.slice(0,20)
          }else{
            if(response.length ==1){
              this.solicitudseleccion=[];
              this.solicitudseleccion=response;
              this.onConfirm();
            }
          }
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title=this.TranslateUtil('key.mensaje.error.buscar.productos.recepcionados');
        this.alertSwalError.text = error;
        this.alertSwalError.show();
      }
    );
    this.validadato = false;
    this.FormRecepcionDevolucionDetalle.reset();


  }

  validacantidadgrilla(id: number,despacho: DetalleSolicitud){
    var idg =0;

    if(despacho.sodeid>0){
      if(this.IdgrillaDevolucion(despacho)>=0){
        idg = this.IdgrillaDevolucion(despacho)

        if(this.detallessolicitudes[idg].cantdevolarecepcionar > this.detallessolicitudes[idg].cantpendienterecepdevol ){

          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.recepcionar.debe.ser.menor.igual.devuelto');
          this.alertSwalAlert.show();
          // this.detallessolicitudes[idg].cantdevolarecepcionar = this.detallessolicitudes[idg].cantdevol   this.detallessolicitudes[idg].cantpendienterecepdevol
          // console.log("Deja valor pendiente a recepcionar",this.detallessolicitudes[idg].cantpendienterecepdevol)
          this.detallessolicitudes[idg].cantdevolarecepcionar = this.detallessolicitudes[idg].cantpendienterecepdevol;
          this.detallessolicitudespaginacion[idg].cantdevolarecepcionar = this.detallessolicitudes[idg].cantdevolarecepcionar;
          this.logicaVacios();
        }else{
          if(this.detallessolicitudes[idg].cantdevolarecepcionar <0){
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.cero');
            this.alertSwalAlert.show();
            this.detallessolicitudes[idg].cantdevolarecepcionar = this.detallessolicitudespaginacion[idg].cantpendienterecepdevol;
            this.detallessolicitudespaginacion[idg].cantdevolarecepcionar = this.detallessolicitudes[idg].cantdevolarecepcionar;
            this.logicaVacios();
          }else{
            if(this.detallessolicitudes[idg].cantdevolarecepcionar < despacho.cantdevolucion- despacho.sodecantrecepdevo || despacho.cantidadarecepcionar >0){
              this.logicaVacios();
            }
          }

        }
      }
    } this.logicaVacios();
  }

  IdgrillaDevolucion(registro: DetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.detallessolicitudes) {
      if (registro.codmei === articulo.codmei) {

        return indice;
      }
      indice++;
    }
    return -1;
  }

  onCheck(event: any, productorecepcionado: ProductoRecepcionBodega,id: number){// ProductoRecepcionBodega) {
    // console.log("proiducchechea",id,productorecepcionado)
    // this.solicitudseleccion=[];
    // console.log(this.inArray( productorecepcionado),this.solicitudseleccion);
    if (event.target.checked) {

        this.solicitudseleccion.push(productorecepcionado);

    } else {

      this.solicitudseleccion.splice(this.inArray( productorecepcionado), 1);
    }
  }


  onConfirm() {
    // console.log("datos a ingresar a la grilla 2",this.solicitudseleccion);
    this.solicitudseleccion.forEach(data=>{
      var temporal = new DespachoDetalleSolicitud;
      temporal.lote = data.lote;
      temporal.fechavto = data.fechavto;
      temporal.cantdevolarecepcionar = data.cantpendienterecepdevol;
      temporal.mfdeid = data.mfdeid;
      temporal.cantrecepcionado = data.cantrecepcionado;
      temporal.cantdevolucion = data.cantdevolucion;
      temporal.codmei = data.codmei;
      temporal.meindescri = data.meindescri;
      temporal.meinid = data.meinid;
      temporal.cantsoli = data.cantsoli;
      temporal.cantdespachada = data.cantdespachada;
      temporal.sodeid = data.sodeid;
      temporal.cantrecepcionada = data.cantrecepcionada;
      temporal.cantpendienterecepdevol = data.cantpendienterecepdevol;
      temporal.movfid = data.movfid;
      temporal.mdevid = data.mdevid;

      // if (temporal.cantidadadevolver > 0) {
      //   this.detallessolicitudes.unshift(temporal);
      // } else {

      //   this.alertSwalError.title = "Producto no tiene cantidad suficiente para devolver";
      //   this.alertSwalError.text = "Error";
      //   this.alertSwalError.show();
      //   return
      // }
      this.detallessolicitudes.unshift(temporal);
    })
    // console.log("Datos a la grillaaaa 2",this.detallessolicitudes)

    // this.activabtnrecepdevol = true;
    this.detallessolicitudespaginacion = this.detallessolicitudes.slice(0,20);
    this.logicaVacios();
    this.FormRecepcionDevolucionDetalle.reset();
    this.solicitudseleccion = [];
  }

  onCancel() {
    this.solicitudseleccion = [];
  }

  inArray( seleccion: ProductoRecepcionBodega) {
    let indice = 0;
    for (const objeto of this.solicitudseleccion) {
        if ( seleccion.mdevid === objeto.mdevid ) {
        return indice;
      }
      indice++;
    }
    return -1;
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

  addArticuloGrillaRecepcion(dispensacion: any) {

    this.detallessolicitudespaginacion=[];
    this.listaDetalleSolicitud.forEach(element => {
      if (element.codmei.trim() == dispensacion.codigo.trim()) {
        var temporal = new DetalleSolicitud
        temporal.codmei         = this.FormRecepcionDevolucionDetalle.value.codigo;
        temporal.meindescri     = element.meindescri;
        temporal.fechavto       = this.fechavto;
        temporal.lote           = this.FormRecepcionDevolucionDetalle.value.lote;
        temporal.cantadespachar = 0;
        temporal.soliid         = element.soliid;
        temporal.sodeid         = element.sodeid;
        temporal.meinid         = element.meinid;
        temporal.cantdespachada = element.cantdespachada;
        temporal.cantsoli       = element.cantsoli;
        temporal.stockorigen    = element.stockorigen;
        temporal.observaciones  = element.observaciones;
        temporal.cantdevolucion = element.cantdevolucion;
        temporal.cantrecepcionado= element.cantrecepcionado;
        temporal.cantidadadevolver = 0;
        temporal.cantidadarecepcionar = this.FormRecepcionDevolucionDetalle.value.cantidad;

        this.detallessolicitudes.unshift(temporal);
        this.detallessolicitudespaginacion = this.detallessolicitudes.slice(0,20)
      }

    });
    this.FormRecepcionDevolucionDetalle.reset(); this.detalleslotes=[];
  }

  codigo_ingresado1(datosIngresados:any) {

    /* Si existe el código en la solicitud se propone la cantidad */
    this.arreegloDetalleSolicitud.forEach(element => {
      if (element.codmei.trim() == datosIngresados.codigo.trim()) {
        this.FormRecepcionDevolucionDetalle.get('cantidad').setValue(element.cantdespachada);
      }
    })
  }

  ConfirmarEnviarRecepcion(datos:any){
    const Swal = require('sweetalert2');

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.recepcionar.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.recepcion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.RecepcionarDevolucion(datos);
      }
    })
  }

  RecepcionarDevolucion(datos){
    this.paramrecepcion =[];
    var fecharecepcion =this.datePipe.transform(new Date(), 'yyyy-MM-dd ')//; new Date();
    this.detallessolicitudes.forEach(element => {
      var temporal = new ParamDetRecepDevolBodega  // new DespachoDetalleSolicitud

      temporal.sodeid            = element.sodeid;
      temporal.movfid            = element.movfid;
      temporal.mfdeid            = element.mfdeid;
      temporal.fecharecepcion    = fecharecepcion;
      temporal.lote              = element.lote;
      temporal.fechavto          = element.fechavto;
      temporal.cantrecepcionada  = element.cantrecepcionada;
      temporal.cantdevuelta      = element.cantdevolucion;
      temporal.codmei            = element.codmei;
      temporal.meindescri        = element.meindescri;
      temporal.cantsoli          = element.cantsoli;
      temporal.cantdespachada    = element.cantrecepcionada;
      temporal.cantdevolucion    = element.cantdevolucion;
      temporal.cantrecepcionado  = element.cantrecepcionado;
      temporal.cantdevolarecepcionar = element.cantdevolarecepcionar;
      temporal.meinid            = element.meinid;
      temporal.mdevid            = element.mdevid;

      this.paramrecepcion.push(temporal);
    });

    this.RecepcionBodega = new (ParamRecepDevolBodega);
    this.RecepcionBodega.hdgcodigo = this.hdgcodigo;
    this.RecepcionBodega.esacodigo = this.esacodigo;
    this.RecepcionBodega.cmecodigo = this.cmecodigo;
    this.RecepcionBodega.servidor = this.servidor;
    this.RecepcionBodega.usuariodespacha = this.usuario;
    this.RecepcionBodega.soliid = this.solicitud;
    this.RecepcionBodega.solibodorigen = this._Solicitud.bodorigen;
    this.RecepcionBodega.soliboddestino = this._Solicitud.boddestino;
    this.RecepcionBodega.paramdetdevolbodega = this.paramrecepcion;
    // console.log("A devolver final",this.RecepcionBodega)
    this._SolicitudService.RecepcionDevolucionBodegas(this.RecepcionBodega).subscribe(
      response => {
        if (response != null) {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.recepcion.exitosa');
            this.alertSwal.show();
            this.detallessolicitudespaginacion =[];
            this.detallessolicitudes=[];
            this._buscasolicitudService.BuscaSolicitud(this.solicitud, this.hdgcodigo, this.esacodigo,
            this.cmecodigo, null, null, null, null, null, null, this.servidor, 0, 0, 0, 0, 0, 0, "",0,
            "","").subscribe(
              response => {
                if (response != null) {
                  this.estado_aux = this._Solicitud.estadosolicitud;
                  this.FormRecepcionDevolucion.get('boddestino').setValue(response[0].boddestinodesc);
                  this.FormRecepcionDevolucion.get('bodorigen').setValue(response[0].bodorigendesc);
                  this.FormRecepcionDevolucion.get('fechamostrar').setValue(new Date(response[0].fechacreacion));
                  this.FormRecepcionDevolucion.get('esticod').setValue(response[0].estadosolicitudde);
                  this.FormRecepcionDevolucion.get('prioridad').setValue(response[0].desprioridadsoli);
                  this.activabtnimprime = true;
                  this.listaDetalleSolicitud = response[0].solicitudesdet;
                  this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud.slice(0, 20);
                  this.logicaVacios();

                  if(this._Solicitud.bandera === 2){//Si bandera es =2 solicitud tomada
                    this.activabtnrecepdevol = false;
                    this.bloqbtnagregar = false;
                    this.FormRecepcionDevolucionDetalle.disable();
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
              },
              error => {
                console.log(error);
                this.alertSwalError.title=this.TranslateUtil('key.mensaje.error.buscar.solicitudes');
                this.alertSwalError.text = error;
                this.alertSwalError.show();

              });
            this.productosrecepcionados=[]; this.productosrecepcionadospaginacion=[];
            }
      },error => {
        console.log(error);
        this.alertSwalError.title=this.TranslateUtil('key.mensaje.error.recepcionar.solicitud');
        this.alertSwalError.text = error;
        this.alertSwalError.show();
      });
  }

  eventosSolicitud() {

    // sE CONFIRMA Eliminar Solicitud
    this._BSModalRef = this._BsModalService.show(EventosSolicitudComponent, this.setModalEventoSolicitud());
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
      title: this.TranslateUtil('key.mensaje.pregunta.imprimir.recepcion.solicitud'),
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


    this._imprimesolicitudService.RPTImprimeRecepDevolSolicitudBodega(this.servidor,this.hdgcodigo,this.esacodigo,
    this.cmecodigo,"pdf", this._Solicitud.soliid,this.usuario).subscribe(
      response => {
        if (response != null) {
          window.open(response[0].url, "", "");
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.recepcion.devolucion.solicitud');
        this.alertSwalError.show();
        this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
        })
      }
    );
  }

  async logicaVacios() {
    this.vaciosProductos();
    if (this.vacios === true) {
      this.activabtnrecepdevol = false;
    }
    else {
      this.activabtnrecepdevol = true;
    }

  }

  vaciosProductos() {
    if (this.detallessolicitudespaginacion.length) {
      for (var data of this.detallessolicitudespaginacion) {
        console.log("recorre linea a buscar 0",data)
        if (data.cantdevolarecepcionar <= 0 || data.cantdevolarecepcionar === null) {
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
    let _DetalleDespacho  : DespachoDetalleSolicitud;
    // console.log('this.FormDatosProducto.controls.codigo.value : ' , this.FormDatosProducto.controls.codigo);
    if ( this.FormDatosProducto.controls.codigo.touched &&
        this.FormDatosProducto.controls.codigo.status !== 'INVALID') {
        var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
      if(this.FormRecepcionDevolucion.controls.numsolicitud.value >0){

        this.arreegloDetalleSolicitud = [];
        this.arreegloDetalleSolicitudpaginacion = [];

        console.log(this.FormRecepcionDevolucion.controls.numsolicitud.value,
          this.hdgcodigo,this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, 0,
          0, 0, 0, 0, "",0,codProdAux)
        console.log("prod a buscar en la grilla",codProdAux,this.FormRecepcionDevolucion.controls.numsolicitud.value)

        this._SolicitudService.BuscaSolicitud(this.FormRecepcionDevolucion.controls.numsolicitud.value,
        this.hdgcodigo,this.esacodigo, this.cmecodigo, 0,"","", 0,0,0,this.servidor, 0,0,0,0,
          0,0,"",0,codProdAux,"").subscribe(response => {
            if (response != null) {
              if(response[0].solicitudesdet.length > 0 ){
                this._Solicitud = new (Solicitud);
                this._Solicitud = response[0];
                              console.log("Solicitud",this._Solicitud)
                this.FormRecepcionDevolucion.get('numsolicitud').setValue(this._Solicitud.soliid);
                if (this._Solicitud.soliid > 0) {
                  this.numsolic = true;
                  this.solicitud= this._Solicitud.soliid;
                  this.FormRecepcionDevolucion.get('numsolicitud').setValue(this._Solicitud.soliid);
                  this.FormRecepcionDevolucion.get('boddestino').setValue(this._Solicitud.boddestinodesc);
                  this.FormRecepcionDevolucion.get('bodorigen').setValue(this._Solicitud.bodorigendesc);
                  this.FormRecepcionDevolucion.get('fechamostrar').setValue(new Date(this._Solicitud.fechacreacion));
                  this.FormRecepcionDevolucion.get('esticod').setValue(this._Solicitud.estadosolicitudde);
                  this.FormRecepcionDevolucion.get('prioridad').setValue(this._Solicitud.desprioridadsoli);
                  this.focusField.nativeElement.focus();
                  if(this._Solicitud.estadosolicitud == 10 || this._Solicitud.estadosolicitud == 50 ||
                    this._Solicitud.estadosolicitud == 40 || this._Solicitud.estadosolicitud == 110){
                    this.bloqbtnagregar = true;
                    this.FormRecepcionDevolucionDetalle.controls.codigo.disable();
                  }
                  this.listaDetalleSolicitud = response[0].solicitudesdet;
                  this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud.slice(0, 20);

                  this.loading = false;
                }
              }else{
                this.FormDatosProducto.reset();
                this.ActivaBotonLimpiaBusca = false;
              }
            } else {
              this.loading = false;
            }
          });


        this.ActivaBotonBuscaGrilla = true;
        this.ActivaBotonLimpiaBusca = true;
        this.loading = false;
        return;
      }else{ //Cuando la plantilla aún no se crea
        this.listaDetalleSolicitud_2 = [];
        if(this.FormRecepcionDevolucion.controls.numsolicitud.value === null){
          this.arreegloDetalleSolicitud.forEach(x=>{
            if(x.codmei === codProdAux){
              this.listaDetalleSolicitud_2.unshift(x);
            }
          })
          this.listaDetalleSolicitud = [];
          this.listaDetalleSolicitudpaginacion = [];
          this.listaDetalleSolicitud = this.listaDetalleSolicitud_2;
          this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud.slice(0,20);
          this.ActivaBotonLimpiaBusca = true;
        }
      }
    }else{
      this.limpiarCodigo();
      this.loading = false;
      return;
    }
  }

  limpiarCodigo() {
    this.loading = true;

    console.log("auxs",this.listaDetalleSolicitudpaginacion_aux,this.listaDetalleSolicitud_aux)
    this.FormDatosProducto.controls.codigo.reset();
    var codProdAux = '';

    this.listaDetalleSolicitud = [];
    this.listaDetalleSolicitudpaginacion = [];


    // Llenar Array Auxiliares
    this.listaDetalleSolicitud = this.listaDetalleSolicitud_aux;
    this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitudpaginacion_aux;
    this.ActivaBotonLimpiaBusca = false;

    this.loading = false;
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
    // Do more processing...
    event.returnValue = false;
  }
  
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }​​​​​​​​
}
