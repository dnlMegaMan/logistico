import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { BusquedabodegasComponent } from '../busquedabodegas/busquedabodegas.component';
import { BodegasService } from '../../servicios/bodegas.service';
import { Servicio } from '../../models/entity/Servicio';
import { DetalleOC } from 'src/app/models/entity/DetalleOC';
import { ProductosBodegas } from 'src/app/models/entity/productos-bodegas';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { TiporegistroService } from '../../servicios/tiporegistro.service';
import { validateRUT } from 'validar-rut';


import { BusquedaServiciosComponent } from '../busqueda-servicios/busqueda-servicios.component';
import { BusquedaUsuariosComponent } from '../busqueda-usuarios/busqueda-usuarios.component';

import { Permisosusuario } from '../../permisos/permisosusuario';
import { InformesService } from '../../servicios/informes.service';

import {Sort} from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { MedioPago } from '../../models/entity/MedioPago';
import { OrdenCompraService } from '../../servicios/ordencompra.service';
import { Proveedores } from '../../models/entity/Proveedores';
import { ProveedoresService } from '../../servicios/proveedores.service';
import { Articulos } from '../../models/entity/mantencionarticulos';
import { BusquedaproductosService } from '../../servicios/busquedaproductos.service';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { CreasolicitudesService } from '../../servicios/creasolicitudes.service';
import { UltimaOc } from '../../models/entity/UltimaOc';
import { OrdenCompra } from '../../models/entity/ordencompra';
import { TipoDocumento } from '../../models/entity/TipoDocumento';
import { BuscarOcModalComponent } from '../buscar-oc-modal/buscar-oc-modal.component';
import { DetalleMovimientoOc } from '../../models/entity/detalleMovimientoOc';
import { GuiaOc } from '../../models/entity/GuiaOc';
import { Console } from 'console';
import { DatePipe } from '@angular/common';
import { DetalleOcModalComponent } from '../detalle-oc-modal/detalle-oc-modal.component';
import { LoteOc } from '../../models/entity/LoteOc';
import { throws } from 'assert';
import { BusquedaproveedorocmodalComponent } from '../busquedaproveedor-oc-modal/busquedaproveedorocmodal.component';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-recepcion-oc',
  templateUrl: './recepcion-oc.component.html',
  styleUrls: ['./recepcion-oc.component.css'],
  providers: [InformesService,OrdenCompraService,ProveedoresService,BusquedaproductosService ]

})
export class RecepcionOcComponent implements OnInit {

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;/****Componente para visualizar alertas****/
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  //@ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalErrorConfirmar', { static: false }) alertSwalErrorConfirmar: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;
  @ViewChild('tabset', { static: false }) tabset: TabsetComponent;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormRecepOc: FormGroup;
  public FormGuiaOc: FormGroup;
  public FormDatosProducto      : FormGroup;
  public codprod                = null;

  /**** variables booleanas que se accionan con el negocio*****/
  public bloquear_numoc: boolean = false;
  public bloquear_btn_buscar: boolean = false;
  public bloquear_rutprov: boolean = false;
  public bloquear_anulada : boolean = true;
  public bloquear_btn_agregar : boolean = true;
  public bloquear_btn_agregar_aux : boolean = true;
  public bloquear_btn_limpiar : boolean = false;
  public bloquear_eleminargrilla : boolean = true;
  public bloquear_limpiartodo : boolean = true;
  public bloquear_item : boolean = true;
  public bloquear_btneleminargrilla : boolean = false;
  public bloquear_aux : boolean = true;
  public bloquear_aux_guia : boolean = true;
  public bloquear_btn_limpia_recep : boolean = true;
  public maxDate: Date = new Date();
  public bloquear_recep: boolean = false;
  public bloquear_cerrar: boolean = false;

  public estadodesc: string;
  private _BSModalRef: BsModalRef;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public servicios: Servicio[];
  public odmomonto : number = 0;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario : string;
  public mediopago_aux = MedioPago;
  public listamediopago : MedioPago[] = [];
  public listatipodocumento : TipoDocumento[] = [];
  public ultimaOc      :UltimaOc[] = [];
  public ordencompra   :OrdenCompra;
  public guia : GuiaOc;
  public guiaArray : Array<GuiaOc> = [];
  public loteArray : Array<LoteOc> = [];
  public ultimarecep : any;
  public recepcion_det : DetalleMovimientoOc;
  public proveedor : Proveedores[] = [];
  public rutproveedor : number;
  public formapago : number;
  public selected : number;
  public odmoId : number;
  public productoselec          : Articulos;
  public listado_articulos      : Array<DetalleOC> = [];
  public listado_articulos_original      : Array<DetalleOC> = [];
  public listado_articulos_aux      : DetalleOC;
  public listado_recepcion      : Array<DetalleMovimientoOc> = [];
  public descprod               = null;
  public codoc                  : number  = 0;
  public lista_eliminados       : Array<number> = [];
  public bloquear_btn_recep     : boolean = false;
  public valorvalido : boolean = false;
  public valortotal : number = 0;
  public itemsrecep : number = 0;
  public montoingresado : number =0;
  public totalitems : number = 0;
  public bodcodigo : number = 0;
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public listadoproductosbodega : any;
  public provid : number = 0;
  public provdesc: string = null;
  public cargada: boolean = false;

  onClose: any;
  bsModalRef: any;

  public loading = false;
  public isOc : boolean = true;
  /**** paginacion****/
  public page : number = 1;
  public optOrden : string = "ASC";

  constructor(
    public _BsModalService: BsModalService,
    private formBuilder: FormBuilder,
    public TiporegistroService: TiporegistroService,
    private _imprimesolicitudService: InformesService,
    private router: Router,
    private route: ActivatedRoute,
    private _ordencompra: OrdenCompraService,
    private _proveedor: ProveedoresService,
    public _BusquedaproductosService: BusquedaproductosService,
    public _solicitudService        : SolicitudService,
    public _creaService             : CreasolicitudesService,
    public datePipe                   : DatePipe,
    public _BodegasService          : BodegasService,
    public translate: TranslateService
  ) {this.FormRecepOc = this.formBuilder.group({
      numorden: [{ value: null, disabled: false }, Validators.required],
      rutprov: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(9)]],
      descprov: [{ value: null, disabled: true }, Validators.required],
      dirprov: [{ value: null, disabled: true }, Validators.required],
      provid: [{ value: null, disabled: true }, Validators.required],
      mediopago: [{ value: null, disabled: false }, Validators.required],
      contactoprov: [{ value: null, disabled: true }, Validators.required],
      montominfact: [{ value: null, disabled: true }, Validators.required],
  });

  this.FormGuiaOc = this.formBuilder.group({
    tipodoc: [{ value: null, disabled: false }, Validators.required],
    bodcodigo: [{ value: null, disabled: false }, Validators.required],
    numdoc: [{ value: null, disabled: false }, Validators.required],
    montodcto: [{ value: null, disabled: false }, Validators.required],
    fecharecep: [{ value: null, disabled: false }, Validators.required],
    fechadocto: [{ value: null, disabled: false }, Validators.required],
    itemsdocto: [{ value: null, disabled: false }, Validators.required],
    doctosasoc: [{ value: null, disabled: false }, Validators.required],
  })




  }

  ngOnInit() {
    const hdgcodigo = sessionStorage.getItem('hdgcodigo');
    const esacodigo = sessionStorage.getItem('esacodigo');
    const cmecodigo = sessionStorage.getItem('cmecodigo');
    const usuario = sessionStorage.getItem('Usuario');
    this.hdgcodigo = Number(hdgcodigo);
    this.esacodigo = Number(esacodigo);
    this.cmecodigo = Number(cmecodigo);
    this.usuario = usuario||"";
    this.FormDatosProducto = new FormGroup({
      codigo: new FormControl(),
      descripcion: new FormControl(),
      cantidad: new FormControl(),
      lote: new FormControl(),
      fechavenc: new FormControl(),
    });
    this.BuscaBodegaSolicitante();
    this.cargarCombos();
    this.FormRecepOc.controls.mediopago.disable();
    this.FormGuiaOc.controls.bodcodigo.disable();
    this.FormGuiaOc.controls.tipodoc.disable();
  }

  SeleccionaBodega(codigobodega: number){
    this.bodcodigo = codigobodega;
  }

  BuscaBodegaSolicitante() {
    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.bodegasSolicitantes = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  salir(){
    this.router.navigate(['home'])
  }

  /****funcion que busca orden de compra por id****/
  async buscarOc(codigo: number, tipo: number)
  {
    var odmo = 1;
    this.codoc = Number(codigo);
    const mediopago_nuevo = new (MedioPago);
    this.ultimarecep = await this._ordencompra.BuscarUltimaRecep( this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.servidor).toPromise();
    this.odmoId = odmo + Number(this.ultimarecep[0]['orcoid']);
    this._ordencompra.BuscarOc(this.hdgcodigo  , this.cmecodigo, this.esacodigo,
      this.codoc,
      this.servidor,
      this.usuario).subscribe(
      response => {
        if(response.length == 0){
            return;
        } else {
          this.FormRecepOc.controls.rutprov.setValue(response[0]['proveedorrut'].toString())
          this.FormRecepOc.controls.descprov.setValue(response[0]['descripcionprov'].toString())
          this.FormRecepOc.controls.dirprov.setValue(response[0]['direccionprov'].toString())
          this.FormRecepOc.controls.contactoprov.setValue(response[0]['contactoprov'].toString())
          this.FormRecepOc.controls.montominfact.setValue(response[0]['montominfac'].toString())
          this.FormRecepOc.controls.provid.setValue(response[0]['provid'].toString())
          this.provid = Number(response[0]['provid'].toString())
          this.FormGuiaOc.controls.doctosasoc.setValue(response[0]['listadocumentos'].toString())
          this.FormRecepOc.controls.numorden.setValue(codigo.toString())
          switch(response[0]['estado']) {
            case 1: {
              this.alertSwalError.title = "Orden de compra "+this.codoc+" Debe emitirse antes de ser recepcionada";
              this.alertSwalError.text = '';
              if(tipo == 1)
              {
                this.alertSwalError.show();
              }
              this.limpiarPantalla();
              return;
            }
            case 2:
            case 3: {
              this.bloquear_anulada = true;
              this.bloquear_eleminargrilla = true;
              this.bloquear_eleminargrilla = true;
              this.bloquear_btneleminargrilla = true;
              this.bloquear_aux = false;
              this.bloquear_aux_guia = false;
              this.bloquear_btn_limpia_recep = false;
              this.bloquear_rutprov = true;
              this.listamediopago = [];
              mediopago_nuevo.codmediopago = response[0]['tipopagoval'];
              mediopago_nuevo.glsmediopago = response[0]['tipopago'];
              this.selected = Number(mediopago_nuevo.codmediopago);
              this.listamediopago.push(mediopago_nuevo);
              this.buscarOcDet(this.codoc);
              this.bloquear_btn_buscar = true;
              this.bloquear_limpiartodo = false;
              this.bloquear_numoc = true;
              this.bloquear_cerrar = true;
              this.cargada = true;
              this.FormGuiaOc.controls.bodcodigo.enable();
              this.FormGuiaOc.controls.tipodoc.enable();
              break;
            }
            case 4: {
              this.alertSwalError.title = "Orden de compra "+this.codoc+" Se encutra recepcionada completamente";
              this.alertSwalError.text = '';
              if(tipo == 1)
              {
                this.alertSwalError.show();
              }
              this.limpiarPantalla();
              return;
            }
            case 5: {
              this.alertSwalError.title = "Orden de compra "+this.codoc+" Se encuentra anulada y no puede recepcionarse";
              this.alertSwalError.text = '';
              if(tipo == 1)
              {
                this.alertSwalError.show();
              }
              this.limpiarPantalla();
              return;
            }
            case 6: {
              this.alertSwalError.title = "Orden de compra "+this.codoc+" Fue cerrada de manera manual y no puede recepcionarse";
              this.alertSwalError.text = '';
              if(tipo == 1)
              {
                this.alertSwalError.show();
              }
              this.limpiarPantalla();
              return;
            }
            case 7: {
              this.estadodesc = "AUTORIZADA";
              break;
            }
            default: {
              this.estadodesc = "";
               break;
            }
          }
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      });
  }

  /**** funcion para confirmarcierre manual ****/
  confirmarCerrar() {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.cerrar.oc'),
      text: this.TranslateUtil('key.mensaje.seguro.desea.cerrar.oc'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.cerrarOc();
      } else {
        this.loading = false;
        return;
      }
    })
  }

  /****funcion que cierra la OC****/
  cerrarOc(){
    this.codoc = this.FormRecepOc.controls.numorden.value;
    this._ordencompra.cerrarOrdenCompra( this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, Number(this.codoc),this.servidor).subscribe(
      response => {
        this.alertSwalError.title = "Orden Compra "+this.codoc+" Cerrada";
        this.alertSwalError.text = '';
        this.alertSwalError.show();
        this.buscarOc(this.codoc,0);
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.solicitud');
        this.alertSwalError.text = '';
        this.alertSwalError.show();
      }
    );
  }

  /**** confirmacion de eliminar elementos seleccionados****/
  ConfirmaEliminarSel() {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.eliminar.selecionados'),
      text: this.TranslateUtil('key.mensaje.seguro.desea.eliminar.articulos.seleccionados'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.eliminaritemsgrilla();
      } else {
        this.loading = false;
        return;
      }
    })
  }

  /**** Funcion que elimina items seleccionados de la grilla ****/
  eliminaritemsgrilla()
  {
    for (var i = this.lista_eliminados.length -1; i >= 0; i--)
    {
      this.listado_articulos.splice(this.lista_eliminados[i],1);
    }
  }

  async confirmarBodegas()
  {
    this.listadoproductosbodega = await this._ordencompra.listarMeinBodega(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      this.listado_articulos,
      this.servidor,
      this.bodcodigo
    ).toPromise();
  }

  ConfirmaGenerarRecepcion() {

    this.confirmarBodegas();

    this.validaDcto();


    if(this.FormGuiaOc.controls.tipodoc.value == null || this.FormGuiaOc.controls.tipodoc.value == undefined)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.seleccionar.tipo.documento');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
      return;
    }

    if(this.FormGuiaOc.controls.numdoc.value == null || this.FormGuiaOc.controls.numdoc.value == undefined)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.ingresar.numero.documento');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
      return;
    }

    if(this.FormGuiaOc.controls.montodcto.value == null || this.FormGuiaOc.controls.montodcto.value == undefined)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.ingresar.monto.documento');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
      return;
    }

    if(this.valorvalido == false)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.monto.ingresado.no.coincide.monto.calculado');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
      return;
    }

    if(this.FormGuiaOc.controls.fecharecep.value == null || this.FormGuiaOc.controls.fecharecep.value == undefined)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.ingresar.fecha.recepcion');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
      return;
    }

    if(this.FormGuiaOc.controls.fechadocto.value == null || this.FormGuiaOc.controls.fechadocto.value == undefined)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.ingresar.fecha.documento');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
      return;
    }

    if(this.bodcodigo == 0)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.seleccionar.bodega.recepcionar');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
      return;
    }
    this.loading = true;

    this.confirmarBodegas()

    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.recepcion.oc'),
      text: "",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.generarRecepcion();
      } else {
        this.loading = false;
        return;
      }
    })
  }

  /**** funcion que limpia la pantalla *****/
  limpiarPantalla()
  {
      this.FormGuiaOc.controls.bodcodigo.disable();
      this.FormGuiaOc.controls.tipodoc.disable();
      this.bloquear_cerrar = false;
      this.FormRecepOc.reset();
      this.FormGuiaOc.reset();
      this.bloquear_numoc = false;
      this.bloquear_rutprov = false;
      this.bloquear_btn_agregar = true;
      this.bloquear_limpiartodo = true;
      this.bloquear_btn_buscar = false;
      this.bloquear_eleminargrilla = true;
      this.bloquear_btneleminargrilla = false;
      this.cargada = false;
      this.listado_articulos = [];
      this.listamediopago = [];
      this.lista_eliminados = [];
      this.limpiar_auxiliar();
      this.bloquear_aux = true;
      this.bloquear_aux_guia = true;
      this.bloquear_item = true;
      this.bloquear_btn_limpia_recep = true;
      this.bloquear_recep = false;
      this.listado_recepcion = [];
  }

  /****funcion que busca orden de compra por id****/
  async buscarOcDet(codigo: number)
  {
    this.codoc = Number(codigo);
    this._ordencompra.BuscarOcDet(
      this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
      this.codoc,
      this.servidor,null,null).subscribe(
      response => {
        if(response.length == 0){
            return;
        } else {
          this.listado_articulos_original = response;
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      });
  }

  async cambioCheck(id: number){
    this.lista_eliminados.push(id);
  }

  /**** funcion que se asegura de revisar que todos los datos del formulario se encuentren completos*****/
  checkform() {
    var r = document.forms["FormGuiaOc"].getElementsByTagName("input");
    var f = document.forms["FormGuiaOc"].elements;
    var cansubmit = true;
    for (var i = 0; i < f.length; i++) {
        if (f[i].value.length == 0) cansubmit = false;
    }
    if (cansubmit) {
        return true;
    }
    else {
      return false;
    }
  }

  /**** funcion que cambia la cantidad a despachar de un articulo ****/
  cambio_cantidad(id: number, property: string,cantidad : number){
    var ingreso = Number(this.listado_articulos[id][property])
    if(ingreso == 0)
    {
      this.listado_articulos[id][property] = 0;
    }
    var pendiente = Number(this.listado_articulos[id]['pendiente']);
    var acum = 0;
    var meincodigo = this.listado_articulos[id]['meincodigo'];
    for (const element of this.listado_articulos) {
      //console.log(meincodigo)
      //console.log(element.meincodigo)
      if(element.meincodigo == meincodigo)
      {

        acum = acum + Number(element.odetcantdespachada_aux);
      }
    }

    if(acum > pendiente )
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.esta.excediendo.cantidad.solicitada');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
      this.bloquear_recep = true;
    }
    else
    {
      this.bloquear_recep = false;
    }
    this.recalcular_valor();
  }

  /**** funcion que cambia la cantidad a despachar de un articulo ****/
  cambio_valor(id: number, property: string,cantidad : number){
    let valor = cantidad['odetvalorcosto']
    let mein = cantidad['odetmeinid']
    if(valor == 0)
    {
      this.listado_articulos[id][property] = 0;
      this.bloquear_recep = true;
    }
    else
    {
      for (const element of this.listado_articulos) {
        if(element.odetmeinid == mein)
        {
          element.odetvalorcosto = valor;
        }
      }
      this.bloquear_recep = false;
    }
    this.recalcular_valor();
  }

  cambio_dato(id: number, property: string,cantidad : string){
   if(this.listado_articulos[id][property] == "")
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.dato.lote.no.quedar.blanco');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
      this.bloquear_recep = true;
    }
    else
    {
      this.bloquear_recep = false;
      for (const element of this.loteArray) {
        if(element.lote == this.listado_articulos[id]['loteori'])
        {
          element.lote = this.listado_articulos[id][property];
          this.listado_articulos[id]['loteori'] = this.listado_articulos[id][property]
        }
      }
    }
  }

  limpiar_auxiliar()
  {
    this.FormDatosProducto.reset();
    this.bloquear_btn_agregar_aux = true;
    this.bloquear_aux = false;
    this.bloquear_item = true;
  }

  /**** Fun cion que agrega os datos a la grilla de recepcion*/
  agregar_auxiliar()
  {
    const lote_aux = new (LoteOc);
    lote_aux.saldo = Number( this.FormDatosProducto.controls.cantidad.value.toString());
    this.listado_articulos_aux.acum = this.listado_articulos_aux.acum + lote_aux.saldo;
    if(this.listado_articulos_aux.odetcantdespachada_aux > this.listado_articulos_aux.odetcantreal
      || this.listado_articulos_aux.acum > this.listado_articulos_aux.odetcantreal) {
      this.listado_articulos_aux.acum = this.listado_articulos_aux.acum - lote_aux.saldo;
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.puede.exceder.cantidad.solicitada');
      this.alertSwalError.text = '';
      this.alertSwalError.show();
    }
    else {
      lote_aux.bodid = 0;
      lote_aux.cmecodigo = this.cmecodigo;
      lote_aux.esacodigo = this.esacodigo;
      lote_aux.hdgcodigo = this.hdgcodigo;
      lote_aux.fechavencimiento = this.datePipe.transform( this.FormDatosProducto.controls.fechavenc.value.toString(), 'dd-MM-yyyy');
      lote_aux.lote = this.FormDatosProducto.controls.lote.value.toString();
      lote_aux.provid =  Number(this.FormRecepOc.controls['provid'].value);
      lote_aux.meinid = this.listado_articulos_aux.odetmeinid;
      lote_aux.odetid = this.listado_articulos_aux.odetid;
      this.listado_articulos_aux.odetcantdespachada_aux = lote_aux.saldo;
      this.listado_articulos_aux.fechavenc = lote_aux.fechavencimiento;
      this.listado_articulos_aux.lote = lote_aux.lote;
      this.listado_articulos_aux.loteori = lote_aux.lote;
      this.listado_articulos.push(this.listado_articulos_aux);
      console.log(this.listado_articulos_aux)
      for (const element of this.listado_articulos) {
        if(element.odetmeinid == this.listado_articulos_aux.odetmeinid)
        {
          element.acum =  this.listado_articulos_aux.acum;
        }
      }

      this.FormGuiaOc.controls.itemsdocto.setValue(this.listado_articulos.length.toString())
      this.loteArray.push(lote_aux);
      this.limpiar_form_prod();
      this.recalcular_valor();
    }
  }

  /**** funcion que limpia la grilla****/
  limpiarGrilla()
  {
    this.listado_articulos = [];
  }

  /**** funcion que limpia el registro de formulari ode productos****/
  limpiar_form_prod()
  {
    this.FormDatosProducto.reset();
    this.listado_articulos_aux = new (DetalleOC);
  }

  /**** funcion que valida el numero de documento****/
  validaDcto(){
    let dcto = this.FormGuiaOc.controls.numdoc.value;
    let tipo = this.FormGuiaOc.controls.tipodoc.value
    if(dcto == null || tipo == null)
    {
      return;
    }
    this._ordencompra.BuscarGuiaFiltros(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      0,
      null,
      null,
      Number(this.FormGuiaOc.controls.tipodoc.value),
      dcto,
      this.servidor, this.provid, 0
     ).subscribe(
      response => {
        if(response.length == 0){
            return;
        } else if (response.length == 1){
          if(response[0]["mensaje"] == "Sin Datos")
          {
            return;
          }
          else
          {
            this.FormGuiaOc.controls.numdoc.setValue("")
            this.alertSwalError.title = "Numero de documento "+ dcto +" ya está asociado al proveedor";
            this.alertSwalError.text = '';
            this.alertSwalError.show();
          }

        } else {
          this.FormGuiaOc.controls.numdoc.setValue("")
          this.alertSwalError.title = "Numero de documento "+ dcto +" ya está asociado al proveedor";
          this.alertSwalError.text = '';
          this.alertSwalError.show();
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      });

  }

  /**** funcion que busca un item en la lista original****/
  getProducto()
  {
    this.loading = true;
    let getcodigo = this.FormDatosProducto.controls.codigo.value;
    let getdesc = this.FormDatosProducto.controls.descripcion.value;
    if(getcodigo == null && getdesc == null)
    {
      this.loading = false;
      return;
    }

    this.validaBtnAgregar()
    let encontrado = 0;
    this.listado_articulos_aux = new (DetalleOC);;
    for (const element of this.listado_articulos_original) {
      if(element.meincodigo == getcodigo)
      {
        this.listado_articulos_aux = element;
        encontrado = 1;
      }
    }
    if(encontrado == 1)
    {
      this.listado_articulos_aux.acum =  this.listado_articulos_aux.odetcantdespachada;
      for (const element of this.listado_articulos) {
        if(element.odetmeinid == this.listado_articulos_aux.odetmeinid)
        {
          var acumulado = Number(element.acum);
          var acumulado_aux = Number(this.listado_articulos_aux.acum)
          this.listado_articulos_aux.acum = acumulado + acumulado_aux;
          break;
        }
      }
      this.listado_auxiliar(this.listado_articulos_aux);
    }
    else
    {
      const tipodeproducto = 'MIM';
      const controlado = '';
      const controlminimo = '';
      const idBodega = 0;
      const consignacion = '';
      this._BusquedaproductosService.BuscarArticulosFiltrosOc(this.hdgcodigo, this.esacodigo,
        this.cmecodigo, getcodigo, getdesc, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
        , this.usuario, null, this.servidor, null, 0, 0, 0).subscribe(
         response => {
           if (response != null) {
             if (!response.length) {
                this.loading = false;
                this.alertSwalError.title = this.TranslateUtil('key.mensaje.articulo.no.existe');
                this.alertSwalError.text = '';
                this.alertSwalError.show();
                this.limpiar_form_prod()
                return;
             } else {
               if(response.length > 1){
                  if(getdesc != null)
                  {
                    this.loading = true;
                    this.abrirModalDetalleOc(this.codoc,getdesc,getcodigo)
                  }
                  else
                  {
                    this.loading = false;
                    this.alertSwalError.title = this.TranslateUtil('key.mensaje.articulo.no.existe');
                    this.alertSwalError.text = '';
                    this.alertSwalError.show();
                    this.limpiar_form_prod()
                    return;
                  }
               }else{
                 if(response.length == 1){
                  this.loading = false;
                  this.alertSwalError.title = response[0]['descripcion'] + ' no asociado a OC';
                  this.alertSwalError.text =  '';
                  this.alertSwalError.show();
                  this.limpiar_form_prod()
                  return;
                 }
               }
             }
           }
             this.loading = false;
         }, error => {
           this.loading = false;
         }
           );
    }
  }

  getProductoDescrip(varDesc: String)
  {
     this.listado_articulos_aux = new (DetalleOC)
     for (const element of this.listado_articulos_original) {
       if(element.meindesc == varDesc)
       {
         this.listado_articulos_aux = element;
       }
     }
    this.listado_articulos_aux.acum =  this.listado_articulos_aux.odetcantdespachada;
    for (const element of this.listado_articulos) {
      if(element.odetmeinid == this.listado_articulos_aux.odetmeinid)
      {
        var acumulado = Number(element.acum);
        var acumulado_aux = Number(this.listado_articulos_aux.acum)
        this.listado_articulos_aux.acum = acumulado + acumulado_aux;
        break;
      }
    }
    this.listado_auxiliar(this.listado_articulos_aux);
  }

  /**** funcion que asigna los valores del detalle seleccionado al formulario****/
  listado_auxiliar(varDetalle: DetalleOC)
  {
    this.loading = true;
    this.FormDatosProducto.controls.codigo.setValue(varDetalle.meincodigo.toString())
    this.FormDatosProducto.controls.descripcion.setValue(varDetalle.meindesc.toString())
    this.bloquear_aux = true;
    this.bloquear_item = false;
    this.loading = false;
  }

 /**** funcion quecalcula el valor de los articulos agregados ****/
  recalcular_valor()
  {
    this.valortotal = 0;
    for (const element of this.listado_articulos)
    {
      this.valortotal = this.valortotal + (Number(element.odetcantdespachada_aux) * Number(element.odetvalorcosto))
    }

    if(this.valortotal != this.FormGuiaOc.controls.montodcto.value)
    {
      this.valorvalido = false;
    }
    else
    {
      this.valorvalido = true;
    }

  }

  ConfirmaLimpiarTodo() {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.limpiar.todo'),
      text: this.TranslateUtil('key.mensaje.desea.limpiar.formulario.completo'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.limpiarPantalla();
      } else {
        this.loading = false;
        return;
      }
    })
  }

  ConfirmaEliminarTodo() {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.limpiar.grilla'),
      text: this.TranslateUtil('key.mensaje.seguro.desea.eliminar.todos.articulos'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.limpiarGrilla();
      } else {
        this.loading = false;
        return;
      }
    })
  }

  /**** funcion que valida que ambos montos coincidan ****/
  /****valida_monto()
  {
    this.montoingresado = Number(this.FormGuiaOc.controls['montodcto'].value)
    if(this.montoingresado !== this.valortotal)
    {

    }
  }****/

  /****************** MODALES **********************************************************************************************************/

  /****funcion que implementa el modal de detalle de orden****/
  setModalDetalleOc(numoc: number, descripcion: string, codigo: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.productos'),
        numoc: numoc,
        descripcion: descripcion,
        codigo: codigo
      }
    };
    return dtModal;
  }

  abrirModalDetalleOc(numoc: number, descripcion: string, codigo: string)
  {
    this._BSModalRef = this._BsModalService.show(DetalleOcModalComponent, this.setModalDetalleOc(numoc, descripcion, codigo));
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != undefined)
      {
        this.listado_articulos_aux = new(DetalleOC);
        this.listado_articulos_aux = response;

        this.listado_articulos_aux.acum =  this.listado_articulos_aux.odetcantdespachada;

        for (const element of this.listado_articulos) {
          if(element.odetmeinid == this.listado_articulos_aux.odetmeinid)
          {
            var acumulado = Number(element.acum);
            //var acumulado_aux = Number(this.listado_articulos_aux.acum)
            this.listado_articulos_aux.acum = acumulado;
            break;
          }
        }
        this.listado_auxiliar(this.listado_articulos_aux);
      }
    });
  }

  /****funcion que implementa el modal de búsuqeda de proveedores****/
  setModalProveedor() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.productos'),
        hdgcodigo: this.hdgcodigo
      }
    };
    return dtModal;
  }

  /**** funcion que abre el modal de busuqeda de proveedor*****/
  abrirModalBusuqedaProv()
  {
    this.limpiarPantalla();
    this._BSModalRef = this._BsModalService.show(BusquedaproveedorocmodalComponent, this.setModalProveedor());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if(response != undefined)
      {
        var ruttotal = String(response['numerorutprov']);
        ruttotal = ruttotal + '-' + response['dvrutprov'].toString();
        this.FormRecepOc.controls.rutprov.setValue(ruttotal.toString())
        this.FormRecepOc.controls.provid.setValue(response['proveedorid'].toString())
        this.cargarProveedor();
      }
    });
  }

  /**** funcion que parametriza el modal de búsqueda*****/
  setModalBusquedaOrdenCompra(){
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.orden.compra'), /**** Parametro para de la otra pantalla****/
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        provid:  this.provid,
        provdesc:  this.provdesc,
        pantalla: 'recepcion'
      }
    };
    return dtModal;
  }

  /**** funcion que abre el modal de busuqeda de oc por parametros*****/
  abrirModalBusquedaOc()
  {
    this.limpiarPantalla();
    this._BSModalRef = this._BsModalService.show(BuscarOcModalComponent, this.setModalBusquedaOrdenCompra());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
        if(response != undefined)
        {
          this.buscarOc(response.orconumdoc,1);
        }
    });
  }
  /*************************************************************************************************************************************/

  validaRut(){
    if (this.FormRecepOc.controls['rutprov'].value != undefined &&
      this.FormRecepOc.controls['rutprov'].value != null &&
      this.FormRecepOc.controls['rutprov'].value != " " &&
      this.FormRecepOc.controls['rutprov'].value != ""){
      const newRut = this.FormRecepOc.controls['rutprov'].value.replace(/\./g,'').replace(/\-/g, '').trim().toLowerCase();
        const lastDigit = newRut.substr(-1, 1);
        const rutDigit = newRut.substr(0, newRut.length-1);
        let format = '';
        for (let i = rutDigit.length; i > 0; i--) {
          const e = rutDigit.charAt(i-1);
          format = e.concat(format);
          if (i % 3 === 0){
            format = ''.concat(format);
          }
        }
        this.FormRecepOc.get('rutprov').setValue(format.concat('-').concat(lastDigit));
        if( !validateRUT(this.FormRecepOc.controls.rutprov.value)){
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.id.no.valido');
          this.alertSwalError.text = '';
          this.alertSwalError.show();
          return false;
        }
        else
        {
          return true;
        }
    }
  }

  validaBtnAgregar(){
    if(
    this.FormDatosProducto.controls['codigo'].value != undefined &&
    this.FormDatosProducto.controls['codigo'].value != null &&
    this.FormDatosProducto.controls['codigo'].value != " " &&
    this.FormDatosProducto.controls['codigo'].value != "" &&
    this.FormDatosProducto.controls['descripcion'].value != undefined &&
    this.FormDatosProducto.controls['descripcion'].value != null &&
    this.FormDatosProducto.controls['descripcion'].value != " " &&
    this.FormDatosProducto.controls['descripcion'].value != "" &&
    this.FormDatosProducto.controls['cantidad'].value != undefined &&
    this.FormDatosProducto.controls['cantidad'].value != null &&
    this.FormDatosProducto.controls['cantidad'].value != " " &&
    this.FormDatosProducto.controls['cantidad'].value != "" &&
    this.FormDatosProducto.controls['lote'].value != undefined &&
    this.FormDatosProducto.controls['lote'].value != null &&
    this.FormDatosProducto.controls['lote'].value != " " &&
    this.FormDatosProducto.controls['lote'].value != "" )
    {
      this.bloquear_btn_agregar = false;
    }
    else
    {
      this.bloquear_btn_agregar = true;
    }

    if(
      (this.FormDatosProducto.controls['codigo'].value == undefined ||
      this.FormDatosProducto.controls['codigo'].value == null ||
      this.FormDatosProducto.controls['codigo'].value == " " ||
      this.FormDatosProducto.controls['codigo'].value == "") &&
      (this.FormDatosProducto.controls['descripcion'].value == undefined ||
      this.FormDatosProducto.controls['descripcion'].value == null ||
      this.FormDatosProducto.controls['descripcion'].value == " " ||
      this.FormDatosProducto.controls['descripcion'].value == "") &&
      (this.FormDatosProducto.controls['cantidad'].value == undefined ||
      this.FormDatosProducto.controls['cantidad'].value == null ||
      this.FormDatosProducto.controls['cantidad'].value == " " ||
      this.FormDatosProducto.controls['cantidad'].value == "") &&
      (this.FormDatosProducto.controls['lote'].value == undefined ||
      this.FormDatosProducto.controls['lote'].value == null ||
      this.FormDatosProducto.controls['lote'].value == " " ||
      this.FormDatosProducto.controls['lote'].value == "") &&
      (this.FormDatosProducto.controls['fechavenc'].value == undefined ||
      this.FormDatosProducto.controls['fechavenc'].value == null ||
      this.FormDatosProducto.controls['fechavenc'].value == " " ||
      this.FormDatosProducto.controls['fechavenc'].value == "" ))
      {
        this.bloquear_btn_agregar_aux = true;
      }
      else
      {
        this.bloquear_btn_agregar_aux = false;
      }



  }

  /****funcion que carga proveedor cuando se le busca por rut****/
  async cargarProveedor(){
    if(this.cargada == true)
    {
      return;
    }
    try {
      this.loading = true;
      if(!this.validaRut())
      {
        this.loading = false;
        return;
      }
      else
      {
        var splitted = this.FormRecepOc.controls['rutprov'].value.split("-", 2);
        this.rutproveedor = Number(splitted[0]);
        this.proveedor = await this._proveedor.buscaProveedorporrut(
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.rutproveedor,
          this.usuario,
          this.servidor
        ).toPromise();
        if(this.proveedor[0]['numerorutprov'] != 0)
        {
          var provid_aux = Number(this.proveedor[0]['proveedorid'])
          this.FormRecepOc.controls.provid.setValue(this.proveedor[0]['proveedorid'].toString())
          this.FormRecepOc.controls.descprov.setValue(this.proveedor[0]['descripcionprov'].toString())
          this.provid = provid_aux
          this.provdesc = this.proveedor[0]['descripcionprov'].toString();
          this.abrirModalBusquedaOc();
        }
        else
        {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.proveedor.no.encontrado');
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.proveedor.no.encontrado');
          this.alertSwalError.show();
        }
        this.loading = false;
      }
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }

  async cargarCombos(){
    try {
      this.loading = true;
      this.listatipodocumento = await this._ordencompra.listaTipoDocumento(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,'reg'
      ).toPromise();
      this.selected = Number(this.listatipodocumento[0]['codtipodocumento'])
      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }

  }

  /**** funcion que genera una recepccion de  OC y su detalle ****/
  generarRecepcion() {
    this.loading = true;
    this.guia = new GuiaOc();
    for (const element of this.listado_articulos) {
      if(element.odetcantdespachada_aux >= 1)
      {
        console.log(element)
        var recepcion = new DetalleMovimientoOc();


        var dateString = typeof element.fechavenc === 'string'
          ? element.fechavenc
          : this.datePipe.transform(element.fechavenc, 'dd-MM-yyyy');


        // var dateParts = dateString.split("-");
        // var dateObject = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
        recepcion.odmofechavencimiento = dateString//this.datePipe.transform(dateString, 'dd-MM-yyyy');

        recepcion.odmoid     =       this.odmoId   ;
        recepcion.odmofecha   =      ""    ;
        recepcion.odmomonto    =  element.odetcantdespachada_aux * element.odetvalorcosto ;
        recepcion.odmoresponsable =   this.usuario  ;      ;
        recepcion.odmoguiaid       =  0  ;
        recepcion.odmoorcoid      = element.orcoid;
        recepcion.odmoodetid       = element.odetid;
        recepcion.odmocantidad     = element.odetcantdespachada_aux   ;
        recepcion.odmocantdevuelta  = element.odetcantdevuelta;
        recepcion.cmecodigo = this.cmecodigo;
        recepcion.hdgcodigo = this.hdgcodigo;
        recepcion.esacodigo = this.esacodigo;
        recepcion.lote = element.lote;
        recepcion.meinid = element.odetmeinid
        //recepcion.meinid = element.
        this.listado_recepcion.push(recepcion);
      }
    }
    this.guia.id = 0;
    this.guia.numerodoc = Number(this.FormGuiaOc.controls.numdoc.value);
    this.guia.provid = Number(this.FormRecepOc.controls.provid.value);
    this.guia.fechaemision = this.datePipe.transform( this.FormGuiaOc.controls.fechadocto.value.toString(), 'dd-MM-yyyy');
    this.guia.fechaactualizacion = "";
    this.guia.fecharecepcion = this.datePipe.transform( this.FormGuiaOc.controls.fecharecep.value.toString(), 'dd-MM-yyyy');
    this.guia.cantidaditems = this.itemsrecep;
    this.guia.cantidadunidades = this.totalitems;
    this.guia.tipo =  this.FormGuiaOc.value.tipodoc;
    this.guia.monto = this.FormGuiaOc.value.montodcto;
    this.guia.servidor = this.servidor;
    this.guia.detallemov = this.listado_recepcion;
    this.guia.bodcodigo = this.bodcodigo;
    this._ordencompra.crearRecepcion(this.guia,this.servidor).subscribe(
      response => {
        this.alertSwal.title = this.TranslateUtil('key.mensaje.oc.recepcionada');
        this.alertSwal.show();
        let oc = Number(this.FormRecepOc.controls.numorden.value)
        this.limpiarPantalla();
        this.buscarOc(oc,0);
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.recepcion');
        this.alertSwalError.text = '';
        this.alertSwalError.show();
      }
    );

  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
