import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ServicioMantenedorReglas } from 'src/app/models/entity/servicios-mantenedor-reglas';
import { ServicioService } from 'src/app/servicios/servicio.service';

@Component({
  selector: 'app-busquedaservicioreglas',
  templateUrl: './busquedaservicioreglas.component.html',
  styleUrls: ['./busquedaservicioreglas.component.css'],
})
export class BusquedaservicioreglasComponent implements OnInit {
  readonly onClose = new Subject<any>();

  buscarServicioForm = this.formBuilder.group({
    servicio: [''],
  });

  /** Para paginar los resultados de la búsqueda de sevicios. 1 para la primera pagina */
  pagina = 1

  servicios?: ServicioMantenedorReglas[];

  constructor(
    private formBuilder: FormBuilder,
    private modalRef: BsModalRef,
    private servicioReglas: ServicioService,
  ) {}

  ngOnInit() {}

  async buscarServicio() {
    try {
      this.servicios = await this.servicioReglas
        .buscarServiciosMantenedorDeReglas(false, this.buscarServicioForm.value.servicio.trim())
        .toPromise();

      this.pagina = 1
    } catch (error) {
      console.error('[BUSCAR SERVICIOS EN MANTENEDOR REGLAS] ', error);

      alert('Error al buscar servicios')
    }
  }

  agregarServicio(servicio: ServicioMantenedorReglas) {
    this.cerrarModal(servicio);
  }

  cerrarModal(servicio?: ServicioMantenedorReglas) {
    this.onClose.next(servicio ? servicio : null);
    this.onClose.complete();
    this.modalRef.hide();
  }
}
