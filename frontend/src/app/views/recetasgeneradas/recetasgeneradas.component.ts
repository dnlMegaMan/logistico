import { Component, OnInit,ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { DatePipe } from '@angular/common';
import { esLocale } from 'ngx-bootstrap/locale';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { InformesService } from '../../servicios/informes.service';
import { RecetasGeneradas } from 'src/app/models/table';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-recetasgeneradas',
  templateUrl: './recetasgeneradas.component.html',
  styleUrls: ['./recetasgeneradas.component.css'],
  providers: [ InformesService]
})
export class RecetasgeneradasComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos         : Permisosusuario = new Permisosusuario();
  public FormInfPedidosGastoServicio : FormGroup;
  public hdgcodigo              : number;
  public esacodigo              : number;
  public cmecodigo              : number;
  public usuario                : string = environment.privilegios.usuario || "";
  public servidor               = environment.URLServiciosRest.ambiente;
  public btnimprime             : boolean = false;
  public loading                : boolean = false;
  public bsConfig               : Partial<BsDatepickerConfig>;
  public locale                 = 'es';
  public colorTheme             = 'theme-blue';
  public ELEMENT_DATA : RecetasGeneradas[] = [];
  public page : number = 0;
  public nombreArchivo : string = "";

  displayedColumns: string[] = ['esanombre', 'soliid', 'receid', 'fechacreacion',
                                'fechadespacho', 'tiporeceta', 'ambitoreceta', 'estadoreceta', 'glsservicio', 'glsbodega',
                                'fechapago', 'nrocomprobantepago', 'usuariopago', 'fecharpt', 'usuario',
                                'codmein', 'meindescri', 'cantsoli', 'cantdesp', 'cantpend'];
  dataSource = this.ELEMENT_DATA;

  constructor(
    private formBuilder             : FormBuilder,
    private _imprimesolicitudService: InformesService,
    public localeService            : BsLocaleService,
    public datePipe                 : DatePipe,
    public translate: TranslateService
  ) {

    this.FormInfPedidosGastoServicio = this.formBuilder.group({

      fechadesde: [new Date(), Validators.required],
      fechahasta: [new Date(), Validators.required],
      hdgcodigo : [{ value: null, disabled: false }, Validators.required],
      esacodigo : [{ value: null, disabled: false }, Validators.required],
      cmecodigo : [{ value: null, disabled: false }, Validators.required],

    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.setDate();

    if(this.FormInfPedidosGastoServicio.controls.fechahasta.value != null || this.FormInfPedidosGastoServicio.controls.fechahasta.value != undefined){
      this.btnimprime = true;
    }
    // this.Imprimir()
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });

  }

  async Imprimir() {
    let fecha3
    let fecha4
    const fecha = new Date();
    fecha3 = this.FormInfPedidosGastoServicio.value.fechadesde
    fecha4 = this.FormInfPedidosGastoServicio.value.fechahasta
    this.nombreArchivo = "Recetas_Generadas_" + this.datePipe.transform(fecha, 'yyyyMMddhhmmss');

    if(fecha3 > fecha4){
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.fecha.inicio.mayor.fecha.final');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.ingrese.otra.fecha.inicio');
      this.alertSwalAlert.show();
    }else{
      this.loading = true;
      if(fecha3 <= fecha4){
          this.ELEMENT_DATA = await this._imprimesolicitudService.RPTImprimeRecetasGeneradas(this.servidor,this.hdgcodigo,this.esacodigo,
            this.cmecodigo,this.usuario,"xlsx",
            this.datePipe.transform(this.FormInfPedidosGastoServicio.value.fechadesde, 'yyyy-MM-dd'),
            this.datePipe.transform(this.FormInfPedidosGastoServicio.value.fechahasta, 'yyyy-MM-dd'),
            ).toPromise();
          if(this.ELEMENT_DATA != null){
            this.dataSource = this.ELEMENT_DATA;
            this.btnimprime = true;
            this.loading = false;
          } else {
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.encuentran.recetas.rango.fechas.ingresado');
            this.alertSwalAlert.show();
            this.btnimprime = false;
            this.loading = false;
          }
      }
    }
  }

  limpiar() {
    this.FormInfPedidosGastoServicio.reset();
    this.FormInfPedidosGastoServicio.get('fechadesde').setValue(new Date());
    this.FormInfPedidosGastoServicio.get('fechahasta').setValue(new Date());
    if(this.FormInfPedidosGastoServicio.controls.fechahasta.value != null || this.FormInfPedidosGastoServicio.controls.fechahasta.value != undefined){
      this.btnimprime = true;
      this.page = 0;
      this.btnimprime = false;
    }else{
      this.btnimprime = false;
      this.page = 0;
      this.btnimprime = false;
    }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
