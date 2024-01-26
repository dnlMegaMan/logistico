import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';
import { esLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegasDespachadoras } from 'src/app/models/entity/BodegasDespachadoras';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { Articulos } from '../../models/entity/mantencionarticulos';
import { ConsultaFraccionado } from 'src/app/models/entity/ConsultaFraccionamiento';
import { BusquedaproductoafraccionarComponent } from '../busquedaproductoafraccionar/busquedaproductoafraccionar.component';
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { BodegasFraccionables } from 'src/app/models/entity/BodegasFraccionables';
import { DevolucionFraccionamiento } from 'src/app/models/entity/DevolucionFraccionamiento';
import { DevolucionFraccionado } from 'src/app/models/entity/DevolucionFraccionado';

import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-devolucionfraccionamiento',
  templateUrl: './devolucionfraccionamiento.component.html',
  styleUrls: ['./devolucionfraccionamiento.component.css']
})
export class DevolucionfraccionamientoComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  public FormDevolucionFraccionamiento : FormGroup;
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
  public meinorigen                  = null;
  public meindestino                 = null;
  public detalleconsultafraccionamiento: ConsultaFraccionado[] = [];
  public detalleconsultafraccionamientopaginacion: ConsultaFraccionado[] = [];
  public datosparagrabar             : DevolucionFraccionamiento[]=[];
  public _PageChangedEvent           : PageChangedEvent;
  public desactivabtndevolver        : boolean = false;
  public DevolucionFraccionado       : DevolucionFraccionado;

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
    public datePipe        : DatePipe,
    public _BusquedaproductosService  : BusquedaproductosService,
    public _BsModalService : BsModalService,
    public localeService   : BsLocaleService,
    private router         : Router,
    private route          : ActivatedRoute,
    public translate: TranslateService
  ) {

    this.FormDevolucionFraccionamiento = this.formBuilder.group({
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
    // this.BuscaBodegaDespachadora();
    this.BuscaBodegaFraccionable();
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  BuscaBodegaDespachadora(){
    this._bodegasService.BuscaBodegasDespachadora(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegasdespachadoras = response;
        }
    },error => {
      alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
    });
  }

  BuscaBodegaFraccionable(){
    this._bodegasService.BuscaBodegasFraccionable(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegasfraccionables = response;
          this.bodegasfraccionablesaux = this.bodegasfraccionables;
        }
    },error => {
      alert(this.TranslateUtil('key.error.buscar.bodegas.fraccionables'));
    });
  }

  ActivaBotonBusqueda(){
    this.activbusqueda= true;
  }

  limpiar(){
    const Swal = require('sweetalert2');
    if (this.codigoorigenaux  !== this.FormDevolucionFraccionamiento.value.codigoorigen ||
        this.codigodestinoaux !== this.FormDevolucionFraccionamiento.value.codigodestino ||
        this.descripcionaux   !== this.FormDevolucionFraccionamiento.value.descripcion ||
        this.bodcodigoaux     !== this.FormDevolucionFraccionamiento.value.bodcodigo ||
        this.fechadesdeaux    !== this.FormDevolucionFraccionamiento.value.fechadesde ||
        this.fechahastaaux    !== this.FormDevolucionFraccionamiento.value.fechahasta ||
        this.cantidadaux      !== this.FormDevolucionFraccionamiento.value.cantidad){
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
          this.FormDevolucionFraccionamiento.reset();
          this.activbusqueda = false;
          this.FormDevolucionFraccionamiento.get('fechadesde').setValue(new Date());
          this.FormDevolucionFraccionamiento.get('fechahasta').setValue(new Date());
          this.detalleconsultafraccionamiento = [];
          this.detalleconsultafraccionamientopaginacion = [];
          this.codigoorigenaux  = "";
          this.codigodestinoaux = "";
          this.descripcionaux   = "";
          this.bodcodigoaux     = "";
          this.fechadesdeaux    = "";
          this.fechahastaaux    = "";
          this.cantidadaux      = "";
          this.datosparagrabar = [];
          this.desactivabtndevolver = false;
          this.DevolucionFraccionado = null;
        }
      });

    }else{
      this.FormDevolucionFraccionamiento.reset();
      this.activbusqueda = false;
      this.FormDevolucionFraccionamiento.get('fechadesde').setValue(new Date());
      this.FormDevolucionFraccionamiento.get('fechahasta').setValue(new Date());
      this.detalleconsultafraccionamiento = [];
      this.detalleconsultafraccionamientopaginacion = [];
      this.codigoorigenaux  = "";
      this.codigodestinoaux = "";
      this.descripcionaux   = "";
      this.bodcodigoaux     = "";
      this.fechadesdeaux    = "";
      this.fechahastaaux    = "";
      this.cantidadaux      = "";
      this.datosparagrabar = [];
      this.desactivabtndevolver = false;
      this.DevolucionFraccionado = null;
    }
  }

  getProducto() {
    this.codprod = this.FormDevolucionFraccionamiento.controls.codigoorigen.value;
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
        this.FormDevolucionFraccionamiento.value.bodcodigo, this.codprod,null,this.usuario,this.servidor).subscribe(
          response => {
            if (!response.length || response === null) {
              this.loading = false;
            } else if (response.length) {
              if(response.length > 1){
                this.onBuscarProducto();
                this.loading = false;
              }else{
                if(response.length == 1){
                  this.loading = false;
                  this.FormDevolucionFraccionamiento.get('codigoorigen').setValue(response[0].meincodprod);
                  this.meinorigen = response[0].meinidprod;
                }
              }
            }
        }, error => {
          this.loading = false;
        });
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
        this.FormDevolucionFraccionamiento.get('codigoorigen').setValue(RetornoProductos.meincodprod);
        this.meinorigen = RetornoProductos.meinidprod;
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
        bodcodigo: this.FormDevolucionFraccionamiento.value.bodcodigo,
        codigo : this.codprod // this.FormConsultaFraccionamiento.controls.codigoorigen.value // this.codprod

      }
    };
    return dtModal;
  }

  getProducto1() {
    this.codprod = this.FormDevolucionFraccionamiento.controls.codigodestino.value;
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
        , this.usuario, null, this.servidor).subscribe(
          response => {
            if (!response.length || response === null) {
              this.loading = false;
            } else if (response.length) {
              if(response.length > 1){

                this.onBuscarProducto2();
                this.loading = false;
              }else{
                if(response.length == 1){
                  this.loading = false;
                  this.FormDevolucionFraccionamiento.get('codigodestino').setValue(response[0].codigo);
                  this.meindestino = response[0].mein;

                }
              }
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

        this.FormDevolucionFraccionamiento.get('codigodestino').setValue(this.articulos2.codigo);
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
        id_Bodega: this.FormDevolucionFraccionamiento.value.bodcodigo,
        codprod : this.FormDevolucionFraccionamiento.controls.codigodestino.value // this.codprod

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
    this.servidor,this.FormDevolucionFraccionamiento.value.bodcodigo,
    this.datePipe.transform(this.FormDevolucionFraccionamiento.value.fechadesde, 'yyyy-MM-dd'),
    this.datePipe.transform(this.FormDevolucionFraccionamiento.value.fechahasta, 'yyyy-MM-dd'),
    this.meinorigen,this.meindestino).subscribe(
      response => {
        if (response != null) {
          if(response.length == 0){
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.informacion.parametros.ingresados');
            this.alertSwalAlert.show();
            this.loading = false;
          }else{
            console.log("Cosnulta fraccionados",response);
            this.codigoorigenaux = this.FormDevolucionFraccionamiento.value.codigoorigen;
            this.codigodestinoaux= this.FormDevolucionFraccionamiento.value.codigodestino;
            this.descripcionaux  = this.FormDevolucionFraccionamiento.value.descripcion;
            this.bodcodigoaux    = this.FormDevolucionFraccionamiento.value.bodcodigo;
            this.fechadesdeaux   = this.FormDevolucionFraccionamiento.value.fechadesde;
            this.fechahastaaux   = this.FormDevolucionFraccionamiento.value.fechahasta;
            this.cantidadaux     = this.FormDevolucionFraccionamiento.value.cantidad;
            this.detalleconsultafraccionamiento =response;
            this.detalleconsultafraccionamientopaginacion = this.detalleconsultafraccionamiento.slice(0,20);
            this.loading = false;
          }
        }
    }, error => {
      this.loading = false;
      console.log(error);
    });
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detalleconsultafraccionamientopaginacion = this.detalleconsultafraccionamiento.slice(startItem, endItem);
  }

  salir(){
    const Swal = require('sweetalert2');
    if (this.codigoorigenaux  !== this.FormDevolucionFraccionamiento.value.codigoorigen ||
        this.codigodestinoaux !== this.FormDevolucionFraccionamiento.value.codigodestino ||
        this.descripcionaux   !== this.FormDevolucionFraccionamiento.value.descripcion ||
        this.bodcodigoaux     !== this.FormDevolucionFraccionamiento.value.bodcodigo ||
        this.fechadesdeaux    !== this.FormDevolucionFraccionamiento.value.fechadesde ||
        this.fechahastaaux    !== this.FormDevolucionFraccionamiento.value.fechahasta ||
        this.cantidadaux      !== this.FormDevolucionFraccionamiento.value.cantidad){
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

  async CambioCheck(registro: ConsultaFraccionado,id:number,event:any,marcacheckgrilla: boolean){

    if(event.target.checked){
      registro.marcacheckgrilla = true;
      this.desactivabtndevolver = true;
      // await this.isDevuelveGrilla(registro)
      await this.detalleconsultafraccionamiento.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtndevolver = true;

        }
      })
    }else{
      registro.marcacheckgrilla = false;
      this.desactivabtndevolver = false;
      await this.isDevuelveGrilla(registro);
      await this.detalleconsultafraccionamiento.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtndevolver = true;

        }
      })

    }

  }

  isDevuelveGrilla(registro: ConsultaFraccionado) {

    let indice = 0;
    for (const articulo of this.detalleconsultafraccionamiento) {
      if (registro.meinidorig === articulo.meinidorig){ //&& registro.sodeid === articulo.sodeid) {
        articulo.marcacheckgrilla = registro.marcacheckgrilla;

        return indice;
      }
      indice++;
    }
    return -1;
  }

  ConfirmaDevolucionFraccionamiento(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.grabar.devolucion.fraccionamiento.producto'),
      text: this.TranslateUtil('key.mensaje.confirmar.devolucion.fraccionamiento'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.GrabaDevolucionFraccionamiento();
      }
    });
  }

  async GrabaDevolucionFraccionamiento(){
    this.loading = true;

    this.DevolucionFraccionado = new DevolucionFraccionado();
    this.DevolucionFraccionado.servidor = this.servidor;
    this.DevolucionFraccionado.usuario  = this.usuario;
    this.DevolucionFraccionado.hdgcodigo = this.hdgcodigo;
    this.DevolucionFraccionado.esacodigo = this.esacodigo;
    this.DevolucionFraccionado.cmecodigo = this.cmecodigo;
    this.DevolucionFraccionado.codbodega = this.FormDevolucionFraccionamiento.value.bodcodigo;

    this.datosparagrabar=[];
    this.detalleconsultafraccionamiento.forEach(element=>{
      if(element.marcacheckgrilla === true){
        var temporal = new DevolucionFraccionamiento
        temporal.frmoid     = element.frmoid;
        temporal.codmeipadre = element.codorigen;
        temporal.codmeihijo = element.coddestino;
        temporal.factordist = +element.factorconversion; //elsimbolo +  lo deja como numérico
        temporal.cantidadpadre = element.cantorigen;
        temporal.cantidadhijo = (element.cantdestino);
        temporal.lote       = element.lote;
        temporal.fechavto   = element.fechavto; //this.datePipe.transform(element.fechavto, 'yyyy-MM-dd');
        this.datosparagrabar.unshift(temporal);
      }
    });

    this.DevolucionFraccionado.devolucionfraccionamiento = this.datosparagrabar;
    await this._bodegasService.DevolucionFraccionamiento(this.servidor,this.usuario,this.hdgcodigo,
      this.esacodigo,this.cmecodigo,this.FormDevolucionFraccionamiento.value.bodcodigo, this.datosparagrabar).subscribe(
      response => {
        if(response === undefined || response === null){
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.fue.posible.devolver.fraccionamiento');
          this.alertSwalError.show();
          this.loading = false;
        }else{
          this._bodegasService.ConsultaFraccionamiento(this.hdgcodigo,this.esacodigo,this.cmecodigo,this.usuario,
          this.servidor,this.FormDevolucionFraccionamiento.value.bodcodigo,
          this.datePipe.transform(this.FormDevolucionFraccionamiento.value.fechadesde, 'yyyy-MM-dd'),
          this.datePipe.transform(this.FormDevolucionFraccionamiento.value.fechahasta, 'yyyy-MM-dd'),
          this.meinorigen,this.meindestino).subscribe(
            response => {
              if (response != null) {
                this.codigoorigenaux = this.FormDevolucionFraccionamiento.value.codigoorigen;
                this.codigodestinoaux= this.FormDevolucionFraccionamiento.value.codigodestino;
                this.descripcionaux  = this.FormDevolucionFraccionamiento.value.descripcion;
                this.bodcodigoaux    = this.FormDevolucionFraccionamiento.value.bodcodigo;
                this.fechadesdeaux   = this.FormDevolucionFraccionamiento.value.fechadesde;
                this.fechahastaaux   = this.FormDevolucionFraccionamiento.value.fechahasta;
                this.cantidadaux     = this.FormDevolucionFraccionamiento.value.cantidad;
                this.detalleconsultafraccionamiento =response;
                this.detalleconsultafraccionamientopaginacion = this.detalleconsultafraccionamiento.slice(0,20);
                this.desactivabtndevolver = false;
                this.loading = false;
              } else {
                this.loading = false;
              }
            });
          this.alertSwal.title =this.TranslateUtil('key.mensaje.devolucion.fraccionamiento.exito');
          this.alertSwal.show();
          this.loading = false;
        }

      }
    )

  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
