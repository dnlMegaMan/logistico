import { Component, OnInit,ViewChild,Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BodegasService } from '../../servicios/bodegas.service';
import { FraccionamientoProducto } from 'src/app/models/entity/FraccionamientoProducto';
import { ProductoAFraccionar } from 'src/app/models/entity/ProductoAFraccionar';
import {TranslateService} from '@ngx-translate/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-busquedaproductoafraccionar',
  templateUrl: './busquedaproductoafraccionar.component.html',
  styleUrls: ['./busquedaproductoafraccionar.component.css']
})
export class BusquedaproductoafraccionarComponent implements OnInit {
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo   : string;
  @Input() bodcodigo: number;
  @Input() codigo   : string;
  @Input() descripcion: string;

  public usuario                        = environment.privilegios.usuario;
  public servidor                       = environment.URLServiciosRest.ambiente;
  public productosafraccionar           : ProductoAFraccionar[]=[];
  public productosafraccionarpaginacion : ProductoAFraccionar[] =[];
  public onClose                        : Subject<ProductoAFraccionar>;
  public estado                         : boolean = false;
  public loading                        = false;
  public FormBuscaProdAFraccionar       : FormGroup;
  public codproducto = null;
  public descproducto = null;


  constructor(
    private _bodegasService : BodegasService,
    public bsModalRef       : BsModalRef,
    public formBuilder      : FormBuilder,
    public translate: TranslateService
  ) {

    this.FormBuscaProdAFraccionar = this.formBuilder.group({
      codigo: [{ value: null, disabled: false }, Validators.required],
      descripcion: [{ value: null, disabled: false }, Validators.required],

    });
  }

  ngOnInit() {
    this.onClose = new Subject();

    if(this.codigo !== null) {
      this.codproducto = (this.codigo===undefined || this.codigo.trim()==='')?null:this.codigo;
    }
    if(this.descripcion !== null) {
      this.descproducto = (this.descripcion===undefined || this.descripcion.trim()==='')?null:this.descripcion;
    }
    /** */
    this.onClose = new Subject();

    this.BuscaProducto(this.codproducto,this.descproducto);
  }

  async ngAfterViewInit() {
    /** Si var cod y desc vienen sin datos no realiza busqueda //@ML */
    if (this.codproducto === null && this.descproducto === null){
      return;
    } else {
      this.setBusqueda();
    }
  }

  async setBusqueda() {
    /** setea campos codigo o descripcion de producto y genera busqueda */
    this.FormBuscaProdAFraccionar.get('codigo').setValue(this.codproducto);
    this.FormBuscaProdAFraccionar.get('descripcion').setValue(this.descproducto);
    this.BuscaProducto(this.codproducto, this.descproducto);
  }

  BuscaProducto(codproducto:string,descripcion:string){
    this.loading = true;
    this._bodegasService.BuscaProductoenlaBodega(this.hdgcodigo,this.esacodigo,this.cmecodigo,
      this.bodcodigo, codproducto,descripcion,this.usuario,this.servidor).subscribe(
      response => {
        if (response != null){
          if(response.length >0){
            this.productosafraccionar =response;
            this.productosafraccionarpaginacion = this.productosafraccionar.slice(0,7);

            this.loading = false;
          }else{
            if(response.length==0){
              this.alertSwalError.title=this.TranslateUtil('key.mensaje.no.existe.producto');
              this.alertSwalError.show();
              this.loading = false;
            }

          }
        } else {
          this.loading = false;
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.fraccionar.producto');
        this.alertSwalError.show();
      }
    );
  }

  BuscaProductos(){
    this.loading = true;
    this._bodegasService.BuscaProductoenlaBodega(this.hdgcodigo,this.esacodigo,this.cmecodigo,
      this.bodcodigo, this.FormBuscaProdAFraccionar.value.codigo,
      this.FormBuscaProdAFraccionar.value.descripcion,this.usuario,this.servidor).subscribe(
      response => {
        if (response != null){
          if(response.length >0){
            this.productosafraccionar =response;
            this.productosafraccionarpaginacion = this.productosafraccionar.slice(0,7);
            this.loading = false;
          }else{
            if(response.length==0){
              this.alertSwalError.title=this.TranslateUtil('key.mensaje.no.existe.producto');
              this.alertSwalError.show();
              this.loading = false;
            }
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.fraccionar.producto');
        this.alertSwalError.show();
      }
    );
  }

  onCerrar(Producto: ProductoAFraccionar) {
    this.estado = true;
    this.onClose.next(Producto);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.productosafraccionarpaginacion = this.productosafraccionar.slice(startItem, endItem);
  }

  Limpiar(){
    this.FormBuscaProdAFraccionar.reset();
    this.productosafraccionarpaginacion = [];
    this.productosafraccionar = [];

  }

  getProducto(codigo: string){

    this._bodegasService.BuscaProductoenlaBodega(this.hdgcodigo,this.esacodigo,this.cmecodigo,
    this.bodcodigo, codigo,null,this.usuario,this.servidor).subscribe(
      response => {
        if (response != null){
          if(response.length >0){
            this.productosafraccionar =response;
            this.productosafraccionarpaginacion = this.productosafraccionar.slice(0,7);
            this.loading = false;
          }else{
            if(response.length==0){
              this.alertSwalError.title=this.TranslateUtil('key.mensaje.no.existe.producto');
              this.alertSwalError.show();
              this.loading = false;
            }
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.fraccionar.producto');
        this.alertSwalError.show();
      }
    );
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
