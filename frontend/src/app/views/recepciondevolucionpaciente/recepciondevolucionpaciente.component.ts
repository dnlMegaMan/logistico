import { Component, OnInit, ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { environment } from '../../../environments/environment';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';

import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { DocIdentificacion } from '../../models/entity/DocIdentificacion';
import { Solicitud } from '../../models/entity/Solicitud';
import { SolicitudPacienteDevuelta } from 'src/app/models/entity/SolicitudPacienteDevuelta';
import { Servicio } from 'src/app/models/entity/Servicio';

import { ModalsolicitudpacdevueltaComponent } from '../modalsolicitudpacdevuelta/modalsolicitudpacdevuelta.component';

import { EstructuraunidadesService } from '../../servicios/estructuraunidades.service';
import { BodegasService } from '../../servicios/bodegas.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { DocidentificacionService } from '../../servicios/docidentificacion.service';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-recepciondevolucionpaciente',
  templateUrl: './recepciondevolucionpaciente.component.html',
  styleUrls: ['./recepciondevolucionpaciente.component.css']
})
export class RecepciondevolucionpacienteComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos         : Permisosusuario = new Permisosusuario();
  public FormRecepcionDevolPac  : FormGroup;

  public hdgcodigo              : number;
  public esacodigo              : number;
  public cmecodigo              : number;
  public usuario                = environment.privilegios.usuario;
  public servidor               = environment.URLServiciosRest.ambiente;
  private _BSModalRef           : BsModalRef;
  public bsConfig               : Partial<BsDatepickerConfig>;
  public locale                 = 'es';
  public colorTheme             = 'theme-blue';
  public btnimprime             : boolean = false;
  public loading                = false;
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public servicios              : Array<Servicio> = [];
  public activabtnbuscar        : boolean = false;
  public docsidentis            : Array<DocIdentificacion> = [];
  public dataPacienteSolicitud  : Solicitud = new Solicitud();// Guarda datos de la busqueda
  public arregloSolicitudDevueltaPaginacion: Array<SolicitudPacienteDevuelta> = [];
  public arregloSolicitudDevuelta: Array<SolicitudPacienteDevuelta> = [];
  public alerts                 : Array<any> = [];
  public solicitudexist         = false;
  public page                   : number = 0;

  public FormFiltro       : FormGroup;
  public serviciosFiltro  : Array<Servicio> = [];
  public optSol           : string = "ASC";

  constructor(

    private formBuilder             : FormBuilder,
    public localeService            : BsLocaleService,
    public _BodegasService          : BodegasService,
    public _pacienteService         : PacientesService,
    public datePipe                 : DatePipe,
    public DocidentificacionService : DocidentificacionService,
    public _PacientesService        : PacientesService,
    public _BsModalService          : BsModalService,
    public estructuraunidadesService: EstructuraunidadesService,
    public translate: TranslateService
  ) {
    this.FormRecepcionDevolPac = this.formBuilder.group({

      hdgcodigo     : [{ value: null, disabled: false }, Validators.required],
      esacodigo     : [{ value: null, disabled: false }, Validators.required],
      cmecodigo     : [{ value: null, disabled: false }, Validators.required],
      bodcodigo     : [{ value: null, disabled: false }, Validators.required],
      servicio      : [{ value: null, disabled: true }, Validators.required],
      fechadesde    : [new Date(), Validators.required],
      fechahasta    : [new Date(), Validators.required],
      numsolicitud  : [{ value: null, disabled: false}, Validators.required],
      tipodocumento : [{ value: null, disabled: false }, Validators.required],
      numidentificacion: [{ value: null, disabled: false }, Validators.required],
      nombrepaciente: [{ value: null, disabled: true }, Validators.required]
    });

    this.FormFiltro = this.formBuilder.group({
      numsolicitud  : [{ value: null, disabled: false }, Validators.required],
      fecdevolucion : [{ value: null, disabled: false }, Validators.required],
      codservicio   : [{ value: null, disabled: false }, Validators.required],
      paciente      : [{ value: null, disabled: false }, Validators.required],
      numdoc        : [{ value: null, disabled: false }, Validators.required],
      usuarioorig   : [{ value: null, disabled: false }, Validators.required],
      usuariodevol  : [{ value: null, disabled: false }, Validators.required],
    });
   }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.FormRecepcionDevolPac.controls.servicio.disable();
    this.FormRecepcionDevolPac.controls.fechadesde.disable();
    this.FormRecepcionDevolPac.controls.fechahasta.disable();
    this.FormRecepcionDevolPac.controls.numidentificacion.disable();

    this.BuscaBodegaSolicitante();
    this.getParametros();
    this.setDate();
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  async getParametros() {
    try {
      this.docsidentis = await this.DocidentificacionService.list(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), false)
        .toPromise();
        // console.log("this.docsidentis",this.docsidentis)
    }catch (err) {
      this.alertSwalAlert.text = err.message;
      this.alertSwalAlert.show();
    }
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

  async ListarEstServicios() {
    this.FormRecepcionDevolPac.controls.servicio.enable();
    this.FormRecepcionDevolPac.controls.fechadesde.enable();
    this.FormRecepcionDevolPac.controls.fechahasta.enable();
    this.ActivaBotonBuscar();

    try {
      this.loading = true;
      this.servicios = await this.estructuraunidadesService.BuscarServicios(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.usuario,
        this.servidor,
        3,
        ''
      ).toPromise();

      this.loading = false;
      // console.log("servcios:",this.servicios)

    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  ActivaBotonBuscar(){
    this.activabtnbuscar = true;
  }

  limpiar(){
    this.FormRecepcionDevolPac.reset();
    this.FormRecepcionDevolPac.controls.servicio.disable();
    this.FormRecepcionDevolPac.controls.fechadesde.disable();
    this.FormRecepcionDevolPac.controls.fechahasta.disable();
    this.FormRecepcionDevolPac.controls.numidentificacion.disable();
    this.activabtnbuscar = false;
    this.arregloSolicitudDevuelta = [];
    this.arregloSolicitudDevueltaPaginacion = [];
    this.FormRecepcionDevolPac.get('fechahasta').setValue(new Date());
    this.optSol = "ASC"
    this.page = 0;

    this.FormFiltro.reset();
  }
  SeleccionTipoDoc(){
    this.FormRecepcionDevolPac.controls.numidentificacion.enable();
  }

  getPacienteTipoDoc(){

    this._PacientesService.BuscaPacientesAmbito(this.hdgcodigo, this.cmecodigo, this.esacodigo,
      this.FormRecepcionDevolPac.controls.tipodocumento.value,
      this.FormRecepcionDevolPac.controls.numidentificacion.value,null,null, null,null,null,null,
      this.servidor,null,0).subscribe(
        response => {
          if (response != null) {
            if(response.length === 1){
              this.dataPacienteSolicitud = response[0];
              this.FormRecepcionDevolPac.get('nombrepaciente').setValue(this.dataPacienteSolicitud.apepaternopac.concat(" ")
              .concat(this.dataPacienteSolicitud.apematernopac).concat(" ")
              .concat(this.dataPacienteSolicitud.nombrespac));
            }else{
              if(response.length===0){
                this.docsidentis.forEach(element => {
                  if(element.docidentcodigo === this.FormRecepcionDevolPac.get('tipodocumento').value ){
                    //this.alertSwalAlert.title = "No existe Paciente para el tipo de documento ingresado";
                    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.paciente.tipo.documento.ingresado');
                    this.alertSwalAlert.show();
                  }
                });
              }
            }
          }
        }
      );
  }

  /**
   * Actualización
   * fecha: 27/12/2021
   * cambios:
   *  loading al consultar
   *  limpiar grilla al no traer data
   * autor: miguel.lobos@sonda.com
   */
  BuscarSolicitudes(){
    this.loading = true;
    this.page = 0;
    this._pacienteService.BuscaSolicitudesDevueltasPaciente(this.servidor,this.hdgcodigo,
      this.esacodigo,this.cmecodigo,this.FormRecepcionDevolPac.controls.bodcodigo.value,
      this.FormRecepcionDevolPac.controls.servicio.value,
      this.FormRecepcionDevolPac.controls.numsolicitud.value,
      this.dataPacienteSolicitud.nombrespac,this.dataPacienteSolicitud.apepaternopac,
      this.dataPacienteSolicitud.apematernopac,this.FormRecepcionDevolPac.controls.tipodocumento.value,
      this.FormRecepcionDevolPac.controls.numidentificacion.value,
      this.datePipe.transform(this.FormRecepcionDevolPac.controls.fechadesde.value, 'yyyy-MM-dd'),
      this.datePipe.transform(this.FormRecepcionDevolPac.controls.fechahasta.value, 'yyyy-MM-dd')).subscribe(
      resp => {
        if(resp[0].mensajes[0].estado){
          this.arregloSolicitudDevuelta = resp
          this.arregloSolicitudDevueltaPaginacion = this.arregloSolicitudDevuelta; //.slice(0,20);
          this.loading = false;
        } else {
          this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.sin.datos');
          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existen.solicitudes.pendientes.recepcion');
          this.alertSwalAlert.show();
          this.loading = false;
          this.arregloSolicitudDevueltaPaginacion = [];

        }
      }
    );
    this.loading = false;
  }

  SolicitudDevuelta(registro: any){

    this._BSModalRef = this._BsModalService.show(ModalsolicitudpacdevueltaComponent, this.setModal(registro));
    this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
      if(Retorno.mensaje === "Exito" || Retorno === undefined) {
        this.BuscarSolicitudes();
      }
    },
    error => {
      console.log(error);
    });
  }

  setModal(registro: any) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.recepcion.devolucion.pacientes'),
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Medico',
        numsolicitud: registro.numsolicitud,
        estadosolicitud: registro.estadosolicitud ,
        nombrepaciente: this.dataPacienteSolicitud.nombrespac,
        apepaternopac: this.dataPacienteSolicitud.apepaternopac,
        apematernopac: this.dataPacienteSolicitud.apematernopac,
        codservicioactual: this.dataPacienteSolicitud.codservicioactual,
        tipodocumento: this.dataPacienteSolicitud.tipodocpac,
        numeroidentificacion: this.dataPacienteSolicitud.numdocpac,
        fecdevolucion: registro.fecdevolucion,
        paciente: registro.paciente,
        servidor: this.servidor,
        usuario: this.usuario,
        buscasolicitud: "Solicitud_Paciente",
      }
    };
    return dtModal;
  }

  sortby (opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.optSol === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.optSol = "DESC";
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.optSol = "ASC"
    }

    switch (opt) {
      case 'numsolicitud':
        this.arregloSolicitudDevuelta.sort(function (a, b) {
          if (a.numsolicitud > b.numsolicitud) {
            return rtn1;
          }
          if (a.numsolicitud < b.numsolicitud) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'numidentificacion':
          this.arregloSolicitudDevuelta.sort(function (a, b) {
            if (a.numdocpac > b.numdocpac) {
              return rtn1;
            }
            if (a.numdocpac < b.numdocpac) {
              return rtn2;
            }
            // a must be equal to b
            return 0;
          });
          break;
      case 'fecdevolucion':
        this.arregloSolicitudDevuelta.sort(function (a, b) {
          if (a.fecdevolucion > b.fecdevolucion) {
            return rtn1;
          }
          if (a.fecdevolucion < b.fecdevolucion) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'codservicio':
        this.arregloSolicitudDevuelta.sort(function (a, b) {
          if (a.codservicio > b.codservicio) {
            return rtn1;
          }
          if (a.codservicio < b.codservicio) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'paciente':
        this.arregloSolicitudDevuelta.sort(function (a, b) {
          if (a.paciente > b.paciente) {
            return rtn1;
          }
          if (a.paciente < b.paciente) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'usuarioorig':
        this.arregloSolicitudDevuelta.sort(function (a, b) {
          if (a.usuarioorig > b.usuarioorig) {
            return rtn1;
          }
          if (a.usuarioorig < b.usuarioorig) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'usuariodevol':
        this.arregloSolicitudDevuelta.sort(function (a, b) {
          if (a.usuariodevol > b.usuariodevol) {
            return rtn1;
          }
          if (a.usuariodevol < b.usuariodevol) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;

      default:
        break;
    }
    this.arregloSolicitudDevueltaPaginacion = [];
    this.arregloSolicitudDevueltaPaginacion = this.arregloSolicitudDevuelta// .slice(0, 20);
  }

  filtro(){
    this.arregloSolicitudDevueltaPaginacion = [];
    this.arregloSolicitudDevueltaPaginacion = this.arregloSolicitudDevuelta// .slice(0, 20);
    var valida : boolean = false;

    var numsolicitud : number = this.FormFiltro.controls.numsolicitud.value;
    var fecdevol     : string = this.FormFiltro.controls.fecdevolucion.value;
    var numdoc       : string = this.FormFiltro.controls.numdoc.value;
    var codservicio  : string = this.FormFiltro.controls.codservicio.value;
    var paciente     : string = this.FormFiltro.controls.paciente.value;
    var usuarioorig  : string = this.FormFiltro.controls.usuarioorig.value;
    var usuariodevol : string = this.FormFiltro.controls.usuariodevol.value;

    var listabodegasFiltro : Array<SolicitudPacienteDevuelta> = this.arregloSolicitudDevuelta;
    var listaFiltro : Array<SolicitudPacienteDevuelta> = [];

    if(numsolicitud != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.numsolicitud === numsolicitud){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(fecdevol != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(this.datePipe.transform(element.fecsolicitud.slice(0,-9), 'dd-MM-yyyy') === this.datePipe.transform(fecdevol, 'dd-MM-yyyy')){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(codservicio != "" && codservicio != " " && codservicio != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        if(element.codservicio === codservicio){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(paciente != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.paciente.toUpperCase().indexOf(paciente.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(usuarioorig != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.usuarioorig.toUpperCase().indexOf(usuarioorig.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(usuariodevol != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.usuariodevol.toUpperCase().indexOf(usuariodevol.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(numdoc != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.numdocpac.toUpperCase().indexOf(numdoc.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if (valida) {
      this.arregloSolicitudDevueltaPaginacion = listaFiltro; //.slice(0,20);
    } else {
      this.arregloSolicitudDevueltaPaginacion = this.arregloSolicitudDevuelta// .slice(0, 20);
    }
  }

  limpiarFiltro(){
    this.FormFiltro.reset();
    this.filtro();
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
