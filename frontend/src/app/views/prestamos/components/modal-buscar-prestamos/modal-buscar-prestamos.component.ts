import { Component, OnInit, ViewChild } from '@angular/core';
import { PrestamosService } from '../../services/prestamos.service';
import { BuscaProdPorDescripcion, BuscarPrestamo, RespuestaPrestamo } from '../../interfaces/buscar-prod-por-descripcion.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { ConsularParamData } from '../../interfaces/consular-param.interface';
import { environment } from 'src/environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { defineLocale, esLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
  selector: 'app-modalprestamos',
  templateUrl: './modal-buscar-prestamos.component.html'
})
export class ModalBuscarPrestamosComponent implements OnInit {
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;

  public formDatosPrestamo: FormGroup;
  public listaPrestamos: Array<BuscarPrestamo> = [];
  public listaPrestamosPag: Array<BuscarPrestamo> = [];
  public onClose: Subject<BuscarPrestamo>;
  public estadoBotones: boolean = true;
  public alerts: any[] = [];
  public buscarPrestamo: BuscarPrestamo;
  public servidor = environment.URLServiciosRest.ambiente;

  public listOrigen: Array<ConsularParamData>;
  public listDestino: Array<ConsularParamData>;
  public idPrestamo: number;
  public idOrigen: number;
  public idDestino: number;
  public loading = false;
  public bsConfig: Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';
  public locale = 'es';

  constructor(
    private prestamoService: PrestamosService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,) {

    this.formDatosPrestamo = this.formBuilder.group({
      numeroPrestamo: [{ value: null, disabled: false },[Validators.min(0), Validators.max(9999999999)]],
      origen: [{ value: null, disabled: false }, Validators.required],
      destino: [{ value: null, disabled: false }, Validators.required],
      fechaDes: [{ value: null, disabled: false }],
      fechaHas: [{ value: null, disabled: false }]
    });

  }

  ngOnInit() {
    this.onClose = new Subject();
    this.buscarPrestamo = this.modalService.config.initialState['buscarPrestamo'];
    this.listOrigen = this.buscarPrestamo.origen;
    this.listDestino = this.buscarPrestamo.destino;

  }

  onInput(event: any) {
    const inputValue = event.target.value;
    const maxLength = 10
    if (inputValue.length > maxLength) {
      this.formDatosPrestamo.get('numeroPrestamo').setValue(inputValue.slice(0, maxLength));
    }
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  formatearFecha(fecha: string) {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObj.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  onBuscarPrestamos() {
    this.estadoBotones = false;
    this.listaPrestamos = [];

    this.listaPrestamosPag = [];

    let buscar: BuscarPrestamo = {
      id: this.formDatosPrestamo.get('numeroPrestamo').value,
      idOrigen: this.formDatosPrestamo.get('origen').value,
      idDestino: this.formDatosPrestamo.get('destino').value,
      fechaDes: this.formatearFecha(this.formDatosPrestamo.get('fechaDes').value),
      fechaHas: this.formatearFecha(this.formDatosPrestamo.get('fechaHas').value),
      servidor: this.servidor
    }

    this.prestamoService.consularBuscarPrestamos(buscar)
      .toPromise()
      .then((response:RespuestaPrestamo) => {

        if (response != null) {
          if (response.prestamo.length == 0) {
            response.prestamo = [];
            this.loading = false;
            this.estadoBotones = true;
            this.alertSwalAlert.title = "Alerta";
            this.alertSwalAlert.text = "No existe el préstamo ingresado en el sistema.";
            this.alertSwalAlert.show();
          } else {
            this.estadoBotones = true;
            this.listaPrestamos = response.prestamo;
            this.listaPrestamosPag = this.listaPrestamos.slice(0, 8);
          }
        }
      })
      .catch((error) => {
        this.loading = false;
        this.estadoBotones = true;
        this.alertSwalAlert.title = "Alerta";
        this.alertSwalAlert.text = "Error al buscar préstamo ingresado en el sistema.";
      });

  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listaPrestamosPag = this.listaPrestamos.slice(startItem, endItem);
  }

  limpiar() {
    this.listaPrestamos = [];
    this.listaPrestamosPag = [];
    this.formDatosPrestamo.reset();
  }

   onCerrar(prestamo: BuscarPrestamo) {
    this.listDestino = [];

    this.onClose.next(prestamo);
    this.bsModalRef.hide();
  }

  onSalir() {
    this.onClose.next();
    this.bsModalRef.hide();
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }
}
