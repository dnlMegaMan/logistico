import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { TiporegistroService } from '../../servicios/tiporegistro.service';

@Component({
  selector: 'app-ajustevalores',
  templateUrl: './ajustevalores.component.html',
  styleUrls: ['./ajustevalores.component.css']
})
export class AjustevaloresComponent implements OnInit {
  public FormAjusteValores         : FormGroup;
  public hdgcodigo                      : number;
  public esacodigo                      : number;
  public cmecodigo                      : number;
  public servidor                       = environment.URLServiciosRest.ambiente;
  public usuario                        = environment.privilegios.usuario;
  public tiposderegistros: Array<TipoRegistro> = [];
  public productoselec  : Articulos;
  public datoskardexpaginacion: Articulos;
  private _BSModalRef   : BsModalRef;

  constructor(
    private formBuilder               : FormBuilder,
    public _BsModalService            : BsModalService,
    private TiporegistroService: TiporegistroService,
  ) { 
    this.FormAjusteValores = this.formBuilder.group({
      tipoprod    : [{ value: null, disabled: false }, Validators.required],
      codigo      : [{ value: null, disabled: false }, Validators.required],
      descripcion : [{ value: null, disabled: false }, Validators.required]
      
    });

  }

  ngOnInit() {

    this.TiporegistroService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario,this.servidor).subscribe(
      data => {
        this.tiposderegistros = data;
        console.log(data);
      }, err => {
        console.log(err.error);
      }
    );
  }

  getHdgcodigo(event: any) {
    this.hdgcodigo = event.hdgcodigo;

  }
  getEsacodigo(event: any) {
    this.esacodigo = event.esacodigo;
  }

  getCmecodigo(event: any) {
    this.cmecodigo = event.cmecodigo;
  }

  BuscaProducto(){
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) { }
      else {
        this.productoselec=response;
        this.FormAjusteValores.get('codigo').setValue(this.productoselec.codigo);
        this.FormAjusteValores.get('descripcion').setValue(this.productoselec.descripcion);
        
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

  Limpiar(){
    this.FormAjusteValores.reset();
  }

  ConfirmarBusquedaAjuste(){


  }

}
