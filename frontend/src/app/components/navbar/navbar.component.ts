import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { hesService } from 'src/app/servicios/hes.service';
import { Holding } from 'src/app/models/entity/Holding';
import { Empresas } from 'src/app/models/entity/Empresas';
import { Sucursal } from 'src/app/models/entity/Sucursal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../servicios/login.service';
import { Privilegios } from '../../models/entity/Privilegios';
import { Privilegio1 } from '../../models/entity/Privilegio1';
import { EstructuraRolesUsuarios } from 'src/app/models/entity/estructura-roles-usuarios';
import { UsuariosService } from 'src/app/servicios/usuarios.service';
import { RolesUsuarios } from 'src/app/models/entity/roles-usuario';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { interval } from 'rxjs';
import { DevuelveDatosUsuario } from 'src/app/models/entity/DevuelveDatosUsuario';
import { PaginationComponent } from 'ngx-bootstrap/pagination';
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';

import {TranslateService} from '@ngx-translate/core';
import { ParamConfigMulti } from 'src/app/models/entity/ParamConfigMulti';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;

  public lista_holdings: Holding[];
  public lista_empresas: Empresas[];
  public lista_sucursales: Sucursal[];
  public FormConexion: FormGroup;

  public FormUsuario: FormGroup;
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
  public usuario = environment.privilegios.usuario;
  public servidor: string;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public menu = true;
  public avisarSolicitud : boolean = false;
  public empresa : string = 'logoSonda.jpg';
  public icono : string = 'alarma4.gif';
  public mensaje : string = this.TranslateUtil('key.mensaje.solicitudes.pendientes.recepcionar')

  public fncCombo: boolean = false;
  public valInit : boolean;
  public arregloRolesUsuarioInit: Array<RolesUsuarios> = [];
  public tiempo_refresco = interval(300000);
  public login          : DevuelveDatosUsuario[];

  public Pendiente : boolean = false;

  public defaultIdioma : string = navigator.language;
  public idiomaSelected : string;
  public selectorIdioma : boolean = false;
  public paramConfigMulti : ParamConfigMulti;

  languageList = [
    { code: 'es-CL', label: 'Español-Chile' },
    { code: 'es-CO', label: 'Español-Colombia' },
    { code: 'en-US', label: 'English - United States' },
    { code: 'pt-BR', label: 'Portuguese - Brazil' },
  ];

  constructor(
    private _hesService: hesService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _loginuserService: LoginService,
    private _ServiciosUsuarios: UsuariosService,
    private _buscasolicitudService: SolicitudService,
    public translate : TranslateService,
  ) {

    router.events.subscribe((val) => {
      // see also
      // this.menu = true;
      // document.getElementById('side-menu').style.display = 'block';
      // this.onMenubtn();

    });

    this.FormConexion = this._formBuilder.group({
      f_hdgcodigo: [null],
      f_esacodigo: [null],
      f_cmecodigo: [null],
      f_usuario: [null],
      f_idioma: [null]
    });

    const priv = environment.privilegios.privilegio;
    this.menus = 'admin';

    translate.addLangs(['es-CL', 'es-CO', 'en-US', 'pt-BR']);
    if(localStorage.getItem('language')){
      translate.setDefaultLang(localStorage.getItem('language'));
      translate.use(localStorage.getItem('language'));
      this.idiomaSelected = localStorage.getItem('language')
    }else{
        translate.setDefaultLang(this.defaultIdioma);
        translate.use(this.defaultIdioma);
        localStorage.setItem('language', this.defaultIdioma);
    }
    //translate.setDefaultLang(this.defaultIdioma);
    //const browserLang = translate.getBrowserLang();
    //translate.use(browserLang.match(/Español-Chile|Español-Colombia/) ? browserLang : this.defaultIdioma);
  }

  changeLang(language: string) {
    this.translate.use(language)
    this.translate.setDefaultLang(language)
    localStorage.setItem('language', language)
    window.location.reload();
  }

  async ngOnInit() {   
    if(this.hdgcodigo == 2){
      this.translate.use('es-CO')
      this.translate.setDefaultLang('es-CO')
      localStorage.setItem('language', 'es-CO')
    }

    // try {
    // this.onMenubtn();

    // document.getElementById('side-menu').style.visibility = 'visible';
    this.servidor = environment.URLServiciosRest.ambiente;
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();



    this.FormConexion.controls.f_usuario.setValue(this.usuario);

    this.lista_holdings = await this._hesService.list(this.usuario, environment.URLServiciosRest.ambiente).toPromise();

    this.FormConexion.controls.f_hdgcodigo.setValue(this.hdgcodigo);

    this.lista_empresas = await this._hesService.BuscaEmpresa(this.hdgcodigo, this.usuario, this.servidor).toPromise();
    this.FormConexion.controls.f_esacodigo.setValue(this.esacodigo);

    this.lista_sucursales = await this._hesService.BuscaSucursal(this.hdgcodigo, this.esacodigo, this.usuario, this.servidor).toPromise();

    if (this.lista_sucursales.length == 0) {
      this.cmecodigo = this.lista_sucursales[0].cmecodigo;
      console.log(this.cmecodigo);
    }
    this.FormConexion.controls.f_cmecodigo.setValue(this.cmecodigo);

    this.FormConexion.controls.f_idioma.setValue(this.defaultIdioma);

    sessionStorage.setItem('cmecodigo', this.cmecodigo.toString());

    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;


    this.FormConexion.controls.f_usuario.setValue(this.usuario);

    const _ListaRolUsuario = new (EstructuraRolesUsuarios);
    _ListaRolUsuario.servidor = this.servidor;
    _ListaRolUsuario.hdgcodigo = this.hdgcodigo;
    _ListaRolUsuario.cmecodigo = this.cmecodigo;
    _ListaRolUsuario.esacodigo = this.esacodigo;
    _ListaRolUsuario.idusuario = Number(sessionStorage.getItem('id_usuario').toString());

    this._ServiciosUsuarios.buscarRolesUsuarios(_ListaRolUsuario).subscribe(
      response => {
        this.arregloRolesUsuarioInit = [];
        this.arregloRolesUsuarioInit = response;
        this.valInit = true;
        sessionStorage.setItem('intfin700', this.arregloRolesUsuarioInit[0].intfin700);
        sessionStorage.setItem('intconsultasaldo', this.arregloRolesUsuarioInit[0].intconsultasaldo);
        sessionStorage.setItem('intlegado', this.arregloRolesUsuarioInit[0].intlegado);
        sessionStorage.setItem('intsisalud', this.arregloRolesUsuarioInit[0].intsisalud);
        this.arregloRolesUsuarioInit.forEach(element => {
          if (element.rolid === 12000) {
            this.valInit = false;
          }
        });
        if (this.valInit) {
          this.FormConexion.controls.f_esacodigo.disable();
          this.FormConexion.controls.f_cmecodigo.disable();
          this.FormConexion.controls.f_idioma.disable();
        }
      },error => {
        console.log("Error :", error);
      })

      this.empresa = this.esacodigo + servidor + '.png';
    this.tiempo_refresco.subscribe((n) => {
      // this.consultaSolicitudes();
      this.consultaURL();
    })

    //Selector de idioma parametrico
    this._ServiciosUsuarios.configUserMulti(this.servidor).subscribe(
      response => {

        let json = JSON.stringify(response)
        json = json.replace('[', '');
        json = json.replace(']', '');

        let newParamConfigMulti = JSON.parse(json);
        this.selectorIdioma = newParamConfigMulti.paramSelectIdioma;
      },error => {
        console.log("Error configUserMulti :", error);
      });
  }


  BuscaEmpresa(hdgcodigo: number) {
    //  this.hdgcodigo.emit({ hdgcodigo: hdgcodigo });
    sessionStorage.setItem('hdgcodigo', hdgcodigo.toString());

    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;

    this._hesService.BuscaEmpresa(hdgcodigo, usuario, servidor).subscribe(
      response => {
        this.lista_empresas = response
      },
      error => {
        alert(error.message);
      }
    );
  }

  BuscaSucursal(hdgcodigo: number, esacodigo: number) {
    const Swal = require('sweetalert2');
    //  this.esacodigo.emit({ esacodigo: esacodigo });
    var esaCodigoAux = Number(sessionStorage.getItem('esacodigo'));
    var cmeCodigoAux = Number(sessionStorage.getItem('cmecodigo'));
    var id_usuario   = Number(sessionStorage.getItem('id_usuario'));

    sessionStorage.setItem('esacodigo', esacodigo.toString());

    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;
    this._hesService.BuscaSucursal(hdgcodigo, esacodigo, usuario, servidor).subscribe(
      response => {
        this.lista_sucursales = response
        if (this.lista_sucursales.length == 1) {
          this.cmecodigo = this.lista_sucursales[0].cmecodigo;
          this.FormConexion.controls.f_cmecodigo.setValue(this.cmecodigo);
          this.FormConexion.controls.f_idioma.setValue(this.defaultIdioma);
          sessionStorage.setItem('cmecodigo', this.cmecodigo.toString());
          this.cambioDatosUsuario(hdgcodigo,esacodigo,this.cmecodigo);
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.sucursal.codigo'))
      }
    );
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.title.cambiar'),
      text: this.TranslateUtil('key.mensaje.pregunta.cambiar.empresa.sin.guardar'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.si')
    }).then(async (result) => {
      if (result.dismiss != "cancel") {
        const _ListaRolUsuario = new (EstructuraRolesUsuarios);
        _ListaRolUsuario.servidor = this.servidor;
        _ListaRolUsuario.hdgcodigo = this.hdgcodigo;
        _ListaRolUsuario.cmecodigo = this.cmecodigo;
        _ListaRolUsuario.esacodigo = esacodigo;
        _ListaRolUsuario.idusuario = Number(sessionStorage.getItem('id_usuario').toString());
        this._ServiciosUsuarios.buscarRolesUsuarios(_ListaRolUsuario).subscribe(
          response => {
            this.arregloRolesUsuarioInit = [];
            this.arregloRolesUsuarioInit = response;
            this.valInit = true;
            this.arregloRolesUsuarioInit.forEach(element => {
              if (element.rolid === 12000) {
                this.valInit = false;
              }
            });
            if (this.valInit) {
              this.FormConexion.controls.f_esacodigo.disable();
              this.FormConexion.controls.f_cmecodigo.disable();
              this.FormConexion.controls.f_idioma.disable();
            }
          },error => {
            console.log("Error :", error);
          });
        this.empresa = esacodigo + servidor + '.png';
        await this.obtieneprivilegio(id_usuario,hdgcodigo, esacodigo, this.cmecodigo,usuario,servidor);
        this._hesService.CambiarEmpresa(this.lista_empresas.find(e => e.esacodigo === esacodigo));
        this.router.navigate(['home']);
      }else{
        sessionStorage.setItem('esacodigo', esaCodigoAux.toString());
        sessionStorage.setItem('cmecodigo', cmeCodigoAux.toString());

        this.FormConexion.controls.f_esacodigo.setValue(esaCodigoAux);
        this._hesService.BuscaSucursal(hdgcodigo, esaCodigoAux, usuario, servidor).subscribe(
          response => {
            this.lista_sucursales = response
            if (this.lista_sucursales.length == 1) {
              this.cmecodigo = this.lista_sucursales[0].cmecodigo;
              this.FormConexion.controls.f_cmecodigo.setValue(cmeCodigoAux);
              this.FormConexion.controls.f_idioma.setValue(this.defaultIdioma);
            }
          },
          error => {
            alert(this.TranslateUtil('key.mensaje.error.buscar.sucursal.codigo'))
          }
        );
      }
    });


  }

  sucursal(cmecodigo: number) {
    const Swal = require('sweetalert2');
    //   this.cmecodigo.emit({ cmecodigo: cmecodigo });
    var esaCodigoAux = Number(sessionStorage.getItem('esacodigo'));
    var cmeCodigoAux = Number(sessionStorage.getItem('cmecodigo'));
    var hdgCodigoAux = Number(sessionStorage.getItem('hdgcodigo'));
    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;

    Swal.fire({
      title: this.TranslateUtil('key.mensaje.title.cambiar'),
      text: this.TranslateUtil('key.mensaje.pregunta.cambiar.empresa.sin.guardar'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.si')
    }).then((result) => {
      if (result.dismiss != "cancel") {
        sessionStorage.setItem('cmecodigo', cmecodigo.toString());
        this.route.paramMap.subscribe(param => {
          this.router.navigate(['home']);
        })
      }else{
        sessionStorage.setItem('cmecodigo', cmeCodigoAux.toString());

        this.FormConexion.controls.f_esacodigo.setValue(esaCodigoAux);
        this._hesService.BuscaSucursal(hdgCodigoAux, esaCodigoAux, usuario, servidor).subscribe(
          response => {
            this.lista_sucursales = response
            if (this.lista_sucursales.length == 1) {
              this.cmecodigo = this.lista_sucursales[0].cmecodigo;
              this.FormConexion.controls.f_cmecodigo.setValue(cmeCodigoAux);
              this.FormConexion.controls.f_idioma.setValue(this.defaultIdioma);
            }
          },
          error => {
            this.TranslateUtil('key.mensaje.error.buscar.sucursal.codigo')
          }
        );
      }
    });
  }


  CierreSesion() {
    this._loginuserService.logout();
    this.router.navigate(['/login']);
  }

  onMenubtn() {

  }

  async consultaSolicitudes(){
    this.Pendiente = false;
    const response = await this._buscasolicitudService.BuscarSolicitudesPendiente(this.servidor,this.hdgcodigo,this.esacodigo,this.cmecodigo,this.usuario).toPromise();
    if(response != null){
      this.Pendiente = response.mensaje.estado;
    } else {
      this.Pendiente = false;
    }
  }

  async consultaURL(){
    // si url !== usoActual{
    //   actualizo las variables de session y refresco la pagina...
    // }
  }

  cambioDatosUsuario(hdgcodigo: number, esacodigo: number, cmecodigo :number){
    var datosusuario = new DevuelveDatosUsuario();
    datosusuario = JSON.parse(sessionStorage.getItem('Login'));
    datosusuario[0].hdgcodigo = hdgcodigo;
    datosusuario[0].esacodigo = esacodigo;
    datosusuario[0].cmecodigo = cmecodigo;

    sessionStorage.setItem('Login',JSON.stringify(datosusuario));
  }

  async obtieneprivilegio(id_usuario:number,hdgcodigo:number, esacodigo:number, cmecodigo:number,usuario: string,servidor: string){
    try {
      await this._loginuserService.obtenerPrivilegios(id_usuario,hdgcodigo,esacodigo,cmecodigo,usuario,servidor);
    } catch (error) {
      console.log(error);
      alert(this.TranslateUtil('key.mensaje.error.buscar.usuario'))
    }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
