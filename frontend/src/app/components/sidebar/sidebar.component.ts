import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { environment } from '../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConsultapacienteComponent } from '../../views/busquedacuentas/consultapaciente/consultapaciente.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  public modelopermisos: Permisosusuario = new Permisosusuario();
  //public usuario = environment.privilegios.usuario;
  public usuario = null;
  private _BSModalRef: BsModalRef;
  // arrpermisos: number[];
  // btnMovbodega: boolean = false;
//creadispensasolpac
  constructor(
    private router: Router,
    public _BsModalService: BsModalService
  ) {
    this.usuario = sessionStorage.getItem('Usuario').toString();
   }

  ngOnInit() {
    document.getElementById('side-menu').style.display = 'block';
  }

  doSomething() { }

  LlamaPantallaPlantillas(in_tipo: string){
    this.router.navigate(['plantillas',in_tipo]);
  }

  onSolpaciente() {
    sessionStorage.removeItem('detallecargo');
    this.router.navigate(['solicitudpaciente']);
  }

  busquedaPacientes() {
    this._BSModalRef = this._BsModalService.show(ConsultapacienteComponent, this.setModalPaciente());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) {
        return;
      } else {
        // Do something
      }
    });
  }

  setModalPaciente() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl'
    };
    return dtModal;
  }

  onSolRecetaAnulada() {
    this.router.navigate(['recetaanulada']);
  }
}
