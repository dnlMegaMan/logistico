import { SolicitudesCarga } from './../models/entity/busquedacuentas/SolicitudesCarga';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Busquedacuentas } from '../models/entity/busquedacuentas/BusquedaCuentas';
import { CargoFarmacia } from '../models/entity/busquedacuentas/CargoFarmacia';
import { BusquedaPacientes } from '../models/entity/busquedacuentas/BusquedaPacientes';
import { Resultadoctas } from '../models/entity/busquedacuentas/ResultadoCtas';

@Injectable({
  providedIn: 'root'
})
export class BusquedacuentaService {

    public urlbuscactas: string = sessionStorage.getItem('enlace').toString().concat('/consultaCuenta');
    public urlbuscactaspac: string = sessionStorage.getItem('enlace').toString().concat('/consultaCuentaPaciente');
    public urlbuscactasmas: string = sessionStorage.getItem('enlace').toString().concat('/consultaCuentaMasivo');
    public urlcargoctas: string = sessionStorage.getItem('enlace').toString().concat('/consultaCargoCuenta');
    public urlbuscapacientes: string = sessionStorage.getItem('enlace').toString().concat('/consultaPaciente');
    public urlsolicitudes: string = sessionStorage.getItem('enlace').toString().concat('/consultaSolicitudPaciente');

    constructor(public _http: HttpClient) {

    }

    /**  */
    // consultaCuenta(servidor:string, cmecodigo:number, cliid: string, fechadesde:string, fechahasta:string,
    //   folio:string, ficha:string, nrosolicitud:string, nroreceta:string, codproducto: string,
    //   producto:string):Observable<Busquedacuentas[]> {
    //     return this._http.post<Busquedacuentas[]>(this.urlbuscactas, {
    //       'servidor': servidor,
    //       'cmecodigo': cmecodigo,
    //       'cliid': cliid,
    //       'fechadesde': fechadesde,
    //       'fechahasta': fechahasta,
    //       'folio': folio,
    //       'ficha': ficha,
    //       'nrosolicitud': nrosolicitud,
    //       'nroreceta': nroreceta,
    //       'codproducto': codproducto,
    //       'producto': producto
    //     });
    //   }
    consultaCuenta(servidor:string, hdgcodigo:number, esacodigo: number, cmecodigo:number, fechadesde:string, fechahasta:string,
      rut: string, nombre:string, paterno:string, materno:string, folio:string, ficha:string, nrosolicitud:string, nroreceta:string,
      codproducto: string, producto:string):Observable<any[]> {
        return this._http.post<any[]>(this.urlbuscactas, {
          "servidor": servidor,
          "hdgcodigo": hdgcodigo,
          "esacodigo": esacodigo,
          "cmecodigo": cmecodigo,
          "fechadesde": fechadesde,
          "fechahasta": fechahasta,
          "rut": rut,
          "nombre": nombre,
          "paterno": paterno,
          "materno": materno,
          "folio": folio,
          "ficha": ficha,
          "nrosolicitud": nrosolicitud,
          "nroreceta": nroreceta,
          "codproducto": codproducto,
          "producto": producto
        });
      }
    /**  */
    consultaCuentaPaciente(servidor:string, hdgcodigo:number, esacodigo: number, cmecodigo:number, fechadesde:string, fechahasta:string,
      rut: string, nombre:string, paterno:string, materno:string, folio:string, ficha:string, nrosolicitud:string, nroreceta:string,
      codproducto: string, producto:string):Observable<Busquedacuentas[]> {
        return this._http.post<Busquedacuentas[]>(this.urlbuscactaspac, {
          "servidor": servidor,
          "hdgcodigo": hdgcodigo,
          "esacodigo": esacodigo,
          "cmecodigo": cmecodigo,
          "fechadesde": fechadesde,
          "fechahasta": fechahasta,
          "rut": rut,
          "nombre": nombre,
          "paterno": paterno,
          "materno": materno,
          "folio": folio,
          "ficha": ficha,
          "nrosolicitud": nrosolicitud,
          "nroreceta": nroreceta,
          "codproducto": codproducto,
          "producto": producto
        });
      }

      consultaCuentaMasivo(servidor:string, hdgcodigo:number, esacodigo: number, cmecodigo:number, fechadesde:string, fechahasta:string,
        rut: string, nombre:string, paterno:string, materno:string, folio:string, ficha:string, nrosolicitud:string, nroreceta:string,
        codproducto: string, producto:string):Observable<Resultadoctas[]> {
          return this._http.post<Resultadoctas[]>(this.urlbuscactasmas, {
            "servidor": servidor,
            "hdgcodigo": hdgcodigo,
            "esacodigo": esacodigo,
            "cmecodigo": cmecodigo,
            "fechadesde": fechadesde,
            "fechahasta": fechahasta,
            "rut": rut,
            "nombre": nombre,
            "paterno": paterno,
            "materno": materno,
            "folio": folio,
            "ficha": ficha,
            "nrosolicitud": nrosolicitud,
            "nroreceta": nroreceta,
            "codproducto": codproducto,
            "producto": producto
          });
        }

      consultaCargoCuenta(servidor:string, hdgcodigo: number, esacodigo:number, cmecodigo:number, cuentaid:string,
         codproducto: string, producto:string, nrosolicitud:string,fechadesde: string, fechahasta: string):Observable<CargoFarmacia[]> {
          return this._http.post<CargoFarmacia[]>(this.urlcargoctas, {
            'servidor': servidor,
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'cuentaid': cuentaid,
            'codproducto': codproducto,
            'producto': producto,
            'nrosolicitud': nrosolicitud,
            'fechadesde': fechadesde,
            'fechahasta': fechahasta
          });
        }

    consultaPaciente(servidor:string, cmecodigo:number, fechadesde:string, fechahasta:string,
      rut:string, nombre:string,paterno:string, materno: string):Observable<BusquedaPacientes[]> {
        return this._http.post<BusquedaPacientes[]>(this.urlbuscapacientes, {
          'servidor': servidor,
          'cmecodigo': cmecodigo,
          'fechadesde': fechadesde,
          'fechahasta': fechahasta,
          'rut': rut,
          'nombre': nombre,
          'paterno': paterno,
          'materno': materno
        });
      }

      consultaSolicitudPaciente(servidor:string, hdgcodigo: number, esacodigo:number, cmecodigo:number, cuentaid:string,
        estid: string, numreceta:string, codproducto:string, nrosolicitud:string, fechadesde: string, fechahasta: string):Observable<any[]> {
         return this._http.post<any[]>(this.urlsolicitudes, {
           'servidor': servidor,
           'hdgcodigo': hdgcodigo,
           'esacodigo': esacodigo,
           'cmecodigo': cmecodigo,
           'cuentaid': cuentaid,
           'estid': estid,
           'numreceta': numreceta,
           'meincodmei': codproducto,
           'nrosolicitud': nrosolicitud,
           'fechadesde': fechadesde,
           'fechahasta': fechahasta
         });
       }

}
