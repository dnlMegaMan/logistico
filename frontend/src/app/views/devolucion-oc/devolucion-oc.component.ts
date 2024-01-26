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
import { GuiaOc } from '../../models/entity/GuiaOc';
import { DetalleMovimientoOc } from "../../models/entity/detalleMovimientoOc";

import { Console } from 'console';
import { DatePipe } from '@angular/common';
import { GuiasModalComponent } from '../guias-modal/guias-modal.component';
import { ListaProveedor } from '../../models/entity/ListaProveedor';
import { BusquedaproveedorocmodalComponent } from '../busquedaproveedor-oc-modal/busquedaproveedorocmodal.component';
import { ArticulosOcModalComponent } from '../articulos-oc-modal/articulos-oc-modal.component';
import { BusquedaproductosocmodalComponent } from '../busquedaproductos-oc-modal/busquedaproductosocmodal.component';
import { HistorialDevolucionesComponent } from '../historialdevoluciones-modal/historialdevoluciones-modal.component';
import { MotivoDev } from 'src/app/models/entity/MotivoDev';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-devolucion-oc',
  templateUrl: './devolucion-oc.component.html',
  styleUrls: ['./devolucion-oc.component.css'],
  providers: [InformesService,OrdenCompraService,ProveedoresService,BusquedaproductosService ]
})
export class DevolucionOcComponent implements OnInit {

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;/****Componente para visualizar alertas****/
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;
  @ViewChild('tabset', { static: false }) tabset: TabsetComponent;
  public FormDevOc: FormGroup;
  public FormDevoOc: FormGroup;
  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormDatosProducto      : FormGroup;
  public codprod                = null;

  /**** variables booleanas que se accionan con el negocio*****/
  public bloquear_numoc: boolean = false;
  public bloquear_crearoc: boolean = false;
  public bloquear_rutprov: boolean = true;
  public bloquear_anulada : boolean = true;
  public bloquear_btn_agregar : boolean = true;
  public bloquear_btn_limpiar : boolean = false;
  public bloquear_btn_crear : boolean = true;
  public bloquear_eleminargrilla : boolean = true;
  public bloquear_limpiartodo : boolean = true;
  public bloquear_cantidad : boolean = false;
  public bloquear_formulario : boolean = false;
  public bloquear_btneleminargrilla : boolean = false;
  public act_fecha : boolean = false;
  public provid : number = 0;
  public bloquear_btn_articulo : boolean = false;


  private _BSModalRef: BsModalRef;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public servicios: Servicio[];
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario : string;
  public listatipodocumento : TipoDocumento[] = [];
  public listamotivodevolucion : MotivoDev[] = [];
  public listatipodocumentodev : TipoDocumento[] = [];
  public listaproveedor : ListaProveedor[] = [];
  public selected : number;
  public listado_movimientos      : Array<DetalleMovimientoOc> = [];
  public listado_movimientos_aux: Array<DetalleMovimientoOc> = [];
  public listado_guias            : Array<any> = [];  
  public guia            : GuiaOc = new(GuiaOc);
  public proveedor : Proveedores[] = [];
  public proveedor_aux: Proveedores = new(Proveedores);
  public rutproveedor : number;
  public cantidad_items : number;
  public isButtonVisible = true;
  public bloquear_dev : boolean = true;
  public bloquear_dev_form : boolean = true;
  public maxDate: Date = new Date();
  public minDate: Date = new Date();




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
    private router: Router,
    private route: ActivatedRoute,
    private _ordencompra: OrdenCompraService,
    private _proveedor: ProveedoresService,
    public _BusquedaproductosService: BusquedaproductosService,
    public _solicitudService        : SolicitudService,
    public _creaService             : CreasolicitudesService,
    public datePipe                   : DatePipe,
    public translate: TranslateService
  ) {
    this.FormDevOc = this.formBuilder.group({
      rutprov: [{ value: null, disabled: false }, Validators.required],
      selprov: [{ value: null, disabled: false }, Validators.required],
      provid: [{ value: null, disabled: false }, Validators.required],
      confecha: [{ value: null, disabled: false }, Validators.required],
      fechadesde: [{ value: null, disabled: false }, Validators.required],
      fechahasta: [{ value: null, disabled: false }, Validators.required],
      numerodoc: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(9)]],
      totaldoc: [{ value: null, disabled: true }, Validators.required],
      tipodoc: [{ value: null, disabled: false }, Validators.required],
      totalitems: [{ value: null, disabled: true }, Validators.required],
      fechaemision: [{ value: null, disabled: true }, Validators.required],
      razonsocial: [{ value: null, disabled: true }, Validators.required],
      ciudad: [{ value: null, disabled: true }, Validators.required],
      comuna: [{ value: null, disabled: true }, Validators.required],
      giro: [{ value: null, disabled: true }, Validators.required],
      direccion: [{ value: null, disabled: true }, Validators.required],
      telefono: [{ value: null, disabled: true }, Validators.required],
      fono: [{ value: null, disabled: true }, Validators.required],
      fax: [{ value: null, disabled: true }, Validators.required],
    });


    this.FormDevoOc = this.formBuilder.group({
      fechaemisiondev: [{ value: null, disabled: false }, Validators.required],
      tipodocdev: [{ value: null, disabled: true }, Validators.required],
      numerodocdev: [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.cargarCombos();
    this.cargarCombosDev();
    this.cargarCombosProv();
    this.act_fecha = true;
    this.FormDevoOc.get('tipodocdev')!.disable();
    //this.FormDevOc.get('fechahasta')!.disable();
  }

  salir(){
    this.router.navigate(['home'])
  }


  async cargarCombos(){
    try {
      this.loading = true;
      this.listatipodocumento = await this._ordencompra.listaTipoDocumento(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,'reg'
      ).toPromise();
      this.listamotivodevolucion = await this._ordencompra.listaMotivoDevolucion(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.servidor).toPromise();
      this.selected = Number(this.listatipodocumento[0]['codtipodocumento'])
      //console.log(this.listamotivodevolucion)
      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }

  }

  async cargarCombosDev(){
    try {
      this.loading = true;
      this.listatipodocumentodev = await this._ordencompra.listaTipoDocumento(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,'dev'
      ).toPromise();
      this.selected = Number(this.listatipodocumentodev[0]['codtipodocumento'])
      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }

  }

  async validarDev(){
    let fecha = this.datePipe.transform(this.FormDevoOc.controls.fechaemisiondev.value, 'dd-MM-yyyy');;
    let tipo = Number(this.FormDevoOc.value.tipodocdev) 
    let nota =  Number(this.FormDevoOc.value.numerodocdev)
    let response = await this._ordencompra.buscarHistorialDevoluciones(this.hdgcodigo, this.esacodigo, this.cmecodigo, 0,this.servidor,fecha,tipo,nota).toPromise();
    if(response[0]['servidor'] == 'Exito'){
      if(tipo ==4){
        this.alertSwalError.title = "Nota de crédito N° " + nota + " con fecha " + fecha + " ya existe en el sistema";
      }else{
        this.alertSwalError.title = "Nota de débito N° " + nota + " con fecha " + fecha + " ya existe en el sistema";
      }
      this.alertSwalError.text = "";
      this.alertSwalError.show();
      return;
    }
    else{
      this.confirmarDevolucion();
    }
  }

  /**** Funcion que verifica la activacion del boton de generacion de devolucion****/
  verificarInfo()
  {
    let contador = 0;
    let motivos = 0;
    for (const element of this.listado_movimientos) {
      console.log(element.motivodev)
      if(element.adevolver > 0 && element.motivodev > 0)
      {
        contador = 1;
        break;
      } else if (element.adevolver == 0 && element.motivodev > 0) {
        contador = 0;
        break;
      }
    }

    if (contador == 0 || this.FormDevoOc.value.fechaemisiondev == null || this.FormDevoOc.value.tipodocdev == null || this.FormDevoOc.value.numerodocdev == null)
    {
      this.bloquear_dev = true;
    }
    else
    {
      this.bloquear_dev = false;
    }
  }


  seleccionaprov(lang) {
    this.FormDevOc.controls.rutprov.setValue(Number(lang))
  }

  async cargarCombosProv(){
    try {
      this.loading = true;
      this.listaproveedor = await this._ordencompra.listaProveedor(
        this.servidor
      ).toPromise();
      this.selected = Number(this.listaproveedor[0]['rutproveedor'])
      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }

  }

  setModalGuias(listado: any, meinid: number) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.guias'),
        listado: listado,
        meinid: meinid,
        tipo: 'guia'
      }
    };
    return dtModal;
  }

  abrirModalGuias(listado: any, meinid: number)
  {
    this._BSModalRef = this._BsModalService.show(GuiasModalComponent, this.setModalGuias(listado, meinid));
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != undefined)
      {
        for (const element of this.listado_guias) {
          if(element.guiaid == response.guiaid)
          {
            this.guia = element;
            let varu = this.datePipe.transform( this.guia.fechaemision.toString(), 'dd/MM/yyyy')
            //console.log(varu)
            // console.log("----------")
            // console.log(this.guia.fechaemision.toString())
            this.minDate = new Date(varu)
            //this.minDate = this.datePipe.transform( this.FormDatosProducto.controls.fechavenc.value.toString(), 'dd-MM-yyyy');
            this.FormDevoOc.get('tipodocdev')!.enable();
            this.bloquear_dev_form = false;
            this.FormDevOc.controls.rutprov.setValue(element.rutprov.toString())
            this.cargarProveedor(1)
            this.FormDevOc.patchValue({tipodoc: this.guia.tipo })
            this.listado_movimientos = this.guia.detallemov!;
            this.cantidad_items = this.listado_movimientos.length
            this.FormDevOc.disable();
            this.bloquear_formulario = true;
            break;
          }
        }
      }
    });
  }

  /**** funcion que cambia la cantidad a despachar de un articulo ****/
  cambio_cantidad(id: number, property: string, registro: any,cantidad : number){
    if(cantidad >= 1)
    {
      var disponible = (Number(this.listado_movimientos[id]["odmocantidad"]) - Number(this.listado_movimientos[id]["odmocantdevuelta"]))
      if(cantidad > disponible)
      {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.cantidad.devolver.no.exceder.disponible');
        this.alertSwalError.show();
        return;
      }
      else
      {
        this.listado_movimientos[id][property] = Number(cantidad);
        this.verificarInfo();
      }
    }
    else
    {
      this.verificarInfo();
    }
  }

  cambio_motivo(value: number, id: number){
    //console.log(value)
    console.log(this.listado_movimientos[id])
    if (value == 0 && this.listado_movimientos[id]["adevolver"] > 0)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.ingresar.motivo.valido');
      this.alertSwalError.show();
      return;  
    }
    else if (value >= 1 && this.listado_movimientos[id]["adevolver"] == 0)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.pueden.agregar.motivos');
      this.alertSwalError.show();
      return;  
    }
    else
    {
      this.listado_movimientos[id]['motivodev'] = Number(value);
    }
    this.verificarInfo();
    //sergio
  }

  activarProv(){
    this.FormDevOc.controls.rutprov.setValue(null)
    if( this.isButtonVisible == true)
    {
      this.isButtonVisible = false;
    }
    else
    {
      this.isButtonVisible = true;
    }
  }

  

  //Confirmacion para generar devolucion
  confirmarDevolucion() {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.devolver.articulos'),
      text: this.TranslateUtil('key.mensaje.confirmar.devolucion.orden.compra'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.generarDevolucion();
      } else {
        this.loading = false;
        return;
      }
    })
  }

  generarDevolucion()
  {
    let fecha = this.datePipe.transform(this.FormDevoOc.controls.fechaemisiondev.value, 'dd-MM-yyyy');;
    let tipo = Number(this.FormDevoOc.value.tipodocdev) 
    let nota =  Number(this.FormDevoOc.value.numerodocdev)

    for (const element of this.listado_movimientos) {
      if(element.adevolver > 0)
      {
        let nuevo = new (DetalleMovimientoOc)
        nuevo = element;
        nuevo.tipodev = tipo
        nuevo.fechadev = fecha
        nuevo.notadev = nota
        this.listado_movimientos_aux.push(nuevo)
      }
    }    
    this.guia.detallemov = this.listado_movimientos_aux;
    this.guia.responsable = this.usuario;
    this.guia.servidor = this.servidor;


    this._ordencompra.crearDevolucion(this.guia,this.servidor).subscribe(
      response => {
        this.alertSwal.title = "Nota de credito "+response.folio+" creada";
        this.alertSwal.show();
        this.Limpiar();
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.solicitud');
        this.alertSwalError.show();
      }
    );
  }

  //Funcion para habilitar busqueda por fecha
  conFecha(e) {
    if (!e.target.checked) {
      this.act_fecha = true;
      this.FormDevOc.get('fechadesde')!.disable();
      this.FormDevOc.get('fechahasta')!.disable();
    } else {
      this.act_fecha = false;
      this.FormDevOc.get('fechadesde')!.enable();
      this.FormDevOc.get('fechahasta')!.enable();
    }
  }

   /****funcion que valida rut****/
   validaRut(){
    if (this.FormDevOc.controls['rutprov'].value != undefined &&
      this.FormDevOc.controls['rutprov'].value != null &&
      this.FormDevOc.controls['rutprov'].value != " " &&
      this.FormDevOc.controls['rutprov'].value != "")
    {
      if (this.FormDevOc.controls['rutprov'].value.toString().length < 7)
      {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.id.no.valido');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.id.proveedor.validar');
      this.alertSwalAlert.show();
      return false;
      }
      const newRut = this.FormDevOc.controls['rutprov'].value.replace(/\./g,'').replace(/\-/g, '').trim().toLowerCase();
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
        this.FormDevOc.get('rutprov').setValue(format.concat('-').concat(lastDigit));
        if( !validateRUT(this.FormDevOc.controls.rutprov.value)){
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

  Limpiar(){
    this.FormDevOc.enable();
    this.FormDevOc.reset();
    this.FormDevoOc.reset();

    this.listado_guias = [];
    this.listado_movimientos = [];
    this.bloquear_dev = true;
    this.cargarCombos();
    this.cargarCombosProv();
    this.act_fecha = true;
    this.provid = 0;
    // this.FormDevOc.get('fechadesde')!.disable();
    // this.FormDevOc.get('fechahasta')!.disable();
    this.bloquear_formulario = false;
    this.bloquear_btn_articulo = false;   
    this.FormDevoOc.get('tipodocdev')!.disable();
    this.bloquear_dev_form = true;
  }

  /****funcion que carga proveedor cuando se le busca por rut****/
  async cargarProveedor(entrada: number){
    try {
      this.loading = true;
      if(!this.validaRut())
      {
        this.loading = false;
        return;
      }
      else
      {
        var splitted = this.FormDevOc.controls['rutprov'].value.split("-", 2);
        this.rutproveedor = Number(splitted[0]);
        this.proveedor = await this._proveedor.buscaProveedorporrut(this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,          
          this.rutproveedor,
          this.usuario,
          this.servidor
        ).toPromise();
        
        if(this.proveedor[0]['numerorutprov'] != 0)
        {
          if(entrada == 1)
          {
            this.proveedor_aux = this.proveedor[0];
          }       
          this.provid = Number(this.proveedor[0]['proveedorid'])
          this.FormDevOc.controls.provid.setValue(this.proveedor[0]['proveedorid'].toString())
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
      alert(err.message);
      this.loading = false;
    }
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

  /**** funcion que abre el modal de busuqeda de proveedor*****/
  abrirModalBusuqedaProv()
  {
    this._BSModalRef = this._BsModalService.show(BusquedaproveedorocmodalComponent, this.setModalProveedor());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      this.Limpiar();
      this.provid = Number(response['proveedorid']);
      var ruttotal = String(response['numerorutprov']);
      ruttotal = ruttotal + '-' + response['dvrutprov'].toString();
      this.FormDevOc.controls.rutprov.setValue(ruttotal.toString())
      this.cargarProveedor(0);
    });
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
        this.Limpiar();
      } else {
        this.loading = false;
        return;
      }
    })
  }

  /****funcion que implementa el modal de búsuqeda de articulos****/
  setModalBusquedaProductos() {
    let tipodoc : number = Number(this.FormDevOc.value.tipodoc);
    var numdocaux  : number =  Number(this.FormDevOc.get('numerodoc').value);
    //this.codprod = this.FormDatosProducto.controls.codigo.value;
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
        tipo_busqueda: 'devolucion',
        proveedor: this.provid,
        tipodoc: tipodoc ,
        numdocaux: numdocaux
      }
    };
    return dtModal;
  }

  validaBtn(){ 
    let tipodoc = Number(this.FormDevOc.value.tipodoc);
    let numdoc = Number(this.FormDevOc.get('numerodoc').value);
    if(tipodoc != 0 && numdoc != 0 && this.provid != 0)
    {
      this.bloquear_btn_articulo = false;
    }
    else
    {
      this.bloquear_btn_articulo = true;
    }
  }

  /**** funcion que abre el modal de articulos y proveedor*****/
  abrirModalArticulos()
  {
    this._BSModalRef = this._BsModalService.show(BusquedaproductosocmodalComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
    if(response != undefined)
    {
      this.buscarGuiaFiltro(response.mein)
    }  
    });
  }


  setModalHistorial(odmoid: number) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.historial.devoluciones'),
        odmoid: odmoid,
      }
    };
    return dtModal;
  }

  abrirModalHistorial(odmoid: number, cantidad: number)
  {
    if(cantidad == 0)
    {
      return;
    }
    this._BSModalRef = this._BsModalService.show(HistorialDevolucionesComponent, this.setModalHistorial(odmoid));
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != undefined){
      }
    });
  }

  /**** funcion que busca por parametro las guias****/
  async buscarGuiaFiltro(meinid: number)
  {
    let rut  : number = 0;   
    if(this.FormDevOc.get('rutprov').value != "" && this.FormDevOc.get('rutprov').value != null)
    {
      var splitted = this.FormDevOc.controls['rutprov'].value.split("-", 2);
      let rut  : number = Number(splitted[0]);
    }
    let desde   : string = "";
    let hasta   : string = "";
    if(this.FormDevOc.get('fechadesde')!.value != "" && this.FormDevOc.get('fechadesde')!.value != null)
    {
      desde = this.datePipe.transform( this.FormDevOc.get('fechadesde')!.value.toString() , 'dd-MM-yyyy')!;
    }
    if(this.FormDevOc.get('fechahasta')!.value != "" && this.FormDevOc.get('fechahasta').value != null)
    {
      hasta  = this.datePipe.transform(  this.FormDevOc.get('fechahasta').value.toString() , 'dd-MM-yyyy');
    }
    let tipodoc : number = Number(this.FormDevOc.value.tipodoc);
    let numdoc  : number =  Number(this.FormDevOc.get('numerodoc').value);
    
    if(this.provid == 0 && rut == 0 && desde == "" && hasta =="" && tipodoc == 0 && (isNaN(numdoc) == true || numdoc == 0) && meinid == 0)
    {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.ingresar.parametros.busqueda');
      this.alertSwalError.show();
      this.Limpiar();
      return;
    }


    this._ordencompra.BuscarGuiaFiltros(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      rut,
      desde,
      hasta,
      tipodoc,
      numdoc,
      this.servidor, this.provid ,meinid
     ).subscribe(
      response => {
        if(response.length == 0){
            return;
        } else if (response.length == 1){
          if(response[0]["mensaje"] == "Sin Datos")
          {
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.encontraron.guias.bajo.criterio');
            this.alertSwalError.show();
            return;
          }
          this.alertSwal.title = this.TranslateUtil('key.mensaje.solo.existe.recepcion.datos.ingresados');
          this.alertSwal.show();
          this.guia = response[0];
          //sergio
          let varu = this.datePipe.transform( this.guia.fechaemision.toString(), 'dd-MM-yyyy')
          this.minDate = new Date(varu)
          this.FormDevOc.controls.rutprov.setValue(response[0]['rutprov'].toString())
          this.cargarProveedor(1);
          this.listado_movimientos = this.guia.detallemov;
          this.cantidad_items = this.listado_movimientos.length
          this.FormDevOc.patchValue({tipodoc: this.guia.tipo })
          this.FormDevOc.disable();
          this.FormDevoOc.get('tipodocdev')!.enable();
          this.bloquear_dev_form = false;
          this.bloquear_formulario = true;
        } else {
          this.listado_guias = response;
          this.abrirModalGuias(this.listado_guias, meinid)
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      });
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }

}
