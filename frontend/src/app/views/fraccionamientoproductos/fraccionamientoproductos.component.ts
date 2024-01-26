import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { esLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';

import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { BodegasDespachadoras } from 'src/app/models/entity/BodegasDespachadoras';
import { FraccionamientoProducto } from 'src/app/models/entity/FraccionamientoProducto';
import { ProductoFraccionado } from 'src/app/models/entity/ProductoFraccionado';
import { GrabaProductoFraccionado } from 'src/app/models/entity/GrabaProductoFraccionado';
import { EliminaProductoFraccionado } from 'src/app/models/entity/EliminaProductoFraccionado';
import { StockProducto } from 'src/app/models/entity/StockProducto';
import { ProductoFraccionamiento } from 'src/app/models/entity/ProductoFraccionamiento';
import { Detallelote } from '../../models/entity/Detallelote';
import { BodegasFraccionables } from 'src/app/models/entity/BodegasFraccionables';

import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';

import { BusquedaproductoafraccionarComponent } from '../busquedaproductoafraccionar/busquedaproductoafraccionar.component';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BodegasService } from '../../servicios/bodegas.service';
import { CreasolicitudesService } from '../../servicios/creasolicitudes.service';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-fraccionamientoproductos',
  templateUrl: './fraccionamientoproductos.component.html',
  styleUrls: ['./fraccionamientoproductos.component.css'],
  providers : [BodegasService, CreasolicitudesService]
})
export class FraccionamientoproductosComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos              : Permisosusuario = new Permisosusuario();
  public locale                      = 'es';
  public bsConfig                    : Partial<BsDatepickerConfig>;
  public colorTheme                  = 'theme-blue';
  public FormFraccionamiento         : FormGroup;
  public FormDatosProducto           : FormGroup;
  private _BSModalRef                : BsModalRef;
  public productoselec               : Articulos;
  public hdgcodigo                   : number;
  public esacodigo                   : number;
  public cmecodigo                   : number;
  public meinidorig                  : number = 0;
  public usuario                     = environment.privilegios.usuario;
  public servidor                    = environment.URLServiciosRest.ambiente;
  public bodegasdespachadoras         : BodegasDespachadoras[] = [];
  public bodegasfraccionables         : BodegasFraccionables[] = [];
  public detallefraccionamiento       : FraccionamientoProducto[]=[];
  public detallefraccionamientopaginacion : FraccionamientoProducto[] =[];
  public prodfraccionado              : ProductoFraccionado[]=[];
  public productoafrac                : ProductoFraccionamiento;
  public datosparagrabar              : GrabaProductoFraccionado[]=[];
  public datosparaeliminar            : EliminaProductoFraccionado[]=[];
  editField                           : string;
  editField2                          : number;
  public codigoproducto               : string = null;
  agregaprod                          : boolean = false;
  public activbusqueda                : boolean = false;
  public codexiste                    : boolean = false;
  public stockprodorigen              : number = null;
  public descriporigen                : string = null;
  public activabtngraba               : boolean = false;
  public loading                      = false;
  descprod: any;
  codprod: any;
  public codprodgrilla                = null;
  public detalleslotes                : Detallelote[] = [];
  public fechav                       : string = null;
  public loteprod                     : string = null;
  public validaloteengrilla           : boolean = true;
  public vacios                       : boolean = true;
  public desactivabtnelim             : boolean = false;
  public prodfrac                     : boolean = false;
  public blcbtnguardar                : boolean = false;

  // Variables Auxiliares de Fraccionado
  public codigoFracAux      : string;
  public descripcionFracAux : string;
  public bodcodigoFracAux   : string;
  public cantidadFracAux    : string;

  public meinidorigaux      : number;
  public stockprodorigenaux : number;
  public codigoproductoaux  : string;
  public descriporigenaux   : string;

  // Variables Auxiliares d Producto
  public codigoProdAux  : string = '';
  public catidadProdAux : string = '';

  // Arreglo Auxiliar
  public bodegasdespachadorasaux              : BodegasDespachadoras[] = [];
  public bodegasfraccionablesaux              : BodegasFraccionables[] = [];
  public detallefraccionamientoaux            : FraccionamientoProducto[]=[];
  public detallefraccionamientopaginacionaux  : FraccionamientoProducto[] =[];
  public prodfraccionadoaux                   : ProductoFraccionado[]=[];
  public productoafracaux                     : ProductoFraccionamiento;
  public datosparagrabaraux                   : GrabaProductoFraccionado[]=[];
  public datosparaeliminaraux                 : EliminaProductoFraccionado[]=[];
  public detalleslotesaux                     : Detallelote[] = [];

  public msj = true;

  constructor(
    private formBuilder    : FormBuilder,
    private _bodegasService: BodegasService,
    public _creaService    : CreasolicitudesService,
    public _BsModalService : BsModalService,
    public _BusquedaproductosService: BusquedaproductosService,
    public _solicitudService: SolicitudService,
    public datePipe         : DatePipe,
    private router          : Router,
    private route           : ActivatedRoute,
    public localeService    : BsLocaleService,
    public translate: TranslateService
  ) {

    this.FormFraccionamiento = this.formBuilder.group({
      codigo      : [{ value: null, disabled: false }, Validators.required],
      descripcion : [{ value: null, disabled: false }, Validators.required],
      bodcodigo   : [{ value: null, disabled: false }, Validators.required],
      cantidad    : [{ value: null, disabled: false }, Validators.required],
      lote        : [{ value: null, disabled: false }, Validators.required],
      fechavto    : [{ value: null, disabled: false }, Validators.required]
    });
    this.FormDatosProducto = this.formBuilder.group({
      codigo  : [{ value: null, disabled: false }, Validators.required],
      cantidad: [{ value: null, disabled: false }, Validators.required]
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
          this.bodegasdespachadorasaux = this.bodegasdespachadoras;
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
        if (response != null) {
          this.bodegasfraccionables = response;
          this.bodegasfraccionablesaux = this.bodegasfraccionables;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(startItem, endItem);
    this.detallefraccionamientopaginacionaux = this.detallefraccionamientopaginacion;
  }

  updateList(id: number, property: string, event: any) {
    const editField = event.target.textContent;
    this.detallefraccionamientopaginacion[id][property] = (editField);
    this.detallefraccionamiento[id][property] = this.detallefraccionamientopaginacion[id][property];
    this.detallefraccionamientoaux = this.detallefraccionamiento;
  }

  cambio_cantidad(id: number, property: string, event: any,registro: FraccionamientoProducto) {
    this.editField = event.target.value;
    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;
    this.msj = true;
    this.blcbtnguardar = true;
    if(registro.factordist <0){
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.valor.fraccionar.mayor.cero');
      this.alertSwalAlert.show();
      registro.factordist = registro.factordistresp;
    }

  }

  updateList2(id: number, property: string, event: any,registro: FraccionamientoProducto) {
    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;
    this.msj = true;
    const editField2 = (event.target.textContent);

    if(this.detalleslotes.length ==1){

    }else{
      if(this.detalleslotes.length >2 ){

        if(registro.lote == undefined || registro.lote == null || registro.lote == ""){

          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.seleccionar.lote');
          this.alertSwalAlert.show();
        }
      }
    }

    if(registro.cantidad> this.stockprodorigen){
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.valor.fraccionar.no.debe.ser.mayor.stock.producto.fraccionar');
      registro.cantidad = 0;
      this.alertSwalAlert.show();
    }else{
      if (registro.cantidad<0){
        this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.valor.fraccionar.no.debe.ser.mayor.stock.producto.fraccionar');
        this.alertSwalAlert.show();
        registro.cantidad = 0;
      }else{
        if(editField2<= this.stockprodorigen){
          this.detallefraccionamientopaginacion[id][property] = (editField2);
          this.detallefraccionamiento[id][property] = this.detallefraccionamientopaginacion[id][property];
          this.detallefraccionamientoaux = this.detallefraccionamiento;
          // this.ValidaCantidadGrilla();
        }
      }
    }
    this.logicaVaciosProductos();
  }
  async logicaVaciosProductos() {
    this.vaciosProductos()
    if (this.vacios === true) {
      this.activabtngraba = false;
    }
    else {
      this.activabtngraba = true;
    }
  }

  vaciosProductos() {
    var bandera : boolean = false;
    if (this.detallefraccionamientopaginacion.length) {
      for (var data of this.detallefraccionamientopaginacion) {
        if(this.detalleslotes.length>=2){
          // if (data.cantidad == 0 || data.lote == "" || data.lote == undefined) {
          if (data.cantidad == 0 || data.lote == "" || data.lote == undefined) {
            this.vacios = true;
            return;
          } else {
            this.vacios = false;
            return;
          }
        }else{
          if (data.cantidad > 0 ) {
            // this.vacios = true;
            // return;
            bandera = true;
          }
          // else {
          //    this.vacios = false;
          //    return;
          // }
        }
      }
      if(bandera) {
        this.vacios = false;
      }else{
        this.vacios = true;
      }
    }
  }

  cambio_cantidad2(id: number, property: string, event: any) {
    this.editField2 = parseInt(event.target.textContent);
  }

  limpiar() {
    const Swal = require('sweetalert2');

      if( (this.meinidorigaux !== this.meinidorig ||
        this.stockprodorigenaux !== this.stockprodorigen ||
        this.codigoproductoaux !== this.codigoproducto ||
        this.descriporigenaux !== this.descriporigen) &&
        (this.meinidorigaux !== undefined ||
        this.stockprodorigenaux !== undefined ||
        this.codigoproductoaux !== undefined ||
        this.descriporigenaux !== undefined)
        ){
      this.msj = true;
    }

    if ( this.detallefraccionamientoaux.length !== this.detallefraccionamiento.length ||
    this.detallefraccionamientopaginacionaux.length !== this.detallefraccionamientopaginacion.length ){
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
          this.FormFraccionamiento.reset();
          this.detallefraccionamientopaginacion = [];
          this.detallefraccionamiento = [];
          this.agregaprod = false;
          this.activbusqueda = false;
          this.FormFraccionamiento.controls.codigo.enable();
          this.FormFraccionamiento.controls.descripcion.enable();
          this.FormFraccionamiento.controls.cantidad.enable();
          this.codexiste = false;
          this.stockprodorigen = null;
          this.activabtngraba = false;
          this.descprod = null;
          this.codprod = null;
          this.descriporigen = null;
          this.codigoproducto = null;
          this.detalleslotes = [];
          this.prodfrac = false;

          // Variables Auxiliares de Fraccionado
          this.codigoFracAux      = '';
          this.descripcionFracAux = '';
          this.bodcodigoFracAux   = '';
          this.cantidadFracAux    = '';
          this.meinidorigaux      = 0;
          this.stockprodorigenaux = 0;
          this.codigoproductoaux  = '';
          this.descriporigenaux   = '';
          this.blcbtnguardar = false;

          // Variables Auxiliares d Producto
          this.codigoProdAux   = '';
          this.catidadProdAux  = '';

          // Arreglo Auxiliar
          this.bodegasdespachadorasaux = [];
          this.detallefraccionamientoaux =[];
          this.detallefraccionamientopaginacionaux =[];
          this.prodfraccionadoaux =[];
          this.productoafracaux = null;
          this.datosparagrabaraux =[];
          this.datosparaeliminaraux =[];
        }
      });
    }else{
      this.FormFraccionamiento.reset();
      this.detallefraccionamientopaginacion = [];
      this.detallefraccionamiento = [];
      this.agregaprod = false;
      this.activbusqueda = false;
      this.FormFraccionamiento.controls.codigo.enable();
      this.FormFraccionamiento.controls.descripcion.enable();
      this.FormFraccionamiento.controls.cantidad.enable();
      this.codexiste = false;
      this.stockprodorigen = null;
      this.activabtngraba = false;
      this.descprod = null;
      this.codprod = null;
      this.descriporigen = null;
      this.codigoproducto = null;
      this.detalleslotes = [];
      this.prodfrac = false;
      this.blcbtnguardar = false;

      // Variables Auxiliares de Fraccionado
      this.codigoFracAux      = '';
      this.descripcionFracAux = '';
      this.bodcodigoFracAux   = '';
      this.cantidadFracAux    = '';
      this.meinidorigaux      = 0;
      this.stockprodorigenaux = 0;
      this.codigoproductoaux  = '';
      this.descriporigenaux   = '';

      // Variables Auxiliares d Producto
      this.codigoProdAux   = '';
      this.catidadProdAux  = '';

      // Arreglo Auxiliar
      this.bodegasdespachadorasaux = [];
      this.detallefraccionamientoaux =[];
      this.detallefraccionamientopaginacionaux =[];
      this.prodfraccionadoaux =[];
      this.productoafracaux = null;
      this.datosparagrabaraux =[];
      this.datosparaeliminaraux =[];
    }
  }

  ActivaBotonBusqueda(){
    this.activbusqueda= true;
  }

  async getProducto(codigo: any) {
    // var codproducto = this.lForm.controls.codigo.value;
    this.alertSwalAlert.title= null;
    this.alertSwalAlert.text = null;
    this.codprod = codigo;

    if(this.codprod === null || this.codprod === ''){
      return;
    } else{
      var tipodeproducto = 'MIM';
      this.loading = true;
      var controlado = '';
      var controlminimo = '';
      var idBodega = 0;
      var consignacion = '';

      await this._bodegasService.BuscaProductoenlaBodega(this.hdgcodigo,this.esacodigo,this.cmecodigo,
        this.FormFraccionamiento.value.bodcodigo, this.codprod,null,this.usuario,this.servidor).subscribe(
          response => {
            if (response != null) {
              if (response.length == 0) {
                this.loading = false;
                this.BuscarProductosParaFraccionar();
              }
              else {
                if (response.length > 0) {
                  this.productoafrac = response[0];
                  this.meinidorig = this.productoafrac.meinidprod;
                  this.stockprodorigen = this.productoafrac.stockactual;
                  this.codigoproducto = this.productoafrac.meincodprod;
                  this.descriporigen = this.productoafrac.meindesprod;
                  if(this.stockprodorigen>0){
                    this.BuscaProductosFracionados(this.productoafrac.meinidprod)
                  }else{
                    if(this.stockprodorigen<0){
                      this.alertSwalAlert.title= this.TranslateUtil('key.mensaje.stock.producto.seleccionado.menor.cero')
                      this.alertSwalAlert.text =this.TranslateUtil('key.mensaje.no.puede.fraccionar.producto');
                      this.alertSwalAlert.show();
                    }
                  }
                  this.loading = false;
                }
              }
            } else {
              this.loading = false;
              this.BuscarProductosParaFraccionar();
            }
          }, error => {
            this.loading = false;
          }
        );
    }
  }

  setDatabusqueda(value: any, swtch: number) {

    if (swtch === 1) {
        this.codprod = value;
    } else if (swtch === 2) {
        this.descprod = value;
    }
  }

  async BuscarProductosParaFraccionar(){
    this.alertSwalAlert.title =null;
    this.alertSwalAlert.text = null;
    this.detallefraccionamiento = [];
    this.detallefraccionamientopaginacion = [];
    this.loading = true;
    this.codprod = null;
    this.descprod = null;

    this._BSModalRef = this._BsModalService.show(BusquedaproductoafraccionarComponent, this.setModalBusquedaProductosAFraccionar());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if(response != undefined){
        this.meinidorig = response.meinidprod;
        this.stockprodorigen = response.stockactual;
        this.codigoproducto = response.meincodprod;
        this.descriporigen = response.meindesprod;

        this.meinidorigaux = this.meinidorig;
        this.stockprodorigenaux = this.stockprodorigen;
        this.codigoproductoaux = this.codigoproducto;
        this.descriporigenaux = this.descriporigen;
        this.blcbtnguardar = true;
        if(this.stockprodorigen>0){
          this.BuscaProductosFracionados(this.meinidorig);
        }else{
          if(this.stockprodorigen<1){
            this.alertSwalAlert.title= this.TranslateUtil('key.mensaje.stock.producto.seleccionado.menor.uno')
            this.alertSwalAlert.text =this.TranslateUtil('key.mensaje.no.puede.fraccionar.producto');
            this.alertSwalAlert.show();
            this.BuscaProductosFracionados(response.meinidprod)
          }
        }
      } else {
        this.loading = false;
      }
    });
    this.loading = false;
  }

  async BuscaProductosFracionados(meinidprod: number){
    this.detalleslotes = [];
    await this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, this.codigoproducto, 0, this.FormFraccionamiento.value.bodcodigo).subscribe(
        response => {
          if (response != undefined || response != null) {
            var index = 0;
            response.forEach(x => {
              x.row = index;
              this.detalleslotes.push(x);
              index++;
            });
            this.detalleslotesaux = this.detalleslotes;
            if(this.detalleslotes.length ===1){
              this.FormFraccionamiento.get('lote').setValue(this.detalleslotes[0].glscombo);
              this.FormFraccionamiento.get('fechavto').setValue(this.datePipe.transform(this.detalleslotes[0].fechavto, 'dd-MM-yyyy'));

              this.loteprod = this.detalleslotes[0].lote;
              this.fechav = this.detalleslotes[0].fechavto;
            }
          }
        }
      );
    await this._bodegasService.BuscaProductosFraccionados(this.hdgcodigo, this.esacodigo,
      this.cmecodigo, meinidprod,this.usuario,this.servidor,
      this.FormFraccionamiento.value.bodcodigo).subscribe(
      response => {
        if (response != null) {
          if(response.length==0){
            this.prodfrac = false;
          }else{
            this.prodfrac = true;
          }
          this.prodfraccionado = response;
          this.prodfraccionado.forEach(element=>{
            var temporal = new FraccionamientoProducto
            temporal.codmei     = element.meincodprod;
            temporal.meindescri = element.meindesprod;
            temporal.stockactual= element.stockactual;
            temporal.factordist = element.factorconv;
            temporal.factordistresp= temporal.factordist;
            temporal.cantidad   = 0;
            temporal.meiniddest = element.meiniddest;
            temporal.detallelote = this.detalleslotes;
            temporal.lote = this.loteprod;
            temporal.fechavto =this.fechav;
            temporal.bloqcampogrilla = true;
            this.detallefraccionamiento.push(temporal);
          });
          this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(0,20);
          this.FormFraccionamiento.get('codigo').setValue(this.codigoproducto);
          this.FormFraccionamiento.get('descripcion').setValue(this.descriporigen);
          this.FormFraccionamiento.get('cantidad').setValue(this.stockprodorigen);
          this.FormFraccionamiento.controls.codigo.disable();
          this.FormFraccionamiento.controls.descripcion.disable();
          this.FormFraccionamiento.controls.cantidad.disable();
          this.agregaprod = true;
          this.loading = false;
          this.logicaVaciosProductos();
          if(this.prodfraccionado.length>0 && this.stockprodorigen>0){
              // this.activabtngraba = true
          }
          this.detallefraccionamientoaux = this.detallefraccionamiento;
          this.detallefraccionamientopaginacionaux = this.detallefraccionamientopaginacion;
        }
    }, error => {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.producto.fraccionado');
      this.alertSwalError.show();
    });
  }

  setModalBusquedaProductosAFraccionar() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.productos.fraccionar'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        bodcodigo: this.FormFraccionamiento.value.bodcodigo,
        codigo   : this.codprod,
        descripcion: this.descprod
      }
    };
    return dtModal;
  }



  addArticuloGrilla() {
    var stock1 :StockProducto[]
    this.alertSwalError.title = null;
    this.codexiste = false;
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != undefined) {
        this.productoselec=response;
        if(this.productoselec.mein != this.meinidorig){
          const indx = this.detallefraccionamiento.findIndex(x => x.codmei === this.productoselec.codigo, 1);
          if (indx >= 0) {
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
            this.alertSwalError.show();
            this.FormDatosProducto.reset();
            this.codexiste = true;
          }else{
            if (this.codexiste == false){
              const DetalleFraccion = new FraccionamientoProducto;
              DetalleFraccion.codmei     = this.productoselec.codigo;
              DetalleFraccion.meindescri = this.productoselec.descripcion;
              DetalleFraccion.meiniddest = this.productoselec.mein;
              DetalleFraccion.factordist = 100;
              DetalleFraccion.factordistresp = DetalleFraccion.factordist;
              DetalleFraccion.cantidad   = 0;
              DetalleFraccion.detallelote= this.detalleslotes;
              DetalleFraccion.bloqcampogrilla = true;

              this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.productoselec.mein, this.FormFraccionamiento.value.bodcodigo,
               this.usuario, this.servidor).subscribe(
                response => {
                  if (response != null) {
                    DetalleFraccion.stockactual = response[0].stockactual;
                  }
                },);

              this.detallefraccionamiento.unshift(DetalleFraccion);
              this.detallefraccionamiento.forEach(x=>{
                x.lote= this.loteprod;
                x.fechavto = this.fechav;
              });
              this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(0,20);
              this.logicaVaciosProductos();

              this.detallefraccionamientoaux = this.detallefraccionamiento;
              this.detallefraccionamientopaginacionaux = this.detallefraccionamientopaginacion;
            }
          }
          this.FormDatosProducto.reset();
        }else{
          if(this.productoselec.mein === this.meinidorig){
            this.alertSwalError.title =this.TranslateUtil('key.mensaje.producto.ingresado.no.debe.ser.mismo.fraccionar');
            this.alertSwalError.show();
          }
        }
      }
    });
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
        id_Bodega: this.FormFraccionamiento.value.bodcodigo,
        codprod : this.FormDatosProducto.value.codigo

      }
    };
    return dtModal;
  }

  ConfirmaEliminaProductoDeLaGrilla(registro,id){

    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.eliminar.producto.plantilla'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminar.producto.plantilla'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        registro.pldevigente ="N";
        this.EliminaProductoDeLaGrilla(registro,id);
      }
    });
  }

  EliminaProductoDeLaGrilla(registro,id){
    this.alertSwal.title = null;
    this.alertSwalError.title = null;
    this.datosparaeliminar = [];
    if(registro.pldevigente == "N" && registro.factordist ==null){
      this.detallefraccionamiento.splice(id, 1);
      this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(0, 20);
      this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado');
      this.alertSwal.show();
      this.logicaVaciosProductos();
    }else{
      this.detallefraccionamiento.forEach(element=>{
        if(element.meiniddest== registro.meiniddest && id >=0){
          var temporal = new EliminaProductoFraccionado
          temporal.meinidorig = this.meinidorig;
          temporal.meiniddest = element.meiniddest;
          temporal.usuario    = this.usuario;
          temporal.servidor   = this.servidor;

          this.datosparaeliminar.unshift(temporal);

        }
      });
      this._bodegasService.EliminaProductoFraccionadoDeGrilla(this.datosparaeliminar).subscribe(
        response => {
          if (response != null) {
            this.detallefraccionamiento.splice(id, 1);
            this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(0, 20);
            this.alertSwal.title =this.TranslateUtil('key.mensaje.eliminacion.producto.realizado.exito');
            this.alertSwal.show();
            this.logicaVaciosProductos();
            this.detallefraccionamientoaux = this.detallefraccionamiento;
            this.detallefraccionamientopaginacionaux = this.detallefraccionamientopaginacion;
          }
        }, error => {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.eliminar.producto');
          this.alertSwalError.show();
        });
    }
  }

  async ConfirmaGenerarFraccionamiento(){
    await this.ValidaLoteSeleccionado();
    if(  this.validaloteengrilla) {
      const Swal = require('sweetalert2');
      Swal.fire({
        title: this.TranslateUtil('key.mensaje.desea.grabar.fraccionamiento.producto'),
        text: this.TranslateUtil('key.mensaje.confirmar.fraccionamiento.producto'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
      }).then((result) => {
        if (result.value) {
          this.GrabaFraccionamientoProducto();
        }
      })
    } else {
      return;
    }
  }

  async GrabaFraccionamientoProducto(){
    this.loading = true;
    this.datosparagrabar=[];
    this.detallefraccionamiento.forEach(element=>{
      var temporal = new GrabaProductoFraccionado
      temporal.meinidorig = this.meinidorig;
      temporal.meiniddest = element.meiniddest;
      temporal.factorconv = +element.factordist; //elsimbolo +  lo deja como numérico
      temporal.cantidorig = +element.cantidad;
      temporal.cantiddest = (element.factordist*element.cantidad);
      temporal.codbodega  = this.FormFraccionamiento.value.bodcodigo;
      temporal.usuario    = this.usuario;
      temporal.servidor   = this.servidor;
      temporal.hdgcodigo  = this.hdgcodigo;
      temporal.esacodigo  = this.esacodigo;
      temporal.cmecodigo  = this.cmecodigo;
      temporal.lote       = element.lote;
      temporal.fechavto   = this.datePipe.transform(element.fechavto, 'dd-MM-yyyy');
      this.datosparagrabar.unshift(temporal);
    });
    await this._bodegasService.GrabaFraccionamiento(this.datosparagrabar).subscribe(
      response => {
        if (response != null) {
          this.alertSwal.title =this.TranslateUtil('key.mensaje.fraccionamiento.exito');
          this.alertSwal.show();
          this.loading = true;
          this._bodegasService.BuscaProductoenlaBodega(this.hdgcodigo,this.esacodigo,this.cmecodigo,
          this.FormFraccionamiento.value.bodcodigo, this.codigoproducto,null,this.usuario,this.servidor).subscribe(
            response => {
              if (response != null) {
                this.FormFraccionamiento.get('cantidad').setValue(response[0].stockactual);
                this.detallefraccionamiento.forEach(element=>{
                  // var temporal = new FraccionamientoProducto
                  element.codmei = element.codmei;
                  element.meindescri = element.meindescri;
                  element.stockactual= element.stockactual+(element.factordist*element.cantidad) ;
                  element.factordist = element.factordist;
                  element.cantidad   = 0;
                  element.meiniddest = element.meiniddest;
                  element.cantidaddest= 0//+(element.stockactual * element.factordist)
                  element.lote       = element.lote;
                  element.fechavto   = element.fechavto;
                });
                this.blcbtnguardar = false;
                this.activabtngraba = false;
                this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(0,20);
                this.detallefraccionamientopaginacionaux = this.detallefraccionamientopaginacion;
                this.loading = false;
              } else {
                this.loading = false;
              }
            }, error => {
              this.loading = false;
            }
          );
          this.datosparagrabar=[];
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.fraccionar.producto');
        this.alertSwalError.show();
      }
    );
  }

  async ValidaLoteSeleccionado(){
    var holder = {};
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    if(this.detalleslotes.length >=2){
      this.detallefraccionamiento.forEach(d => {
        if (holder.hasOwnProperty(d.codmei)) {
          holder[d.codmei] = holder[d.codmei] + d.lote ;
        } else {
          holder[d.codmei] = d.lote;
        }
      });

      var obj2 = [];
      for (var prop in holder) {
        obj2.push({ codmei: prop, lote: holder[prop] });
      }

      for(let e of obj2){
        this.validatodosloslotesgrilla(e.codmei, e.lote).then(x => {
          if(x) {
            this.validaloteengrilla = true;
            return;
          } else {
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.seleccionar.lote.codigo')+ e.codmei;
            this.alertSwalAlert.show();
            this.validaloteengrilla = false;
            return;
          }
        });
      }
    }
  }

  async validatodosloslotesgrilla(codprod: string, lote: string) {
    for(let dat of this.detallefraccionamiento) {
      if(codprod === dat.codmei) {
        if(dat.lote == undefined || dat.lote =="") {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  getProductoGrilla() {
    this.alertSwalAlert.title= null;
    this.alertSwalAlert.text = null;
    this.codexiste = false;
    this.codprodgrilla = this.FormDatosProducto.controls.codigo.value;
    if(this.codprodgrilla === null || this.codprodgrilla === ''){
      this.addArticuloGrilla();
    } else{
      var tipodeproducto = 'MIM';
      this.loading = true;
      var controlado = '';
      var controlminimo = '';
      var idBodega = this.FormFraccionamiento.value.bodcodigo;
      var consignacion = '';
      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
        this.cmecodigo, this.codprodgrilla, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
        , this.usuario, null, this.servidor).subscribe(
        response => {
          if (response != null) {
            if (response.length == 0) {
              this.addArticuloGrilla()
              this.loading = false;
            } else {
              if (response.length > 0) {
                if(response.length >1){
                  this.addArticuloGrilla();
                }else{
                  if(response.length == 1){
                    this.productoselec = response[0];
                    if(this.productoselec.mein != this.meinidorig){
                      const indx = this.detallefraccionamiento.findIndex(x => x.codmei === this.productoselec.codigo, 1);
                      if (indx >= 0) {
                        this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                        this.alertSwalError.show();
                        this.FormDatosProducto.reset();
                        this.codexiste = true;
                      }else{
                        if (this.codexiste == false){
                          const DetalleFraccion = new FraccionamientoProducto;
                          DetalleFraccion.codmei     = this.productoselec.codigo;
                          DetalleFraccion.meindescri = this.productoselec.descripcion;
                          DetalleFraccion.meiniddest = this.productoselec.mein;
                          DetalleFraccion.factordist = 100;
                          DetalleFraccion.cantidad   = 0;
                          DetalleFraccion.detallelote= this.detalleslotes;
                          DetalleFraccion.lote = this.loteprod;
                          DetalleFraccion.fechavto =this.fechav;
                          DetalleFraccion.bloqcampogrilla = true;
                          this._creaService.BuscaStockProd(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.productoselec.mein, this.FormFraccionamiento.value.bodcodigo,
                          this.usuario, this.servidor).subscribe(
                            response => {
                              if (response != null) {
                                if(response.length == 0){
                                  DetalleFraccion.stockactual = 0;
                                }else{
                                  DetalleFraccion.stockactual = response[0].stockactual;
                                }
                              }
                            });
                          this.detallefraccionamiento.unshift(DetalleFraccion);
                          this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(0,20);
                          this.detallefraccionamientoaux = this.detallefraccionamiento;
                          this.detallefraccionamientopaginacionaux = this.detallefraccionamientopaginacion;
                          this.logicaVaciosProductos();
                          this.FormDatosProducto.reset();
                        }
                      }
                    }else{
                      if(this.productoselec.mein === this.meinidorig){
                        this.alertSwalError.title =this.TranslateUtil('key.mensaje.producto.ingresado.no.debe.ser.mismo.fraccionar');
                        this.alertSwalError.show();
                      }
                    }
                  }
                }
                  this.loading = false;
                }
              }
            }
          }, error => {
            this.loading = false;
          });
    }
  }

  SeleccionaLote(value: any,event:any){
    const fechaylote = value.split('/');
    this.fechav = fechaylote[0];
    this.loteprod = fechaylote[1];
    this.FormFraccionamiento.get('fechavto').setValue(this.datePipe.transform(this.fechav, 'dd-MM-yyyy'));
    this.detallefraccionamiento.forEach(x=>{
      x.lote = this.loteprod;
      x.fechavto = this.fechav;
    });
  }

  SeleccionaLoteGrilla(value: string, indx: number,detalle: FraccionamientoProducto) {
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    const fechalote = value.split('/');
    const fechav = fechalote[0];
    const loteprod = fechalote[1];
    const cantidad = fechalote[2];
    const codmei = fechalote[3];
    this.validaLotemedicamento(loteprod, detalle.codmei,fechav,detalle.detallelote).then( (res) =>{
      if(res) {
        this.detallefraccionamiento[indx].fechavto = fechav;
        this.detallefraccionamiento[indx].lote = loteprod;
        this.logicaVaciosProductos()
        if(detalle.cantidad <0){
          if(loteprod !=""){
            this.detallefraccionamiento[indx].cantidad = 0//this.detallefraccionamiento[indx].cantadespacharresp;
            this.detallefraccionamientopaginacion[indx].cantidad = this.detallefraccionamiento[indx].cantidad;
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.debe.ser.mayor.cero');
            this.alertSwalAlert.show();
          }
        }
        if(detalle.cantidad > parseInt(cantidad)){
          if(loteprod != ""){
            this.alertSwalAlert.title =this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.saldo.lote');
            this.alertSwalAlert.text = "El saldo del lote "+detalle.lote+" tiene "+ cantidad +", ingresar cantidad menor";
            this.alertSwalAlert.show();
            this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, codmei, 0,  this.FormFraccionamiento.value.bodcodigo   ).subscribe(
              response => {
                if (response == undefined || response === null){
                  this.detallefraccionamiento[indx].detallelote = [];
                }else {
                  this.detallefraccionamiento[indx].detallelote = [];
                  this.detallefraccionamiento[indx].detallelote = response;
                  this.detallefraccionamiento[indx].lote = response[0].lote;
                  this.detallefraccionamiento[indx].fechavto = response[0].fechavto;
                }
              });
          }
        }
      }else {
        let codigo_bodega_lote = this.FormFraccionamiento.value.bodcodigo;
        this._solicitudService.BuscaLotesProductosxBod(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, codmei, 0,  codigo_bodega_lote  ).subscribe(
        response => {
          if (response == undefined || response === null){
            this.detallefraccionamiento[indx].detallelote = [];
            }else {
              this.detallefraccionamiento[indx].detallelote = [];
              this.detallefraccionamiento[indx].detallelote = response;
              this.detallefraccionamiento[indx].lote = response[0].lote;
              this.logicaVaciosProductos();
            }
        });
        return;
      }
    });
  }

  async validaLotemedicamento(lote: string, codmei: string,fechavto: string,detallelote: any) {
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    let validaok = false;
    for(let d of this.detallefraccionamiento) {
      if(d.codmei == codmei && d.lote === lote && d.fechavto === fechavto) {
        this.alertSwalAlert.title = `El Lote  ${d.lote} ya existe en la grilla`;
        this.alertSwalAlert.text = `Seleccione otro lote disponible`;
        this.alertSwalAlert.show();
        validaok = false;
        break;
      } else {
        validaok = true;
      }
    }
    return validaok;
  }

  async CambioCheck(registro: FraccionamientoProducto,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      registro.marcacheckgrilla = true;
      this.desactivabtnelim = true;
      await this.isEliminaInsGrilla(registro)
      await this.detallefraccionamiento.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;
        }
      });
    }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelim = false;
      await this.isEliminaInsGrilla(registro);
      await this.detallefraccionamiento.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;
        }
      });
    }
  }

  isEliminaInsGrilla(registro:FraccionamientoProducto) {
    let indice = 0;
    for (const articulo of this.detallefraccionamiento) {
      if (registro.codmei === articulo.codmei){ // && registro.sodeid === articulo.sodeid) {
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
    this.alertSwal.title = null;
    this.alertSwalError.title = null;
    this.datosparaeliminar = [];
    this.detallefraccionamientopaginacion.forEach(registro=>{
      if(this.prodfrac == false){
        if(registro.marcacheckgrilla == true ){
          this.desactivabtnelim = false;
          this.detallefraccionamiento.splice(this.isEliminaMed(registro), 1);
          this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(0, 20);
          this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado');
          this.alertSwal.show();
          this.logicaVaciosProductos();
        }
      }else{
        if(this.prodfrac === true){
          if(registro.marcacheckgrilla === true){
            this.detallefraccionamiento.forEach(element=>{
              if(element.meiniddest== registro.meiniddest && this.isEliminaMed(registro) >=0){
                var temporal = new EliminaProductoFraccionado
                temporal.meinidorig = this.meinidorig;
                temporal.meiniddest = element.meiniddest;
                temporal.usuario    = this.usuario;
                temporal.servidor   = this.servidor;
                this.datosparaeliminar.unshift(temporal);
              }
            });
            this._bodegasService.EliminaProductoFraccionadoDeGrilla(this.datosparaeliminar).subscribe(
              response => {
                if (response != null) {
                  this.detallefraccionamiento.splice(this.isEliminaMed(registro), 1);
                  this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(0, 20);
                  this.alertSwal.title =this.TranslateUtil('key.mensaje.eliminacion.producto.realizado.exito');
                  this.alertSwal.show();
                  this.logicaVaciosProductos();
                }
              },
              error => {
                this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.eliminar.producto');
                this.alertSwalError.show();
              });
          }
        }
      }
    });
  }

  isEliminaMed(registro: FraccionamientoProducto) {
    let indice = 0;
    for (const articulo of this.detallefraccionamiento) {
      if (registro.codmei === articulo.codmei) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

  salir(){
    const Swal = require('sweetalert2');
    if( this.meinidorigaux !== this.meinidorig ||
        this.stockprodorigenaux !== this.stockprodorigen ||
        this.codigoproductoaux !== this.codigoproducto ||
        this.descriporigenaux !== this.descriporigen ){
      this.msj = true;
    }
    if ( this.detallefraccionamientoaux.length !== this.detallefraccionamiento.length ||
      this.detallefraccionamientopaginacionaux.length !== this.detallefraccionamientopaginacion.length ){
        this.msj = true;
      }
    if(this.msj){
      Swal.fire({
        title: this.TranslateUtil('key.title.salir'),
        text: this.TranslateUtil('key.mensaje.pregunta.confirma.salir.sin.guardar'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
          this.route.paramMap.subscribe(param => {
            this.router.navigate(['home']);
          });
        }
      });
    } else {
      this.route.paramMap.subscribe(param => {
        this.router.navigate(['home']);
      });
    }
  }

  async ConfirmaGuardado(){
    await this.ValidaLoteSeleccionado();
    if(  this.validaloteengrilla) {
      const Swal = require('sweetalert2');
      Swal.fire({
        title: this.TranslateUtil('key.mensaje.desea.grabar.fraccionamiento.producto'),
        text: this.TranslateUtil('key.mensaje.confirmar.fraccionamiento.producto'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
      }).then((result) => {
        if (result.value) {
          this.GrabaFactorConversionProducto();
        }
      })
    } else {
      return;
    }
  }

  async GrabaFactorConversionProducto(){
    this.alertSwal.title = null;
    this.alertSwal.text = null;
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.loading = true;
    this.datosparagrabar=[];
    this.detallefraccionamiento.forEach(element=>{
      var temporal = new GrabaProductoFraccionado
      temporal.meinidorig = this.meinidorig;
      temporal.meiniddest = element.meiniddest;
      temporal.factorconv = +element.factordist;
      this.datosparagrabar.unshift(temporal);
    });
    await this._bodegasService.GrabaFactorConversionProducto(this.servidor,this.hdgcodigo,this.esacodigo,this.cmecodigo,this.usuario,
      this.datosparagrabar).subscribe(
      response => {
        if (response != null) {
          var grabar = response;
          if (grabar.mensaje.estado) {
            this.alertSwal.title =this.TranslateUtil('key.mensaje.factor.conversion.guardado.exito');
            this.alertSwal.show();
            this.loading = true;
            this._bodegasService.BuscaProductoenlaBodega(this.hdgcodigo,this.esacodigo,this.cmecodigo,
            this.FormFraccionamiento.value.bodcodigo, this.codigoproducto,null,this.usuario,this.servidor).subscribe(
              response => {
                if (response != null) {
                  this.FormFraccionamiento.get('cantidad').setValue(response[0].stockactual);
                  this.detallefraccionamiento.forEach(element=>{
                    element.codmei = element.codmei;
                    element.meindescri = element.meindescri;
                    element.stockactual= element.stockactual+(element.factordist*element.cantidad);
                    element.factordist = element.factordist;
                    element.cantidad   = 0;
                    element.meiniddest = element.meiniddest;
                    element.cantidaddest= 0//+(element.stockactual * element.factordist)
                    element.lote       = element.lote;
                    element.fechavto   = element.fechavto;
                  });
                  this.detallefraccionamientopaginacion = this.detallefraccionamiento.slice(0,20);
                  this.detallefraccionamientopaginacionaux = this.detallefraccionamientopaginacion;
                  this.loading = false;
                } else{
                  this.loading = false;
                }
              }, error => {
                this.loading = false;
              }
            );
            this.datosparagrabar=[];
          } else {
            this.alertSwalAlert.title =this.TranslateUtil('key.mensaje.error.intentar.guardar');
            this.alertSwalAlert.text = grabar.mensaje;
            this.alertSwalAlert.show();
            this.loading = false;
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.fraccionar.producto');
        this.alertSwalError.show();
      }
    );
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
