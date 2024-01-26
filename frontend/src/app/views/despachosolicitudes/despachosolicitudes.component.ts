import { Component, OnInit, ViewChild, Input, HostListener, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { BusquedasolicitudesComponent } from '../busquedasolicitudes/busquedasolicitudes.component';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { DespachoSolicitud } from '../../models/entity/DespachoSolicitud';
import { DespachoDetalleSolicitud } from 'src/app/models/entity/DespachoDetalleSolicitud';
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';
import { Solicitud } from 'src/app/models/entity/Solicitud';
import { EventosSolicitudComponent } from '../eventos-solicitud/eventos-solicitud.component';
import { EventosDetallesolicitudComponent } from '../eventos-detallesolicitud/eventos-detallesolicitud.component';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { Detallelote } from '../../models/entity/Detallelote';
import { InformesService } from '../../servicios/informes.service';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { SaldoLoteBodega } from '../../models/entity/SaldoLoteBodega';
import { ConfirmaStockBodSuministroEntrada } from 'src/app/models/confirmaStockBodSuministroEntrada';
import { ConfirmaStockBodSuministroSalida } from 'src/app/models/confirmaStockBodSuministroSalida';
import { Subscription } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-despachosolicitudes',
  templateUrl: './despachosolicitudes.component.html',
  styleUrls: ['./despachosolicitudes.component.css'],
  providers: [InformesService]
})
export class DespachosolicitudesComponent implements OnInit {

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;

  public modelopermisos                 : Permisosusuario = new Permisosusuario();
  public FormDespachoSolicitud          : FormGroup;
  public FormDespachoSolicitud2         : FormGroup;
  public FormDatosProducto              : FormGroup;
  public hdgcodigo                      : number;
  public esacodigo                      : number;
  public cmecodigo                      : number;
  public lote                           : string;
  public fechavto                       : string;
  public DespachoSolicitud              : DespachoSolicitud;
  public varDespachoDetalleSolicitud    : DespachoDetalleSolicitud;
  public numsolic                       : boolean = false;
  public validadato                     : boolean = false;
  public listaDetalleSolicitud          : Array<DetalleSolicitud> = [];
  public listaDetalleSolicitudpaginacion: Array<DetalleSolicitud> = [];
  public listaDetalleSolicitudpaginacion_aux: Array<DetalleSolicitud> = [];
  public listaDetalleSolicitud_aux      : Array<DetalleSolicitud> = [];
  public listaDetalleSolicitud_2        : Array<DetalleSolicitud> = [];
  public listaDetalleDespachopaginacion : Array<DespachoDetalleSolicitud> = [];
  public listaDetalleDespacho           : Array<DespachoDetalleSolicitud> = [];
  public listaDetalleEliminado          : Array<DespachoDetalleSolicitud> = [];
  public _Solicitud                     : Solicitud;
  public _DetalleSolicitud              : DetalleSolicitud;
  public usuario                        = environment.privilegios.usuario;
  public servidor                       = environment.URLServiciosRest.ambiente;
  public locale                         = 'es';
  public bsConfig                       : Partial<BsDatepickerConfig>;
  public colorTheme                     = 'theme-blue';
  private _BSModalRef                   : BsModalRef;
  public detalleslotes                  : Detallelote[] = [];
  public loteparagrilla                 : SaldoLoteBodega[] = [];
  public verificanull                   : boolean = false;
  public ActivaBotonBuscaGrilla         : boolean = false;
  public ActivaBotonLimpiaBusca         : boolean = false;

  // Confirmación de Stock al despachar
  public confirmaStockE  : ConfirmaStockBodSuministroEntrada;
  public confirmaStockEs : ConfirmaStockBodSuministroEntrada[] = [];
  public permiso     : boolean;
  public respPermiso : string = "";

  // paginación
  public pageSoli : number = 1;
  public pageSoliDes : number = 1;

  onClose                 : any;
  activabtndespacho       : boolean = false;
  activabtnimprime        : boolean = false;
  public desactivabtnelim : boolean = false;
  public btnAgregar       = true;
  public validasumatoria  = true;
  public vacios           = true;
  public activabtnimprimesolic: boolean = false;
  public loading          = false;
  public anuladespacho    : boolean = false;
  public cmbLoteDet       : boolean = false;

  private subscripcionesDialogoBusquedaSolicitud: Subscription[] = [];

  constructor(
    private formBuilder           : FormBuilder,
    private router                : Router,
    private route                 : ActivatedRoute,
    public _BsModalService        : BsModalService,
    public datePipe               : DatePipe,
    public localeService          : BsLocaleService,
    public _SolicitudService      : SolicitudService,
    public _buscasolicitudService : SolicitudService,
    private _imprimesolicitudService: InformesService,
    public translate: TranslateService
  ) {

    this.FormDespachoSolicitud = this.formBuilder.group({
      numsolicitud: [{ value: null, disabled: true }, Validators.required],
      esticod     : [{ value: null, disabled: true }, Validators.required],
      hdgcodigo   : [{ value: null, disabled: false }, Validators.required],
      esacodigo   : [{ value: null, disabled: false }, Validators.required],
      cmecodigo   : [{ value: null, disabled: false }, Validators.required],
      prioridad   : [{ value: null, disabled: true }, Validators.required],
      fecha       : [{ value: null, disabled: false }, Validators.required],
      fechamostrar: [{ value: new Date(), disabled: true }, Validators.required],
      bodorigen   : [{ value: null, disabled: true }, Validators.required],
      boddestino  : [{ value: null, disabled: true }, Validators.required]
    });

    this.FormDespachoSolicitud2 = this.formBuilder.group({
      codigoproducto: [{ value: null, disabled: false }, Validators.required],
      cantidad      : [{ value: null, disabled: false }, Validators.required],
      lote          : [{ value: null, disabled: false }, Validators.required],
      fechavto      : [{ value: null, disabled: false }, Validators.required]
    });

    // this.FormDatosProducto = this.formBuilder.group({
    //   codigo  : [{ value: null, disabled: false }, Validators.required],
    //   cantidad: [{ value: null, disabled: false }, Validators.required]
    // });

  }

  ngOnInit() {

    this.FormDatosProducto = this.formBuilder.group({
      codigo  : [{ value: null, disabled: false }, Validators.required],
      cantidad: [{ value: null, disabled: false }, Validators.required]
    });

    this.setDate();
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario   = sessionStorage.getItem('Usuario').toString();


    this.route.paramMap.subscribe(param => {
      if (param.has("id_solicitud")) {
        this.CargaSolicitud(parseInt(param.get("id_solicitud"), 10));
      }
    })
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

  CargaSolicitud(ID_Solicitud: number) {
    this.loading = true;
    this._Solicitud = new (Solicitud);
    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
    this._buscasolicitudService.BuscaSolicitud(ID_Solicitud, this.hdgcodigo, this.esacodigo, this.cmecodigo, null, null, null, null, null, null, this.servidor, 0, 0, 0, 0, 0, 0, "",0, "","").subscribe(
      response => {
        if (response != null) {
          this._Solicitud = response[0];
          this.numsolic = true;
          this.detalleslotes = [];
          this.FormDespachoSolicitud.get('numsolicitud').setValue(response[0].soliid);
          this.FormDespachoSolicitud.get('boddestino').setValue(response[0].boddestinodesc);
          this.FormDespachoSolicitud.get('bodorigen').setValue(response[0].bodorigendesc);
          this.FormDespachoSolicitud.get('fechamostrar').setValue(new Date(response[0].fechacreacion));
          this.FormDespachoSolicitud.get('esticod').setValue(response[0].estadosolicitudde);
          this.FormDespachoSolicitud.get('prioridad').setValue(response[0].desprioridadsoli);
          this.activabtnimprimesolic = true;
          this._Solicitud.solicitudesdet.forEach(element =>{
            element.backgroundcolor = (element.tienelote == "N")?'gris':'amarillo';
            if(element.tienelote == "N"){
              if((element.cantsoli-element.cantdespachada)>0){
                element.cantadespachar = (element.cantsoli -element.cantdespachada);
                element.cantadespacharresp = element.cantadespachar;
                element.bloqcampogrilla = true;
                element.bloqcampogrilla2 = true;
                this.listaDetalleDespacho.unshift(element);
                this.listaDetalleDespachopaginacion = this.listaDetalleDespacho; // .slice(0,20);
                this.activabtndespacho = true;
                this.logicaVacios();
              }
            }
          });

          this.listaDetalleSolicitud = this._Solicitud.solicitudesdet;
          this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud; // .slice(0, 20);
          this.listaDetalleSolicitud_aux = this.listaDetalleSolicitud;
          this.listaDetalleSolicitudpaginacion_aux = this.listaDetalleSolicitud;
          this.ActivaBotonBuscaGrilla = true;
          this.loading = false;
          this.logicaVacios();
          this.FormDespachoSolicitud2.reset();
          if(this._Solicitud.bandera === 2){
            this.verificanull = false;
            this.listaDetalleDespacho.forEach(x=>{
              x.bloqcampogrilla = false;
              x.bloqcampogrilla2 = false;
            })
            this.listaDetalleDespachopaginacion = this.listaDetalleDespacho; // .slice( 0,20);
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
            this.alertSwalAlert.show();
          }else{
            this.ValidaEstadoSolicitud(2,'cargaSolicitud');
          }
        } else {
          this.loading = false;
        }
      });
  }

  ValidaEstadoSolicitud( bandera: number, nada:string){
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

  desuscribirse() {
    for (const suscripcion of this.subscripcionesDialogoBusquedaSolicitud) {
      suscripcion.unsubscribe();      
    }

    this.subscripcionesDialogoBusquedaSolicitud = [];
  }

  BuscarSolicitudes() {

    let _DetalleDespacho  : DespachoDetalleSolicitud;
    this.loading = true;

    if(this._Solicitud != undefined){

      if(this._Solicitud.bandera === 1){  //Si bandera es =2 solicitud tomada
        this.ValidaEstadoSolicitud(1,'BuscaSolicitudes');
      }
    }

    /** HACK: Por algun motivo solo el modal de buscar solicitud se queda pegado. De esta forma se 
     * elimina manualmente el backdrop en el que se queda pegado. */
    this.subscripcionesDialogoBusquedaSolicitud.push(
      this._BsModalService.onHidden.subscribe(() => {
        const backdrop = document.querySelector('div.backdrop');

        if (backdrop) {
          backdrop.classList.add('d-none');
        }

        this.desuscribirse();
      }),
    );

    this._BSModalRef = this._BsModalService.show(BusquedasolicitudesComponent, this.setModalBusquedaSolicitud());
    this._BSModalRef.content.onClose.subscribe((RetornoSolicitudes: Solicitud) => {
      if (RetornoSolicitudes == undefined) { }
      else {
        this._SolicitudService.BuscaSolicitud(RetornoSolicitudes.soliid, this.hdgcodigo,
        this.esacodigo, this.cmecodigo, 0,"","", 0,0,0,this.servidor, 0,0,0,0,0,0,"",0, "","").subscribe(
          response => {
            if (response != null) {
              this.detalleslotes = [];
              this.listaDetalleDespachopaginacion=[];
              this.FormDespachoSolicitud2.reset();
              this.activabtnimprimesolic = true;
              this.listaDetalleDespacho = [];
              this._Solicitud = new (Solicitud);
              this._Solicitud = response[0];

              if(this._Solicitud.estadosolicitud === 50 || this._Solicitud.estadosolicitud === 40){
                this.anuladespacho = true;
              }else{
                this.anuladespacho = false;
              }
              this.FormDespachoSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
              if (this._Solicitud.soliid > 0) {
                this.numsolic = true;
              }
              this.FormDespachoSolicitud.get('boddestino').setValue(this._Solicitud.boddestinodesc);
              this.FormDespachoSolicitud.get('bodorigen').setValue(this._Solicitud.bodorigendesc);
              this.FormDespachoSolicitud.get('fechamostrar').setValue(new Date(this._Solicitud.fechacreacion));
              this.FormDespachoSolicitud.get('esticod').setValue(this._Solicitud.estadosolicitudde);
              this.FormDespachoSolicitud.get('prioridad').setValue(this._Solicitud.desprioridadsoli);
              response[0].solicitudesdet.forEach(element =>{
                element.backgroundcolor = (element.tienelote == "N")?'gris':'amarillo';
                if(element.tienelote == "N"){
                  if((element.cantsoli-element.cantdespachada)>0){
                    element.cantadespachar = (element.cantsoli -element.cantdespachada);
                    element.cantadespacharresp = element.cantadespachar;
                    element.bloqcampogrilla = true;
                    element.bloqcampogrilla2 = true;
                    if(element.cantadespachar >(element.cantsoli-element.cantdespachada)){
                      this.alertSwalAlert.text=this.TranslateUtil('key.mensaje.valor.despachar.mayor.cantidad.pendiente');
                      this.alertSwalAlert.show();
                    }
                    _DetalleDespacho = new(DespachoDetalleSolicitud);
                    _DetalleDespacho = element;
                    _DetalleDespacho.hdgcodigo = this.hdgcodigo;
                    _DetalleDespacho.esacodigo = this.esacodigo;
                    _DetalleDespacho.cmecodigo = this.cmecodigo;
                    _DetalleDespacho.bodorigen =this._Solicitud.bodorigen;
                    _DetalleDespacho.boddestino = this._Solicitud.boddestino;
                    _DetalleDespacho.servidor = this.servidor;
                    _DetalleDespacho.usuariodespacha = this.usuario;
                    this.listaDetalleDespacho.unshift(_DetalleDespacho);
                    this.activabtndespacho = true;
                    this.verificanull = true;
                  }
                  this.listaDetalleDespachopaginacion = this.listaDetalleDespacho; // .slice(0, 20);
                  this.logicaVacios();
                }
              });

              this.listaDetalleSolicitud = response[0].solicitudesdet;
              this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud; // .slice(0, 20);
              this.listaDetalleSolicitud_aux = this.listaDetalleSolicitud;
              this.listaDetalleSolicitudpaginacion_aux = this.listaDetalleSolicitudpaginacion;
              this.ActivaBotonBuscaGrilla = true;
              this.loading = false;
              this.logicaVacios();
              if(this._Solicitud.bandera === 2){ //Si bandera es =2 solicitud tomada
                this.verificanull = false;
                this.FormDespachoSolicitud2.disable();
                if(this.listaDetalleDespacho.length >0){
                  this.listaDetalleDespacho.forEach(x=>{
                    x.bloqcampogrilla = false;
                    x.bloqcampogrilla2 = false;
                  })
                  this.listaDetalleDespachopaginacion = this.listaDetalleDespacho; // .slice( 0,20);
                  this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                  this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                  this.alertSwalAlert.show();
                }else{

                  this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                  this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                  this.alertSwalAlert.show();
                }
              }else{ // la deja en 2 y que quedará tomada
                this.ValidaEstadoSolicitud( 2,'BuscaSolicitudes');
              }
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
        origen : 'Otros',
        paginaorigen: 2
      }
    };
    return dtModal;
  }

  /* Confirmar guardado de movimiento previamente */
  async ConfirmarEnviarDespacho(datos: any) {
    await this.sumatoriaProductogrilla();
    this.permiso = true;
    this.respPermiso = "";
    this.confirmaStockEs = [];
    if(this.validasumatoria) {
      // sE CONFIRMA GURADADO DE REGISTRO
      const Swal = require('sweetalert2');
      this.loading = true;
      Swal.fire({
        title: this.TranslateUtil('key.mensaje.pregunta.confirmar.despacho'),
        text: this.TranslateUtil('key.mensaje.confirmar.despacho.solicitud'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
        cancelButtonText: this.TranslateUtil('key.mensaje.cancelar'),
      }).then((result) => {
        if (result.value) {
          if(this.permiso){
            this.DespacharSolictud(datos);
          } else {
            var text = "`<h2>"+this.TranslateUtil('key.mensaje.no.puede.generar.despacho')+"</h2><br/>" + this.respPermiso + "`";
            Swal.fire({
              html: text,
            });
            this.loading = false;
          }
        }

        if (result.dismiss) {
          this.loading = false; 
        }
      })
    } else {
      return;
    }
    this.confirmaStock();
  }

  /* Guardar movimimientos */
  async DespacharSolictud(datos: any) {
    /* se envía detalle del movimiento */
    var fechavto = null;
    var suma : number = 0;
    if (this.listaDetalleDespacho.length > 0) {
      this.DespachoSolicitud = new (DespachoSolicitud);
      var validar : boolean = false;

      this.DespachoSolicitud.paramdespachos = this.listaDetalleDespacho;
      this.respPermiso = " "
      this.DespachoSolicitud.paramdespachos.forEach(element=>{
        element.hdgcodigo = this.hdgcodigo;
        element.esacodigo = this.esacodigo;
        element.cmecodigo = this.cmecodigo;
        element.bodorigen =this._Solicitud.bodorigen;
        element.boddestino = this._Solicitud.boddestino;
        element.servidor = this.servidor;
        element.fechavto = element.fechavto;
        element.usuariodespacha = this.usuario;
        suma = suma + element.cantadespachar;
      });

      try {
        this.loading = true;
        this._SolicitudService.DespacharSolicitud(this.DespachoSolicitud).subscribe(
          response => {
            if (response != null) {
              if (response.respuesta == 'OK') {
                this.activabtnimprime = true;
                this.activabtndespacho = false;
                this.alertSwal.title = this.TranslateUtil('key.mensaje.despacho.realizado.exito');
                this.alertSwal.show();
                if(this._Solicitud != undefined){
                  if(this._Solicitud.bandera != 2){
                    this.ValidaEstadoSolicitud(1,'destroy');
                  }
                }

                this._buscasolicitudService.BuscaSolicitud(this._Solicitud.soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null, null, null, null, null, null, this.servidor, 0, 0, 0, 0, 0, 0, "",0, "","").subscribe(
                  response => {
                    if (response != null) {
                      this.FormDespachoSolicitud.get('boddestino').setValue(response[0].boddestinodesc);
                      this.FormDespachoSolicitud.get('bodorigen').setValue(response[0].bodorigendesc);
                      this.FormDespachoSolicitud.get('fechamostrar').setValue(new Date(response[0].fechacreacion));
                      this.FormDespachoSolicitud.get('esticod').setValue(response[0].estadosolicitudde);
                      this.FormDespachoSolicitud.get('prioridad').setValue(response[0].desprioridadsoli);
                      this._Solicitud = response[0];
                      if(this._Solicitud.estadosolicitud === 50 || this._Solicitud.estadosolicitud === 40){
                        this.anuladespacho = true;
                        this.verificanull = false;
                      }else{
                        this.anuladespacho = false;
                        this.verificanull = true;
                      }
                      response[0].solicitudesdet.forEach(element =>{
                        element.backgroundcolor = (element.tienelote == "N")?'gris':'amarillo';
                      });
                      this.listaDetalleSolicitud = response[0].solicitudesdet;
                      this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud; // .slice(0, 20);
                      this.listaDetalleSolicitud_aux = this.listaDetalleSolicitud;
                      this.listaDetalleSolicitudpaginacion_aux = this.listaDetalleSolicitudpaginacion;
                      this.ActivaBotonBuscaGrilla = true;
                      this.logicaVacios();
                      this.loading = false;
                      if(this._Solicitud.bandera === 2){
                        this.verificanull = false;
                        this.FormDespachoSolicitud2.disable();
                        if(this.listaDetalleDespacho.length >0){
                          this.listaDetalleDespacho.forEach(x=>{
                            x.bloqcampogrilla = false;
                            x.bloqcampogrilla2 = false;
                          })
                          this.listaDetalleDespachopaginacion = this.listaDetalleDespacho; // .slice( 0,20);
                          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
                          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
                          this.alertSwalAlert.show();
                        }
                      }else{
                        this.ValidaEstadoSolicitud( 2,'BuscaSolicitudes');
                      }
                    } else {
                      this.loading = false;
                    }
                }, error => {
                  this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.solicitudes');
                  this.alertSwalError.show();
                  this.loading = false;
                });
              }
              this.loading = false;
            } else {
              this.loading = false;
            }
          },
          error => {
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.despachar.solicitud');
            this.alertSwalError.text = error;
            this.alertSwalError.show();
            this.loading = false;
          }
        );
      } catch (err) {
        alert("Error : " + err)
        this.loading = false;
      }
    }
    this.listaDetalleDespacho = []; this.listaDetalleDespachopaginacion = [];
  }

  confirmaStock() {
    this.listaDetalleDespacho.forEach(element=>{
      this.confirmaStockE = new ConfirmaStockBodSuministroEntrada();
      this.confirmaStockE.servidor  = this.servidor;
      this.confirmaStockE.hdgcodigo = this.hdgcodigo;
      this.confirmaStockE.esacodigo = this.esacodigo;
      this.confirmaStockE.cmecodigo = this.cmecodigo;
      this.confirmaStockE.usuario   = this.usuario;
      this.confirmaStockE.codbodega = this._Solicitud.boddestino;
      this.confirmaStockE.cansoli   = element.cantadespachar;
      this.confirmaStockE.codmei    = element.codmei;

      this.confirmaStockEs.unshift(this.confirmaStockE);
    });
    var ind = 0;
    this.confirmaStockEs.forEach(element => {
      this._SolicitudService.ConfirmaStockBodSuministro(element).subscribe(
        response => {
          if (response != null) {
            if(!response.permiso){
              this.permiso = response.permiso;
              if (ind === 0) {
                this.respPermiso = response.mensaje;
                ind++;
              } else {
                this.respPermiso = this.respPermiso + " " + response.mensaje;
              }
            }
          }
        },error => {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.despachar.solicitud');
          this.alertSwalError.text = error;
          this.alertSwalError.show();
        });
    });
  }

  Limpiar() {

    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'limpiar');
      }
    }
    this.FormDespachoSolicitud.reset();
    this.FormDespachoSolicitud2.reset();
    this.listaDetalleSolicitudpaginacion = [];
    this.listaDetalleSolicitud = [];
    this.listaDetalleDespacho = [];
    this.listaDetalleDespachopaginacion = [];
    this.detalleslotes = [];
    this.fechavto = null;
    this.verificanull = false;
    this.activabtnimprimesolic = false;
    this.activabtnimprime = false;
    this.ActivaBotonBuscaGrilla = false;
    this.anuladespacho = false;
    this._Solicitud = undefined;
    this.pageSoli = 1;
    this.pageSoliDes = 1;
    this.numsolic = false;
    
    /**Habilitat btn agregar
     * 11-12-2020
     * @MLobos
    */
    this.btnAgregar = true;
  }

  cambio_cantidad(id: number, property: string, registro:DespachoDetalleSolicitud ) {
    if (this.listaDetalleDespachopaginacion[id]["sodeid"] == 0) {
      this.listaDetalleDespachopaginacion[id]["acciond"] = "I";

    }
    if (this.listaDetalleDespachopaginacion[id]["sodeid"] > 0) {
      this.listaDetalleDespachopaginacion[id]["acciond"] = "M";
    }
    this.listaDetalleDespachopaginacion[id][property] = this.listaDetalleDespachopaginacion[id][property]

  }

  codigo_ingresado(datosIngresados: any) {
    let codproducto = datosIngresados.codigoproducto;

    /* Si existe el código   en la solicitud se propone la cantidad */
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.listaDetalleSolicitud.forEach(element => {

      if(codproducto !== null) {
        if (element.codmei.trim() == datosIngresados.codigoproducto.trim()) {
          this.validadato = true;
          this.FormDespachoSolicitud2.get('cantidad').setValue(element.cantsoli - element.cantdespachada);

          this._SolicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
          this.cmecodigo, datosIngresados.codigoproducto, this._Solicitud.bodorigen, this._Solicitud.boddestino).subscribe(
          response => {
            if( response === null || response === undefined ){
              return;
            } else {
              var index = 0;
              response.forEach(x => {
                x.row = index;
                this.detalleslotes.push(x);
                index++;
              });
              // * Tiene un solo lote el producto*
              if (this.detalleslotes.length == 1) {
                this.cmbLoteDet = true;
                this.btnAgregar = false;
                if(this.FormDespachoSolicitud2.value.cantidad <= this.detalleslotes[0].cantidad){
                  this.FormDespachoSolicitud2.get('lote').setValue(this.detalleslotes[0].lote);
                  this.btnAgregar = false;
                  this.FormDespachoSolicitud2.get('fechavto').setValue(this.datePipe.transform(this.detalleslotes[0].fechavto, 'dd-MM-yyyy'));
                  this.lote = this.detalleslotes[0].lote;
                  this.fechavto = this.detalleslotes[0].fechavto;
                }else{
                  this.alertSwalAlert.title ="El lote seleccionado tiene disponible"+" "+ this.detalleslotes[0].cantidad+" para dispensar";
                  this.alertSwalAlert.show();
                }
              }
            }
          });
        }
      } else { return; }
    })

    if (this.validadato == false) {
      this.FormDespachoSolicitud2.reset();
      return;
    }
  }

  LlamaFecha(event: any) {
    const fechaylote = event.split('/');
    const fechav = fechaylote[0];
    const loteprod = fechaylote[1];
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.detalleslotes.forEach(element => {
      if (loteprod == element.lote && fechav == element.fechavto) {
        if(loteprod == ""){
          this.alertSwalAlert.text = "Debe Seleccionar lote";
          this.alertSwalAlert.show();
          this.FormDespachoSolicitud2.get('fechavto').setValue(null);
          this.btnAgregar = true;
        }else{
          if(this.FormDespachoSolicitud2.value.cantidad <= element.cantidad ){
            this.FormDespachoSolicitud2.get('fechavto').setValue(this.datePipe.transform(element.fechavto, 'dd-MM-yyyy'));
            this.fechavto = element.fechavto;
            this.btnAgregar = false;
          }else{
            this.alertSwalAlert.title ="El lote seleccionado tiene disponible"+" "+element.cantidad;
            this.alertSwalAlert.show();
            this.btnAgregar = true;
            this.FormDespachoSolicitud2.get('lote').setValue(0);
            this.FormDespachoSolicitud2.get('fechavto').setValue(null);
          }
        }
      }
      this.listaDetalleDespacho.forEach(x=>{

        if(this.FormDespachoSolicitud2.value.codigoproducto == x.codmei && loteprod == x.lote){
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.producto.tiene.lote.grilla');
          this.alertSwalAlert.show();
          this.btnAgregar = true;
        }

      })
    })


  }

  valida_cantidad(cantidad: number,datoingresado:any){

    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;
    //listaDetalleDespacho
    let codproducto = datoingresado.codigoproducto;
    let cantidadprod = cantidad;
    if(cantidadprod !== null) {

      if(!this.listaDetalleDespacho.length) {
        this.listaDetalleSolicitud.forEach(element => {

          if (element.codmei.trim() == datoingresado.codigoproducto.trim()) {

            if(cantidad > element.cantsoli - element.cantdespachada){
              this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.menor.igual.cantidad.pendiente');
              this.alertSwalAlert.show();
            }else{
              if(cantidad < 0) {

                this.FormDespachoSolicitud2.get('cantidad').setValue(element.cantsoli - element.cantdespachada);
                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.cero');
                this.alertSwalAlert.show();

              }
            }

          }
        });
      } else {
        this.sumatoriaProductoagregar(codproducto, cantidadprod);
      }
    } else { return; }

  }

  sumatoriaProductoagregar(codprod: string, cantprod: number) {
    let sumacantdespachar = cantprod;
    var loteprod =null
    if(this.FormDespachoSolicitud2.value.lote !=null){
      const fechaylote = this.FormDespachoSolicitud2.value.lote.split('/');
      const fechav = fechaylote[0];
      loteprod = fechaylote[1];

    }

    this.listaDetalleDespacho.forEach(dat => {
      if(codprod === dat.codmei) {

        sumacantdespachar =  sumacantdespachar + dat.cantadespachar;
        let pendiente = dat.cantsoli - dat.cantdespachada;

        if(sumacantdespachar > pendiente) {
          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.excede.solicitado');
          this.alertSwalAlert.show();

        } else {
          this.listaDetalleDespacho.forEach(x=>{
            if  (this.FormDespachoSolicitud2.value.codigoproducto === x.codmei && loteprod === x.lote){
              this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.producto.tiene.lote.grilla');
              this.alertSwalAlert.show();

            }else{

              if(cantprod < 0) {

                this.FormDespachoSolicitud2.get('cantidad').setValue(0);

                this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.cero');
                this.alertSwalAlert.show();
              }

            }
          })

        }
      }
    });
  }

  async sumatoriaProductogrilla() {
    var holder = {};
    this.listaDetalleDespacho.forEach(d => {
      if (holder.hasOwnProperty(d.codmei)) {
        holder[d.codmei] = holder[d.codmei] + d.cantadespachar;
      } else {
        holder[d.codmei] = d.cantadespachar;
      }
    });
    var obj2 = [];
    for (var prop in holder) {
      obj2.push({ codmei: prop, cantadespachar: holder[prop] });
    }
    /** */
    for(let e of obj2){
      this.validasumatoriagrilla(e.codmei, e.cantadespachar).then(x => {
        if(x) {
          this.validasumatoria = true;
          this.logicaVacios();
          return;
        } else {
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.cantidad.excede.solicitado');
          this.alertSwalAlert.text = `Codigo: ${e.codmei} Cantidad que intenta despachar: ${e.cantadespachar}`;
          this.alertSwalAlert.show();
          this.validasumatoria = false;
          return;
        }
      });
    }
  }

  async validasumatoriagrilla(codprod: string, sumatoriaprod: number) {
    let sumacantdespachar = sumatoriaprod;
    for(let dat of this.listaDetalleDespacho) {
      if(codprod === dat.codmei) {
        let pendiente = dat.cantsoli - dat.cantdespachada;
        if(sumacantdespachar > pendiente) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  async addArticuloGrillaDespacho(despacho: any) {

    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;

    if (despacho.cantidad <= 0 || despacho.cantidad === null || despacho.cantidad === 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.producto.ya.fue.despachado');
      this.alertSwalAlert.show();
    } else {
      if (despacho.cantidad > 0) {
        this.listaDetalleSolicitud.forEach(element => {

          if (element.codmei.trim() == despacho.codigoproducto.trim()) {
            this.varDespachoDetalleSolicitud = new (DespachoDetalleSolicitud);
            this.varDespachoDetalleSolicitud.soliid = this._Solicitud.soliid;
            this.varDespachoDetalleSolicitud.hdgcodigo = this.hdgcodigo;
            this.varDespachoDetalleSolicitud.esacodigo = this.esacodigo;
            this.varDespachoDetalleSolicitud.cmecodigo = this.cmecodigo;
            this.varDespachoDetalleSolicitud.sodeid = element.sodeid;
            this.varDespachoDetalleSolicitud.codmei = element.codmei;
            this.varDespachoDetalleSolicitud.meinid = element.meinid;
            this.varDespachoDetalleSolicitud.cantsoli = element.cantsoli;
            this.varDespachoDetalleSolicitud.cantadespachar = despacho.cantidad;
            this.varDespachoDetalleSolicitud.cantadespacharresp = despacho.cantidad;
            this.varDespachoDetalleSolicitud.cantdespachada = element.cantdespachada;
            this.varDespachoDetalleSolicitud.observaciones = element.observaciones;
            this.varDespachoDetalleSolicitud.usuariodespacha = element.observaciones;
            this.varDespachoDetalleSolicitud.stockorigen = element.stockorigen;
            this.varDespachoDetalleSolicitud.meindescri = element.meindescri;
            this.varDespachoDetalleSolicitud.bodorigen = this._Solicitud.bodorigen;
            this.varDespachoDetalleSolicitud.boddestino = this._Solicitud.boddestino;

            this.varDespachoDetalleSolicitud.acciond = element.acciond;
            this.varDespachoDetalleSolicitud.cantdevolucion = element.cantdevolucion;
            this.varDespachoDetalleSolicitud.bloqcampogrilla = true;


            if( despacho.lote !== null ){

              const fechaylote = despacho.lote.split('/');
              const loteprod = fechaylote[1];

              if (loteprod === undefined) {
                this.varDespachoDetalleSolicitud.lote = despacho.lote;
              } else {
                this.varDespachoDetalleSolicitud.lote = loteprod;
              }
            }

            this.varDespachoDetalleSolicitud.fechavto = despacho.fechavto;

            this.varDespachoDetalleSolicitud.servidor = this.servidor;
            this.varDespachoDetalleSolicitud.usuariodespacha = this.usuario;
            this.activabtndespacho = true;

            this.listaDetalleDespacho.unshift(this.varDespachoDetalleSolicitud);
            this.listaDetalleDespachopaginacion = this.listaDetalleDespacho; // .slice(0, 20);
            this.fechavto = null;

            this.btnAgregar = true;
            this.logicaVacios();
          }

        });

      }
    }

    this.FormDespachoSolicitud2.reset();
    this.detalleslotes = [];
    this.validadato = false;


  }

  validacantidadgrilla(id:number,registrodespacho: DespachoDetalleSolicitud){
    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;
    var idg =0;
    var cantmayorpendiente = true;
    if(registrodespacho.sodeid>0){
      if(this.IdgrillaRecepcion(registrodespacho)>=0){
        idg = this.IdgrillaRecepcion(registrodespacho)
        if(this.listaDetalleDespacho[idg].cantadespachar > this.listaDetalleDespacho[idg].cantsoli- this.listaDetalleDespacho[idg].cantdespachada){
          this._buscasolicitudService.BuscaSaldoLoteBodega(this.servidor, this.hdgcodigo,
            this.cmecodigo,this._Solicitud.boddestino,this.listaDetalleDespacho[idg].meinid,
            this.listaDetalleDespacho[idg].lote,this.listaDetalleDespacho[idg].fechavto).subscribe(
            response => { });
          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.menor.igual.cantidad.pendiente');
          this.alertSwalAlert.show();
          this.listaDetalleDespacho[idg].cantadespachar = this.listaDetalleDespacho[idg].cantadespacharresp;
          this.listaDetalleDespachopaginacion[idg].cantadespachar = this.listaDetalleDespacho[idg].cantadespachar ;
          this.logicaVacios();
        }else{
          if(this.listaDetalleDespacho[idg].cantadespachar <0) {
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.cero');
            this.alertSwalAlert.show();
            this.listaDetalleDespacho[idg].cantadespachar = registrodespacho.cantadespacharresp;
            this.listaDetalleDespachopaginacion[idg].cantadespachar = this.listaDetalleDespacho[idg].cantadespachar;
            this.logicaVacios();
          }else{
            if(this.listaDetalleDespacho[idg].cantadespachar < this.listaDetalleDespacho[idg].cantsoli- this.listaDetalleDespacho[idg].cantdespachada || this.listaDetalleDespacho[idg].cantadespachar>0){
              this._buscasolicitudService.BuscaSaldoLoteBodega(this.servidor, this.hdgcodigo,
                this.cmecodigo,this._Solicitud.boddestino,this.listaDetalleDespacho[idg].meinid,
                this.listaDetalleDespacho[idg].lote,this.listaDetalleDespacho[idg].fechavto).subscribe(
                response => {
                  if(response !== undefined || response === null || response.length !== 0){
                    this.loteparagrilla = response
                    if( this.listaDetalleDespacho[idg].cantadespachar > this.loteparagrilla[0].saldo ){
                      this.alertSwalAlert.text = "El saldo del lote tiene "+ this.loteparagrilla[0].saldo+", ingresar cantidad menor";
                      this.alertSwalAlert.show();
                      this.listaDetalleDespacho[idg].cantadespachar = this.listaDetalleDespacho[idg].cantadespacharresp;
                      this.listaDetalleDespachopaginacion[idg].cantadespachar = this.listaDetalleDespacho[idg].cantadespacharresp ;
                      this.logicaVacios();
                    }else{
                      this.sumatoriaProductogrilla();
                    }
                  }
                });
            }
            this.logicaVacios();
          }
        }
      }
    }
  }

  IdgrillaRecepcion(registro: DespachoDetalleSolicitud) {

    let indice = 0;
    for (const articulo of this.listaDetalleDespacho) {
      if (registro.codmei === articulo.codmei) {
        if(registro.lote == articulo.lote){

          return indice;
        }

      }
      indice++;
    }
    return -1;
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

  salir() {

    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'salir');
      }
    }

    this.route.paramMap.subscribe(param => {
      if (param.has("retorno_pagina")) {

        switch (param.get("retorno_pagina")) {
          case "controlstockminimo":
            this.router.navigate([param.get("retorno_pagina"), param.get("id_suministro"), param.get("id_tipoproducto"), param.get("id_solicita"), param.get("fechadesde"), param.get("fechahasta"), param.get("id_articulo"), param.get("desc_articulo")]);

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

  onImprimir() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.imprimir.dispensacion.solicitud'),
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

    this._imprimesolicitudService.RPTImprimeSolicitudDespachoBodega(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, "pdf", this._Solicitud.soliid).subscribe(
        response => {
          if (response != null) {
            window.open(response[0].url, "", "");
          }
        },
        error => {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.despacho.solicitud');
          this.alertSwalError.show();
          this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
          })
        }
      );
  }

  async CambioCheck(registro: DespachoDetalleSolicitud,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      this.listaDetalleEliminado.unshift(registro);
     }else{
      var i = this.listaDetalleEliminado.indexOf( registro );
      if ( i !== -1 ) {
        this.listaDetalleEliminado.splice( i, 1 );
      }
    }
  }

  isEliminaIdGrilla(registro: DespachoDetalleSolicitud) {
    let indice = 0;
    for (const articulo of this.listaDetalleDespacho) {
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
        var i = this.listaDetalleDespachopaginacion.indexOf( element );
        if ( i !== -1 ) {
          this.listaDetalleDespachopaginacion.splice( i, 1 );
        }
      }
      this.logicaVacios();
    }

    // this.listaDetalleDespachopaginacion.forEach(registro=>{
    //   if (registro.acciond == "" && this.IdgrillaRecepcion(registro) >= 0 && registro.sodeid > 0) {
    //     // Elominar registro nuevo la grilla
    //     if(registro.marcacheckgrilla === true){
    //       this.desactivabtnelim = false;
    //       this.listaDetalleDespacho.splice(this.IdgrillaRecepcion(registro), 1);
    //       this.listaDetalleDespachopaginacion = this.listaDetalleDespacho; // .slice(0, 20);
    //       this.logicaVacios();
    //     }
    //   } else {
    //     // elimina uno nuevo pero que se ha modificado la cantidad
    //     if(registro.marcacheckgrilla === true){
    //       this.desactivabtnelim = false;
    //       this.listaDetalleDespacho.splice(this.IdgrillaRecepcion(registro), 1);
    //       this.listaDetalleDespachopaginacion = this.listaDetalleDespacho; // .slice(0, 20);
    //       this.logicaVacios();
    //       // elimina uno que ya existe
    //     }
    //   }
    // })
  }

  async logicaVacios() {
    this.vaciosProductos();
    if (this._Solicitud.tipobodsuministro != "G") {
      if (this.vacios === true) {
        this.verificanull = false;
      }
      else {
        this.verificanull = true;
      }
      if(this._Solicitud != null){
        if(this._Solicitud.bandera === 2){
          this.verificanull = false;
        }
      }
    } else {
      this.verificanull = false;
    }

  }

  vaciosProductos() {
    if (this.listaDetalleDespachopaginacion.length) {
      for (var data of this.listaDetalleDespachopaginacion) {

        if (data.cantadespachar <= 0 || data.cantadespachar === null ) {
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

  onImprimirSolicitud() {
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
        this.ImprimirSolicitudOriginal();
      }
    })

  }

  ImprimirSolicitudOriginal() {

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

  async findArticuloGrilla() {
    this.loading = true;
    let _DetalleDespacho  : DespachoDetalleSolicitud;

    if ( this.FormDatosProducto.controls.codigo.touched &&
        this.FormDatosProducto.controls.codigo.status !== 'INVALID') {
        var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
      if(this.FormDespachoSolicitud.controls.numsolicitud.value >0){

        this.listaDetalleSolicitud = [];
        this.listaDetalleSolicitudpaginacion = [];

        this._SolicitudService.BuscaSolicitud(this.FormDespachoSolicitud.controls.numsolicitud.value,
        this.hdgcodigo,this.esacodigo, this.cmecodigo, 0,"","", 0,0,0,this.servidor, 0,0,0,0,
          0,0,"",0, codProdAux,"").subscribe(response => {
            if (response != null) {
              this.activabtnimprimesolic = true;
              this.listaDetalleDespacho = [];
              this._Solicitud = new (Solicitud);
              this._Solicitud = response[0];
              this.FormDespachoSolicitud.get('numsolicitud').setValue(this._Solicitud.soliid);
              if (this._Solicitud.soliid > 0) {
                this.numsolic = true;
              }
              this.FormDespachoSolicitud.get('boddestino').setValue(this._Solicitud.boddestinodesc);
              this.FormDespachoSolicitud.get('bodorigen').setValue(this._Solicitud.bodorigendesc);
              this.FormDespachoSolicitud.get('fechamostrar').setValue(new Date(this._Solicitud.fechacreacion));
              this.FormDespachoSolicitud.get('esticod').setValue(this._Solicitud.estadosolicitudde);
              this.FormDespachoSolicitud.get('prioridad').setValue(this._Solicitud.desprioridadsoli);
              response[0].solicitudesdet.forEach(element =>{
                element.backgroundcolor = (element.tienelote == "N")?'gris':'amarillo';

              })

              this.listaDetalleSolicitud = response[0].solicitudesdet;
              this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud; // .slice(0, 20);
              this.ActivaBotonBuscaGrilla = true;
              this.focusField.nativeElement.focus();
              this.loading = false;
              this.logicaVacios();
            } else {
              this.loading = false;
            }
          }
        );
        this.ActivaBotonBuscaGrilla = true;
        this.ActivaBotonLimpiaBusca = true;
        this.loading = false;
        return;
      }else{ //Cuando la plantilla aún no se crea
        this.listaDetalleSolicitud_2 = [];
        if(this.FormDespachoSolicitud.controls.numsolicitud.value === null){
          this.listaDetalleSolicitud.forEach(x=>{
            if(x.codmei === codProdAux){
              this.listaDetalleSolicitud_2.unshift(x);
            }
          })
          this.listaDetalleSolicitud = [];
          this.listaDetalleSolicitudpaginacion = [];
          this.listaDetalleSolicitud = this.listaDetalleSolicitud_2;
          this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitudpaginacion; // ; // .slice(0,20);
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

  AnularDespacho(){
    this.DespachoSolicitud = new (DespachoSolicitud);

    this.DespachoSolicitud.paramdespachos = this.listaDetalleSolicitud;
    this.DespachoSolicitud.paramdespachos.forEach(element=>{
      element.hdgcodigo = this.hdgcodigo;
      element.esacodigo = this.esacodigo;
      element.cmecodigo = this.cmecodigo;
      element.bodorigen =this._Solicitud.bodorigen;
      element.boddestino = this._Solicitud.boddestino;
      element.servidor = this.servidor;
      element.usuariodespacha = this.usuario;
    })

    this._SolicitudService.AnularDespachoSolicitud(this.DespachoSolicitud).subscribe(
      response => {
        if (response != null) {
          if (response.respuesta == 'OK') {
            this.activabtnimprime = false;
            this.activabtndespacho = false;
            this.alertSwal.title = this.TranslateUtil('key.mensaje.anulacion.exito');
            this.alertSwal.show();
            if(this._Solicitud != undefined){
              if(this._Solicitud.bandera != 2){
                this.ValidaEstadoSolicitud(1,'destroy');
              }
            }
            this._buscasolicitudService.BuscaSolicitud(this._Solicitud.soliid, this.hdgcodigo, this.esacodigo, this.cmecodigo, null, null, null, null, null, null, this.servidor, 0, 0, 0, 0, 0, 0, "",0, "","").subscribe(
              response => {
                if (response != null) {
                  this.FormDespachoSolicitud.get('boddestino').setValue(response[0].boddestinodesc);
                  this.FormDespachoSolicitud.get('bodorigen').setValue(response[0].bodorigendesc);
                  this.FormDespachoSolicitud.get('fechamostrar').setValue(new Date(response[0].fechacreacion));
                  this.FormDespachoSolicitud.get('esticod').setValue(response[0].estadosolicitudde);
                  this.FormDespachoSolicitud.get('prioridad').setValue(response[0].desprioridadsoli);
                  this._Solicitud = new Solicitud()
                  this._Solicitud = response[0];
                  if(this._Solicitud.estadosolicitud === 50 || this._Solicitud.estadosolicitud === 40){
                    this.anuladespacho = true;
                  }else{
                    if(this._Solicitud.estadosolicitud === 10){
                      this.anuladespacho = false;
                    }
                  }
                  response[0].solicitudesdet.forEach(element =>{
                    element.backgroundcolor = (element.tienelote == "N")?'gris':'amarillo';
                  });
                  this.listaDetalleSolicitud = response[0].solicitudesdet;
                  this.listaDetalleSolicitudpaginacion = this.listaDetalleSolicitud; // .slice(0, 20);
                  this.listaDetalleSolicitud_aux = this.listaDetalleSolicitud;
                  this.listaDetalleSolicitudpaginacion_aux = this.listaDetalleSolicitudpaginacion;
                  this.ActivaBotonBuscaGrilla = true;
                  this.logicaVacios();
                }
            }, error => {
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.solicitudes');
              this.alertSwalError.show();
            });
          }
        }
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.anular.despacho.solicitud');
        this.alertSwalError.show();

      }
    );
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {​​​​​​​​
    if(this._Solicitud != undefined){
      if(this._Solicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
  }​​​​​​​​

  logicabtnAgregar() {
    if( (this.FormDespachoSolicitud2.controls.cantidad.invalid) ||
    (this.FormDespachoSolicitud2.controls.cantidad.value < 1) ||
    (this.FormDespachoSolicitud2.controls.codigoproducto.invalid) ) {
      return false;

    }else { return true; }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
