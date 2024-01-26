import { Component, OnInit, ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

import { Solicitud } from '../../models/entity/Solicitud';
import { EstadoSolicitudBodega } from '../../models/entity/EstadoSolicitudBodega';
import { ParamDevolBodega } from '../../models/entity/ParamDevolBodega';
import { Prioridades } from '../../models/entity/Prioridades';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { DespachoDetalleSolicitud } from 'src/app/models/entity/DespachoDetalleSolicitud';
import { RolesUsuarios } from 'src/app/models/entity/roles-usuario';

import { BusquedasolicitudesComponent } from '../busquedasolicitudes/busquedasolicitudes.component';
import { EventosSolicitudComponent } from '../eventos-solicitud/eventos-solicitud.component';
import { ParamDetDevolBodega } from '../../models/entity/ParamDetDevolBodega';
import { EstructuraRolesUsuarios } from 'src/app/models/entity/estructura-roles-usuarios';
import { Permisosusuario } from '../../permisos/permisosusuario';

import { UsuariosService } from 'src/app/servicios/usuarios.service';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { EstadosolicitudbodegaService } from '../../servicios/estadosolicitudbodega.service';
import { PrioridadesService } from '../../servicios/prioridades.service';
import { BodegasService } from '../../servicios/bodegas.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-devolucionautopedido',
  templateUrl: './devolucionautopedido.component.html',
  styleUrls: ['./devolucionautopedido.component.css']
})
export class DevolucionautopedidoComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos         : Permisosusuario = new Permisosusuario();
  public FormDevolAutopedido    : FormGroup;
  public FormBusquedaProducto   : FormGroup;
  public locale                 = 'es';
  public bsConfig               : Partial<BsDatepickerConfig>;
  public colorTheme             = 'theme-blue';
  private _BSModalRef           : BsModalRef;
  public hdgcodigo              : number;
  public esacodigo              : number;
  public cmecodigo              : number;
  public usuario                = environment.privilegios.usuario;
  public servidor               = environment.URLServiciosRest.ambiente;
  public _Solicitud             : Solicitud;
  public prioridades            : Array<Prioridades> = [];
  public estadossolbods         : Array<EstadoSolicitudBodega> = [];
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public arregloDetalleProductoSolicitudPaginacion: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitud: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitudPaginacion_aux: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitud_aux: Array<DetalleSolicitud> = [];
  public arregloDetalleProductoSolicitud_2: Array<DetalleSolicitud> = [];
  public activabtnevento        : boolean = false;
  public desactivanusolic       : boolean = false;
  public numsolicitud           : number;
  public loading                = false;
  public paramdevolucion        : DespachoDetalleSolicitud[]=[];
  public paramrecepcion         : DespachoDetalleSolicitud[] = [];
  public paramrecepciongrilla   : DespachoDetalleSolicitud[] = [];
  public DevolucionBodega       : ParamDevolBodega;
  public existesolicitud        : boolean = false;
  public listaDetalleDespachopaginacion : Array<DespachoDetalleSolicitud> = [];
  public listaDetalleDespacho   : Array<DespachoDetalleSolicitud> = [];
  public bloqueachec            : boolean = false;
  public activabtngenerautoped  : boolean = false;
  public activabtnbuscasolic    : boolean = true;
  public activabtnanulaautopedido: boolean = false;
  public ActivaBotonLimpiaBusca : boolean = false;
  public ActivaBotonBuscaGrilla : boolean = false;
  public arregloRolesUsuarioInit: Array<RolesUsuarios> = [];
  public valInit : boolean;

  constructor(
    private formBuilder             : FormBuilder,
    public localeService            : BsLocaleService,
    public _BsModalService          : BsModalService,
    public _solicitudService        : SolicitudService,
    public datePipe                 : DatePipe,
    private EstadoSolicitudBodegaService: EstadosolicitudbodegaService,
    private PrioridadesService      : PrioridadesService,
    public _BodegasService          : BodegasService,
    private _ServiciosUsuarios      : UsuariosService,
    private router                  : Router,
    private route                   : ActivatedRoute,
    public translate: TranslateService
  ) {

    this.FormDevolAutopedido = this.formBuilder.group({
      numsolicitud: [{ value: null, disabled: false }, Validators.required],
      esticod   : [{ value: null, disabled: false }, Validators.required],
      hdgcodigo : [{ value: null, disabled: false }, Validators.required],
      esacodigo : [{ value: null, disabled: false }, Validators.required],
      cmecodigo : [{ value: null, disabled: false }, Validators.required],
      prioridad : [{ value: null, disabled: false }, Validators.required],
      fecha     : [{ value: new Date(), disabled:true },  Validators.required],
      bodcodigo : [{ value: null, disabled: false }, Validators.required],
      glosa     : [{ value: null, disabled: false }, Validators.required],
    });

    this.FormBusquedaProducto = this.formBuilder.group({

      codigoproducto : [{ value: null, disabled: false }, Validators.required],
      descripcion    : [{ value: null, disabled: false }, Validators.required]

    });
   }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.FormDevolAutopedido.controls.esticod.disable();
    this.FormDevolAutopedido.controls.prioridad.disable();
    this.FormDevolAutopedido.controls.bodcodigo.disable();
    this.FormDevolAutopedido.controls.glosa.disable();

    this.setDate();
    this.BuscaBodegaSolicitante();

    this.PrioridadesService.list(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.prioridades = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.EstadoSolicitudBodegaService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.estadossolbods = data;
      }, err => {
        console.log(err.error);
      }
    );
    const _ListaRolUsuario = new (EstructuraRolesUsuarios);
    _ListaRolUsuario.servidor = this.servidor;
    _ListaRolUsuario.hdgcodigo = this.hdgcodigo;
    _ListaRolUsuario.cmecodigo = this.cmecodigo;
    _ListaRolUsuario.esacodigo = this.esacodigo;
    _ListaRolUsuario.idusuario = Number(sessionStorage.getItem('id_usuario').toString());
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
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

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(startItem, endItem);
  }

  getSolicitud(solicitud: number) {

    var idg =0;
    let indice =0;
    indice = 0;
    this.numsolicitud= solicitud;
    this.numsolicitud = Number(solicitud);

    if(this.numsolicitud === null || this.numsolicitud === 0){
      return;
    } else{

      this.loading = true;

      this._solicitudService.BuscaSolicitud(this.numsolicitud, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0, "",60,"","").subscribe(
        response => {
          if (response != null) {
            if (response.length == 0) {
              this.loading = false;
              this.activabtnbuscasolic = true;
              this.BuscarSolicitudes();
            } else {
              if (response.length > 0) {
                this._Solicitud = response[0];
                this.FormDevolAutopedido.get('numsolicitud').setValue(this._Solicitud.soliid);
                this.FormDevolAutopedido.get('bodcodigo').setValue(this._Solicitud.bodorigen);
                this.FormDevolAutopedido.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
                this.FormDevolAutopedido.get('esticod').setValue(this._Solicitud.estadosolicitud);
                this.FormDevolAutopedido.get('prioridad').setValue(this._Solicitud.prioridadsoli);
                this.FormDevolAutopedido.get('glosa').setValue(this._Solicitud.observaciones);
                this.activabtnevento = true;
                this.existesolicitud = true;
                this.FormDevolAutopedido.controls.numsolicitud.disable();
                this.ActivaBotonBuscaGrilla = true;
                // this.desactivanusolic = true;
                this.arregloDetalleProductoSolicitudPaginacion = [];
                this.arregloDetalleProductoSolicitud = [];
                this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet;
                this.arregloDetalleProductoSolicitud.forEach(element=>{
                  element.detallelote.forEach(f => {
                    element.fechavto = f.fechavto;
                  })
                  if(element.cantdevolucion == 0){
                    element.marcacheckgrilla = true; //'desactivado'
                    this.bloqueachec = false;
                  }
                  if(element.cantdevolucion > 0){
                    element.marcacheckgrilla = false //'activado'
                    this.bloqueachec = true;
                  }
                });
                this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
                this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
                this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
              }
            }
          } else {
            this.loading = false;
            this.activabtnbuscasolic = true;
            this.BuscarSolicitudes();
          }
        });
    }
  }

  BuscarSolicitudes() {
    let indice =0;
    indice = 0;
    this._BSModalRef = this._BsModalService.show(BusquedasolicitudesComponent, this.setModalBusquedaSolicitud());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != undefined || response === null) {
        this.loading = true;
        this._solicitudService.BuscaSolicitud(response.soliid, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, 0, "","", 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0, "",60,"","").subscribe(
          response_solicitud => {
            this._Solicitud = response_solicitud[0];
            this.FormDevolAutopedido.get('numsolicitud').setValue(this._Solicitud.soliid);
            this.FormDevolAutopedido.get('bodcodigo').setValue(this._Solicitud.bodorigen);
            this.FormDevolAutopedido.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
            this.FormDevolAutopedido.get('esticod').setValue(this._Solicitud.estadosolicitud);
            this.FormDevolAutopedido.get('prioridad').setValue(this._Solicitud.prioridadsoli);
            this.FormDevolAutopedido.get('glosa').setValue(this._Solicitud.observaciones);
            this.activabtnevento = true;
            this.existesolicitud = true;
            this.activabtnbuscasolic = false;
            this.FormDevolAutopedido.controls.numsolicitud.disable();
            this.ActivaBotonBuscaGrilla = true;
            this.arregloDetalleProductoSolicitudPaginacion = [];
            this.arregloDetalleProductoSolicitud = [];
            this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet;
            this.arregloDetalleProductoSolicitud.forEach(element=>{
              element.detallelote.forEach(f => {
                element.fechavto = f.fechavto;
              })
              if(element.cantdevolucion == 0){
                element.marcacheckgrilla = true; //'desactivado'
                this.bloqueachec = false;
              }
              if(element.cantdevolucion > 0){
                element.marcacheckgrilla = false //'activado'
                this.bloqueachec = true;
              }
            })
            this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);

            this.arregloDetalleProductoSolicitud_aux = this.arregloDetalleProductoSolicitud;
            this.arregloDetalleProductoSolicitudPaginacion_aux = this.arregloDetalleProductoSolicitudPaginacion;
          }
        )
      } else {
        this.loading = false;
      }
    });
  }

  /**agrega los lotes y fecha vto a la grilla Medicamentos */
  async setLotemedicamento(data: any) {
    this.arregloDetalleProductoSolicitud.forEach(res => {
        data.forEach(x => {
          if (res.codmei === x.codmei) {
            res.fechavto = x.fechavto;
            res.lote = x.lote;
          }
        });
      });
  }

  /**asigna fecha vencimiento a producto segun seleccion lote en grilla  */
  setLote(value: string, indx: number) {
    const fechaylote = value.split('/');
    const fechav = fechaylote[0];
    const loteprod = fechaylote[1];
    this.arregloDetalleProductoSolicitud[indx].fechavto = fechav;
    this.arregloDetalleProductoSolicitud[indx].lote = loteprod;
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
        origen : 'DevolucionAutopedido',
        numerosolic: this.numsolicitud,
        paginaorigen: 7
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

  limpiar() {
    this.FormDevolAutopedido.reset();
    this.arregloDetalleProductoSolicitudPaginacion = [];
    this.arregloDetalleProductoSolicitud = [];
    this.FormDevolAutopedido.get('fecha').setValue(new Date());
    this.activabtnevento = false;
    this.FormDevolAutopedido.controls.numsolicitud.enable();
    this.existesolicitud = false;
    this.numsolicitud = null;
    this.paramrecepcion = [];
    this.paramdevolucion = [];
    this.activabtngenerautoped = false;
    this.bloqueachec = false;
    this.paramrecepciongrilla = [];
    this.activabtnbuscasolic = true;
    this.activabtnanulaautopedido = false;
    this.arregloDetalleProductoSolicitudPaginacion_aux = [];
    this.arregloDetalleProductoSolicitud_aux = [];
    this.arregloDetalleProductoSolicitud_2 = [];
    this.ActivaBotonBuscaGrilla = false;
  }

  ConfirmarEnviarDevolucion() {

    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.devolver.productos'),
      text: this.TranslateUtil('key.mensaje.confirmar.devolucion.productos'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.DevolucionSolictud();
      }
    })
  }

  DevolucionSolictud() {
    // this.paramdevolucion=[];
    // console.log("datos a dev",this.paramrecepcion);
    this.paramrecepcion.forEach(element => {
      if(element.cantdevolucion ==0){
        var temporal = new ParamDetDevolBodega  // new DespachoDetalleSolicitud
        temporal.soliid            = this._Solicitud.soliid;
        temporal.sodeid            = element.sodeid;
        temporal.cantsoli          = element.cantsoli;
        temporal.cantdespachada    = element.cantdespachada;
        temporal.cantdevolucion    = element.cantdevolucion;
        temporal.cantrecepcionado  = element.cantrecepcionada;
        temporal.mfdeid            = element.mfdeid;
        temporal.cantrecepcionada  = element.cantrecepcionada;
        temporal.cantdevuelta      = element.cantdevuelta;
        temporal.cantidadadevolver = element.cantrecepcionada;
        temporal.lote              = element.lote;
        temporal.fechavto          = element.fechavto;
        this.paramdevolucion.push(temporal);
      }

    });

    this.DevolucionBodega = new (ParamDevolBodega);
    this.DevolucionBodega.hdgcodigo = this.hdgcodigo;
    this.DevolucionBodega.esacodigo = this.esacodigo;
    this.DevolucionBodega.cmecodigo = this.cmecodigo;
    this.DevolucionBodega.servidor = this.servidor;
    this.DevolucionBodega.usuariodespacha = this.usuario;

    this.DevolucionBodega.paramdetdevolbodega = this.paramdevolucion;
    // console.log("devolucion datos a bodega",this.DevolucionBodega)
    this.paramrecepcion = [];
    try {
      this._solicitudService.DevolucionSolicitudAutopedido(this.DevolucionBodega).subscribe(
        response => {
          //if (response.respuesta == 'OK') {

          this.alertSwal.title = this.TranslateUtil('key.mensaje.devolucion.exitosa');
          this.alertSwal.show();

          this._solicitudService.BuscaSolicitud(this._Solicitud.soliid , this.hdgcodigo,
            this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0,
             "",60,"","").subscribe(
            response_solicitud => {

              this._Solicitud = response_solicitud[0];
              console.log("solicitud buscada", this._Solicitud);
              this.FormDevolAutopedido.get('numsolicitud').setValue(this._Solicitud.soliid);
              this.FormDevolAutopedido.get('bodcodigo').setValue(this._Solicitud.bodorigen);
              this.FormDevolAutopedido.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
              this.FormDevolAutopedido.get('esticod').setValue(this._Solicitud.estadosolicitud);
              this.FormDevolAutopedido.get('prioridad').setValue(this._Solicitud.prioridadsoli);
              // arregloDetalleProductoSolicitudPaginacion
              console.log("formulario", this.FormDevolAutopedido.value)
              this.activabtnevento = true;
              this.existesolicitud = false;
              this.activabtnanulaautopedido = true;
              this.FormDevolAutopedido.controls.numsolicitud.disable();
              // this.desactivanusolic = true;
              this.arregloDetalleProductoSolicitudPaginacion = [];
              this.arregloDetalleProductoSolicitud = [];
              this.paramdevolucion = [];
              this.paramrecepciongrilla = [];
              this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet;
              this.arregloDetalleProductoSolicitud.forEach(element=>{
                if(element.cantdevolucion > 0){
                  this.bloqueachec = true;
                }
              })
              this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
            }
          )
        }
      )
    }
    catch (err) {
      alert("Error : " + err)
    }
  }

  ConfirmaDevolucionGrilla(registro:DetalleSolicitud ,id: number,event:any,marcacheckgrilla: boolean){
    console.log("Devuelve grilla seleccionada",registro,id,event,marcacheckgrilla)
    // var idg = 0;
    // this.paramrecepcion = [];
    if (event.target.checked) {
      console.log("event.target.checked",event.target.checked)
      if(registro.sodeid>0){
        // if(registro.cantdevolucion ==0){
// if(this.IdgrillaRecepcion(registro)>=0){
          // idg = this.IdgrillaRecepcion(registro)
          // registro.marcacheckgrilla = true;
          // console.log("saca el valor idg", idg);
          this._solicitudService.BuscaProductoDespachoBodegaAutopedido(this.hdgcodigo,this.esacodigo,this.cmecodigo,
            this.servidor,registro.soliid,registro.codmei,null,null).subscribe(
            response_prod_despachado => {
              console.log("Codigo despachado",response_prod_despachado)

              response_prod_despachado.forEach(data=>{
                var temporal = new DespachoDetalleSolicitud  // new DespachoDetalleSolicitud
                temporal.soliid            = data.soliid;
                temporal.sodeid            = data.sodeid;
                temporal.cantsoli          = data.cantsoli;
                temporal.codmei            = registro.codmei;
                temporal.meinid            = registro.meinid;
                temporal.meindescri        = registro.meindescri;
                temporal.cantdespachada    = data.cantrecepcionada;
                temporal.cantdevolucion    = data.cantdevuelta;
                temporal.cantrecepcionado  = data.cantrecepcionada;
                temporal.mfdeid            = data.mfdeid;
                temporal.cantrecepcionada  = data.cantrecepcionada;
                temporal.cantdevuelta      = data.cantdevuelta;
                temporal.cantidadadevolver = data.cantrecepcionada;
                temporal.lote              = data.lote;
                temporal.fechavto          = data.fechavto;
                this.paramrecepciongrilla.unshift(temporal);
              })
              this.loading = false;
              // console.log("this.paramrecpciongrilla",this.paramrecepciongrilla);
              this.activabtngenerautoped = true;
              this.existesolicitud = false;
              // this.activabtnanulaautopedido = false;
              // this.listaDetalleDespacho.unshift(response_prod_despachado);
              // listaDetalleDespachopaginacion : Array<DespachoDetalleSolicitud> = [];
            }
          )
        // }


        // }
      }

    }else{
      this.activabtngenerautoped = false;
      this.existesolicitud = true;
      this.paramrecepciongrilla = [];
    }
    //
  }

  ConfirmarEnviarDevolucionGrilla() {

    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.devolver.productos.seleccionados.grilla'),
      text: this.TranslateUtil('key.mensaje.confirmar.devolucion.productos'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.DevolucionSolictudGrilla();
      }
    })
  }

  DevolucionSolictudGrilla() {
    // this.paramdevolucion=[];
    console.log("datos a dev",this.paramrecepciongrilla);
    this.paramrecepciongrilla.forEach(element => {
      console.log("element",element)
      if(element.cantdevolucion == 0){
        var temporal = new ParamDetDevolBodega  // new DespachoDetalleSolicitud
        temporal.soliid            = this._Solicitud.soliid;
        temporal.sodeid            = element.sodeid;
        temporal.cantsoli          = element.cantsoli;
        temporal.cantdespachada    = element.cantdespachada;
        temporal.cantdevolucion    = element.cantdevolucion;
        temporal.cantrecepcionado  = element.cantrecepcionada;
        temporal.mfdeid            = element.mfdeid;
        temporal.cantrecepcionada  = element.cantrecepcionada;
        temporal.cantdevuelta      = element.cantdevuelta;
        temporal.cantidadadevolver = element.cantrecepcionada;
        temporal.lote              = element.lote;
        temporal.fechavto          = element.fechavto;
        this.paramdevolucion.unshift(temporal);
      }else{
        // console.log("el element tiene devolucion")
      }

    });

    this.DevolucionBodega = new (ParamDevolBodega);
    this.DevolucionBodega.hdgcodigo = this.hdgcodigo;
    this.DevolucionBodega.esacodigo = this.esacodigo;
    this.DevolucionBodega.cmecodigo = this.cmecodigo;
    this.DevolucionBodega.servidor = this.servidor;
    this.DevolucionBodega.usuariodespacha = this.usuario;

    this.DevolucionBodega.paramdetdevolbodega = this.paramdevolucion;
    console.log("devolucion datos a bodega",this.DevolucionBodega)
    // this.paramrecepcion = [];
    try {
      this._solicitudService.DevolucionSolicitudAutopedido(this.DevolucionBodega).subscribe(
        response => {
          if (response != null) {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.devolucion.exitosa');
            this.alertSwal.show();
            this._solicitudService.BuscaSolicitud(this._Solicitud.soliid , this.hdgcodigo, this.esacodigo,
            this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0, "",60,"","").subscribe(
              response_solicitud => {
                this._Solicitud = response_solicitud[0];
                this.FormDevolAutopedido.get('numsolicitud').setValue(this._Solicitud.soliid);
                this.FormDevolAutopedido.get('bodcodigo').setValue(this._Solicitud.bodorigen);
                this.FormDevolAutopedido.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
                this.FormDevolAutopedido.get('esticod').setValue(this._Solicitud.estadosolicitud);
                this.FormDevolAutopedido.get('prioridad').setValue(this._Solicitud.prioridadsoli);
                this.paramrecepcion = [];
                this.activabtnevento = true;
                this.existesolicitud = true;
                this.activabtngenerautoped = false;
                this.FormDevolAutopedido.controls.numsolicitud.disable();
                this.paramrecepciongrilla = [];
                this.paramdevolucion = [];
                this.arregloDetalleProductoSolicitudPaginacion = [];
                this.arregloDetalleProductoSolicitud = [];
                this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet;
                this.arregloDetalleProductoSolicitud.forEach(element=>{
                  if(element.cantdevolucion == 0){
                    element.marcacheckgrilla = true; //'desactivado'
                    this.bloqueachec = false;
                  }
                  if(element.cantdevolucion > 0){
                    element.marcacheckgrilla = false //'activado'
                    this.bloqueachec = true;
                  }
                  this._solicitudService.BuscaProductoDespachoBodegaAutopedido(this.hdgcodigo,this.esacodigo,this.cmecodigo,
                    this.servidor,element.soliid,element.codmei,null,null).subscribe(
                      response_prod_despachado => {
                        response_prod_despachado.forEach(data=>{
                          var temporal = new DespachoDetalleSolicitud  // new DespachoDetalleSolicitud
                          temporal.soliid            = data.soliid;
                          temporal.sodeid            = data.sodeid;
                          temporal.cantsoli          = data.cantsoli;
                          temporal.cantdespachada    = data.cantrecepcionada;
                          temporal.cantdevolucion    = data.cantdevuelta;
                          temporal.cantrecepcionado  = data.cantrecepcionada;
                          temporal.mfdeid            = data.mfdeid;
                          temporal.cantrecepcionada  = data.cantrecepcionada;
                          temporal.cantdevuelta      = data.cantdevuelta;
                          temporal.cantidadadevolver = data.cantrecepcionada;
                          temporal.lote              = data.lote;
                          temporal.fechavto          = data.fechavto;
                          this.paramrecepcion.push(temporal);
                        });
                        this.loading = false;
                      });
                });
                this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
              });
            } else {
              this.loading = false;
            }
        });
    }
    catch (err) {
      alert("Error : " + err)
    }
  }

  async findArticuloGrilla() {
    this.loading = true;
    let indice =0;
    indice = 0;
    var descProdAux = "";
    this.arregloDetalleProductoSolicitud_2 = [];
    // console.log('this.FormDatosProducto.controls.codigo.value : ' , this.FormDatosProducto.controls.codigo);
    if ( this.FormBusquedaProducto.controls.codigoproducto.touched &&
      this.FormBusquedaProducto.controls.codigoproducto.status !== 'INVALID') {
      var codProdAux = this.FormBusquedaProducto.controls.codigoproducto.value.toString();
    }
    if ( this.FormBusquedaProducto.controls.descripcion.touched &&
      this.FormBusquedaProducto.controls.descripcion.status !== 'INVALID') {

        descProdAux = this.FormBusquedaProducto.controls.descripcion.value.toString();
    }
      if(this.FormDevolAutopedido.controls.numsolicitud.value >0){

        this._solicitudService.BuscaSolicitud(this.numsolicitud, this.hdgcodigo,
        this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0,
        "",60,codProdAux,descProdAux).subscribe(response => {
          if (response != null) {
            if (response.length == 0) {
              this.loading = false;
              this.activabtnbuscasolic = true;
              this.BuscarSolicitudes();
            }
            else {
              if (response.length > 0) {
                this._Solicitud = response[0];
                this.FormDevolAutopedido.get('numsolicitud').setValue(this._Solicitud.soliid);
                this.FormDevolAutopedido.get('bodcodigo').setValue(this._Solicitud.bodorigen);
                this.FormDevolAutopedido.get('fecha').setValue(this.datePipe.transform(this._Solicitud.fechacreacion, 'dd-MM-yyyy'));
                this.FormDevolAutopedido.get('esticod').setValue(this._Solicitud.estadosolicitud);
                this.FormDevolAutopedido.get('prioridad').setValue(this._Solicitud.prioridadsoli);
                console.log("solicitud", this._Solicitud)
                this.activabtnevento = true;
                this.existesolicitud = true;
                this.ActivaBotonBuscaGrilla = true;
                this.arregloDetalleProductoSolicitudPaginacion = [];
                this.arregloDetalleProductoSolicitud = [];
                this.arregloDetalleProductoSolicitud = this._Solicitud.solicitudesdet;
                this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0, 20);
                this.arregloDetalleProductoSolicitud.forEach(element=>{
                  element.detallelote.forEach(f => {
                    element.fechavto = f.fechavto;
                  })
                  if(element.cantdevolucion == 0){
                    element.marcacheckgrilla = true; //'desactivado'
                    this.bloqueachec = false;
                  }
                  if(element.cantdevolucion > 0){
                    element.marcacheckgrilla = false //'activado'
                    this.bloqueachec = true;
                  }
                  this.ActivaBotonBuscaGrilla = true;
                  this.ActivaBotonLimpiaBusca = true;
                });
              }
            }
          }
        });
        this.loading = false;
        return;
      }else{ //Cuando la plantilla aún no se crea
        this.arregloDetalleProductoSolicitud_2 = [];
        if(this.FormDevolAutopedido.controls.numsolicitud.value === null){
          this.arregloDetalleProductoSolicitud.forEach(x=>{
            if(x.codmei === codProdAux){
              this.arregloDetalleProductoSolicitud_2.unshift(x);
            }
          });
          this.arregloDetalleProductoSolicitud = [];
          this.arregloDetalleProductoSolicitudPaginacion = [];
          this.arregloDetalleProductoSolicitud = this.arregloDetalleProductoSolicitud_2;
          this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitud.slice(0,20);
          this.ActivaBotonLimpiaBusca = true;
          this.loading = false;
        }
      }
  }

  limpiarCodigo() {
    this.loading = true;

    this.FormBusquedaProducto.controls.codigoproducto.reset();
    this.FormBusquedaProducto.controls.descripcion.reset();
    // var codBodegaAux = this._bodega.codbodega;
    // var fcodBodegaAux = this.codbodega;
    var codProdAux = '';

    this.arregloDetalleProductoSolicitud = [];
    this.arregloDetalleProductoSolicitudPaginacion = [];


    // Llenar Array Auxiliares
    this.arregloDetalleProductoSolicitud = this.arregloDetalleProductoSolicitud_aux;
    this.arregloDetalleProductoSolicitudPaginacion = this.arregloDetalleProductoSolicitudPaginacion_aux;
    this.ActivaBotonLimpiaBusca = false;

    this.loading = false;
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
