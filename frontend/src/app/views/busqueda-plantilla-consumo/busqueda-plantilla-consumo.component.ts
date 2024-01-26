import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

//Manejo de fechas
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SolicitudConsumoService } from 'src/app/servicios/solicitud-consumo.service';
import { UnidadesOrganizacionalesService } from 'src/app/servicios/unidades-organizacionales.service';
import { UnidadesOrganizacionales } from 'src/app/models/entity/unidades-organizacionales';
import { PlantillaConsumo } from 'src/app/models/entity/plantilla-consumo';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busqueda-plantilla-consumo',
  templateUrl: './busqueda-plantilla-consumo.component.html',
  styleUrls: ['./busqueda-plantilla-consumo.component.css']
})
export class BusquedaPlantillaConsumoComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;

  public onClose: Subject<PlantillaConsumo>;
  public estado: boolean = false;
  public lForm: FormGroup;
  public listaplantilla: Array<PlantillaConsumo> = [];
  public listaplantillapaginacion: Array<PlantillaConsumo> = [];
  public loading = false;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  public ccostosolicitante: Array<UnidadesOrganizacionales> = [];
  //fechas
  public locale = 'es';
  public bsConfig: Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';


  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    public datePipe: DatePipe,
    public localeService: BsLocaleService,
    public _solicitudConsumoService: SolicitudConsumoService,
    public _unidadesorganizacionaes: UnidadesOrganizacionalesService,
    public translate: TranslateService
) {

    this.lForm = this.formBuilder.group({
      numeroplantilla: [{ value: null, disabled: false }, Validators.required],
      centrocosto: [{ value: null, disabled: false }, Validators.required],
      estado: [{ value: null, disabled: false }, Validators.required],
      glosa: [{ value: null, disabled: false }, Validators.required],
    });


  }


  ngOnInit() {

    this.setDate();
    this.onClose = new Subject();

    this.BuscaCentroCostoSolicitante();

  }

  onCerrar(Plantilla: PlantillaConsumo) {
    this.estado = true;
    this.onClose.next(Plantilla);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  buscarPlantillaConsumofiltros() {

   this.loading = true;

    this._solicitudConsumoService.buscarplantillaconsumo(this.lForm.value.numeroplantilla,
      this.hdgcodigo, this.esacodigo, this.cmecodigo, this.lForm.value.centrocosto , 0, 0,
       Number(this.lForm.value.estado) ,this.usuario, this.servidor,'').subscribe(
      respuestaplantilla => {
        if (respuestaplantilla.length == 0) {
          this.Limpiar();
          this.loading = false;

          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.plantillas.consumo');
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.encuentra.plantillas.consumo');
          this.alertSwalError.show();
        }
        else {

          this.listaplantilla = respuestaplantilla;
          this.listaplantillapaginacion = this.listaplantilla.slice(0, 8);
        }
      },
      error => {
        console.log(error);
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.plantillas.consumo');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.encuentra.plantillas.consumo');
        this.alertSwalError.show();
        this.Limpiar();
      }

    )
    this.loading = false;
  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listaplantillapaginacion = this.listaplantilla.slice(startItem, endItem);
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }


  BuscaCentroCostoSolicitante() {
    this._unidadesorganizacionaes.buscarCentroCosto("", 0, "CCOS", "", "", 0, this.cmecodigo, 0, 0, "S", this.usuario, null, this.servidor).subscribe(
      response => {
        if (response != null){
          this.ccostosolicitante = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }


  Limpiar() {
    this.lForm.reset();
    this.listaplantillapaginacion = [];
    this.listaplantilla = [];
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

  getNumPlantilla(numeroplantilla:any){
    console.log("busca num plantla espe",numeroplantilla)
    console.log("dato a buscar", parseInt(numeroplantilla), this.hdgcodigo, this.esacodigo, this.cmecodigo, this.lForm.value.centrocosto , 0, 0, Number(this.lForm.value.estado) ,this.usuario, this.servidor)
    this._solicitudConsumoService.buscarplantillaconsumo(parseInt(numeroplantilla), this.hdgcodigo,
    this.esacodigo, this.cmecodigo, this.lForm.value.centrocosto , 0, 0,
    Number(this.lForm.value.estado) ,this.usuario, this.servidor,'').subscribe(
      respuestaplantilla => {
        if (respuestaplantilla.length == 0) {
          this.Limpiar();
          this.loading = false;

          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.plantillas.consumo');
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.encuentra.plantillas.consumo');
          this.alertSwalError.show();
        }
        else {

          this.listaplantilla = respuestaplantilla;
          this.listaplantillapaginacion = this.listaplantilla.slice(0, 8);
        }
      },
      error => {
        console.log(error);
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.plantillas.consumo');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.encuentra.plantillas.consumo');
        this.alertSwalError.show();
        this.Limpiar();
      }

    )
    this.loading = false;
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }

}
