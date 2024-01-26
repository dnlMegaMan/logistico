import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../servicios/login.service';
import { environment } from 'src/environments/environment';
import { Privilegios } from '../models/entity/Privilegios';
import { Privilegio1 } from '../models/entity/Privilegio1';
import { Permisosusuario } from '../permisos/permisosusuario';// obtiene permisos previamente guardados
//import { Roles } from '../models/entity/Roles';
import {TranslateService} from '@ngx-translate/core';

declare var $: any;

@Component({
  selector: 'app-menuprincipal',
  templateUrl: './menuprincipal.component.html',
  styleUrls: ['./menuprincipal.component.css']
})
export class MenuprincipalComponent implements OnInit {
  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormUsuario         : FormGroup;
  public permitebuscar: boolean = true;

  public priv3: Privilegio1[] = [];
  public priv: Privilegio1[] = [];
  public priv4: Array<Privilegio1> = [];
  public priv5: Privilegio1[] = [];
  public priv2: Array<Privilegios> = [];
  public menus2: boolean = false;
  public parametro: boolean = false;
  public informes: boolean = false;
  public infconsumoporbodegas: boolean = false;
  public infalfabeticoproductos: boolean = false;
  public menus: string;
  public privilegios1: Privilegios = new Privilegios();
  public variables: Array<string> = [];
  public privilegios: Privilegios[];
  public privilegiototal: Privilegio1[] = [];

  constructor(
    private router: Router,
    private formBuilder      : FormBuilder,
    private _loginuserService: LoginService,
    public translate: TranslateService
  ) {
    this.FormUsuario = this.formBuilder.group({
       
      usuario : [null]
    });
    this.menus = 'admin';

  }

  ngOnInit() {
    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;
    this.usuarios();
  }

  ngAfterViewInit() {

  }


  CierreSesion() {
    this.router.navigate(['login']);
  }

  usuarios() {
    this.FormUsuario.get('usuario').setValue(environment.privilegios.usuario);
  }

};