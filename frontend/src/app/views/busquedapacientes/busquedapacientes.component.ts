import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { PacientesService }  from '../../servicios/pacientes.service'
import { environment } from 'src/environments/environment';
import { ListaPacientes } from 'src/app/models/entity/ListaPacientes';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import  { TipodocumentoidentService } from '../../servicios/tipodocumentoident.service';
import  { TipoDocumentoIdentificacion } from '../../models/entity/TipoDocumentoIdentificacion';


// uso de fechas
import { DatePipe } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

import { Servicio } from 'src/app/models/entity/Servicio';
import { EstructuraunidadesService } from '../../servicios/estructuraunidades.service';
import { Piezas } from '../../models/entity/Piezas';
import { Camas } from '../../models/entity/Camas';
import { Paciente } from '../../models/entity/Paciente';
import { Unidades } from '../../models/entity/Unidades';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-busquedapacientes',
  templateUrl: './busquedapacientes.component.html',
  styleUrls: ['./busquedapacientes.component.css']
})

export class BusquedapacientesComponent implements OnInit {
  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo   : string;
  @Input() pagina   : string;

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  // para manejo de fechas
  public locale = 'es';
  public bsConfig: Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';
  public loading = false;
  public lForm: FormGroup;
  public uForm: FormGroup;
  public hForm: FormGroup;
  public onClose: Subject<ListaPacientes>;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario  = environment.privilegios.usuario;

  public arreglotipodocumentoidentificacion: Array<TipoDocumentoIdentificacion> =[];
  public servicios : Array<Servicio> = [];
  public piezas: Array<Piezas> = [];
  public camas: Array<Camas> = [];
  public filtrohosp = false;
  public filtrourg = false;
  public paterno = null;
  public materno = null;
  public nombres = null;
  public listadopacienteshosp: Array<Paciente> = [];
  public listadopacienteshosppaginacion: Array<Paciente> = [];
  public pacientes_urgencia_paginacion: Array<Paciente> = [];
  public pacientes_urgencia: Array<Paciente> = [];
  public listadopacientes: Array<Paciente> = [];
  public listadopacientespaginacion: Array<Paciente> = [];
  public unidades: Array<Unidades> = [];

  public activatipobusquedahosp : boolean = true;
  public activatipobusquedaamb  : boolean = true;
  public activatipobusquedaurg  : boolean = true;

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    public _PacientesService: PacientesService,
    public _TipodocumentoidentService : TipodocumentoidentService,
  // para manejo de fechas
    public datePipe: DatePipe,
    public localeService: BsLocaleService,
    public estructuraunidadesService: EstructuraunidadesService,
    public translate: TranslateService
   )
    {
    this.lForm = this.formBuilder.group({
      tipoidentificacion: [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: true }, Validators.required],
      apellidopaterno: [{ value: null, disabled: false }, Validators.required],
      apellidomaterno: [{ value: null, disabled: false }, Validators.required],
      nombrespaciente: [{ value: null, disabled: false }, Validators.required],
     }
    );

    this.uForm = this.formBuilder.group({
      servicio: [{ value: null, disabled: false }, Validators.required],
      pieza: [{ value: null, disabled: true }, Validators.required],
      tipoidentificacion : [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion : [{ value: null, disabled: true }, Validators.required],
      apellidopaterno: [{ value: null, disabled: false }, Validators.required],
      apellidomaterno: [{ value: null, disabled: false }, Validators.required],
      nombrespaciente: [{ value: null, disabled: false }, Validators.required],
     }
    );

    this.hForm = this.formBuilder.group({
      apellidopaterno: [{ value: null, disabled: false }, Validators.required],
      apellidomaterno: [{ value: null, disabled: false }, Validators.required],
      nombrespaciente: [{ value: null, disabled: false }, Validators.required],
      servicio       : [{ value: null, disabled: false }, Validators.required],
      pieza          : [{ value: null, disabled: true }, Validators.required],
      cama           : [{ value: null, disabled: true }, Validators.required],
      tipoidentificacion  : [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: true }, Validators.required],
    }
    );
  }


  ngOnInit(){
    if(this.pagina === 'Despacho'){
      if(this.esacodigo === 3){
        this.activatipobusquedahosp = false;
        this.activatipobusquedaamb = true;
        this.activatipobusquedaurg = true;;
      } else{
        this.activatipobusquedahosp = true;
        this.activatipobusquedaamb = true;
        this.activatipobusquedaurg = true;
      }

    }else{
      this.activatipobusquedaamb = true;
      this.activatipobusquedahosp = false;
      this.activatipobusquedaurg = false;
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
      }, err => {}
    );
  }

  onCerrar(pacienteseleccionado:  ListaPacientes) {
    this.onClose.next(pacienteseleccionado);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.bsModalRef.hide();
  };

  ngAfterViewInit() {
    setTimeout(() => {
      this.loading = false;
    });
  }

  async BuscarPacienteFiltro(in_tipodocuemto:number,in_numerodocumento: string, in_paterno : string,
  in_materno: string, in_nombres : string )
  {
    this.loading = true;

    if (in_numerodocumento == null ) {
    } else {in_numerodocumento = in_numerodocumento.toUpperCase() };
    if (in_paterno == null ) {
    } else {in_paterno = in_paterno.toUpperCase() };

    if (in_materno == null ) {
    } else {in_materno = in_materno.toUpperCase() };

    if (in_nombres == null ) {
    } else {in_nombres = in_nombres.toUpperCase() };

    if (in_nombres == null ) {
    } else {in_nombres = in_nombres.toUpperCase() };

    let respuesta:any;

    try {
      respuesta = await this._PacientesService.BuscaListaPacientes(this.hdgcodigo  , this.cmecodigo, this.esacodigo,
      in_tipodocuemto,in_numerodocumento, in_paterno, in_materno, in_nombres
      ,this.usuario,this.servidor).toPromise();
      this.listadopacientes = respuesta;
      this.listadopacientespaginacion = this.listadopacientes.slice(0, 8);

      this.loading = false;

    } catch (error) {
      this.alertSwalError.text = error.message;
      this.alertSwalError.show();
      this.loading = false;

    }
  }

  /* Función búsqueda con paginación */

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listadopacientespaginacion = this.listadopacientes.slice(startItem, endItem);
  }

  pageChangedhosp(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listadopacienteshosppaginacion = this.listadopacienteshosp.slice(startItem, endItem);
  }

  // seteo de fechas

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  Limpiar() {
    this.lForm.reset();
    this.listadopacientes= [];
    this.listadopacientespaginacion = [];
    this.pacientes_urgencia = [];
    this.pacientes_urgencia_paginacion = [];
    this.uForm.reset();
    this.uForm.controls['pieza'].disable();
    this.hForm.reset();
    this.listadopacienteshosp = [];
    this.listadopacienteshosppaginacion = [];

    this.filtrohosp = false;
    this.filtrourg = false;
    this.hForm.controls.numeroidentificacion.disable();
    this.uForm.controls.numeroidentificacion.disable();
    this.hForm.controls.pieza.disable();
    this.hForm.controls.cama.disable();

  }

  async ListarEstServicios() {
    try {
      this.loading = true;

      this.estructuraunidadesService.BuscarServicios(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.usuario,
        this.servidor,
        3,
        ''
      ).subscribe( resp => {
        this.servicios = resp;
        this.quitavacioservicio();

      });

      this.loading = false;

    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
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

  onSelectServicio(event: any) {

    this.filtrohosp = true;
    this.piezas = [];
    this.camas = [];
    this.hForm.controls['pieza'].setValue(null);
    this.hForm.controls['cama'].setValue(null);
    this.hForm.controls['cama'].disable();
    const codservicio = event;

    this.hForm.controls['pieza'].enable();
    this.ListarPiezas(codservicio);
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

  onSelectPieza(event: any) {
    this.loading = true;
    this.camas = [];
    this.hForm.controls['cama'].setValue(null);
    const idpieza = parseInt(event);
    this.hForm.controls['cama'].enable();
    this.ListarCamas(idpieza);
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

  //Busca paciente hospitalizado
  BuscarPaciente(tipo: string) {
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
          this.paterno, this.materno, this.nombres, idservicio, idpieza, idcama, this.servidor,
          this.hForm.value.servicio,3).subscribe(
            response => {
              if (response != null){
                let exlistadopacientes: Array<Paciente> = response;
                exlistadopacientes.sort( (a, b) => a.apepaternopac.localeCompare(b.apepaternopac));
                this.listadopacienteshosp = exlistadopacientes;

                this.listadopacienteshosppaginacion = this.listadopacienteshosp.slice(0, 8);
                this.loading = false;
              } else {
                this.loading = false;
                this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.paciente.cuenta.abierta');
                this.alertSwalAlert.show();

              }
            },
            error => {

              this.alertSwalError.title = 'Error '.concat(error.message);
              this.alertSwalError.show();
              this.loading = false;
            });
        break;
      case 'urgencia':

          this.loading = true;
          this._PacientesService.BuscaPacientesAmbito(this.hdgcodigo, this.cmecodigo, this.esacodigo,
            this.uForm.controls.tipoidentificacion.value, this.uForm.controls.numeroidentificacion.value,
            this.uForm.controls.apellidopaterno.value, this.uForm.controls.apellidomaterno.value,
            this.uForm.controls.nombrespaciente.value, 0, 0, 0, this.servidor,'',2).subscribe(
              response => {
                if (response != null){
                  let exlistadopacientes: Array<Paciente> = response;
                  exlistadopacientes.sort( (a, b) => a.apepaternopac.localeCompare(b.apepaternopac));

                  this.pacientes_urgencia = exlistadopacientes;
                  this.pacientes_urgencia_paginacion = this.pacientes_urgencia.slice(0, 8);
                  this.loading = false;
                } else {
                  this.loading = false;
                  this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.paciente.maestro');
                  this.alertSwalAlert.show();
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

  pageChangedUrgencia(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pacientes_urgencia_paginacion = this.pacientes_urgencia.slice(startItem, endItem);
  }

  findValidControls() {
    let invalid = true;
    let controls = this.lForm.controls;
    for (let name in controls) {
      if (controls[name].valid  && name !== 'tipoidentificacion') {
          invalid = false;
      }
    }
    return invalid;

  }


  /** Tipo int
   * 1 = Hospitalizado
   * 2 = Urgencia
   */
  activarNumid(tipo: number) {
    if( tipo === 1 ){
      this.hForm.controls.numeroidentificacion.enable();

    } else if( tipo === 2 ){
      this.uForm.controls.numeroidentificacion.enable();

    } else if( tipo === 3 ){
      this.lForm.controls.numeroidentificacion.enable();

    }

  }

  quitavacioservicio() {
    const codserv = this.servicios.findIndex( x => x.serviciodesc.trim() === '' );
    this.servicios.splice( codserv, 1);

  }

  onValidafiltro(event: any, lugar: number) {

    let numid = event;
    switch (lugar) {

      case 2:
        if (numid.length > 0) {
          this.filtrohosp = true;
        } else {
          this.filtrohosp = false;
        }
        break;
      case 3:
        if (numid.length > 0) {
          this.filtrourg = true;
        } else {
          this.filtrourg = false;
        }
        break;
    }
  }
  
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
