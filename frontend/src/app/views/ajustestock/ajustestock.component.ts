import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { environment } from '../../../environments/environment';
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { CreasolicitudesService } from '../../servicios/creasolicitudes.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { MotivoAjuste } from '../../models/entity/MotivoAjuste';
import { MotivoAjusteService } from '../../servicios/motivoajuste.service';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ajustestock',
  templateUrl: './ajustestock.component.html',
  styleUrls: ['./ajustestock.component.css'],
  providers: [CreasolicitudesService]
})
export class AjustestockComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormAjusteStock: FormGroup;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public stockbodega: number;
  public codbodega: number;
  public buscaprod: boolean = false;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  public bodegas: Array<BodegasTodas> = [];
  public productoselec: Articulos;
  // public datoskardexpaginacion: Articulos;
  private _BSModalRef: BsModalRef;
  public motivos: MotivoAjuste[] = [];
  public loading = false;
  public prodsel: boolean = true;
  public activabtngrabar: boolean = false;
  descprod: any;
  codprod: any;


  constructor(
    private formBuilder: FormBuilder,
    public _BsModalService: BsModalService,
    public _BodegasService: BodegasService,
    private MotivoAjusteService: MotivoAjusteService,
    public _creaService: CreasolicitudesService,
    public _BusquedaproductosService: BusquedaproductosService,
    public translate: TranslateService
  ) {

    this.FormAjusteStock = this.formBuilder.group({
      boddestino: [{ value: null, disabled: false }, Validators.required],
      codigo: [{ value: null, disabled: false }, Validators.required],
      descripcion: [{ value: null, disabled: false }, Validators.required],
      stockactual: [{ value: null, disabled: false }, Validators.required],
      stocknuevo: [{ value: null, disabled: false }, Validators.required],
      motivoajuste: [{ value: null, disabled: false }, Validators.required]

    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.BuscaBodegaDestino();

    this.MotivoAjusteService.list(this.usuario, this.servidor, this.hdgcodigo, this.esacodigo, this.cmecodigo).subscribe(
      data => {
        this.motivos = data;

      }, err => {
        console.log(err.error);
      }
    );

  }



  BuscaBodegaDestino() {

    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegas = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  ActivaBotonBuscaProd() {
    this.buscaprod = true;
  }

  getProducto(codigo: any) {
    // var codproducto = this.lForm.controls.codigo.value;
    this.codprod = codigo;
    console.log(this.codprod);
    if (this.codprod === null || this.codprod === '') {
      return;
    } else {
      var tipodeproducto = 'MIM';
      this.loading = true;
      var controlado = '';
      var controlminimo = '';
      var idBodega = this.FormAjusteStock.value.boddestino;
      var consignacion = '';

      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
        this.cmecodigo, this.codprod, null, null, null, null, tipodeproducto, idBodega, controlminimo,
        controlado, consignacion, this.usuario, null, this.servidor).subscribe(
          response => {
            if (response != null) {
              if (response.length == 0) {
                console.log('no existe el codigo');

                this.loading = false;
                this.BuscaProducto();
              } else {
                if (response.length > 0) {
                  this.productoselec = response[0];
                  this.loading = false;
                  this.FormAjusteStock.get('codigo').setValue(response[0].codigo);
                  this.FormAjusteStock.get('descripcion').setValue(response[0].descripcion);
                  this.prodsel = true;
                  this.BuscaStockProducto(response[0].mein, this.FormAjusteStock.value.boddestino);
                  this.desactivaCampos(true);
                }
              }
            }
          }, error => {
            this.loading = false;
            console.log('error');
          }
        );
    }
  }

  setDatabusqueda(value: any, swtch: number) {

    if (swtch === 1) {
      this.codprod = value;
    } else if (swtch === 2) {
      this.descprod = value;
    }
  }

  desactivaCampos(bool) {
    if (bool) {
      this.FormAjusteStock.controls.codigo.disable();
      this.FormAjusteStock.controls.descripcion.disable();
    } else {
      this.FormAjusteStock.controls.codigo.enable();
      this.FormAjusteStock.controls.descripcion.enable();
    }
  }

  BuscaProducto() {
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) { }
      else {
        this.productoselec = response;
        this.FormAjusteStock.get('codigo').setValue(this.productoselec.codigo);
        this.FormAjusteStock.get('descripcion').setValue(this.productoselec.descripcion);
        this.prodsel = true;
        this.desactivaCampos(true);
        this.BuscaStockProducto(this.productoselec.mein, this.FormAjusteStock.value.boddestino);

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
        titulo: this.TranslateUtil('key.title.busqueda.productos'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Medico',
        id_Bodega: this.FormAjusteStock.value.boddestino,
        descprod: this.descprod,//
        codprod: this.codprod
      }
    };
    return dtModal;
  }

  // setModalBusquedaProductos() {
  //   let dtModal: any = {};
  //   dtModal = {
  //     keyboard: true,
  //     backdrop: 'static',
  //     class: 'modal-dialog-centered modal-xl',
  //     initialState: {
  //       titulo: 'Búsqueda de Productos', // Parametro para de la otra pantalla
  //       hdgcodigo: this.hdgcodigo,
  //       esacodigo: this.esacodigo,
  //       cmecodigo: this.cmecodigo,
  //     }
  //   };
  //   return dtModal;
  // }

  BuscaStockProducto(mein, boddestino) {

    this._creaService.BuscaStockProd(this.hdgcodigo,this.esacodigo,this.cmecodigo, mein, boddestino, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          if (response.length == 0) {
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.stock.bodega.producto.buscado');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.producto.no.existe.bodega.suministro');
            this.alertSwalAlert.show();
          } else {
            this.stockbodega = response[0].stockactual;
            this.FormAjusteStock.get('stockactual').setValue(this.stockbodega);
            this.ActivaBotonGrabar();
          }
        }
      },
      error => {
        console.log(error);
        alert(this.TranslateUtil('key.mensaje.error.buscar.stock.producto'))
      }
    );

  }

  Limpiar() {
    this.FormAjusteStock.reset();
    this.buscaprod = false;
    this.desactivaCampos(false);
    this.codprod = null;
    this.descprod = null;
    this.activabtngrabar = false;

  }

  validaStock(stock: number) {
    if (stock <= 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.stock.no.menor.uno')
      this.alertSwalAlert.show();
    }

  }

  ActivaBotonGrabar() {
    var motivo = true;
    if (this.prodsel === true && this.FormAjusteStock.value.stocknuevo > 0 && motivo == true) {
      this.activabtngrabar = true;
    }
  }

  ConfirmarAjusteStock() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.ajustar.stock'),
      text: this.TranslateUtil('key.mensaje.confirmar.ajuste.stock'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.GrabaAjusteStock();
      }
    })
  }

  GrabaAjusteStock() {
    this._BodegasService.GrabarAjusteStock(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      this.servidor, this.usuario, this.FormAjusteStock.value.boddestino, this.productoselec.mein,
      this.productoselec.codigo, this.FormAjusteStock.value.stockactual,
      this.FormAjusteStock.value.stocknuevo, this.FormAjusteStock.value.motivoajuste).subscribe(
        response => {
          if (response != null) {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.ajuste.grabado.exitosamente');
            this.alertSwal.show();

            this._creaService.BuscaStockProd(this.hdgcodigo,this.esacodigo,this.cmecodigo,this.productoselec.mein, this.FormAjusteStock.value.boddestino,
              this.usuario, this.servidor).subscribe(
                response => {
                  if (response != null) {
                    this.FormAjusteStock.get('stockactual').setValue(response[0].stockactual);
                    this.FormAjusteStock.get('stocknuevo').setValue(null);
                  }
                }
              );
          }
        },
        error => {
          console.log(error);
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.grabar.ajuste.stock.producto');
          this.alertSwalError.show();
        }
      );
  }

  TranslateUtil(value: string) {
    this.translate.get(value).subscribe((text: string) => { value = text; });
    return value;
  }
}
