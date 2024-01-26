import { Component, OnInit,ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { DatePipe } from '@angular/common';
import { esLocale } from 'ngx-bootstrap/locale';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { InformesService } from '../../servicios/informes.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-infpedidoscongastoservicio',
  templateUrl: './infpedidoscongastoservicio.component.html',
  styleUrls: ['./infpedidoscongastoservicio.component.css'],
  providers: [ InformesService]
})
export class InfpedidoscongastoservicioComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public FormInfPedidosGastoServicio : FormGroup;
  public hdgcodigo              : number;
  public esacodigo              : number;
  public cmecodigo              : number;
  public usuario                = environment.privilegios.usuario;
  public servidor               = environment.URLServiciosRest.ambiente;
  public bsConfig               : Partial<BsDatepickerConfig>;

  constructor(
    private formBuilder: FormBuilder,
    private _imprimesolicitudService: InformesService,
    public localeService: BsLocaleService,
    public datePipe: DatePipe,
    public translate: TranslateService
  ) {
    this.FormInfPedidosGastoServicio = this.formBuilder.group(
      {
        fechadesde: [new Date(), [Validators.required]],
        fechahasta: [new Date(), [Validators.required]],
      },
      {
        validators: [this.validarRangoFechasEnMismoMesAnio(), this.validarRangoFechasNoSeCrucen()],
      },
    );
  }

  private validarRangoFechasEnMismoMesAnio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const desde = control.get('fechadesde').value;
      const hasta = control.get('fechahasta').value;

      if (!(desde instanceof Date) || !(hasta instanceof Date)) {
        return null;
      }
      
      if (desde.getMonth() !== hasta.getMonth() || desde.getFullYear() !== hasta.getFullYear()) {
        return { rangoMuyGrande: true };
      }

      return null;
    };
  }

  private validarRangoFechasNoSeCrucen(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const desde = control.get('fechadesde').value;
      const hasta = control.get('fechahasta').value;

      if (!(desde instanceof Date) || !(hasta instanceof Date)) {
        return null;
      }

      /* Esto es una correccion porque al seleccionar la fecha de fin en el mismo dia que la fecha 
       * de inicio sin haber cambiado la fecha de inicio, ocurre que 'desde > hasta' aunque esten
       * en el mismo dia y no deja imprimir el informe para hoy. */
      if (
        desde.getMonth() === hasta.getMonth() &&
        desde.getFullYear() === hasta.getFullYear() &&
        desde.getDay() === hasta.getDay()
      ) {
        return null;
      }

      if (desde.getTime() > hasta.getTime()) {
        return { fechasCruzadas: true };
      }

      return null;
    };
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.setDate();
  }

  private setDate() {
    const locale = 'es';
    defineLocale(locale, esLocale);
    this.localeService.use(locale);
    
    this.bsConfig = {
      containerClass: 'theme-blue',
    };
  }

  async Imprimir(tiporeporte: string) {
    const fechaDesde = this.FormInfPedidosGastoServicio.value.fechadesde;
    const fechaHasta = this.FormInfPedidosGastoServicio.value.fechahasta;

    if (tiporeporte === 'pdf') {
      try {
        const urlReporte = await this._imprimesolicitudService.RPTImprimePedidosConGastoServicio(
          this.servidor,
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.usuario,
          'pdf',
          this.datePipe.transform(fechaDesde, 'yyyy-MM-dd'),
          this.datePipe.transform(fechaHasta, 'yyyy-MM-dd'),
        );

        if (!urlReporte) {
          throw new Error('URL Reporte en PDF es null');
        }

        window.open(urlReporte.url, '', '');
      } catch (error) {
        console.error(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.listado');
        this.alertSwalError.show();
      }
    } else if (tiporeporte === 'xls') {
      try {
        await this._imprimesolicitudService.RPTImprimePedidosConGastoServicio(
          this.servidor,
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.usuario,
          'xls',
          this.datePipe.transform(fechaDesde, 'yyyy-MM-dd'),
          this.datePipe.transform(fechaHasta, 'yyyy-MM-dd'),
        );
      } catch (error) {
        console.error(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.listado');
        this.alertSwalError.show();
      }
    }
  }

  limpiar() {
    this.FormInfPedidosGastoServicio.reset({
      fechadesde: new Date(),
      fechahasta: new Date(),
    });
  }
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
