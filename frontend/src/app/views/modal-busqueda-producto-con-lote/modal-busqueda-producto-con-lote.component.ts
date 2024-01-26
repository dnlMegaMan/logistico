import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ProductoConLote } from 'src/app/models/entity/producto-con-lote';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { environment } from 'src/environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-modal-busqueda-producto-con-lote',
  templateUrl: './modal-busqueda-producto-con-lote.component.html',
  styleUrls: ['./modal-busqueda-producto-con-lote.component.css'],
})
export class ModalBusquedaProductoConLoteComponent implements OnInit {
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  @Input() lote: string;
  @Input() codigo: string;
  @Input() descripcion: string;

  private readonly onClose = new Subject<ProductoConLote | null>();

  busquedaProductosForm = this.fb.group({
    lote: [''],
    codigo: [''],
    descripcion: [''],
  });
  
  private hdgcodigo: number;
  private esacodigo: number;
  private cmecodigo: number;
  private servidor = environment.URLServiciosRest.ambiente;
  private usuario = environment.privilegios.usuario;
  productos: ProductoConLote[] = [];
  paginaActual = 1;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private bsModalRef: BsModalRef,
    private productosService: BusquedaproductosService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    // Corregir en caso de que venga null o undefined
    this.lote = this.lote ? this.lote : '';
    this.codigo = this.codigo ? this.codigo : '';
    this.descripcion = this.descripcion ? this.descripcion : '';

    this.busquedaProductosForm.patchValue({
      lote: this.lote,
      codigo: this.codigo,
      descripcion: this.descripcion,
    });

    this.buscarProductos();
  }

  async buscarProductos() {
    try {
      this.loading = true;

      this.productos = await this.productosService.buscarProductosConLote(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,
        this.usuario,
        this.busquedaProductosForm.value.lote,
        this.busquedaProductosForm.value.codigo,
        this.busquedaProductosForm.value.descripcion,
      );
    } catch (err) {
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.producto');
    } finally {
      this.loading = false;
    }
  }

  cerrarModal(producto?: ProductoConLote) {
    this.onClose.next(producto ? producto : null);
    this.onClose.complete();
    this.bsModalRef.hide();
  }

  limpiar() {
    this.busquedaProductosForm.reset({
      lote: '',
      codigo: '',
      descripcion: '',
    });

    this.productos = [];
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
