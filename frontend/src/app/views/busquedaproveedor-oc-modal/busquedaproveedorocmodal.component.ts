import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { AlertComponent } from 'ngx-bootstrap/alert/public_api';
import { FormaFar } from '../../models/entity/FormaFar'
import { FormaFarService } from 'src/app/servicios/formafar.service';
import { Presenta } from '../../models/entity/Presenta'
import { PresentaService } from 'src/app/servicios/presenta.service';
import { PrincAct } from '../../models/entity/PrincAct'
import { PrincActService } from 'src/app/servicios/PrincAct.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BodegasService } from '../../servicios/bodegas.service';
import { TipoParametro } from 'src/app/models/entity/tipo-parametro';
import { ProductosBodegas } from 'src/app/models/entity/productos-bodegas';
import { Proveedores } from '../../models/entity/Proveedores';
import { ProveedoresService } from '../../servicios/proveedores.service';
import { validateRUT } from 'validar-rut';
import * as angular from 'angular';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busquedaproveedorocmodal',
  templateUrl: './busquedaproveedorocmodal.component.html',
  styleUrls: ['./busquedaproveedorocmodal.component.css']
})
export class BusquedaproveedorocmodalComponent implements OnInit {
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() titulo   : string;
  @Input() rutnum   : string;
  @Input() proveedor: number;

  public esacodigo: number;
  public cmecodigo: number;

  public onClose  : Subject<Articulos>;
  public estado   : boolean = false;
  public FormaFar : Array<FormaFar> = [];
  public Presenta : Array<Presenta> = [];
  public PrincAct : Array<PrincAct> = [];
  public lForm    : FormGroup;
  public loading  = false;
  public usuario  = environment.privilegios.usuario;
  public servidor = environment.URLServiciosRest.ambiente;
  public arreglotipoproducto: TipoParametro[] = [];
  public detalleproveedores: Proveedores[] = [];
  public detalleproveedorespag: Proveedores[] = [];

  
  public rutprov  = 0;
  public nombreprov = null;

  /** mensaje y/o alertas */
  public alerts: any[] = [];

  constructor(
    public bsModalRef      : BsModalRef,
    public formBuilder     : FormBuilder,
    public _BusquedaproveedorService: ProveedoresService,
    private FormaFarService: FormaFarService,
    private PresentaService: PresentaService,
    private PrincActService: PrincActService,
    private _buscabodegasService: BodegasService,
    public translate: TranslateService
  ) {
    this.lForm = this.formBuilder.group({
      rutprov: [{ value: null, disabled: false }, Validators.required],
      nombreprov: [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    /** */
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());

    this.onClose = new Subject();  
    if(this.rutnum != null)
    {
      this.lForm.get('rutprov').setValue(this.rutnum);
      let inRut = this.lForm.controls['rutprov'].value.replace(/\./g,'').replace(/\-/g, '').replace(/\k/g, '').trim().toLowerCase();
      this.rutprov = Number(inRut)
    } 
    this.setBusqueda();
  }

  async ngAfterViewInit() {
    /** Si var cod y desc vienen sin datos no realiza busqueda //@ML */
    if (this.rutprov === 0 && this.nombreprov === null){
      return;
    } else {
      this.setBusqueda();
    }
  }

  async setBusqueda() {
    this.lForm.get('rutprov').setValue(this.rutprov);
    this.lForm.get('nombreprov').setValue(this.nombreprov);
    this.Buscarproveedor(this.rutprov, this.nombreprov);
  }


   /****funcion que valida rut****/
  validaRut(){
  this.alertSwalAlert.title = null;
  this.alertSwalAlert.text = null;
  if (this.lForm.controls['rutprov'].value != undefined &&
    this.lForm.controls['rutprov'].value != null &&
    this.lForm.controls['rutprov'].value != " " &&
    this.lForm.controls['rutprov'].value != "")
  {
    const newRut = this.lForm.controls['rutprov'].value.replace(/\./g,'').replace(/\-/g, '').trim().toLowerCase();
    const lastDigit = newRut.substr(-1, 1);
    const rutDigit = newRut.substr(0, newRut.length-1);
    let format = '';
    for (let i = rutDigit.length; i > 0; i--) {
      const e = rutDigit.charAt(i-1);
      format = e.concat(format);
      if (i % 3 === 0){
        format = ''.concat(format);
      }
    }
    this.lForm.get('rutprov').setValue(format.concat('-').concat(lastDigit));
    if( !validateRUT(this.lForm.controls.rutprov.value)){
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.id.no.valido');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.id.proveedor.validar');
      this.alertSwalAlert.show();
      this.lForm.controls.rutprov.setValue(null)
      return false;
    }
    else
    {
      this.Buscarproveedor(rutDigit, this.nombreprov);
      return true;
    }
  }
  }

  Buscarproveedor(rut: number, descripcion: string) {
    rut = Number(rut);
    if(isNaN(rut))
    {
      rut = 0;
    }


    if(rut != 0 || descripcion!= null)
    {
      this._BusquedaproveedorService.buscaProveedorFiltro(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, Number(rut), descripcion, this.usuario, this.servidor).subscribe(
        response => {
          if (response.length == 0) {
            this.loading = false;
            response = [];
            //this.mensaje('danger', 'Código no existe o no está asociado a la bodega ingresada', 10000);
          } else {
            if (response.length > 0) {
              this.detalleproveedores = response.filter((registro) => registro.proveedorid > 0);;
              this.detalleproveedorespag = this.detalleproveedores.slice(0, 8);
              if(rut == 0)
              {
                this.lForm.get('rutprov').setValue(null);
              }
              this.loading = false;
            }
          }
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error');
          this.alertSwalError.text = error.message;
          this.alertSwalError.show();
        }
      );
    }
    if(rut == 0)
    {
      this.lForm.get('rutprov').setValue(null);
    }
  }

  onCerrar(Articulos: Articulos) {
    this.estado = true;
    this.onClose.next(Articulos);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detalleproveedorespag = this.detalleproveedores.slice(startItem, endItem);
  }

  Limpiar() {
    this.lForm.reset();
    this.detalleproveedores = [];
    this.detalleproveedorespag = [];
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
