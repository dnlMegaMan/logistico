import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";
import { LoginService } from "src/app/servicios/login.service";
import { stringSinEspaciosAlrededor } from "src/app/validadores/string-sin-espacios-alrededor";
import { PrestamosService } from "../../services/prestamos.service";
import { environment } from "src/environments/environment";
import { Subject } from "rxjs";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { AlertComponent } from "ngx-bootstrap/alert";

@Component({
  selector: 'app-modal-forzar-cierre',
  templateUrl: './modal-forzar-cierre.component.html',
})
export class ModalForzarCierreComponent implements OnInit {

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent; //Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('alertSwalGrilla', { static: false }) alertSwalGrilla: SwalComponent;

  FormLogin = this.formBuilder.group({
    usuario: ['', [Validators.required, Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.maxLength(30), stringSinEspaciosAlrededor()]],
    observaciones: [{ value: null, disabled: false }]
  });

  public alerts: any[] = [];
  public onClose: Subject<Boolean>;
  public estadoBotones: boolean;
  public loading = false;
  public cargoInformacionGeneral = false;
  public tienePrivilegio: boolean = false;
  private prestamoId: number;
  private servidor = environment.URLServiciosRest.ambiente;

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private prestamoService: PrestamosService,
  ) {

  }

  ngOnInit(): void {
    this.onClose = new Subject();
    this.prestamoId = this.modalService.config.initialState['id'];
  }

  async autenticacion() {

    let usuario: string = this.FormLogin.value.usuario;
    let password: string = this.FormLogin.value.password;
    let observaciones: string = this.FormLogin.value.observaciones;


    this.estadoBotones = true;
    const loginResponse = await this.prestamoService.autenticacionUsuario(usuario, password);
    if (loginResponse.length == 0) {
      this.mensajePrivilegio(
        'El Usuario o Contraseña no son correctos.',
        'warning'
      );
      this.estadoBotones = false;
      return;
    }

    const privilegios = await this.prestamoService.obtenerPrivilegios(
      loginResponse[0].userid,
      loginResponse[0].hdgcodigo,
      loginResponse[0].esacodigo,
      loginResponse[0].cmecodigo,
      JSON.stringify(loginResponse[0].token),
      environment.URLServiciosRest.ambiente,
    );

    privilegios.forEach(async value => {
      if (value.idaccion === 894000) {
        this.tienePrivilegio = true;
      }
    });

    if (this.tienePrivilegio) {

      this.prestamoService.forzarCierrePrestamo(this.prestamoId, usuario, observaciones)
        .toPromise()
        .then(() => {
          this.mensajePrivilegio(
            'Forzar cierre se ha realizado exitosamente.',
            'success'
          );
        })
        .catch(() => {
          this.loading = false;
          this.alertSwalError.title = 'Error al momento de forzar cierre';
          this.alertSwalError.show();
          return;
        });
    } else {
      this.mensajePrivilegio(
        'Usuario sin Privilegios para Forzar el cierre del préstamo',
        'warning'
      );
    }
    this.estadoBotones = false;
  }

  private mensajePrivilegio(mensaje: string, icono: string) {
    const Swal = require('sweetalert2');
    Swal.fire(
      mensaje,
      '',
      icono
    ).then(() => {
      this.onCerrar();
    });
  }

  onCerrar() {
    this.onClose.next(this.tienePrivilegio);
    this.bsModalRef.hide();
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }
}
