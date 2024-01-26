import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subject} from 'rxjs';

import { Solicitud } from '../../models/entity/Solicitud';
import { DetalleSolicitud } from '../../models/entity/DetalleSolicitud';
import { Solicitudespacienteproducto } from '../../models/entity/Solicitudespacienteproducto';
import { TipoRechazo } from 'src/app/models/entity/TipoRechazo';
import { ParamDetDevolPacRechazo } from 'src/app/models/entity/ParamDetDevolPacRechazo';
import { ParamDevolPacRechazo } from 'src/app/models/entity/ParamDevolPacRechazo';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { ModalvalidausuariodevolsolicitudComponent } from '../modalvalidausuariodevolsolicitud/modalvalidausuariodevolsolicitud.component';

import { SolicitudService } from '../../servicios/Solicitudes.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { DatePipe } from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-modalsolicitudpacdevuelta',
  templateUrl: './modalsolicitudpacdevuelta.component.html',
  styleUrls: ['./modalsolicitudpacdevuelta.component.css']
})
export class ModalsolicitudpacdevueltaComponent implements OnInit {
  @Input() hdgcodigo            : number;
  @Input() esacodigo            : number;
  @Input() cmecodigo            : number;
  @Input() titulo               : string;
  @Input() nombrepaciente       : string;
  @Input() apepaternopac        : string;
  @Input() apematernopac        : string;
  @Input() tipodocumento        : string;
  @Input() numeroidentificacion : string;
  @Input() numsolicitud         : number;
  @Input() servidor             : string;
  @Input() paciente             : string;
  @Input() usuario              : string;
  @Input() estadosolicitud      : number;
  @Input() fecdevolucion        : string;

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos           : Permisosusuario = new Permisosusuario();
  public FormSolicitudDevuelta    : FormGroup;
  public FormLogin                : FormGroup;
  public estado                   : boolean = false;
  public loading                  = false;
  public dataPacienteSolicitud    : Solicitud = new Solicitud();
  public arregloSolicitudDevueltaPaginacion : Array<DetalleSolicitud> = [];
  public arregloSolicitudDevuelta : Array<DetalleSolicitud> = [];
  public Arreglotiposrechazos     : Array<TipoRechazo> = [];
  public activarecepcionar        : boolean = false;
  public arrParamDetDevolPaciente : Array<ParamDetDevolPacRechazo> = [];
  public recepciondevolpaciente   : ParamDevolPacRechazo = new ParamDevolPacRechazo;//Array<ParamDevolPacRechazo> = [];
  public levantaautorizacion      : boolean = false;
  private _BSModalRef             : BsModalRef;
  public usuariorechaza           : string;
  public vacios                   = true;
  public verificanull             : boolean = false;
  public vaciosarechazar          = true;
  public vaciosarecepcionar       = true;
  public onClose                  : Subject<ParamDevolPacRechazo>;
  public onClose2                 : Subject<string>;
  public respuesta                : ParamDevolPacRechazo;
  public estado_aux               : number;

  constructor(
    public bsModalRef       : BsModalRef,
    public _solicitudService: SolicitudService,
    public _pacienteService : PacientesService,
    private formBuilder     : FormBuilder,
    public _BsModalService  : BsModalService,
    public datePipe         : DatePipe,
    public translate: TranslateService
  ) {
    this.FormSolicitudDevuelta = this.formBuilder.group({

      hdgcodigo     : [{ value: null, disabled: false }, Validators.required],
      esacodigo     : [{ value: null, disabled: false }, Validators.required],
      cmecodigo     : [{ value: null, disabled: false }, Validators.required],
      bodcodigo     : [{ value: null, disabled: false }, Validators.required],
      servicio      : [{ value: 1, disabled: false }, Validators.required],
      fechadesde    : [null, Validators.required],
      fechahasta    : [new Date(), Validators.required],
      numsolicitud  : [{ value: null, disabled: true}, Validators.required],
      tipodocumento : [{ value: null, disabled: false }, Validators.required],
      numidentificacion: [{ value: null, disabled: false }, Validators.required],
      nombrepaciente: [{ value: null, disabled: true }, Validators.required]

    });

    this.FormLogin = this.formBuilder.group({
      usuario   : [null],
      contraseña: [null]
    });
  }

  ngOnInit() {

    this.onClose = new Subject();

    this.FormSolicitudDevuelta.get('numsolicitud').setValue(this.numsolicitud);

    if(this.nombrepaciente === null || this.nombrepaciente === undefined){
      this.FormSolicitudDevuelta.get('nombrepaciente').setValue(this.paciente);
    }else{
      this.FormSolicitudDevuelta.get('nombrepaciente').setValue(this.nombrepaciente +" "+
      this.apepaternopac +" "+this.apematernopac)
    }

    this._solicitudService.TipoRechazo(this.hdgcodigo, this.esacodigo,this.cmecodigo, this.servidor).subscribe(
      data => {

        this.Arreglotiposrechazos = data;
      }, err => {
      }
    );

    this.BuscaSolicitud();
  }

  onCerrarSalir() {
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'salir');
      }
    }
    this.estado = false;
    this.bsModalRef.hide();
  };

  async BuscaSolicitud(){
    let fechadev = this.fecdevolucion;
    this.loading = true;
    this._solicitudService.BuscaSolicitud(this.numsolicitud, this.hdgcodigo,
      this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, -1, 0, 0, 0, 0, "",
      0,"","",fechadev).subscribe(
      async  response => {
        if (response != null) {
          this.dataPacienteSolicitud = response[0];
          this.estado_aux = this.dataPacienteSolicitud.estadosolicitud;
          this.dataPacienteSolicitud.solicitudesdet.forEach(x=>{
            if(x.sodecantadev>0){
              var temporal = new DetalleSolicitud;
              temporal = x;
              x.tiporechazo = this.Arreglotiposrechazos;
              x.cantidadarecepcionar = x.sodecantadev;
              x.cantidadarecepcionarresp = x.cantidadarecepcionar;
              x.cantidadarechazar = 0;
              x.bloqcampogrilla = true;
              x.bloqcampogrilla2 = true;
              if(x.cantidadarecepcionar >0){
                this.activarecepcionar = true;
              }
              this.arregloSolicitudDevuelta.unshift(temporal)
            }
          });

          this.arregloSolicitudDevueltaPaginacion = this.arregloSolicitudDevuelta.slice(0,20);
          this.logicaVacios();
          this.loading = false;
          if(this.dataPacienteSolicitud.bandera === 2){
            this.verificanull = false;
            this.arregloSolicitudDevuelta.forEach(x=>{
              x.bloqcampogrilla = true;
              x.bloqcampogrilla2 = true;
              x.bloqcampogrilla3 = true;
            })
            this.arregloSolicitudDevueltaPaginacion = this.arregloSolicitudDevuelta.slice( 0,20);
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.solicitud.preparacion');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.ser.modificada');
            this.alertSwalAlert.show();
          }else{
            this.ValidaEstadoSolicitud(2,'BuscaSolicitudes');
          }
        } else {
          this.loading = false;
        }
        console.log("this.arregloSolicitudDevuelta : ", this.arregloSolicitudDevuelta);
      }, error => {
        this.loading = false;
        this.alertSwalError.title = "Error";
        this.alertSwalError.text = error.message;
        this.alertSwalError.show();
      }
    );
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloSolicitudDevueltaPaginacion = this.arregloSolicitudDevuelta.slice(startItem, endItem);
  }

  CantidadADevolver(registro: DetalleSolicitud){
    this.alertSwalAlert.title = null;

    var sumacantidades = 0;

    sumacantidades = (registro.cantidadarecepcionar + registro.cantidadarechazar)
    if(registro.cantidadarechazar === 0){

      registro.bloqcampogrilla = true;
      registro.bloqcampogrilla2= true;
      registro.observaciones   = null;
      registro.tiporechazo     = [];
      this.levantaautorizacion = false;

      registro.codtiporechazo =  this.Arreglotiposrechazos[0].codtiporechazo;

      this.logicaVacios();
      if(sumacantidades > registro.sodecantadev){// || sumacantidades < registro.sodecantadev){

        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.cantidad.aceptada.erronea');
        this.alertSwalAlert.show();
        registro.cantidadarecepcionar = registro.cantidadarecepcionarresp;
        this.logicaVacios();
      }else{
        if(registro.cantidadarecepcionar <0){
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.ingresar.valores.mayor.cero');
          this.alertSwalAlert.show();
          registro.cantidadarecepcionar = registro.cantidadarecepcionarresp;
          this.logicaVacios();
        }else{
          // if((registro.cantidadarecepcionar + registro.cantidadarechazar)>registro.sodecantadev ){
          //   this.alertSwalAlert.title = "Cantidad Aceptada errónea.";
          //   this.alertSwalAlert.show();
          //   registro.cantidadarecepcionar = registro.cantidadarecepcionarresp;
          // }else{
            if(registro.cantidadarecepcionar === 0){
              this.activarecepcionar= false;
            }
          // }

            this.logicaVacios();
        }
      }
    }else{

      if(sumacantidades >registro.sodecantadev){// || sumacantidades < registro.sodecantadev){

        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.cantidad.aceptada.erronea');
        this.alertSwalAlert.show();
        registro.cantidadarecepcionar = registro.cantidadarecepcionarresp;
        this.logicaVacios();
      }else{

        this.logicaVacios();
      }
    }

  }

  CantidadRechazo(registro: DetalleSolicitud){
    this.alertSwalAlert.title = null;
    var sumacantidades = 0;

    if(registro.tiporechazo.length === 0){
      registro.tiporechazo = this.Arreglotiposrechazos;

    }
    sumacantidades = registro.cantidadarechazar + registro.cantidadarecepcionar;

    if(registro.cantidadarecepcionar ===0){

      if(sumacantidades > registro.sodecantadev){// || sumacantidades <registro.sodecantadev){
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.puede.rechazar.revise.cantidad.aceptada');
        this.alertSwalAlert.show();
        registro.cantidadarechazar = 0;
        this.logicaVacios();
      }else{
        if(registro.cantidadarechazar ===0){
          registro.bloqcampogrilla = true;
          registro.bloqcampogrilla2= true;
          registro.observaciones   = null;
          registro.tiporechazo     = [];
          this.levantaautorizacion = false;
          // registro.tiporechazo = this.Arreglotiposrechazos;

          registro.codtiporechazo =  this.Arreglotiposrechazos[0].codtiporechazo;

          this.logicaVacios();

        }else{
          if(registro.cantidadarechazar < 0){
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.ingresar.valores.mayor.cero');
            this.alertSwalAlert.show();
            registro.cantidadarechazar = 0;
            this.logicaVacios();
          }else{

            registro.bloqcampogrilla = false;
            if(registro.observaciones != null || registro.observaciones != ""){
              this.logicaVacios();
            }
          }
        }
      }
    }else{
      if(sumacantidades > registro.sodecantadev || sumacantidades <registro.sodecantadev){
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.puede.rechazar.revise.cantidad.aceptada');
        this.alertSwalAlert.show();
        registro.cantidadarechazar = 0;
        registro.bloqcampogrilla = true;
        this.logicaVacios();
      }else{
        if(registro.cantidadarechazar <0){
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.ingresar.valores.mayor.cero');
          this.alertSwalAlert.show();
          registro.cantidadarechazar = 0;
          registro.bloqcampogrilla = true;
          registro.bloqcampogrilla2 = true;
          this.logicaVacios();
        }else{
          if(registro.cantidadarechazar === 0){
            registro.bloqcampogrilla = true;
            registro.bloqcampogrilla2 = true;
            registro.observaciones = null;
            registro.tiporechazo = [];
            this.levantaautorizacion = false;
            registro.codtiporechazo =  this.Arreglotiposrechazos[0].codtiporechazo;
            this.logicaVacios();
          }else{
            registro.bloqcampogrilla = false;
            this.logicaVacios();
          }
        }
      }
    }
  }

  SeleccionaRechazo(registro:DetalleSolicitud,event:any){

    registro.codtiporechazo = parseInt(event);
    registro.bloqcampogrilla2 = false;
  }

  onDevolver(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.recepcionar.devolucion'),
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then(async (result) => {
      if (result.value) {
        this.arregloSolicitudDevuelta.forEach(x=>{
          if(x.cantidadarechazar !=0 ){
            this.levantaautorizacion = true;
          }
        });
        if(this.levantaautorizacion === true){
          this.LevantaModalAutoriza();
        }else{
          this.RecepcionDevolucion();
        }
      }
    });
  }

  LevantaModalAutoriza(){

    this._BSModalRef = this._BsModalService.show(ModalvalidausuariodevolsolicitudComponent, this.setModal());
    this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
      if (Retorno !== undefined) {
        this.usuariorechaza = Retorno;
        this.RecepcionDevolucion();
      }else{
            // this.loading = false;
      }
    });
  }

  setModal() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-sm',
      initialState: {
        titulo: this.TranslateUtil('key.title.autorizacion.rechazo'),
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        arreglo: this.arregloSolicitudDevuelta,
        servidor: this.servidor,
        usuario: this.usuario,
        mensajeError: this.TranslateUtil('key.mensaje.error.usuario.sin.privilegios.rechazo.devolucion')
      }
    };
    return dtModal;
  }

  RecepcionDevolucion(){
    let temporal:  ParamDetDevolPacRechazo;
    let index : number = 0;
    this.arregloSolicitudDevuelta.forEach(element=>{
      temporal = new(ParamDetDevolPacRechazo);
      temporal.soliid            = element.soliid;
      temporal.sodeid            = element.sodeid;
      temporal.codmei            = element.codmei;
      temporal.idmovimientodet   = 0;
      temporal.cantdispensada    = element.cantdespachada;
      temporal.cantdevuelta      = element.cantdevolucion;
      temporal.cantidadadevolver = element.cantidadarecepcionar;
      temporal.cantidadarechazar = element.cantidadarechazar;
      temporal.observaciones     = element.observaciones;
      temporal.codtiporechazo    = Number(element.codtiporechazo);
      if( !element.detallelote.length || element.detallelote === null) {
        temporal.lote              = null;
        temporal.fechavto          = null;

      } else {
        for( let lotedetalle of element.detallelote) {
          temporal.lote              = lotedetalle.lote;
          temporal.fechavto          = lotedetalle.fechavto;

        }

      }
      index++;
      this.arrParamDetDevolPaciente.push(temporal);
    });

    this.recepciondevolpaciente.hdgcodigo = this.hdgcodigo;
    this.recepciondevolpaciente.esacodigo = this.esacodigo;
    this.recepciondevolpaciente.cmecodigo = this.cmecodigo;
    this.recepciondevolpaciente.servidor = this.servidor;
    this.recepciondevolpaciente.usuariodespacha = this.usuario;
    this.recepciondevolpaciente.ctaid = this.dataPacienteSolicitud.ctaid;
    this.recepciondevolpaciente.paramdetdevolpaciente = this.arrParamDetDevolPaciente;
    this.recepciondevolpaciente.usuariorechaza = this.usuariorechaza;
    this.recepciondevolpaciente.codambito = this.dataPacienteSolicitud.codambito;
    this.loading = true;
    this._pacienteService.RecepcioDevolucionPacienteRechazo(this.recepciondevolpaciente).subscribe(
      resp => {
        this.respuesta = resp;
        this.alertSwal.title = this.TranslateUtil('key.mensaje.recepcion.exitosa');
        this.alertSwal.show();
        this.verificanull = false;
      }
    );
  }

  onCerrar() {
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'salir');
      }
    }
    this.onClose.next(this.respuesta);
    this.bsModalRef.hide();
  };

  async logicaVacios(){

    await this.vacioARechazar();
    await this.vacioARecepcionar();

    if (this.vaciosarechazar === true && this.vaciosarecepcionar === true) {
      this.verificanull = true;
    }
    else {
      this.verificanull = false;
    }
    if(this.dataPacienteSolicitud.bandera === 2){
      this.verificanull = false;
    }
  }

  vacioARechazar(){
    if (this.arregloSolicitudDevueltaPaginacion.length) {
      for (var data of this.arregloSolicitudDevueltaPaginacion) {
        if(data.cantidadarechazar === 0){
          if(data.cantidadarecepcionar >data.sodecantadev || data.cantidadarecepcionar < data.sodecantadev){
            this.vaciosarechazar =false;
            return;
          }else{
            this.vaciosarechazar = true;
          }
        }else{
          if((data.cantidadarecepcionar+data.cantidadarechazar) >data.sodecantadev
          || (data.cantidadarechazar+ data.cantidadarecepcionar) < data.sodecantadev){
            this.vaciosarechazar =false;

            return;
          }else{
            this.vaciosarechazar = true;
          }
        }
      }
    }
  }

  vacioARecepcionar(){
    if (this.arregloSolicitudDevueltaPaginacion.length) {
      for (var data of this.arregloSolicitudDevueltaPaginacion) {
        if(data.cantidadarecepcionar === 0){

          if(data.cantidadarechazar > data.sodecantadev || data.cantidadarechazar<data.sodecantadev){
            this.vaciosarecepcionar = false;
            return;
          }else{
            this.vaciosarecepcionar= true;
          }
        }else{
          if((data.cantidadarechazar + data.cantidadarecepcionar) > data.sodecantadev
          || (data.cantidadarechazar + data.cantidadarecepcionar)<data.sodecantadev){
            this.vaciosarecepcionar = false;

            return;
          }else{
            this.vaciosarecepcionar = true;
          }
        }
      }
    }
  }

  ValidaEstadoSolicitud(bandera: number, nada:string){
    var recetaid : number = 0;
    var soliid   : number = 0;
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.soliid === undefined){
        soliid = 0;
      }else{
        soliid = this.dataPacienteSolicitud.soliid;
      }
    } else {
      soliid = 0;
    }


    this._solicitudService.ValidaEstadoSolicitudCargada(soliid,0,this.servidor,
      ' ',recetaid,bandera).subscribe(
      response => { });

  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {​​​​​​​​
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(evt: KeyboardEvent) {
    if(this.dataPacienteSolicitud != undefined){
      if(this.dataPacienteSolicitud.bandera != 2){
        this.ValidaEstadoSolicitud(1,'destroy');
      }
    }
  }
  ​​​​​​​​
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
