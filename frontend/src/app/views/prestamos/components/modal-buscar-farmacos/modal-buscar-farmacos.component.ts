import { Component, OnInit, ViewChild } from '@angular/core';
import { BuscaProdPorDescripcion, Medicamento } from '../../interfaces/buscar-prod-por-descripcion.interface';
import { PrestamosService } from '../../services/prestamos.service';
import { Subject } from 'rxjs';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
  selector: 'app-modal-buscar-farmacos',
  templateUrl: './modal-buscar-farmacos.component.html',
  styleUrls: ['./modal-buscar-farmacos.component.css'],
})
export class ModalBuscarFarmacosComponent implements OnInit {
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;

  public formDatosMedicamentos: FormGroup;
  public listaMedicamentos: Array<Medicamento> = [];
  public listaMedicamentosPag: Array<Medicamento> = [];
  public onClose: Subject<Medicamento>;
  public cargando: boolean = false;
  public alerts: any[] = [];
  public buscarMedicamento: BuscaProdPorDescripcion;
  public loading = false;

  constructor(
    private prestamoService: PrestamosService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private formBuilder: FormBuilder) {

    this.formDatosMedicamentos = this.formBuilder.group({
      codigo: [{ value: null, disabled: false }],
      descripcion: [{ value: null, disabled: false }]
    });

  }

  ngOnInit() {
    this.onClose = new Subject();
    this.buscarMedicamento = this.modalService.config.initialState['buscarMedicamento'];

    this.formDatosMedicamentos.get("codigo").setValue(this.buscarMedicamento.codigo);
    this.formDatosMedicamentos.get("descripcion").setValue(this.buscarMedicamento.descripcion);
    this.onBuscarMedicamento();
  }

  onBuscarMedicamento() {
    let codigo = this.formDatosMedicamentos.get("codigo").value;
    let descripcion = this.formDatosMedicamentos.get("descripcion").value;

    if (codigo == null && !descripcion) {
      this.cargando = true;
      return;
    }

    let buscarMedicamento: BuscaProdPorDescripcion = {
      hdgcodigo: Number(sessionStorage.getItem('hdgcodigo').toString()),
      idbodega: this.buscarMedicamento.idbodega,
      tipodeproducto: this.buscarMedicamento.tipodeproducto,
      codigo: codigo ? codigo.toString() : null,
      descripcion: descripcion,
    }

    this.cargando = false;
    this.onConsularBuscaProdPorDescripcion(buscarMedicamento);
  }

  onConsularBuscaProdPorDescripcion(buscarMedicamento: BuscaProdPorDescripcion) {
    if (buscarMedicamento.codigo == null && !buscarMedicamento.descripcion) {
      this.cargando = true;
      return;
    }

    this.prestamoService.consularBuscaProdPorDescripcion(buscarMedicamento)
      .toPromise()
      .then((response) => {
        if (response != null) {
          if (response.length == 0) {
            response = [];
            this.cargando = true;
            this.loading = false;
            this.alertSwalAlert.title = "Alerta";
            this.alertSwalAlert.text = "El producto no pertenece a la bodega ingresada.";
            this.alertSwalAlert.show();
          } else {
            this.listaMedicamentos = response;
            this.listaMedicamentosPag = this.listaMedicamentos.slice(0, 8);
            this.cargando = true;
          }
        }
      }
      )
      .catch((error) => {

        this.cargando = true;
        this.alertSwalAlert.title = "Alerta";
        this.alertSwalAlert.text = "Error al consultar producto por descripción.";

      });

  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listaMedicamentosPag = this.listaMedicamentos.slice(startItem, endItem);
  }

  limpiar() {
    this.listaMedicamentos = [];
    this.listaMedicamentosPag = [];
    this.formDatosMedicamentos.reset();
  }

  onCerrar(medicamento: Medicamento) {

    try {
      if (medicamento.saldo <= 0) {
        this.cargando = true;
        this.loading = false;
        this.alertSwalAlert.title = "Alerta";
        this.alertSwalAlert.text = "No existe stock para este producto.";
        this.alertSwalAlert.show();
        return;
      }
      this.onClose.next(medicamento);
      this.bsModalRef.hide();

    } catch (error) {
      this.onClose.next();
      this.bsModalRef.hide();
    }

  }

  onSalir() {
    this.onClose.next();
    this.bsModalRef.hide();
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

}
