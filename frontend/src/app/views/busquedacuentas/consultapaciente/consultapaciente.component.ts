import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
/* LIBRERIAS */
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Subject } from 'rxjs';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
/* SERVICES */
/* MODELS */
import { BusquedaPacientes } from '../../../models/entity/busquedacuentas/BusquedaPacientes';
import { BusquedacuentaService } from 'src/app/servicios/busquedacuenta.service';

@Component({
  selector: 'app-consultapaciente',
  templateUrl: './consultapaciente.component.html',
  styleUrls: ['./consultapaciente.component.css']
})
export class ConsultapacienteComponent implements OnInit , AfterViewInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('btnBuscar', { static: false }) btnBuscar: ElementRef;
  @ViewChild('btnAceptar', { static: false }) btnAceptar: ElementRef;

  public titulo = 'Busqueda de Cuentas por Paciente';
  public onClose: Subject<boolean>;
  public alerts: any[] = [];
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public loading = false;
  public FormBusquedapaciente: FormGroup;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  public _PageChangedEvent: PageChangedEvent;
  private _BSModalRef: BsModalRef;
  public soliid = 0;

  public arrpacientes: Array<BusquedaPacientes> = [];
  public arrpacientespag: Array<BusquedaPacientes> = [];
  private rowselec: BusquedaPacientes;
  public codtipo: number;
  public numformulario = 0;
  public numservicio = 0;
  public seleccion = false;
  selecnombrepac: any;
  rut: any;
  selecpaternopac: any;
  selecmaternopac: any;
  constructor(
    public router: Router,
    public formBuilder: FormBuilder,
    public bsModalRef: BsModalRef,
    public _BsModalService: BsModalService,
    public busquedacuentaService: BusquedacuentaService
  ) {
    this.FormBusquedapaciente = this.formBuilder.group(
      {
        rutpaciente: ['', Validators.required],
        nombrepaciente: [{ value: '', disabled: false }],
        apellidopaterno: [{ value: '', disabled: false }],
        apellidomaterno: [{ value: '', disabled: false }]
      });
  }

  ngOnInit() {
    this.loadInit();
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    // this.canidad_movimiento_bodegas= 0;
    // this.canidad_movimiento_pacientes = 0;
    // this.opcion_bodegas = false;
    // this.opcion_pacientes = false;
  }

  ngAfterViewInit() {
    setTimeout(() => {
    });
  }

  pageChangedCuentas(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arrpacientespag = this.arrpacientes.slice(startItem, endItem);
  }


  async onBuscar() {
    this.selecnombrepac = this.FormBusquedapaciente.controls.nombrepaciente.value;
    this.selecpaternopac = this.FormBusquedapaciente.controls.apellidopaterno.value;
    this.selecmaternopac = this.FormBusquedapaciente.controls.apellidomaterno.value;
    const rutpaciente = this.FormBusquedapaciente.controls.rutpaciente.value;
    this.rut = (rutpaciente !== null) ? rutpaciente : '';
    this.getPaciente();
  }

  getPaciente() {
    this.loading = true;
    this.busquedacuentaService.consultaPaciente(this.servidor, this.cmecodigo,
    '', '', this.rut, this.selecnombrepac, this.selecpaternopac, this.selecmaternopac).subscribe(
      response => {
        if (response != null){
          this.arrpacientes = response;
          this.arrpacientespag = this.arrpacientes.slice(0, 8);
          // this.progressBar.complete();
          this.loading = false;
        } else {
          this.loading = false;
        }
      }, err => {
        this.alertSwalError.title = "Error en la solicitud";
        this.alertSwalError.show();
        this.loading = false;
        // this.progressBar.complete();
        return;
      });
  }

  onLimpiar() {
    this.FormBusquedapaciente.controls.rutpaciente.setValue(null);
    this.FormBusquedapaciente.controls.nombrepaciente.setValue(null);
    this.FormBusquedapaciente.controls.apellidopaterno.setValue(null);
    this.FormBusquedapaciente.controls.apellidomaterno.setValue(null);
    this.arrpacientes = [];
    this.arrpacientespag = [];
  }

  onCerrar() {
    this.bsModalRef.hide();
  }

  loadInit() {
    this.onClose = new Subject();
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

  async onDetallepaciente(paciente: BusquedaPacientes) {
    sessionStorage.removeItem('datospaciente');
    sessionStorage.setItem('datospaciente', JSON.stringify(paciente));
    this.redirect();
  }

  async redirect() {
    this.bsModalRef.hide();
    this.router.navigate(['busquedacuentas']);
  }

}

