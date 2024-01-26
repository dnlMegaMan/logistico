import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AlertComponent } from 'ngx-bootstrap/alert';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { InterfacesService } from 'src/app/servicios/interfaces.service';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { MovimientoInterfazBodegas } from 'src/app/models/entity/movimiento-interfaz-bodegas';
import { Solicitud } from '../../models/entity/Solicitud';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DateMenorValidation } from 'src/app/models/validations/DateMenorValidation';
import { DateRangeValidation } from 'src/app/models/validations/DateRangeValidation';
import { CargofarmaciaComponent } from './cargofarmacia/cargofarmacia.component';
import { BusquedacuentaService } from '../../servicios/busquedacuenta.service';
import { Resultadoctas } from 'src/app/models/entity/busquedacuentas/ResultadoCtas';
import { BusquedaPacientes } from '../../models/entity/busquedacuentas/BusquedaPacientes';
import { NavService } from 'src/app/nav.service';
import { Router } from '@angular/router';
import { CargoFarmacia } from 'src/app/models/entity/busquedacuentas/CargoFarmacia';
import { BusquedaSolicitud } from '../../models/entity/busquedacuentas/BusquedaSolicitud';
import { SolicitudesCarga } from 'src/app/models/entity/busquedacuentas/SolicitudesCarga';
import { DocIdentificacion } from 'src/app/models/entity/DocIdentificacion';
import { DocidentificacionService } from 'src/app/servicios/docidentificacion.service';
import { StructSession } from 'src/app/models/entity/busquedacuentas/StructSession';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busquedacuentas',
  templateUrl: './busquedacuentas.component.html',
  styleUrls: ['./busquedacuentas.component.css']
})
export class BusquedacuentasComponent implements OnInit, AfterViewInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('tblasignada', { static: false }) tblasignada: ElementRef;

  public locale = 'es';
  public bsConfig: Partial<BsDatepickerConfig>;
  public docsidentis: Array<DocIdentificacion> = [];
  public colorTheme = 'theme-blue';
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public loading = false;
  public FormBusquedapaciente: FormGroup;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;

  public FormBusquedasolicitud: FormGroup;
  private _BSModalRef: BsModalRef;
  public selecidcuenta: any;
  public arrcuentas: Array<Resultadoctas> = [];
  public arrcuentaspaginacion: Array<Resultadoctas> = [];
  public selecnombreprod = '';
  public selecidprod = '';

  public selecnombrepac = '';
  selecpaternopac: any;
  selecmaternopac: any;
  /**Grilla Cuentas */
  public arrpacientes: Array<BusquedaPacientes> = [];
  public arrpacientespag: Array<BusquedaPacientes> = [];
  currentPagepac: number;
  currentPagectas: number;
  /**Grilla Cargos */
  public arrcargas: Array<CargoFarmacia> = [];
  public arrcargaspaginacion: Array<CargoFarmacia> = [];
  numidentificacion: any;
  subcuenta: string;
  cuenta: string;
  nrosol: string;
  nroreceta: string;
  codproducto: string;
  nombreproducto: string;
  public arrsolicitudes: Array<SolicitudesCarga> = [];
  public alerts: any[] = [];

  // Carga de datos para sessionScope
  public cargoFarmaciaAux         : CargoFarmacia;
  public resultadoctasAux         : Resultadoctas;

  public structSession            : StructSession;

  /** guarda y asigna pagina de cargos tras volver de solicitud /@mlobos */
  public currentpcargos = 1;

  /** fechas para visualizar */
  public vfechainicio: string;
  public vfechatermino: string;

  /** fechas para usar en servicios */
  public fechainicio: string;
  public fechatermino: string;

  /** busqueda por parametros sin usar fecha */
  public buscarparam = false;

  constructor(
    public router: Router,
    private _interfacesService : InterfacesService,
    public datePipe: DatePipe,
    public localeService: BsLocaleService,
    public formBuilder: FormBuilder,
    public _BsModalService: BsModalService,
    public busquedacuentaService: BusquedacuentaService,
    public navService: NavService,
    public DocidentificacionService: DocidentificacionService,
    public translate: TranslateService
    ) {
      this.FormBusquedasolicitud = this.formBuilder.group({
        fechadesde: [ new Date(), Validators.required],
        fechahasta: [ new Date(), Validators.required],
        nrosolicitud: [{ value: null, disabled: false }],
        cuenta: [{ value: null, disabled: false }],
        subcuenta: [{ value: null, disabled: false }],
        nroreceta: [{ value: null, disabled: false }],
        codproducto: [{ value: null, disabled: false }],
        nombreproducto: [{ value: null, disabled: false }],
        folio: [{ value: '', disabled: false }],
        numidentificacion: [{ value: '', disabled: false }],
        nombrepaciente: [{ value: '', disabled: false }],
        paternopaciente: [{ value: '', disabled: false }],
        maternopaciente: [{ value: '', disabled: false }],
        tipodocpac: [{value: null, disabled: false}, Validators.required],
      },
      {
        validator: [
          DateMenorValidation('fechadesde', 'fechahasta'),
          DateRangeValidation('fechadesde', 'fechahasta', 366)
        ]
      });

      this.FormBusquedapaciente = this.formBuilder.group({
        fechadesde: [new Date(), Validators.required],
        fechahasta: [new Date(), Validators.required],
        tipodocpac: [{value: null, disabled: false}, Validators.required],
        numidentificacion: [{ value: '', disabled: false }, Validators.required],
        nombrepaciente: [{ value: '', disabled: true }],
        paternopaciente: [{ value: '', disabled: false }],
        maternopaciente: [{ value: '', disabled: false }],
      });
    }

  ngOnInit() {
    this.setDate();
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    /* completa combobox */
    this.getParametros();

    this.vfechainicio = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
    this.vfechatermino = this.datePipe.transform(new Date(), 'dd/MM/yyyy');

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setFormulario();
    });

  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  pageChangedCuentas(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arrcuentaspaginacion = this.arrcuentas.slice(startItem, endItem);
  }

  pageChangedPacientes(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arrpacientespag = this.arrpacientes.slice(startItem, endItem);
  }

  pageChangedCargas(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.currentpcargos = event.page;
    this.arrcargaspaginacion = this.arrcargas.slice(startItem, endItem);

  }

  setRowPaginationPacientes() {
    this.currentPagepac = 1;
    this.arrpacientespag = this.arrpacientes.slice(0, 8);
  }

  setRowPaginationCtas() {
    this.currentPagectas = 1;
    this.arrcuentaspaginacion = this.arrcuentas.slice(0, 8);
  }

  async onBuscar() {

    this.currentpcargos = 1;
    const nombrepac = this.FormBusquedasolicitud.controls.nombrepaciente.value;
    const paternopac = this.FormBusquedasolicitud.controls.paternopaciente.value;
    const maternopac = this.FormBusquedasolicitud.controls.maternopaciente.value;
    const rutpac = this.FormBusquedasolicitud.controls.numidentificacion.value;
    this.selecnombrepac = nombrepac === null || nombrepac === undefined ? '' : nombrepac;
    this.selecpaternopac = paternopac === null || paternopac === undefined ? '' : paternopac;
    this.selecmaternopac = maternopac === null || maternopac === undefined ? '' : maternopac;
    this.numidentificacion = rutpac === null || rutpac === undefined ? '' : rutpac;

    const cuenta = this.FormBusquedasolicitud.controls.cuenta.value;
    const subcuenta = this.FormBusquedasolicitud.controls.subcuenta.value;
    const nrosol = this.FormBusquedasolicitud.controls.nrosolicitud.value;
    const nroreceta = this.FormBusquedasolicitud.controls.nroreceta.value;
    const codproducto = this.FormBusquedasolicitud.controls.codproducto.value;
    const nombreproducto = this.FormBusquedasolicitud.controls.nombreproducto.value;

    this.cuenta = cuenta === null ? '' : cuenta;
    this.subcuenta = subcuenta === null ? '' : subcuenta;
    this.nrosol = nrosol === null ? '' : nrosol;
    this.nroreceta = nroreceta === null ? '' : nroreceta;
    this.codproducto = codproducto === null ? '' : codproducto;
    this.nombreproducto = nombreproducto === null ? '' : nombreproducto;
    // this.fechainicio = await this.datePipe.transform(this.vfechainicio, 'yyyy-MM-dd');
    // this.fechatermino = await this.datePipe.transform(this.vfechatermino, 'yyyy-MM-dd');
    this.fechainicio = await this.datePipe.transform(this.FormBusquedasolicitud.controls.fechadesde.value.toString(), 'yyyy-MM-dd');
    this.fechatermino = await this.datePipe.transform(this.FormBusquedasolicitud.controls.fechahasta.value.toString(), 'yyyy-MM-dd');


    sessionStorage.removeItem('structsession');
    await this.limpiargrillas();
    await this.tipoBusqueda();
  }

  tipoBusqueda() {
    if (this.selecnombrepac.length || this.selecpaternopac.length || this.selecmaternopac.length
      || this.numidentificacion.length) {

      this.buscarparam = true;
      this.getPacientes();

    } else if ( this.nrosol.length ||   this.cuenta.length ||   this.subcuenta.length ||   this.nroreceta.length ||
       this.codproducto.length ||  this.nombreproducto.length ){

      this.buscarparam = true;
      this.Parametrosproducto();

    } else {

      this.buscarparam = false;
      this.Parametrosproducto();

    }
  }

  /**
   * graba parametros de session para usarlos en modal y pantalla solicitudes
   * miguel.lobos@sonda.com
   * 19-01-2022: se almacena fecha como tipo Date
   */
  async guardaParametros() {

    this.structSession = new StructSession();


    this.structSession.fechadesde = this.vfechainicio;
    this.structSession.fechahasta  = this.vfechatermino;

    this.structSession.nrosolicitud  = this.FormBusquedasolicitud.controls.nrosolicitud.value;
    this.structSession.cuenta = this.FormBusquedasolicitud.controls.cuenta.value;
    this.structSession.subcuenta = this.FormBusquedasolicitud.controls.subcuenta.value;
    this.structSession.nroreceta = this.FormBusquedasolicitud.controls.nroreceta.value;
    this.structSession.codproducto = this.FormBusquedasolicitud.controls.codproducto.value;
    this.structSession.nombreproducto = this.FormBusquedasolicitud.controls.nombreproducto.value;
    this.structSession.folio = this.FormBusquedasolicitud.controls.folio.value;
    this.structSession.numidentificacion = this.FormBusquedasolicitud.controls.numidentificacion.value;
    this.structSession.nombrepaciente = this.FormBusquedasolicitud.controls.nombrepaciente.value;
    this.structSession.paternopaciente = this.FormBusquedasolicitud.controls.paternopaciente.value;
    this.structSession.maternopaciente = this.FormBusquedasolicitud.controls.maternopaciente.value;
    this.structSession.tipodocpac = this.FormBusquedasolicitud.controls.tipodocpac.value;
    this.structSession.cargoFarmacia = this.cargoFarmaciaAux;
    this.structSession.resultadoctas = this.resultadoctasAux;
    this.structSession.vuelta = true;

    sessionStorage.removeItem('structsession');
    sessionStorage.setItem('structsession', JSON.stringify(this.structSession));

    sessionStorage.removeItem('paramConsultactas');

    const paramConsultactas = {
      fechadesde: this.vfechainicio,
      fechahasta: this.vfechatermino,
      tipodocpac: this.FormBusquedasolicitud.controls.tipodocpac.value,
      numidentificacion: this.numidentificacion,
      nombrepaciente: this.selecnombrepac,
      paternopaciente: this.selecpaternopac,
      maternopaciente: this.selecmaternopac,
      cuenta : this.cuenta,
      subcuenta : this.subcuenta,
      nrosolicitud : this.nrosol,
      nroreceta : this.nroreceta,
      codproducto : this.codproducto,
      nombreproducto : this.nombreproducto
    };
    sessionStorage.setItem('paramConsultactas', JSON.stringify(paramConsultactas));

  }

  /**
   * Función que al inicio deshabilita los demas checkbox tras una selección
   * miguel.lobos@sonda.com
   * 05-02-2020
   */
  async onCargospaciente(event: any, value: Resultadoctas) {
    this.loading = true;
    this.setRowPaginationCtas();
    value.seleccion = event.target.value;
    this.resultadoctasAux = value;
    if (value.seleccion) {
      this.arrcuentas.forEach(x => {
        if (x.numerocuenta !== value.numerocuenta) {
          x.seleccion = false;
        }
      });
      this.arrcuentaspaginacion = this.arrcuentas.slice(0, 8);
    }
    this.selecidcuenta = value.cuentaid;
    this.selecnombrepac = value.nompaciente;

    this.selecidprod = this.FormBusquedasolicitud.controls.codproducto.value;
    this.selecnombreprod = this.FormBusquedasolicitud.controls.nombreproducto.value;

    await this.getCarga();
  }

  async getCarga() {

    this.busquedacuentaService.consultaCargoCuenta(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, this.selecidcuenta, this.selecidprod, this.selecnombreprod, this.nrosol,
      this.fechainicio, this.fechatermino).subscribe(resp => {
        if (resp !== null) {

          this.arrcargas = resp;
          this.arrcargaspaginacion = this.arrcargas.slice(0, 8);

        }

        this.loading = false;

      }, err => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.proceso');
        this.alertSwalError.show();
      });
  }

  async getSolicitudes(value: CargoFarmacia) {
    this.cargoFarmaciaAux = value;
    this.cargoFarmaciaAux.page = this.currentpcargos;

    this.guardaParametros();
    let arrsol: Array<SolicitudesCarga> = [];

    this.busquedacuentaService.consultaSolicitudPaciente(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, value.ctaid, '', '',value.codigo, this.nrosol,
      this.fechainicio, this.fechatermino).subscribe( res => {
        arrsol = res;

        if (res.length === 1) {
          sessionStorage.setItem('detallecargo', res[0].numsol);
          sessionStorage.setItem('nrosolicitud', this.nrosol);
          this.redirect();

        } else if (res.length > 1) {
          this.loading = true;
          this.onBusquedasolicitudes(arrsol, value.ctaid, res[0].numcta, value.codigo);

        } else {

          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.cargo.no.ingresado');
          this.alertSwalAlert.show();
          this.loading = false;
          return;

        }
      }, err => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.proceso');
        this.alertSwalError.show();
      });
  }

  redirect() {
    this.router.navigate(['solicitudpaciente']);
  }

  onBusquedasolicitudes(solicitudes, idcuenta, numcta, codprod) {

    this.arrsolicitudes = solicitudes;
    this.loading = false;
    this._BSModalRef = this._BsModalService.show(CargofarmaciaComponent,
      this.setModalCargasolicitudes('SOLICITUDES', idcuenta, numcta, codprod));
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response === undefined) {
        return;
      }

    });
  }

  setModalCargasolicitudes(cabecera: string, idcuenta: string, numcta: string, codprod: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: cabecera,
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        nombrepaciente: this.selecnombrepac.concat(' ').concat(this.selecpaternopac).concat(' ').concat(this.selecmaternopac),
        ctaid: idcuenta,
        numcta: numcta,
        codproducto: codprod,
      }
    };
    return dtModal;
  }

   onLimpiar() {
    this.limpiargrillas();
    this.FormBusquedapaciente.reset();
    this.FormBusquedasolicitud.reset();
    this.FormBusquedasolicitud.controls.fechadesde.setValue(new Date());
    this.FormBusquedasolicitud.controls.fechahasta.setValue(new Date());
    this.onFechaInicio();
    this.onFechaTermino();
    sessionStorage.removeItem('structsession');
    this.currentpcargos = 1;
  }

  limpiargrillas() {
    this.arrcuentas = [];
    this.arrcuentaspaginacion = [];
    this.arrcargas = [];
    this.arrcargaspaginacion = [];
  }

  async onBuscarctasnompaciente(value: BusquedaPacientes) {
    let arrpac: Array<BusquedaPacientes> = [];
    arrpac.push(value);
    this.arrpacientes = arrpac;
    await this.getPacientes();
  }

  async getPacientes() {
    this.loading = true;
    if (this.buscarparam === true) {

      this.fechainicio = null;
      this.fechatermino = null;

      this.busquedacuentaService.consultaPaciente(this.servidor, this.cmecodigo,
        this.fechainicio, this.fechatermino,
        this.numidentificacion, this.selecnombrepac, this.selecpaternopac, this.selecmaternopac).subscribe(
          response => {
            if (response != null){
              this.arrpacientes = response;
              this.setPacientes();
              this.loading = false;
            } else {
              this.loading = false;
            }
          }, err => {
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.solicitud');
            this.alertSwalError.show();
            this.loading = false;
            return;
          });
    } else {
      this.loading = false;

      await this.setPacientes();
    }
  }

  async setPacientes() {
    if (this.arrpacientes.length > 1) {
      this.arrpacientespag = this.arrpacientes.slice(0, 8);
    } else if (this.arrpacientes.length === 1) {
      let paciente: BusquedaPacientes = new BusquedaPacientes();
      paciente = this.arrpacientes[0];

      this.selecpaternopac = paciente.apepaterno;
      this.selecmaternopac = paciente.apematerno;
      this.selecnombrepac = paciente.nombre;
      this.numidentificacion = paciente.numidentificacion;
      this.FormBusquedasolicitud.controls.paternopaciente.setValue(this.selecpaternopac);
      this.FormBusquedasolicitud.controls.maternopaciente.setValue(this.selecmaternopac);
      this.FormBusquedasolicitud.controls.nombrepaciente.setValue(this.selecnombrepac);
      this.FormBusquedasolicitud.controls.numidentificacion.setValue(this.numidentificacion.trim());

      this.arrpacientes = [];
      this.arrpacientespag = [];
      await this.Parametrosproducto();
    }
  }

  async Parametrosproducto() {

    if (this.buscarparam === true) {

      this.fechainicio = null;
      this.fechatermino = null;

    }
    this.busquedacuentaService.consultaCuentaMasivo(this.servidor, this.hdgcodigo,
      this.esacodigo, this.cmecodigo, this.fechainicio, this.fechatermino,
      this.numidentificacion, this.selecnombrepac, this.selecpaternopac,
      this.selecmaternopac, this.cuenta, this.subcuenta, this.nrosol, this.nroreceta, this.codproducto, this.nombreproducto).subscribe(
       response => {
         if (response != null) {
          this.arrcuentas = response;
          this.arrcuentaspaginacion = this.arrcuentas.slice(0, 8);
          this.arrpacientes = [];
          this.arrpacientespag = [];

          this.loading = false;
          return;
         } else {
           this.loading = false;
         }
       }, err => {
         this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.solicitud');
         this.alertSwalError.show();
         this.loading = false;

         return;
       });
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  uimensaje(status: string, texto: string, time: number = 0): boolean {
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
    return;
  }

  async getParametros() {
    try {      
      this.docsidentis = await this.DocidentificacionService.list(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), false)
        .toPromise();
    } catch (err) {
      this.alertSwalAlert.text = err.message;
      this.alertSwalAlert.show();
    }
  }

  SeleccionTipoDoc(){
    this.FormBusquedasolicitud.controls.numidentificacion.enable();
  }


  /**
   * 3/2/22: cambios en la logica de busqueda .(@mlobos)
   */
  async setFormulario(){
    this.structSession = new StructSession();
    this.structSession = JSON.parse(sessionStorage.getItem('structsession'));

    if ( this.structSession === undefined || this.structSession === null) {
      return;
     }else {

       this.vfechainicio =  await this.datePipe.transform(this.structSession.fechadesde, 'dd/MM/yyyy');
       this.vfechatermino = await this.datePipe.transform(this.structSession.fechahasta, 'dd/MM/yyyy');

       this.FormBusquedasolicitud.controls.nrosolicitud.setValue(this.structSession.nrosolicitud);
       this.FormBusquedasolicitud.controls.cuenta.setValue(this.structSession.cuenta);
       this.FormBusquedasolicitud.controls.subcuenta.setValue(this.structSession.subcuenta);
       this.FormBusquedasolicitud.controls.nroreceta.setValue(this.structSession.nroreceta);
       this.FormBusquedasolicitud.controls.codproducto.setValue(this.structSession.codproducto);
       this.FormBusquedasolicitud.controls.nombreproducto.setValue(this.structSession.nombreproducto);
       this.FormBusquedasolicitud.controls.folio.setValue(this.structSession.folio);
       this.FormBusquedasolicitud.controls.numidentificacion.setValue(this.structSession.numidentificacion);
       this.FormBusquedasolicitud.controls.nombrepaciente.setValue(this.structSession.nombrepaciente);
       this.FormBusquedasolicitud.controls.paternopaciente.setValue(this.structSession.paternopaciente);
       this.FormBusquedasolicitud.controls.maternopaciente.setValue(this.structSession.maternopaciente);
       this.FormBusquedasolicitud.controls.tipodocpac.setValue(this.structSession.tipodocpac);
       this.cargoFarmaciaAux = this.structSession.cargoFarmacia;

       /** parametros setedos para buscar cuentas */
      this.resultadoctasAux = this.structSession.resultadoctas;
      this.selecidcuenta = this.resultadoctasAux.cuentaid;

      await this.onBuscar();
      this.currentpcargos = this.cargoFarmaciaAux.page;

      /** parametros setedos para buscar cargas */
      this.cargoFarmaciaAux = this.structSession.cargoFarmacia;
      this.selecidprod = this.cargoFarmaciaAux.codigo;
      this.selecnombreprod = this.cargoFarmaciaAux.descripcion;


      await this.getCarga();

    }
  }

  async onFechaInicio() {
    this.vfechainicio = await this.datePipe.transform(this.FormBusquedasolicitud.controls.fechadesde.value, 'dd/MM/yyyy');
  }
  async onFechaTermino() {
    this.vfechatermino = await this.datePipe.transform(this.FormBusquedasolicitud.controls.fechahasta.value, 'dd/MM/yyyy');
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
