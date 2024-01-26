import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BodegasService } from '../../servicios/bodegas.service';
import { InventariosService } from 'src/app/servicios/inventarios.service';
import { RespuestaObtenerUltimoPeriodoInvenario } from 'src/app/models/entity/RespuestaObtenerUltimoPeriodoInvenario';
import { DatePipe } from '@angular/common';
import { RespuestaCargarBodegasInventario } from 'src/app/models/entity/respuestaCargarBodegasInventario';
import { BloqueoInv, GuardarBloqueosBodegasInventario } from 'src/app/models/entity/GuardarBloqueosBodegasInventario';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inflistaconteoinventario',
  templateUrl: './bloquearbodegasinventario.component.html',
  styleUrls: ['./bloquearbodegasinventario.component.css'],
  providers: [InventariosService]
})
export class BloquearbodegasinventarioComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent; // Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public usuario: string = sessionStorage.getItem('Usuario').toString();;
  public servidor: string = environment.URLServiciosRest.ambiente;
  public loading = false;
  public botonCambioEstado: string = "";
  public btnGuardar = false;
  public invpid: number;
  public fechaapertura: string = "";
  public fechacierre: string = "";
  public detallesBodegasInventarios: RespuestaCargarBodegasInventario[] = [];
  public detallesBodegasInventariosActualizar: RespuestaCargarBodegasInventario[] = [];
  public detallesBodegasInventariosPaginacion: RespuestaCargarBodegasInventario[] = [];

  constructor(
    public translate: TranslateService,
    public datePipe: DatePipe,
    public _BodegasService: BodegasService,
    private _inventariosService: InventariosService,
  ) {
  }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.filtros();

  }

  TranslateUtil(value: string) {
    this.translate.get(value).subscribe((text: string) => { value = text; });
    return value;
  }

  filtros() {
    this.loading = true;
    this._inventariosService.ObtenerUltimoPeriodoInventario(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.servidor
    ).subscribe(
      (response: RespuestaObtenerUltimoPeriodoInvenario) => {
        if (response != null) {
          this.loading = false;
          this.invpid = response.id;
          this.fechaapertura = response.fecha_apertura;

          if (response.fecha_apertura == "") {
            this.alertSwalAlert.title = this.TranslateUtil('key.title.inventario.bloquear.bodegas');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.periodo.inventario.encuentra.cerrado');
            this.alertSwalAlert.show();
            this.btnGuardar = true;
            return;
          }

          if (response.fecha_cierre == "") {
            this.cargarbodegas();
          }

        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.title.inventario.bloquear.bodegas');
        this.alertSwalError.text = this.TranslateUtil('key.alert.filtro.text.inventario.apertura.cierre');
        this.alertSwalError.show();
      }
    );
  }

  editarBloqueo(codigo: number, value: any) {

    const index = this.detallesBodegasInventarios.findIndex(item => item.codigo === codigo);

    if (index !== -1) {
      this.detallesBodegasInventarios[index].update = !this.detallesBodegasInventarios[index].update;
    }

    const changedBodegas = this.detallesBodegasInventarios.filter(item => item.update === true);

  }

  cargarbodegas() {
    this.loading = true;
    this._inventariosService.CargarBodegasInventario(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.servidor
    ).subscribe(
      response => {
        this.loading = false;
        this.detallesBodegasInventarios.push(...response);
        this.detallesBodegasInventariosActualizar.push(...response);
        this.detallesBodegasInventariosPaginacion.push(...response.slice(0, 20));
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.title.inventario.bloquear.bodegas');
        this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.cargar.bodegas');;
        this.alertSwalError.show();
      }
    );
  }

  guardarCambiosBodegas() {
    const Swal = require('sweetalert2');
    this.loading = true;

    Swal.fire({
      title: this.TranslateUtil('key.title.inventario.bloquear.bodegas'),
      text: this.TranslateUtil('key.mensaje.desea.bloquear.bodegas.inventario'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.button.aceptar'),
      cancelButtonText: this.TranslateUtil('key.button.cancelar')
    }).then((result) => {

      if (result.value) {
        this.guardarCambios();
      }else{
        this.loading = false;
      }
    })

  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detallesBodegasInventariosPaginacion = this.detallesBodegasInventariosActualizar.slice(startItem, endItem);
  }

  guardarCambios() {
    var listaBodegas: GuardarBloqueosBodegasInventario;
    var bodegas: BloqueoInv[] = [];

    this.detallesBodegasInventarios.filter(x => x.update == true).forEach(element => {
      var bodega: BloqueoInv = new BloqueoInv(
        element.codigo,
        Boolean(element.bloqueo_x_inventario) ? "N" : "S",
        this.invpid
      );

      bodegas.push(bodega);
    });

    listaBodegas = new GuardarBloqueosBodegasInventario(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      this.servidor,
      this.usuario,
      bodegas
    );

    this.loading = true;
    this._inventariosService.GuardarBloqueosBodegasInventario(
      listaBodegas
    ).subscribe(
      response => {
        if (response != null) {
          this.loading = false;
          this.btnGuardar = true;
          this.detallesBodegasInventarios.forEach(element => element.update = false);
          this.alertSwal.title = this.TranslateUtil('key.title.inventario.bloquear.bodegas');
          this.alertSwal.text = this.TranslateUtil('key.mensaje.se.han.guardado.los.cambios.exitosamente');
          this.alertSwal.show();

        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.title.inventario.bloquear.bodegas');
        switch (error.error.substring(38, 47)) {
          case 'ORA-20001':
            this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.bloquear.bodega.existen.despachos');
            break;
          case 'ORA-20002':
            this.alertSwalError.text = this.TranslateUtil('key.mensaje.desbloquear.bodega.inventario.actualizar');
            break;
          case 'ORA-20003':
            this.alertSwalError.text = this.TranslateUtil('key.mensaje.existen.bodegas.aprobar');
            break;
          default:
            this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.bloquear.bodegas.inventario');
            break;
        }
        this.alertSwalError.show();
      }
    );


  }

  get activarBotonGuardar() {
    return this.detallesBodegasInventarios.filter(x => x.update == true).length > 0;
  }

}
