import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Servicio } from 'src/app/models/entity/Servicio';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { EstructuraunidadesService } from 'src/app/servicios/estructuraunidades.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busqueda-servicios',
  templateUrl: './busqueda-servicios.component.html',
  styleUrls: ['./busqueda-servicios.component.css']
})
export class BusquedaServiciosComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;

  public onClose: Subject<Servicio>;
  public lForm: FormGroup;
  public arregloServicios: Array<Servicio> = [];
  public arregloServiciosPaginacion: Array<Servicio> = [];
  public loading = false;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;


  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private _Servicios: EstructuraunidadesService,
    public translate: TranslateService
  ) {

    this.lForm = this.formBuilder.group({
      monbreservicio: [{ value: null, disabled: false }, Validators.required]
    });


  }

  ngOnInit() {

    this.onClose = new Subject();



    this.loading = true;
    this._Servicios.BuscarServicios(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor, 0,'').subscribe(
      response => {
        if (response != null){
          this.loading = false;
          this.arregloServicios = response;
          this.arregloServiciosPaginacion = this.arregloServicios.slice(0, 8);
        } else {
          this.loading = false;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.servicios'));
      }

    );


  }


  buscar_servicio_filtro(nombre_servicio: string) {
    this.loading = true;
    this._Servicios.BuscarServicios(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor, 0,nombre_servicio).subscribe(
      response => {
        if (response != null){
          this.loading = false;
          this.arregloServicios = response;
          this.arregloServiciosPaginacion = this.arregloServicios.slice(0, 8);
        } else {
          this.loading = false;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.servicios'));
      }

    );




  }


limpiar() {

  this.arregloServicios = [];
  this.arregloServiciosPaginacion =[];
  this.lForm.reset();


}


  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloServiciosPaginacion = this.arregloServicios.slice(startItem, endItem);
  }

  onCerrar(servicio_seleccionado: Servicio) {

    this.onClose.next(servicio_seleccionado);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {

    this.onClose.next();
    this.bsModalRef.hide();
  };

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
