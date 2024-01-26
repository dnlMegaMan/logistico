import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { TipomovimientoService } from 'src/app/servicios/tipomovimiento.service';
import { TipoMovimiento } from '../../models/entity/TipoMovimiento';
import { MovimientosFarmaciaDetDevol } from '../../models/entity/MovimientosFarmaciaDetDevol';
import { MovimientosfarmaciaService } from '../../servicios/movimientosfarmacia.service'
import { EnvioMovimientosDevolucion } from '../../models/entity/EnvioMovimientosFarmaciaDetDevol'
import { MovimientosFarmaciaDet } from '../../models/entity/MovimientosFarmaciaDet'

import { DatePipe } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';



@Component({
  selector: 'app-movimiento-devolucion',
  templateUrl: './movimiento-devolucion.component.html',
  styleUrls: ['./movimiento-devolucion.component.css']
})
export class MovimientoDevolucionComponent implements OnInit {
  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() descripciontipomov: string;
  @Input() DetalleMovimiento:MovimientosFarmaciaDet;




  public editField: any;


  public onClose: Subject<Articulos>;

  public estado: boolean = false;

  public _detalleDevolucionenvio: Array<MovimientosFarmaciaDetDevol> = [];
  public detalleDevolucion: Array<MovimientosFarmaciaDetDevol> = [];
  public detalleDevolucionPaginacion: Array<MovimientosFarmaciaDetDevol> = [];
  public Arreglotiposmovimientos: Array<TipoMovimiento> = [];
  public FormDevoluciones: FormGroup;
  public _EnvioMovimientosDevolucion:EnvioMovimientosDevolucion;
  private _BSModalRef: BsModalRef;


  public locale = 'es';
  public bsConfig: Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';



  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    public _BusquedaproductosService: BusquedaproductosService,
    public _TipomovimientoService: TipomovimientoService,
    public _BsModalService: BsModalService,
    public _MovimientosfarmaciaService: MovimientosfarmaciaService,
    public datePipe: DatePipe,
    public localeService: BsLocaleService,

  ) {

    this.FormDevoluciones = this.formBuilder.group({
      desctipomov: [{ value: null, disabled: false }, Validators.required],
      movimfarid: [{ value: null, disabled: false }, Validators.required],
      codigomein: [{ value: null, disabled: false }, Validators.required],
      descripcionmein: [{ value: null, disabled: false }, Validators.required],
      tipomov: [{ value: null, disabled: false }, Validators.required],
      idtipodespacho: [{ value: null, disabled: false }, Validators.required],
      descripciontipomov: [{ value: null, disabled: false }, Validators.required],
      disponible: [{ value: null, disabled: false }, Validators.required],




    });



  }

  ngOnInit() {

    this.onClose = new Subject();


    this.setDate();


    this.FormDevoluciones.get('movimfarid').setValue(this.DetalleMovimiento.movimfarid);
    this.FormDevoluciones.get('codigomein').setValue(this.DetalleMovimiento.codigomein);
    this.FormDevoluciones.get('descripcionmein').setValue(this.DetalleMovimiento.descripcionmein);
    this.FormDevoluciones.get('disponible').setValue(this.DetalleMovimiento.cantidadmov - this.DetalleMovimiento.cantidaddevol );


    this.detalleDevolucion = this.DetalleMovimiento.movimientosfarmaciadetdevol;
    this.detalleDevolucionPaginacion = this.detalleDevolucion.slice(0,8);


  }




  setModalProductos(in_hdgcodigo: number, in_esacodigo: number, in_cmecodigo: number) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-lg',
      initialState: {
        titulo: 'Búsqueda de Productos', // Parametro para de la otra pantalla
        hdgcodigo: in_hdgcodigo,
        esacodigo: in_esacodigo,
        cmecodigo: in_cmecodigo,
      }
    };
    return dtModal;
  }


  addDevolucionGrilla() {

        var servidor = environment.URLServiciosRest.ambiente;
        var usuario = environment.privilegios.usuario;

        console.log("this.DetalleMovimiento.movimfardetid", this.DetalleMovimiento.movimfardetid);

        var  DetalleMovimientoDevolucion = new (MovimientosFarmaciaDetDevol);
        DetalleMovimientoDevolucion.movimfarid    = this.DetalleMovimiento.movimfarid ;
        DetalleMovimientoDevolucion.movimfardetid = this.DetalleMovimiento.movimfardetid;
        DetalleMovimientoDevolucion.movimfardetdevolid = 0;
        DetalleMovimientoDevolucion.tipomov = this.DetalleMovimiento.tipomov;
        DetalleMovimientoDevolucion.fechamovdevol =   this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        DetalleMovimientoDevolucion.cantidaddevol = 0;
        DetalleMovimientoDevolucion.responsablenom = usuario;
        DetalleMovimientoDevolucion.cuentacargoid = 0;
        DetalleMovimientoDevolucion.cantidaddevoltot =0;
        DetalleMovimientoDevolucion.servidor = servidor;

        this.detalleDevolucionPaginacion.push(DetalleMovimientoDevolucion);
        this.detalleDevolucion.push(DetalleMovimientoDevolucion);
        console.log("this.detalleDevolucionPaginacion", this.detalleDevolucionPaginacion)
     }



     setModalMensajeExitoSinNumero( ) {
      let dtModal: any = {};
      dtModal = {
        keyboard: true,
        backdrop: 'static',
        class: 'modal-dialog-centered modal-m',
        initialState: {
          titulo:  'Datos Guardados Exitosamente', // Parametro para de la otra pantalla
          mensaje: 'Devoluciones Guardadas Exitosamente',
          informacion: '',
        }
      };
      return dtModal;
    }

    setModalMensajeAceptar( ) {
      let dtModal: any = {};
      dtModal = {
        keyboard: true,
        backdrop: 'static',
        class: 'modal-dialog-centered modal-m',
        initialState: {
          titulo: 'CONFIRMAR', // Parametro para de la otra pantalla
          mensaje: 'CONFIRMA LA GRABACIÓN DE LAS DEVOLUCIONES',
          informacion: '',
        }
      };
      return dtModal;
    }



/* Confiormar guardado de devoluciones del movimiento previamente */
ConfirmarGuradadoMovimientoDevolucion() {
  // sE CONFIRMA GURADADO DE REGISTRO
  this._BSModalRef.content.onClose.subscribe((Respuesta: any) => {
      console.log("Retorno ", Respuesta);

      if (Respuesta == 'ACEPTADO') {

        this.guardardevoluciones();
      }
  }

  )

}


  /* Guardar movimimientos */

guardardevoluciones()  {

  this._EnvioMovimientosDevolucion = new(EnvioMovimientosDevolucion);

  this._EnvioMovimientosDevolucion.MovimientosFarmaciaDevol = [];



  this.detalleDevolucion.forEach(element => {
      if (element.movimfardetdevolid == 0 ) {
          /* elemento nuevo */
          this._EnvioMovimientosDevolucion.MovimientosFarmaciaDevol.push(element);
           }

     }
    );

  this._MovimientosfarmaciaService.GuardarMovimietosDevoluciones(this._EnvioMovimientosDevolucion).subscribe(
    response => {
      if (response != null) {
        if (response.length >0) {
          this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {});
        }
      }
    },
    error => {
      console.log(error);
    }
  )


  }



  onCerrar() {
    this.estado = false;
    this.onClose.next();
    this.bsModalRef.hide();
  };





  setModalMensajeerror(descricionError:String) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-m',
      initialState: {
        titulo: 'ERROR', // Parametro para de la otra pantalla
        mensaje: descricionError,
        informacion: '',
      }
    };
    return dtModal;
  }


  /* Función búsqueda con paginación */

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detalleDevolucionPaginacion = this.detalleDevolucion.slice(startItem, endItem);
  }



  updateList(id: number, property: string, event: any, disponible: number) {
    const editField = event.target.textContent;

    this.detalleDevolucionPaginacion[id][property] = parseInt(editField);
    this.detalleDevolucion[id][property] = this.detalleDevolucionPaginacion[id][property]

  }

  changeValue(id: number, property: string, event: any) {

    var msgerror : string;

    if (this.detalleDevolucion[id].movimfardetdevolid != 0 ) {
       console.log("movimfardetdevolid ", this.detalleDevolucionPaginacion[id].movimfardetdevolid)
        msgerror='LAS DEVOLUCIONES PREVIAMENTE EXISTENTE, NO SON MODIFICABLES';
        this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
        }
        );
    this.editField = event.target.textContent;
    }
  }



  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }


}
