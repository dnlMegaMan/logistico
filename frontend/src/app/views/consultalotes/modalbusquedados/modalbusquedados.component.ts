import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject} from 'rxjs';

import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { ConsultaConsumoLote } from 'src/app/models/entity/ConsultaConsumoLote';
import { DetalleConsultaConsumoLote } from 'src/app/models/entity/DetalleConsultaConsumoLote';

import { BodegasService } from '../../../servicios/bodegas.service';
import { DatosBusquedalotesprod } from 'src/app/models/entity/DatosBusquedalotesprod';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-modalbusquedados',
  templateUrl: './modalbusquedados.component.html',
  styleUrls: ['./modalbusquedados.component.css']
})
export class ModalbusquedadosComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @Input() titulo    : string;
  @Input() hdgcodigo : number;
  @Input() esacodigo : number;
  @Input() cmecodigo : number;
  @Input() lote      : string;
  @Input() fechavencimiento : string;
  @Input() servidor  : string;
  @Input() fechadesde: string;
  @Input() fechahasta: string;
  @Input() tipo      : number;
  @Input() meinid1   : number;
  @Input() usuario   : string;

  public datosproducto  : Array<Articulos>=[];
  public datosproductoPaginacion : Array<Articulos>=[];
  public tipobusqueda   : boolean = false;
  public onClose        : Subject<ConsultaConsumoLote>;
  public consultalote   : ConsultaConsumoLote = new ConsultaConsumoLote;
  public respuesta      : DatosBusquedalotesprod = new DatosBusquedalotesprod;
  public respuesta1     : Array<DetalleConsultaConsumoLote> = [];
  public codigo         : string;
  public descrip        : string;
  public loading        : boolean = false;

  constructor(
    public formBuilder          : FormBuilder,
    private _buscabodegasService: BodegasService,
    public bsModalRef           : BsModalRef,
    public datePipe             : DatePipe,
    public _BsModalService      : BsModalService,
  ) { }

  ngOnInit() {

    this.onClose = new Subject();
    this.BusquedaDeProducto();
  }

  onCerrarSalir(){
    this.bsModalRef.hide();
  };

  BusquedaDeProducto(){
    this._buscabodegasService.BuscaProductoporLotes(this.servidor,this.hdgcodigo,this.esacodigo,
    this.cmecodigo, this.usuario, this.lote,this.fechavencimiento).subscribe(
      response => {
        if (response != null){
          this.datosproducto = response;
          this.datosproductoPaginacion = this.datosproducto.slice(0,10);
        }
      });
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.datosproductoPaginacion = this.datosproducto.slice(startItem, endItem);
  }

  SeleccionProducto(dato: Articulos){
    console.log("dato selec",dato.mein, dato,this.meinid1)
    this.respuesta1 = [];
    if(this.meinid1 === undefined || this.meinid1 === 0 || this.meinid1 === null){
      this.meinid1 = dato.meinid;

    }
    this.codigo = dato.codmei;
    this.descrip = dato.meindescri;
    console.log("producto:",this.codigo,this.descrip,this.meinid1)
    this._buscabodegasService.ConsumoLotes(this.servidor,this.usuario,this.hdgcodigo,
    this.esacodigo,this.cmecodigo,this.lote,this.meinid1,
    this.datePipe.transform(this.fechadesde, 'dd-MM-yyyy'),
    this.datePipe.transform(this.fechahasta, 'dd-MM-yyyy'),0).subscribe(
      response => {
        if (response != null){
          this.respuesta1 = [];
          this.respuesta1 = response;
          this.consultalote.codigo =this.codigo;
          this.consultalote.descripcion = this.descrip;
          this.consultalote.lote = this.lote;
          this.consultalote.detalleconsulta = this.respuesta1;
          console.log("producto:",this.respuesta1)
          this.onClose.next(this.consultalote);
          this.bsModalRef.hide();
        }
      }
    )
  }
}
