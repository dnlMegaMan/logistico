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
import { Articulos } from '../../models/entity/mantencionarticulos';
import { BusquedaproductosService } from '../../servicios/busquedaproductos.service';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { CreasolicitudesService } from '../../servicios/creasolicitudes.service';
import { UltimaOc } from '../../models/entity/UltimaOc';
import { OrdenCompra } from '../../models/entity/ordencompra';
import { Console, timeStamp } from 'console';
import { BuscarOcModalComponent } from '../buscar-oc-modal/buscar-oc-modal.component';
import { BusquedaproductosocmodalComponent } from '../busquedaproductos-oc-modal/busquedaproductosocmodal.component';
import { ArticulosOcModalComponent } from '../articulos-oc-modal/articulos-oc-modal.component';
import { BodegasTodas } from '../../models/entity/BodegasTodas';
import { BusquedaproveedorocmodalComponent } from '../busquedaproveedor-oc-modal/busquedaproveedorocmodal.component';
import { ProveedoresService } from '../../servicios/proveedores.service';
import { Proveedores } from '../../models/entity/Proveedores';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-ingreso-oc',
  templateUrl: './ingreso-oc.component.html',
  styleUrls: ['./ingreso-oc.component.css'],
  providers: [InformesService,OrdenCompraService,ProveedoresService,BusquedaproductosService ]

})

export class IngresoOCComponent implements OnInit {

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;/****Componente para visualizar alertas****/
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;
  @ViewChild('tabset', { static: false }) tabset: TabsetComponent;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormCrearOc: FormGroup;
  public FormDatosProducto      : FormGroup;
  public codprod                = null;

  /**** variables booleanas que se accionan con el negocio*****/
  public bloquear_numoc: boolean = false;
  public bloquear_crearoc: boolean = false;
  public bloquear_rutprov: boolean = true;
  public bloquear_btn_agregar : boolean = true;
  public bloquear_btn_limpiar : boolean = false;
  public bloquear_eleminargrilla : boolean = true;
  public bloquear_btn_limpiar_grilla: boolean = true;
  public bloquear_cantidad : boolean = false;
  public bloquear_btneleminargrilla : boolean = false;
  public ch_anulada : boolean = false;

  /**** variables que controlan botones ****/
  public bloquear_anulada : boolean = true;
  public bloquear_limpiartodo : boolean = true;
  public bloquear_emitir : boolean = true;
  public bloquear_btn_crear : boolean = true;
  public modificacion_cabecera: number = 0;
  public modificacion_detalle : number = 0;




  private _BSModalRef: BsModalRef;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public servicios: Servicio[];
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario : string;
  public mediopago_aux = MedioPago;
  public listamediopago : MedioPago[] = [];
  public ultimaOc      :UltimaOc[] = [];
  public ordencompra   :OrdenCompra;
  public proveedor : Proveedores[] = [];
  public proveedor_aux : Proveedores = new (Proveedores);

  public rutproveedor : number;
  public formapago : number;
  public selectedmediopago : number;
  public selectedbodega : number;
  public estadoval : number = 0;
  public estadodesc: string = "";
  public arregloDetalleProductoordencompra: Array<DetalleOC> = [];
  public productoselec          : Articulos;
  public listado_articulos      : Array<DetalleOC> = [];
  public listado_articulos_ori  : Array<DetalleOC> = [];
  public descprod               = null;
  public codoc                  : number  = 0;
  public lista_eliminados       : Array<number> = [];
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public provid : number;
  public provid_ori : number = 0;
  public medio_pago_ori : number;
  public orcoid : number;

  onClose: any;
  bsModalRef: any;

  public loading = false;
  public isOc : boolean = true;
  public creacion : boolean = false;
  public modificacion : boolean = false;
  public revertir : boolean = false;
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
    public ordencompraService        : OrdenCompraService,
    public _creaService             : CreasolicitudesService,
    public _BodegasService          : BodegasService,
    public translate: TranslateService
  ) {
    this.FormCrearOc = this.formBuilder.group({
      numorden: [{ value: null, disabled: false }, Validators.required],
      rutprov: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(9)]],
      descprov: [{ value: null, disabled: true }, Validators.required],
      dirprov: [{ value: null, disabled: true }, Validators.required],
      contactoprov: [{ value: null, disabled: true }, Validators.required],
      montominfact: [{ value: null, disabled: true }, Validators.required],
      itemscant: [{ value: null, disabled: false }, Validators.required],
      dctoasoc: [{ value: null, disabled: true }, Validators.required],
      anuladafecha: [{ value: null, disabled: false }, Validators.required],
      anuladaresponsable: [{ value: null, disabled: false }, Validators.required],
      mediopago: [{ value: null, disabled: false }, Validators.required],
      anulada: [{ value: null, disabled: false }, Validators.required],
      esticod   : [{ value: 10, disabled: true }, Validators.required],
      provid   : [{ value: null, disabled: true }, Validators.required],
      bodcodigo : [{ value: null, disabled: false }, Validators.required],
      rutprovori : [{ value: null, disabled: true }, Validators.required],
      estadodesc : [{ value: null, disabled: true }, Validators.required],
    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.FormDatosProducto = new FormGroup({
      codigo: new FormControl(),
      descripcion: new FormControl(),
      cantidad: new FormControl()
    });
    this.BuscaBodegaSolicitante();
    this.FormCrearOc.controls.mediopago.disable()
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

  limpiarGrilla(){
    this.listado_articulos = [];
    this.lista_eliminados = [];
    this.bloquear_rutprov = false;
  }

 /**** funcion que carga combos en base al proveedor seleccionado****/
  async cargarCombos(condicion: number, selected: number){
    try {
      console.log(selected)
      this.medio_pago_ori = selected;
      this.loading = true;
      this.listamediopago = await this._ordencompra.listaMedioPago(
        condicion,
        this.servidor,
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.usuario
      ).toPromise();
      this.loading = false;
      if(selected == 0)
      {
        this.FormCrearOc.patchValue({mediopago: condicion })
      }
      else
      {
        this.FormCrearOc.patchValue({mediopago: selected })
      }
      //this.selectedmediopago = Number(3)
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }


  /**** funcion que limpia la pantalla *****/
  limpiarPantalla()
  {
    this.provid = 0;
    this.provid_ori = 0;
    this.medio_pago_ori = 0;
    this.FormCrearOc.controls.mediopago.enable()
    this.FormCrearOc.reset();
    this.bloquear_numoc = false;
    this.bloquear_rutprov = true;
    this.bloquear_btn_agregar = true;
    this.bloquear_limpiartodo = true;
    this.bloquear_crearoc = false;
    this.bloquear_eleminargrilla = true;
    this.bloquear_btneleminargrilla = false;
    this.listado_articulos = [];
    this.listado_articulos_ori = [];
    this.listamediopago = [];
    this.lista_eliminados = [];
    this.bloquear_emitir = true;
    this.BuscaBodegaSolicitante();
    this.FormCrearOc.controls.bodcodigo.enable();
    this.estadoval = 0;
    this.creacion = false;
    this.modificacion = false;
    this.revertir = false;
    this.bloquear_btn_limpiar_grilla = false;
  }

  /****funcion que interactua con os elementos de la pantalla al crear una OC****/
  async crearOc()
  {
    var numoc = 0;
    this.ultimaOc = await this._ordencompra.BuscarUltimaOc(this.servidor).toPromise();
    numoc = numoc + Number(this.ultimaOc[0]['orcoid']);
    this.FormCrearOc.controls.numorden.setValue(numoc.toString());
    this.limpiarPantalla();
    this.bloquear_numoc = true;
    this.bloquear_rutprov = false;
    this.bloquear_limpiartodo = false;
    this.bloquear_crearoc = true;
    this.bloquear_eleminargrilla = false;
    this.bloquear_btneleminargrilla = false;
    this.lista_eliminados = [];
    this.bloquear_anulada = true;
    this.bloquear_emitir = true;
    this.creacion = true;
    this.modificacion = false;
    this.bloquear_cantidad = false;
    this.bloquear_btn_limpiar_grilla = false;
  }

  /****funcion que busca orden de compra por id****/
  async buscarOc(codigo: number)
  {
    this.codoc = Number(codigo);
    if(this.codoc == 0){
      this.focusField.nativeElement.focus();
      return;
    }
    const mediopago_nuevo = new (MedioPago);
    const bodega_nuevo = new (BodegasTodas);
    const response = await this._ordencompra.BuscarOc(this.hdgcodigo  , this.cmecodigo, this.esacodigo,
      this.codoc,
      this.servidor,
      this.usuario).toPromise();
    if(response.length == 0){
      return;
    } else {
      if(response[0]['orcoid'] == 0)
      {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.orden.compra.no.encontrada');
        this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.orden.compra.ingresada');
        this.alertSwalAlert.show();
        return;
      }
      this.FormCrearOc.controls.rutprov.setValue(response[0]['proveedorrut'].toString())
      this.FormCrearOc.controls.descprov.setValue(response[0]['descripcionprov'].toString())
      this.FormCrearOc.controls.dirprov.setValue(response[0]['direccionprov'].toString())
      this.FormCrearOc.controls.contactoprov.setValue(response[0]['contactoprov'].toString())
      this.FormCrearOc.controls.montominfact.setValue(response[0]['montominfac'].toString())
      this.FormCrearOc.controls.dctoasoc.setValue(response[0]['listadocumentos'].toString())
      this.FormCrearOc.controls.provid.setValue(response[0]['provid'].toString())
      this.provid = Number(response[0]['provid'])
      this.provid_ori = Number(response[0]['provid'])
      this.orcoid = Number(response[0]['orcoid'])
      const x = await this.cargarProveedor(Number(response[0]['tipopagoval']));
      this.revertir = false;
      this.bloquear_btn_limpiar_grilla = true;
      switch(response[0]['estado']) {
        case 1: {
          this.estadodesc = "INGRESADA";
          this.ch_anulada = false;
          this.bloquear_anulada = false;
          this.bloquear_eleminargrilla = false;
          this.bloquear_cantidad = false;
          this.bloquear_btneleminargrilla = false;
          this.bloquear_emitir = false;
          this.bloquear_btn_crear = false;
          this.bloquear_btn_agregar = false;
          this.creacion = false;
          this.modificacion = true;
          this.FormCrearOc.controls.mediopago.enable()
          this.modificacion_cabecera = 0;
          this.modificacion_detalle = 0;
          break;
        }
        case 2: {
          this.estadodesc = "EMITIDA";
          this.bloquear_pantalla()
          this.creacion = false;
          this.modificacion = false;
          this.revertir = true;
          this.FormCrearOc.controls.mediopago.disable()
          break;
        }
        case 3: {
          this.estadodesc = "RECEPCIONADA PARCIALMENTE";
          this.bloquear_pantalla()
          this.FormCrearOc.controls.mediopago.disable()
          this.creacion = false;
          this.modificacion = false;
          break;
        }
        case 4: {
          this.estadodesc = "RECEPCIÓN COMPLETA";
          this.creacion = false;
          this.modificacion = false;
          this.bloquear_pantalla()
          break;
        }
        case 5: {
          this.estadodesc = "ANULADA";
          this.creacion = false;
          this.modificacion = false;
          this.bloquear_pantalla()
          this.ch_anulada = true;
          this.bloquear_anulada = true;
          this.bloquear_eleminargrilla = true;
          this.bloquear_eleminargrilla = true;
          this.bloquear_btneleminargrilla = true;
          this.bloquear_emitir = true;
          this.bloquear_btn_crear = true;
          this.FormCrearOc.controls.anuladafecha.setValue(response[0]['fechaanulacion'].toString())
          this.FormCrearOc.controls.anuladaresponsable.setValue(response[0]['useranulacion'].toString())
          break;
        }
        case 6: {
          this.estadodesc = "CERRADA MANUALMENTE";
          this.creacion = false;
          this.modificacion = false;
          this.bloquear_pantalla()
          break;
        }
        case 7: {
          this.estadodesc = "AUTORIZADA";
          this.creacion = false;
          this.modificacion = false;
          break;
        }
        default: {
          this.estadodesc = "";
           break;
        }
      }

      this.bodegasSolicitantes = [];
      bodega_nuevo.bodcodigo = 0;
      bodega_nuevo.boddescripcion =  response[0]['bodeganombre'];
      this.selectedbodega = 0;
      this.bodegasSolicitantes.push(bodega_nuevo);
      this.estadoval = Number(response[0]['estado']);
      this.FormCrearOc.controls.numorden.setValue(this.codoc.toString())
      this.buscarOcDet(this.codoc);
      this.bloquear_crearoc = true;
      this.bloquear_limpiartodo = false;
      this.bloquear_numoc = true;
      console.log(this.listado_articulos)
      this.FormCrearOc.controls.itemscant.setValue(this.listado_articulos.length.toString())
      //this.FormCrearOc.get('mediopago').setValue(Number(response[0]['tipopagoval']) || 0);

    }
    this.loading = false;
  }

  /**** FUNCION QUE BLOQUEA TODO****/
  bloquear_pantalla(){
    this.bloquear_anulada = true;
    this.bloquear_eleminargrilla = true;
    this.bloquear_eleminargrilla = true;
    this.bloquear_btneleminargrilla = true;
    this.bloquear_btn_crear = true;
    this.bloquear_cantidad = true;
    this.bloquear_emitir = true;
    this.bloquear_btn_crear = true;
    this.bloquear_btn_agregar = true;
    this.bloquear_btn_limpiar = true;
    this.FormCrearOc.controls.mediopago.disable()
  }

  compararListas()
  {
    if(this.listado_articulos.length == this.listado_articulos_ori.length)
    {
      let contador = 0;
      for (const element of this.listado_articulos) {
        for (const elements of this.listado_articulos_ori) {
          if(element.odetmeinid == elements.odetmeinid)
          {
            if((Number(element.odetcantreal) != Number(elements.odetcantreal))||(Number(element.odetvalorcosto) != Number(elements.odetvalorcosto)))
            {
              this.modificacion_detalle   = 1;
            }
            else
            {
              contador = contador + 1;
            }
          }
        }
      }
      if(contador == this.listado_articulos.length)
      {
        this.modificacion_detalle   = 0;
      }
    }
    else
    {
      this.modificacion_detalle  = 1;
    }

    if((this.provid != this.provid_ori) || (Number(this.FormCrearOc.value.mediopago) != this.medio_pago_ori))
    {
      this.modificacion_cabecera = 1;
    }
    else
    {
      this.modificacion_cabecera = 0;
    }
    console.log(this.modificacion_cabecera)
    console.log(this.modificacion_detalle)
    console.log(this.bloquear_btn_crear)
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
      this.servidor, null, null).subscribe(
      response => {
        if(response.length == 0){
            return;
        } else {
          this.listado_articulos = response.filter((registro) => registro.odetestado == 1);
          for (const element of this.listado_articulos) {
            element.valorcosto = element.odetvalorcosto;
            let objeto = new DetalleOC;
            objeto.odetcantreal = element.odetcantreal;
            objeto.odetmeinid = element.odetmeinid;
            objeto.odetvalorcosto = element.odetvalorcosto
            objeto.valorcosto = element.odetvalorcosto
            this.listado_articulos_ori.push(objeto)
          }
          this.FormCrearOc.controls.itemscant.setValue(this.listado_articulos.length.toString())
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      });
  }

  /****funcion que busca un producto en base a los parametros del filtro****/
  BuscaProducto()
  {
    this.descprod = this.FormDatosProducto.controls.descripcion.value;
    this.codprod = this.FormDatosProducto.controls.codigo.value;
    if(this.codprod === null && this.descprod === null ){
      return;
    }else{
      if(this.codprod !== null) {
        this.getProducto(this.codprod);
      }else{
        if (this.descprod !== null ) {
          this.getProductoDescrip();
        }else{
          if(this.codprod != null && this.descprod != null ){
            this.addArticuloGrilla();
          }
        }
      }
    }
  }

  /****funcion que carga proveedor cuando se le busca por rut****/
  async cargarProveedor(selected: number){
    try {
      this.loading = true;
      if(!this.validaRut())
      {
        this.loading = false;
        return;
      }
      else
      {
        var splitted = this.FormCrearOc.controls['rutprov'].value.split("-", 2);
        this.rutproveedor = Number(splitted[0]);
        const response = await this._proveedor.buscaProveedorporrut(
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.rutproveedor,
          this.usuario,
          this.servidor
        ).toPromise();
        this.proveedor = response;
        this.proveedor_aux = this.proveedor[0];
        if(this.proveedor[0]['numerorutprov'] != 0)
        {
          this.FormCrearOc.controls.rutprovori.setValue(`${this.proveedor[0].numerorutprov}-${this.proveedor[0].dvrutprov}`)
          this.FormCrearOc.controls.rutprov.setValue(`${this.proveedor[0].numerorutprov}-${this.proveedor[0].dvrutprov}`)
          this.FormCrearOc.controls.descprov.setValue(this.proveedor[0]['descripcionprov'].toString())
          this.FormCrearOc.controls.dirprov.setValue(this.proveedor[0]['direccionprov'].toString())
          this.FormCrearOc.controls.contactoprov.setValue(this.proveedor[0]['contactoprov'].toString())
          this.FormCrearOc.controls.montominfact.setValue(this.proveedor[0]['montominfac'].toString())
          this.formapago = Number(this.proveedor[0]['formapago'].toString())
          this.FormCrearOc.controls.provid.setValue(this.proveedor[0]['proveedorid'].toString())
          this.provid = Number(this.proveedor[0]['proveedorid'])
          this.bloquear_btn_agregar = false;
          this.cargarCombos(this.formapago,selected)
          //sergio
          if(this.provid_ori != 0)
          {
            this.compararListas()
          }
        }
        else
        {
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.proveedor.no.encontrado');
          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.proveedor.no.encontrado');
          this.alertSwalAlert.show();
        }
        this.loading = false;
      }
    } catch (err) {
      console.log(err)
      alert(err.message);
      this.loading = false;
    }
  }

  /****funcion que valida rut****/
  validaRut(){
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    if (this.FormCrearOc.controls['rutprov'].value != undefined &&
      this.FormCrearOc.controls['rutprov'].value != null &&
      this.FormCrearOc.controls['rutprov'].value != " " &&
      this.FormCrearOc.controls['rutprov'].value != ""){
      const newRut = this.FormCrearOc.controls['rutprov'].value.replace(/\./g,'').replace(/\-/g, '').trim().toLowerCase();
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
        this.FormCrearOc.get('rutprov').setValue(format.concat('-').concat(lastDigit));
        if( !validateRUT(this.FormCrearOc.controls.rutprov.value)){
          if(this.FormCrearOc.controls['rutprovori'].value != null)
          {
            this.FormCrearOc.controls.rutprov.setValue(this.FormCrearOc.controls['rutprovori'].value.toString())
          }
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.id.no.valido');
          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.id.proveedor.validar');
          this.alertSwalAlert.show();
          return false;
        }
        else
        {
          return true;
        }
    }
  }

  /****funcion que valida que un articulo no se repita****/
  validaItem(meinid: number):boolean{
    this.alertSwalAlert.title = "";
    this.alertSwalAlert.text = "";
    for (const element of this.listado_articulos) {
      if(element.odetmeinid == meinid)
      {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
        this.alertSwalAlert.text = '';
        this.alertSwalAlert.show();
        return false;
      }
    }
    return true;
  }

  /**************************************** SETEO DE MODALES  *********************************************************************/

  /****funcion que implementa el modal de búsuqeda de articulos****/
  setModalBusquedaProductos() {
    this.codprod = this.FormDatosProducto.controls.codigo.value;
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.productos'), /**** Parametro para de la otra pantalla****/
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'crear',
        proveedor: this.provid,
        id_Bodega: Number(this.FormCrearOc.value.bodcodigo),
        codprod: this.codprod,
        descprod: this.descprod
      }
    };
    return dtModal;
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
        cmecodigo: this.cmecodigo
      }
    };
    return dtModal;

  }

  /****funcion que implementa el modal de búsuqeda de articulos****/
  setModalPrecioProductos(mein : DetalleOC) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.agregar.articulo'),
        mein: mein
      }
    };
    return dtModal;
  }

   /****funcion que implementa el modal de búsuqeda de proveedores****/
   setModalProveedor() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.proveedor'),
        hdgcodigo: this.hdgcodigo
      }
    };
    return dtModal;
  }

  /***********************************************************************************************************************************************/

  /**** funcion que abre el modal de busuqeda de oc por parametros*****/
  abrirModalBusuqedaOc()
  {
    this._BSModalRef = this._BsModalService.show(BuscarOcModalComponent, this.setModalBusquedaOrdenCompra());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if(response != undefined){
        this.limpiarPantalla();
        this.buscarOc(response.orconumdoc);
      }

    });
  }

  /**** funcion que abre el modal de busuqeda de proveedor*****/
  abrirModalBusuqedaProv()
  {
    this._BSModalRef = this._BsModalService.show(BusquedaproveedorocmodalComponent, this.setModalProveedor());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != undefined) {
        if(Number(this.FormCrearOc.controls.numorden.value) == 0)
        {
          this.limpiarPantalla();
          this.crearOc();
        }
        var ruttotal = String(response['numerorutprov']);
        ruttotal = ruttotal + '-' + response['dvrutprov'].toString();
        this.FormCrearOc.controls.rutprov.setValue(ruttotal.toString())
        this.cargarProveedor(0);
      }
    });
  }

  /**** funcion que abre el modal de articulos y proveedor*****/
  abrirModalArticulosProv(mein: DetalleOC)
  {
    this._BSModalRef = this._BsModalService.show(ArticulosOcModalComponent, this.setModalPrecioProductos(mein));
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if(response != undefined){
        if(Number(response.odetcantreal) > 0 &&  Number(response.odetvalorcosto) > 0)
        {
          this.listado_articulos.push(response);
          this.compararListas()
        }
      }
    });
  }

  /****funcion que agrega un articulo a la grilla****/
  addArticuloGrilla() {
    const Swal = require('sweetalert2');
    const producto_nuevo = new (DetalleOC);
    this._BSModalRef = this._BsModalService.show(BusquedaproductosocmodalComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != undefined) {
        this.loading = true;
        const tipodeproducto = 'MIM';
        const controlado = '';
        const controlminimo = '';
        const idBodega = 0;
        const consignacion = '';
         this._BusquedaproductosService.BuscarArticulosFiltrosOc(this.hdgcodigo, this.esacodigo,
         this.cmecodigo, response.codigo, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
         , this.usuario, null, this.servidor, null, this.provid, 0, 0).subscribe(
         responseFiltro => {
           if(responseFiltro.length == 0){
             producto_nuevo.odetid = 0;
             producto_nuevo.orcoid = 0;
             producto_nuevo.odetmeinid = response.mein;
             producto_nuevo.odetestado = 1;
             producto_nuevo.odetcantreal = 0;
             producto_nuevo.odetcantdespachada =0;
             producto_nuevo.odetcantdevuelta = 0;
             producto_nuevo.odetfechaanula = null;
             producto_nuevo.meincodigo = response.codigo;
             producto_nuevo.meindesc = response.descripcion;
             producto_nuevo.valorcosto = response.valorcosto;
             producto_nuevo.meintipo = response.desctiporegistro;
             this.FormDatosProducto.reset();
             this.getProducto(producto_nuevo.meincodigo );
           } else {
             if(this.validaItem(response.mein)){
               producto_nuevo.odetid = 0;
               producto_nuevo.orcoid = 0;
               producto_nuevo.odetmeinid = response.mein;
               producto_nuevo.odetestado = 1;
               producto_nuevo.odetcantreal = 0;
               producto_nuevo.odetcantdespachada =0;
               producto_nuevo.odetcantdevuelta = 0;
               producto_nuevo.odetfechaanula = null;
               producto_nuevo.meincodigo = response.codigo;
               producto_nuevo.meindesc = response.descripcion;
               producto_nuevo.valorcosto = 0;
               producto_nuevo.acum = 0;
               producto_nuevo.meintipo = response.desctiporegistro;
               this.FormDatosProducto.reset();
               this.abrirModalArticulosProv(producto_nuevo);
               this.FormCrearOc.controls.itemscant.setValue(this.listado_articulos.length.toString())
               if (this.FormCrearOc.controls['descprov'].value != undefined &&
               this.FormCrearOc.controls['descprov'].value != null )
               {
                 this.bloquear_btn_crear = false;
               }
               else
               {
                 this.bloquear_btn_crear = true;
               }
               this.FormCrearOc.controls.itemscant.setValue(this.listado_articulos.length.toString())
             }
           }
           this.loading = false;
         }, error => {
           this.loading = false;
         });
      }
    });
  }

  cambioCheck(event,id: number)
  {
    if (event.target.checked ) {
      this.lista_eliminados.push(id);
    }
    else
    {
      // this.lista_eliminados.filter(x => x !== id)
      for (var i = this.lista_eliminados.length -1; i >= 0; i--)
      {
        if(this.lista_eliminados[i] == id)
        {
          this.lista_eliminados.splice(i,1)
        }
      }
    }
    console.log(this.lista_eliminados)
  }

  /**** Funcion que elimina items seleccionados de la grilla ****/
  eliminaritemsgrilla()
  {
    for (var i = this.lista_eliminados.length -1; i >= 0; i--)
    {
      this.listado_articulos.splice(this.lista_eliminados[i],1);
    }
    this.lista_eliminados = [];
    this.compararListas()
  }

  async ingresarItem(codigo: string, proveedor: number)
  {
    const variable = await this._ordencompra.AsociarMeinProv(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, codigo,proveedor,this.servidor).toPromise();
    this.BuscaProducto();
  }

  ConfirmaAgregarItem(nombre: string, proveedor: number, codigo: string) {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.item.no.asociado.proveedor'),
      text:   nombre + " no se encuentra asociado al proveedor, desea asociarlo?",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ingresarItem(codigo, proveedor);
      } else {
        this.loading = false;
        return;
      }
    })
  }

  /****funcion que devuelve un producto en la busuqeda****/
  async getProducto(producto:any) {
    const Swal = require('sweetalert2');
    var noexisteprod : boolean = false;
    var codProdAux = producto.toString();
    this.codprod = this.FormDatosProducto.controls.codigo.value;
    if (this.codprod === null || this.codprod === '') {
      return;
    } else {
      this.loading = true;
      const tipodeproducto = 'MIM';
      const controlado = '';
      const controlminimo = '';
      const idBodega = 0;
      const consignacion = '';
       this._BusquedaproductosService.BuscarArticulosFiltrosOc(this.hdgcodigo, this.esacodigo,
         this.cmecodigo, this.codprod, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
         , this.usuario, null, this.servidor, null, this.provid, 0, 0).subscribe(
       response => {
         if (response != null) {
           if (!response.length) {
             this.loading = false;
             this.addArticuloGrilla();
           } else {
             if(response.length > 1){
               if(noexisteprod === false){
                 this.addArticuloGrilla();
               }
             }else{
               if(response.length == 1){
                  const producto_nuevo = new (DetalleOC);
                  var response_aux = new (Articulos);
                  response_aux = response[0];
                  //comienza comprobacion del item
                  this._BusquedaproductosService.BuscarArticulosPorCodigoProv(this.hdgcodigo, this.esacodigo,
                  this.cmecodigo, response_aux.codigo, this.servidor, this.provid).subscribe(
                    response => {
                      if (response.length != 1)
                      {
                        this.ConfirmaAgregarItem(response[0]['descripcion'],this.provid, response_aux.codigo);
                      }
                    },
                    error => {
                      this.loading = false;
                      this.alertSwalError.title = this.TranslateUtil('key.title.error')+": ";
                      this.alertSwalError.text = error.message;
                      this.alertSwalError.show();
                    }
                  );
                 if(this.validaItem(Number(response_aux.mein)))
                 {
                   producto_nuevo.odetid = 0;
                   producto_nuevo.orcoid = 0;
                   producto_nuevo.odetmeinid = response_aux.mein;
                   producto_nuevo.odetestado = 1;
                   producto_nuevo.odetcantreal = 0;
                   producto_nuevo.odetcantdespachada =0;
                   producto_nuevo.odetcantdevuelta = 0;
                   producto_nuevo.odetfechaanula = null;
                   producto_nuevo.meincodigo = response_aux.codigo;
                   producto_nuevo.meindesc = response_aux.descripcion;
                   producto_nuevo.valorcosto = 0;
                   producto_nuevo.meintipo = response_aux.desctiporegistro;
                   producto_nuevo.acum = 0;
                   this.loading = false;
                   this.FormDatosProducto.reset();
                   this.abrirModalArticulosProv(producto_nuevo);
                   if (this.FormCrearOc.controls['descprov'].value != undefined &&
                   this.FormCrearOc.controls['descprov'].value != null )
                   {
                     this.bloquear_btn_crear = false;
                   }
                   else
                   {
                     this.bloquear_btn_crear = true;
                   }
                   this.FormCrearOc.controls.itemscant.setValue(this.listado_articulos.length.toString())
                   this.focusField.nativeElement.focus();
                 }
               }
             }
           }
         }
           this.loading = false;
       }, error => {
         this.loading = false;
       }
         );
      this.loading = false;
    }

  }

  /****funcion que recupera informacion de un producto en base a la descripcion****/
  getProductoDescrip() {
    this.descprod = this.FormDatosProducto.controls.descripcion.value;
    if (this.descprod === null || this.descprod === '') {
      return;
    } else {
      this.addArticuloGrilla();
    }
  }

  /**** funcion que cambia la cantidad a despachar de un articulo ****/
  cambio_cantidad(id: number, property: string, registro: DetalleOC,cantidad : number){
    if(cantidad >= 1)
    {
      this.listado_articulos[id][property] = Number(cantidad);
    }
    else
    {
      this.listado_articulos[id][property] = 1;
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.valor.ingresado.no.puede.ser.cero');
      this.alertSwalError.show();
    }
    this.compararListas()
  }

/*---------------------------------------------------------------------------------------------------*/
  ConfirmaGenerarSolicitud() {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.generar.orden.compra'),
      text: this.TranslateUtil('key.mensaje.confirmar.creacion.orden.compra'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.generarSolicitud();
      } else {
        this.loading = false;
        return;
      }
    })
  }

  ConfirmaLimpiarTodo() {
    this.compararListas();
    if(this.modificacion_cabecera == 1 || this.modificacion_detalle == 1)
    {
      this.loading = true;
      const Swal = require('sweetalert2');
      Swal.fire({
        title: this.TranslateUtil('key.mensaje.pregunta.limpiar.todo'),
        text: this.TranslateUtil('key.mensaje.pregunta.seguro.desea.limpiar.campos'),
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
    else
    {
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

  ConfirmaEliminarTodo() {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿ '+this.TranslateUtil('key.button.limpiar.grilla')+' ?',
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

  ConfirmaEmitirSolicitud() {
    this.compararListas();
    if(this.modificacion_cabecera == 1 || this.modificacion_detalle == 1)
    {
      this.loading = true;
      const Swal = require('sweetalert2');
      Swal.fire({
        title: this.TranslateUtil('key.mensaje.pregunta.emitir.oc'),
        text: this.TranslateUtil('key.mensaje.cambios.sin.guardar.seguro.desea.emitir.oc'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
      }).then((result) => {
        if (result.value) {
          this.generarEmisionOc();
        } else {
          this.loading = false;
          return;
        }
      })
    }
    else
    {
      this.loading = true;
      const Swal = require('sweetalert2');
      Swal.fire({
        title: this.TranslateUtil('key.mensaje.pregunta.emitir.oc'),
        text: this.TranslateUtil('key.mensaje.confirmar.emision.oc'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
      }).then((result) => {
        if (result.value) {
          this.generarEmisionOc();
        } else {
          this.loading = false;
          return;
        }
      })
    }

  }

  ConfirmaAnularSolicitud() {
      this.loading = true;
      const Swal = require('sweetalert2');
      Swal.fire({
        title:  this.TranslateUtil('key.mensaje.pregunta.anular.oc'),
        text:  this.TranslateUtil('key.mensaje.confirmar.anular.oc'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
      }).then((result) => {
        if (result.value) {
          this.anularOc();
        } else {
          this.loading = false;
          this.ch_anulada = false;
          return false;
        }
      })

  }

  ConfirmaRevertirSolicitud() {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.revertir.oc'),
      text: this.TranslateUtil('key.mensaje.seguro.revertir.oc.ingresado'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.revertirOc();

      } else {
        this.loading = false;
        this.ch_anulada = false;
        return false;
      }
    })

}

  ConfirmaModificarSolicitud() {
    this.compararListas();
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.modificar.oc'),
      text: this.TranslateUtil('key.mensaje.confirmar.modificar.oc'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.modificarOc();
      } else {
        this.loading = false;
        this.ch_anulada = false;
        return false;
      }
    })

}

/*---------------------------------------------------------------------------------------------------------------------------- */

  /****funcion que emite la OC****/
  anularOc(){
    this.codoc = this.FormCrearOc.controls.numorden.value;
    this.ordencompraService.anularOrdenCompra(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, Number(this.codoc),this.servidor, this.usuario).subscribe(
      response => {
        this.ch_anulada = true;
        this.alertSwal.title = this.TranslateUtil('key.orden.compra')+" "+this.codoc+" "+this.TranslateUtil('key.anulada');
        this.alertSwal.show();
        this.buscarOc(this.codoc);
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.solicitud');
        this.alertSwalError.show();
      }
    );
  }

  revertirOc(){
    this.codoc = this.FormCrearOc.controls.numorden.value;
    this.ordencompraService.revertirOrdenCompra(this.hdgcodigo, this.esacodigo, this.cmecodigo, Number(this.orcoid),Number(this.provid),this.usuario,this.servidor).subscribe(
      response => {
        this.ch_anulada = true;
        this.alertSwal.title = this.TranslateUtil('key.orden.compra')+" "+this.codoc+" "+this.TranslateUtil('key.actualizada');
        this.alertSwal.show();
        this.buscarOc(this.codoc);
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.revertir.oc');
        this.alertSwalError.show();
      }
    );
  }

  salir(){
    this.router.navigate(['home'])
  }

  modificarOc(){
    let listado = "";
    for (const element of this.listado_articulos) {
      if(listado == "")
      {
        listado = element.odetmeinid.toString();
      }
      else
      {
        listado = listado + ', '+element.odetmeinid;
      }
    }

    if(this.FormCrearOc.value.mediopago == null || this.FormCrearOc.value.mediopago == undefined)
    {
      this.alertSwal.title = this.TranslateUtil('key.mensaje.debe.seleccionar.medio.pago');
      this.alertSwal.show();
      return;
    }
    this.loading = true;
    this.ordencompra = new OrdenCompra();
    this.ordencompra.orcoid = 0;
    this.ordencompra.orcoprov = Number(this.FormCrearOc.controls.provid.value);
    this.ordencompra.orcoprovdesc = this.FormCrearOc.controls.descprov.value;
    this.ordencompra.orcouser = this.usuario;
    this.ordencompra.servidor = this.servidor;
    this.ordencompra.orcoestado = 1;
    this.ordencompra.orcoestadodesc = 'Ingresada';
    this.ordencompra.orcofechacierre = "";
    this.ordencompra.orcofechaanulacion = "";
    this.ordencompra.orcobodid = Number(this.FormCrearOc.value.bodcodigo);
    this.ordencompra.orcobodid = 0;
    this.ordencompra.orcofechaemision = "";
    this.ordencompra.orcobandera = 0;
    this.ordencompra.orconumdoc = Number(this.FormCrearOc.controls.numorden.value);
    this.ordencompra.modificacioncabecera = this.modificacion_cabecera;
    this.ordencompra.modificaciondetalle = this.modificacion_detalle;

    if(this.ordencompra.orconumdoc == null)
    {
      this.ordencompra.orconumdoc = 0;
    }
    this.ordencompra.orcofechadoc = "";
    this.ordencompra.orcocondiciondepago = Number(this.FormCrearOc.value.mediopago);
    this.ordencompra.orcodetalle = this.listado_articulos;
    this.ordencompra.listamein = listado;
    this.ordencompraService.modificarOrdenCompra(this.ordencompra,this.servidor).subscribe(
      response => {
        if(response.folio == 0)
        {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.modificacion.oc');
          this.alertSwalError.show();
          return;
        }
        else
        {
          this.alertSwal.title = this.TranslateUtil('key.orden.compra')+" "+response.folio+" "+this.TranslateUtil('key.modificada');
          this.alertSwal.show();
          this.buscarOc(response.folio);
        }
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.solicitud');
        this.alertSwalError.show();
      }
    );
  }

  /****funcion que emite la OC****/
  generarEmisionOc(){
    this.codoc = this.FormCrearOc.controls.numorden.value;
    this.ordencompraService.emitirOrdenCompra( this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, Number(this.codoc),this.servidor).subscribe(
      response => {
        this.alertSwal.title = this.TranslateUtil('key.orden.compra')+" "+this.codoc+" "+this.TranslateUtil('key.emitida');
        this.alertSwal.show();
        this.buscarOc(this.codoc);
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.oc');
        this.alertSwalError.show();
      }
    );
  }

  /**** funcion que genera un OC y su detalle ****/
  generarSolicitud() {
    if(this.FormCrearOc.value.mediopago == null || this.FormCrearOc.value.mediopago == undefined)
    {
      this.alertSwal.title = this.TranslateUtil('key.mensaje.debe.seleccionar.medio.pago');
      this.alertSwal.show();
      return;
    }

    this.loading = true;
    this.ordencompra = new OrdenCompra();
    this.ordencompra.orcoid = 0;
    this.ordencompra.orcoprov = Number(this.FormCrearOc.controls.provid.value);
    this.ordencompra.orcoprovdesc = this.FormCrearOc.controls.descprov.value;
    this.ordencompra.orcouser = this.usuario;
    this.ordencompra.servidor = this.servidor;
    this.ordencompra.orcoestado = 1;
    this.ordencompra.orcoestadodesc = 'Ingresada';
    this.ordencompra.orcofechacierre = "";
    this.ordencompra.orcofechaanulacion = "";
    this.ordencompra.orcobodid = Number(this.FormCrearOc.value.bodcodigo);
    this.ordencompra.orcobodid = 0;
    this.ordencompra.orcofechaemision = "";
    this.ordencompra.orcobandera = 0;
    this.ordencompra.orconumdoc = Number(this.FormCrearOc.controls.numorden.value);
    if(this.ordencompra.orconumdoc == null)
    {
      this.ordencompra.orconumdoc = 0;
    }
    this.ordencompra.orcofechadoc = "";
    this.ordencompra.orcocondiciondepago = Number(this.FormCrearOc.value.mediopago);
    this.ordencompra.orcodetalle = this.listado_articulos;
    this.ordencompraService.crearOrdenCompra(this.ordencompra,this.servidor).subscribe(
      response => {
        this.alertSwal.title = this.TranslateUtil('key.orden.compra')+" "+response.folio+" "+this.TranslateUtil('key.creada');
        this.alertSwal.show();
        this.buscarOc(response.folio);
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.oc');
        this.alertSwalError.show();
      }
    );
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
