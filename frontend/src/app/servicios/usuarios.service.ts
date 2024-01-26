import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { EstructuraListaUsuarios } from '../models/entity/estructura-lista-usuarios';
import { AccesosUsuario } from '../models/entity/accesos-usuario';
import { Roles } from '../models/entity/Roles';
import { RolesUsuarios } from '../models/entity/roles-usuario';
import { EstructuraRolesUsuarios } from '../models/entity/estructura-roles-usuarios';
import { EstructuraCentroCostoUsuario } from '../models/entity/estructura-centro-costo-usuario';
import { ParamConfigMulti } from '../models/entity/ParamConfigMulti';


@Injectable({
  providedIn: 'root'

  
})
export class UsuariosService {

  private target_url = sessionStorage.getItem('enlace').toString().concat('/buscausuarios');
  private url_buscarAccesosUsuarios = sessionStorage.getItem('enlace').toString().concat('/buscarAccesosUsuarios');
  private url_buscarRoles = sessionStorage.getItem('enlace').toString().concat('/buscarRoles');
  private url_buscarRolesUsuarios = sessionStorage.getItem('enlace').toString().concat('/buscarRolesUsuarios');
  private url_guardarRolesUsuarios = sessionStorage.getItem('enlace').toString().concat('/guardarRolesUsuarios');
  private url_buscarCentroCostoUsuarios = sessionStorage.getItem('enlace').toString().concat('/buscarCentroCostoUsuarios');
  private url_guardarCentroCostoUsuarios = sessionStorage.getItem('enlace').toString().concat('/guardarCentroCostoUsuarios');
  private url_configUserMulti= sessionStorage.getItem('enlace').toString().concat('/configUserMulti');

  

  constructor(private httpClient: HttpClient) {
 }
 


guardarCentroCostoUsuarios(_EstructuraCentroCostoUsuario:EstructuraCentroCostoUsuario): Observable<any> {
  return this.httpClient.post(this.url_guardarCentroCostoUsuarios,_EstructuraCentroCostoUsuario);
}


buscarCentroCostoUsuarios(_CentroCostoUsuario:EstructuraCentroCostoUsuario): Observable<any> {
  return this.httpClient.post(this.url_buscarCentroCostoUsuarios,_CentroCostoUsuario);
}

 guardarRolesUsuarios(_EstructuraRolesUsuarios:EstructuraRolesUsuarios): Observable<any> {
  return this.httpClient.post(this.url_guardarRolesUsuarios,_EstructuraRolesUsuarios);
}


buscarAccesosUsuarios(_AccesosUsuario:AccesosUsuario): Observable<any> {
  return this.httpClient.post(this.url_buscarAccesosUsuarios,_AccesosUsuario);
}

buscarRoles(_Roles:Roles): Observable<any> {
  return this.httpClient.post(this.url_buscarRoles,_Roles);
}

buscarRolesUsuarios(_Roles:RolesUsuarios): Observable<any> {
  return this.httpClient.post(this.url_buscarRolesUsuarios,_Roles);
}


  public listausuarios(hdgcodigo:number, esacodigo:number, cmecodigo:number,usercode:string,username:string,userrut:string,userid:number , usuario: string,servidor:string): Observable<EstructuraListaUsuarios[]> {
    return this.httpClient.post<EstructuraListaUsuarios[]>(this.target_url,{
      'hdgcodigo':hdgcodigo,
      'esacodigo':esacodigo,
      'cmecodigo':cmecodigo,
      'usercode':usercode,
      'username':username,
      'userrut':userrut,
      'userid': userid,
      'usuario' : usuario,
      'servidor': servidor
    });
  }

  configUserMulti(servidor: string): Observable<any> {
    return this.httpClient.post<AccesosUsuario>(this.url_configUserMulti, {
      'servidor': servidor
    });
  }

}