import { Component, ComponentFactoryResolver, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { runInThisContext } from 'vm';
import { Comuna } from 'src/app/models/entity/Comuna';
import { Ciudad } from 'src/app/models/entity/Ciudad';
import { ArticuloProv } from 'src/app/models/entity/ArticuloProv';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { DatePipe } from '@angular/common';
import { Pais } from 'src/app/models/entity/Pais';
import { Region } from 'src/app/models/entity/Region';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-mantenedor-prov',
  templateUrl: './mantenedor-prov.component.html',
  styleUrls: ['./mantenedor-prov.component.css'],
  providers: [InformesService,OrdenCompraService,ProveedoresService,BusquedaproductosService ]

})

export class MantenedorProvComponent implements OnInit {

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;/****Componente para visualizar alertas****/
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;
  @ViewChild('tabset', { static: false }) tabset: TabsetComponent;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormCrearProv: FormGroup;
  public FormDatosProducto      : FormGroup;
  public codprod                = null;
  public prov_aux : any;


  /**** variables booleanas que se accionan con el negocio*****/
  public bloquear_numoc: boolean = false;
  public bloquear_crearprov: boolean = false;
  public bloquear_rutprov: boolean = true;
  public bloquear_btn_agregar : boolean = true;
  public bloquear_btn_limpiar : boolean = false;
  public bloquear_eleminargrilla : boolean = true;
  public bloquear_btn_limpiar_grilla: boolean = true;
  public bloquear_cantidad : boolean = false;
  public bloquear_btneleminargrilla : boolean = false;
  public facturaelectr : boolean = false;

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
  public listacomuna : Comuna[] = [];
  public listaciudad : Ciudad[]= [];
  public listaregion : Region[]= [];
  public listapais: Pais[]=[];
  public ultimaOc      :UltimaOc[] = [];
  public ordencompra   :OrdenCompra;
  public proveedores : Proveedores[] = [];
  public rutproveedor : number;
  public formapago : number;
  public selectedmediopago : number;
  public estadodesc: string = "";
  public listado_articulos      : Array<ArticuloProv> = [];
  public listado_articulos_ori  : Array<ArticuloProv> = [];
  public descprod               = null;
  public codoc                  : number  = 0;
  public lista_eliminados       : Array<number> = [];
  public provid : number;
  public provid_ori : number = 0;
  public medio_pago_ori : number;
  public comuna_ori : number;
  public ciudad_ori : number;
  public pais_ori : number;
  public region_ori : number;
  public orcoid : number;
  public bloquear_buscarprov: boolean = false;
  public habilitar_campos: boolean = true;
  public habilitar_campos_rut: boolean = false;
  public proveedor: Proveedores = new Proveedores;



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
    public datePipe                   : DatePipe,
    public translate: TranslateService
  ) {
    this.FormCrearProv = this.formBuilder.group({
      rutprov: [{ value: null, disabled: false }, [Validators.required]],
      descprov: [{ value: null, disabled: false }, Validators.required],
      giro: [{ value: null, disabled: false }, Validators.required],
      dirprov: [{ value: null, disabled: false }, Validators.required],
      ciudad : [{ value: null, disabled: false }, Validators.required],
      comuna: [{ value: null, disabled: false }, Validators.required],
      region : [{ value: null, disabled: false }, Validators.required],
      pais: [{ value: null, disabled: false }, Validators.required],
      representanteprov: [{ value: null, disabled: false }, Validators.required],
      emailprov   : [{ value: null, disabled: false }, Validators.required],
      urlprov : [{ value: null, disabled: false }, Validators.required],
      montominfact: [{ value: null, disabled: false }, Validators.required],
      telefono   : [{ value: null, disabled: false }, Validators.required],
      telefono2   : [{ value: null, disabled: false }, Validators.required],
      contactoprov: [{ value: null, disabled: false }, Validators.required],
      contactotelefono2   : [{ value: null, disabled: false }, Validators.required],
      contactotelefono   : [{ value: null, disabled: false }, Validators.required],
      mediopago: [{ value: null, disabled: false }, Validators.required],
      observaciones   : [{ value: null, disabled: false }, Validators.required],
      provid   : [{ value: null, disabled: false }],
      facturaelectr   : [{ value: null, disabled: false }],
      rutprovori : [{ value: null, disabled: false }],

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
    this.FormCrearProv.controls.mediopago.disable()
    this.cargarCombos(0,0)
    this.cargarCombosPais(0)
    this.FormCrearProv.controls.mediopago.disable();
    this.FormCrearProv.controls.ciudad.disable();
    this.FormCrearProv.controls.comuna.disable();
    this.FormCrearProv.controls.region.disable();
    this.FormCrearProv.controls.pais.disable();
  }


  limpiarGrilla(){
    this.listado_articulos = [];
    this.lista_eliminados = [];
    this.bloquear_rutprov = false;
  }

 /**** funcion que carga combos en base al proveedores seleccionado****/
  async cargarCombos(condicion: number, selected: number){
    // try {
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
      if(selected != 0){
        this.FormCrearProv.patchValue({mediopago: selected })
      }
      //this.selectedmediopago = Number(3)
    // } catch (err) {
    //   alert(err.message);
    //   this.loading = false;
    // }
  }

  salir(){
    this.router.navigate(['home'])
  }

  async cargarCombosPais(selectedciud: number){
    // try {
      this.pais_ori = selectedciud;
      this.loading = true;
      this.listapais = await this._ordencompra.listaPais(this.servidor).toPromise();
      this.loading = false;
      if(selectedciud != 0){
        this.FormCrearProv.patchValue({pais: selectedciud })
      }
    // } catch (err) {
    //   alert(err.message);
    //   this.loading = false;
    // }
  }

  async cargarCombosRegion(pais: number, selectedregion: number){
    // try {
      pais = Number(pais)
      this.region_ori = selectedregion;
      this.loading = true;
      this.listaregion = await this._ordencompra.listaRegion(pais,this.servidor).toPromise();
      this.loading = false;
      if(selectedregion != 0){
        this.FormCrearProv.patchValue({region: selectedregion })
      }
      if(pais != 0 && !isNaN(pais)){
        this.FormCrearProv.controls.region.enable();
      }else{
        this.FormCrearProv.controls.region.disable();
      }
    // } catch (err) {
    //   alert(err.message);
    //   this.loading = false;
    // }
  }

  async cargarCombosCiudad(region: number, selectedciudad: number){
    // try {
      region = Number(region)
      this.ciudad_ori = selectedciudad;
      this.loading = true;
      this.listaciudad = await this._ordencompra.listaCiudad(region,this.servidor).toPromise();
      this.loading = false;
      if(selectedciudad != 0){
        this.FormCrearProv.patchValue({ciudad: selectedciudad })
      }
      if(region != 0 && !isNaN(region)){
        this.FormCrearProv.controls.ciudad.enable();
      }else{
        this.FormCrearProv.controls.ciudad.disable();
      }
    // } catch (err) {
    //   alert(err.message);
    //   this.loading = false;
    // }
  }

  async cargarCombosComuna(ciudad: number, selectedcomu: number){
    // try {
      ciudad = Number(ciudad)
      this.comuna_ori = selectedcomu;
      this.loading = true;
      this.listacomuna = await this._ordencompra.listaComuna(ciudad,this.servidor).toPromise();
      this.loading = false;
      if(selectedcomu != 0){
        this.FormCrearProv.patchValue({comuna: selectedcomu })
      }
      if(ciudad != 0 && !isNaN(ciudad)){
        this.FormCrearProv.controls.comuna.enable();
      }else{
        this.FormCrearProv.controls.comuna.disable();
      }
    // } catch (err) {
    //   alert(err.message);
    //   this.loading = false;
    // }
  }

  /**** funcion que limpia la pantalla *****/
  limpiarPantalla()
  {
    this.provid = 0;
    this.FormCrearProv.reset();
    this.habilitar_campos = true;
    this.habilitar_campos_rut = false;
    this.bloquear_crearprov = false;
    this.bloquear_buscarprov = false;
    this.creacion = false;
    this.modificacion = false;
    this.facturaelectr = false;
    this.lista_eliminados = [];
    this.listado_articulos = [];
    this.listado_articulos_ori = [];
    this.FormCrearProv.controls.mediopago.disable();
    this.FormCrearProv.controls.ciudad.disable();
    this.FormCrearProv.controls.comuna.disable();
    this.FormCrearProv.controls.pais.disable();
    this.FormCrearProv.controls.region.disable();
  }




  /****funcion que interactua con os elementos de la pantalla al crear una OC****/
  async crearProv()
  {
    this.limpiarPantalla();
    this.habilitar_campos = false;
    this.habilitar_campos_rut = false;
    this.bloquear_crearprov = true;
    this.bloquear_buscarprov = true;
    this.creacion = true;
    this.modificacion = false;
    this.FormCrearProv.controls.mediopago.enable();
    this.FormCrearProv.controls.pais.enable();
    this.bloquear_btn_agregar = false;
    this.lista_eliminados = [];
    this.listado_articulos = [];
    this.listado_articulos_ori = [];
  }

  compararListas()
  {
    if(this.listado_articulos.length == this.listado_articulos_ori.length)
    {
      let contador = 0;
      for (const element of this.listado_articulos) {
        for (const elements of this.listado_articulos_ori) {
          if(element.meinid == elements.meinid)
          {
            //console.log(element)
            //console.log(elements)
            if((Number(element.plazo) != Number(elements.plazo)))
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
        this.modificacion_detalle = 0;
      }

    }
    else
    {
      this.modificacion_detalle  = 1;
    }

    //JSON.stringify(obj1) === JSON.stringify(obj2)
    //console.log(this.listado_articulos)
    //console.log(this.listado_articulos_ori)
    //console.log(this.modificacion_detalle)

    // if((this.provid != this.provid_ori) || (Number(this.FormCrearProv.value.mediopago) != this.medio_pago_ori))
    // {
    //   this.modificacion_cabecera = 1;
    // }
    // else
    // {
    //   this.modificacion_cabecera = 0;
    // }
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

  /****funcion que carga proveedores cuando se le busca por rut****/
  async cargarProveedor(selected: number, tipo: number){
    // try {
      this.loading = true;
      if(tipo == 1)
      {
        if(!this.validaRut(1))
        {
          this.loading = false;
          return;
        }
      }
      else
      {
        var splitted = this.FormCrearProv.controls['rutprov'].value.split("-", 2);
        this.rutproveedor = Number(splitted[0]);
        const response = await this._proveedor.buscaProveedorporrut(
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.rutproveedor,
          this.usuario,
          this.servidor
        ).toPromise();
        this.proveedores = response;
        //console.log(this.provedores)
        if(this.proveedores != null)
        {
          if(this.proveedores[0]['numerorutprov'] != 0)
          {
            this.proveedor = this.proveedores[0]
            if(this.proveedor.facturaelectr == 't')
            {
              this.facturaelectr = true;
            }
            else
            {
              this.facturaelectr = false;
            }
            this.FormCrearProv.controls.rutprovori.setValue(`${this.proveedores[0].numerorutprov}-${this.proveedores[0].dvrutprov}`)
            this.formapago = Number(this.proveedores[0]['formapago'].toString())
            this.FormCrearProv.controls.provid.setValue(this.proveedores[0]['proveedorid'].toString())
            this.provid = Number(this.proveedores[0]['proveedorid'])
            this.bloquear_btn_agregar = false;
            this.habilitar_campos = false;
            this.habilitar_campos_rut = true;
            this.modificacion = true;
            this.creacion = false;
            this.FormCrearProv.controls.mediopago.enable();
            this.FormCrearProv.controls.ciudad.enable();
            this.FormCrearProv.controls.comuna.enable();
            this.FormCrearProv.controls.pais.enable();
            this.FormCrearProv.controls.region.enable();
            this.cargarCombos(0,this.proveedor.formapago)
            this.cargarArticulosProv(this.proveedor.proveedorid)
            this.cargarCombosPais(this.proveedor.paiscodigo)
            this.cargarCombosRegion(this.proveedor.paiscodigo, this.proveedor.regioncodigo)
            this.cargarCombosCiudad(this.proveedor.regioncodigo,this.proveedor.ciudadcodigo)
            this.cargarCombosComuna(this.proveedor.ciudadcodigo,this.proveedor.comunacodigo)
            this.bloquear_crearprov = true;
            this.bloquear_buscarprov = true;
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
        else
        {
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.proveedor.no.encontrado');
          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.proveedor.no.encontrado');
          this.alertSwalAlert.show();
        }
        this.loading = false;
      }
    // } catch (err) {
    //   console.log(err)
    //   alert(err.message);
    //   this.loading = false;
    // }
  }

  async cargarArticulosProv(provid: number){
    const response = await this._ordencompra.buscaDetalleArticulosProv(
      this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
      this.servidor,
      provid
    ).toPromise();
    this.listado_articulos = response.filter((registro) => registro.meinid != 0);
    console.log(this.listado_articulos)
    for (const elements of this.listado_articulos) {
      var art_aux = new ArticuloProv
      art_aux = elements
      this.listado_articulos_ori.push(art_aux)
    }
  }

  /****funcion que valida rut****/
  async validaRut(tipo: number){
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    let rutnum = null;
    if (this.FormCrearProv.controls['rutprov'].value != undefined &&
      this.FormCrearProv.controls['rutprov'].value != null &&
      this.FormCrearProv.controls['rutprov'].value != " " &&
      this.FormCrearProv.controls['rutprov'].value != ""){
        rutnum = this.FormCrearProv.controls['rutprov'].value;
        const newRut = this.FormCrearProv.controls['rutprov'].value.replace(/\./g,'').replace(/\-/g, '').trim().toLowerCase();
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

        this.FormCrearProv.get('rutprov').setValue(format.concat('-').concat(lastDigit));


        if(!validateRUT(this.FormCrearProv.controls.rutprov.value)){
            if(this.FormCrearProv.controls['rutprovori'].value != null)
            {
              this.FormCrearProv.controls.rutprov.setValue(this.FormCrearProv.controls['rutprovori'].value.toString())
            }
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.id.no.valido');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.id.proveedor.validar');
            this.alertSwalAlert.show();
            this.FormCrearProv.controls.rutprov.setValue(null)
            return false;
        }
        else
        {
          var splitted = this.FormCrearProv.controls['rutprov'].value.split("-", 2);
          this.rutproveedor = Number(splitted[0]);
          this.prov_aux = await this._proveedor.buscaProveedorporrut(
            this.hdgcodigo,
            this.esacodigo,
            this.cmecodigo,
            this.rutproveedor,
            this.usuario,
            this.servidor
          ).toPromise();
          //console.log(this.prov_aux)
          if(this.prov_aux != null && tipo == 1)
          {
            if(this.prov_aux[0]['numerorutprov'] != 0)
            {
              this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.id.ya.existe.registrado');
              this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.id.proveedor.validar');
              this.alertSwalAlert.show();
              this.FormCrearProv.controls.rutprov.setValue(null)
              return false;
            }
          }
           if(tipo==0){
            this.cargarProveedor(0,0)
           }
          return true;
        }

    }
  }





  /****funcion que valida que un articulo no se repita****/
  validaItem(meinid: number):boolean{
    this.alertSwalAlert.title = "";
    this.alertSwalAlert.text = "";
    for (const element of this.listado_articulos) {
      if(element.meinid == meinid)
      {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.codigo.existe');
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
        proveedores: this.provid,
        id_Bodega: Number(this.FormCrearProv.value.bodcodigo),
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
   setModalProveedor(rutnum: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.proveedor'),
        hdgcodigo: this.hdgcodigo,
        rutnum: rutnum
      }
    };
    return dtModal;
  }

  /***********************************************************************************************************************************************/

  /**** funcion que abre el modal de busuqeda de proveedores*****/
  abrirModalBusuqedaProv(rutnum: string)
  {
    this._BSModalRef = this._BsModalService.show(BusquedaproveedorocmodalComponent, this.setModalProveedor(rutnum));
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != undefined) {
        var ruttotal = String(response['numerorutprov']);
        ruttotal = ruttotal + '-' + response['dvrutprov'].toString();
        this.FormCrearProv.controls.rutprov.setValue(ruttotal.toString())
        this.cargarProveedor(0,0);
        this.modificacion = true;
      }
    });
  }

  /**** funcion que agrega un item a la grilla*****/
  agregarItemGrilla(mein: DetalleOC)
  {
    let item = new ArticuloProv
    var date = new Date();
    item.fechacreacion = this.datePipe.transform( date, 'dd/MM/yyyy');
    item.meincodigo = mein.meincodigo
    item.meindesc = mein.meindesc
    item.meinid = mein.odetmeinid
    item.plazo = 0
    item.provid = this.provid
    item.meintipo = "NUEVO"
    item.valor = 0
    this.listado_articulos.push(item);
    this.compararListas()
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
  }

  cambioCheckFactura(event: any)
  {
    if (event.target.checked ) {
      this.proveedor.facturaelectr = 't'
    }
    else
    {
      this.proveedor.facturaelectr = 'f'
    }
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

  async ingresarItem(codigo: string, proveedores: number)
  {
    const variable = await this._ordencompra.AsociarMeinProv(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, codigo,proveedores,this.servidor).toPromise();
    this.BuscaProducto();
  }

  ConfirmaAgregarItem(nombre: string, proveedores: number, codigo: string) {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.item.no.asociado.proveedor'),
      text:   nombre + " no se encuentra asociado al proveedores, desea asociarlo?",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ingresarItem(codigo, proveedores);
      } else {
        this.loading = false;
        return;
      }
    })
  }

  /****funcion que agrega un articulo a la grilla****/
  addArticuloGrilla() {
    //console.log("grilla")
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
         , this.usuario, null, this.servidor, null, 0, 0, 0).subscribe(
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
               this.agregarItemGrilla(producto_nuevo);
               if (this.FormCrearProv.controls['descprov'].value != undefined &&
               this.FormCrearProv.controls['descprov'].value != null )
               {
                 this.bloquear_btn_crear = false;
               }
               else
               {
                 this.bloquear_btn_crear = true;
               }
             }
           }
           this.loading = false;
         }, error => {
           this.loading = false;
         });
      }
    });
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
         , this.usuario, null, this.servidor, null, 0, 0, 0).subscribe(
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
                   this.agregarItemGrilla(producto_nuevo);
                   if (this.FormCrearProv.controls['descprov'].value != undefined &&
                   this.FormCrearProv.controls['descprov'].value != null )
                   {
                     this.bloquear_btn_crear = false;
                   }
                   else
                   {
                     this.bloquear_btn_crear = true;
                   }
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

/*---------------------------------------------------------------------------------------------------*/
  ConfirmaGenerarSolicitud() {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.crear.nuevo.proveedor'),
      text: this.TranslateUtil('key.mensaje.confirmar.crear.proveedor'),
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
      title: this.TranslateUtil('key.mensaje.pregunta.eliminar'),
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

  ConfirmaModificarSolicitud() {
    this.compararListas();
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.modificar.proveedor'),
      text: this.TranslateUtil('key.mensaje.confirmar.modificar.proveedor'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.modificarOc();
      } else {
        this.loading = false;
        return false;
      }
    })

  }

  modificarOc(){
    let listado = "";
    for (const element of this.listado_articulos) {
      if(listado == "")
      {
        listado = element.meinid.toString();
      }
      else
      {
        listado = listado + ', '+element.meinid;
      }
    }

    if(this.FormCrearProv.value.ciudad == null || this.FormCrearProv.value.ciudad == undefined)
    {
      this.alertSwal.title = this.TranslateUtil('key.mensaje.debe.seleccionar.ciudad');
      this.alertSwal.show();
      return;
    }

    if(this.FormCrearProv.value.comuna == null || this.FormCrearProv.value.comuna == undefined)
    {
      this.alertSwal.title = this.TranslateUtil('key.mensaje.debe.seleccionar.comuna');
      this.alertSwal.show();
      return;
    }

    if(this.FormCrearProv.value.mediopago == null || this.FormCrearProv.value.mediopago == undefined)
    {
      this.alertSwal.title = this.TranslateUtil('key.mensaje.debe.seleccionar.medio.pago');
      this.alertSwal.show();
      return;
    }

    let newRut = this.FormCrearProv.controls['rutprov'].value.replace(/\./g,'').replace(/\-/g, '').trim().toLowerCase();
    let lastDigit = newRut.substr(-1, 1);
    let rutDigit = newRut.substr(0, newRut.length-1);
    this.proveedor.dvrutprov = lastDigit
    this.proveedor.numerorutprov = Number(rutDigit)
    this.proveedor.formapago = Number(this.FormCrearProv.value.mediopago)
    this.proveedor.montominfac = Number(this.proveedor.montominfac)
    this.proveedor.telefono = Number(this.proveedor.telefono)
    this.proveedor.telefono2 = Number(this.proveedor.telefono2)
    this.proveedor.telefono1contac = Number(this.proveedor.telefono1contac)
    this.proveedor.telefono2contac = Number(this.proveedor.telefono2contac)
    this.proveedor.ciudadcodigo = Number(this.FormCrearProv.value.ciudad)
    this.proveedor.comunacodigo = Number(this.FormCrearProv.value.comuna)
    this.proveedor.provdetalle = this.listado_articulos
    this.proveedor.listamein = listado
    this._proveedor.ModificarProveedor(this.proveedor).subscribe(
      response => {
        this.alertSwal.title = this.TranslateUtil('key.mensaje.proveedor.modificado');
        this.alertSwal.show();
        this.cargarProveedor(0,0);
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.modificar.proveedor');
        this.alertSwalError.show();
      }
    );
  }

  generarSolicitud(){
    this.proveedor.servidor = this.servidor;
    //console.log(this.FormCrearProv.invalid)
    //return;
    if(!this.validaRut(1))
    {
      this.loading = false;
      return;
    }
    else
    {
      let newRut = this.FormCrearProv.controls['rutprov'].value.replace(/\./g,'').replace(/\-/g, '').trim().toLowerCase();
      let lastDigit = newRut.substr(-1, 1);
      let rutDigit = newRut.substr(0, newRut.length-1);
      this.proveedor.dvrutprov = lastDigit
      this.proveedor.numerorutprov = Number(rutDigit)
      this.proveedor.formapago = Number(this.FormCrearProv.value.mediopago)
      this.proveedor.montominfac = Number(this.proveedor.montominfac)
      this.proveedor.telefono = Number(this.proveedor.telefono)
      this.proveedor.telefono2 = Number(this.proveedor.telefono2)
      this.proveedor.telefono1contac = Number(this.proveedor.telefono1contac)
      this.proveedor.telefono2contac = Number(this.proveedor.telefono2contac)
      this.proveedor.ciudadcodigo = Number(this.FormCrearProv.value.ciudad)
      this.proveedor.comunacodigo = Number(this.FormCrearProv.value.comuna)
      this.proveedor.paiscodigo = Number(this.FormCrearProv.value.pais)
      this.proveedor.regioncodigo = Number(this.FormCrearProv.value.region)
      this.proveedor.provdetalle = this.listado_articulos
      this._proveedor.GrabaNuevoProveedor(this.proveedor).subscribe(
        response => {
          this.alertSwal.title = this.TranslateUtil('key.mensaje.proveedor.creado');
          this.alertSwal.show();
          this.cargarProveedor(0,0);
        },
        error => {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.crear.proveedor');
          this.alertSwalError.show();
        }
      );
    }
  }
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
