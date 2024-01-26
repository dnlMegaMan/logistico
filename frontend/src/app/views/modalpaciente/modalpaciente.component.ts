import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject} from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { DatePipe } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
/* Models*/
import { ListaPacientes } from 'src/app/models/entity/ListaPacientes';
import { Paciente } from '../../models/entity/Paciente';
import { TipoDocumentoIdentificacion } from '../../models/entity/TipoDocumentoIdentificacion';
import { Unidades } from '../../models/entity/Unidades';
import { Piezas } from '../../models/entity/Piezas';
import { Camas } from '../../models/entity/Camas';

/* Services*/
import { PacientesService } from '../../servicios/pacientes.service'
import { TipodocumentoidentService } from '../../servicios/tipodocumentoident.service';
import { EstructuraunidadesService } from '../../servicios/estructuraunidades.service';
import { Servicio } from 'src/app/models/entity/Servicio';
import { loadavg } from 'os';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-modalpacienteComponent',
  templateUrl: './modalpaciente.component.html',
  styleUrls: ['./modalpaciente.component.css']
})

export class ModalpacienteComponent implements OnInit {
  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;
  @Input() tipodocpac: string;
  @Input() numdocpac: string;
  @Input() nombrepaciente: string;
  @Input() apepaternopac: string;
  @Input() apematernopac: string;
  @Input() omitirBusquedaUrgencia = false;
  @Input() omitirBusquedaHospitalizado = false;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  //Arr
  public listadopacientespaginacion : Array<Paciente> = [];
  public pacientes_urgencia         : Array<Paciente> = [];
  public pacientes_urgencia_paginacion: Array<Paciente> = [];
  public arreglotipodocumentoidentificacion: Array<TipoDocumentoIdentificacion> = [];
  public unidades                   : Array<Unidades> = [];
  public servicios                  : Array<Servicio> = [];
  public piezas                     : Array<Piezas> = [];
  public camas                      : Array<Camas> = [];
  public pacientes                  : Array<Paciente> = [];
  //Obj
  public bsConfig                   : Partial<BsDatepickerConfig>;
  public hForm                      : FormGroup;
  public uForm                      : FormGroup;
  //Var
  public servidor                   = environment.URLServiciosRest.ambiente;
  public usuario                    = environment.privilegios.usuario;
  public locale                     = 'es';
  public colorTheme                 = 'theme-blue';
  public estado                     : boolean = false;
  public onClose                    : Subject<ListaPacientes>;
  public paterno                    = null;
  public materno                    = null;
  public nombres                    = null;
  public loading                    = false;
  public desactivapacurgencia       : boolean = false;

  constructor(
    public bsModalRef                 : BsModalRef,
    public formBuilder                : FormBuilder,
    public _PacientesService          : PacientesService,
    public _TipodocumentoidentService : TipodocumentoidentService,
    public datePipe                   : DatePipe,
    public localeService              : BsLocaleService,
    public estructuraunidadesService  : EstructuraunidadesService,
    public translate                  : TranslateService
  ) {
    //tab Hospitalizado
    this.hForm = this.formBuilder.group({
      apellidopaterno : [{ value: null, disabled: false }, Validators.required],
      apellidomaterno : [{ value: null, disabled: false }, Validators.required],
      nombrespaciente : [{ value: null, disabled: false }, Validators.required],
      servicio        : [{ value: null, disabled: false }, Validators.required],
      pieza           : [{ value: null, disabled: true }, Validators.required],
      cama            : [{ value: null, disabled: true }, Validators.required],
      tipoidentificacion  : [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: true }, Validators.required],
    }
    );
    //tab Urgencia
    this.uForm = this.formBuilder.group({
      tipoidentificacion  : [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: true }, Validators.required],
      apellidopaterno : [{ value: null, disabled: false }, Validators.required],
      apellidomaterno : [{ value: null, disabled: false }, Validators.required],
      nombrespaciente : [{ value: null, disabled: false }, Validators.required],
      servicio            : [{ value: null, disabled: false }, Validators.required],
      pieza               : [{ value: null, disabled: true }, Validators.required],
    }
    );
  }

  ngOnInit() {

    if(this.esacodigo ===3){
      this.desactivapacurgencia = true;
    }
    if(this.tipodocpac != null || this.numdocpac != null || this.nombrepaciente != null ||
      this.apepaternopac != null || this.apematernopac != null || this.tipodocpac != undefined ||
      this.numdocpac != undefined || this.nombrepaciente != undefined ||
      this.apepaternopac != undefined || this.apematernopac != undefined){

        this.hForm.get('tipoidentificacion').setValue(this.tipodocpac);
        this.hForm.get('numeroidentificacion').setValue(this.numdocpac);
        this.hForm.get('nombrespaciente').setValue(this.nombrepaciente);
        this.hForm.get('apellidopaterno').setValue(this.apepaternopac);
        this.hForm.get('apellidomaterno').setValue(this.apematernopac);

        this.uForm.get('tipoidentificacion').setValue(this.tipodocpac);
        this.uForm.get('numeroidentificacion').setValue(this.numdocpac);
        this.uForm.get('nombrespaciente').setValue(this.nombrepaciente);
        this.uForm.get('apellidopaterno').setValue(this.apepaternopac);
        this.uForm.get('apellidomaterno').setValue(this.apematernopac);

        if (!this.omitirBusquedaHospitalizado) {
          this.BuscarPaciente('hospitalizado');
        }

        if (!this.omitirBusquedaUrgencia) {
          this.BuscarPaciente('urgencia'); 
        }
      }

    this.onClose = new Subject();
    this.setDate();
    this.ListarEstUnidades();
    this.ListarEstServicios();

    this._TipodocumentoidentService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario,this.servidor,  localStorage.getItem('language'), false).subscribe(
      data => {
        this.arreglotipodocumentoidentificacion = data;
      }, err => {
      }
    );

  }

  async ListarEstUnidades() {
    try {
      this.loading = true;
      this.unidades = await this.estructuraunidadesService.BuscarUnidades(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.usuario,
        this.servidor
      ).toPromise();

      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }

  async ListarEstServicios() {
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

    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }

  async ListarPiezas(serviciocod: string) {
    this.piezas = await this.estructuraunidadesService.BuscarPiezas(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      0,
      this.usuario,
      this.servidor,
      serviciocod
    ).toPromise();
  }

  async ListarCamas(idpieza: number) {
    this.camas = await this.estructuraunidadesService.BuscarCamas(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      idpieza,
      this.usuario,
      this.servidor
    ).toPromise();
    this.loading = false;
  }

  onSelectServicio(event: any) {
    this.piezas = [];
    this.camas = [];
    this.hForm.controls['pieza'].setValue(null);
    this.hForm.controls['cama'].setValue(null);
    this.hForm.controls['cama'].disable();
    const codservicio = event;

    this.hForm.controls['pieza'].enable();
    this.ListarPiezas(codservicio);
  }

  onSelectPieza(event: any) {
    this.loading = true;
    this.camas = [];
    this.hForm.controls['cama'].setValue(null);
    const idpieza = parseInt(event);
    this.hForm.controls['cama'].enable();
    this.ListarCamas(idpieza);
  }

  onCerrar(pacienteseleccionado: ListaPacientes) {
    this.estado = true;
    this.onClose.next(pacienteseleccionado);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.estado = false;
    this.bsModalRef.hide();
  };

  /**
   * Actualización
   * fecha: 3/1/2022
   * cambios:
   *  - controla valor null
   * autor: miguel.lobos@sonda.com
  */
  BuscarPaciente(tipo: string) {
    if (this.hdgcodigo > 0 && this.cmecodigo > 0 &&
      this.esacodigo > 0) {
        switch (tipo) {
          case 'hospitalizado':

            this.paterno = this.hForm.controls['apellidopaterno'].value;
            this.materno = this.hForm.controls['apellidomaterno'].value;
            this.nombres = this.hForm.controls['nombrespaciente'].value;
            var idservicio = parseInt(this.hForm.controls['servicio'].value);
            var idpieza = parseInt(this.hForm.controls['pieza'].value);
            var idcama = parseInt(this.hForm.controls['cama'].value);
            this.loading = true;
            this._PacientesService.BuscaPacientesAmbito(this.hdgcodigo, this.cmecodigo, this.esacodigo,
              this.hForm.controls.tipoidentificacion.value, this.hForm.controls.numeroidentificacion.value,
              this.paterno,this.materno, this.nombres, idservicio, idpieza, idcama, this.servidor,
              this.hForm.value.servicio,3).subscribe(
                response => {
                  if (response != null) {
                    let exlistadopacientes: Array<Paciente> = response;
                    /** controla valor null */
                    if( exlistadopacientes === null ||
                      exlistadopacientes === undefined ) {
                        this.loading = false;
                        return;
                      } else {
                        exlistadopacientes.sort( (a, b) => a.apepaternopac.localeCompare(b.apepaternopac));
                        this.pacientes = exlistadopacientes;
                        this.listadopacientespaginacion = this.pacientes.slice(0, 8);
                        this.loading = false;
                      }
                    }
                    if(response === null) {
                      this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.existe.paciente');
                      this.alertSwalError.show();
                      this.loading = false;
                      return;
                    } else {
                      this.loading = false;
                      return;
                    }
                },
                error => {
                  this.alertSwalError.title = this.TranslateUtil('key.title.error').concat(error.message);
                  this.alertSwalError.show();
                  this.loading = false;
                });
            break;
          case 'urgencia':
            this.loading = true;

            this._PacientesService.BuscaPacientesAmbito(this.hdgcodigo, this.cmecodigo,
              this.esacodigo,this.uForm.controls.tipoidentificacion.value, this.uForm.controls.numeroidentificacion.value,
              this.uForm.controls.apellidopaterno.value, this.uForm.controls.apellidomaterno.value, this.uForm.controls.nombrespaciente.value,
               idservicio, idpieza, idcama, this.servidor,
              this.hForm.value.servicio,2).subscribe(
                response => {
                  if (response != null) {
                    this.pacientes_urgencia = []
                    this.pacientes_urgencia_paginacion = [];
                    let exlistadopacientes: Array<Paciente> = response;
                    /** controla valor null */
                    if( exlistadopacientes === null ||
                      exlistadopacientes === undefined ) {
                        this.loading = false;
                        return;
                      } else {
                        exlistadopacientes.sort( (a, b) => a.apepaternopac.localeCompare(b.apepaternopac));
                        this.pacientes_urgencia = exlistadopacientes;
                        this.pacientes_urgencia_paginacion = this.pacientes_urgencia.slice(0, 8);
                        this.loading = false;
                      }
                    }
                    if(response === null) {
                      this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.existe.paciente');
                      this.alertSwalError.show();
                      this.loading = false;
                      return;
                    } else {
                      this.loading = false;
                    }
                },
                error => {
                  this.alertSwalError.title = 'Error '.concat(error.message);
                  this.alertSwalError.show();
                  this.loading = false;
                });
            break;
        }

      }
  }

  Limpiar() {
    this.pacientes = [];
    this.listadopacientespaginacion = [];
    this.hForm.reset();
    this.hForm.controls['pieza'].disable();
    this.hForm.controls['cama'].disable();
    this.uForm.controls['pieza'].disable();
    this.ListarEstUnidades();

  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listadopacientespaginacion = this.pacientes.slice(startItem, endItem);
  }

  pageChangedUrgencia(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pacientes_urgencia_paginacion = this.pacientes_urgencia.slice(startItem, endItem);
  }


  // seteo de fechas
  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  LimpiarUrgencia(){
    this.pacientes_urgencia = [];
    this.pacientes_urgencia_paginacion = [];
    this.uForm.reset();
    this.uForm.controls['pieza'].disable();
  }

  findValidControlsH() {
      let invalid = true;
      let controls = this.hForm.controls;
      for (let name in controls) {
        if (controls[name].valid && name !== 'tipoidentificacion') {
            invalid = false;
        }
      }
      return invalid;

  }

  findValidControlsU() {
      let invalid = true;
      let controls = this.uForm.controls;
      for (let name in controls) {
        if (controls[name].valid  && name !== 'tipoidentificacion') {
            invalid = false;
        }
      }
      return invalid;

  }

  /** Tipo
   * 1 = Hospitalizado
   * 2 = Urgencia
   */
  activarNumid(tipo: number) {
    if( tipo === 1 ){
      this.hForm.controls.numeroidentificacion.enable();

    } else if( tipo === 2 ){
      this.uForm.controls.numeroidentificacion.enable();

    }

  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
