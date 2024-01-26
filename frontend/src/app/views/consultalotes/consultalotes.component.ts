import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { BodegaConLote } from 'src/app/models/entity/bodega-con-lote';
import { DetalleConsultaConsumoLote } from 'src/app/models/entity/DetalleConsultaConsumoLote';
import { ProductoConLote } from 'src/app/models/entity/producto-con-lote';
import { BodegasService } from 'src/app/servicios/bodegas.service';
import { BusquedacuentaService } from 'src/app/servicios/busquedacuenta.service';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { environment } from '../../../environments/environment';
import { ModalBusquedaProductoConLoteComponent } from '../modal-busqueda-producto-con-lote/modal-busqueda-producto-con-lote.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-consultalotes',
  templateUrl: './consultalotes.component.html',
  styleUrls: ['./consultalotes.component.css'],
})
export class ConsultalotesComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  FormConsultaLotes = this.formBuilder.group({
    lote: [''],
    codigo: [''],
    descripcion: [''],
    fechadesde: [null],
    fechahasta: [new Date()],
  });

  private servidor = environment.URLServiciosRest.ambiente;
  private usuario = environment.privilegios.usuario;
  private hdgcodigo: number;
  private esacodigo: number;
  private cmecodigo: number;
  loading = false;
  paginaPacientes = 1;
  paginaBodegas = 1;
  detallesPacientes: DetalleConsultaConsumoLote[] = [];
  detalleBodegas: BodegaConLote[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private localeService: BsLocaleService,
    private bsModalService: BsModalService,
    private productosService: BusquedaproductosService,
    private bodegasService: BodegasService,
    private busquedacuentaService: BusquedacuentaService,
    private datePipe: DatePipe,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    defineLocale('es', esLocale);
    this.localeService.use('es');

    this.restaurarPagina();
  }

  private async restaurarPagina() {
    const estadoNavegacionJson = localStorage.getItem('estadoNavegacion');
    if (!estadoNavegacionJson) {
      return;
    }

    const estadoNavegacion = JSON.parse(estadoNavegacionJson);

    const datos = estadoNavegacion.datos;

    if (!datos) {
      return;
    }

    this.paginaPacientes = datos.pagina ? datos.pagina : 1;
    this.FormConsultaLotes.patchValue({
      lote: datos.lote ? datos.lote : '',
      codigo: datos.codigo ? datos.codigo : '',
      fechadesde: datos.desde ? new Date(datos.desde) : null,
      fechahasta: datos.hasta ? new Date(datos.hasta) : null,
    });

    if (datos.lote && datos.codigo) {
      await this.buscarProducto();
    }

    localStorage.removeItem('estadoNavegacion');
  }

  async buscarProducto() {
    const { lote, codigo, descripcion } = this.FormConsultaLotes.getRawValue();

    try {
      if (!lote && !codigo && !descripcion) {
        await this.buscarProductoPorModal();
        return;
      }

      this.loading = true;

      const productos = await this.productosService.buscarProductosConLote(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,
        this.usuario,
        lote,
        codigo,
        descripcion,
      );

      this.loading = false;

      if (!productos || productos.length === 0) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.encontraron.productos');
        await this.alertSwalAlert.show();
        return;
      }

      if (productos.length === 1) {
        this.onProductoSeleccionado(productos[0]);
        return;
      }

      await this.buscarProductoPorModal();
    } catch (error) {
      this.loading = false;
      console.error('[ERROR BUSCAR PRODUCTOS CON LOTE EN MODAL] ', error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.producto');
      await this.alertSwalAlert.show();
    }
  }

  private async buscarProductoPorModal() {
    const modalRef = this.bsModalService.show(ModalBusquedaProductoConLoteComponent, {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        lote: this.FormConsultaLotes.getRawValue().lote,
        codigo: this.FormConsultaLotes.getRawValue().codigo,
        descripcion: this.FormConsultaLotes.getRawValue().descripcion,
      },
    });

    return (modalRef.content.onClose as Subject<ProductoConLote | null>)
      .pipe(mergeMap((producto) => this.onProductoSeleccionado(producto)))
      .toPromise();
  }

  private async onProductoSeleccionado(producto: ProductoConLote | null | undefined) {
    if (!producto) {
      return;
    }

    this.cargarProductoEnFormulario(producto);

    const detallesPacientes = await this.bodegasService
      .ConsumoLotes(
        this.servidor,
        this.usuario,
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        producto.lote,
        producto.meinId,
        this.datePipe.transform(this.FormConsultaLotes.getRawValue().fechadesde, 'dd-MM-yyyy'),
        this.datePipe.transform(this.FormConsultaLotes.getRawValue().fechahasta, 'dd-MM-yyyy'),
        0,
        [140, 150, 160], // SALIDA POR CONSUMO PACIENTE HOSPITALARIO, AMBULATORIO, URGENCIA RESPECTIVAMENTE
      )
      .toPromise();

    if (!detallesPacientes || detallesPacientes.some((d) => d.mensaje === 'Sin Datos')) {
      this.detallesPacientes = [];
    } else {
      this.detallesPacientes = detallesPacientes.filter((d) => d.clinumidentificacion !== ' ');
    }

    this.detalleBodegas = await this.bodegasService.buscaBodegasConLotes(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.servidor,
      this.usuario,
      this.FormConsultaLotes.getRawValue().lote,
      this.FormConsultaLotes.getRawValue().codigo,
    );
  }

  private cargarProductoEnFormulario(producto: ProductoConLote) {
    this.FormConsultaLotes.patchValue({
      lote: producto.lote,
      codigo: producto.codigo,
      descripcion: producto.descripcion,
    });

    this.FormConsultaLotes.get('lote').disable();
    this.FormConsultaLotes.get('codigo').disable();
    this.FormConsultaLotes.get('descripcion').disable();
  }

  limpiar() {
    this.FormConsultaLotes.reset({
      lote: '',
      codigo: '',
      descripcion: '',
      fechadesde: null,
      fechahasta: new Date(),
    });

    this.FormConsultaLotes.enable();
    this.detalleBodegas = [];
    this.detallesPacientes = [];
  }

  async buscarSolicitud(movimiento: DetalleConsultaConsumoLote) {
    try {
      const solicitudes = await this.busquedacuentaService
        .consultaSolicitudPaciente(
          this.servidor,
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          movimiento.cuentaid.toString(),
          '',
          '',
          this.FormConsultaLotes.getRawValue().codigo,
          movimiento.soliid.toString(),
          null,
          null,
        )
        .toPromise();

      if (!solicitudes || solicitudes.length === 0) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.encontro.solicitud');
        await this.alertSwalAlert.show();
        return;
      }

      if (solicitudes.length > 2) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.multiples.solicitudes.encontradas');
        await this.alertSwalAlert.show();
        return;
      }

      this.verSolicitudCompleta(solicitudes[0]);
    } catch (error) {
      console.error('[ERROR AL NAVEGAR A SOLICITUD] ', error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.abrir.detalles.movimiento');
      await this.alertSwalAlert.show();
    }
  }

  private verSolicitudCompleta(solicitud: any) {
    sessionStorage.setItem('detallecargo', solicitud.numsol);
    sessionStorage.setItem('nrosolicitud', solicitud.numsol);

    const fechadesde = this.FormConsultaLotes.getRawValue().fechadesde as Date;
    const fechahasta = this.FormConsultaLotes.getRawValue().fechahasta as Date;

    const estadoNavegacion = {
      ruta: '/consultalotes',
      datos: {
        lote: this.FormConsultaLotes.getRawValue().lote,
        codigo: this.FormConsultaLotes.getRawValue().codigo,
        desde: fechadesde ? fechadesde.getTime() : undefined,
        hasta: fechahasta ? fechahasta.getTime() : undefined,
        pagina: this.paginaPacientes,
      },
    };

    localStorage.setItem('estadoNavegacion', JSON.stringify(estadoNavegacion));

    this.router.navigate(['/solicitudpaciente']);
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
