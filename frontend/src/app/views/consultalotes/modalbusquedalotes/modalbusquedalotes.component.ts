import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject} from 'rxjs';

import { BuscaLotesSistema } from 'src/app/models/entity/BuscaLotesSistema';
import { ConsultaConsumoLote } from 'src/app/models/entity/ConsultaConsumoLote';
import { DetalleConsultaConsumoLote } from 'src/app/models/entity/DetalleConsultaConsumoLote';
import { ModalBuscaProductoConsultaLotes } from 'src/app/models/entity/ModalBuscaProductoConsultaLotes';

import { BodegasService } from '../../../servicios/bodegas.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';


@Component({
  selector: 'app-modalbusquedalotes',
  templateUrl: './modalbusquedalotes.component.html',
  styleUrls: ['./modalbusquedalotes.component.css']
})
export class ModalbusquedalotesComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @Input() titulo     : string;
  @Input() hdgcodigo  : number;
  @Input() esacodigo  : number;
  @Input() cmecodigo  : number;
  @Input() lote       : string;
  @Input() servidor   : string;
  @Input() fechadesde : string;
  @Input() fechahasta : string;
  @Input() tipo       : number;
  @Input() meinidpantprincipal: number;
  @Input() usuario    : string;

  public datoslotes           : Array<BuscaLotesSistema>=[];
  public datoslotesPaginacion : Array<BuscaLotesSistema>=[];
  public onClose              : Subject<ConsultaConsumoLote>;
  public datos                : ModalBuscaProductoConsultaLotes = new ModalBuscaProductoConsultaLotes;
  public onClose1              : Subject<ModalBuscaProductoConsultaLotes>;
  public consultalote         : ConsultaConsumoLote = new ConsultaConsumoLote;
  public respuesta1           : Array<DetalleConsultaConsumoLote> = [];
  public tipobusqueda         : boolean = false;
  private _BSModalRef         : BsModalRef;
  public meinid               : number;
  public codigo               : string;
  public descrip              : string;
  public loading        : boolean = false;

  constructor(
    public formBuilder          : FormBuilder,
    private _buscabodegasService: BodegasService,
    public bsModalRef           : BsModalRef,
    public datePipe             : DatePipe,
    public _BsModalService      : BsModalService,
  ) {
  }

  ngOnInit() {
    this.onClose = new Subject();
    this.onClose1 = new Subject();

    this.BusquedaDeLotesSistema();
  }

  onCerrarSalir(){
    this.bsModalRef.hide();
  };

  BusquedaDeLotesSistema(){
    this._buscabodegasService.BuscaLotesDelSistema(this.servidor,this.hdgcodigo,this.esacodigo,
    this.cmecodigo, this.lote,this.meinidpantprincipal, "", "", "",-1).subscribe(response => {
      if (response != null){
        this.datoslotes = response;
        this.datoslotesPaginacion = this.datoslotes.slice(0,20);
      }
    });
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.datoslotesPaginacion = this.datoslotes.slice(startItem, endItem);
  }

  SeleccionLote(dato: BuscaLotesSistema){
    // console.log("lote seleccionado:",dato)
    switch (this.tipo) {
      case 0:
        // console.log("tipo 0", "meinid:",this.meinidpantprincipal)
        this.meinid = dato.meinid;
        this.lote = dato.nombre;

        this.datos.cmecodigo = this.cmecodigo;
        this.datos.esacodigo = this.esacodigo;
        this.datos.fechadesde = this.fechadesde;
        this.datos.fechahasta = this.fechahasta;
        this.datos.hdgcodigo = this.hdgcodigo;
        this.datos.lote = this.lote;
        this.datos.meinid1 = this.meinid;
        this.datos.servidor = this.servidor;
        this.datos.tipo = 0;
        this.datos.titulo = "Busqueda de Productos";
        this.datos.usuario = this.usuario;

        this.onClose1.next(this.datos);
        this.bsModalRef.hide();

        break;

      case 2:
        // console.log("tipo:2, busca el consumo de inmediato")
        this.meinid = this.meinidpantprincipal;
        this.lote = dato.nombre;
        this.codigo = dato.codmei;
        this.descrip = dato.meindescri;
        // console.log("DAtos a buscar consumo lote",this.servidor,this.usuario,this.hdgcodigo,
        // this.esacodigo,this.cmecodigo,this.lote,this.meinid,this.fechadesde,this.fechahasta,
        // 0)

        this._buscabodegasService.ConsumoLotes(this.servidor,this.usuario,this.hdgcodigo,
        this.esacodigo,this.cmecodigo,this.lote,this.meinid,this.fechadesde,this.fechahasta,
        0).subscribe(response => {
          // console.log("datos que devuelve la busqueda del consumo lote",response)
          this.respuesta1 = response;
          this.consultalote.codigo =this.codigo;
          this.consultalote.descripcion = this.descrip;
          this.consultalote.lote = this.lote;
          this.consultalote.detalleconsulta = this.respuesta1;
          this.onClose.next(this.consultalote);
          this.bsModalRef.hide();
        })
        break;

      default:
        break;
    }
  }

  setModalBusqueda(titulo: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-ml',
      initialState: {
        titulo: titulo,
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        lote     : this.lote,
        servidor : this.servidor,
        fechadesde: this.fechadesde,
        fechahasta: this.fechahasta,
        tipo  : this.tipo,
        meinid1 : this.meinid,
        usuario: this.usuario,
      }
    };
    return dtModal;
  }

}
