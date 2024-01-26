import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { environment } from '../../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Bodegas } from '../../../models/entity/Bodegas';
import { Subject } from 'rxjs';
import { ConsultaBodega } from 'src/app/models/entity/consulta-bodega';
import { EstructuraBodega } from 'src/app/models/entity/estructura-bodega';
import { TipoParametro } from 'src/app/models/entity/tipo-parametro';
import { Servicio } from 'src/app/models/entity/Servicio';
import { BusquedacuentaService } from '../../../servicios/busquedacuenta.service';
import { CargoFarmacia } from 'src/app/models/entity/busquedacuentas/CargoFarmacia';
import { Router } from '@angular/router';
import { SolicitudesCarga } from 'src/app/models/entity/busquedacuentas/SolicitudesCarga';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-cargofarmacia',
  templateUrl: './cargofarmacia.component.html',
  styleUrls: ['./cargofarmacia.component.css']
})
export class CargofarmaciaComponent implements OnInit, AfterViewInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;
  @Input() nombrepaciente: string;
  @Input() ctaid: string;
  @Input() numcta: string;
  @Input() codproducto: string;

  public uForm: FormGroup;
  public loading = false;
  public usuario = environment.privilegios.usuario;
  public servidor = environment.URLServiciosRest.ambiente;
  public onClose: Subject<Bodegas>;
  public estado: boolean;
  public arrsolicitudescta: Array<SolicitudesCarga> = [];
  public arrsolicitudesctapaginacion: Array<SolicitudesCarga> = [];
  public param: any;

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    public busquedacuentaService: BusquedacuentaService,
    private router: Router,
    public translate: TranslateService
  ) {
    this.uForm = this.formBuilder.group({
      idcuenta : [{ value: null, disabled: true }],
      numcuenta : [{value: null, disabled: true}],
      nompaciente : [{ value: null, disabled: true }],
      codproducto : [{ value: null, disabled: true }],
      }
    );
  }

  ngOnInit() {
    this.onClose = new Subject();
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.param = JSON.parse(sessionStorage.getItem('paramConsultactas'));

  }

  ngAfterViewInit() {
    setTimeout( () => {
      this.setForm();
    });
  }

  setForm() {
    this.uForm.controls.idcuenta.setValue(this.ctaid);
    this.uForm.controls.numcuenta.setValue(this.numcta);
    this.uForm.controls.nompaciente.setValue(this.nombrepaciente);
    this.uForm.controls.codproducto.setValue(this.codproducto);
    this.busquedacuentaService.consultaSolicitudPaciente(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, this.ctaid, '', '', this.codproducto, this.param.nrosolicitud,'', '').subscribe( res => {
        this.arrsolicitudescta = res;
        this.arrsolicitudesctapaginacion = this.arrsolicitudescta.slice(0, 8);
      }, err => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.proceso');
        this.alertSwalError.show();
      });
  }

  onSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arrsolicitudesctapaginacion = this.arrsolicitudescta.slice(startItem, endItem);
  }

  async onDetallesol(numsolicitud) {
    this.onCerrar();
    sessionStorage.setItem('detallecargo', numsolicitud);
    this.redirect();
  }

  redirect() {
    this.router.navigate(['solicitudpaciente']);
  }

  onCerrar() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }

}
