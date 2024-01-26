import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { AlertComponent } from 'ngx-bootstrap/alert/public_api';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { OrdenCompraService } from '../../servicios/ordencompra.service';
import { OrdenCompra } from '../../models/entity/ordencompra';
import { DatePipe, getLocaleDateFormat } from '@angular/common';
import { EstadoOc } from '../../models/entity/EstadoOc';

@Component({
  selector: 'app-buscar-oc-modal',
  templateUrl: './buscar-oc-modal.component.html',
  styleUrls: ['./buscar-oc-modal.component.css']
})
export class BuscarOcModalComponent implements OnInit {

  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() provid: number;
  @Input() provdesc   : string;
  @Input() titulo   : string;
  @Input() pantalla   : string;
  public bsConfig                           : Partial<BsDatepickerConfig>;

  


 

  public onClose  : Subject<OrdenCompra>;
  public lForm    : FormGroup;
  public estado   : number;
  public desde    : string;
  public hasta    : string;
  public proveedor_nombre : string = "";
  public loading  = false;
  public servidor = environment.URLServiciosRest.ambiente;
  public detalleoc : Array<OrdenCompra> = [];
  public detalleocpag : Array<OrdenCompra> = [];
  public listaestado : Array<EstadoOc> = [];
  public estadomodal : boolean = false;
  /** mensaje y/o alertas */
  public alerts: any[] = [];

  constructor(
    public bsModalRef      : BsModalRef,
    public formBuilder     : FormBuilder,
    public _BusquedaOcService : OrdenCompraService,
    public datePipe               : DatePipe,

  ) {
    this.lForm = this.formBuilder.group({
      estado: [{ value: null, disabled: false }, Validators.required],
      desde: [{ value: null, disabled: false }, Validators.required],
      hasta: [{ value: null, disabled: false }, Validators.required],
      proveedornombre: [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    /**Operador ternario asigna null si var codprod/descprod desde pantalla padre vienen sin datos o Undefined */
    /* se usaron nuevas var globales ya que no es posible modificar los valores @Input() //@ML */
    
    /** */
    this.onClose = new Subject();
    this.cargarCombos();
    this.BuscarOc(0,"","");
    if(this.provdesc != null)
    {
      this.proveedor_nombre = this.provdesc;
    }
  }

  async cargarCombos(){
    try {
      this.loading = true;
      this.listaestado = await this._BusquedaOcService.listaEstado(
        this.servidor,
      ).toPromise();
      this.loading = false;
      //this.selected = Number(this.listaestado[0]['codmediopago'])
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }

  }

  /**** funcion que refresca los parametros de busqueda al cambiar algun input****/
  refrescar(){
    this.loading = true;
    this.estado = this.lForm.value.estado;
    this.desde =     this.datePipe.transform(this.lForm.controls.desde.value, 'dd-MM-yyyy');
    this.hasta =     this.datePipe.transform(this.lForm.controls.hasta.value, 'dd-MM-yyyy');

    if(this.desde === null && this.hasta === null )
    {
      this.BuscarOc(this.estado,"","");
    }
    else if(this.desde != null && this.hasta != null)
    {
      this.BuscarOc(this.estado,this.desde,this.hasta);
    }
    else
    {
      this.loading = false;
      this.alertSwalError.title = "Error: ";
      this.alertSwalError.text = "Abos campos de fecha deben estar ocupados o vacíos";
      this.alertSwalError.show();
    }
  }


  async BuscarOc(estado: number, desde: string, hasta: string) {
    this.loading = true;
    const response = await this._BusquedaOcService.BuscarOcFiltros(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, estado, desde, hasta, this.servidor, this.provid,this.pantalla).toPromise();
    this.detalleoc = response.filter((registro) => registro.orcoid > 0);
    this.detalleocpag = this.detalleoc.slice(0, 8);
    this.loading = false;
    
  }

  onCerrar(OrdenCompra: OrdenCompra) {
    this.estadomodal = true;
    this.onClose.next(OrdenCompra);
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
    this.detalleocpag = this.detalleoc.slice(startItem, endItem);
  }

  Limpiar() {
    this.lForm.reset();
    this.detalleoc = [];
    this.detalleocpag = [];
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

}
