import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Parametro } from 'src/app/models/parametro';
import { ParametrosService } from 'src/app/servicios/parametros-service/parametros.service';
import { DatosGrabarParametros } from 'src/app/servicios/parametros-service/parametros.service.types';

@Component({
  selector: 'app-mantenedor-de-parametros',
  templateUrl: './mantenedor-de-parametros.component.html',
  styleUrls: ['./mantenedor-de-parametros.component.css'],
})
export class MantenedorDeParametrosComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  loading = false;

  tiposParametros: Parametro[] = [];

  readonly parametrosForm = this.formBuilder.group({
    tipoParametro: [null, Validators.required],
    filtroBusqueda: [''],
    parametros: this.formBuilder.array([]),
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private parametrosService: ParametrosService,
  ) {}

  /**
   * Los parametros que están en la tabla de parametros.
   *
   * **IMPORTANTE**: Si hay que agregar o quitar elementos del arreglo `parametrosArray.controls`
   * hay que resetear el control `parametros` en el formulario `parametrosForm` para que se ejecute
   * bien la validación. Esto se hace de esta forma
   *
   *  ```typescript
   *  this.parametrosArray.controls.unshift(<nuevo elemento>);
   *  this.parametrosForm.setControl(
   *    'parametros',
   *    this.formBuilder.array(this.parametrosArray.controls),
   *  );
   *  ```
   */
  get parametrosArray() {
    return this.parametrosForm.get('parametros') as FormArray;
  }

  get tipoParametroSeleccionado() {
    return this.parametrosForm.value.tipoParametro as Parametro;
  }

  ngOnInit() {
    this.cargarTiposDeParametros();
  }

  private async cargarTiposDeParametros() {
    try {
      this.tiposParametros = await this.parametrosService.buscarTiposDeParametros();

      if (!this.tiposParametros || this.tiposParametros.length === 0) {
        return;
      }

      this.parametrosForm.patchValue({
        tipoParametro: this.tiposParametros[0],
      });

      await this.onCambiarTipoParametro();
    } catch (error) {
      console.error('[ERROR AL CARGAR COMBO TIPO PARAMETROS] ', error);

      this.alertSwalError.title = 'Error al cargar combo con los tipos de parámetros';
      this.alertSwalError.text = '';
      await this.alertSwalError.show();
    }
  }

  async onCambiarTipoParametro(pedirConfirmacion = false) {
    if (pedirConfirmacion) {
      const confirmaCambiar = await this.abrirModalDeConfirmación({
        title: '¿Está seguro que desea cambiar el tipo de parámetro?',
        text: 'Todos los cambios realizados se perderán',
      });

      if (!confirmaCambiar) {
        return;
      }
    }

    try {
      this.loading = true;

      const tipoParametro = this.tipoParametroSeleccionado.tipo;
      const parametros = await this.parametrosService.buscarParametros(tipoParametro);

      const controls = parametros.map((p) => this.crearFormGroupDeParametro(p));

      this.parametrosForm.setControl('parametros', this.formBuilder.array(controls));

      this.loading = false;
    } catch (error) {
      this.loading = false;

      console.error('[ERROR AL CARGAR PARAMETROS] ', error);

      this.alertSwalError.title = 'Error al cargar parámetros';
      this.alertSwalError.text = '';
      await this.alertSwalError.show();
    }
  }

  agregarNuevoParametro() {
    this.parametrosArray.controls.unshift(this.crearFormGroupDeParametro());

    this.parametrosForm.setControl(
      'parametros',
      this.formBuilder.array(this.parametrosArray.controls),
    );
  }

  private crearFormGroupDeParametro(parametro?: Parametro) {
    if (parametro) {
      return this.formBuilder.group({
        id: [parametro.id],
        codigo: [parametro.codigo],
        descripcion: [parametro.descripcion, [Validators.required, Validators.maxLength(255)]],
        estado: [parametro.estado, [Validators.required]],
        modificable: [parametro.modificable],
        accion: [null],
        enEdicion: [false],
        descripcionOriginal: [parametro.descripcion],
        estadoOriginal: [parametro.estado],
      });
    } else {
      return this.formBuilder.group({
        id: [null],
        codigo: [null],
        descripcion: [
          `PARAMETRO ${this.parametrosArray.controls.length + 1}`,
          [Validators.required, Validators.maxLength(255)],
        ],
        estado: [1, [Validators.required]], // NO vigente por defecto
        modificable: ['S'],
        accion: ['I'],
        enEdicion: [true],
        descripcionOriginal: [`PARAMETRO ${this.parametrosArray.controls.length + 1}`],
        estadoOriginal: [1],
      });
    }
  }

  async borrarCambios() {
    const confirmaBorrarCambios = await this.abrirModalDeConfirmación({
      title: '¿Está seguro que desea borrar todos los cambios?',
      text: 'Todos los cambios realizados se perderán',
    });

    if (!confirmaBorrarCambios) {
      return;
    }

    this.onCambiarTipoParametro();
  }

  eliminarParametro(control: AbstractControl) {
    const index = this.parametrosArray.controls.indexOf(control);

    if (index > -1) {
      this.parametrosArray.controls.splice(index, 1);
    }

    this.parametrosForm.setControl(
      'parametros',
      this.formBuilder.array(this.parametrosArray.controls),
    );
  }

  editarParametro(control: AbstractControl) {
    const accionActual = control.get('accion').value;

    control.patchValue({
      accion: accionActual === 'I' ? 'I' : 'M',
      enEdicion: true,
    });
  }

  aceptarCambiosParametro(control: AbstractControl) {
    const nuevaDescripcion = control.get('descripcion').value;
    const nuevoEstado = control.get('estado').value;

    control.patchValue({
      descripcionOriginal: nuevaDescripcion,
      estadoOriginal: nuevoEstado,
      enEdicion: false,
    });
  }

  cancelarCambiosParametro(control: AbstractControl) {
    const descripcionAnterior = control.get('descripcionOriginal').value;
    const estadoAnterior = control.get('estadoOriginal').value;
    const accionActual = control.get('accion').value;

    control.patchValue({
      descripcion: descripcionAnterior,
      estado: estadoAnterior,
      enEdicion: false,
    });

    if (accionActual === 'M' && control.pristine) {
      control.patchValue({
        accion: null,
      });
    }
  }

  async grabarParametros() {
    const parametros = this.parametrosArray.controls.map((c) => c.value);

    // REVISAR QUE ESTE TODO CONFIRMADO
    if (parametros.some((p) => p.enEdicion === true)) {
      this.alertSwalAlert.title = 'Tiene cambios pendientes';
      this.alertSwalAlert.text = 'Debe confirmar todos los cambios antes de continuar';
      await this.alertSwalAlert.show();
      return;
    }

    // REVISAR SI HAY CAMBIOS
    const cambiosPorGrabar = parametros.filter((p) => {
      return p.accion === 'I' || p.accion === 'M';
    });

    if (cambiosPorGrabar.length === 0) {
      this.alertSwal.title = 'Cambios grabados con éxito';
      this.alertSwal.text = '';
      await this.alertSwal.show();
      return;
    }

    // AHORA SI A GRABAR LOS PARAMETROS
    try {
      this.loading = true;

      const datosGrabarParametros = cambiosPorGrabar.map((parametro) => {
        return <DatosGrabarParametros>{
          id: parametro.id,
          tipo: this.tipoParametroSeleccionado.tipo,
          codigo: parametro.codigo,
          descripcion: parametro.descripcion,
          estado: parametro.estado,
          accion: parametro.accion,
        };
      });

      await this.parametrosService.grabarParametros(datosGrabarParametros);

      this.loading = false;

      this.alertSwal.title = 'Cambios grabados con éxito';
      this.alertSwal.text = '';
      await this.alertSwal.show();

      await this.onCambiarTipoParametro();
    } catch (error) {
      this.loading = false;

      console.error('[ERROR AL GRABAR PARAMETROS] ', error);

      this.alertSwalError.title = 'Error al grabar parámetros';
      this.alertSwalError.text = '';
      await this.alertSwalError.show();
    }
  }

  async salir() {
    const confirmaSalir = await this.abrirModalDeConfirmación({
      title: '¿Está seguro que desea salir?',
      text: 'Todos los cambios realizados se perderán',
    });

    if (!confirmaSalir) {
      return;
    }

    this.router.navigate(['home']);
  }

  private async abrirModalDeConfirmación(datos: { title: string; text?: string }) {
    const Swal = require('sweetalert2');
    const confirmaSalir = await Swal.fire({
      title: datos.title,
      text: datos.text ? datos.text : '',
      type: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0069d9',
      confirmButtonText: 'Aceptar',
      cancelButtonColor: '#c82333',
      cancelButtonText: 'Cancelar',
    }).then((x) => x.value);

    return !!confirmaSalir;
  }

  obtenerParametrosFiltrados() {
    const textoBusqueda: string = this.parametrosForm.get('filtroBusqueda').value;
    if (!textoBusqueda || textoBusqueda.trim() === '') {
      return this.parametrosArray.controls;
    }

    return this.parametrosArray.controls.filter((control) => {
      return (
        control.value.descripcion &&
        control.value.descripcion.toUpperCase().includes(textoBusqueda.trim().toUpperCase())
      );
    });
  }

  limpiarBusquedaEnTabla() {
    this.parametrosForm.patchValue({
      filtroBusqueda: '',
    });
  }

  noHayParametrosEditables() {
    return !this.parametrosArray.controls.some((c) => c.value.modificable === 'S');
  }
}
