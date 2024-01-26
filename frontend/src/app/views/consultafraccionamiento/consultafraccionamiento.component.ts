import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegasDespachadoras } from 'src/app/models/entity/BodegasDespachadoras';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { DatePipe } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { esLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { BusquedaproductoafraccionarComponent } from '../busquedaproductoafraccionar/busquedaproductoafraccionar.component';
import { Articulos } from '../../models/entity/mantencionarticulos';
import { ConsultaFraccionado } from 'src/app/models/entity/ConsultaFraccionamiento';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { BodegasFraccionables } from 'src/app/models/entity/BodegasFraccionables';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-consultafraccionamiento',
  templateUrl: './consultafraccionamiento.component.html',
  styleUrls: ['./consultafraccionamiento.component.css']
})
export class ConsultafraccionamientoComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  public FormConsultaFraccionamiento : FormGroup;
  public hdgcodigo                   : number;
  public esacodigo                   : number;
  public cmecodigo                   : number;
  public usuario                     = environment.privilegios.usuario;
  public servidor                    = environment.URLServiciosRest.ambiente;
  public locale                      = 'es';
  public bsConfig                    : Partial<BsDatepickerConfig>;
  public colorTheme                  = 'theme-blue';
  public bodegasdespachadoras        : BodegasDespachadoras[] = [];
  public bodegasfraccionables        : BodegasFraccionables[] = [];
  public bodegasfraccionablesaux     : BodegasFraccionables[] = [];
  public activbusqueda               : boolean = false;
  public loading                     = false;
  public codprod                     = null;
  private _BSModalRef                : BsModalRef;
  public articulos2                  : Articulos;
  public meinorigen                   = null;
  public meindestino                  = null;
  public detalleconsultafraccionamiento: ConsultaFraccionado[] = [];
  public detalleconsultafraccionamientopaginacion: ConsultaFraccionado[] = [];
  public _PageChangedEvent          : PageChangedEvent;

  public codigoorigenaux  : string = "";
  public codigodestinoaux : string = "";
  public descripcionaux   : string = "";
  public bodcodigoaux     : string = "";
  public fechadesdeaux    : string = "";
  public fechahastaaux    : string = "";
  public cantidadaux      : string = "";

  public msj : boolean = false;

  constructor(
    private formBuilder    : FormBuilder,
    private _bodegasService: BodegasService,
    public datePipe                     : DatePipe,
    public _BusquedaproductosService  : BusquedaproductosService,
    public _BsModalService            : BsModalService,
    public localeService: BsLocaleService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
    this.FormConsultaFraccionamiento = this.formBuilder.group({
      codigoorigen: [{ value: null, disabled: false }, Validators.required],
      codigodestino:[{ value: null, disabled: false }, Validators.required],
      descripcion : [{ value: null, disabled: false }, Validators.required],
      bodcodigo   : [{ value: null, disabled: false }, Validators.required],
      fechadesde  : [ new Date(), Validators.required],
      fechahasta  : [ new Date(), Validators.required],
      cantidad    : [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.setDate();
    this.BuscaBodegaDespachadora();
    this.BuscaBodegaFraccionable();
  }

  BuscaBodegaDespachadora(){
    this._bodegasService.BuscaBodegasDespachadora(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.bodegasdespachadoras = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  BuscaBodegaFraccionable(){
    this._bodegasService.BuscaBodegasFraccionable(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.bodegasfraccionables = response;
          this.bodegasfraccionablesaux = this.bodegasfraccionables;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  ActivaBotonBusqueda(){
    this.activbusqueda= true;
  }

  limpiar(){
    const Swal = require('sweetalert2');
    if (this.codigoorigenaux  !== this.FormConsultaFraccionamiento.value.codigoorigen ||
        this.codigodestinoaux !== this.FormConsultaFraccionamiento.value.codigodestino ||
        this.descripcionaux   !== this.FormConsultaFraccionamiento.value.descripcion ||
        this.bodcodigoaux     !== this.FormConsultaFraccionamiento.value.bodcodigo ||
        this.fechadesdeaux    !== this.FormConsultaFraccionamiento.value.fechadesde ||
        this.fechahastaaux    !== this.FormConsultaFraccionamiento.value.fechahasta ||
        this.cantidadaux      !== this.FormConsultaFraccionamiento.value.cantidad){
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
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
          this.FormConsultaFraccionamiento.reset();
          this.activbusqueda = false;
          this.FormConsultaFraccionamiento.get('fechadesde').setValue(new Date());
          this.FormConsultaFraccionamiento.get('fechahasta').setValue(new Date());
          this.detalleconsultafraccionamiento = [];
          this.detalleconsultafraccionamientopaginacion = [];
          this.codigoorigenaux  = "";
          this.codigodestinoaux = "";
          this.descripcionaux   = "";
          this.bodcodigoaux     = "";
          this.fechadesdeaux    = "";
          this.fechahastaaux    = "";
          this.cantidadaux      = "";
        }
      });

    }else{
      this.FormConsultaFraccionamiento.reset();
      this.activbusqueda = false;
      this.FormConsultaFraccionamiento.get('fechadesde').setValue(new Date());
      this.FormConsultaFraccionamiento.get('fechahasta').setValue(new Date());
      this.detalleconsultafraccionamiento = [];
      this.detalleconsultafraccionamientopaginacion = [];
      this.codigoorigenaux  = "";
      this.codigodestinoaux = "";
      this.descripcionaux   = "";
      this.bodcodigoaux     = "";
      this.fechadesdeaux    = "";
      this.fechahastaaux    = "";
      this.cantidadaux      = "";
    }
  }

  getProducto() {
    this.codprod = this.FormConsultaFraccionamiento.controls.codigoorigen.value;
    var validacodigo = false;
    if (this.codprod === null || this.codprod === '') {
      return;

    } else {
      this.loading = true;
      const tipodeproducto = 'MIM';
      const controlado = '';
      const controlminimo = '';
      const idBodega = 0;
      const consignacion = '';

      this._bodegasService.BuscaProductoenlaBodega(this.hdgcodigo,this.esacodigo,this.cmecodigo,
        this.FormConsultaFraccionamiento.value.bodcodigo, this.codprod,null,this.usuario,this.servidor).subscribe(
          response => {
            if (response != null){
              if (!response.length) {
                this.loading = false;
              } else if (response.length) {
                if(response.length > 1){
                  this.onBuscarProducto();
                  this.loading = false;
                }else{
                  if(response.length == 1){
                    this.loading = false;
                    this.FormConsultaFraccionamiento.get('codigoorigen').setValue(response[0].meincodprod);
                    this.meinorigen = response[0].meinidprod;
                  }
                }
              }
            } else {
              this.loading = false;
            }
          }, error => {
            this.loading = false;
          }
        );
    }
    this.ActivaBotonBusqueda();
  }

  onBuscarProducto() {
    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;

    var validacodigo = false;
    this._BSModalRef = this._BsModalService.show(BusquedaproductoafraccionarComponent, this.setModal("Búsqueda de Productos"));
    this._BSModalRef.content.onClose.subscribe((RetornoProductos: any) => {
      if (RetornoProductos !== undefined) {
        // console.log("retorno",RetornoProductos)
        // this.articulos2 = RetornoProductos;
        this.FormConsultaFraccionamiento.get('codigoorigen').setValue(RetornoProductos.meincodprod);
        this.meinorigen = RetornoProductos.meinidprod;

      }
      else {

      }

    });
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
        tipo_busqueda: 'Medicamentos',
        bodcodigo: this.FormConsultaFraccionamiento.value.bodcodigo,
        codigo : this.codprod // this.FormConsultaFraccionamiento.controls.codigoorigen.value // this.codprod

      }
    };
    return dtModal;
  }

  getProducto1() {
    this.codprod = this.FormConsultaFraccionamiento.controls.codigodestino.value;
    var validacodigo = false;
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
        , this.usuario,  null, this.servidor).subscribe(
          response => {
            if (response != null){
              if (!response.length) {
                this.loading = false;
              } else if (response.length) {
                if(response.length > 1){

                  this.onBuscarProducto2();
                  this.loading = false;
                }else{
                  if(response.length == 1){
                    this.loading = false;
                    this.FormConsultaFraccionamiento.get('codigodestino').setValue(response[0].codigo);
                    this.meindestino = response[0].mein;

                  }
                }
              }
            } else {
              this.loading = false;
            }
          }, error => {
            this.loading = false;
          }
        );
    }
    this.ActivaBotonBusqueda();
  }

  onBuscarProducto2() {

    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;
    var validacodigo = false;
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusqueda("Búsqueda de Productos"));
    this._BSModalRef.content.onClose.subscribe((RetornoProductos: any) => {
      if (RetornoProductos !== undefined) {

        this.articulos2 = RetornoProductos;

        this.FormConsultaFraccionamiento.get('codigodestino').setValue(this.articulos2.codigo);
        this.meindestino = this.articulos2.mein
      }
      else {

      }

    });
  }

  setModalBusqueda(titulo: string) {
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
        tipo_busqueda: 'Medicamentos',
        id_Bodega: this.FormConsultaFraccionamiento.value.bodcodigo,
        codprod : this.FormConsultaFraccionamiento.controls.codigodestino.value // this.codprod

      }
    };
    return dtModal;
  }

  ConfirmaConsultaFraccionamiento(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.consultar.fraccionamiento.producto'),
      text: this.TranslateUtil('key.mensaje.confirmar.consulta.fraccionamiento.producto'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ConsultaFraccionamientoProducto();
      }
    })
  }

  ConsultaFraccionamientoProducto(){
    this.loading = true;
    this._bodegasService.ConsultaFraccionamiento(this.hdgcodigo,this.esacodigo,this.cmecodigo,this.usuario,
    this.servidor,this.FormConsultaFraccionamiento.value.bodcodigo,
    this.datePipe.transform(this.FormConsultaFraccionamiento.value.fechadesde, 'yyyy-MM-dd'),
    this.datePipe.transform(this.FormConsultaFraccionamiento.value.fechahasta, 'yyyy-MM-dd'),
    this.meinorigen,this.meindestino).subscribe(
      response => {
        if (response != null){
          if(response.length == 0){
            this.alertSwalAlert.title =this.TranslateUtil('key.mensaje.no.existe.informacion.parametros.ingresados');
            this.alertSwalAlert.show();
            this.loading = false;
          }else{
            this.codigoorigenaux = this.FormConsultaFraccionamiento.value.codigoorigen;
            this.codigodestinoaux= this.FormConsultaFraccionamiento.value.codigodestino;
            this.descripcionaux  = this.FormConsultaFraccionamiento.value.descripcion;
            this.bodcodigoaux    = this.FormConsultaFraccionamiento.value.bodcodigo;
            this.fechadesdeaux   = this.FormConsultaFraccionamiento.value.fechadesde;
            this.fechahastaaux   = this.FormConsultaFraccionamiento.value.fechahasta;
            this.cantidadaux     = this.FormConsultaFraccionamiento.value.cantidad;
            this.detalleconsultafraccionamiento =response;
            this.detalleconsultafraccionamientopaginacion = this.detalleconsultafraccionamiento.slice(0,20);
            this.loading = false;
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
        console.log(error);
      }
    )
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detalleconsultafraccionamientopaginacion = this.detalleconsultafraccionamiento.slice(startItem, endItem);
  }

  salir(){
    const Swal = require('sweetalert2');
    if (this.codigoorigenaux  !== this.FormConsultaFraccionamiento.value.codigoorigen ||
        this.codigodestinoaux !== this.FormConsultaFraccionamiento.value.codigodestino ||
        this.descripcionaux   !== this.FormConsultaFraccionamiento.value.descripcion ||
        this.bodcodigoaux     !== this.FormConsultaFraccionamiento.value.bodcodigo ||
        this.fechadesdeaux    !== this.FormConsultaFraccionamiento.value.fechadesde ||
        this.fechahastaaux    !== this.FormConsultaFraccionamiento.value.fechahasta ||
        this.cantidadaux      !== this.FormConsultaFraccionamiento.value.cantidad){
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

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
