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
import { DetalleOC } from '../../models/entity/DetalleOC';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-detalle-oc-modal',
  templateUrl: './detalle-oc-modal.component.html',
  styleUrls: ['./detalle-oc-modal.component.css']
})
export class DetalleOcModalComponent implements OnInit {

  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  
  @Input() numoc: number;
  @Input() titulo   : string;
  @Input() descripcion   : string;
  @Input() codigo   : string;

 
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public onClose  : Subject<OrdenCompra>;
  public lForm    : FormGroup;
  public estado   : number;
  public desde    : string;
  public hasta    : string;
  public loading  = false;
  public servidor = environment.URLServiciosRest.ambiente;
  public detalleocaux : Array<DetalleOC> = [];
  public detalleoc : Array<DetalleOC> = [];
  public detalleocpag : Array<DetalleOC> = [];
  public estadomodal : boolean = false;
  /** mensaje y/o alertas */
  public alerts: any[] = [];

  constructor(
    public bsModalRef      : BsModalRef,
    public formBuilder     : FormBuilder,
    public datePipe               : DatePipe,
    private _ordencompra: OrdenCompraService,
    public translate: TranslateService
  ) {
    this.lForm = this.formBuilder.group({
    });
  }

  ngOnInit() {
    /**Operador ternario asigna null si var codprod/descprod desde pantalla padre vienen sin datos o Undefined */
    /* se usaron nuevas var globales ya que no es posible modificar los valores @Input() //@ML */
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
  
    /** */
    this.onClose = new Subject();
    this.buscarOcDet();
  }



  /****funcion que busca orden de compra por id****/
  async buscarOcDet()
  {
    this.loading = true;
    this._ordencompra.BuscarOcDet(
      this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
      Number(this.numoc),
      this.servidor, this.codigo, this.descripcion).subscribe(
      response => {
        if(response.length == 0){
            return;
        } else {
          //this.detalleocaux = response;
          this.detalleoc = response.filter((registro) => registro.odetestado == 1);
          for (const element of this.detalleoc) 
          {
           
            element.pendiente = Number(element.odetcantreal) - Number(element.odetcantdespachada) + Number(element.odetcantdevuelta);
            
          }
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      });
  }

  onCerrar(Detalle: DetalleOC) {
    this.estadomodal = true;
    this.onClose.next(Detalle);
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
