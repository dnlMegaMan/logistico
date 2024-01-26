import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BodegasService } from '../../servicios/bodegas.service';
import { InformesService } from '../../servicios/informes.service';
import { InflistaconteoinventarioService } from 'src/app/servicios/inflistaconteoinventario.service';
import { ClinfarParamBodResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamBodResponse';
import { ClinfarParamProResponse } from 'src/app/models/entity/filtroinformelistaconteoinventario/ClinfarParamProResponse';
import { TranslateService } from '@ngx-translate/core';
import { ReporteImprimeListaConteoInventario } from 'src/app/models/entity/ReporteImprimeListaConteoInventario';

@Component({
  selector: 'app-inflistaconteoinventario',
  templateUrl: './inflistaconteoinventario.component.html',
  styleUrls: ['./inflistaconteoinventario.component.css'],
  providers: [InformesService, InflistaconteoinventarioService]
})
export class InflistaconteoinventarioComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent; // Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormInfListaConteoInventario: FormGroup;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public usuario = environment.privilegios.usuario;
  public servidor = environment.URLServiciosRest.ambiente;
  public bodegasSolicitantes: Array<ClinfarParamBodResponse> = [];
  public listaTipoProductos: Array<ClinfarParamProResponse> = [];
  public listaGrupoArticulos: Array<ClinfarParamProResponse> = [];
  private _BSModalRef: BsModalRef;
  public btnimprime = false;
  public loading = false;

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private _imprimesolicitudService: InformesService,
    private _inflistaconteoinventarioService: InflistaconteoinventarioService,
  ) {

    this.FormInfListaConteoInventario = this.formBuilder.group({
      bodcodigo: [{ value: null, disabled: false }, Validators.required],
      tipoProducto: [{ value: null, disabled: false }, Validators.required],
      grupovalor: [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.FormInfListaConteoInventario.controls.tipoProducto.disable();
    this.filtros();

  }

  TranslateUtil(value: string) {
    this.translate.get(value).subscribe((text: string) => { value = text; });
    return value;
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
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.title.invenario.informe.lista.conteo');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo');
        this.alertSwalError.show();
      }
    );
  }

  ActivaTipoRegistro() {
    this.FormInfListaConteoInventario.controls.tipoProducto.enable();
    this.btnimprime = true;
  }

  ActivaBtnImprmir() {
    this.btnimprime = true;
  }

  ConfirmarImprimir(tiporeporte: string) {
    const Swal = require('sweetalert2');
    this.loading = true;
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.generar.lista.conteo.inventario') ,
      text: this.TranslateUtil('key.mensaje.confirmar.accion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.button.aceptar'),
      cancelButtonText: this.TranslateUtil('key.button.cancelar')
    }).then((result) => {
      if (result.value) {
        this.Imprimir(tiporeporte);
      } else {
        this.loading = false;
      }
    });
  }

  Imprimir(tiporeporte: string) {

    this.btnimprime = false;
    this._imprimesolicitudService.RPTImprimeListaConteoInventario(
      new ReporteImprimeListaConteoInventario(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,
        this.usuario,
        tiporeporte,
        this.FormInfListaConteoInventario.value.bodcodigo,
        this.FormInfListaConteoInventario.value.tipoProducto,
        Number(this.FormInfListaConteoInventario.value.grupovalor),
        this.translate.store.currentLang
      )
    ).subscribe(
      response => {
        this.loading = false;
        this.btnimprime = true;
        if (response != null) {
          window.open(response[0].url, '', '');
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.title.invenario.informe.lista.conteo');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.imprimir.listado');
        this.alertSwalError.show();
        this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
        });
      }
    );

  }

  limpiar() {
    this.FormInfListaConteoInventario.reset();
    this.FormInfListaConteoInventario.controls.tipoProducto.disable();
    this.FormInfListaConteoInventario.controls.grupovalor.disable();
    this.btnimprime = false;
  }

}
