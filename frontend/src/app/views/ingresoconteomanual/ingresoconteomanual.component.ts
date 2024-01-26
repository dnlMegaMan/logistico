import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BodegasService } from '../../servicios/bodegas.service';
import { IngresoConteoManual } from '../../models/entity/IngresoConteoManual';
import { InventarioDetalle } from '../../models/entity/InventarioDetalle';
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';

import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { InventariosService } from 'src/app/servicios/inventarios.service';
import * as XLSX from 'xlsx';
import { ClinfarParamBodResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamBodResponse';
import { ClinfarParamProResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamProResponse';
import { InflistaconteoinventarioService } from 'src/app/servicios/inflistaconteoinventario.service';
import { ModalAutorizaConteoInvenarioComponent } from './modal-autoriza-conteo-inventario/modal-autoriza-conteo-inventario';
import { de, tr } from 'date-fns/locale';
import { InformesService } from 'src/app/servicios/informes.service';
import { element } from 'protractor';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { TranslateService } from '@ngx-translate/core';
import { Permisosusuario } from 'src/app/permisos/permisosusuario';

@Component({
  selector: 'app-ingresoconteomanual',
  templateUrl: './ingresoconteomanual.component.html',
  styleUrls: ['./ingresoconteomanual.component.css'],
  providers: [InventariosService, InflistaconteoinventarioService, InformesService],
})
export class IngresoconteomanualComponent implements OnInit {

  constructor(
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    public _BodegasService: BodegasService,
    public _BsModalService: BsModalService,
    private _inventarioService: InventariosService,
    private _inflistaconteoinventarioService: InflistaconteoinventarioService,
    private _imprimesolicitudService: InformesService,
  ) {

    this.FormIngresoConteoManual = this.formBuilder.group({
      tiporegistro: [{ value: null, disabled: false }, Validators.required],
      boddestino: [{ value: null, disabled: false }, Validators.required],
      periodo: [{ value: null, disabled: false }, Validators.required],
      grupovalor: [{ value: null, disabled: false }, Validators.required],

    });

    this.FormBusquedaManual = this.formBuilder.group({
      codigo: [{ value: null, disabled: false }, Validators.required],
    });

  }

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormIngresoConteoManual: FormGroup;
  public FormBusquedaManual: FormGroup;
  public periodos: IngresoConteoManual[] = [];
  public detallesinventarios: InventarioDetalle[] = [];

  public detallesinventariosActualizar: InventarioDetalle[] = [];
  public detallesinventariosPaginacion: InventarioDetalle[] = [];
  public grabaconteomanual: InventarioDetalle[] = [];
  public loading = false;
  public usuario = environment.privilegios.usuario;
  public idUsuario: number;
  public servidor = environment.URLServiciosRest.ambiente;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public isCambios = false;
  public isGrabar = false;
  public _BSModalRef: BsModalRef;
  editField: any;
  retornoproducto: any;
  stockboddestino: any;
  public bodegasSolicitantes: Array<ClinfarParamBodResponse> = [];
  public listaTipoProductos: Array<ClinfarParamProResponse> = [];
  public listaGrupoArticulos: Array<ClinfarParamProResponse> = [];
  public paramCantidadRegistrada: number = 0;
  public selecionarfiltroCums: boolean = false;
  protected readonly JSON = JSON;

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.idUsuario = Number(sessionStorage.getItem('id_usuario').toString());
    this.loading = true;
    this.filtros();
  }

  TranslateUtil(value: string) {
    this.translate.get(value).subscribe((text: string) => { value = text; });
    return value;
  }

  get hasFormIngresoConteoManual() {
    return this.FormIngresoConteoManual.value.periodo != null &&
      this.FormIngresoConteoManual.value.boddestino != null &&
      this.FormIngresoConteoManual.value.tiporegistro != null;
  }

  filtros() {
    this.loading = true;
    this._inflistaconteoinventarioService.filtro().subscribe(
      response => {
        if (response != null) {
          this.loading = false;
          this.bodegasSolicitantes = response.listaBodegas;
          this.listaTipoProductos = response.listaTipoProductos;
          this.listaGrupoArticulos = response.listaGrupoArticulos;
          this.paramCantidadRegistrada = response.cantidadRegistrada;
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.bodegas.destino');
        this.alertSwalError.show();
      }
    );
  }

  convertirFormatoFecha(fechaString: string): string {
    const fechaObj = new Date(fechaString);
    return `${fechaObj.getDate().toString().padStart(2, '0')}/${(fechaObj.getMonth() + 1).toString().padStart(2, '0')}/${fechaObj.getFullYear()}`;
  }

  BuscaPeriodoInventario(codigobod: number) {

    this.loading = true;
    this.FormIngresoConteoManual.get('periodo').setValue(null);
    this.periodos = [];
    this._inventarioService.BuscaPeriodo(this.hdgcodigo, this.esacodigo, this.cmecodigo, codigobod,
      this.usuario, this.servidor).subscribe(
        response => {
          this.loading = false;
          if (response != null && response.length > 0) {

            response.forEach(element => {
              let temporal = new IngresoConteoManual();
              temporal.fechainventario = this.convertirFormatoFecha(element.fechainventario);
              this.periodos.push(temporal);
            });

            this.FormIngresoConteoManual.get('periodo').setValue(response[0].fechainventario);
          }
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.periodo');
          this.alertSwalError.show();
        }
      );

  }

  Limpiar() {
    this.FormIngresoConteoManual.reset();
    this.detallesinventarios = [];
    this.detallesinventariosActualizar = [];
    this.detallesinventariosPaginacion = [];
    this.grabaconteomanual = [];
    this.periodos = [];
  }

  async BusquedaDeInventarios(verificar: boolean = false) {
    this.loading = true;
    var cargaDatos = true;
    this.detallesinventarios = [];
    this.detallesinventariosActualizar = [];
    this.detallesinventariosPaginacion = [];
    let pagina = 0;
    var cargardetallesinventarios: InventarioDetalle[] = [];

    while (cargaDatos) {

      pagina += 1;
      await this._inventarioService.BuscaDetalleInventario(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.FormIngresoConteoManual.value.periodo,
        this.FormIngresoConteoManual.value.boddestino,
        this.FormIngresoConteoManual.value.tiporegistro,
        this.usuario,
        this.servidor,
        this.FormIngresoConteoManual.value.grupovalor,
        pagina
      )
        .toPromise().then((response: InventarioDetalle[]) => {
          if (response != null && response.length > 0) {
            cargardetallesinventarios.push(...response);

          } else {
            cargaDatos = false;
            // this.alertSwalAlert.title = this.TranslateUtil('key.ingreso.conteo.manual');
            // this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existen.articulos.periodo');
            // this.alertSwalAlert.show();

          }
        }).catch(error => {

          this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.inventario');
          this.alertSwalError.show();
          cargaDatos = false;
        });

    }

    if (verificar) {

      var existeUsuarioCierre = cargardetallesinventarios.filter(
        item => item.useridcierre1 == this.idUsuario ||
          item.useridcierre2 == this.idUsuario ||
          item.useridcierre3 == this.idUsuario
      );

      if (existeUsuarioCierre.length > 0) {
        this.alertSwalAlert.title = this.TranslateUtil('key.ingreso.conteo.manual');
        this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.realizado.conteo.manual');
        this.alertSwalAlert.show();
        this.loading = false;
        return;
      }

    }

    this.detallesinventarios.push(...cargardetallesinventarios);
    this.detallesinventariosActualizar.push(...cargardetallesinventarios);
    this.detallesinventariosPaginacion.push(...cargardetallesinventarios.slice(0, 20));
    this.loading = false;

  }

  editarCantidadConteoManual(detalle: InventarioDetalle, conteo: Number, nuevaCantidad: number) {
    const index = this.detallesinventarios.findIndex(item => item.iddetalleinven === detalle.iddetalleinven);

    if (index !== -1) {
      if (conteo == 1) {

        this.detallesinventarios[index].conteomanual1 = nuevaCantidad;
        this.detallesinventarios[index].update = true;

      } else if (conteo == 2) {
        this.detallesinventarios[index].conteomanual2 = nuevaCantidad;
        this.detallesinventarios[index].update = true;
      } else if (conteo == 3) {
        this.detallesinventarios[index].conteomanual3 = nuevaCantidad;
        this.detallesinventarios[index].update = true;
      }
    }

  }

  get verificacionConteos() {
    var response: boolean = false;
    var conteo1 = this.detallesinventarios.filter(item => item.conteomanual1 > 0);
    var conteo2 = this.detallesinventarios.filter(item => item.conteomanual2 > 0);
    var conteo3 = this.detallesinventarios.filter(item => item.conteomanual3 > 0);
    var update = this.detallesinventarios.filter(item => item.update == true);
    var detalle: InventarioDetalle = this.detallesinventarios[0];


    if (this.detallesinventarios.length > 0) {

      switch (this.detallesinventarios[0].habilitarconteo) {
        case 1:
          if (conteo1.length > 0 && update.length > 0) {
            response = true;
          }
          break;
        case 2:
          if (conteo2.length > 0 && update.length > 0) {
            response = true;
          }
          break;
        case 3:

          if (conteo3.length > 0 && update.length > 0) {
            response = true;
          }
          break;
        default:
          break;
      }
    }

    return response;
  }

  get verifiCargagaExcel() {
    var response: boolean = false;
    var conteo1 = this.detallesinventarios.filter(item => item.conteomanual1 > 0);
    var conteo2 = this.detallesinventarios.filter(item => item.conteomanual2 > 0);
    var conteo3 = this.detallesinventarios.filter(item => item.conteomanual3 > 0);
    var update = this.detallesinventarios.filter(item => item.update == true);
    var detalle: InventarioDetalle = this.detallesinventarios[0];


    if (this.detallesinventarios.length > 0) {

      switch (detalle.habilitarconteo) {
        case 1:
          if (conteo1.length > 0 || detalle.actualizacionconteo1 != "") {
            response = true;
          }
          break;
        case 2:
          if (conteo2.length > 0 || detalle.actualizacionconteo2 != "") {
            response = true;
          }
          break;
        case 3:
          if (conteo3.length > 0 || detalle.actualizacionconteo3 != "") {
            response = true;
          }
          break;
        default:
          response = true;
          break;
      }
    } else {
      response = true;
    }

    return response;
  }

  CambioEstadoFiltoCums(event: any) {

    this.selecionarfiltroCums = false;

    if (event.target.checked) {
      this.selecionarfiltroCums = true;
    }

  }

  resetUpdate = () => {
    this.detallesinventarios.forEach(element => {
      element.update = false;
    });
  }

  verificacionConteosMayorStock() {
    var response: boolean = false;
    var conteoActivo: number = this.detallesinventarios[0].habilitarconteo;
    this.detallesinventarios.forEach(element => {
      if (element.update == true) {
        switch (conteoActivo) {
          case 1:
            if ((Number(element.conteomanual1) - Number(element.stockinvent)) > Number(this.paramCantidadRegistrada)) {
              response = true;
            }
            break;
          case 2:
            if ((Number(element.conteomanual2) - Number(element.stockinvent)) > Number(this.paramCantidadRegistrada)) {
              response = true;
            }
            break;
          case 3:
            if ((Number(element.conteomanual3) - Number(element.stockinvent)) > Number(this.paramCantidadRegistrada)) {
              response = true;
            }
            break;
        }
      }
    });

    return response;
  }

  addArticulosGrilla(in_bodsercodigo: number, in_boddescodigo: number) {

    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((RetornoProductos: any) => {
      if (RetornoProductos === undefined) { } else {
        this.retornoproducto = RetornoProductos;
        this.BuscaStockProductoDestino(RetornoProductos.mein, this.FormIngresoConteoManual.value.boddestino);
      }
    });
  }

  setModalBusquedaProductos() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: 'Búsqueda de Productos', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
      }
    };
    return dtModal;
  }

  BuscaStockProductoDestino(mein: number, bodegadestino: number) {
    this.loading = true;
    this._inventarioService.BuscaStockProd(mein, bodegadestino, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.loading = false;
          if (response.length == 0) {

            this.alertSwalAlert.title = this.TranslateUtil('key.ingreso.conteo.manual');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.stock.bodega.producto.buscado');
            this.alertSwalAlert.show();
            return;
          }
          this.stockboddestino = response[0].stockactual;
          const DetalleInventario = new InventarioDetalle();
          DetalleInventario.codigomein = this.retornoproducto.codigo;
          DetalleInventario.productodesc = this.retornoproducto.descripcion;
          DetalleInventario.valorcosto = 0;
          DetalleInventario.stockinvent = this.stockboddestino;
          DetalleInventario.idmeinid = this.retornoproducto.mein;
          DetalleInventario.conteomanual1 = 0;
          DetalleInventario.iddetalleinven = this.retornoproducto.iddetalleinven;
          DetalleInventario.idinventario = this.detallesinventarios[0].idinventario;
          DetalleInventario.estadoajuste = '';
          DetalleInventario.fechacierre = '';
          DetalleInventario.ajusteinvent = 0;
          DetalleInventario.iddetalleinven = 0;

          this.detallesinventarios.push(DetalleInventario);
          this.detallesinventariosPaginacion = this.detallesinventariosActualizar.slice(0, 20);
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.stock.producto');
        this.alertSwalError.show();
      }
    );
  }

  ConfirmaCerrarConteoManual() {
    const Swal = require('sweetalert2');

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.cerrar.conteo.manual'),
      text: this.TranslateUtil('key.mensaje.confirmar.cierre.conteo.manual'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then((result) => {
      if (result.value) {
        this.CerrarConteoManual();
      }
    });
  }

  ConfirmaIngresoConteoManual() {
    const Swal = require('sweetalert2');

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.ingreso.conteo.manual'),
      text: this.TranslateUtil('key.mensaje.confirmar.ingreso.conteo.manual'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar'),
      cancelButtonText: this.TranslateUtil('key.mensaje.cancelar')
    }).then((result) => {
      if (result.value) {
        this.GrabaIngresoConteoManual();
      }
    });
  }

  GrabaIngresoConteoManual() {
    this.loading = true;
    var update = this.detallesinventarios.filter(item => item.update == true);
    if (!(update.length > 0)) {

      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.nuevo.conteo.manual');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.habido.cambios.grabar');
      this.alertSwalAlert.show();
      this.loading = false;
      return;
    }

    if (this.verificacionConteosMayorStock()) {

      let dtModal: any = {
        keyboard: true,
        backdrop: 'static',
        class: 'modal-dialog-centered',
        initialState: {
          id: this.detallesinventarios[0].idinventario,
        }
      };

      this._BSModalRef = this._BsModalService.show(ModalAutorizaConteoInvenarioComponent, dtModal);
      this._BSModalRef.content.onClose.subscribe((result: boolean) => {

        if (result) {
          this.GrabaConteoManual();
          this.resetUpdate();
        } else {
          this.loading = false;
        }
      });

      return;
    }

    this.GrabaConteoManual();
    this.resetUpdate();
  }

  GrabaConteoManual() {
    const data: InventarioDetalle[] = [];
    this.detallesinventarios.forEach(element => {
      const item = new InventarioDetalle();
      if (element.update == true) {
        item.hdgcodigo = this.hdgcodigo,
          item.esacodigo = this.esacodigo,
          item.cmecodigo = this.cmecodigo,
          item.ajusteinvent = element.ajusteinvent,
          item.campo = element.campo,
          item.codigomein = element.codigomein,
          item.conteomanual1 = Number(element.conteomanual1),
          item.conteomanual2 = Number(element.conteomanual2),
          item.conteomanual3 = Number(element.conteomanual3),
          item.estadoajuste = element.estadoajuste,
          item.fechacierre = element.fechacierre,
          item.iddetalleinven = element.iddetalleinven,
          item.idinventario = element.idinventario,
          item.idmeinid = element.idmeinid,
          item.productodesc = element.productodesc,
          item.stockinvent = element.stockinvent,
          item.valorcosto = element.valorcosto,
          item.servidor = element.servidor,
          item.usuario = this.usuario,
          item.tipomotivoajus = element.tipomotivoajus,
          item.codigocums = element.codigocums,
          item.lote = element.lote,
          item.fechavencimiento = element.fechavencimiento;
        data.push(item);
      }
    });

    this.loading = false
    this._inventarioService.GrabaConteoManual(data, this.servidor).subscribe(
      response => {
        this.loading = false;
        this.alertSwal.title = this.TranslateUtil('key.mensaje.datos.guardados.exitosamente');
        this.alertSwal.show();

      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.grabar.conteo.manual');
        this.alertSwalError.show();
      }
    );
  }

  CerrarConteoManual() {

    this.loading = true;
    var update = this.detallesinventarios.filter(item => item.update == true);

    if (Number(update.length) > 0) {

      this.alertSwalAlert.title = this.TranslateUtil('key.ingreso.conteo.manual');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.grabe.antes.cerrar.conteo');
      this.alertSwalAlert.show();
      this.loading = false;
      return;
    }

    this._inventarioService.ActualizaInventario(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.detallesinventarios[0].idinventario,
      this.detallesinventarios[0].ajusteinvent,
      this.idUsuario,
      this.usuario,
      this.servidor
    ).subscribe(
      response => {

        this.alertSwal.title = this.TranslateUtil('key.ingreso.conteo.manual');
        this.alertSwal.text = this.TranslateUtil('key.mensaje.cierre.conteo.manual.registrado');
        this.alertSwal.show();
        this.BusquedaDeInventarios();

      }, err => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.grabar.conteo.manual')
        this.alertSwalError.show();
      }
    );

  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detallesinventariosPaginacion = this.detallesinventariosActualizar.slice(startItem, endItem);
  }

  onFileChange(event: any): void {
    const archivo = event.target.files[0];
    const reader = new FileReader();
    this.loading = true;
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: true, header: [
          'codigo',
          'cantidad',
          'lote',
          'fechavto',
          'tipo'
        ]
      });

      if (this.verificarTipoProducto(jsonData)) {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.todos.valores.columna.ser.I.o.C');
        this.alertSwalError.show();
        return;
      }

      if (!this.verificarConteoManual(jsonData)) {


        jsonData.forEach(element => {

          if (element['tipo'] == 'I') {
            const index = this.detallesinventarios.findIndex(item => item.codigomein.trim() === element['codigo'].trim());

            if (index !== -1) {
              this.agregarCantidadSiCodigomeinExiste(element['codigo'], element['cantidad']);
            }

          } else if (element['tipo'] == 'C') {
            const index = this.detallesinventarios.findIndex(item => item.codigocums.trim() === element['codigo'].trim());
            if (index !== -1) {
              this.detallesinventarios[index].update = true;
              switch (this.detallesinventarios[index].habilitarconteo) {
                case 1:
                  this.detallesinventarios[index].conteomanual1 = Number(element['cantidad']);
                  break;
                case 2:
                  this.detallesinventarios[index].conteomanual2 = Number(element['cantidad']);
                  break;
                case 3:
                  this.detallesinventarios[index].conteomanual3 = Number(element['cantidad']);
                  break;
                default:
                  break;
              }
            }
          }

          let response = this.detallesinventarios
          this.detallesinventariosActualizar = JSON.parse(JSON.stringify(response));
          this.detallesinventariosPaginacion = JSON.parse(JSON.stringify(response)).slice(0, 20);
        });
      }

    };

    reader.readAsBinaryString(archivo);
    this.fileInput.nativeElement.value = "";
  }

  agregarCantidadSiCodigomeinExiste(codigomein: string, cantidad: number) {
    this.detallesinventarios.forEach((item, index) => {
      if (item.codigomein.trim() === codigomein.trim()) {
        this.detallesinventarios[index].update = true;
        switch (item.habilitarconteo) {
          case 1:
            this.detallesinventarios[index].conteomanual1 = Number(cantidad);
            break;
          case 2:
            this.detallesinventarios[index].conteomanual2 = Number(cantidad);
            break;
          case 3:
            this.detallesinventarios[index].conteomanual3 = Number(cantidad);
            break;
          default:
            break;
        }
      }
    });
  }

  verificarTipoProducto(jsonData: any) {
    var response: boolean = false
    jsonData.forEach(element => {
      const tipo = element['tipo'];
      if (tipo != 'I' && tipo != 'C') {
        response = true;
      }
    });
    return response;
  }

  verificarConteoManual(jsonData: any): boolean {
    var response: boolean = false
    var esNumeroEntero = (valor: any): boolean => {
      return Number.isInteger(valor);
    }

    jsonData.forEach(element => {

      const tipo = element['tipo'];
      const codigo = element['codigo'];
      const fechavto = element['fechavto'];
      const lote = element['lote'];
      var index: number;

      if (tipo == 'I') {
        index = this.detallesinventarios.findIndex(item =>
          item.codigomein.trim() === (codigo == undefined ? "" : codigo) &&
          (item.lote == undefined ? "" : item.lote.trim()) === (lote == undefined ? "" : lote) &&
          (item.fechavencimiento == undefined ? "" : item.fechavencimiento.trim()) === (fechavto == undefined ? "" : fechavto)
        );
      }

      if (tipo == 'C') {
        index = this.detallesinventarios.findIndex(item =>
          (item.codigocums == undefined ? "" : item.codigocums.trim()) === (codigo == undefined ? "" : codigo) &&
          (item.lote == undefined ? "" : item.lote.trim()) === (lote == undefined ? "" : lote) &&
          (item.fechavencimiento == undefined ? "" : item.fechavencimiento.trim()) === (fechavto == undefined ? "" : fechavto)
        );
      }

      if (index != -1) {
        if (!esNumeroEntero(element['cantidad'])) {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.todos.valores.columna.ser.numericos');
          this.alertSwalError.show();
          response = true;
        }

      } else {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.codigo.no.existe.bodega.invenario') + element['codigo'];
        this.alertSwalError.show();
        response = true;

      }
      this.loading = false;

    });

    return response;
  }

  get verificarConteoManualMayorStock(): boolean {
    var response: boolean = false;
    // var inventarios: InventarioDetalle[] = [];

    if (this.detallesinventarios.length > 0 || this.detallesinventarios[0].habilitarconteo < 3) {
      return true;
    }

    return response;
  }

  fondoAjuste(conteo: number, inventario: InventarioDetalle): boolean {
    var response: boolean = false;
    switch (conteo) {
      case 1:
        response = (Number(inventario.conteomanual1) - Number(inventario.stockinvent)) > Number(this.paramCantidadRegistrada);
        break;
      case 2:
        response = (Number(inventario.conteomanual2) - Number(inventario.stockinvent)) > Number(this.paramCantidadRegistrada);
        break;
      case 3:
        response = (Number(inventario.conteomanual3) - Number(inventario.stockinvent)) > Number(this.paramCantidadRegistrada);
      default:
        break;
    }
    return response;
  }

  verificarStock(detalleinv: InventarioDetalle) {
    return (Number(detalleinv.conteomanual1) + Number(detalleinv.conteomanual2)) >= Number(detalleinv.stockinvent);
  }

  verificarRealizacionConteo(): boolean {
    var response: boolean = false;

    var existeUsuarioCierre = this.detallesinventarios.filter(
      item => item.useridcierre1 == this.idUsuario ||
        item.useridcierre2 == this.idUsuario ||
        item.useridcierre3 == this.idUsuario
    );

    if (existeUsuarioCierre.length > 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.ingreso.conteo.manual');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.realizado.conteo.manual');
      this.alertSwalAlert.show();
      this.loading = false;
      return true;
    }

    return response;
  }

  crearNuevoConteo() {
    const Swal = require('sweetalert2');
    this.loading = true;

    var update = this.detallesinventarios.filter(item => item.update == true);
    if ((update.length > 0)) {
      this.alertSwalAlert.title = this.TranslateUtil('key.ingreso.conteo.manual');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.error.guardar.primero.nuevo.conteo');
      this.alertSwalAlert.show();
      this.loading = false;
      return;
    }

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.realizar.nuevo.conteo.manual'),
      text: this.TranslateUtil('key.mensaje.confirmar.nuevo.conteo.manual'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        var inventario: InventarioDetalle = this.detallesinventarios[0];

        if (this.verificarRealizacionConteo()) return;

        if (Number(inventario.habilitarconteo) <= 2 || inventario.actualizacionconteo3 == "") {
          this._inventarioService.CrearNuevoConteo(inventario.idinventario, 1, this.servidor).subscribe(
            response => {
              if (response != null) {

                this.alertSwal.title = this.TranslateUtil('key.ingreso.conteo.manual');
                this.alertSwal.text = this.TranslateUtil('key.mensaje.creado.nuevo.conteo');
                this.alertSwal.show();
                this.BusquedaDeInventarios();
              }
            },
            error => {
              this.loading = false;
              this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
              this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.grabar.conteo.manual');
              this.alertSwalError.show();
            }
          );
        }
      } else {
        this.loading = false;
      }

    });

  }

  Imprimir() {
    const Swal = require('sweetalert2');
    this.loading = true;

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.imprimir.reporte.diferencia.conteo.manual'),
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {

        this._imprimesolicitudService.RPTImprimeConteoManualInventario(this.servidor,
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.usuario,
          'xls',
          Number(this.FormIngresoConteoManual.value.grupovalor),
          this.FormIngresoConteoManual.value.periodo,
          this.FormIngresoConteoManual.value.tiporegistro,
          this.FormIngresoConteoManual.value.boddestino
        ).subscribe(
          response => {
            this.loading = false;

            if (response != null) {
              window.open(response.url, '', '');
            }
          },
          error => {
            this.loading = false;
            this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
            this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.imprimir.conteo.manual');
            this.alertSwalError.show();
            this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
            });
          }
        );
      } else {
        this.loading = false;
      }
    });

  }

  buscarPorCodigo() {

    var response;
    const codigo = this.FormBusquedaManual.value.codigo.trim();
    if (this.selecionarfiltroCums) {
      response = this.detallesinventarios.filter(el => {
        const codigocums = el.codigocums != null ? el.codigocums.trim() : null;
        return codigocums === codigo;
      });
    } else {
      response = this.detallesinventarios.filter(el => {
        const codigocums = el.codigomein != null ? el.codigomein.trim() : null;
        return codigocums === codigo;
      });
    }


    if (response.length > 0) {
      this.detallesinventariosActualizar = JSON.parse(JSON.stringify(response));
      this.detallesinventariosPaginacion = JSON.parse(JSON.stringify(response)).slice(0, 20);
    } else {
      this.alertSwalError.title = this.TranslateUtil('key.ingreso.conteo.manual');
      this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.encontro.codigo.ingresado');
      this.alertSwalError.show();
    }

  }

  limpiarBusqueda() {
    this.FormBusquedaManual.reset();

    this.detallesinventariosActualizar = JSON.parse(JSON.stringify(this.detallesinventarios));
    this.detallesinventariosPaginacion = JSON.parse(JSON.stringify(this.detallesinventarios)).slice(0, 20);
  }

  verificarHabilitarConteo(conteo: number): boolean {
    var response: boolean = true;
    var detalles: InventarioDetalle[] = this.detallesinventarios;

    if (detalles.length <= 0) {
      return false;
    }

    var detalle: InventarioDetalle = detalles[0];

    switch (conteo) {
      case 1:
        response = detalle.habilitarconteo == 1 && detalle.useridcierre1 == this.idUsuario ||
          detalle.habilitarconteo == 1 && detalle.actualizacionconteo1 == "";
        break;
      case 2:
        response = detalle.habilitarconteo == 2 && detalle.useridcierre2 == this.idUsuario ||
          detalle.habilitarconteo == 2 && detalle.actualizacionconteo2 == "";
        break;
      case 3:
        response = detalle.habilitarconteo == 3 && detalle.useridcierre3 == this.idUsuario ||
          detalle.habilitarconteo == 3 && detalle.actualizacionconteo3 == "";
        break;
      default:
        break;
    }

    return response;

  }

  get verificarCierreManual() {
    var response: boolean = false;
    this.detallesinventarios.forEach(element => {
      switch (element.habilitarconteo) {
        case 1:
          if (element.actualizacionconteo1 == null ||
            element.actualizacionconteo1 == "") {
            response = true
          }
          break;
        case 2:
          if ((element.actualizacionconteo2 == null ||
            element.actualizacionconteo2 == "")) {
            response = true
          }
          break;
        case 3:
          if ((element.actualizacionconteo3 == null ||
            element.actualizacionconteo3 == "")) {
            response = true
          }
          break;
        default:
          break;
      }

    });
    return response;
  }

  get verificarNuevoConteo() {
    var response: boolean = false;

    if (Number(this.detallesinventarios.length) > 0) {
      response = Number(this.detallesinventarios[0].habilitarconteo) > 0 && Number(this.detallesinventarios[0].habilitarconteo) < 3;
    }
    return response;
  }
}
