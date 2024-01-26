import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PaginationInstance } from 'ngx-pagination';
import { Subject } from 'rxjs';
import { Servicio } from 'src/app/models/entity/Servicio';
import { EstructuraBodega } from 'src/app/models/entity/estructura-bodega';
import { TipoParametro } from 'src/app/models/entity/tipo-parametro';
import { BodegasService } from 'src/app/servicios/bodegas.service';
import { EstructuraunidadesService } from 'src/app/servicios/estructuraunidades.service';
import { environment } from '../../../environments/environment';
import { Bodegas } from '../../models/entity/Bodegas';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busquedabodegas',
  templateUrl: './busquedabodegas.component.html',
  styleUrls: ['./busquedabodegas.component.css'],
})
export class BusquedabodegasComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;
  @Input() codbodega: number;
  @Input() glosabodega: string;
  @Input() codigobodega: string;
  @Input() bodegasIgnorar: string[];

  loading = false;
  usuario = environment.privilegios.usuario;
  servidor = environment.URLServiciosRest.ambiente;
  onClose = new Subject<Bodegas>();
  estado = false;

  listaEstructuraBodegas: EstructuraBodega[] = [];
  arreglotipobodega: TipoParametro[] = [];
  arreglotipoproducto: TipoParametro[] = [];
  arregloservicios: Servicio[] = [];

  paginacionBodegasConfig: PaginationInstance = {
    id: 'paginacion_bodegas',
    itemsPerPage: 10,
    currentPage: 1,
  };

  FormBusquedaBodega = this.formBuilder.group({
    codbodega: [{ value: null, disabled: false }, Validators.required],
    descripcion: [{ value: null, disabled: false }, Validators.required],
    servicio: [{ value: null, disabled: false }, Validators.required],
    servicioid: [{ value: null, disabled: false }, Validators.required],
    unidadid: [{ value: null, disabled: false }, Validators.required],
    estadobodega: [{ value: null, disabled: false }, Validators.required],
    tipobodega: [{ value: null, disabled: false }, Validators.required],
    tipoproducto: [{ value: null, disabled: false }, Validators.required],
    codigobodega: [{ value: null, disabled: false }, Validators.required],
  });

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private _buscabodegasService: BodegasService,
    private _unidadesService: EstructuraunidadesService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());

    this.cargarCombos();

    this.corregirInputsDelModal();

    // Carga valores por defecto en formulario
    this.FormBusquedaBodega.patchValue({
      codbodega: this.codbodega,
      codigobodega: this.codigobodega,
      descripcion: this.glosabodega,
      estadobodega: 'S',
    });

    // Carga inicial de bodegas
    this.buscarBodegasInterno(
      this.codbodega,
      this.codigobodega,
      this.glosabodega,
      'S',
      null,
      null,
    ).then(() => {});
  }

  /**
   * Corrige los valores que se pasan como entrada al modal. Aqui se deberian
   *
   *  - Asignar valores por defecto en caso de null o undefined
   *  - Validaciones
   *  - etc.
   */
  private corregirInputsDelModal() {
    if (!this.bodegasIgnorar) {
      this.bodegasIgnorar = [];
    }
  }

  private cargarCombos() {
    this._buscabodegasService
      .listatipobodega(this.hdgcodigo, this.cmecodigo, this.esacodigo, this.usuario, this.servidor)
      .subscribe((response) => {
        if (response != null) {
          this.arreglotipobodega = response;
        }
      });

    this._buscabodegasService
      .listatipoproducto(this.hdgcodigo, this.cmecodigo, this.esacodigo, this.usuario, this.servidor)
      .subscribe((response) => {
        if (response != null) {
          this.arreglotipoproducto = response;
        }
      });

    this._unidadesService
      .BuscarServicios(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.usuario,
        this.servidor,
        0,
        '',
      )
      .subscribe((response) => {
        if (response != null) {
          this.arregloservicios = response;
        }
      });
  }

  async BuscaBodegas(
    codbodega: string,
    estadobodega: string,
    codigotipobodega: string,
    servicio: number,
    unidad: number,
    descripcion: string,
    codtipoproducto: string,
  ) {
    await this.buscarBodegasInterno(
      0,
      codbodega,
      descripcion,
      estadobodega,
      codtipoproducto,
      codigotipobodega,
    );
  }

  private async buscarBodegasInterno(
    codigoBodega: number,
    fbodcodbodega: string,
    descripcionBodega: string,
    estadoBodega: string,
    codigoTipoProducto: string,
    codigoTipoBodega: string,
  ) {
    this.loading = true;

    try {
      this.listaEstructuraBodegas = await this._buscabodegasService
        .listaCabeceraBodegas(
          this.hdgcodigo,
          this.cmecodigo,
          this.esacodigo,
          codigoBodega,
          fbodcodbodega,
          descripcionBodega,
          estadoBodega,
          codigoTipoProducto,
          codigoTipoBodega,
          sessionStorage.getItem('Usuario'),
          this.servidor,
        )
        .toPromise()
        .then((bodegas) => (!bodegas ? [] : bodegas))
        .then((bodegas) => {
          return bodegas.filter((bodega) => {
            return !this.bodegasIgnorar.some((b) => b === bodega.fbocodigobodega);
          });
        });

      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error('[ERROR BUSCAR CABECERAS BODEGAS] ', error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.bodegas');
      await this.alertSwalError.show();
    }
  }

  getNombreBodega(nombrebodega: string) {
    if (nombrebodega.length > 50) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.largo.descripcion.bodega.no.mayor.cincuenta');
      this.alertSwalError.show();
      this.FormBusquedaBodega.get('descripcion').setValue('');
    }
  }

  async getBodega(codbodega: any) {
    if (codbodega > 99999) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.largo.codigo.menor.cinco.digitos');
      this.alertSwalError.show();
      this.FormBusquedaBodega.get('codbodega').setValue('');
      return;
    }

    await this.buscarBodegasInterno(0, codbodega, null, null, null, null);
  }

  onCerrar(bodega?: EstructuraBodega) {
    this.estado = true;
    this.onClose.next(bodega);
    this.bsModalRef.hide();
  }

  Limpiar() {
    this.FormBusquedaBodega.reset();
    this.listaEstructuraBodegas = [];
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
