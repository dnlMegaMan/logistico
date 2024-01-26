import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { DatePipe } from '@angular/common';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Router, ActivatedRoute } from '@angular/router';
/*Components */
import { ModalpacienteComponent } from '../modalpaciente/modalpaciente.component';
/*Services */
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { PacientesService } from '../../servicios/pacientes.service';
/*Models */
import { Solicitudespacienteproducto } from '../../models/entity/Solicitudespacienteproducto';
import { DevuelveDatosUsuario } from 'src/app/models/entity/DevuelveDatosUsuario';
import { Solicitud } from 'src/app/models/entity/Solicitud';

import { ParamDetDevolPaciente } from '../../models/entity/ParamDetDevolPaciente';
import { InformesService } from '../../servicios/informes.service';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { DespachoDetalleSolicitud } from 'src/app/models/entity/DespachoDetalleSolicitud';
import { DespachoSolicitud } from 'src/app/models/entity/DespachoSolicitud';
import { SolicitudesPacProd } from 'src/app/models/entity/SolicitudesPacProd';
import { BusquedaProdDevolComponent } from './modalbuscaproddevol/busquedaproddevol.component';
import { BodegaDestino } from 'src/app/models/entity/BodegaDestino';
import { BodegasService } from 'src/app/servicios/bodegas.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-generardevolucionpaciente',
  templateUrl: './generardevolucionpaciente.component.html',
  styleUrls: ['./generardevolucionpaciente.component.css'],
  providers : [InformesService]
})
export class GenerardevolucionpacienteComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('alertSwalGrilla', { static: false }) alertSwalGrilla: SwalComponent;

  public modelopermisos           : Permisosusuario = new Permisosusuario();
  //array
  public alerts: Array<any> = [];
  public solicitudeslista         : Array<SolicitudesPacProd> = [];
  public solicitudeslistapag      : Array<SolicitudesPacProd> = [];
  public solicitudesgrilla        : Array<SolicitudesPacProd> = [];
  public solicitudseleccion       : Array<SolicitudesPacProd> = [];
  public arrParamDetDevolPaciente : Array<ParamDetDevolPaciente> = [];
  public solicitudesgrillaPaginacion: Array<SolicitudesPacProd>= [];
  public bodegasdestino           : Array<BodegaDestino> = [];
  public Solicitud                : Solicitud;
  public SolicitudDev           : SolicitudesPacProd;
  public productoselec          : Articulos;
  //obj
  public pForm                : FormGroup;
  public dForm                : FormGroup;
  private _BSModalRef         : BsModalRef;
  public dataPacienteSolicitud: Solicitud = new Solicitud();
  public bsConfig             : Partial<BsDatepickerConfig>;
  public recepciondevolucionpaciente: DespachoSolicitud = new DespachoSolicitud;
  //var
  public locale         = 'es';
  public colorTheme     = 'theme-blue';
  public hdgcodigo      : number;
  public esacodigo      : number;
  public cmecodigo      : number;
  public tipobusqueda   = 'Paciente';
  public servidor       = environment.URLServiciosRest.ambiente;
  public usuario        = environment.privilegios.usuario;
  public loading        = false;
  public solicitudexist = false;
  public vacios         = false;
  public solicituddevuelta = false;
  public descprod       = null;
  public codprod        = null;
  public solicitudseleccion1: Array<Solicitudespacienteproducto> = [];
  public desactivabtnelim : boolean = false;
  public estado_aux     : number;
  public text                   : string = null;
  public textDetMed             : string = null;
  public textErr                : boolean = false;

  public URLReporte : string;

  constructor(
    public datePipe         : DatePipe,
    public formBuilder      : FormBuilder,
    public _BsModalService  : BsModalService,
    public _solicitudService: SolicitudService,
    public localeService    : BsLocaleService,
    public _pacienteService : PacientesService,
    public _BusquedaproductosService: BusquedaproductosService,
    private _imprimesolicitudService: InformesService,
    private route                   : ActivatedRoute,
    private router                  : Router,
    public _BodegasService          : BodegasService,
    public translate: TranslateService
  ) {
    this.pForm = this.formBuilder.group({
      nompaciente: [{ value: null, disabled: true }, Validators.required],
      rut: [{ value: null, disabled: true }, Validators.required],
      bodcodigo: [{ value: null, disabled: true }, Validators.required]
    });

    this.dForm = this.formBuilder.group({
      codmei: [{ value: null, disabled: true }, Validators.required],
      soliid: [{ value: null, disabled: true }, Validators.required],
      fechavto: [{ value: null, disabled: true }, Validators.required],
      lote: [{ value: null, disabled: true }, Validators.required],
      cantidad: [{ value: null, disabled: true }, Validators.required],
      descripcion : [{ value: null, disabled: true }, Validators.required]
    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.datosUsuario();
    this.setDate();
  }

  ngOnDestroy(){
    if(this.solicitudesgrilla.length>0){
      if(this.solicitudesgrilla[0].bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }

  }

  limpiar() {
    if(this.solicitudesgrilla.length>0){
      if (this.solicitudesgrilla[0].bandera != 2) {
        this.ValidaEstadoSolicitud(1,'limpiar');
      }

      this.URLReporte = null;
      this.solicituddevuelta = false;
    }

    this.dForm.reset();
    this.pForm.reset();
    this.bodegasdestino = []
    this.dataPacienteSolicitud = null;
    this.solicitudesgrilla = [];
    this.solicitudseleccion = [];
    this.arrParamDetDevolPaciente = [];
    this.dForm.get('fechavto').setValue(new Date());
    this.logicaGrabar();
    this.solicitudesgrillaPaginacion = [];
    this.solicitudesgrilla = []
    this.descprod = null;this.dForm.get('codmei').disable();
    this.dForm.get('soliid').disable();
    this.dForm.get('cantidad').disable();
    this.dForm.get('lote').disable();
    this.dForm.get('fechavto').disable();
    this.dForm.get('descripcion').disable();
    this.textErr = false;
    this.textDetMed= "";
    this.text = "";
  }

  datosUsuario() {
    var datosusuario = new DevuelveDatosUsuario();
    datosusuario = JSON.parse(sessionStorage.getItem('Login'));
    this.hdgcodigo = datosusuario[0].hdgcodigo;
    this.esacodigo = datosusuario[0].esacodigo;
    this.cmecodigo = datosusuario[0].cmecodigo;
  }

  /**
   * se cambia condicion en respuesta al error al no encontrar datos en campo codigo
   * autor: MLobos miguel.lobos@sonda.com
   * fecha: 23-12-2020
   */
  buscarSolicitud() {
    // if (this.dForm.controls['codmei'].invalid == false) {
    if(this.dForm.controls.codmei.value===undefined || this.dForm.controls.codmei.value===null) {
      return;
    } else{
      this.BuscarSolicitudesPacientes();
    }
  }

  onBuscar(tipo: string) {
    if (this.hdgcodigo == null || this.esacodigo == null || this.cmecodigo == null) {
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.debe.agregar.holding.empresa.sucursal');
      this.alertSwalAlert.show();
      return;
    }

    this.tipobusqueda = tipo;
    switch (tipo) {
      case 'Pacientes':
        this._BSModalRef = this._BsModalService.show(ModalpacienteComponent, this.setModal(this.TranslateUtil('key.title.busqueda.de').concat(tipo)));
        break;
    }
    this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
      if (Retorno !== undefined) {
        this.limpiar();
        this.dataPacienteSolicitud = Retorno;
        this.setDatos();
      } else {

        this.ValidaEstadoSolicitud(2,'BuscaPaciente');

      }
    }
    );
  }

  async BuscarSolicitudesPacientes() {
    this.loading = true;
    this.alertSwalAlert.title = null;
    this.solicitudeslista = [];
    try {
      const response = await this.solicitudesPaciente();
      if (response != null) {
        for (const solicitudResponse of response) {
          const existeEnGrilla = this.solicitudesgrilla.some((solicitudEnGrilla) => {
            return solicitudResponse.soliid === solicitudEnGrilla.soliid && solicitudResponse.codmei === solicitudEnGrilla.codmei;
          })

          if (!existeEnGrilla) {
            this.solicitudeslista.push(solicitudResponse)
          }
        }
      }

      if(this.solicitudeslista != null)
      {
        // solicitudesgrillaPaginacion
        this.solicitudeslista.forEach(element=>{
          if((element.cantadevolver+element.cantdevuelta+element.cantrechazo) >= element.cantdispensada){
            element.checkgrilla = true;
          }else{
            element.checkgrilla = false;
          }
        });

        this.logicaGrabar();
        this.solicitudeslistapag = this.solicitudeslista.slice(0, 20);
        this.loading = false;
        this.alertSwalGrilla.reverseButtons = true;
        this.alertSwalGrilla.title = this.TranslateUtil('key.mensaje.seleccione.solicitud');
        this.alertSwalGrilla.show();
      }else{
        this.loading = false;
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.sin.datos.criterio.busqueda');
        this.alertSwalAlert.show();
      }
    } catch (error) {
      this.loading = false;
      this.alertSwalError.title = this.TranslateUtil('key.title.error');
      this.alertSwalError.text = error.message
      this.alertSwalError.show();
    }
  }

  async solicitudesPaciente() {
    let solicitudes: Array<SolicitudesPacProd> = [];

    solicitudes = await this._pacienteService.BuscaSolicitudesPacienteProducto(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.servidor,
      this.dataPacienteSolicitud.cliid,
      this.dataPacienteSolicitud.ctaid,
      this.dataPacienteSolicitud.estid,
      this.pForm.controls.bodcodigo.value,
      this.dForm.controls['codmei'].value,
      parseInt(this.dForm.controls['soliid'].value),
      this.dForm.controls['lote'].value,
      ""
    ).toPromise();

    return solicitudes
  }

  async setGrilla() {
    let arrsoltemporal: Array<any> = [];
    let solicitudes: Array<any> = [];
    try {
      solicitudes =  await this.solicitudesPaciente();

      for (let arr of solicitudes) {
        this.solicitudesgrilla.forEach(dat => {
          if (dat.idmovimientodet == arr.idmovimientodet ) {
            arrsoltemporal.push(arr);
          }
        })
      }
      this.solicitudesgrilla = [];
      this.solicitudseleccion = [];
      this.solicitudesgrilla = arrsoltemporal;
      this.solicitudseleccion = this.solicitudesgrilla;

      this.logicaGrabar();
    } catch (err) {
      alert(err.message);
    }
  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.solicitudeslistapag = this.solicitudeslista.slice(startItem, endItem);
  }

  pageChangedDevolucion(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.solicitudesgrillaPaginacion = this.solicitudesgrilla.slice(startItem, endItem);
  }

  cantdevuelta(event: any, devolucion: Solicitudespacienteproducto) {

    this.arrParamDetDevolPaciente=[];
    this.logicaGrabar();

    let index = this.inArray(0, devolucion);

    if (this.arrParamDetDevolPaciente.length == 0) {

      this.arrParamDetDevolPaciente.unshift(devolucion);

    } else {
      if (index >= 0) {

        this.arrParamDetDevolPaciente.slice(index, 1);
      } else if (index < 0) {

        this.arrParamDetDevolPaciente.unshift(devolucion);
      }
    }
  }

  inArray(tipo: number, seleccion: any) {
    /* devuelve index si objeto existe en array
     0= objeto a devolver
     1= objeto verificar/eliminar en seleccion */
    let arreglo: Array<any>;
    switch (tipo) {
      //isDevuelta()
      case 0:
        arreglo = this.arrParamDetDevolPaciente;
        break;
      case 1:
        //isElimina() & isSolicitud()
        arreglo = this.solicitudseleccion;
        break;
    }
    let indice = 0;
    for (const objeto of arreglo) {
      if (objeto.idmovimientodet == seleccion.idmovimientodet ) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

    onDevolver() {
    let tempora_array:  DespachoDetalleSolicitud;
    this.arrParamDetDevolPaciente = [];
    // Esto es un parche poraue el arreglo llega vacio y no puede ser ... se recomienda trabajar con soo dos arreglos para una grilla
    if  (this.arrParamDetDevolPaciente.length == 0) {

      this.solicitudesgrilla.forEach(element => {
        tempora_array = new(DespachoDetalleSolicitud);
        tempora_array.soliid = element.soliid;
        tempora_array.hdgcodigo = this.hdgcodigo;
        tempora_array.esacodigo = this.esacodigo;
        tempora_array.cmecodigo = this.cmecodigo;
        tempora_array.sodeid = element.sodeid;
        tempora_array.codmei = element.codmei;
        tempora_array.meinid = 0;
        tempora_array.cantsoli = 0;
        tempora_array.cantadespachar = 0;
        tempora_array.cantdespachada = element.cantdispensada;
        tempora_array.observaciones = null;
        tempora_array.usuariodespacha = this.usuario;
        tempora_array.estid = this.dataPacienteSolicitud.estid;
        tempora_array.ctaid = this.dataPacienteSolicitud.ctaid;
        tempora_array.cliid = this.dataPacienteSolicitud.cliid;
        tempora_array.valcosto = 0;
        tempora_array.valventa = 0;
        tempora_array.unidespachocod = 0;
        tempora_array.unicompracod = 0;
        tempora_array.incobfon = null;
        tempora_array.numdocpac = this.pForm.controls.rut.value;
        tempora_array.tipomovim = null;
        tempora_array.servidor = this.servidor;
        tempora_array.lote   = element.lote;
        tempora_array.fechavto = element.fechavto;
        tempora_array.bodorigen = 0;
        tempora_array.boddestino = 0;
        tempora_array.cantrecepcionado = 0;
        tempora_array.cantidadarecepcionar = 0;
        tempora_array.cantidadadevolver = element.cantadevolver;
        tempora_array.codservicioori = 0;
        tempora_array.codservicioactual = null;
        tempora_array.recenumero = 0;
        tempora_array.recetipo = null;
        tempora_array.receid = 0;
        tempora_array.consumo = null;
        tempora_array.tiporeporte = 'pdf';
        this.arrParamDetDevolPaciente.push(tempora_array);
      });
    }
    this.recepciondevolucionpaciente.paramdespachos = this.arrParamDetDevolPaciente;
    this.modalconfirmar("Devolución Solicitud");
  }

  modalconfirmar(mensaje: string) {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿Desea realizar '.concat(mensaje).concat('?'),
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then((result) => {
      if (result.value) {
      try {
        this.loading = true;
        let solicitudes: Array<Solicitudespacienteproducto> = [];
        this._pacienteService.Generardevolucionpaciente(this.recepciondevolucionpaciente).subscribe(
        resp => {
          if (resp != null) {
            for (const res of resp) {
              this.URLReporte = res.url;
              window.open(this.URLReporte, "", "");
            }
            this.solicituddevuelta = true;
            this.alertSwal.title = mensaje.concat(" exitosa");
            this.alertSwal.show();
            this.recepciondevolucionpaciente.paramdespachos.forEach(data=>{
              this._solicitudService.BuscaSolicitud(data.soliid, this.hdgcodigo,
              this.esacodigo, this.cmecodigo, null, null, null, null, null, null,
              this.servidor, 0,this.dataPacienteSolicitud.codambito, 0, 0, 0, 0, "",0,
              "","").subscribe( response => {
                if (response != null) {
                  this.Solicitud = response[0];
                  this.Solicitud.solicitudesdet.forEach(element =>{
                    this.solicitudesgrilla.forEach(s=>{
                      if(element.soliid == s.soliid){
                        if(element.codmei == s.codmei){
                          s.cantdevuelta = element.sodecantadev + element.cantdevolucion;
                          s.cantadevolver = element.sodecantadev;
                          s.cantadevolver = 0;
                          s.bloqcampogrilla = false;
                        }
                      }
                    });
                  });
                  this.solicitudesgrillaPaginacion = this.solicitudesgrilla.slice(0,20);
                  this.solicitudexist = false
                  this.loading = false;
                } else {
                  this.loading = false;
                }
              });
            });
            this.dForm.disable();
          } else {
            this.loading = false;
          }
      });
        } catch (err) {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error');
          this.alertSwalError.text = err.message;
          this.alertSwalError.show();
        }
      }
    });
  }

  onBorrar(solicitud: ParamDetDevolPaciente) {
    this.solicitudesgrilla.splice(this.inArray(0, solicitud), 1);
    this.solicitudesgrillaPaginacion = this.solicitudesgrilla.slice(0,20);
    this.logicaGrabar();
  }

  onEliminarGrilla(solicitud: ParamDetDevolPaciente){
    if(this.IdgrillaDevolucion(solicitud)>=0){
      this.solicitudesgrilla.splice(this.IdgrillaDevolucion(solicitud), 1);
      this.solicitudesgrillaPaginacion = this.solicitudesgrilla.slice(0,20);
      this.logicaGrabar();
    }
  }

  onCheck(event: any, solicitud: Solicitudespacienteproducto) {
    if(event.target.checked){
      this.solicitudseleccion.unshift(solicitud);
     }else{
      var i = this.solicitudseleccion.indexOf( solicitud );
      if ( i !== -1 ) {
        this.solicitudseleccion.splice( i, 1 );
      }
    }
  }

  setCheckRow(seleccion: any) {
    for (const objeto of this.solicitudseleccion) {
      if (objeto.idmovimientodet == seleccion.idmovimientodet ) {
        return true;
      } else {
        return false;
      }
    }
  }

  onConfirm() {
    this.alertSwalGrilla.close;
    const Swal = require('sweetalert2');
    let busca  = true;

    this.solicitudseleccion.forEach((x) => {
      const solicitudSeleccionada = new SolicitudesPacProd()
      solicitudSeleccionada.soliid = x.soliid;
      solicitudSeleccionada.codmei = x.codmei;
      solicitudSeleccionada.meindescri = x.meindescri;
      solicitudSeleccionada.fechacreacionsol = x.fechacreacionsol;
      solicitudSeleccionada.fechadispensacion = x.fechadispensacion;
      solicitudSeleccionada.lote = x.lote;
      solicitudSeleccionada.idmovimientodet = x.idmovimientodet;
      solicitudSeleccionada.sodeid = x.sodeid;
      solicitudSeleccionada.fechavto = x.fechavto;
      solicitudSeleccionada.cantsoli = x.cantsoli;
      solicitudSeleccionada.cantdispensada = x.cantdispensada;
      solicitudSeleccionada.cantdevuelta = x.cantadevolver + x.cantdevuelta;
      solicitudSeleccionada.cantadevolver = 0;
      solicitudSeleccionada.bloqcampogrilla = true;
      solicitudSeleccionada.estado = x.estado;
      solicitudSeleccionada.bandera = x.bandera;

      if (this.solicitudesgrilla.length) {
        this.solicitudesgrilla.forEach(solicitudEnGrilla => {
          if (solicitudEnGrilla.soliid === solicitudSeleccionada.soliid) {
            this.ValidaEstadoSolicitud(1, 'onConfirm');

            if (solicitudEnGrilla.codmei === solicitudSeleccionada.codmei) {
              // busca = false;
            }
          }
        });
      } else {
        busca = true;
      }

      if (busca) {
        const existeEnGrilla = this.solicitudesgrilla.some((solicitudEnGrilla) => {
          return solicitudEnGrilla.soliid === solicitudSeleccionada.soliid && solicitudEnGrilla.codmei === solicitudSeleccionada.codmei;
        });

        if (!existeEnGrilla) {
          this.solicitudesgrilla.push(solicitudSeleccionada);
        }
      }
    });

    this.solicitudseleccion1 = this.solicitudesgrilla;
    this.estado_aux = this.solicitudesgrilla[0].estado;
    this.ValidaEstadoSolicitud(1,'BuscaSolicitudes');
    this.solicitudesgrillaPaginacion = this.solicitudesgrilla.slice(0,20);

    this.dForm.reset();
    this.logicaGrabar();
    this.solicitudseleccion =[];
    this.text = "";
    this.text = "`<h2>"+this.TranslateUtil('key.mensaje.solicitud.preparacion')+"</h2><br/>";
    var i = 0;
    if(this.solicitudesgrilla.length>0){
      this.solicitudesgrilla.forEach(x=>{
        if(x.bandera=== 2){
          this.dForm.disable();
          if (i === 0) {
            this.textDetMed = this.textDetMed + "<p>"+this.TranslateUtil('key.solicitud')+" <strong>" + x.soliid + "</strong> en preparación " + "</p>";
          }else{
            this.textDetMed = this.textDetMed + "<p>"+this.TranslateUtil('key.solicitud')+" <strong>" + x.soliid + "</strong> en preparación " + "</p>";
          }
          x.bloqcampogrilla = false;
          this.textErr = true;
        }else{
          // this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
        }
      })
      if(this.textErr){
        Swal.fire({
          html: this.text + this.textDetMed  +"`",
        });
      }
      this.solicitudesgrillaPaginacion = this.solicitudesgrilla.slice( 0,20);
    }

  }

  validacantidadgrilla(despacho: Solicitudespacienteproducto){
    var idg =0;
    if(despacho.sodeid>0){
      if(this.IdgrillaDevolucion(despacho)>=0){
        idg = this.IdgrillaDevolucion(despacho)

        if(this.solicitudesgrilla[idg].cantadevolver > this.solicitudesgrilla[idg].cantdispensada- this.solicitudesgrilla[idg].cantdevuelta ){

          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.devolver.debe.ser.menor.igual.diferencia.cantidad.dispensada.devuelta');
          this.alertSwalAlert.show();
          // this.listaDetalleDespacho[idg].cantidadarecepcionar = this.listaDetalleDespacho[idg].cantdespachada- this.listaDetalleDespacho[idg].cantrecepcionada;
          this.solicitudesgrilla[idg].cantadevolver = this.solicitudesgrilla[idg].cantdispensada- this.solicitudesgrilla[idg].cantdevuelta;

        }else{
          if(this.solicitudesgrilla[idg].cantadevolver <=0){
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cantidad.despachar.mayor.cero');
            this.alertSwalAlert.show();
            this.solicitudesgrilla[idg].cantadevolver = this.solicitudesgrilla[idg].cantdispensada- this.solicitudesgrilla[idg].cantdevuelta;

          }else{
            if(despacho.cantadevolver < despacho.cantdispensada- despacho.cantdevuelta || despacho.cantadevolver >0){

            }
          }

        }
      }
    }
  }

  IdgrillaDevolucion(registro: Solicitudespacienteproducto) {

    let indice = 0;
    for (const articulo of this.solicitudesgrilla) {
      if (registro.soliid === articulo.soliid) {

        return indice;
      }
      indice++;
    }
    return -1;
  }

  onCancel() {
    this.solicitudseleccion = [];
    this.dForm.reset();
    this.logicaGrabar();
  }

  logicaGrabar() {
    /* verifica campos faltantes y deshabilita Grabar btn */
    if (this.solicitudesgrilla.length == 0) {
      this.solicitudexist = false;
    } else {
      /* verifica si campo CANT A DEVOLVER esta vacio */
      this.logicaVacios();
      if (this.vacios == true) {
        this.solicitudexist = false;
      }
      else {
        this.solicitudexist = true;
      }
    }
  }

  logicaVacios() {
    this.solicitudesgrilla.forEach(data => {
      if (data.cantadevolver == 0 || data.cantadevolver == null) {
        this.vacios = true;
        return;
      } else {
        this.vacios = false;
      }
    });
  }

  setDatos() {
    this.pForm.controls['nompaciente'].setValue(this.dataPacienteSolicitud.apepaternopac.concat(" ")
      .concat(this.dataPacienteSolicitud.apematernopac).concat(" ")
      .concat(this.dataPacienteSolicitud.nombrespac));
    this.pForm.controls['rut'].setValue(this.dataPacienteSolicitud.numdocpac);
    this.logicaBuscarSolicitud();
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  logicaBuscarSolicitud() {
    if (this.pForm.get('nompaciente').value !== null || this.pForm.get('rut').value !== null) {
      this.BuscaBodegaDestino();
      this.pForm.get('bodcodigo').enable();
      return true;
    } else {
      return false;
    }
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
      }
    };
    return dtModal;
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  uimensaje(status: string, texto: string, time: number = 0) {
    this.alerts = [];
    if (time !== 0) {
      this.alerts.push({
        type: status,
        msg: texto,
        timeout: time
      });
    } else {
      this.alerts.push({
        type: status,
        msg: texto
      });
    }
  }

  onImprimir(){
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
        if(this.URLReporte != null) {
          window.open(this.URLReporte, "", "");
        } else {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.listado');
          this.alertSwalError.show();
        }
      }
    })
  }

  ActivarBotonDevolver(){
    // Identificado el pacinete y con datos en la grilla
    if ( this.pForm.get('nompaciente').value != null
    && this.solicitudesgrilla.length >0
    ) {
      return true

    } else {
      return false

    }

  }

  ActivarEliminar(){

  // Identificado el pacinete y con datos en la grilla
  if ( this.pForm.get('nompaciente').value != null
    && this.solicitudesgrilla.length >0
    ) {
      return true

      } else {
      return false

    }
  }

  SeleccionaDescripcion(descripcion: string){
    this.descprod = descripcion;
    this.codprod = null;
    if(this.descprod === null || this.descprod === ''){
      return;
    } else{
        this._BSModalRef = this._BsModalService.show(BusquedaProdDevolComponent, this.setModalBusquedaProductos());
        this._BSModalRef.content.onClose.subscribe((response: any) => {
          if (response == undefined) { }
          else {
            this.dForm.get('codmei').setValue(response.codigo);
            this.dForm.get('descripcion').setValue(response.descripcion);
            this.loading = false;
          }
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error')+": ";
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.encontro.producto');
          this.alertSwalError.show();
        }
        )
      // }
    }
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
        id_Bodega: 0,
        descprod: this.descprod,//
        codprod: this.codprod,
        rut: this.pForm.controls.rut.value
      }
    };
    return dtModal;
  }

  getProducto(codigo: any) {

    this.codprod = codigo;

    if(this.codprod === null || this.codprod === ''){

      this.addArticuloGrilla()
        // return;
    } else{
      var tipodeproducto = 'MIM';
      this.loading = true;
      var controlado = '';
      var controlminimo = '';
      var idBodega = this.pForm.controls.bodcodigo.value;
      var consignacion = '';

      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
      this.cmecodigo, codigo, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
      , this.usuario, null, this.servidor).subscribe(
        response => {
          if (response != null) {
            if (response.length == 0) {
              this.loading = false;
              this.addArticuloGrilla();
            }
            else {
              if (response.length > 1) {
                this.loading = false;
                this.addArticuloGrilla();
              }else{
                if(response.length ==1){
                  this.productoselec = response[0];
                  this.dForm.get('codmei').setValue(response[0].codigo);
                  this.dForm.get('descripcion').setValue(response[0].descripcion);
                  this.loading = false;
                }
              }
            }
          } else {
            this.loading = false;
            this.addArticuloGrilla();
          }
        }, error => {
          this.loading = false;
        });
    }
  }

  async addArticuloGrilla() {
    this.alertSwalError.title = null;
    this.alertSwalError.text = null;

    this._BSModalRef = this._BsModalService.show(BusquedaProdDevolComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) { }
      else {

        this.productoselec = response;
        this.dForm.get('codmei').setValue(response.codigo);
        this.dForm.get('descripcion').setValue(response.descripcion);
        this.loading = false;

      }
    },
    error => {
      this.loading = false;
      this.alertSwalError.title = this.TranslateUtil('key.title.error')+": ";
      this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.encontro.producto');
      this.alertSwalError.show();
    })
  }

  async CambioCheck(registro: Solicitudespacienteproducto,event:any,marcacheckgrilla: boolean){

    if(event.target.checked){
      registro.marcacheckgrilla = true;
      this.desactivabtnelim = true;
      await this.isEliminaIdGrilla(registro)
      await this.solicitudesgrilla.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;
        }
      })
     }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelim = false;
      await this.isEliminaIdGrilla(registro);
      await this.solicitudesgrilla.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelim = true;

        }
      });
    }
  }

  isEliminaIdGrilla(registro: Solicitudespacienteproducto) {

    let indice = 0;
    for (const articulo of this.solicitudesgrilla) {
      if (registro.codmei === articulo.codmei && registro.sodeid === articulo.sodeid) {
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
      title: this.TranslateUtil('key.mensaje.pregunta.desea.eliminar.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminar.solicitud'),
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

    this.solicitudesgrillaPaginacion.forEach(registro=>{
      if (this.IdgrillaDevolucion(registro) >= 0 && registro.sodeid > 0) {
        // Elominar registro nuevo la grilla
        if(registro.marcacheckgrilla === true){
          this.desactivabtnelim = false;
          this.solicitudesgrilla.splice(this.IdgrillaDevolucion(registro), 1);
          this.solicitudesgrillaPaginacion = this.solicitudesgrilla.slice(0, 20);
          this.logicaVacios();
          this.ValidaEstadoSolicitud(1,"EliminaProductoGrilla")
        }
      } else {
        // elimina uno nuevo pero que se ha modificado la cantidad
        if(registro.marcacheckgrilla === true){
          this.desactivabtnelim = false;
          this.solicitudesgrilla.splice(this.IdgrillaDevolucion(registro), 1);
          this.solicitudesgrillaPaginacion = this.solicitudesgrilla.slice(0, 20);
          this.logicaVacios();
          this.ValidaEstadoSolicitud(1,"EliminaProductoGrilla")
          // elimina uno que ya existe
          //this.arregloDetalleProductoSolicitud[id].acciond = 'E';
          //this.ModificarSolicitud("M");
        }
      }
    })
  }

  ValidaEstadoSolicitud( bandera: number, nada:string){
    var recetaid : number = 0;
    var soliid   : number = 0;
    if(this.solicitudesgrilla != undefined){
      this.solicitudesgrilla.forEach(x=>{
        if(x.soliid === undefined){
          soliid = 0;
        }else{
          soliid = x.soliid;
        }
        this._solicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,
          ' ',recetaid,bandera).subscribe(
          response => { });
      });

    } else {
      soliid = 0;
    }

    this._solicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,
      ' ',recetaid,bandera).subscribe(
      response => { });

  }

  salir(){
    if(this.solicitudesgrilla.length>0){
      if(this.solicitudesgrilla[0].bandera != 2){
        this.ValidaEstadoSolicitud(1,'salir');
      }
      this.route.paramMap.subscribe(param => {
        this.router.navigate(['home']);
      })
    }else{
      this.route.paramMap.subscribe(param => {
      this.router.navigate(['home']);
      })
    }
  }

  BuscaBodegaDestino() {
    this._BodegasService.combobodegadevpac(this.hdgcodigo, this.esacodigo, this.cmecodigo,this.usuario, this.servidor,this.dataPacienteSolicitud.cliid).subscribe(
      response => {
        if (response == null || response.length === 0) {
          return;
        }

        this.bodegasdestino = response;
        this.pForm.patchValue({
          bodcodigo: 0,
        });
      },
      error => {
        alert("Error al Buscar Bodegas de Destino");
      }
    );
  }

  SeleccionaBodega(){
    if (this.pForm.value.bodcodigo <= 0) {
      this.dForm.get('codmei').disable();
      this.dForm.get('soliid').disable();
      this.dForm.get('cantidad').disable();
      this.dForm.get('lote').disable();
      this.dForm.get('fechavto').disable();
      this.dForm.get('descripcion').disable();
      this.solicitudexist = false
      return;      
    } 

    this.dForm.get('codmei').enable();
    this.dForm.get('soliid').enable();
    this.dForm.get('cantidad').enable();
    this.dForm.get('lote').enable();
    this.dForm.get('fechavto').enable();
    this.dForm.get('descripcion').enable();    
    this.logicaGrabar()
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
