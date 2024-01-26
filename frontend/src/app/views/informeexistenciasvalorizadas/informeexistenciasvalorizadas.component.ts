import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { BodegaDestino } from '../../models/entity/BodegaDestino';
import { BodegasService } from '../../servicios/bodegas.service';
import { InformesService } from '../../servicios/informes.service'
import { DatePipe } from '@angular/common';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { InflistaconteoinventarioService } from 'src/app/servicios/inflistaconteoinventario.service';
import { ClinfarParamBodResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamBodResponse';
import { ClinfarParamProResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamProResponse';
import { IngresoConteoManual } from 'src/app/models/entity/IngresoConteoManual';
import { InventariosService } from 'src/app/servicios/inventarios.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-informeexistenciasvalorizadas',
  templateUrl: './informeexistenciasvalorizadas.component.html',
  styleUrls: ['./informeexistenciasvalorizadas.component.css'],
  providers: [InformesService, InflistaconteoinventarioService, InventariosService]
})
export class InformeexistenciasvalorizadasComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public FormListadoInventario: FormGroup;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  public tiposderegistros: Array<TipoRegistro> = [];
  public bodegasdestino: Array<BodegaDestino> = [];
  private _BSModalRef: BsModalRef;
  public loading = false;
  public periodos: IngresoConteoManual[] = [];
  public bodegasSolicitantes: Array<ClinfarParamBodResponse> = [];
  public listaTipoProductos: Array<ClinfarParamProResponse> = [];
  public listaGrupoArticulos: Array<ClinfarParamProResponse> = [];

  constructor(
    public translate: TranslateService,
    public _BodegasService: BodegasService,
    private formBuilder: FormBuilder,
    private _informeexistenciasService: InformesService,
    private _inflistaconteoinventarioService: InflistaconteoinventarioService,
    private _inventarioService: InventariosService,
    public _BsModalService: BsModalService,
    public datePipe: DatePipe,
  ) {

    this.FormListadoInventario = this.formBuilder.group({
      tiporegistro: [{ value: null, disabled: false }, Validators.required],
      boddestino: [{ value: null, disabled: false }, Validators.required],
      periodo: [{ value: null, disabled: false }, Validators.required],
    });
  }


  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.filtros();

  }

  TranslateUtil(value: string) {
    this.translate.get(value).subscribe((text: string) => { value = text; });
    return value;
  }

  filtros() {
    this.loading = true;
    this._inflistaconteoinventarioService.filtroInventariovValorizado().subscribe(
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
        this.alertSwalError.title = this.TranslateUtil('key.title.informe.existencias.valorizadas');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.bodegas.destino');
        this.alertSwalError.show();
      }
    );
  }

  get hasFormInformeInventario() {
    return this.FormListadoInventario.value.periodo != null &&
      this.FormListadoInventario.value.boddestino != null &&
      this.FormListadoInventario.value.tiporegistro != null;
  }

  convertirFormatoFecha(fechaString: string): string {
    const fechaObj = new Date(fechaString);
    return `${fechaObj.getDate().toString().padStart(2, '0')}/${(fechaObj.getMonth() + 1).toString().padStart(2, '0')}/${fechaObj.getFullYear()}`;
  }

  BuscaPeriodoInventario(codigobod: number) {

    this.loading = true;
    this.FormListadoInventario.get('periodo').setValue(null);
    this.periodos = [];
    this._inventarioService.BuscaPeriodoInventarioValorizado(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      codigobod,
      this.usuario,
      this.servidor, true
    ).subscribe(
      response => {
        this.loading = false;
        if (response != null && response.length > 0) {

          response.forEach(element => {
            let temporal = new IngresoConteoManual();
            temporal.fechainventario = this.convertirFormatoFecha(element.fechainventario);
            this.periodos.push(temporal);
          });

          this.FormListadoInventario.get('periodo').setValue(response[0].fechainventario);
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.title.informe.existencias.valorizadas');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.periodo');
        this.alertSwalError.show();
      }
    );
  }

  LimpiaPantalla() {
    this.FormListadoInventario.reset();
  }

  ConfirmaImprimirReporte(tiporeport: string) {
    const Swal = require('sweetalert2');

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.imprimir.existencias.valorizadas'),
      text: this.TranslateUtil('key.mensaje.confirmar.impresion.existencias'),
      //icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {

        this.generarReporte(tiporeport);
      }
    })
  }

  generarReporte(tiporeport: string) {
    this.loading = true;
    this._informeexistenciasService.RPTInformeExistencias(
      this.servidor,
      tiporeport,
      this.FormListadoInventario.value.boddestino,
      this.FormListadoInventario.value.tiporegistro,
      this.FormListadoInventario.value.periodo,
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.translate.store.currentLang).subscribe(
        response => {
          if (response != null) {
            window.open(response.url, "", "", true);
            this.loading = false;
          }
        },
        error => {
          console.log(error);
          this.alertSwalError.title = this.TranslateUtil('key.title.informe.existencias.valorizadas');
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.imprimir.reporte.informe.existencias.valorizadas');
          this.alertSwalError.show();
          this.loading = false;

        }
      );
  }



}
