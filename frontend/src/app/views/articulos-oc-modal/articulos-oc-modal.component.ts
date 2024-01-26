import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { AlertComponent } from 'ngx-bootstrap/alert/public_api';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { OrdenCompraService } from '../../servicios/ordencompra.service';
import { OrdenCompra } from '../../models/entity/ordencompra';
import { DatePipe, getLocaleDateFormat } from '@angular/common';
import { EstadoOc } from '../../models/entity/EstadoOc';
import { RegistroArticulo } from '../../models/entity/registroArticulo';
import { DetalleOC } from '../../models/entity/DetalleOC';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-articulos-oc-modal',
  templateUrl: './articulos-oc-modal.component.html',
  styleUrls: ['./articulos-oc-modal.component.css']
})
export class ArticulosOcModalComponent implements OnInit {

  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  @Input() mein: DetalleOC;
  @Input() titulo   : string;

 

  public onClose  : Subject<OrdenCompra>;
  public lForm    : FormGroup;
  public loading  = false;
  public servidor = environment.URLServiciosRest.ambiente;
  public registroarticulo : Array<RegistroArticulo> = [];
  public registroarticulopag : Array<RegistroArticulo> = [];
  public cabecera: RegistroArticulo;
  public detalle : DetalleOC;
  public mein_desc: string= "";

  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;

  public estadomodal : boolean = false;
  /** mensaje y/o alertas */
  public alerts: any[] = [];

  constructor(
    public bsModalRef      : BsModalRef,
    public formBuilder     : FormBuilder,
    public _BusquedaOcService : OrdenCompraService,
    public datePipe               : DatePipe,
    public translate: TranslateService
  ) {
    this.lForm = this.formBuilder.group({
      cantidad: [{ value: null, disabled: false }, Validators.required],
      precio: [{ value: null, disabled: false }, Validators.required],
      meindesc: [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString()); 
    /**Operador ternario asigna null si var codprod/descprod desde pantalla padre vienen sin datos o Undefined */
    /* se usaron nuevas var globales ya que no es posible modificar los valores @Input() //@ML */
    
    /** */
    this.onClose = new Subject();
    this.detalle = this.mein;
    this.mein_desc = this.detalle.meindesc!.toString();
    this.BuscarRegistro();
  }


  async BuscarRegistro() {
    this.loading = true;
    const response = await this._BusquedaOcService.buscarRegistroArticulo(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.mein, this.servidor).toPromise();
    this.registroarticulo = response.filter((registro) => registro.mensaje != "Sin Datos");
    this.registroarticulopag = this.registroarticulo.slice(0, 8);
    this.loading = false;
  }

  async modificarcantidad(varNumber: number){
    if(varNumber >= 99999)
    {
      this.loading = true;
      const Swal = require('sweetalert2');
      Swal.fire({
      title: this.TranslateUtil('key.mensaje.confirmar.cantidad'),
      text: this.TranslateUtil('key.mensaje.advertencia.exceso.cantidad.establecida'),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.detalle.odetcantreal = Number(varNumber);
      } else {
        this.loading = false;
        return;
      }
    })
    }
    else
    {
      this.detalle.odetcantreal = Number(varNumber);
    }
  }

  async modificarcosto(varNumber: number){
    this.detalle.odetvalorcosto = Number(varNumber);
  }

  onCerrar() {
    if(Number(this.lForm.controls.cantidad.value) == 0)
    {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.cantidad.no.valida');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.ingresar.cantidad.valida');
      this.alertSwalAlert.show();
      return;
    }

    if(Number(this.lForm.controls.precio.value) == 0)
    {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.ingresar.cantidad.valida');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.debe.ingresar.precio.valido');
      this.alertSwalAlert.show();
      return;
    }


    //this.detalle.odetcantreal = Number(this.lForm.controls.cantidad.value);
    //this.detalle.odetvalorcosto = Number(this.lForm.controls.precio.value);
    this.estadomodal = true;
    this.onClose.next(this.detalle);
    this.bsModalRef.hide();
  };
  
  onCerrarSalir() {
    this.estadomodal = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.registroarticulopag = this.registroarticulo.slice(startItem, endItem);
  }

  Limpiar() {
    this.lForm.reset();
    this.registroarticulo = [];
    this.registroarticulopag = [];
  }

  

  mensaje(status: string, texto: string, timeoutl: number = 0) {
    this.alerts = [];
    if (timeoutl !== 0) {
      this.alerts.push({
        type: status,
        msg: texto,
        timeout: timeoutl
      });
    } else {
      this.alerts.push({
        type: status,
        msg: texto
      });
    }
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }  
}
