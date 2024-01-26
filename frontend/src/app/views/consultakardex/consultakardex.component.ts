import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegaDestino } from '../../models/entity/BodegaDestino';
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { ConsultaKardex } from '../../models/entity/ConsultaKardex';
import { ConsultakardexService} from '../../servicios/consultakardex.service';
import { InventariosService } from 'src/app/servicios/inventarios.service';
import { PeriodoCierreKardex } from '../../models/entity/PeriodoCierreKardex';
import { InformesService } from '../../servicios/informes.service';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { ActivatedRoute, Router } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-consultakardex',
  templateUrl: './consultakardex.component.html',
  styleUrls: ['./consultakardex.component.css'],
  providers : [ConsultakardexService,InformesService]
})
export class ConsultakardexComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos      : Permisosusuario = new Permisosusuario();
  public FormConsultaKardex  : FormGroup;
  public FormDetalleKardex   : FormGroup;
  public bodegasdestino      : Array<BodegaDestino> = [];
  public hdgcodigo           : number;
  public esacodigo           : number;
  public cmecodigo           : number;
  public saldo               : number = 0;
  public locale              = 'es';
  public bsConfig            : Partial<BsDatepickerConfig>;
  public colorTheme          = 'theme-blue';
  private _BSModalRef        : BsModalRef;
  public servidor            = environment.URLServiciosRest.ambiente;
  public usuario             = environment.privilegios.usuario;

  public datoskardex         : Array<ConsultaKardex>=[];
  public datoskardexpaginacion: Array<ConsultaKardex>=[];
  public _PageChangedEvent   : PageChangedEvent;
  public activbusqueda       : boolean = false;
  public periodosmedskardex  : PeriodoCierreKardex[] = [];
  public muestracoddes       : boolean = false;
  public periodo             : number;
  public btnimprime          : boolean = false;
  public muestragrillacoddes : boolean = false;
  public meinid              : number = 0;
  public todoslosprod        : boolean = false;
  public loading             = false;
  descprod: any;
  codprod: any;
  public codigoproducto      = null;
  public descriproducto      = null;
  public mein                : number = 0;
  public txtBtnBuscar        : string = this.TranslateUtil('key.button.buscar.producto');

  /** variables para busqueda */
  public controlado = '';
  public controlminimo = '';
  public idBodega = null;
  public consignacion = '';
  public codigo = null;
  public tipodeproducto = null;

  /** valores de integración */
  public IntFin700        : string = sessionStorage.getItem('intfin700').toString();
  public IntConsultaSaldo : string = sessionStorage.getItem('intconsultasaldo').toString();
  public IntLegado        : string = sessionStorage.getItem('intlegado').toString();
  public IntSisalud       : string = sessionStorage.getItem('intsisalud').toString();

  public msj : boolean = false;
  public page : number;

  /** Carga de Grilla */
  public Fin700 : boolean = false;
  constructor(
    private formBuilder       : FormBuilder,
    public datePipe           : DatePipe,
    public localeService      : BsLocaleService,
    public _BodegasService    : BodegasService,
    public _BsModalService    : BsModalService,
    private _inventarioService: InventariosService,
    private _imprimelibroService  : InformesService,
    public _BusquedaproductosService: BusquedaproductosService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {

    this.FormConsultaKardex = this.formBuilder.group({

      hdgcodigo   : [{ value: null, disabled: false }, Validators.required],
      esacodigo   : [{ value: null, disabled: false }, Validators.required],
      cmecodigo   : [{ value: null, disabled: false }, Validators.required],
      periodo     : [{ value: null, disabled: false }, Validators.required],
      codigo      : [{ value: '', disabled: false }, Validators.required],
      descripcion : [{ value: null, disabled: false }, Validators.required],
      boddestino  : [{ value: null, disabled: false }, Validators.required],
      saldoperant : [{ value: null, disabled: true }, Validators.required],
      marca       : [{ value: null, disabled: false }, Validators.required]
    });
    this.FormDetalleKardex = this.formBuilder.group({

      fecha            : [{ value: null, disabled: true }, Validators.required],
      hora             : [{ value: null, disabled: true }, Validators.required],
      usuario          : [{ value: null, disabled: true }, Validators.required],
      bodorigen        : [{ value: null, disabled: true }, Validators.required],
      boddestino       : [{ value: null, disabled: true }, Validators.required],
      rutproveedor     : [{ value: null, disabled: true }, Validators.required],
      proveedordesc    : [{ value: null, disabled: true }, Validators.required],
      tipodocumentodes : [{ value: null, disabled: true }, Validators.required],
      idsolicitud      : [{ value: null, disabled: true }, Validators.required],
      numerodocumento  : [{ value: null, disabled: true }, Validators.required],
      numeroreceta     : [{ value: null, disabled: true }, Validators.required],
      numeroboleta     : [{ value: null, disabled: true }, Validators.required],
      rutpaciente      : [{ value: null, disabled: true }, Validators.required],
      nombrepaciente   : [{ value: null, disabled: true }, Validators.required],
      tipomovimdes     : [{ value: null, disabled: true }, Validators.required],
      stockanterior    : [{ value: null, disabled: true }, Validators.required],
      stocknuevo       : [{ value: null, disabled: true }, Validators.required],
      valcosanterior   : [{ value: null, disabled: true }, Validators.required],
      valcosnuevo      : [{ value: null, disabled: true }, Validators.required],
      valventanterior  : [{ value: null, disabled: true }, Validators.required],
      valventnuevo     : [{ value: null, disabled: true }, Validators.required],
      bodexteriororig  : [{ value: null, disabled: true }, Validators.required],
      bodexteriordest  : [{ value: null, disabled: true }, Validators.required],
      observaciones    : [{ value: null, disabled: true }, Validators.required],
      tipoprestamo     : [{ value: null, disabled: true }, Validators.required]

    });

  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    if (this.IntFin700 == "NO"){
      this.Fin700 = false;
    } else {
      this.Fin700 = true;
    }
    this.BuscaBodegaDestino();
    this.setDate();

  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  onCancel() {
    this.FormDetalleKardex.reset();
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

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.datoskardexpaginacion = this.datoskardex;//.slice(startItem, endItem);
  }

  ActivaBotonBusqueda(bodcodigo: number, periodo:number){
    this.activbusqueda = true;

    this.periodosmedskardex.forEach(element => {
      if(element.ckarid == periodo ){
        this.periodo = element.ckarid;

      }
    })
    if(this.codigoproducto !== null && this.descriproducto != null && this.FormConsultaKardex.value.periodo>=0){
      this.BuscaDatosKardex(this.mein)
    }else{}

  }

  BuscaPeriodoBodega(codigobod: number){

    if(codigobod === 0) { return;
    } else {

      this._inventarioService.BuscaPeriodoMedBodegas(this.hdgcodigo, this.esacodigo,this.cmecodigo,
        this.servidor,this.usuario,codigobod).subscribe(
        response => {
          if( response === null || response === undefined ){ return; }else {
            this.periodosmedskardex=response;
            this.FormConsultaKardex.controls.periodo.setValue(this.periodosmedskardex[0].ckarid);
            this.activbusqueda = true;
          }
        },
        error => {
          console.log(error);
          alert(this.TranslateUtil('key.mensaje.error.buscar.periodo'));
        }
      );

      if(this.codigoproducto != null && this.descriproducto != null && this.FormConsultaKardex.value.boddestino >0){
        this.BuscaDatosKardex(this.mein)
      }else{}
    }

  }

  async BuscaProducto(){

    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != undefined) {

        this.codigoproducto = response.codigo;
        this.descriproducto = response.descripcion;
        this.mein = response.mein;

        this.muestracoddes = true;

        this.BuscaDatosKardex(response.mein)
      }

    });

    this.txtBtnBuscar = this.TranslateUtil('key.button.buscar.producto');
    this.activbusqueda = true;
    this.loading = false;

  }



  setModalBusquedaProductos() {
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
        id_Bodega: this.FormConsultaKardex.value.boddestino,
        descprod: this.descprod,
        codprod: this.codprod,
      }
    };
    return dtModal;
  }

  /**
   * Se setea campo codigo y descripcion a null pues se estan asignando un valor vacio lo que genera error
   * autor: Mlobos miguel.lobos@sonda.com
   * fecha: 29-12-2020
   */
  BuscaDatosKardex(meinid: number){
    this.loading = true;

    this._inventarioService
      .ConsultaKardex(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,
        this.usuario,
        this.periodo,
        this.FormConsultaKardex.value.boddestino,
        meinid,
      )
      .subscribe(
        (response) => {
          if (response == null || response.length === 0) {
            this.datoskardex = [];
            this.datoskardexpaginacion = [];
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.movimientos.producto.selecionado');
            this.alertSwalAlert.show();
            this.activbusqueda = true;
          } else {
            this.meinid = meinid;
            this.datoskardex = [];
            this.datoskardexpaginacion = [];
            this.datoskardex = response;
            this.datoskardexpaginacion = this.datoskardex; //.slice(0, 20);

            this.muestracoddes = true;
            this.btnimprime = true;
            this.todoslosprod = false;
            this.FormConsultaKardex.get('codigo').setValue(response[0].meincodmei);
            this.FormConsultaKardex.get('descripcion').setValue(response[0].meindescri);
            this.activbusqueda = true;

            this.page = 1;
          }

          this.loading = false;
          this.FormConsultaKardex.enable();
        },
        (error) => {
          this.loading = false;
          console.error('[BUSCAR DATOS KARDEX] ', error);

          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.consultar.kardex');
          this.alertSwalError.text = '';
          this.alertSwalError.show();

          this.FormConsultaKardex.enable();
        },
      );

    this.txtBtnBuscar = this.TranslateUtil('key.button.buscar.producto');
    this.activbusqueda = true;
  }

  /**
   * mod: previamente verifica si existe filtros
   * aut: mlobos
   * act.: 21-12-2021
   */
  // async getProducto(codigo: string, tipobusqueda: number) {
  //   const boddestino = this.FormConsultaKardex.value.boddestino===null?0:this.FormConsultaKardex.value.boddestino;
  //   this.descprod = this.FormConsultaKardex.controls.descripcion.value;

  //   if( boddestino === 0 || this.FormConsultaKardex.value.periodo === null){
  //     this.FormConsultaKardex.reset();
  //     this.alertmsg('Debe Seleccionar Bodega y Período', '');
  //     this.activbusqueda = false;
  //     this.txtBtnBuscar = "Buscar Producto";

  //     this.periodosmedskardex = [];

  //   } else {
  //     this.activbusqueda = false;
  //     this.txtBtnBuscar = "Buscando...";
  //     this.loading = true;
  //     this.idBodega = this.FormConsultaKardex.value.boddestino;
  //     this.codprod = codigo;
  //     this.tipodeproducto = 'MIM';
  //     switch (tipobusqueda) {
  //       case 1:
  //          this.busquedaProductotab();
  //         break;

  //       case 2:
  //         this.busquedaProductobtn();
  //         break;
  //     }
  //   }
  // }

  /**
   * mod: se indica que no debe buscar por descripcion
   * aut: miguel.lobos@sonda.com
   * fec: 25-02-2021
   */
  setDatabusqueda(value: string) {
    const boddestino = this.FormConsultaKardex.value.boddestino===null?0:this.FormConsultaKardex.value.boddestino;
    if( boddestino === 0 || this.FormConsultaKardex.value.periodo === null){
      return;

    } else {

      let codprod: string  = this.FormConsultaKardex.controls.codigo.value;
      this.codprod = this.FormConsultaKardex.controls.codigo.value;
      if (value.trim().length) {
        if(codprod === null || !codprod.trim().length) {
          this.descprod = value;
          this.BuscaProducto();
        }else{
          this.codprod= null;
          this.descprod = value;
          this.BuscaProducto();
        }
      }else{
        this.BuscaProducto();
      }
    }
  }

  Limpiar(){
    const Swal = require('sweetalert2');
    console.log("this.datoskardexpaginacion.length : ", this.datoskardexpaginacion.length)
    if(this.datoskardexpaginacion.length > 0){
      this.msj = true;
    }
    if (this.msj){
      Swal.fire({
        title: this.TranslateUtil('key.button.limpiar.L'),
        text: this.TranslateUtil('key.mensaje.pregunta.seguro.desea.limpiar.campos'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
        cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
      }).then((result) => {
        if (result.value) {
          this.FormConsultaKardex.reset();
          this.datoskardexpaginacion= [];
          this.datoskardex=[];
          this.activbusqueda = false;
          this.txtBtnBuscar = this.TranslateUtil('key.button.buscar.producto');
          this.muestracoddes = false;
          this.muestragrillacoddes = false;
          this.btnimprime = false;
          this.periodosmedskardex = [];
          this.todoslosprod = false;

          this.codprod = null;
          this.descprod = null;
          this.codigoproducto = null;
          this.descriproducto = null;
          this.msj = false;

        }
      });
    }else{
      this.FormConsultaKardex.reset();
      this.datoskardexpaginacion= [];
      this.datoskardex=[];
      this.muestracoddes = false;
      this.muestragrillacoddes = false;
      this.btnimprime = false;
      this.periodosmedskardex = [];
      this.todoslosprod = false;
      this.codprod = null;
      this.descprod = null;
      this.codigoproducto = null;
      this.descriproducto = null;
      this.txtBtnBuscar = this.TranslateUtil('key.button.buscar.producto');
      this.activbusqueda = false;

    }
  }

  onImprimir(tiporeporte: string){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.imprimir.kardex'),
      text: this.TranslateUtil('key.mensaje.confirmar.impresion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ImprimirLibro(tiporeporte);
      }
    })

  }

  ImprimirLibro(tiporeporte: string) {

    if(tiporeporte=="pdf"){
      if(this.todoslosprod ==false){
        this._imprimelibroService.RPTImprimeConsultaKardex(this.servidor,this.usuario,
        this.hdgcodigo,this.esacodigo, this.cmecodigo,"pdf",this.periodo,
        this.FormConsultaKardex.value.boddestino,this.meinid).subscribe(
          response => {
            if (response != null){
              window.open(response[0].url, "", "");
            }
          },
          error => {
            console.log(error);
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.consulta.kardex');
            this.alertSwalError.show();
            this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
            })
          }
        );
      }else{
        if(this.todoslosprod == true){
          this._imprimelibroService.RPTImprimeConsultaKardex(this.servidor,this.usuario,
          this.hdgcodigo,this.esacodigo, this.cmecodigo,"pdf",this.periodo,
          this.FormConsultaKardex.value.boddestino,0).subscribe(
            response => {
              if (response != null){
                window.open(response[0].url, "", "");
              }
            },
            error => {
              console.log(error);
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.consulta.kardex');
              this.alertSwalError.show();
              this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
              })
            }
          );
        }
      }

    }else{
      if(tiporeporte == "xls"){
        if(this.todoslosprod ==false){
          this._imprimelibroService.RPTImprimeConsultaKardex(this.servidor,this.usuario,
          this.hdgcodigo,this.esacodigo, this.cmecodigo,"xls",this.periodo,
          this.FormConsultaKardex.value.boddestino,this.meinid).subscribe(
            response => {
              if (response != null){
                window.open(response[0].url, "", "");
              }
            },
            error => {
              console.log(error);
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.consulta.kardex');
              this.alertSwalError.show();
              this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
              })
            }
          );
        }else{
          if(this.todoslosprod == true){
            this._imprimelibroService.RPTImprimeConsultaKardex(this.servidor,this.usuario,
            this.hdgcodigo,this.esacodigo, this.cmecodigo,"xls",this.periodo,
            this.FormConsultaKardex.value.bodcodigo,0).subscribe(
              response => {
                if (response != null){
                  window.open(response[0].url, "", "");
                  this.todoslosprod = false;
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
        }
      }
    }
  }

  limpiarprodnoencontrado() {
    this.codigoproducto = this.FormConsultaKardex.controls.codigo.value;
    const descripcion = this.FormConsultaKardex.controls.descripcion.setValue('');
    this.descprod = descripcion;
    this.datoskardexpaginacion = [];
    this.BuscaProducto();
  }

  salir(){
    const Swal = require('sweetalert2');
    if(this.datoskardexpaginacion.length > 0){
      this.msj = true;
    }
    if (this.msj){
      Swal.fire({
        title: this.TranslateUtil('key.title.salir'),
        text: this.TranslateUtil('key.mensaje.pregunta.seguro.desea.salir'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
          this.route.paramMap.subscribe(param => {
            this.router.navigate(['home']);
        })
        }
      });
    } else {
      this.route.paramMap.subscribe(param => {
        this.router.navigate(['home']);
      })
    }
  }

  alertmsg( title: string, text: string ){
    this.alertSwalAlert.title= title;
    this.alertSwalAlert.text= text;
    this.alertSwalAlert.show();

  }

  busquedaProductotab( codigo:string ) {
    const boddestino = this.FormConsultaKardex.value.boddestino===null?0:this.FormConsultaKardex.value.boddestino;
    if( boddestino === 0 || this.FormConsultaKardex.value.periodo === null){
      return;

    } else {
      this.loading = true;
      this.idBodega = this.FormConsultaKardex.value.boddestino;
      this.codprod = codigo;
      this.tipodeproducto = 'MIM';

      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
        this.cmecodigo, this.codprod, this.descprod, null, null, null, this.tipodeproducto,
        this.idBodega, this.controlminimo, this.controlado, this.consignacion, this.usuario,
        null, this.servidor).subscribe(
          response => {
            if (response != null){
              if (response.length === 0) {
                this.alertSwalError.text =this.TranslateUtil('key.mensaje.producto.no.asociado.bodega');
                this.alertSwalError.show();
                this.activbusqueda = true;
                this.limpiarprodnoencontrado();
              } else {
                if (response.length === 1) {
                  this.codigoproducto = response[0].codigo;
                  this.descriproducto = response[0].descripcion;
                  this.mein           = response[0].mein;

                  this.FormConsultaKardex.patchValue({
                    codigo: response[0].codigo,
                    descripcion: response[0].descripcion,
                  });
                  this.FormConsultaKardex.disable()
                  this.BuscaDatosKardex(response[0].mein);
                  this.muestracoddes = true;

                }else{
                  this.loading = false;
                  return;
                }
              }
            }
          }, error => {
            this.loading = false;

          }
        );

      this.loading = false;
      this.txtBtnBuscar = this.TranslateUtil('key.button.buscar.producto');
      this.activbusqueda = true;
    }

  }

  busquedaProductobtn( codigo:string ) {

    this.idBodega = this.FormConsultaKardex.value.boddestino;
    this.codprod = codigo;

    this.descprod = this.FormConsultaKardex.controls.descripcion.value;
    if(this.codprod!== null){

      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
        this.cmecodigo, this.codigo, this.descprod, null, null, null, this.tipodeproducto,
        this.idBodega, this.controlminimo, this.controlado, this.consignacion, this.usuario, null, this.servidor).subscribe(
          response => {
            if (response != null){
              if (response.length === 0) {
                this.alertSwalError.text =this.TranslateUtil('key.mensaje.producto.no.asociado.bodega');
                this.alertSwalError.show();
                this.activbusqueda = true;
                this.txtBtnBuscar = this.TranslateUtil('key.button.buscar.producto');
                this.limpiarprodnoencontrado();
                this.loading = false;
              }else {
                if (response.length === 1) {
                  this.loading = false;
                  this.codigoproducto = response[0].codigo;
                  this.descriproducto = response[0].descripcion;
                  this.mein           = response[0].mein;
                  this.BuscaDatosKardex(response[0].mein);
                  this.muestracoddes = true;
                  this.BuscaProducto();

                }else if(response.length >1){
                  this.BuscaProducto();
                  this.loading = false;
                }else {
                  this.loading = false;
                  return;

                }
              }
            } else {
              this.loading = false;
            }
          }, error => {
            this.loading = false;

          }
        );
        this.txtBtnBuscar = this.TranslateUtil('key.button.buscar.producto');
        this.activbusqueda = true;
        this.loading = false;

    }

  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
