import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { UsuariosService } from 'src/app/servicios/usuarios.service';
import { EstructuraListaUsuarios } from 'src/app/models/entity/estructura-lista-usuarios';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busqueda-usuarios',
  templateUrl: './busqueda-usuarios.component.html',
  styleUrls: ['./busqueda-usuarios.component.css']
})
export class BusquedaUsuariosComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;

  public onClose: Subject<EstructuraListaUsuarios>;
  public lForm: FormGroup;
  public arregloUsuarios: Array<EstructuraListaUsuarios> = [];
  public arregloUsuariosPaginacion: Array<EstructuraListaUsuarios> = [];
  public loading = false;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private _ServiciosUsuarios: UsuariosService,
    public translate: TranslateService
  ) {

    this.lForm = this.formBuilder.group({
      login: [{ value: null, disabled: false }, Validators.required],
      nombreusuario: [{ value: null, disabled: false }, Validators.required]
    });
  }

  ngOnInit() {
    this.onClose = new Subject();

    this.loading = true;
    this._ServiciosUsuarios.listausuarios(this.hdgcodigo, this.esacodigo, this.cmecodigo,'','','',0, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.loading = false;
          this.arregloUsuarios = response;
          this.arregloUsuariosPaginacion = this.arregloUsuarios.slice(0, 8);
        } else {
          this.loading = false;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.servicios'));
      }

    );



  }


  buscar_usuarios_filtro(login: string, nombreusuario:string) {
    this.loading = true;

    this._ServiciosUsuarios.listausuarios(this.hdgcodigo, this.esacodigo, this.cmecodigo,login,nombreusuario,'',0, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.loading = false;
          this.arregloUsuarios = [];
          this.arregloUsuariosPaginacion=[]
          this.arregloUsuarios = response;
          this.arregloUsuariosPaginacion = this.arregloUsuarios.slice(0, 8);
        } else {
          this.loading = false;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.servicios'));
      }

    );
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }

  limpiar() {

    this.arregloUsuarios = [];
    this.arregloUsuariosPaginacion =[];
    this.lForm.reset();


  }


  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloUsuariosPaginacion = this.arregloUsuarios.slice(startItem, endItem);
  }

  onCerrar(usuario_seleccionado:EstructuraListaUsuarios ) {
    this.onClose.next(usuario_seleccionado);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.onClose.next();
    this.bsModalRef.hide();
  };




}
