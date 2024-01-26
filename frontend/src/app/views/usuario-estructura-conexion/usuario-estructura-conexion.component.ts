import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { hesService } from 'src/app/servicios/hes.service';
import { Holding } from 'src/app/models/entity/Holding';
import { Empresas } from 'src/app/models/entity/Empresas';
import { Sucursal } from 'src/app/models/entity/Sucursal';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-usuario-estructura-conexion',
  templateUrl: './usuario-estructura-conexion.component.html',
  styleUrls: ['./usuario-estructura-conexion.component.css']
})
export class UsuarioEstructuraConexionComponent implements OnInit {
  public holdings: Holding[];
  public empresas: Empresas[];
  public sucursales: Sucursal[];
  public FormConexion: FormGroup;

  @Output() hdgcodigo = new EventEmitter();
  @Output() esacodigo = new EventEmitter();
  @Output() cmecodigo = new EventEmitter();



  constructor(
    private _hesService: hesService,
    private _formBuilder: FormBuilder,

  ) {

    this.FormConexion = this._formBuilder.group({

      hdgcodigo: [null],
      esacodigo: [null],
      cmecodigo: [null],


    })

  }



  async ngOnInit() {
    try {
      var servidor = environment.URLServiciosRest.ambiente;
      var usuario = environment.privilegios.usuario;

      this.holdings = await this._hesService.list(usuario, environment.URLServiciosRest.ambiente).toPromise();

      let hdgcodigo: number = 0;
      if (sessionStorage.getItem('hdgcodigo') !== null) {
        hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
        this.FormConexion.controls.hdgcodigo.setValue(hdgcodigo);
        this.hdgcodigo.emit({ hdgcodigo: hdgcodigo });

        this.empresas = await this._hesService.BuscaEmpresa(hdgcodigo, usuario, servidor).toPromise();
      }

      let esacodigo: number = 0;
      if (sessionStorage.getItem('esacodigo') !== null) {
        esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
        this.FormConexion.controls.esacodigo.setValue(esacodigo);
        this.esacodigo.emit({ esacodigo: esacodigo });

        this.sucursales = await this._hesService.BuscaSucursal(hdgcodigo, esacodigo,usuario, servidor).toPromise();
      }

      let cmecodigo: number = 0;
      if (sessionStorage.getItem('cmecodigo') !== null) {
        cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
        this.FormConexion.controls.cmecodigo.setValue(cmecodigo);
        this.cmecodigo.emit({ cmecodigo: cmecodigo });
      }




    } catch (err) {
      console.log(err.error);
    }

  }

  compare_hdgcodigo(c1: any, c2: any): boolean {
    return c1 && c2 ? c1 === c2 : c1 === c2;
  }

  compare_esacodigo(c1: any, c2: any): boolean {
    return c1 && c2 ? c1 === c2 : c1 === c2;
  }

  compare_cmecodigo(c1: any, c2: any): boolean {
    return c1 && c2 ? c1 === c2 : c1 === c2;
  }



  BuscaEmpresa(hdgcodigo: number) {
    this.hdgcodigo.emit({ hdgcodigo: hdgcodigo });
    sessionStorage.setItem('hdgcodigo', hdgcodigo.toString());

    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;

    this._hesService.BuscaEmpresa(hdgcodigo, usuario, servidor).subscribe(
      response => {
        if (response != null) {
          this.empresas = response;
        }
      },
      error => {
        console.log(error);
        alert("Error al Buscar Empresa por código")
      }
    );
  }

  BuscaSucursal(hdgcodigo: number, esacodigo: number) {

    this.esacodigo.emit({ esacodigo: esacodigo });
    sessionStorage.setItem('esacodigo', esacodigo.toString());

    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;
    this._hesService.BuscaSucursal(hdgcodigo, esacodigo, usuario, servidor).subscribe(
      response => {
        if (response != null) {
          this.sucursales = response;
        }
      },
      error => {
        alert("Error al Buscar Sucursal por código")
      }
    );
  }

  sucursal(cmecodigo: number) {
    this.cmecodigo.emit({ cmecodigo: cmecodigo });
    sessionStorage.setItem('cmecodigo', cmecodigo.toString());

  }
}

