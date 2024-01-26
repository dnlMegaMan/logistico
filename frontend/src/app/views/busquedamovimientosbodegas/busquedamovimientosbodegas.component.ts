import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { TipoMovimiento } from '../../models/entity/TipoMovimiento';
import { TipomovimientoService } from '../../servicios/tipomovimiento.service'
import { MovimientosFarmacia } from '../../models/entity/MovimientosFarmacia'
import { MovimientosfarmaciaService } from '../../servicios/movimientosfarmacia.service'
import { environment } from 'src/environments/environment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
// uso de fechas
import { DatePipe } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';


@Component({
  selector: 'app-busquedamovimientosbodegas',
  templateUrl: './busquedamovimientosbodegas.component.html',
  styleUrls: ['./busquedamovimientosbodegas.component.css']
})
export class BusquedamovimientosbodegasComponent implements OnInit {
  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo   : string;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

// para manejo de fechas
  public locale                       = 'es';
  public bsConfig                     : Partial<BsDatepickerConfig>;
  public colorTheme                   = 'theme-blue';
  public onClose                      : Subject<MovimientosFarmacia>;
  public estado                       : boolean = false;
  public Arreglotiposmovimientos      : Array<TipoMovimiento> = [];
  public listadomovimientos           : Array<MovimientosFarmacia> = [];
  public listadomovimientospaginacion : Array<MovimientosFarmacia> = [];
  public lForm                        : FormGroup;
  public movimfarid                   : number = 0;
  public movimfecha                   : string;
  public servidor                     = environment.URLServiciosRest.ambiente;
  public usuario                      = environment.privilegios.usuario;
  public loading                      = false;


  constructor(
    public bsModalRef                   : BsModalRef,
    public formBuilder                  : FormBuilder,
    public  _TipomovimientoService      : TipomovimientoService,
    private _movimientosfarmaciaService : MovimientosfarmaciaService,
    // para manejo de fechas
    public datePipe                     : DatePipe,
    public localeService                : BsLocaleService,

  ) {
    this.lForm = this.formBuilder.group({
      tipoidentificacion  : [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: false }, Validators.required],
      apellidopaterno     : [{ value: null, disabled: false }, Validators.required],
      apellidomaterno     : [{ value: null, disabled: false }, Validators.required],
      nonbrespaciente     : [{ value: null, disabled: false }, Validators.required],
      numeromovimiento    : [{ value: null, disabled: false }, Validators.required],
      idtipodespacho      : [{ value: null, disabled: false }, Validators.required],
      fechadesde          :  [new Date(),Validators.required ],
      fechahasta          :  [new Date(),Validators.required ],
    });
   }

  ngOnInit() {
    this.onClose = new Subject();
    this.setDate();


    this._TipomovimientoService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.Arreglotiposmovimientos = data;

      }, err => {
        console.log(err.error);
      }
    );
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  onCerrar(movimientoseleccionado:  MovimientosFarmacia) {
    this.estado = true;
    this.onClose.next(movimientoseleccionado);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.onClose.next();
    this.bsModalRef.hide();
  };

  BuscarMovimientosFiltro(in_tipomovimiento:number,in_numeromovimiento:number,in_fecha_inicio:string,
    in_fecha_termino   :string)
  {
    console.log("USuario:",this.usuario,"Servidor:",this.servidor);
    var x_fecha_inicio = this.datePipe.transform(in_fecha_inicio, 'yyyy-MM-dd');
    var x_fecha_termino = this.datePipe.transform(in_fecha_termino, 'yyyy-MM-dd');

    this.loading=true;
    this._movimientosfarmaciaService.BuscaListaMovimietos(this.hdgcodigo ,this.esacodigo,this.cmecodigo,
      in_tipomovimiento,x_fecha_inicio,x_fecha_termino,in_numeromovimiento," ",0,this.usuario,this.servidor).subscribe(
      response => {
        if (response != null){
          this.listadomovimientos = response;
          this.listadomovimientospaginacion = this.listadomovimientos.slice(0, 8);
          this.loading=false;
        } else {
          this.loading = false;
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title="Error al Buscar el movimiento";
        this.alertSwalError.text ="No encuentra detalle, puede que no exista, intentar nuevamente";
        this.alertSwalError.show();
        //alert("Error al Buscar el detalle del movimiento de farmacia, No  encuentra detalle, puede que no exista");
        this.loading=false;
      }
    )
  }

  /* Función búsqueda con paginación */

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listadomovimientospaginacion = this.listadomovimientos.slice(startItem, endItem);
  }

  // seteo de fechas

  Limpiar(){
    this.listadomovimientospaginacion=[]
    this.listadomovimientos =[]
    this.lForm.reset();
  }

}
