import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { Roles } from 'src/app/models/entity/Roles';
import { UnidadesOrganizacionalesService } from 'src/app/servicios/unidades-organizacionales.service';
import { UnidadesOrganizacionales } from 'src/app/models/entity/unidades-organizacionales';
import { CentroCostoUsuario } from 'src/app/models/entity/centro-costo-usuario';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busqueda-centros-costos',
  templateUrl: './busqueda-centros-costos.component.html',
  styleUrls: ['./busqueda-centros-costos.component.css']
})
export class BusquedaCentrosCostosComponent implements OnInit{ 
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;
  @Input() CentrosCosto: Array<CentroCostoUsuario>;

  public onClose: Subject<Roles>;
  public lForm: FormGroup;
  public arregloCentroCosto: Array<UnidadesOrganizacionales> = [];
  public arregloCentroCostoPaginacion: Array<UnidadesOrganizacionales> = [];
  public loading = false;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  public _Roles : Roles;

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    public _unidadesorganizacionaes: UnidadesOrganizacionalesService,
    public translate: TranslateService
  ) { 

    this.lForm = this.formBuilder.group({
      codigorol: [{ value: null, disabled: false }, Validators.required],
      nombrerol: [{ value: null, disabled: false }, Validators.required]
    });
  }

  ngOnInit() {
    this.onClose = new Subject();
    
    this.loading = true;
    this._Roles = new(Roles);

    this.arregloCentroCosto = [];
    this.arregloCentroCostoPaginacion = [];
    this._Roles.servidor = this.servidor;
    this._Roles.hdgcodigo = this.hdgcodigo;
    this._Roles.esacodigo = this.esacodigo;
    this._Roles.cmecodigo = this.cmecodigo;

    this._unidadesorganizacionaes.buscarCentroCosto("", 0, "CCOS", "", "", 0, this.cmecodigo, 0, 0, "S", "", this.CentrosCosto,this.servidor).subscribe(
      response => {
        if(response != null){
          this.arregloCentroCosto = response;
          this.arregloCentroCostoPaginacion = this.arregloCentroCosto.slice(0, 8);
        }
        
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.centro.costos'));
      }
    );

    this.loading = false;

  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
  
  

limpiar() {

  this.arregloCentroCosto = [];
  this.arregloCentroCostoPaginacion =[];
  this.lForm.reset();
  

}


  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloCentroCostoPaginacion = this.arregloCentroCosto.slice(startItem, endItem);
  }

  onCerrar(rol_seleccionado:Roles ) {

    this.onClose.next(rol_seleccionado);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {

    this.onClose.next();
    this.bsModalRef.hide();
  };




}