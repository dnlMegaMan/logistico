import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject} from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { PacientesService } from '../../servicios/pacientes.service';
import { UsuarioAutorizado } from 'src/app/models/entity/UsuarioAutorizado';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-modalvalidausuariodevolsolicitud',
  templateUrl: './modalvalidausuariodevolsolicitud.component.html',
  styleUrls: ['./modalvalidausuariodevolsolicitud.component.css']
})
export class ModalvalidausuariodevolsolicitudComponent implements OnInit {
  @Input() hdgcodigo    : number;
  @Input() esacodigo    : number;
  @Input() cmecodigo    : number;
  @Input() titulo       : string;
  @Input() servidor     : string;
  @Input() usuario      : string;
  @Input() mensajeError : string
  @Input() arreglo      : DetalleSolicitud;

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public FormLogin  : FormGroup;
  public onClose: Subject<string>;
  public estado: boolean = false;

  constructor(
    private formBuilder     : FormBuilder,
    public _pacienteService : PacientesService,
    public bsModalRef       : BsModalRef,
    public translate: TranslateService
  ) {
    this.FormLogin = this.formBuilder.group({
      usuario   : [null],
      contraseña: [null]
    });
  }

  ngOnInit() {
    this.onClose = new Subject();
  }

  autenticacion(){
    this._pacienteService.ValidaUsuarioParaRecepcionarDevolucion(this.FormLogin.controls.usuario.value,
      this.FormLogin.controls.contraseña.value,this.servidor  ).subscribe(
        resp => {

          if(resp){
            this.onCerrar(this.FormLogin.controls.usuario.value)
          }else{
            this.alertSwalAlert.title = this.mensajeError;
            this.alertSwalAlert.show();
          }
        }
      )
  }

  onCerrar(usuariovalidado: string) {
    this.estado = true;
    this.onClose.next(usuariovalidado);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.estado = false;
    this.bsModalRef.hide();
  };

}
