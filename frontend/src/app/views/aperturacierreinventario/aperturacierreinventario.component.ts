import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BodegasService } from '../../servicios/bodegas.service';
import { InventariosService } from 'src/app/servicios/inventarios.service';
import { RespuestaObtenerUltimoPeriodoInvenario } from 'src/app/models/entity/RespuestaObtenerUltimoPeriodoInvenario';
import { DatePipe } from '@angular/common';
import { tr } from 'date-fns/locale';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-inflistaconteoinventario',
  templateUrl: './aperturacierreinventario.component.html',
  styleUrls: ['./aperturacierreinventario.component.css'],
  providers: [InventariosService]
})
export class AperturacierreinventarioComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent; // Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormCerrarAbrirInventario: FormGroup;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public usuario: string = sessionStorage.getItem('Usuario').toString();;
  public servidor: string = environment.URLServiciosRest.ambiente;
  public loading = false;
  public botonCambioEstado: string = "";
  public btnGuardar = false;
  public btnCambios = false;

  constructor(
    public translate: TranslateService,
    public datePipe: DatePipe,
    private formBuilder: FormBuilder,
    public _BodegasService: BodegasService,
    private _inventariosService: InventariosService,
  ) {

    this.FormCerrarAbrirInventario = this.formBuilder.group({
      fechacierre: [{ value: null, disabled: true }, Validators.required],
      fechaapertura: [{ value: null, disabled: true }, Validators.required],
    });
  }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.filtros();

  }

  filtros() {
    this.loading = true;
    this._inventariosService.ObtenerUltimoPeriodoInventario(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.servidor
    ).subscribe(
      (response: RespuestaObtenerUltimoPeriodoInvenario) => {
        if (response != null) {

          this.loading = false;
          this.FormCerrarAbrirInventario.controls.fechaapertura.setValue(response.fecha_apertura);
          this.FormCerrarAbrirInventario.controls.fechacierre.setValue(response.fecha_cierre);
          this.estadoCambioAperturaCierreBoton(response.fecha_apertura, response.fecha_cierre);
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.alert.filtro.title.inventario.apertura.cierre');
        this.alertSwalError.text = this.TranslateUtil('key.alert.filtro.text.inventario.apertura.cierre');
        this.alertSwalError.show();
      }
    );
  }

  estadoCambioAperturaCierreBoton(fechaapertura: String, fechacierre: String) {

    if (!Boolean(fechaapertura) && !Boolean(fechacierre)) {
      this.botonCambioEstado = this.TranslateUtil('key.boton.cambio.estado.abrir.inventario.apertura.cierre');
    } else {
      this.botonCambioEstado = this.TranslateUtil('key.boton.cambio.estado.cerrar.inventario.apertura.cierre');
    }


  }

  TranslateUtil(value: string) {
    this.translate.get(value).subscribe((text: string) => { value = text; });
    return value;
  }

  botoncerrarAbrir() {
    var fechaapertura = this.FormCerrarAbrirInventario.controls.fechaapertura.value;
    var fechacierre = this.FormCerrarAbrirInventario.controls.fechacierre.value;
    var now = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
    if (!Boolean(fechaapertura) && !Boolean(fechacierre)) {
      this.FormCerrarAbrirInventario.controls.fechaapertura.setValue(now);
    } else {

      this.FormCerrarAbrirInventario.controls.fechacierre.setValue(now);
    }

    this.btnGuardar = true;
  }

  crearAperturaCierrer() {
    const Swal = require('sweetalert2');
    this.loading = true;

    Swal.fire({
      title: this.TranslateUtil('key.alert.title.inventario.apertura.cierre'),
      text: this.TranslateUtil('key.alert.text.inventario.apertura.cierre'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.value) {
        this.cambioAperturaCierre();
      } else {
        this.loading = false;
      }

    })

  }

  cambioAperturaCierre() {
    this._inventariosService.CrearPeriodoInventario(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.FormCerrarAbrirInventario.controls.fechaapertura.value,
      this.servidor,
      this.usuario
    ).subscribe(
      response => {
        if (response != null) {
          this.btnCambios = true;
          this.loading = false;
          this.alertSwal.title = this.TranslateUtil('key.alert.cerrar.abrir.inventario.apertura.cierre');

          if (this.botonCambioEstado == this.TranslateUtil('key.boton.cambio.estado.abrir.inventario.apertura.cierre')) {
            this.alertSwal.text = this.TranslateUtil('key.alert.abrir.inventario.apertura.cierre');
          } else {
            this.alertSwal.text = this.TranslateUtil('key.alert.cerrar.inventario.apertura.cierre');
          }
          this.alertSwal.show();
          this.btnGuardar = false;
        }
      },
      error => {
        this.loading = false;

        this.alertSwalError.title = this.TranslateUtil('key.alert.cerrar.abrir.inventario.apertura.cierre');
        var errorData = error.error.substring(38, 47);

        switch (errorData) {
          case 'ORA-20003':
            this.alertSwalError.text = this.TranslateUtil('key.mensaje.existen.bodegas.aprobar');
            break;
          default:
            this.alertSwalError.text = errorData;
            break;
        }

        this.alertSwalError.show();
      }
    );



  }

  limpiar() {
    this.FormCerrarAbrirInventario.reset();
  }

}
