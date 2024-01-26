import { Component, OnInit, ViewChild } from '@angular/core';
import { esLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PrestamosService } from '../services/prestamos.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ConsularParam, ConsularParamData } from '../interfaces/consular-param.interface';
import { ModalBuscarPrestamosComponent } from '../components/modal-buscar-prestamos/modal-buscar-prestamos.component';
import { ModalBuscarFarmacosComponent } from '../components/modal-buscar-farmacos/modal-buscar-farmacos.component';
import { BuscaProdPorDescripcion, BuscarPrestamo, Medicamento, PrestamoDet, PrestamoMov, RespuestaPrestamo } from '../interfaces/buscar-prod-por-descripcion.interface';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DatePipe } from '@angular/common';
import { Permisosusuario } from 'src/app/permisos/permisosusuario';
import { ModalForzarCierreComponent } from '../components/modal-forzar-cierre/modal-forzar-cierre.component';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-plantilla-prestamos',
  templateUrl: './plantilla-prestamos.component.html',
  styleUrls: ['./plantilla-prestamos.component.css'],
  providers: [PrestamosService]
})
export class PlantillaPrestamosComponent implements OnInit {
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public _BSModalRef: BsModalRef;
  public bsConfig: Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';
  public locale = 'es';
  public formDatosPrestamo: FormGroup;
  public formDetallesPrestamos: FormGroup;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = sessionStorage.getItem('Usuario').toString();
  public listTipoPrestamo: Array<ConsularParamData>;
  public listTipoMovimiento: Array<ConsularParamData>;
  public listOrigen: Array<ConsularParamData>;
  public listDestino: Array<ConsularParamData>;
  public listBodegas: Array<ConsularParamData> = [];
  public listExternas: Array<ConsularParamData>;
  public listProductos: Array<ConsularParamData>;
  public detallesPrestamos: Array<PrestamoDet> = [];
  public detallesDevoluciones: Array<PrestamoMov> = [];
  public fechaDiasVencimiento: number;
  public loading = false;
  public cargandoInformacion: boolean = false;
  public cargandoReporte: boolean = false;
  public fechaVencimiento: string;
  public estadoPrestamo: number = 0;
  public estadoPrestamoDes: string;
  public estadoBotonBuscarMedicamento: boolean = false;

  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;

  constructor(
    private _BsModalService: BsModalService,
    private prestamoService: PrestamosService,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
  ) {

    this.formDatosPrestamo = this.formBuilder.group({
      fechaPrestamo: [{ value: null, disabled: false }, Validators.required],
      numeroPrestamo: [{ value: null, disabled: false }, [Validators.min(0), Validators.max(9999999999)]],
      tipoMov: [{ value: 'Salida', disabled: false }, Validators.required],
      origen: [{ value: null, disabled: false }, Validators.required],
      destino: [{ value: null, disabled: false }, Validators.required],
      observaciones: [{ value: null, disabled: false }]
    });

    this.formDetallesPrestamos = this.formBuilder.group({
      codigoMedicamento: [{ value: null, disabled: false }],
      tipoProducto: [{ value: 'M', disabled: false }, Validators.required],
      descripcionMedicamento: [{ value: null, disabled: false }],
    });

    this.formDatosPrestamo.controls['fechaPrestamo'].setValue(new Date());
  }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());

    this.consultarConsularParam();
    this.setDate();

  }

  onInput(event: any, field: string, maxLength: number) {
    const inputValue = event.target.value;
    if (inputValue.length > maxLength) {
      this.formDatosPrestamo.get(field).setValue(inputValue.slice(0, maxLength));
    }
  }

  onInputCantDevuelta(codigo: string, event: any, saldo: number) {
    const index = this.detallesPrestamos.findIndex(item => item.codigo === codigo);
    if (index !== -1) {
      const inputValue = event.target.value;
      if (inputValue > (saldo - this.detallesPrestamos[index].cant_devuelta)) {
        event.target.value = (saldo - this.detallesPrestamos[index].cant_devuelta);
      }
    }
  }

  onInputDetalleLote(codigo: string, event: any) {
    const index = this.detallesPrestamos.findIndex(item => item.codigo === codigo);
    if (index !== -1) {
      const inputValue = event.target.value;
      if (inputValue.length > 10) {
        event.target.value = inputValue.slice(0, 10);
      }
    }
  }

  onInputMovimientoLote(codigo: string, event: any) {
    const index = this.detallesDevoluciones.findIndex(item => item.codigo === codigo);
    if (index !== -1) {
      const inputValue = event.target.value;
      if (inputValue.length > 10) {
        event.target.value = inputValue.slice(0, 10);
      }
    }
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });

  }

  consultarConsularParam(): void {
    const consularParam: ConsularParamData = {
      servidor: this.servidor,
      hdgcodigo: this.hdgcodigo,
      esacodigo: this.esacodigo,
      cmecodigo: this.cmecodigo
    };

    this.prestamoService.consularParamInitPrestamos(consularParam)
      .toPromise().then((response) => {

        if (response != null) {
          this.listTipoPrestamo = response['consultar_tipo_prestamos'];
          this.listTipoMovimiento = response['consultar_tipo_movimientos'];
          this.listBodegas = response['consulta_list_bodegas'];
          this.listExternas = response['consulta_list_externas'];
          this.listProductos = response['consulta_list_productos'];
          this.fechaDiasVencimiento = response['ingreso_vencimiento']
          this.listOrigen = this.listBodegas;
          this.listDestino = this.listExternas;
        }
      })
      .catch(() => {
        this.loading = false;
        this.alertSwalError.text = 'Lamentablemente, ha ocurrido un error al intentar consultar parametros de inicio préstamos.';
        this.alertSwalError.show();
        this.cargandoInformacion = false;
      });
  }

  bodegaSelecionadaById(): number {
    let tipoMov = this.formDatosPrestamo.get('tipoMov').value;
    let bodega: number = this.formDatosPrestamo.get('destino').value;

    if (tipoMov == 'Salida') {
      bodega = this.formDatosPrestamo.get('origen').value;
    }

    return bodega;
  }

  editarCantidadSolicitada(detalle: PrestamoDet, nuevaCantidad: number) {
    const index = this.detallesPrestamos.findIndex(item => item.codigo === detalle.codigo);

    if (index !== -1) {
      let saldo = this.detallesPrestamos[index].saldo;

      if (nuevaCantidad > saldo) {
        this.detallesPrestamos[index].cant_solicitada = 0;
        this.loading = false;
        this.alertSwalAlert.title = 'Alerta';
        this.alertSwalAlert.text = 'El valor digitado es mayor a la cantidad en stock.';
        this.alertSwalAlert.show();
        return;
      }

      this.detallesPrestamos[index].cant_solicitada = Number(nuevaCantidad);
      this.detallesPrestamos[index].cant_devolver = 0
      this.detallesPrestamos[index].update = true;
    }

  }

  editarCantidadDevuelta(detalle: PrestamoDet, nuevaCantidad: number) {
    const index = this.detallesPrestamos.findIndex(item => item.codigo === detalle.codigo);

    if (index !== -1) {
      let cantidadSolicitada = this.detallesPrestamos[index].cant_solicitada;

      if (!(nuevaCantidad > cantidadSolicitada)) {

        this.loading = false;
        this.alertSwalAlert.title = 'Alerta';
        this.alertSwalAlert.text = 'El valor ingresado supera la cantidad solicitada.';
        this.alertSwalAlert.show();
        return;
      }

      this.detallesPrestamos[index].cant_devuelta = nuevaCantidad;
      this.detallesPrestamos[index].update = true;
    }

  }

  eliminarDetalle(codigo: string) {
    const Swal = require('sweetalert2');
    const index = this.detallesPrestamos.findIndex(item => item.codigo === codigo);
    if (index !== -1) {
      Swal.fire({
        title: '¿Desea Eliminar Producto?',
        text: 'Confirma eliminación',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.value) {
          this.detallesPrestamos.splice(index, 1);
        }
      });
    }
  }

  eliminarMovimiento(id: number) {
    const Swal = require('sweetalert2');
    const index = this.detallesDevoluciones.findIndex(item => item.id == id);
    if (index !== -1) {
      Swal.fire({
        title: '¿Desea Eliminar Movimiento?',
        text: 'Confirma eliminación',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.value) {
          this.detallesDevoluciones.splice(index, 1);
        }
      });
    }
  }

  validarBodegaOrigen() {
    var origen = this.formDatosPrestamo.get('origen').value;
    return origen != undefined && origen == this.formDatosPrestamo.get('destino').value;
  }

  filtroMovimiento() {
    this.listOrigen = [];
    this.listDestino = [];
    if (this.formDatosPrestamo.get('tipoMov').value == 'Salida') {
      this.listOrigen = this.listBodegas;
      this.listDestino = this.listExternas;
    } else {
      this.listOrigen = this.listExternas;
      this.listDestino = this.listBodegas;
    }
  }

  setModal() {
    let dtModal: any = {};

    const buscarMedicamento: BuscaProdPorDescripcion = {
      idbodega: this.bodegaSelecionadaById(),
      tipodeproducto: this.formDetallesPrestamos.get('tipoProducto').value,
      codigo: this.formDetallesPrestamos.get('codigoMedicamento').value,
      descripcion: this.formDetallesPrestamos.get('descripcionMedicamento').value
    }

    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        buscarMedicamento
      }
    };
    return dtModal;
  }

  isFieldValid(field: string) {
    return !this.formDatosPrestamo.get(field).valid && this.formDatosPrestamo.get(field).touched;
  }

  isFieldValidDetallesPrestamos(field: string) {
    return !this.formDetallesPrestamos.get(field).valid && this.formDetallesPrestamos.get(field).touched;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  isFechaVencimientoValida(fechaVto: string): boolean {
    let fechaActual: Date;
    let fechaVencimiento: Date;
    let permitirIngreso: Boolean;

    fechaVencimiento = new Date(fechaVto);
    fechaActual = new Date();

    const diferenciaMilisegundos = fechaActual.getTime() - fechaVencimiento.getTime();
    const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

    permitirIngreso = diferenciaDias >= 0 && diferenciaDias <= this.fechaDiasVencimiento;



    if (!permitirIngreso && diferenciaDias > 0) {

      this.loading = false;
      this.alertSwalAlert.title = 'Alerta';
      this.alertSwalAlert.text = 'La fecha de vencimiento proporcionada no es válida.';
      this.alertSwalAlert.show();
      return false;
    }

    return true;

  }

  actualizarDetallesLoteFechaVto(codigo: string, campo: string, dato: string) {
    const index = this.detallesPrestamos.findIndex(item => item.codigo === codigo);
    if (index !== -1) {

      if (campo == 'fecha') {
        const esValida = this.isFechaVencimientoValida(dato);
        this.detallesPrestamos[index].fecha_vto = esValida ? this.formatearFechaHora(dato) : null;

      }

      if (campo == 'lote') this.detallesPrestamos[index].lote = dato;
    }
  }

  agregarMovimientos(detallePrestamo: PrestamoDet, nuevaCantidad: number) {
    const Swal = require('sweetalert2');

    if (nuevaCantidad == 0) {
      this.loading = false;
      this.alertSwalAlert.title = 'Alerta';
      this.alertSwalAlert.text = 'Es necesario que la cantidad a devolver sea mayor que 0.';
      this.alertSwalAlert.show();
      return;
    }
    const index = this.detallesPrestamos.findIndex(item => item.codigo === detallePrestamo.codigo);

    if (index !== -1) {

      let productos = this.grupoCantidadProductos()[detallePrestamo.codigo];
      if (productos == null) {
        productos = 0;
      } else {
        productos = productos['cantidad']
      }

      const devuelta: number = Number(productos);
      const solicita: number = Number(this.detallesPrestamos[index].cant_solicitada);
      const nueva: number = Number(nuevaCantidad);


      if ((devuelta + nueva) > solicita) {
        this.loading = false;
        this.alertSwalAlert.title = 'Alerta';
        this.alertSwalAlert.text = 'La cantidad que esta intentando devolver es mayor al saldo pendiente.';
        this.alertSwalAlert.show();
        return;
      }
    }
    const tipoMov = this.formDatosPrestamo.get('tipoMov').value == 'Entrada';

    let detalle: PrestamoMov = {
      id: detallePrestamo.id,
      uuid: new Date().getTime(),
      codigo: this.buscarCodigoProducto(detallePrestamo.id),
      mein_id: detallePrestamo.mein_id,
      fecha_vto: detallePrestamo.fecha_vto,
      lote: detallePrestamo.lote,
      codigo_cum: detallePrestamo.codigo_cum,
      registro_invima: detallePrestamo.registro_invima,
      movimiento: tipoMov ? 'Salida' : 'Entrada',
      cantidad: Number(nuevaCantidad),
      fecha: this.formatearFechaHora12(new Date().toString()),
      responsable: this.usuario,
      create: true
    }

    Swal.fire({
      title: '¿Desea agregar un movimiento?',
      text: 'Codigo Producto: ' + detallePrestamo.codigo + '\n Cantidad: ' + nuevaCantidad,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.value) {
        const actualizar: boolean = this.actualizarCantidadDevuelta(detallePrestamo, nuevaCantidad);
        if (actualizar) this.detallesDevoluciones.unshift(detalle);

      }
    });
  }

  buscarCodigoProducto(mein_id: number): string {
    const index = this.detallesPrestamos.findIndex(item => item.id === mein_id);
    if (index !== -1) {
      return this.detallesPrestamos[index].codigo;
    }
  }

  actualizarCantidadDevuelta(detallePrestamo: PrestamoDet, nuevaCantidad: number): boolean {
    const index = this.detallesPrestamos.findIndex(item => item.codigo === detallePrestamo.codigo);

    if (index !== -1) {

      this.detallesPrestamos[index].cant_devolver = 0;
      this.detallesPrestamos[index].update = true;
      return true;
    }

    return false;
  }

  actualizardevolucion(devolucion: number, columna: string, data: string) {

    const index = this.detallesDevoluciones.findIndex(item => item.uuid === devolucion);
    if (index !== -1) {
      if (columna == 'fecha') {
        const esValida = this.isFechaVencimientoValida(data);
        this.detallesDevoluciones[index].fecha_vto = esValida ? this.formatearFechaHora(data) : null;
      }

    }

  }

  validarCamposDet(item: PrestamoDet): boolean {
    return (item.update === undefined) && (item.lote !== '' || item.fecha_vto !== null) || (item.lote === '' || item.fecha_vto === null);
  }

  validarCamposMov(item: PrestamoMov): boolean {
    return (
      item.lote !== null &&
      item.fecha_vto !== null &&
      item.lote !== '' &&
      item.fecha_vto !== ''
    );
  }

  alertaError() {
    this.loading = false;
    this.alertSwalAlert.title = 'Alerta';
    this.alertSwalAlert.text = 'Lamentablemente, ha ocurrido un error al intentar guardar';
    this.alertSwalAlert.show();
    this.cargandoInformacion = false;
  }

  get validarBotonForzarCierre() {
    let cantidadPrestamos = this.detallesPrestamos.filter(item => item.create);
    let cantidadDevoluciones = this.detallesDevoluciones.filter(item => item.create);
    return cantidadPrestamos.length > 0 ||
      cantidadDevoluciones.length > 0 ||
      this.detallesPrestamos.length == 0 ||
      this.cargandoInformacion ||
      this.estadoPrestamo > 1
  }

  get validarBotonGuardar() {
    let cantidadPrestamos = this.detallesPrestamos.filter(item => item.create);
    let cantidadDevoluciones = this.detallesDevoluciones.filter(item => item.create);

    return !(cantidadPrestamos.length >= 1 ||
      cantidadDevoluciones.length >= 1) ||
      this.detallesPrestamos.length == 0 ||
      this.cargandoInformacion ||
      this.estadoPrestamo > 1
  }

  grupoCantidadProductos() {
    let grupoCantidad = {};

    this.detallesDevoluciones.forEach((item) => {
      const id = item.codigo;
      if (!grupoCantidad[id]) {
        grupoCantidad[id] = { ...item };
      } else {
        grupoCantidad[id].cantidad += Number(item.cantidad);
      }
    });

    return grupoCantidad;
  }

  async guardarPrestamo() {
    const Swal = require('sweetalert2');
    let detPre: Array<PrestamoDet> = [];
    let detDev: Array<PrestamoMov> = [];
    let confirmarGuardar: boolean;
    let error: boolean = false;

    const alertaDatosObligatorios = () => {
      this.loading = false;
      this.alertSwalAlert.title = 'Alerta';
      this.alertSwalAlert.text = 'Verifique el ingreso de los datos obligatorios.';
      this.alertSwalAlert.show();
      error = true;
    }


    detPre = this.detallesPrestamos.filter(item => {

      console.log(Boolean(item.create), Boolean(item.update), item.lote, item.fecha_vto);
      if (!this.tipoMovimientoSelecionado) {

        if ((Boolean(item.create) && Boolean(item.update)) && (item.lote == '' || item.fecha_vto == null)) {
          alertaDatosObligatorios();
          return;
        }
      }
      if ((item.create || item.update) && item.cant_solicitada == 0) {
        alertaDatosObligatorios();
        return;
      }
      return item;
    });

    detDev = this.detallesDevoluciones.filter(item => {
      if (item.create && this.estadoPrestamo == 1) {
        if (!this.validarCamposMov(item)) {
          alertaDatosObligatorios();
          return;
        }

        return item;
      }

    });

    if (error) {
      return;
    }

    this.alertSwalConfirmar.title = this.estadoPrestamo == undefined || this.estadoPrestamo == 0 ?
      '¿Confirma crear nuevo préstamo?' : '¿Confirma actualizar el Préstamo?';

    const confirmar = await this.alertSwalConfirmar.show();
    if (confirmar.value) {



      let detPrestamo: BuscarPrestamo = {
        fecha_prestamo: this.formatearFechaHora(this.formDatosPrestamo.get('fechaPrestamo').value),
        id: this.formDatosPrestamo.get('numeroPrestamo').value,
        tipoMov: this.formDatosPrestamo.get('tipoMov').value,
        idOrigen: this.formDatosPrestamo.get('origen').value,
        idDestino: this.formDatosPrestamo.get('destino').value,
        observaciones: this.formDatosPrestamo.get('observaciones').value,
        hdgcodigo: Number(sessionStorage.getItem('hdgcodigo').toString()),
        esacodigo: Number(sessionStorage.getItem('esacodigo').toString()),
        cmecodigo: Number(sessionStorage.getItem('cmecodigo').toString()),
        responsable: this.usuario
      };


      let prestamo: RespuestaPrestamo = {
        Servidor: this.servidor,
        prestamo: [detPrestamo],
        prestamo_det: detPre,
        prestamo_mov: detDev
      }

      detPre.filter(item => {
        let productos = this.grupoCantidadProductos()[item.codigo];

        if (productos === undefined) {
          productos = 0;
        }

        const devuelta: number = productos['cantidad'];
        item.cant_devuelta = productos['cantidad'];
      });

      this.cargandoInformacion = true;
      this.prestamoService.crearPrestamo(prestamo)
        .toPromise()
        .then((response) => {
          if (response != null) {
            this.loading = false;
            this.alertSwal.title = this.estadoPrestamo == undefined || this.estadoPrestamo == 0
              ? 'El préstamo se ha realizado exitosamente.' : 'Los movimientos de devolución se han registrado exitosamente';
            this.alertSwal.text = 'Préstamo N° ' + response['id'];
            this.alertSwal.show();
            this.limpiar();
            this.cargandoInformacion = false;
          }
        }).catch((error) => {
          this.loading = false;
          this.alertSwalError.text = 'Lamentablemente, ha ocurrido un error al intentar crear préstamo.';
          this.alertSwalError.show();
          this.cargandoInformacion = false;
        });
    }
  }

  get verficarBotonGuardar() {
    return this.formDatosPrestamo.invalid;
  }

  get tipoMovimientoSelecionado() {

    return this.formDatosPrestamo.get('tipoMov').value == 'Salida';
  }

  onBuscarMedicamento() {

    if (this.formDatosPrestamo.invalid) {
      this.loading = false;
      this.alertSwalError.title = 'Error';
      this.alertSwalError.text = 'Por favor, asegúrate de completar todos los campos del préstamo antes de proceder a agregar productos.';
      this.alertSwalError.show();
      return;
    }

    this.formDetallesPrestamos.disable();
    const codigo = this.formDetallesPrestamos.get("codigoMedicamento").value;

    const modalBuscar = () => {
      this._BSModalRef = this._BsModalService.show(ModalBuscarFarmacosComponent, this.setModal());
      this._BSModalRef.content.onClose.subscribe(async (result: Medicamento) => {
        await this.mostrarMedicamento(result);
      });
      this.formDetallesPrestamos.enable();
    }

    if (codigo == null || codigo == undefined) {
      modalBuscar();
      return;
    }

    const buscarMedicamento: BuscaProdPorDescripcion = {
      hdgcodigo: Number(sessionStorage.getItem('hdgcodigo').toString()),
      idbodega: this.bodegaSelecionadaById(),
      tipodeproducto: this.formDetallesPrestamos.get('tipoProducto').value,
      codigo: this.formDetallesPrestamos.get("codigoMedicamento").value
    }

    this.estadoBotonBuscarMedicamento = true;
    this.prestamoService.consularBuscaProdPorDescripcion(buscarMedicamento)
      .toPromise()
      .then(async (response) => {

        if (response != null) {
          if (response.length == 1) {
            await this.mostrarMedicamento(response[0]);

          } else {
            modalBuscar();
          }
        }
        this.estadoBotonBuscarMedicamento = false;
        this.formDetallesPrestamos.enable();
      })
      .catch((error) => {
        this.loading = false;
        this.alertSwalAlert.title = "Alerta";
        this.alertSwalAlert.text = "Error al consultar producto por descripción.";
        this.estadoBotonBuscarMedicamento = false;
      });


    this.disbleFromDataPrestamo();
  }

  async mostrarMedicamento(result: Medicamento) {
    this.formDetallesPrestamos.get('codigoMedicamento').reset();
    this.formDetallesPrestamos.get('descripcionMedicamento').reset();
    if (result != null) {
      if (result.saldo == 0) {
        this.loading = false;
        this.alertSwalAlert.title = 'Alerta';
        this.alertSwalAlert.text = 'En este momento, el medicamento no está disponible en nuestro inventario.';
        this.alertSwalAlert.show();
        return;
      }

      if (result && !this.detallesPrestamos.find(med => med.codigo === result.codigo)) {
        let bodega = this.bodegaSelecionadaById();

        const responseProducto = await this.onBuscarLoteFechVto(bodega, result.codigo);

        let fechaVencimiento: string = '';
        let lote: string = '';
        if (responseProducto.length > 0 && this.tipoMovimientoSelecionado) {

          fechaVencimiento = this.convertirFormatoFecha(responseProducto[0].fechaVencimiento);
          lote = responseProducto[0].lote;
        }

        if (this.detallesPrestamos.find(med => med.codigo === result.codigo && med.lote === lote)) {
          return;
        }

        let detalle: PrestamoDet = {
          codigo: result.codigo,
          codmei: result.codigo,
          descripcion: result.descripcion,
          cant_solicitada: 0,
          cant_devuelta: 0,
          cant_devolver: 0,
          fecha_vto: fechaVencimiento,
          codigo_cum: result.mein_codigo_cum,
          registro_invima: result.mein_registro_invima,
          mein_id: result.mein,
          lote: lote,
          saldo: result.saldo,
          create: true
        }
        this.detallesPrestamos.unshift(detalle);

      }
    }
  }

  onForzarCierre() {
    let dtModal: any = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered',
      initialState: {
        id: this.formDatosPrestamo.get('numeroPrestamo').value
      }
    };

    this._BSModalRef = this._BsModalService.show(ModalForzarCierreComponent, dtModal);
    this._BSModalRef.content.onClose.subscribe(async (result: boolean) => {
      if (result) {
        this.limpiar();
      }
    });

  }

  onBuscarLoteFechVto(bodega: number, codigo: string) {

    const indiceBodega = this.listBodegas.indexOf(this.listBodegas.find(data => data.id === bodega));

    if (indiceBodega != -1) {
      const buscarMedicamento: BuscaProdPorDescripcion = {
        idbodega: bodega,
        codigo: codigo,
        hdgcodigo: this.listBodegas[indiceBodega].hdgcodigo,
        cmecodigo: this.listBodegas[indiceBodega].cmecodigo,
        esacodigo: this.listBodegas[indiceBodega].esacodigo,
      }

      return this.onConsultarProductoLotes(buscarMedicamento);
    }

    return [];
  }

  onBuscarDetallePRestamo(buscar: BuscarPrestamo) {
    return this.prestamoService.consularBuscarPrestamos(buscar)
      .toPromise()
      .then((response) => response)
      .catch(() => {
        this.loading = false;
        this.alertSwalError.text = 'Lamentablemente, ha ocurrido un error al intentar buscar detalle préstamo.';
        this.alertSwalError.show();
        this.cargandoInformacion = false;
      });
  }

  convertirFormatoFecha(fecha: string): string {

    if (fecha == '' || fecha == undefined) {
      return null;
    }
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObj.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  async onConsultarProductoLotes(buscarMedicamento: BuscaProdPorDescripcion): Promise<PrestamoDet[]> {

    try {
      const response: Medicamento[] = await this.prestamoService.consultarProductoLotes(buscarMedicamento).toPromise();

      if (response != null) {
        if (response.length === 0) {
          return [];
        } else {
          return response;
        }
      }
    } catch (error) {
      this.loading = false;
      this.alertSwalError.text = 'Lamentablemente, ha ocurrido un error al intentar consultar buscar producto por descripción.';
      this.alertSwalError.show();
      this.cargandoInformacion = false;

    }

  }

  setModalPrestamo() {
    let dtModal: any = {};

    let tipoMov = this.formDatosPrestamo.get('tipoMov').value;
    var origen = this.listBodegas;
    var destino = this.listExternas;

    if (tipoMov == 'Entrada') {
      origen = this.listExternas;
      destino = this.listBodegas;
    }

    const buscarPrestamo: BuscarPrestamo = {
      tipoMov,
      origen: origen,
      destino: destino,
      id: this.formDatosPrestamo.get('numeroPrestamo').value,
      idOrigen: this.formDatosPrestamo.get('origen').value,
      idDestino: this.formDatosPrestamo.get('destino').value
    }

    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        buscarPrestamo
      }
    };
    return dtModal;
  }

  disbleFromDataPrestamo() {
    this.formDatosPrestamo.get('fechaPrestamo').disable();
    this.formDatosPrestamo.get('numeroPrestamo').disable();
    this.formDatosPrestamo.get('origen').disable();
    this.formDatosPrestamo.get('destino').disable();
    this.formDatosPrestamo.get('destino').disable();
    this.formDatosPrestamo.get('tipoMov').disable();
    this.formDatosPrestamo.get('observaciones').disable();

  }

  onBuscarPrestamo() {
    this.formDatosPrestamo.disable();
    const numeroPrestamo: number = Number(this.formDatosPrestamo.get('numeroPrestamo').value);

    const modalBuscar = () => {
      this.formDatosPrestamo.enable();
      this._BSModalRef = this._BsModalService.show(ModalBuscarPrestamosComponent, this.setModalPrestamo());
      this._BSModalRef.content.onClose.subscribe(async (result: BuscarPrestamo) => {
        await this.mostrarPrestamo(result);
      });
    }

    if (numeroPrestamo == 0) {
      modalBuscar();
      return;
    }

    const buscarPrestamo: BuscarPrestamo = {
      id: numeroPrestamo,
    }

    this.prestamoService.consularBuscarPrestamos(buscarPrestamo)
      .toPromise()
      .then((response: RespuestaPrestamo) => {

        if (response != null) {
          if (response.prestamo.length > 0) {
            this.mostrarPrestamo(response.prestamo[0]);

          } else {
            modalBuscar();
          }
        }
      })
      .catch((error) => {
        this.loading = false;
        this.alertSwalAlert.title = "Alerta";
        this.alertSwalAlert.text = "Error al buscar préstamo ingresado en el sistema.";
      });
  }

  async mostrarPrestamo(result: BuscarPrestamo) {
    if (result != null) {
      this.detallesPrestamos = [];
      this.detallesDevoluciones = [];
      this.formDetallesPrestamos.enable();
      this.cargandoInformacion = true;
      let tipoMov: string = 'Salida';

      if (result.tipoMov == 'E') {
        tipoMov = 'Entrada'
      }

      this.formDatosPrestamo.get('fechaPrestamo').setValue(result.fecha_prestamo);
      this.formDatosPrestamo.get('numeroPrestamo').setValue(result.id);
      this.formDatosPrestamo.get('origen').setValue(result.tipoMov == 'S' ? result.idOrigen : result.idDestino);
      this.formDatosPrestamo.get('destino').setValue(result.tipoMov == 'S' ? result.idDestino : result.idOrigen);
      this.formDatosPrestamo.get('tipoMov').setValue(tipoMov);
      this.formDatosPrestamo.get('observaciones').setValue(result.observaciones);
      this.estadoPrestamo = result.estadoID;
      this.estadoPrestamoDes = result.estadoDes;

      this.filtroMovimiento();

      this.disbleFromDataPrestamo();

      if (result.estadoID > 1) {
        this.formDetallesPrestamos.disable();
      }

      let buscar: BuscarPrestamo = {
        id: result.id
      }

      let detalles = await this.onBuscarDetallePRestamo(buscar).then((response) => response)

      if (detalles['prestamo_det'].length == 0) this.cargandoInformacion = false;

      for (let index = 0; index < detalles['prestamo_det'].length; index++) {

        const element: PrestamoDet = detalles['prestamo_det'][index];

        const responseProducto = await this.onBuscarLoteFechVto(result.idOrigen, element.codmei.trim());

        let fechaVencimiento: string = this.convertirFormatoFecha(element.fecha_vto);
        let lote: string = element.lote;
        if (responseProducto.length > 0 && result.tipoMov == 'S') {
          fechaVencimiento = this.convertirFormatoFecha(responseProducto[0].fechaVencimiento);
          lote = responseProducto[0].lote;
        }

        let detalle: PrestamoDet = {
          id: element.id,
          mein_id: element.mein_id,
          codigo: element.codmei,
          descripcion: element.descripcion,
          cant_solicitada: element.cant_solicitada,
          cant_devuelta: element.cant_devuelta,
          cant_devolver: 0,
          codigo_cum: element.codigo_cum,
          registro_invima: element.registro_invima,
          fecha_vto: fechaVencimiento,
          lote: lote,
          saldo: 0
        }

        this.detallesPrestamos.unshift(detalle);
        this.cargandoInformacion = false;
      }

      for (let index = 0; index < detalles['prestamo_mov'].length; index++) {

        const element: PrestamoMov = detalles['prestamo_mov'][index];
        const tipoMov = this.formDatosPrestamo.get('tipoMov').value == 'Salida';
        let detalle: PrestamoMov = {
          id: element.id,
          mein_id: element.mein_id,
          codigo: this.buscarCodigoProducto(element.fpre_id),
          fecha: this.formatearFechaHora12(element.fecha),
          cantidad: Number(element.cantidad),
          responsable: element.responsable,
          movimiento: tipoMov ? 'Entrada' : 'Salida',
          codigo_cum: element.codigo_cum,
          registro_invima: element.registro_invima,
          lote: element.lote,
          fecha_vto: this.convertirFormatoFecha(element.fecha_vto),
        }

        this.detallesDevoluciones.unshift(detalle);
        this.cargandoInformacion = false;
      }
    }
  }

  formatearFechaHora12(fecha: string) {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObj.getFullYear();
    const hora = Number(fechaObj.getHours().toString().padStart(2, '0'));
    const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
    const ampm = hora >= 12 ? 'PM' : 'AM';
    const hora12 = hora > 12 ? hora - 12 : hora;
    return `${dia}/${mes}/${anio} ${hora12}:${minutos} ${ampm}`;
  }

  formatearFechaHora(fecha: string) {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObj.getFullYear();
    const hora = Number(fechaObj.getHours().toString().padStart(2, '0'));
    const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
  }
  get minDate(): string {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(new Date().getMonth() - 1);
    return oneMonthAgo.toISOString().substring(0, 10);
  }

  get maxDate(): string {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  }

  imprimir() {
    let detalle: BuscarPrestamo = {
      hdgcodigo: Number(sessionStorage.getItem('hdgcodigo').toString()),
      esacodigo: Number(sessionStorage.getItem('esacodigo').toString()),
      cmecodigo: Number(sessionStorage.getItem('cmecodigo').toString()),
      prestamo: this.formDatosPrestamo.get('numeroPrestamo').value,
      usuario: this.usuario,
      servidor: this.servidor,
    };

    this.cargandoReporte = true;

    this.prestamoService.rptImprimePrestamo(detalle).toPromise()
      .then((response) => {
        if (response != null) {
          window.open(response.url, '', '');
        }
        this.cargandoReporte = false;
      })
      .catch(() => {
        this.cargandoReporte = false;
        this.loading = false;
        this.alertSwalError.title = 'Error al Imprimir Préstamo';
        this.alertSwalError.show();
      });

  }

  reset() {
    const Swal = require('sweetalert2');

    Swal.fire({
      title: '¿Está seguro de limpiar los datos ingresados?',
      text: 'Confirma limpieza',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.value) {
        this.limpiar();
      }
    });


  }

  limpiar() {
    this.formDatosPrestamo.reset();
    this.formDatosPrestamo.enable();
    this.formDatosPrestamo.get('tipoMov').setValue('Salida');

    this.formDetallesPrestamos.reset();
    this.formDetallesPrestamos.enable();
    this.formDetallesPrestamos.get('tipoProducto').setValue('M');

    this.detallesPrestamos = [];
    this.detallesDevoluciones = [];
    this.estadoPrestamo = 0;
    this.cargandoInformacion = false;
    this.estadoPrestamoDes = null;
    this.listOrigen = this.listBodegas;
    this.listDestino = this.listExternas;

    this.formDatosPrestamo.controls['fechaPrestamo'].setValue(new Date());
  }

  salir() {
    this.route.paramMap.subscribe(param => {
      this.router.navigate(['home']);
    })
  }
}

