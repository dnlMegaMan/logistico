import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { Holding } from '../../models/entity/Holding';
import { Empresas } from '../../models/entity/Empresas';
import { Sucursal } from '../../models/entity/Sucursal';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { hesService } from '../../servicios/hes.service';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { TiporegistroService } from '../../servicios/tiporegistro.service';
import { BodegaDestino } from '../../models/entity/BodegaDestino';
import { BodegasService } from '../../servicios/bodegas.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { InventariosService } from 'src/app/servicios/inventarios.service';
import { ClinfarParamBodResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamBodResponse';
import { ClinfarParamProResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamProResponse';
import { InflistaconteoinventarioService } from 'src/app/servicios/inflistaconteoinventario.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inventario-genera',
  templateUrl: './inventario-genera.component.html',
  styleUrls: ['./inventario-genera.component.css'],
  providers: [InventariosService, InflistaconteoinventarioService]
})

export class InventarioGeneraComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent; // Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  public FormInvantarioGenera: FormGroup;
  public bodegasdestino: Array<BodegaDestino> = [];
  public bodegasSolicitantes: Array<ClinfarParamBodResponse> = [];
  public listaTipoProductos: Array<ClinfarParamProResponse> = [];
  public listaGrupoArticulos: Array<ClinfarParamProResponse> = [];
  public loading = false;
  public locale = 'es';
  public colorTheme = 'theme-blue';
  public bsConfig: Partial<BsDatepickerConfig>;
  public holdings: Array<Holding> = [];
  public empresas: Array<Empresas> = [];
  public sucursales: Array<Sucursal> = [];
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  private _BSModalRef: BsModalRef;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  public idUsuario = '';

  onClose: any;
  bsModalRef: any;
  editField: any;

  constructor(
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    public _BodegasService: BodegasService,
    private _inventarioService: InventariosService,
    public localeService: BsLocaleService,
    public _BsModalService: BsModalService,
    public datePipe: DatePipe,
    private _inflistaconteoinventarioService: InflistaconteoinventarioService,
  ) {

    this.FormInvantarioGenera = this.formBuilder.group({
      hdgcodigo: [{ value: null, disabled: false }, Validators.required],
      esacodigo: [{ value: null, disabled: false }, Validators.required],
      cmecodigo: [{ value: null, disabled: false }, Validators.required],
      fechamostrar: [new Date(), Validators.required],
      boddestino: [{ value: null, disabled: false }, Validators.required],
      tiporegistro: [{ value: null, disabled: false }, Validators.required],
      grupovalor: [{ value: null, disabled: false }, Validators.required],
    });

  }

  ngOnInit() {

    this.setDate();

    this.filtros();

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.idUsuario = sessionStorage.getItem('id_usuario').toString();
  }

  TranslateUtil(value: string) {
    this.translate.get(value).subscribe((text: string) => { value = text; });
    return value;
  }

  filtros() {
    this.loading = true;
    this._inflistaconteoinventarioService.filtroGenerarinventarioSistemas().subscribe(
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
        this.alertSwalError.title = this.TranslateUtil('key.genera.inventario.sistema');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo');
        this.alertSwalError.show();
      }
    );
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  Limpiar() {

    this.FormInvantarioGenera.reset();
  }

  ConfirmaGeneraInventario() {
    const Swal = require('sweetalert2');

    let descripcion = '';

    var tiporegistro = this.listaTipoProductos.filter((item) => item.valor == this.FormInvantarioGenera.value.tiporegistro);

    tiporegistro.length <= 0 ? descripcion = '' : descripcion = tiporegistro[0].descripcion;

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.confirmar.generar.inventario') + descripcion,
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      // icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.button.aceptar'),
      cancelButtonText: this.TranslateUtil('key.button.cancelar')
    }).then((result) => {
      if (result.value) {
        this.GeneraInventario();
      }
    });
  }

  GeneraInventario() {

    const fecha = this.datePipe.transform(this.FormInvantarioGenera.value.fechamostrar, 'yyyy-MM-dd');
    var tiporegistro = this.FormInvantarioGenera.value.tiporegistro;
    this.loading = true;
    this._inventarioService.GeneraInventario(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      fecha,
      this.FormInvantarioGenera.value.boddestino,
      tiporegistro,
      this.FormInvantarioGenera.value.grupovalor,
      this.idUsuario,
      this.servidor
    ).subscribe(
      response => {
        if (response != null) {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.genera.inventario.sistema');
          this.alertSwal.title = this.TranslateUtil('key.mensaje.inventario.sistema.generado.correctamente');
          this.alertSwal.show();
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.genera.inventario.sistema');
        this.alertSwalError.text = this.TranslateUtil(this.getErrorMessage(error.error));
        this.alertSwalError.show();
      }
    );
  }

  getErrorMessage(message: string): string {
    const index = message.indexOf(':');
    if (index !== -1) {
      return message.substring(index + 1).trim();
    }
    return '';
  }

  get hasFormIngresoInventarioGeneral() {
    return this.FormInvantarioGenera.value.fechamostrar != null &&
      this.FormInvantarioGenera.value.boddestino != null &&
      this.FormInvantarioGenera.value.tiporegistro != null;
  }
}
