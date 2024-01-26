import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BodegasService } from '../../servicios/bodegas.service';
import { MotivoAjuste } from '../../models/entity/MotivoAjuste';
import { MotivoAjusteService } from '../../servicios/motivoajuste.service';
import { InventariosService } from '../../servicios/inventarios.service';
import { IngresoConteoManual } from '../../models/entity/IngresoConteoManual';
import { InventarioDetalle } from '../../models/entity/InventarioDetalle';
import { AjustesInventario, GrabaAjustesInventario } from '../../models/entity/GrabaAjuste';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { InflistaconteoinventarioService } from 'src/app/servicios/inflistaconteoinventario.service';
import { ClinfarParamProResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamProResponse';
import { ClinfarParamBodResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamBodResponse';
import { ModalNuevoMovitoComponent } from './modal-nuevo-motivo/modal-nuevo-motivo.component';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-generaajusteinventario',
  templateUrl: './generaajusteinventario.component.html',
  styleUrls: ['./generaajusteinventario.component.css'],
  providers: [InventariosService, InflistaconteoinventarioService]
})

export class GeneraajusteinventarioComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent; // Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  public FormGeneraAjusteInventario: FormGroup;
  public periodos: IngresoConteoManual[] = [];
  public detallesinventarios: InventarioDetalle[] = [];
  public detallesinventariosActualizar: InventarioDetalle[] = [];
  public detallesinventariosPaginacion: InventarioDetalle[] = [];
  public motivos: MotivoAjuste[] = [];
  public loading = false;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public usuario = sessionStorage.getItem('Usuario').toString();
  public servidor = environment.URLServiciosRest.ambiente;
  public _BSModalRef: BsModalRef;
  public editField: any;
  public isSave: boolean = false;

  public bodegasSolicitantes: Array<ClinfarParamBodResponse> = [];
  public listaTipoProductos: Array<ClinfarParamProResponse> = [];
  public listaGrupoArticulos: Array<ClinfarParamProResponse> = [];

  constructor(
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    public _BodegasService: BodegasService,
    private _inventarioService: InventariosService,
    public _BsModalService: BsModalService,
    private motivoAjusteService: MotivoAjusteService,
    private _inflistaconteoinventarioService: InflistaconteoinventarioService,
  ) {

    this.FormGeneraAjusteInventario = this.formBuilder.group({
      tiporegistro: [{ value: null, disabled: false }, Validators.required],
      boddestino: [{ value: null, disabled: false }, Validators.required],
      periodo: [{ value: null, disabled: false }, Validators.required],
      grupovalor: [{ value: null, disabled: false }],
      motivo: [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());

    this.loading = true;
    this.filtros();

  }

  TranslateUtil(value: string) {
    this.translate.get(value).subscribe((text: string) => { value = text; });
    return value;
  }

  filtroMotivos() {

    this.motivoAjusteService.list(this.usuario, this.servidor, this.hdgcodigo, this.esacodigo, this.cmecodigo).subscribe(
      data => {
        this.motivos = data;

      }, err => {

        this.alertSwalError.title = this.TranslateUtil('key.genera.ajuste.inventario');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.motivos');
        this.alertSwalError.show();
      }
    );
  }

  filtros() {

    this._inflistaconteoinventarioService.filtroGenerarAjuste().subscribe(
      response => {
        if (response != null) {
          this.loading = false;
          this.bodegasSolicitantes = response.listaBodegas;
          this.listaTipoProductos = response.listaTipoProductos;
          this.listaGrupoArticulos = response.listaGrupoArticulos;
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.genera.ajuste.inventario');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.bodegas.destino');
        this.alertSwalError.show();
      }
    );
  }

  updateList(id: number, property: string, event: any) {
    const editField = event.target.textContent;

    this.detallesinventariosPaginacion[id][property] = parseInt(editField);
    this.detallesinventarios[id][property] = this.detallesinventariosPaginacion[id][property];
  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;

  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detallesinventariosPaginacion = this.detallesinventariosActualizar.slice(startItem, endItem);
  }

  convertirFormatoFecha(fechaString: string): string {
    const fechaObj = new Date(fechaString);
    return `${fechaObj.getDate().toString().padStart(2, '0')}/${(fechaObj.getMonth() + 1).toString().padStart(2, '0')}/${fechaObj.getFullYear()}`;
  }

  BuscaPeriodoInventario(codigobod: number) {

    this.loading = true;
    this.FormGeneraAjusteInventario.get('periodo').setValue(null);
    this.periodos = [];
    this._inventarioService.BuscaPeriodoGenerarAjuste(this.hdgcodigo, this.esacodigo, this.cmecodigo, codigobod, this.usuario, this.servidor, true).subscribe(
      response => {
        this.loading = false;
        if (response != null && response.length > 0) {
          response.forEach(element => {
            let temporal = new IngresoConteoManual();
            temporal.fechainventario = this.convertirFormatoFecha(element.fechainventario);
            this.periodos.push(temporal);
          });
          this.FormGeneraAjusteInventario.get('periodo').setValue(response[0].fechainventario);
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.genera.ajuste.inventario');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.periodo');
        this.alertSwalError.show();
      }
    );
  }

  Limpiar() {

    this.FormGeneraAjusteInventario.reset();
    this.detallesinventarios = [];
    this.detallesinventariosActualizar = [];
    this.detallesinventariosPaginacion = [];
    this.detallesinventarios = [];
    this.motivos = [];
    this.periodos = [];
  }

  ConfirmaBusquedaDeInventarios() {
    this.BusquedaDeInventarios();
  }

  async BusquedaDeInventarios() {
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
        this.FormGeneraAjusteInventario.value.periodo,
        this.FormGeneraAjusteInventario.value.boddestino,
        this.FormGeneraAjusteInventario.value.tiporegistro,
        this.usuario,
        this.servidor,
        this.FormGeneraAjusteInventario.value.grupovalor,
        pagina
      )
        .toPromise().then((response: InventarioDetalle[]) => {
          if (response != null && response.length > 0) {
            cargardetallesinventarios.push(...response)
            this.filtroMotivos();
          } else {
            cargaDatos = false;

          }
        }).catch(error => {

          this.alertSwalError.title = this.TranslateUtil('key.genera.ajuste.inventario');
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.inventario');
          this.alertSwalError.show();
          cargaDatos = false;
        });

    }

    this.detallesinventarios.push(...cargardetallesinventarios);
    this.detallesinventariosActualizar.push(...cargardetallesinventarios);
    this.detallesinventariosPaginacion.push(...cargardetallesinventarios.slice(0, 20));
    this.loading = false;

  }

  get hasFormIngresoAjusteInventario() {
    return this.FormGeneraAjusteInventario.value.periodo != null &&
      this.FormGeneraAjusteInventario.value.boddestino != null &&
      this.FormGeneraAjusteInventario.value.tiporegistro != null;
  }

  ConfirmaGeneraInventario() {
    const Swal = require('sweetalert2');

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.generar.ajuste'),
      text: this.TranslateUtil('key.mensaje.confirmar.grabacion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.button.aceptar'),
      cancelButtonText: this.TranslateUtil('key.button.cancelar')
    }).then((result) => {
      if (result.value) {
        this.GuardaAjusteInventario();
      }
    });
  }

  GuardaAjusteInventario() {
    this.loading = true;
    var paraminvajuste: AjustesInventario[] = [];
    this.detallesinventarios.forEach(element => {

      let temporal = new AjustesInventario();
      temporal.idinventario = element.idinventario;
      temporal.iddetalleinven = element.iddetalleinven;
      temporal.meinid = element.idmeinid;
      temporal.codigomein = element.codigomein.trim();
      temporal.ajusteinvent = Number(this.obternerStockManual(element));
      temporal.stockinvent = element.stockinvent;
      temporal.codigocusm = element.codigocums;
      temporal.tipomotivoajus = Number(this.FormGeneraAjusteInventario.value.motivo);
      temporal.valorcosto = Number(element.valorcosto);
      temporal.lote = element.lote;
      temporal.fechavencimiento = element.fechavencimiento;
      paraminvajuste.push(temporal);

    }
    );

    var ajusteinventario = new GrabaAjustesInventario();
    ajusteinventario.hdgcodigo = this.hdgcodigo;
    ajusteinventario.esacodigo = this.esacodigo;
    ajusteinventario.cmecodigo = this.cmecodigo;
    ajusteinventario.bodegainv = this.FormGeneraAjusteInventario.value.boddestino;
    ajusteinventario.usuario = this.usuario;
    ajusteinventario.servidor = this.servidor;
    ajusteinventario.ajustes = paraminvajuste;

    this._inventarioService.CrearNuevoAjusteInventario(ajusteinventario).subscribe(
      data => {
        this.loading = false;
        this.alertSwal.title = this.TranslateUtil('key.genera.ajuste.inventario');
        this.alertSwal.text = this.TranslateUtil('key.mensaje.se.generado.ajuste.inventario');
        this.alertSwal.show();
        this.isSave = true;
      }, err => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.genera.ajuste.inventario');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.generar.ajuste.inventario');
        this.alertSwalError.show();
      }
    );
  }

  setModalNuevoMotivo() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-m',
      initialState: {
      }
    };
    return dtModal;
  }

  agregarNuevoMotivo() {
    this.loading = true;
    this._BSModalRef = this._BsModalService.show(ModalNuevoMovitoComponent, this.setModalNuevoMotivo());
    this._BSModalRef.content.onClose.subscribe((Respuesta: boolean) => {
      if (Respuesta) {
        this.filtroMotivos();
      }
      this.loading = false;
    })
  }

  editarCantidadConteoManual(detalle: InventarioDetalle, nuevaCantidad: number) {
    const index = this.detallesinventarios.findIndex(item => item.iddetalleinven === detalle.iddetalleinven);

    if (index !== -1) {

      this.detallesinventarios[index].ajusteinvent = nuevaCantidad;
      this.detallesinventarios[index].update = true;
    }

  }

  obternerStockManual(detalle: InventarioDetalle): number {
    switch (detalle.habilitarconteo) {

      case 1:
        return detalle.conteomanual1;
      case 2:
        return detalle.conteomanual2;
      case 3:
        return detalle.conteomanual3;
      default:
        break;
    }
  }
  obtenerDiferencia(detalle: InventarioDetalle) {
    switch (detalle.habilitarconteo) {

      case 1:
        return (-1 * (detalle.stockinvent - detalle.conteomanual1));
      case 2:
        return  (-1 * (detalle.stockinvent - detalle.conteomanual2));
      case 3:
        return  (-1 * (detalle.stockinvent - detalle.conteomanual3));
      default:
        break;
    }
  }
}
