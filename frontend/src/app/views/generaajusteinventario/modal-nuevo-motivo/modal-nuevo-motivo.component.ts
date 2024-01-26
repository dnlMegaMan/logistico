import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MotivoAjusteService } from 'src/app/servicios/motivoajuste.service';
import { RetornaMensaje } from 'src/app/models/entity/RetornaMensaje';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AlertComponent } from 'ngx-bootstrap/alert';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-nuevo-motivo',
  templateUrl: './modal-nuevo-motivo.component.html',
  styleUrls: ['./modal-nuevo-motivo.component.css'],
})
export class ModalNuevoMovitoComponent implements OnInit {
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public formDatosMotivo: FormGroup;
  public onClose: Subject<Boolean>;
  public alerts: any[] = [];
  public loading = false;
  public servidor = environment.URLServiciosRest.ambiente;

  constructor(
    private translate: TranslateService,
    private motivoAjusteService: MotivoAjusteService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private formBuilder: FormBuilder) {

    this.formDatosMotivo = this.formBuilder.group({
      motivo: [{ value: null, disabled: false }, Validators.required],
    });

  }

  ngOnInit() {
    this.onClose = new Subject();
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }

  onSalir() {
    this.onClose.next();
    this.bsModalRef.hide();
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  crearNuevoMotivo() {
    const Swal = require('sweetalert2');

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.crear.motivo.ajuste'),
      text: this.TranslateUtil('key.mensaje.confirmar.grabacion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.button.aceptar'),
      cancelButtonText: this.TranslateUtil('key.button.cancelar')
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this.motivoAjusteService.crearNuevoMotivo(
          Number(sessionStorage.getItem('hdgcodigo').toString()),
          Number(sessionStorage.getItem('esacodigo').toString()),
          Number(sessionStorage.getItem('cmecodigo').toString()),
          this.formDatosMotivo.value.motivo,
          sessionStorage.getItem('Usuario'),
          this.servidor
        ).subscribe(
          (data: RetornaMensaje) => {
            this.loading = false;
            this.onClose.next(true);
            this.bsModalRef.hide();
          },
          error => {
            this.alertSwalError.title = this.TranslateUtil('key.genera.ajuste.inventario');
            this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.crear.nuevo.motivo');
            this.alertSwalError.show();
            this.loading = false;
          }
        );
      }
    });


  }

  get verificarTextoMotivo() {
    return this.formDatosMotivo.get('motivo').invalid;
  }
}
