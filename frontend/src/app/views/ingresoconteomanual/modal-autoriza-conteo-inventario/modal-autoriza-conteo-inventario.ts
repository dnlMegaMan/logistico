import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";
import { LoginService } from "src/app/servicios/login.service";
import { stringSinEspaciosAlrededor } from "src/app/validadores/string-sin-espacios-alrededor";
import { environment } from "src/environments/environment";
import { Subject } from "rxjs";
import { PrestamosService } from "../../prestamos/services/prestamos.service";
import { IngresoconteomanualService } from "src/app/servicios/ingresoconteomanual.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { AlertComponent } from "ngx-bootstrap/alert";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'modal-autoriza-conteo-inventario',
  templateUrl: './modal-autoriza-conteo-inventario.html',
  providers: [IngresoconteomanualService]
})
export class ModalAutorizaConteoInvenarioComponent implements OnInit {

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
  private invId: number;
  private servidor = environment.URLServiciosRest.ambiente;

  constructor(
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private prestamoService: PrestamosService,
    private ingresoconteomanualService: IngresoconteomanualService,
  ) {

  }

  TranslateUtil(value: string) {
    this.translate.get(value).subscribe((text: string) => { value = text; });
    return value;
  }

  ngOnInit(): void {
    this.onClose = new Subject();
    this.invId = this.modalService.config.initialState['id'];
  }

  async autenticacion() {

    let usuario: string = this.FormLogin.value.usuario;
    let password: string = this.FormLogin.value.password;
    let observaciones: string = this.FormLogin.value.observaciones;

    this.loading = true;
    this.estadoBotones = true;
    var loginResponse ;

    try{
         loginResponse = await this.prestamoService.autenticacionUsuario(usuario, password);
         if (loginResponse.length == 0) return;
    }catch(error){
      this.mensajePrivilegio(
        this.TranslateUtil('key.mensaje.nombre.usuario.contrasena.invalidos'),
        'warning'
      );

      this.loading = false;
      this.estadoBotones = false;
      return;
    }

    const privilegios = await this.prestamoService.obtenerPrivilegios(
      loginResponse[0].userid,
      loginResponse[0].hdgcodigo,
      loginResponse[0].esacodigo,
      loginResponse[0].cmecodigo,
      JSON.stringify(loginResponse[0].token),
      this.servidor,
    );

    privilegios.forEach(async value => {
      if (value.idaccion === 894000) {
        this.tienePrivilegio = true;
      }
    });

    if (this.tienePrivilegio) {

      this.ingresoconteomanualService.AutorizaConteoInvenario(this.invId, usuario,observaciones, this.servidor)
        .subscribe(
          response => {
            this.onCerrar();
          },
          error => {
            this.loading = false;
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.usuario.no.existe.no.autorizado');
            this.alertSwalError.show();
            return;
          });
    } else {
      this.loading = false;
      this.mensajePrivilegio(
        this.TranslateUtil('key.mensaje.usuario.no.existe.no.autorizado'),
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
