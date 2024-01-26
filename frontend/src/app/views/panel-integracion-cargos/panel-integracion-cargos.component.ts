import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { esLocale } from 'ngx-bootstrap/locale';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { EstadosTraspasosFin700 } from 'src/app/models/entity/EstadosTraspasosFin700';
import { MovimientoInterfaz } from 'src/app/models/entity/movimiento-interfaz';
import { Servicio } from 'src/app/models/entity/Servicio';
import { TipoOperacion } from 'src/app/models/entity/tipo-operacion';
import { EstructuraunidadesService } from 'src/app/servicios/estructuraunidades.service';
import { InterfacesService } from 'src/app/servicios/interfaces.service';
import { ReportesMonitorInterfazCargosService } from 'src/app/servicios/reportes-monitor-interfaz-cargos.service';
import { environment } from 'src/environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-panel-integracion-cargos',
  templateUrl: './panel-integracion-cargos.component.html',
  styleUrls: ['./panel-integracion-cargos.component.css']
})
export class PanelIntegracionCargosComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public locale = 'es';
  public bsConfig: Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';

  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public loading = false;
  public lForm: FormGroup;
  public FormFiltroHos: FormGroup;
  public FormFiltroCargosUrgencias: FormGroup;
  
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  public estadostraspasos: Array<EstadosTraspasosFin700> = [];

  /** Todos los movimientos de cargos hospitalizados que se traen del backend */
  public listahospitalizados: Array<MovimientoInterfaz> = [];

  /** Los movimientos a mostrar en la grilla (filtrados, ordenados, etc) */
  public listahospitalizadosPaginacion: Array<MovimientoInterfaz> = [];

  /** Todos los movimientos de cargos urgencia que se traen del backend */
  public listaurgencia: Array<MovimientoInterfaz> = [];

  /** Los movimientos a mostrar en la grilla (filtrados, ordenados, etc) */
  public listaurgenciaPaginacion: Array<MovimientoInterfaz> = [];

  public opcion_hospitalizado = false;
  public opcion_urgencia = false;


  public _MovimientoInterfaz: MovimientoInterfaz;
  public modoOrdenarCargosHospitalizados: 'ASC' | 'DESC' = 'ASC';
  public modoOrdenarCargosUrgencias: 'ASC' | 'DESC' = 'ASC';
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public servicios              : Array<Servicio> = [];
  public page: number;
  public tipoOperaciones: TipoOperacion[] = []

  constructor(
    private interfacesService       : InterfacesService,
    public datePipe                  : DatePipe,
    public localeService             : BsLocaleService,
    public formBuilder               : FormBuilder,
    public estructuraunidadesService : EstructuraunidadesService,
    private reportesService          : ReportesMonitorInterfazCargosService,
    public translate: TranslateService
  ) {
    this.lForm = this.formBuilder.group({
      fechadesde: [new Date(), Validators.required],
      fechahasta: [new Date(), Validators.required],
      cuenta: [{ value: null, disabled: false }, Validators.required],
    });

    this.FormFiltroHos = this.formBuilder.group({
      id              : [null],
      soliid          : [null],
      fecha           : [null],
      tipomovimiento  : [null],
      receta          : [null],
      cuenta          : [null],
      rut             : [null],
      paciente        : [null],
      servicio        : [null],
      cama            : [null],
      codigo          : [null],
      descripcion     : [null],
      cantidad        : [null],
      estado          : [null],
      observacion     : [null],
    });

    this.FormFiltroCargosUrgencias = this.formBuilder.group({
      id             : [null],
      soliid         : [null],
      fecha          : [null],
      tipomovimiento : [null],
      receta         : [null],
      cuenta         : [null],
      rut            : [null],
      paciente       : [null],
      servicio       : [null],
      codigo         : [null],
      descripcion    : [null],
      cantidad       : [null],
      estado         : [null],
      observacion    : [null],
    });
  }


  ngOnInit() {
    this.setDate();

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.BuscarMovimientoInterfazCargos();
    this.cargarCombos();
  }
  
  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  cargarCombos() {
    this.estructuraunidadesService
      .BuscarServicios(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor, 3, '')
      .toPromise()
      .then((response) => {
        if (response != null) {
          this.servicios = response;
        }
      })
      .catch(() => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.servicios'));
      });

    this.estructuraunidadesService
      .BuscarTipoOperacion(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor)
      .toPromise()
      .then((response) => {
        if (response != null) {
          this.tipoOperaciones = response;
        }
      })
      .catch(() => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.tipos.operacion'));
      });

    this.interfacesService
      .EstadosTraspasosFin700(this.usuario, this.servidor)
      .toPromise()
      .then((response) => {
        if (response != null) {
          this.estadostraspasos = response;
        }
      })
      .catch((error) => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.estados'));
      });  
  }

  BuscarMovimientoInterfazCargos() {
    let fechadesde = '';
    let fechahasta = '';

    if (this.lForm.value.numerosolicitud == null || this.lForm.value.numerosolicitud <= 0 ) {
      fechadesde = this.datePipe.transform(this.lForm.value.fechadesde, 'yyyy-MM-dd');
      fechahasta = this.datePipe.transform(this.lForm.value.fechahasta, 'yyyy-MM-dd');
    }

    this._MovimientoInterfaz = new MovimientoInterfaz()
    this._MovimientoInterfaz.hdgcodigo    = Number(sessionStorage.getItem('hdgcodigo').toString())
    this._MovimientoInterfaz.esacodigo    = Number(sessionStorage.getItem('cmecodigo').toString())
    this._MovimientoInterfaz.cmecodigo    = Number(sessionStorage.getItem('cmecodigo').toString())
    this._MovimientoInterfaz.fechainicio  = fechadesde
    this._MovimientoInterfaz.fechatermino = fechahasta
    this._MovimientoInterfaz.servidor     = this.servidor
    this._MovimientoInterfaz.ctanumcuenta = this.lForm.value.cuenta

    this.loading = true;
    this.interfacesService
      .listamovimientointerfazcargo(this._MovimientoInterfaz)
      .toPromise()
      .then((response) => {
        if (response == null) {
          throw new Error('Respuesta de "listamovimientointerfazcargo" es null');
        }

        /* codambito == 2 => Hospitalizados
         * codambito == 3 => Urgencias
         * codambito == 1 u otro => Ambulatorio
         */
        const movimientosHospitalizados: MovimientoInterfaz[] = []
        const movimientosUrgencia: MovimientoInterfaz[] = []

        for (const movimiento of response) {
          if (movimiento.codambito === 2) {
            movimientosUrgencia.push(movimiento)
          }

          if (movimiento.codambito === 3) {
            movimientosHospitalizados.push(movimiento)
          }
        }

        this.listahospitalizados = movimientosHospitalizados;
        this.listahospitalizadosPaginacion = this.listahospitalizados;

        this.listaurgencia = movimientosUrgencia;
        this.listaurgenciaPaginacion = this.listaurgencia;
      })
      .catch(() => {        
        this.listahospitalizados = []
        this.listahospitalizadosPaginacion = this.listahospitalizados;

        this.listaurgencia = []
        this.listaurgenciaPaginacion = this.listaurgencia;

        alert('Error al traer los movimientos de la interfaz de cargos');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  refrescar() {
    this.BuscarMovimientoInterfazCargos()
  }

  eleccionopcion(opcion: string) {
    switch (opcion) {
      case 'HOSPITALIZADOS': {
        this.opcion_hospitalizado = true;
        this.opcion_urgencia = false;
        break;
      }
      case 'URGENCIAS': {
        this.opcion_hospitalizado = false;
        this.opcion_urgencia = true;
        break;
      }
      default: {
        this.opcion_hospitalizado = false;
        this.opcion_urgencia = false;
        break;
      }
    }
  }

  Enviar(registro: MovimientoInterfaz) {
    registro.usuario = sessionStorage.getItem('Usuario').toString();
    registro.servidor = this.servidor;
    this.alertSwalAlert.title = null;

    // hdgcodigo int, idMovimiento int, idDetalleMovimiento int, servidor string, IDDevolucion int
    this.interfacesService
      .enviacargossisalud(
        registro.esacodigo,
        registro.hdgcodigo,
        registro.movid,
        registro.detid,
        registro.devid,
        registro.servidor,
      )
      .subscribe((response) => {
        if (response != null) {
          this.interfacesService
            .listamovimientointerfaz(this._MovimientoInterfaz)
            .subscribe((response) => {});
        }
      });

    this.refrescar();
  }

  activaEnviar(registro: MovimientoInterfaz) {
    return registro.intcargoestado.trim() != 'TRASPASADO'
  }

  limpiarFiltros() {
    this.FormFiltroHos.reset();
    if(this.listahospitalizados != null){
      this.filtroHos();
    }

    this.FormFiltroCargosUrgencias.reset()
    if (this.listaurgencia != null) {
      this.filtrarCargosUrgencias()
    }
  }
  
  /**
   * @param campoParaOrdenar 
   * Tiene que ser el nombre del campo tal como esta escrito `MovimientoInterfaz`.
   */
  sortbyHos(campoParaOrdenar: keyof MovimientoInterfaz){
    const comparador = this.crearComparadorMovimientoInterfaz(
      campoParaOrdenar,
      this.modoOrdenarCargosHospitalizados,
    );

    this.listahospitalizadosPaginacion.sort(comparador);

    this.modoOrdenarCargosHospitalizados =
      this.modoOrdenarCargosHospitalizados === 'ASC' ? 'DESC' : 'ASC';
  }

  /**
   * @param campoParaOrdenar 
   * Tiene que ser el nombre del campo tal como esta escrito `MovimientoInterfaz`.
   */
  ordenarCargosUrgenciasPor(campoParaOrdenar: keyof MovimientoInterfaz) {
    const comparador = this.crearComparadorMovimientoInterfaz(
      campoParaOrdenar,
      this.modoOrdenarCargosUrgencias,
    );

    this.listaurgenciaPaginacion.sort(comparador);

    this.modoOrdenarCargosUrgencias = this.modoOrdenarCargosUrgencias === 'ASC' ? 'DESC' : 'ASC';
  }
 
  /**
   * @param propiedad 
   * La propiedad del movimiento interfaz que se quiere comparar.
   * 
   * @param orden 
   * La forma de ordenar
   * 
   * @returns 
   * Una funcion para ocupar con el método `Array.sort()`
   */
  private crearComparadorMovimientoInterfaz(propiedad: keyof MovimientoInterfaz, orden: 'ASC' | 'DESC') {
    return (a: MovimientoInterfaz, b: MovimientoInterfaz) => {
      const FACTOR_ORDEN = orden === 'ASC' ? 1 : -1; // Esto sirve para dar vuelta el orden

      if (propiedad === 'fecha') {
        // Se asume que la fecha viene en formato "dd-MM-yyyy HH:mm:ss"

        const [fecha_a, hora_a] = (a[propiedad] as string).split(' ');
        const [fecha_b, hora_b] = (b[propiedad] as string).split(' ');

        const [dia_a, mes_a, ano_a] = fecha_a.split('-');
        const [dia_b, mes_b, ano_b] = fecha_b.split('-');

        const fechaNueva_a = `${ano_a}-${mes_a}-${dia_a} ${hora_a}`;
        const fechaNueva_b = `${ano_b}-${mes_b}-${dia_b} ${hora_b}`;

        return FACTOR_ORDEN * fechaNueva_a.localeCompare(fechaNueva_b);
      }

      if (typeof a[propiedad] === 'number') {
        if (a[propiedad] === b[propiedad]) {
          return 0;
        } else if (a[propiedad] < b[propiedad]) {
          return FACTOR_ORDEN * -1;
        } else {
          return FACTOR_ORDEN * 1;
        }
      }

      if (typeof a[propiedad] === 'string') {
        return FACTOR_ORDEN * (a[propiedad] as string).localeCompare(b[propiedad] as string);
      }
    };
  }

  filtroHos() {
    const filtro = this.crearFiltroMovimientoInterfaz(this.FormFiltroHos);

    this.listahospitalizadosPaginacion = this.listahospitalizados.filter((mov) => filtro(mov));

    /** Si uno esta en una pagina distinta a la primera (por ejemplo la 3) y al momento de filtrar
     * la cantidad de resultados no alcanza a cubrir hasta esa pagina se va a mostrar una lista
     * vacia y no estará los controles de paginacion. */
    this.page = 1;
  }

  filtrarCargosUrgencias() {
    const filtro = this.crearFiltroMovimientoInterfaz(this.FormFiltroCargosUrgencias);

    this.listaurgenciaPaginacion = this.listaurgencia.filter((mov) => filtro(mov));

    /** Si uno esta en una pagina distinta a la primera (por ejemplo la 3) y al momento de filtrar
     * la cantidad de resultados no alcanza a cubrir hasta esa pagina se va a mostrar una lista
     * vacia y no estará los controles de paginacion. */
    this.page = 1;
  }  

  private crearFiltroMovimientoInterfaz(formularioFiltros: FormGroup) {
    // EXTRAER DATOS
    const {
      id,
      soliid,
      fecha: fechaFormulario,
      tipomovimiento: tipoMovimiento,
      receta,
      cuenta,
      rut,
      paciente,
      servicio,
      cama,
      codigo,
      descripcion,
      cantidad,
      estado,
      observacion,
    } = formularioFiltros.value;

    // LIMPIAR DATOS
    const fecha = this.datePipe.transform(fechaFormulario, 'dd-MM-yyyy');

    const estadoSeleccionado = this.estadostraspasos.find((x) => x.codigo === estado);

    const tipoMovimientoSeleccionado = this.tipoOperaciones.find(
      (x) => x.codigo === tipoMovimiento,
    );

    // VERIFICAR FILTROS
    const valorExiste = (x: any) => x != null && x != undefined;

    return (mov: MovimientoInterfaz) => {
      /* NOTA: Cuando el campo por filtrar es no existe (null | undefined) se retorna `true` para
       * indicar que no se esta filtrando por ese campo
       */
      const cumpleFiltroId = valorExiste(id) ? mov.fdeid === id : true;

      const cumpleFiltroSolicitud = valorExiste(soliid) ? mov.soliid === soliid : true;

      const cumpleFiltroFecha = valorExiste(fechaFormulario) ? mov.fecha.startsWith(fecha) : true;

      const cumpleFiltroTipoMovimiento = valorExiste(tipoMovimiento)
        ? mov.tipomovimiento === tipoMovimientoSeleccionado.descripcion
        : true;

      const cumpleFiltroReceta = valorExiste(receta) ? mov.numeroreceta === receta : true;

      const cumpleFiltroCuenta =
        valorExiste(cuenta) && cuenta.trim() !== '' ? mov.ctanumcuenta === cuenta : true;

      const cumpleFiltroRut = valorExiste(rut)
        ? mov.identificacion.toLocaleLowerCase().includes(rut.toLocaleLowerCase())
        : true;

      const cumpleFiltroPaciente = valorExiste(paciente)
        ? mov.paciente.toLocaleLowerCase().includes(paciente.toLocaleLowerCase())
        : true;

      const cumpleFiltroServicio =
        valorExiste(servicio) && servicio.trim() !== '' ? mov.servicio === servicio : true;

      const cumpleFiltroCama =
        valorExiste(cama) && cama.trim() !== ''
          ? mov.camaactual.toLocaleLowerCase().includes(cama.toLocaleLowerCase())
          : true;

      const cumpleFiltroCodigo =
        valorExiste(codigo) && codigo.trim() != ''
          ? mov.mfdemeincodmei.toLocaleLowerCase().includes(codigo.toLocaleLowerCase())
          : true;

      const cumpleFiltroDescripcion = valorExiste(descripcion)
        ? mov.descripcionproducto.toLocaleLowerCase().includes(descripcion.toLocaleLowerCase())
        : true;

      const cumpleFiltroCantidad = valorExiste(cantidad) ? mov.mfdecantidad === cantidad : true;

      const cumpleFiltroObservacion = valorExiste(observacion)
        ? mov.intcargoerror.toLocaleLowerCase().includes(observacion.toLocaleLowerCase())
        : true;

      const cumpleFiltroEstado =
        valorExiste(estado) && estado !== 1
          ? mov.intcargoestado === estadoSeleccionado.descripcion
          : true;

      return (
        cumpleFiltroId &&
        cumpleFiltroSolicitud &&
        cumpleFiltroFecha &&
        cumpleFiltroTipoMovimiento &&
        cumpleFiltroReceta &&
        cumpleFiltroCuenta &&
        cumpleFiltroRut &&
        cumpleFiltroPaciente &&
        cumpleFiltroServicio &&
        cumpleFiltroCama &&
        cumpleFiltroCodigo &&
        cumpleFiltroDescripcion &&
        cumpleFiltroCantidad &&
        cumpleFiltroObservacion &&
        cumpleFiltroEstado
      );
    };
  } 

  async generarExcelGrillaCompleta() {
    if (this.opcion_hospitalizado) {
      const debeImprimir = await this.abrirDialogoConfirmacionImpresion(
        '¿Desea imprimir grilla de cargos Hospitalizados?',
      );

      if (!debeImprimir) {
        return;
      }

      try {
        await this.reportesService.generarExcelCargosHospitalizados(this.listahospitalizados);
      } catch (error) {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.excel.grilla.cargos.hospitalizados');
        this.alertSwalError.show();
      }

      return;
    }

    if (this.opcion_urgencia) {
      const debeImprimir = await this.abrirDialogoConfirmacionImpresion(
        '¿Desea imprimir grilla de cargos Urgencias?',
      );

      if (!debeImprimir) {
        return;
      }

      try {
        await this.reportesService.generarExcelCargosUrgencias(this.listaurgencia);
      } catch (error) {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.excel.grilla.cargos.urgencias');
        this.alertSwalError.show();
      }
    }
  }

  private async abrirDialogoConfirmacionImpresion(mensaje: string) {
    const Swal = require('sweetalert2');

    const {value: debeGenerarReporte} = await Swal.fire({
      title: mensaje,
      text: '',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
    });

    return !!debeGenerarReporte;
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
