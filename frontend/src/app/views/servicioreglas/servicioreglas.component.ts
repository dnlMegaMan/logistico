import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BodegaMantenedorReglas } from 'src/app/models/entity/bodega-mantenedor-reglas';
import { ServicioMantenedorReglas } from 'src/app/models/entity/servicios-mantenedor-reglas';
import { environment } from 'src/environments/environment';
import { BodegasService } from '../../servicios/bodegas.service';
import { ServicioService } from '../../servicios/servicio.service';
import { BusquedaservicioreglasComponent } from '../busquedaservicioreglas/busquedaservicioreglas.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-servicioreglas',
  templateUrl: './servicioreglas.component.html',
  styleUrls: ['./servicioreglas.component.css'],
})
export class ServicioreglasComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  hdgcodigo: number;
  esacodigo: number;
  cmecodigo: number;
  usuario: string;
  servidor = environment.URLServiciosRest.ambiente;

  servicioForm = this.formBuilder.group({
    codigo: [''],
    descripcion: [''],
  });

  reglasBodegaForm = this.formBuilder.group({
    reglaId: [0], // solo sirve para cuando hay que actualizar
    bodegaInsumo: [0, [this.bodegaObligatoriaValidator()]],
    bodegaMedicamento: [0, [this.bodegaObligatoriaValidator()]],
    bodegaConsignacion: [0],
    bodegaControlados: [0],
    bodegaServicio: [0, [this.bodegaObligatoriaValidator()]],
    centroCosto: [null, [Validators.required, Validators.min(1)]],
    centroConsumo: [null, [Validators.required, Validators.min(1)]],
  });

  /** Indica si el componente se esta usando para crear o modificar las reglas de un servicio. */
  modoComponente: 'modificacion' | 'creacion' = 'modificacion';

  loading = false;
  servicios: Array<ServicioMantenedorReglas> = [];
  bodegas: Array<BodegaMantenedorReglas> = [];

  constructor(
    private formBuilder: FormBuilder,
    private serviciosService: ServicioService,
    private bodegasService: BodegasService,
    private modalService: BsModalService,
    public translate: TranslateService
  ) {}

  private bodegaObligatoriaValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const codigoBodega = control.value;

      return codigoBodega <= 0 ? { sinBodega: true } : null;
    };
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.cargarServicios().then(() => {});

    this.bodegasService
      .buscarBodegasMantenedorReglas(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.usuario,
        this.servidor,
      )
      .toPromise()
      .then((bodegas) => {
        this.bodegas = bodegas;
      });

    this.reglasBodegaForm.disable();
  }

  private cargarServicios() {
    return this.serviciosService
      .buscarServiciosMantenedorDeReglas(true)
      .toPromise()
      .then((servicios) => {
        this.servicios = servicios;
        return servicios;
      });
  }

  async limpiar() {
    this.modoComponente = 'modificacion';
    this.servicioForm.enable();
    this.reglasBodegaForm.disable();
    this.servicioForm.reset();
    this.reglasBodegaForm.reset();

    await this.cargarServicios();
  }

  async seleccionarServicio() {
    const { codigo, descripcion } = this.servicioForm.value;
    const servicio = this.servicios.find((s) => {
      return s.codigo === codigo || s.descripcion === descripcion;
    });

    if (!servicio) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.servicio');
      this.alertSwalAlert.show();
      return;
    }

    this.cargarServicioEnPantalla(servicio);
    this.servicioForm.disable();

    const todoOK = await this.obtenerReglas(servicio.codigo);
    if (!todoOK) {
      this.reglasBodegaForm.disable();
    } else {
      this.reglasBodegaForm.enable();
    }
  }

  private async cargarServicioEnPantalla(servicio: ServicioMantenedorReglas) {
    this.servicioForm.patchValue({
      codigo: servicio.codigo,
      descripcion: servicio.descripcion,
    });
  }

  /**
   * @returns
   * `true` si es que no hay errores al obtener las reglas, `false` de lo contrario.
   */
  private async obtenerReglas(codigoServicio: string) {
    const reglas = await this.serviciosService.buscaReglasPorServicio(codigoServicio).toPromise();

    if (reglas.length === 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.hay.reglas.asociadas.servicio');
      this.alertSwalAlert.show();
      return false;
    }

    if (reglas.length > 1) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.servicio.tiene.mas.regla.asociada');
      this.alertSwalAlert.show();
      return false;
    }

    this.reglasBodegaForm.patchValue({
      reglaId: reglas[0].reglaId,
      bodegaInsumo: reglas[0].bodegaInsumos,
      bodegaMedicamento: reglas[0].bodegaMedicamento,
      bodegaConsignacion: reglas[0].bodegaConsignacion,
      bodegaControlados: reglas[0].bodegaControlados,
      bodegaServicio: reglas[0].bodegaServicio,
      centroCosto: reglas[0].centroDeCosto === 0 ? null : reglas[0].centroDeCosto,
      centroConsumo: reglas[0].centroDeConsumo === 0 ? null : reglas[0].centroDeConsumo,
    });

    return true;
  }

  async buscarServicio() {
    const BSModalRef = this.modalService.show(BusquedaservicioreglasComponent, {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.servicio'),
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
      },
    });

    BSModalRef.content.onClose.subscribe((nuevoServicio: ServicioMantenedorReglas | null) => {
      if (!nuevoServicio) {
        return;
      }

      this.modoComponente = 'creacion';
      this.cargarServicioEnPantalla(nuevoServicio);
      this.servicioForm.disable();
      this.reglasBodegaForm.enable();
    });
  }

  async crearReglas() {
    try {
      this.loading = true;

      await this.serviciosService
        .crearReglas(
          this.servicioForm.value.codigo,
          parseInt(this.reglasBodegaForm.value.bodegaServicio),
          parseInt(this.reglasBodegaForm.value.bodegaMedicamento),
          parseInt(this.reglasBodegaForm.value.bodegaInsumo),
          parseInt(this.reglasBodegaForm.value.bodegaControlados),
          parseInt(this.reglasBodegaForm.value.bodegaConsignacion),
          parseInt(this.reglasBodegaForm.value.centroCosto),
          parseInt(this.reglasBodegaForm.value.centroConsumo),
        )
        .toPromise();

      this.reglasBodegaForm.disable();

      this.loading = false;

      this.alertSwal.title = this.TranslateUtil('key.mensaje.regla.creada.exitosamente');
      await this.alertSwal.show();
    } catch (error) {
      this.loading = false;

      console.error(error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.crear.nueva.regla');
      await this.alertSwalError.show();
    }
  }

  async modificarReglas() {
    try {
      this.loading = true;

      await this.serviciosService
        .modificarReglas(
          parseInt(this.reglasBodegaForm.value.reglaId),
          parseInt(this.reglasBodegaForm.value.bodegaServicio),
          parseInt(this.reglasBodegaForm.value.bodegaMedicamento),
          parseInt(this.reglasBodegaForm.value.bodegaInsumo),
          parseInt(this.reglasBodegaForm.value.bodegaControlados),
          parseInt(this.reglasBodegaForm.value.bodegaConsignacion),
          this.servicioForm.value.codigo,
          parseInt(this.reglasBodegaForm.value.centroCosto),
          parseInt(this.reglasBodegaForm.value.centroConsumo),
        )
        .toPromise();

      this.loading = false;

      this.reglasBodegaForm.disable();

      this.alertSwal.title = this.TranslateUtil('key.mensaje.regla.modificada.exitosamente');
      await this.alertSwal.show();
    } catch (error) {
      this.loading = false;

      console.error(error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.modificar.reglas');
      await this.alertSwalError.show();
    }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
