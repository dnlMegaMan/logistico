import { Component, OnInit,ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BodegasService } from '../../servicios/bodegas.service';
import { InformesService } from '../../servicios/informes.service';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-infconsolidadoxdevoluciones',
  templateUrl: './infconsolidadoxdevoluciones.component.html',
  styleUrls: ['./infconsolidadoxdevoluciones.component.css'],
  providers: [InformesService]
})
export class InfconsolidadoxdevolucionesComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos         : Permisosusuario = new Permisosusuario();
  public FormInfConsolidadoxDevoluciones: FormGroup;
  public hdgcodigo              : number;
  public esacodigo              : number;
  public cmecodigo              : number;
  public usuario                = environment.privilegios.usuario;
  public servidor               = environment.URLServiciosRest.ambiente;
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  private _BSModalRef           : BsModalRef;
  public bsConfig               : Partial<BsDatepickerConfig>;
  public locale                 = 'es';
  public colorTheme             = 'theme-blue';
  public btnimprime             : boolean = false;


  constructor(
    private formBuilder             : FormBuilder,
    public _BodegasService          : BodegasService,
    private _imprimesolicitudService: InformesService,
    public localeService            : BsLocaleService,
    public datePipe                 : DatePipe,
  ) {
    this.FormInfConsolidadoxDevoluciones = this.formBuilder.group({
      fechaini  : [new Date(), Validators.required],
      fechafin  : [new Date(), Validators.required],
      tiporeg   : [{ value: null, disabled: false }, Validators.required],
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

  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  ActivaFechaFin(){

  }

  ActivaBtnImprimir(){
    this.btnimprime= true;
    // console.log("Activa btn imprimir",this.btnimprime)
  }

  Imprimir(tiporeporte: string) {
    let fecha3;
    let fecha4;
    // console.log("Imprime datos",this.servidor,this.usuario,tiporeporte,
    // this.FormInfConsolidadoxDevoluciones.value.tiporeg,this.hdgcodigo,this.esacodigo,this.cmecodigo
    // ,0,
    // this.datePipe.transform(this.FormInfConsolidadoxDevoluciones.value.fechaini, 'yyyy-MM-dd'),
    // this.datePipe.transform(this.FormInfConsolidadoxDevoluciones.value.fechafin, 'dd-MM-yyyy'))
    fecha3 = this.FormInfConsolidadoxDevoluciones.value.fechaini
    fecha4 = this.FormInfConsolidadoxDevoluciones.value.fechafin


    let same = fecha3.getTime() === fecha4.getTime() || fecha3.getTime() < fecha4.getTime();

    if(fecha3 > fecha4){
      // console.log("fecha inicial mayor a fecha final")
      this.alertSwalAlert.title = "La fecha inicial es mayor a la fecha final";
      this.alertSwalAlert.text = "Ingrese otra fecha inicial";
      this.alertSwalAlert.show();
    }else{
      if(fecha3 <= fecha4){
        // console.log("fecha inical menor o igual a fecha final, entra")
        if(tiporeporte === 'pdf'){
          this._imprimesolicitudService.RPTImprimeConsolidadoPorDevoluciones(this.servidor,
          this.usuario,tiporeporte,this.FormInfConsolidadoxDevoluciones.value.tiporeg,0,
          this.datePipe.transform(this.FormInfConsolidadoxDevoluciones.value.fechaini, 'yyyy-MM-dd'),
          this.datePipe.transform(this.FormInfConsolidadoxDevoluciones.value.fechafin, 'yyyy-MM-dd'),
          this.hdgcodigo,this.esacodigo,this.cmecodigo).subscribe(
          response => {
            if (response != null) {
              window.open(response[0].url, "", "", true);
            }
          },error => {
            console.log(error);
            this.alertSwalError.title = "Error al Imprimir Listado";
            this.alertSwalError.show();
            this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => { });
          });
        }else{
          if(tiporeporte === 'xls'){

            this._imprimesolicitudService.RPTImprimeConsolidadoPorDevoluciones(this.servidor,
            this.usuario,tiporeporte,this.FormInfConsolidadoxDevoluciones.value.tiporeg,0,
            this.datePipe.transform(this.FormInfConsolidadoxDevoluciones.value.fechaini, 'yyyy-MM-dd'),
            this.datePipe.transform(this.FormInfConsolidadoxDevoluciones.value.fechafin, 'yyyy-MM-dd'),
            this.hdgcodigo,this.esacodigo,this.cmecodigo).subscribe(
              response => {
                if (response != null) {
                 window.open(response[0].url, "", "", true);
                }
              },
              error => {
                console.log(error);
                this.alertSwalError.title = "Error al Imprimir Listado";
                this.alertSwalError.show();
                this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
                })
              }
            );
          }
        }
      }
    }
  }

  limpiar() {
    this.FormInfConsolidadoxDevoluciones.reset();
    this.FormInfConsolidadoxDevoluciones.get('fechaini').setValue(new Date());
    this.FormInfConsolidadoxDevoluciones.get('fechafin').setValue(new Date());
    this.btnimprime = false;
  }
}
