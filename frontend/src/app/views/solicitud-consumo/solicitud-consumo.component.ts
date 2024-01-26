import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';

import { EstadoSolicitud } from '../../models/entity/EstadoSolicitud';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { Prioridades } from '../../models/entity/Prioridades';
import { PrioridadesService } from '../../servicios/prioridades.service';
import { EstadoSolicitudBodega } from '../../models/entity/EstadoSolicitudBodega';
import { EstadosolicitudbodegaService } from '../../servicios/estadosolicitudbodega.service';

import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EventosSolicitudComponent } from '../eventos-solicitud/eventos-solicitud.component';
import { EventosDetallesolicitudComponent } from '../eventos-detallesolicitud/eventos-detallesolicitud.component';

import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';

import { SolicitudConsumo } from 'src/app/models/entity/solicitud-consumo';
import { DetalleSolicitudConsumo } from 'src/app/models/entity/detalle-solicitud-consumo';
import { SolicitudConsumoService } from 'src/app/servicios/solicitud-consumo.service';
import { UnidadesOrganizacionalesService } from 'src/app/servicios/unidades-organizacionales.service';
import { BusquedaSolicitudConsumoComponent } from '../busqueda-solicitud-consumo/busqueda-solicitud-consumo.component';
import { UnidadesOrganizacionales } from 'src/app/models/entity/unidades-organizacionales';
import { BusquedaProductosConsumoComponent } from '../busqueda-productos-consumo/busqueda-productos-consumo.component';
import { ProductoConsumo } from 'src/app/models/entity/producto-consumo';
import { BusquedaPlantillaConsumoComponent } from '../busqueda-plantilla-consumo/busqueda-plantilla-consumo.component';
import { PlantillaConsumo } from 'src/app/models/entity/plantilla-consumo';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { RespustaTransaccion } from 'src/app/models/entity/RespuestaTransaccion';
import { element } from 'protractor';
import { InformesService } from 'src/app/servicios/informes.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-solicitud-consumo',
  templateUrl: './solicitud-consumo.component.html',
  styleUrls: ['./solicitud-consumo.component.css'],
  providers: [ InformesService]
})
export class SolicitudConsumoComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos     : Permisosusuario = new Permisosusuario();
  public FormCreaSolicitud  : FormGroup;
  public FormDatosProducto  : FormGroup;
  public estadossolbods     : Array<EstadoSolicitudBodega> = [];
  public estadossolicitudes : Array<EstadoSolicitud> = [];
  public tiposderegistros   : Array<TipoRegistro> = [];
  public prioridades        : Array<Prioridades> = [];
  public ccostosolicitante  : Array<UnidadesOrganizacionales> = [];

  public _SolicitudConsumo    : SolicitudConsumo;   /* Solictud de creación y modificaicíón */
  public grabadetallesolicitud: Array<DetalleSolicitudConsumo> = [];
  public arregloDetalleProductoSolicitudPaginacion: Array<DetalleSolicitudConsumo> = [];
  public arregloDetalleProductoSolicitud: Array<DetalleSolicitudConsumo> = [];
  public arregloDetalleProductoSolicitudPaginacion_aux: Array<DetalleSolicitudConsumo> = [];
  public arregloDetalleProductoSolicitud_aux: Array<DetalleSolicitudConsumo> = [];
  public arregloDetalleProductoSolicitud_2: Array<DetalleSolicitudConsumo> = [];
  public locale     = 'es';
  public bsConfig   : Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';
  public usuario    = environment.privilegios.usuario;
  public servidor   = environment.URLServiciosRest.ambiente;
  public elimininaproductogrilla: boolean = false;
  public existesolicitud: boolean = false;
  public hdgcodigo  : number;
  public esacodigo  : number;
  public cmecodigo  : number;
  public _DetalleSolicitud: DetalleSolicitudConsumo;
  public productoselec: Articulos;
  private _BSModalRef : BsModalRef;
  public BtnSolConsumoGenerSolictud_activado : boolean;
  public activabtnmodificar : boolean = false;
  public activabtncrear     : boolean = false;
  public loading            = false;
  public codprod            = null;
  public activabtneliminar  : boolean = false;
  public desactivabtnelim   :boolean = false;
  public verificanull       = false;
  public vacios             = true;
  public activabtnagregaryplantilla : boolean = false;
  public verificanullmodif  : boolean = false;
  public ActivaBotonLimpiaBusca : boolean = false;
  public ActivaBotonBuscaGrilla : boolean = false;


  // Arreglo para eliminar articulo de la grilla
  public listaDetalleEliminado: Array<DetalleSolicitudConsumo> = [];

  onClose   : any;
  bsModalRef: any;
  editField : any;
  page : number;

  constructor(
    private formBuilder            : FormBuilder,
    private EstadoSolicitudBodegaService: EstadosolicitudbodegaService,
    private PrioridadesService     : PrioridadesService,
    public _BsModalService         : BsModalService,
    public localeService           : BsLocaleService,
    public datePipe                : DatePipe,
    public _solicitudConsumoService: SolicitudConsumoService,
    public _unidadesorganizacionaes: UnidadesOrganizacionalesService,
    public _PlantillaConsumoService: SolicitudConsumoService,
    public _solicitudService       : SolicitudService,
    private _imprimesolicitudService: InformesService,
    public translate: TranslateService
  ) {
    this.FormCreaSolicitud = this.formBuilder.group({
      numsolicitud  : [{ value: null, disabled: false }, Validators.required],
      esticod       : [{ value: 10, disabled: false }, Validators.required],
      hdgcodigo     : [{ value: null, disabled: false }, Validators.required],
      esacodigo     : [{ value: null, disabled: false }, Validators.required],
      cmecodigo     : [{ value: null, disabled: false }, Validators.required],
      prioridad     : [{ value: 1, disabled: false }, Validators.required],
      fecha         : [{ value: new Date(), disabled: true }, Validators.required],
      centrocosto   : [{ value: null, disabled: false }, Validators.required],
      referenciaerp : [{ value: null, disabled: true }, Validators.required],
      estadoerp     : [{ value: null, disabled: true }, Validators.required],
      glosa         : [{ value: null, disabled: false }, Validators.required],
    });

    this.FormDatosProducto = this.formBuilder.group({
      codigo  : [{ value: null, disabled: false }, Validators.required],
      descripcion:[{ value: null, disabled: false }, Validators.required],
      cantidad: [{ value: null, disabled: false }, Validators.required]
    });
  }

  ngOnInit() {

    this.setDate();

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario   = sessionStorage.getItem('Usuario');

    this.FormCreaSolicitud.controls.numsolicitud.disable();
    this.FormCreaSolicitud.controls.esticod.disable();
    this.FormCreaSolicitud.controls.glosa.disable();
    this.PrioridadesService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, sessionStorage.getItem('Usuario'), this.servidor).subscribe(
      data => {
        this.prioridades = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.EstadoSolicitudBodegaService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, sessionStorage.getItem('Usuario'), this.servidor).subscribe(
      data => {
        this.estadossolbods = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.BuscaCentroCostoSolicitante();

    this.BtnSolConsumoGenerSolictud_activado= true;

  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  ActivaGlosa(){
    this.FormCreaSolicitud.controls.glosa.enable();
  }

  BuscaCentroCostoSolicitante() {
    this._unidadesorganizacionaes
      .buscarCentroCosto(
        '',
        0,
        'CCOS',
        '',
        '',
        0,
        this.cmecodigo,
        0,
        0,
        'S',
        sessionStorage.getItem('Usuario'),
        null,
        this.servidor,
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
      )
      .subscribe({
        next: (response) => {
          if (response != null) {
            this.ccostosolicitante = response;
          }
        },
        error: () => {
          alert(this.TranslateUtil('key.mensaje.error.cargar.centro.costos'));
        },
      });
  }


  activaBotonRefrescar(){
    if (this.FormCreaSolicitud.get('numsolicitud').value != null) {
       return (true);
    } else {
       return (false);
    }
 }



  RefrescarPantalla() {
    this.CargarFormSolictudIndividual(this.FormCreaSolicitud.controls.numsolicitud.value);
  }

  CargarFormSolictudIndividual(id_solicitud:number){
    this._solicitudConsumoService.buscarsolicitudconsumo(id_solicitud, this.hdgcodigo, this.esacodigo, this.cmecodigo, 0, 0, 0, 0, 0, 0, "", "", sessionStorage.getItem('Usuario'), this.servidor, "", "","").subscribe(
      respuestasolicitud => {
        this._SolicitudConsumo = respuestasolicitud[0];
        this.FormCreaSolicitud.get('numsolicitud').setValue(this._SolicitudConsumo.id);
        this.FormCreaSolicitud.get('centrocosto').setValue(this._SolicitudConsumo.centrocosto);
        this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._SolicitudConsumo.fechasolicitud, 'dd-MM-yyyy'));
        this.FormCreaSolicitud.get('prioridad').setValue(this._SolicitudConsumo.prioridad);
        this.FormCreaSolicitud.get('referenciaerp').setValue(this._SolicitudConsumo.referenciacontable);
        this.FormCreaSolicitud.get('glosa').setValue(this._SolicitudConsumo.glosa);
        this.FormCreaSolicitud.get('esticod').setValue(this._SolicitudConsumo.estado)
        if(this._SolicitudConsumo.referenciacontable > 0 ){
          this.FormCreaSolicitud.disable();
        }
        this.arregloDetalleProductoSolicitudPaginacion = [];
        this.arregloDetalleProductoSolicitud = [];
        this.arregloDetalleProductoSolicitud_aux = [];
        this.arregloDetalleProductoSolicitudPaginacion_aux = [];

        if(this._SolicitudConsumo.referenciacontable >0){
          // this.FormDatosProducto.controls.codigo.disable();
          this.activabtnagregaryplantilla = false;
          this.ActivaBotonBuscaGrilla = true;
        }else{
          this.FormDatosProducto.controls.codigo.enable();
          this.activabtnagregaryplantilla = true;
        }

        if (this._SolicitudConsumo.detsolicitudconsumo != null) {
          this.arregloDetalleProductoSolicitud = this._SolicitudConsumo.detsolicitudconsumo;
          this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;

          this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
          this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
        }
        this.arregloDetalleProductoSolicitud.forEach(x=>{
          if(this._SolicitudConsumo.referenciacontable == 0){
            if(this._SolicitudConsumo.estado === 80){
              x.bloqcampogrilla = false;
              x.bloqcampogrilla = false;
            }else{
              x.bloqcampogrilla = true;
            }
          }else{
            x.bloqcampogrilla = false;
          }
        });

      if(this._SolicitudConsumo.estado === 80){
        this.FormCreaSolicitud.disable();
        this.FormDatosProducto.disable();
        this.verificanull = false;
        this.activabtnagregaryplantilla = false;
        this.desactivabtnelim = false;
        this.  ActivaBotonBuscaGrilla = false;
      }
    });
  }


  BuscarSolicitudesConsumo() {
    this._BSModalRef = this._BsModalService.show(BusquedaSolicitudConsumoComponent, this.setModalBusquedaSolicitud());
    this._BSModalRef.content.onClose.subscribe((response: SolicitudConsumo) => {
      if (response != undefined) {

        this.CargarFormSolictudIndividual(response.id);

        this.existesolicitud = true;
        this.activabtnmodificar = true;
        this.activabtncrear = false;
        this.arregloDetalleProductoSolicitudPaginacion = [];
        this.arregloDetalleProductoSolicitud = [];
        this.verificanull = false;
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
        usuario  : this.usuario
      }
    };
    return dtModal;
  }


  addArticuloGrilla() {
    this.alertSwalAlert.title = null;
    this._BSModalRef = this._BsModalService.show(BusquedaProductosConsumoComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: ProductoConsumo) => {
      if (response == undefined) { }
      else {

        const DetalleMovimiento = new (DetalleSolicitudConsumo);
        if (this.FormCreaSolicitud.value.numsolicitud == null) {
          DetalleMovimiento.id = 0;
        } else {
          DetalleMovimiento.id = this.FormCreaSolicitud.value.numsolicitud;
        }

        this.arregloDetalleProductoSolicitud_aux = [];
        this.arregloDetalleProductoSolicitudPaginacion_aux = [];

        this.activabtneliminar = true;
        DetalleMovimiento.iddetalle = 0;
        DetalleMovimiento.servidor = this.servidor;
        DetalleMovimiento.usuario = sessionStorage.getItem('Usuario');
        DetalleMovimiento.centrocosto = this.FormCreaSolicitud.value.ccosto;
        DetalleMovimiento.codigoproducto = response.prodcodigo;
        DetalleMovimiento.cantidadsolicitada = 0;
        DetalleMovimiento.cantidadrecepcionada = 0;
        DetalleMovimiento.referenciacontable = 0;
        DetalleMovimiento.operacioncontable = 0;
        DetalleMovimiento.estado = 10;
        DetalleMovimiento.prioridad = 0;
        DetalleMovimiento.usuariosolicita = sessionStorage.getItem('Usuario');
        DetalleMovimiento.servidor = this.servidor;
        DetalleMovimiento.usuarioautoriza = '';
        DetalleMovimiento.accion = "I";
        DetalleMovimiento.glosaproducto = response.proddescripcion;
        DetalleMovimiento.glosaunidadconsumo = response.glosaunidadconsumo;
        DetalleMovimiento.idproducto = response.prodid;
        DetalleMovimiento.bloqcampogrilla = true;

        if (this.activabtnmodificar == true) {
          this.activabtncrear = false;
          this.activabtnmodificar = true
        }else{
          this.activabtnmodificar = false;
          this.activabtncrear = true;
        }

        const indx = this.arregloDetalleProductoSolicitud.findIndex(x => x.codigoproducto === DetalleMovimiento.codigoproducto, 1);
        if (indx >= 0) {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
          this.alertSwalError.show();

        }else{
          this.arregloDetalleProductoSolicitud.unshift(DetalleMovimiento);
          this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;

          this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
          this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
        }
        this.FormDatosProducto.reset();
        this.ActivaBotonBuscaGrilla = true;
        this.logicaVacios();
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
        titulo: this.TranslateUtil('key.title.busqueda.productos.consumo'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Insumos_No_Medicos',
        codprod: this.FormDatosProducto.controls.codigo.value,
        descprod: this.FormDatosProducto.controls.descripcion.value
      }
    };
    return dtModal;
  }

  cambio_cantidad(id: number, property: string, registro: DetalleSolicitudConsumo) {

    if (this.arregloDetalleProductoSolicitudPaginacion[id]["iddetalle"] == 0) {
      this.arregloDetalleProductoSolicitudPaginacion[id]["accion"] = "I";
    }
    if (this.arregloDetalleProductoSolicitudPaginacion[id]["iddetalle"] > 0) {
      this.arregloDetalleProductoSolicitudPaginacion[id]["accion"] = "M";
    }

    this.arregloDetalleProductoSolicitud[id][property] = this.arregloDetalleProductoSolicitudPaginacion[id][property];
  }

  validacantidadgrilla(despacho: DetalleSolicitudConsumo){
    var idg =0;

      if(this.IdgrillaDespacho(despacho)>=0){
        idg = this.IdgrillaDespacho(despacho)
          if(this.arregloDetalleProductoSolicitud[idg].cantidadsolicitada <0){
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.cero');
            this.alertSwalAlert.show();
            this.arregloDetalleProductoSolicitud[idg].cantidadsolicitada = 0;
            this.arregloDetalleProductoSolicitudPaginacion[idg].cantidadsolicitada = this.arregloDetalleProductoSolicitud[idg].cantidadsolicitada;
          }
      }
      if(this.FormCreaSolicitud.controls.numsolicitud.value >0){
        this.logicaVaciosModif();
      }else{
        this.logicaVacios();
      }
  }

  IdgrillaDespacho(registro: DetalleSolicitudConsumo) {

    let indice = 0;
    for (const articulo of this.arregloDetalleProductoSolicitud) {
      if (registro.codigoproducto === articulo.codigoproducto) {

        return indice;
      }
      indice++;
    }
    return -1;
  }


  updateList(id: number, property: string, event: any) {
    const editField = event.target.textContent;

    this.arregloDetalleProductoSolicitudPaginacion[id][property] = parseInt(editField);
    this.arregloDetalleProductoSolicitud[id][property] = this.arregloDetalleProductoSolicitudPaginacion[id][property]
  }

  limpiar() {
    this.FormCreaSolicitud.reset();
    this.arregloDetalleProductoSolicitudPaginacion = [];
    this.arregloDetalleProductoSolicitud = [];
    this.FormCreaSolicitud.get('fecha').setValue(new Date());
    this.existesolicitud = false;
    this.FormCreaSolicitud.get('prioridad').setValue(1);
    this.FormCreaSolicitud.get('esticod').setValue(10);
    this.activabtnmodificar = false;
    this.activabtnmodificar = false;
    this.codprod = null;
    this.FormDatosProducto.reset();
    this.desactivabtnelim = false;
    this.verificanull = false;
    this.FormDatosProducto.controls.codigo.enable();
    this.FormCreaSolicitud.controls.glosa.disable();
    this.ActivaBotonAgregar();
    this.activabtnagregaryplantilla = false;
    this.verificanullmodif = false;
    this.arregloDetalleProductoSolicitud_aux = [];
    this.arregloDetalleProductoSolicitudPaginacion_aux = [];
    this.ActivaBotonBuscaGrilla = false;
    this.page = 1;

  }

  ConfirmaEliminaProductoDeLaGrilla(registro: DetalleSolicitudConsumo, id: number) {
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
        this.EliminaProductoDeLaGrilla(registro, id);
      }
    })
  }

  EliminaProductoDeLaGrilla(registro: DetalleSolicitudConsumo, id: number) {

    if (registro.accion == "I" && id >= 0 && registro.id == 0) {
      // Eliminar registro nuevo la grilla
      this.arregloDetalleProductoSolicitud.splice(id, 1);
      this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;
    } else {
      // elimina uno que ya existe
      registro.servidor = this.servidor;
      registro.usuario = sessionStorage.getItem('Usuario');
      this._solicitudConsumoService.eliminardetallearticulosolicitudconsumo(registro).subscribe(
        response => {
          this._solicitudConsumoService.buscarsolicitudconsumo(registro.id, this.hdgcodigo, this.esacodigo, this.cmecodigo, 0, 0, 0, 0, 0, 0, "", "", this.usuario, this.servidor, "", "","").subscribe(
            respuestasolicitud => {
              if (respuestasolicitud != null) {
                this._SolicitudConsumo = respuestasolicitud[0];
                this.FormCreaSolicitud.get('numsolicitud').setValue(this._SolicitudConsumo.id);
                this.FormCreaSolicitud.get('centrocosto').setValue(this._SolicitudConsumo.centrocosto);
                this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._SolicitudConsumo.fechasolicitud, 'dd-MM-yyyy'));
                this.FormCreaSolicitud.get('prioridad').setValue(this._SolicitudConsumo.estado);
                this.FormCreaSolicitud.get('referenciaerp').setValue(this._SolicitudConsumo.referenciacontable);
                this.FormCreaSolicitud.get('glosa').setValue(this._SolicitudConsumo.glosa);

                this.arregloDetalleProductoSolicitudPaginacion = [];
                this.arregloDetalleProductoSolicitud = [];
                this.arregloDetalleProductoSolicitud_aux = [];
                this.arregloDetalleProductoSolicitudPaginacion_aux = [];

                if (this._SolicitudConsumo.detsolicitudconsumo != null) {
                  this.arregloDetalleProductoSolicitud = this._SolicitudConsumo.detsolicitudconsumo;
                  this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;

                  this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
                  this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
                }
              }
            },
            error => {
              console.log("Error :", error)
            }
          );
          this.alertSwal.title = this.TranslateUtil('key.mensaje.eliminacion.producto.realizado.exito');
          this.alertSwal.show();
        },
        error => {
          console.log("Error :", error)
        }
      )

    }
  }

  ConfirmaGenerarSolicitud() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.generar.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.creacion.solicitud'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.generarSolicitud();
      }
    })
  }

  generarSolicitud() {
    this._SolicitudConsumo = new SolicitudConsumo();
    this._SolicitudConsumo.fechasolicitud = this.datePipe.transform(this.FormCreaSolicitud.value.fecha, 'yyyy-MM-dd');
    this._SolicitudConsumo.id = 0;
    this._SolicitudConsumo.glosa = this.FormCreaSolicitud.value.glosa;
    this._SolicitudConsumo.hdgcodigo = this.hdgcodigo;
    this._SolicitudConsumo.esacodigo = this.esacodigo;
    this._SolicitudConsumo.cmecodigo = this.cmecodigo;
    this._SolicitudConsumo.centrocosto = this.FormCreaSolicitud.value.centrocosto;
    this._SolicitudConsumo.idpresupuesto = 0;
    this._SolicitudConsumo.referenciacontable = 0;
    this._SolicitudConsumo.operacioncontable = 0;
    this._SolicitudConsumo.estado = this.FormCreaSolicitud.controls.esticod.value;
    this._SolicitudConsumo.accion = "I";
    this._SolicitudConsumo.prioridad = this.FormCreaSolicitud.value.prioridad;
    this._SolicitudConsumo.usuariosolicita = sessionStorage.getItem('Usuario');
    this._SolicitudConsumo.usuarioautoriza = '';
    this._SolicitudConsumo.usuario = sessionStorage.getItem('Usuario');
    this._SolicitudConsumo.servidor = this.servidor;

    this._SolicitudConsumo.detsolicitudconsumo = this.arregloDetalleProductoSolicitud;
    this._solicitudConsumoService.grabarsolicitudconsumo(this._SolicitudConsumo).subscribe(
      response => {
        if (response != null) {
          this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.creada')+" N°:".concat(response.id);
          this.alertSwal.show();
          this._solicitudConsumoService.buscarsolicitudconsumo(response.id, this.hdgcodigo, this.esacodigo, this.cmecodigo, 0, 0, 0, 0, 0, 0, "", "", this.usuario, this.servidor, "", "", "").subscribe(
            respuestasolicitud => {
              if (respuestasolicitud != null) {
                this.limpiar();
                this._SolicitudConsumo = respuestasolicitud[0];
                this.FormCreaSolicitud.get('numsolicitud').setValue(this._SolicitudConsumo.id);
                this.FormCreaSolicitud.get('centrocosto').setValue(this._SolicitudConsumo.centrocosto);
                this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._SolicitudConsumo.fechasolicitud, 'dd-MM-yyyy'));
                this.FormCreaSolicitud.get('prioridad').setValue(this._SolicitudConsumo.prioridad);
                this.FormCreaSolicitud.get('referenciaerp').setValue(this._SolicitudConsumo.referenciacontable);
                this.FormCreaSolicitud.get('glosa').setValue(this._SolicitudConsumo.glosa);
                this.FormCreaSolicitud.get('esticod').setValue(this._SolicitudConsumo.estado);
                this.activabtnmodificar = true;
                this.activabtncrear = false;
                this.verificanull = false
                this.arregloDetalleProductoSolicitudPaginacion = [];
                this.arregloDetalleProductoSolicitud = [];
                this.arregloDetalleProductoSolicitud_aux = [];
                this.arregloDetalleProductoSolicitudPaginacion_aux = [];

                if (this._SolicitudConsumo.detsolicitudconsumo != null) {
                  this.arregloDetalleProductoSolicitud = this._SolicitudConsumo.detsolicitudconsumo;
                  this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;

                  this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
                  this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
                }
                this.arregloDetalleProductoSolicitud.forEach(x=>{
                  if(this._SolicitudConsumo.referenciacontable ==0){
                    x.bloqcampogrilla = true;
                  }else{
                    x.bloqcampogrilla = false;
                  }
                });
              }
            },
            error => { });
          }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.solicitud');
        this.alertSwalError.show();
      }
    );
    this.sleep(2000);
  }

  sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  ConfirmaModificarSolicitud() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.modificar.solicitud.consumo'),
      text: this.TranslateUtil('key.mensaje.confirmar.modificacion.solicitud'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ModificarSolicitud("M");
      }
    })
  }

  ModificarSolicitud(Accion: String) {
    /* Si se modifica _Solictud ya contiene la información original */
    /* vienen seteadas en el ambiente */
    var fechaactual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    /* Sólo se setean los valores posoble de actualizar de la cabecera */

    this._SolicitudConsumo.estado = this.FormCreaSolicitud.controls.esticod.value;
    this._SolicitudConsumo.glosa = this.FormCreaSolicitud.value.glosa;
    this._SolicitudConsumo.prioridad = this.FormCreaSolicitud.value.prioridad;
    this._SolicitudConsumo.centrocosto = this.FormCreaSolicitud.value.centrocosto;
    this._SolicitudConsumo.servidor = this.servidor
    this._SolicitudConsumo.usuario = sessionStorage.getItem('Usuario');

    if (Accion == 'M') {
      this._SolicitudConsumo.accion = "M";
    }

    /* Detalle de solicitu, solo viaja la modificada y eliminada */
    this.grabadetallesolicitud = [];

    this.arregloDetalleProductoSolicitud.forEach(element => {
      var _detalleSolicitud = new DetalleSolicitudConsumo;

      _detalleSolicitud = element;

      if (element.accion == 'M') {
        _detalleSolicitud.glosaproducto = element.glosaproducto;
        _detalleSolicitud.idproducto = element.idproducto;
        _detalleSolicitud.codigoproducto = element.codigoproducto;
        _detalleSolicitud.accion = 'M';
        _detalleSolicitud.cantidadsolicitada = element.cantidadsolicitada;
        this.grabadetallesolicitud.unshift(_detalleSolicitud);
      }

      if (element.accion == 'I') {
        _detalleSolicitud.glosaproducto = element.glosaproducto;
        _detalleSolicitud.idproducto = element.idproducto;
        _detalleSolicitud.codigoproducto = element.codigoproducto;
        _detalleSolicitud.accion = 'I';
        _detalleSolicitud.cantidadsolicitada = element.cantidadsolicitada;
        this.grabadetallesolicitud.unshift(_detalleSolicitud);
      }


    });

    this._SolicitudConsumo.detsolicitudconsumo = this.grabadetallesolicitud;

    this._solicitudConsumoService.grabarsolicitudconsumo(this._SolicitudConsumo).subscribe(
      response => {
        if (response != null) {
          this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.modificada')+" N°:".concat(response.id);
          this.alertSwal.show();

          this._solicitudConsumoService.buscarsolicitudconsumo(response.id, this.hdgcodigo, this.esacodigo, this.cmecodigo, 0, 0, 0, 0, 0, 0, "", "", sessionStorage.getItem('Usuario'), this.servidor, "", "", "").subscribe(
            respuestasolicitud => {
              if (respuestasolicitud != null) {
                this._SolicitudConsumo = respuestasolicitud[0];
                this.FormCreaSolicitud.get('numsolicitud').setValue(this._SolicitudConsumo.id);
                this.FormCreaSolicitud.get('centrocosto').setValue(this._SolicitudConsumo.centrocosto);
                this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._SolicitudConsumo.fechasolicitud, 'dd-MM-yyyy'));
                this.FormCreaSolicitud.get('prioridad').setValue(this._SolicitudConsumo.prioridad);
                this.FormCreaSolicitud.get('referenciaerp').setValue(this._SolicitudConsumo.referenciacontable);
                this.FormCreaSolicitud.get('glosa').setValue(this._SolicitudConsumo.glosa);


                this.arregloDetalleProductoSolicitudPaginacion = [];
                this.arregloDetalleProductoSolicitud = [];
                this.arregloDetalleProductoSolicitud_aux = [];
                this.arregloDetalleProductoSolicitudPaginacion_aux = [];

                if (this._SolicitudConsumo.detsolicitudconsumo != null) {
                  this.arregloDetalleProductoSolicitud = this._SolicitudConsumo.detsolicitudconsumo;
                  this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;

                  this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
                  this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
                }
              }
            },
            error => { });
          }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.solicitud');
        this.alertSwalError.show();
      }
    );

  }


  ConfirmaEliminarSolicitud() {
    // sE CONFIRMA Eliminar Solicitud
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.eliminar.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion.solicitud'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.EliminarSolicitud();
      }
    })
  }

  EliminarSolicitud() {
    var numsolic = this._SolicitudConsumo.id;
    if (this.FormCreaSolicitud.value.referenciaerp == null || this.FormCreaSolicitud.value.referenciaerp == 0) {

      this._SolicitudConsumo = new (SolicitudConsumo);
      this._SolicitudConsumo.usuario = sessionStorage.getItem('Usuario');
      this._SolicitudConsumo.servidor = this.servidor;
      this._SolicitudConsumo.id = numsolic;
      this._solicitudConsumoService.eliminarsolicitudconsumo(this._SolicitudConsumo).subscribe(
        response => {
          if (response != null) {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.solicitud.eliminada')+" N°:".concat(response.id);
            this.alertSwal.show();
            this.limpiar();
          }
        },
        error => {
          this.alertSwal.title = this.TranslateUtil('key.mensaje.error.no.elimino.solicitud')+" N°:".concat(this.FormCreaSolicitud.value.numsolicitud);
          this.alertSwal.show();
          console.log("Error :", error)
        }
      );
    } else {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.no.puede.eliminar.solicitud.erp');
      this.alertSwalError.show();

    }

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
        _SolicitudConsumo: this._SolicitudConsumo,
        _DetalleSolicitud: this._DetalleSolicitud,
      }
    };
    return dtModal;
  }

  eventosDetalleSolicitud(registroDetalle: DetalleSolicitudConsumo) {
    this._DetalleSolicitud = new (DetalleSolicitudConsumo);
    this._DetalleSolicitud = registroDetalle;

    this._BSModalRef = this._BsModalService.show(EventosDetallesolicitudComponent, this.setModalEventoDetalleSolicitud());
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
        _SolicitudConsumo: this._SolicitudConsumo,
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

  setModalMensajeExitoEliminar(numerotransaccion: number, titulo: string, mensaje: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-m',
      initialState: {
        titulo: 'titulo', // Parametro para de la otra pantalla
        mensaje: 'mensaje',
        informacion: this.TranslateUtil('key.mensaje.solicitud.eliminada.es'),
        mostrarnumero: numerotransaccion,
        estado: 'CANCELADO',
      }
    };
    return dtModal;
  }

  setModalMensajeErrorEliminar() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-m',
      initialState: {
        titulo: this.TranslateUtil('key.title.eliminar.solicitud'), // Parametro para de la otra pantalla
        mensaje: this.TranslateUtil('key.mensaje.solicitud.no.pudo.ser.eliminada'),
        informacion: this.TranslateUtil('key.mensaje.intente.nuevamente'),
        estado: 'CANCELADO',
      }
    };
    return dtModal;
  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
  }

  onImprimir() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.imprimir.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.busqueda'),
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


  BuscarPlantillaSolicitudes() {
    this._BSModalRef = this._BsModalService.show(BusquedaPlantillaConsumoComponent, this.setModalBusquedaPlantilla());
    this._BSModalRef.content.onClose.subscribe((response: PlantillaConsumo) => {
      if (response != undefined) {
        this._PlantillaConsumoService.buscarplantillaconsumo(response.id, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, 0, 0, 0, 0, sessionStorage.getItem('Usuario'), this.servidor,'').subscribe(
          response_plantilla => {
            if (response_plantilla.length != 0) {
              this.existesolicitud = false;
              this.activabtnmodificar = false;
              this.activabtncrear = true;
              this._SolicitudConsumo = new (SolicitudConsumo);
              this._SolicitudConsumo.accion = 'I';
              //this._SolicitudConsumo.id         =  0;
              this._SolicitudConsumo.hdgcodigo = this.hdgcodigo;
              this._SolicitudConsumo.esacodigo = this.esacodigo;
              this._SolicitudConsumo.cmecodigo = this.cmecodigo;
              this._SolicitudConsumo.centrocosto = response.centrocosto;
              this._SolicitudConsumo.idpresupuesto = response.idpresupuesto;
              this._SolicitudConsumo.glosa = response.glosa;
              this._SolicitudConsumo.referenciacontable = response.referenciacontable;
              this._SolicitudConsumo.operacioncontable = response.operacioncontable;
              this._SolicitudConsumo.estado = response.estado;
              this._SolicitudConsumo.usuariosolicita = sessionStorage.getItem('Usuario');
              this._SolicitudConsumo.detsolicitudconsumo = [];
              this._SolicitudConsumo.usuario = sessionStorage.getItem('Usuario');
              this._SolicitudConsumo.servidor = this.servidor;
              response_plantilla[0].detplantillaconsumo.forEach(element=>{
                const indx = this.arregloDetalleProductoSolicitud.findIndex(x => x.codigoproducto === element.codigoproducto, 1);
                if(indx >=0){
                }else{
                  var insertaDetalleSolicitud = new (DetalleSolicitudConsumo)
                  insertaDetalleSolicitud.accion = "I";
                  insertaDetalleSolicitud.iddetalle = 0;
                  insertaDetalleSolicitud.id = 0;
                  insertaDetalleSolicitud.centrocosto = element.centrocosto;
                  insertaDetalleSolicitud.idpresupuesto = element.idpresupuesto;
                  insertaDetalleSolicitud.idproducto = element.idproducto;
                  insertaDetalleSolicitud.codigoproducto = element.codigoproducto;
                  insertaDetalleSolicitud.glosaproducto = element.glosaproducto;
                  insertaDetalleSolicitud.cantidadsolicitada = 0;// element.cantidadsolicitada;
                  insertaDetalleSolicitud.cantidadrecepcionada = 0;
                  insertaDetalleSolicitud.referenciacontable = element.referenciacontable;
                  insertaDetalleSolicitud.operacioncontable = element.operacioncontable;
                  insertaDetalleSolicitud.estado = 1;
                  insertaDetalleSolicitud.prioridad = 1;
                  insertaDetalleSolicitud.usuariosolicita = sessionStorage.getItem('Usuario');
                  insertaDetalleSolicitud.usuarioautoriza = " ";
                  insertaDetalleSolicitud.usuario = sessionStorage.getItem('Usuario');
                  insertaDetalleSolicitud.servidor = this.servidor;
                  insertaDetalleSolicitud.glosaunidadconsumo = element.glosaunidadconsumo;
                  insertaDetalleSolicitud.bloqcampogrilla = true;

                  this.arregloDetalleProductoSolicitud.push(insertaDetalleSolicitud);
                // })
                }
              });

              //this.FormCreaSolicitud.get('numsolicitud').setValue(this._SolicitudConsumo.id);
              this.FormCreaSolicitud.get('centrocosto').setValue(this._SolicitudConsumo.centrocosto);
              //this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._SolicitudConsumo.fechasolicitud, 'dd-MM-yyyy'));
              // this.FormCreaSolicitud.get('prioridad').setValue(this._SolicitudConsumo.prioridad);
              this.FormCreaSolicitud.get('referenciaerp').setValue(this._SolicitudConsumo.referenciacontable);
              this.FormCreaSolicitud.get('glosa').setValue(this._SolicitudConsumo.glosa);
              this.FormCreaSolicitud.get('fecha').setValue(new Date());
              // this.FormCreaSolicitud.get('esticod').setValue(this._SolicitudConsumo.estado);

              this.activabtnagregaryplantilla = true;
              this.arregloDetalleProductoSolicitudPaginacion = [];
              // this.arregloDetalleProductoSolicitud = [];
              this.arregloDetalleProductoSolicitud_aux = [];
              this.arregloDetalleProductoSolicitudPaginacion_aux = [];

              // this.arregloDetalleProductoSolicitud = this._SolicitudConsumo.detsolicitudconsumo;
              this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud

              this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
              this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
            }
            // }
          });
      }this.logicaVacios();
    });

  }

  setModalBusquedaPlantilla() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.plantilla.consumos'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
      }
    };
    return dtModal;
  }

  ImprimirSolicitud() {
    var solicitud : number = this.FormCreaSolicitud.controls.numsolicitud.value;
    var usuario : string = this.usuario;
    this._imprimesolicitudService.RPTImprimeSolicitudConsumo(this.servidor,this.hdgcodigo,this.esacodigo,
      this.cmecodigo,"pdf",usuario,solicitud).subscribe(
        response => {
          if (response != null) {
            window.open(response[0].url, "", "");
          }
        },
    error => {
      console.log(error);
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.devolucion.solicitud');
      this.alertSwalError.show();
      this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
      });
    });
  }

  ActivarBotonGuardar(){
    if (this.FormCreaSolicitud.get('numsolicitud').value == null
      && this.FormCreaSolicitud.get('esticod').value != null
      && this.FormCreaSolicitud.get('prioridad').value != null
      && this.FormCreaSolicitud.get('centrocosto').value != null
      && this.FormCreaSolicitud.get('glosa').value != null
      && this.arregloDetalleProductoSolicitud.length >0
    ) {
      return true
    } else {
      return false
    }
  }


  ActivarBotonModificar(){

    if (this.FormCreaSolicitud.get('numsolicitud').value != null
      && this.FormCreaSolicitud.get('esticod').value != null
      && this.FormCreaSolicitud.get('prioridad').value != null
      && this.FormCreaSolicitud.get('centrocosto').value != null
      && this.FormCreaSolicitud.get('glosa').value != null
      && this.arregloDetalleProductoSolicitud.length >0
      && this.FormCreaSolicitud.get('referenciaerp').value == 0
      && this.FormCreaSolicitud.get('esticod').value != 80
    ) {
      return true

    } else {
      return false
    }

  }

  ActivaBotonAgregar(){

    if(this.FormCreaSolicitud.controls.glosa.value == "" || this.FormCreaSolicitud.controls.glosa.value == null){
      this.activabtnagregaryplantilla = false;

    }else{
      this.activabtnagregaryplantilla = true;

    }
  }

  ActivarBotonEliminar(){

  }

  ActivarEstadoSolicitud(){

  }

  ActivarPrioridad() {

  }


  ActivarCentroCosto(){

  }

  ActivarGlosa(){

  }

  getProducto() {
    this.codprod = this.FormDatosProducto.value.codigo;
    if (this.codprod === null || this.codprod === '') {
      this.addArticuloGrilla();
    } else {
      this.loading = true;
      const tipodeproducto = 'MIM';
      const controlado = '';
      const controlminimo = '';
      const idBodega = 0;
      const consignacion = '';
      this._solicitudConsumoService.buscarproductosconsumo(0,  this.hdgcodigo, this.esacodigo,this.cmecodigo,
        this.codprod,null,0,0, this.usuario, this.servidor
        ).subscribe(
          response => {
            if (response != null) {
              if (!response.length) {
                this.loading = false;
              } else {
                if (response.length) {
                  if(response.length>1){
                    this.addArticuloGrilla();
                  }else{
                    if(response.length === 1){
                      const DetalleMovimiento = new (DetalleSolicitudConsumo);
                      if (this.FormCreaSolicitud.value.numsolicitud == null) {
                        DetalleMovimiento.id = 0;
                      } else {
                        DetalleMovimiento.id = this.FormCreaSolicitud.value.numsolicitud;
                      }
                      this.activabtneliminar = true;
                      DetalleMovimiento.iddetalle = 0;
                      DetalleMovimiento.servidor = this.servidor;
                      DetalleMovimiento.usuario = sessionStorage.getItem('Usuario');
                      DetalleMovimiento.centrocosto = this.FormCreaSolicitud.value.ccosto;
                      DetalleMovimiento.codigoproducto = response[0].prodcodigo;
                      DetalleMovimiento.cantidadsolicitada = 0;
                      DetalleMovimiento.cantidadrecepcionada = 0;
                      DetalleMovimiento.referenciacontable = 0;
                      DetalleMovimiento.operacioncontable = 0;
                      DetalleMovimiento.estado = 10;
                      DetalleMovimiento.prioridad = 0;
                      DetalleMovimiento.usuariosolicita = sessionStorage.getItem('Usuario');
                      DetalleMovimiento.servidor = this.servidor;
                      DetalleMovimiento.usuarioautoriza = '';
                      DetalleMovimiento.accion = "I";
                      DetalleMovimiento.glosaproducto = response[0].proddescripcion;
                      DetalleMovimiento.glosaunidadconsumo = response[0].glosaunidadconsumo;
                      DetalleMovimiento.idproducto = response[0].prodid;
                      DetalleMovimiento.bloqcampogrilla = true;

                      if (this.activabtnmodificar == true) {
                        this.activabtncrear = false;
                        this.activabtnmodificar = true;
                      }else{
                        this.activabtnmodificar = false;
                        this.activabtncrear = true;
                      }
                      this.arregloDetalleProductoSolicitud_aux = [];
                      this.arregloDetalleProductoSolicitudPaginacion_aux = [];

                      const indx = this.arregloDetalleProductoSolicitud.findIndex(x => x.codigoproducto === DetalleMovimiento.codigoproducto, 1);
                      if (indx >= 0) {
                        this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                        this.alertSwalError.show();

                      }else{
                        this.arregloDetalleProductoSolicitud.unshift(DetalleMovimiento);
                        this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud

                        this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
                        this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
                      }
                      this.FormDatosProducto.reset();
                      this.ActivaBotonBuscaGrilla = true;
                      this.logicaVacios();
                    }
                  }
                }
              }
            }
            this.loading = false;
          },
          error => {
            this.loading = false;
            this.alertSwalError.title = "Error: ";
            this.alertSwalError.text = error.message;
            this.alertSwalError.show();
          }
        );

    }
  }

  async CambioCheck(registro: DetalleSolicitudConsumo,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      this.listaDetalleEliminado.unshift(registro);
     }else{
      var i = this.listaDetalleEliminado.indexOf( registro );
      if ( i !== -1 ) {
        this.listaDetalleEliminado.splice( i, 1 );
      }
    }

    // if(event.target.checked){
    //   registro.marcacheckgrilla = true;
    //   this.desactivabtnelim = true;
    //   await this.isEliminaInsGrilla(registro)
    //   await this.arregloDetalleProductoSolicitud.forEach(d=>{
    //     if(d.marcacheckgrilla === true){
    //       this.desactivabtnelim = true;
    //     }
    //   });
    // }else{
    //   registro.marcacheckgrilla = false;
    //   this.desactivabtnelim = false;
    //   await this.isEliminaInsGrilla(registro);
    //   await this.arregloDetalleProductoSolicitud.forEach(d=>{
    //     if(d.marcacheckgrilla === true){
    //       this.desactivabtnelim = true;
    //     }
    //   });
    // }
  }

  isEliminaInsGrilla(registro: DetalleSolicitudConsumo) {

    let indice = 0;
    for (const articulo of this.arregloDetalleProductoSolicitud) {
      if (registro.codigoproducto === articulo.codigoproducto && registro.iddetalle === articulo.iddetalle) {
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
        var i = this.arregloDetalleProductoSolicitud.indexOf( element );
        if ( i !== -1 ) {
          if (element.iddetalle > 0) {
            this.EliminarArticulo(element);
          } else {
            this.arregloDetalleProductoSolicitud.splice( i, 1 );
            this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;
            this.logicaVacios();
          }
        }
      }
    }
  }

  async EliminarArticulo(dat: DetalleSolicitudConsumo){
    dat.servidor = this.servidor;
    dat.usuario = sessionStorage.getItem('Usuario');
    const response = await this._solicitudConsumoService.eliminardetallearticulosolicitudconsumo(dat).toPromise();
    const respuestasolicitud = await this._solicitudConsumoService.buscarsolicitudconsumo(dat.id, this.hdgcodigo, this.esacodigo, this.cmecodigo, 0, 0, 0, 0, 0, 0, "", "", this.usuario, this.servidor, "", "", "").toPromise();
    if (response != null) {
      this._SolicitudConsumo = respuestasolicitud[0];
      this.FormCreaSolicitud.get('numsolicitud').setValue(this._SolicitudConsumo.id);
      this.FormCreaSolicitud.get('centrocosto').setValue(this._SolicitudConsumo.centrocosto);
      this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._SolicitudConsumo.fechasolicitud, 'dd-MM-yyyy'));
      this.FormCreaSolicitud.get('prioridad').setValue(this._SolicitudConsumo.estado);
      this.FormCreaSolicitud.get('referenciaerp').setValue(this._SolicitudConsumo.referenciacontable);
      this.FormCreaSolicitud.get('glosa').setValue(this._SolicitudConsumo.glosa);
      this.arregloDetalleProductoSolicitudPaginacion = [];
      this.arregloDetalleProductoSolicitud = [];
      this.arregloDetalleProductoSolicitud_aux = [];
      this.arregloDetalleProductoSolicitudPaginacion_aux = [];

      if (this._SolicitudConsumo.detsolicitudconsumo != null) {
        this.arregloDetalleProductoSolicitud = this._SolicitudConsumo.detsolicitudconsumo;
        this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;

        this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
        this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
      }
    }
    this.alertSwal.title = this.TranslateUtil('key.mensaje.eliminacion.producto.exito');
    this.alertSwal.show();
  }

  isEliminaMed(registro: DetalleSolicitudConsumo) {
    let indice = 0;
    for (const articulo of this.arregloDetalleProductoSolicitud) {
      if (registro.codigoproducto === articulo.codigoproducto) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

  async logicaVacios() {
    this.vaciosProductos();
    if (this.vacios === true) {
      this.verificanull = false;
    }
    else {
      this.verificanull = true;
    }
  }

  vaciosProductos() {
    if (this.arregloDetalleProductoSolicitudPaginacion.length) {
      for (var data of this.arregloDetalleProductoSolicitudPaginacion) {
        if (data.cantidadsolicitada <= 0 || data.cantidadsolicitada === null) {
          this.vacios = true;
          return;
        } else {
          this.vacios = false;
        }
      }
    }else{
      this.vacios = true;
    }
  }

  async logicaVaciosModif() {
    this.vaciosProductosModif();
    if (this.vacios === true) {
      this.verificanullmodif = false;
    }
    else {
      this.verificanullmodif = true;
    }
  }

  vaciosProductosModif() {
    if (this.arregloDetalleProductoSolicitudPaginacion.length) {
      for (var data of this.arregloDetalleProductoSolicitudPaginacion) {
        if (data.cantidadsolicitada <= 0 || data.cantidadsolicitada === null) {
          this.vacios = true;
          return;
        } else {
          this.vacios = false;
        }
      }
    }else{
      this.vacios = true;
    }
  }

  async findArticuloGrilla() {
    this.loading = true;
    if ( this.FormDatosProducto.controls.codigo.touched &&
        this.FormDatosProducto.controls.codigo.status !== 'INVALID') {
        var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
      if(this.FormCreaSolicitud.controls.numsolicitud.value >0){
        this._solicitudConsumoService.buscarsolicitudconsumo(this.FormCreaSolicitud.controls.numsolicitud.value,
          this.hdgcodigo, this.esacodigo, this.cmecodigo, 0, 0, 0, 0, 0, 0, "", "", sessionStorage.getItem('Usuario'),
          this.servidor, "", "",codProdAux).subscribe(
          respuestasolicitud => {
            this._SolicitudConsumo = respuestasolicitud[0];
            this.FormCreaSolicitud.get('numsolicitud').setValue(this._SolicitudConsumo.id);
            this.FormCreaSolicitud.get('centrocosto').setValue(this._SolicitudConsumo.centrocosto);
            this.FormCreaSolicitud.get('fecha').setValue(this.datePipe.transform(this._SolicitudConsumo.fechasolicitud, 'dd-MM-yyyy'));
            this.FormCreaSolicitud.get('prioridad').setValue(this._SolicitudConsumo.prioridad);
            this.FormCreaSolicitud.get('referenciaerp').setValue(this._SolicitudConsumo.referenciacontable);
            this.FormCreaSolicitud.get('glosa').setValue(this._SolicitudConsumo.glosa);
            this.FormCreaSolicitud.get('esticod').setValue(this._SolicitudConsumo.estado)

            this.arregloDetalleProductoSolicitudPaginacion = [];
            this.arregloDetalleProductoSolicitud = [];

            if(this._SolicitudConsumo.referenciacontable >0){
              this.activabtnagregaryplantilla = false;
              this.ActivaBotonBuscaGrilla = true;
              this.ActivaBotonLimpiaBusca = true;
            }else{
              this.FormDatosProducto.controls.codigo.enable();
              this.activabtnagregaryplantilla = true;
              this.ActivaBotonBuscaGrilla = true;
              this.ActivaBotonLimpiaBusca = true;
            }

            if (this._SolicitudConsumo.detsolicitudconsumo != null) {
              this.arregloDetalleProductoSolicitud = this._SolicitudConsumo.detsolicitudconsumo;
              this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;
            }
            this.arregloDetalleProductoSolicitud.forEach(x=>{
              if(this._SolicitudConsumo.referenciacontable ==0){
                x.bloqcampogrilla = true;
              }else{
                x.bloqcampogrilla = false;
              }
            })

            this.loading = false;
            return;
          });
      }else{ //Cuando la solicitud aún no se crea

        this.arregloDetalleProductoSolicitud_2 = [];
        if(this.FormCreaSolicitud.controls.numsolicitud.value === null){

          this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
            this.cmecodigo,codProdAux,4,this.usuario,this.servidor,null,null,
            null,this.arregloDetalleProductoSolicitud,null).subscribe(response => {
              if (response != null) {
                response.forEach(x=>{
                  this.arregloDetalleProductoSolicitud_2.unshift(x);
                });

                this.arregloDetalleProductoSolicitud = [];
                this.arregloDetalleProductoSolicitudPaginacion = [];

                this.arregloDetalleProductoSolicitud = this.arregloDetalleProductoSolicitud_2;
                this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud;
                this.ActivaBotonLimpiaBusca = true;
              }
              this.loading = false;
            });
          this.loading = false;
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

    this.arregloDetalleProductoSolicitud = [];
    this.arregloDetalleProductoSolicitudPaginacion = [];

    // Llenar Array Auxiliares
    this.arregloDetalleProductoSolicitud = this.arregloDetalleProductoSolicitud_aux;
    this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitudPaginacion_aux;
    this.ActivaBotonLimpiaBusca = false;

    this.loading = false;
  }

  ActivaBotonImprimir(){
    var solicitud : number = this.FormCreaSolicitud.controls.numsolicitud.value;
    if (solicitud > 0 || solicitud != null || solicitud != undefined) {
      return true;
    } else {
      return false;
    }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
