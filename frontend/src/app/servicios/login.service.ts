import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DevuelveDatosUsuario } from '../models/entity/DevuelveDatosUsuario';
import { Privilegios } from '../models/entity/Privilegios';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly urlusuario = `${environment.URLServiciosRest.URLConexion}/validausuario`;
  private readonly urlprivilegiousuario = `${environment.URLServiciosRest.URLConexion}/obtenerprivilegios`;
  private readonly urlvalidatoken = `${environment.URLServiciosRest.URLValidate}/validate`;

  private refrescarTokenTimerId: NodeJS.Timer | null = null;
  private readonly estadoLogin$ = new BehaviorSubject<boolean>(false);

  /** 
   * Los elementos en el local storage que se restauran al sessionStorage y que se eliminan de 
   * ambos al momento del logout 
   */
  private readonly itemsAutenticacion: string[] = [
    'uilogistico',
    'Login',
    'hdgcodigo',
    'esacodigo',
    'cmecodigo',
    'Usuario',
    'id_usuario',
    'permisoslogistico',
  ];

  constructor(private http: HttpClient) {
    /* Aca va a copiar los datos de la sesion del localStorage al sessionStorage por motivos que se
     * explican en el metodo `login()`.
     */
    const uilogistico = JSON.parse(localStorage.getItem('uilogistico'));
    if (uilogistico && this.tokenNoHaExpirado(uilogistico.token)) {
      for (const item of this.itemsAutenticacion) {
        sessionStorage.setItem(item, localStorage.getItem(item));
      }

      environment.privilegios.usuario = localStorage.getItem('Usuario');
      environment.privilegios.holding = Number(localStorage.getItem('hdgcodigo'));
      environment.privilegios.empresa = Number(localStorage.getItem('esacodigo'));
      environment.privilegios.sucursal = Number(localStorage.getItem('cmecodigo'));

      // INICIAR CICLO DE REINICIO DE TOKEN AUTOMATICO
      this.setTimeoutParaRefrescarToken(uilogistico.token);

      this.estadoLogin$.next(true);
    } else {
      this.logout();
    }
  }

  private tokenNoHaExpirado(token: string) {
    const decodedToken = this.getDecodedAccessToken(token);

    /** Se multiplica por 1000 porque la fecha de expiracion viene en segundos */
    return decodedToken.exp * 1000 > Date.now();
  }

  /**
   * @returns 
   * Observable que emite `true` cuando el usuario esta logueado y `false` en caso contrario.
   */
  estadoLogin(): Observable<boolean> {
    return this.estadoLogin$.asObservable();
  }

  async login(usuario: string, password: string): Promise<void> {
    // VERIFICAR QUE USUARIO EXISTE
    const loginResponse = await this.buscarUsuario(usuario.toUpperCase(), password);

    if (!loginResponse || loginResponse.length === 0) {
      throw new Error('Usuario no existe o no autorizado !!\n Favor intentar nuevamente...');
    }

    // GUARDAR DATOS DEL USUARIO
    const login = loginResponse;
    const uilogistico = {
      token: loginResponse[0].token,
    };

    sessionStorage.setItem('uilogistico', JSON.stringify(uilogistico));
    sessionStorage.setItem('Login', JSON.stringify(login));
    sessionStorage.setItem('hdgcodigo', loginResponse[0].hdgcodigo.toString());
    sessionStorage.setItem('esacodigo', loginResponse[0].esacodigo.toString());
    sessionStorage.setItem('cmecodigo', loginResponse[0].cmecodigo.toString());
    sessionStorage.setItem('Usuario', usuario.toUpperCase());
    sessionStorage.setItem('id_usuario', loginResponse[0].userid.toString());

    /*
     * Si bien la aplicación saca los datos del sessionStorage en las pantallas, se copian los datos
     * localStorage para que no se pierdan los datos de la sesion al abrir la aplicación en una
     * nueva pestaña, ya que el sesionStorage expira al cerrar la pestaña, mientras que el
     * localStorage no. Los datos se restauran del localStorage al sessionStorage en el constructor.
     * Fuente: https://developer.mozilla.org/es/docs/Web/API/Window/sessionStorage
     */
    localStorage.setItem('uilogistico', JSON.stringify(uilogistico));
    localStorage.setItem('Login', JSON.stringify(login));
    localStorage.setItem('hdgcodigo', loginResponse[0].hdgcodigo.toString());
    localStorage.setItem('esacodigo', loginResponse[0].esacodigo.toString());
    localStorage.setItem('cmecodigo', loginResponse[0].cmecodigo.toString());
    localStorage.setItem('Usuario', usuario.toUpperCase());
    localStorage.setItem('id_usuario', loginResponse[0].userid.toString());

    // OBTENER LOS PERMISOS(O PRIVILEGIOS)
    await this.obtenerPrivilegios(
      loginResponse[0].userid,
      loginResponse[0].hdgcodigo,
      loginResponse[0].esacodigo,
      loginResponse[0].cmecodigo,
      JSON.stringify(login),
      environment.URLServiciosRest.ambiente,
    );

    // INICIAR CICLO DE REINICIO DE TOKEN AUTOMATICO
    this.setTimeoutParaRefrescarToken(uilogistico.token);

    // INDICAR QUE ESTA LOGUEADO
    this.estadoLogin$.next(true);
  }

  private buscarUsuario(usuario: string, clave: string): Promise<DevuelveDatosUsuario[]> {
    return this.http
      .post<DevuelveDatosUsuario[]>(this.urlusuario, {
        usuario,
        clave,
        servidor: environment.URLServiciosRest.ambiente,
      })
      .toPromise();
  }

  private setTimeoutParaRefrescarToken(token: string) {
    this.refrescarTokenTimerId = setTimeout(() => {
      this.refrescarToken(token).then((nuevoToken) => {
        this.setTimeoutParaRefrescarToken(nuevoToken);
      });
    }, this.calcularTiempoParaRefrescoDelToken(token));
  }

  private getDecodedAccessToken(token: string): any {
    return jwt_decode(token);
  }

  private calcularTiempoParaRefrescoDelToken(token: string) {
    /* El campo `exp` del token es la fecha de expiracion del token en "segundos", por eso se
     * multiplica por 1000. Luego se calcula en cuanto tiempo mas expira el token y se da un margen
     * de 30 segundos para obtener el nuevo token sin que expire el anterior. Los 30 segundos
     * (valor dado al ojo).
     */
    const decodedToken = this.getDecodedAccessToken(token);

    return decodedToken.exp * 1000 - Date.now() - 30 * 1000;
  }

  private async refrescarToken(token: string) {
    const uilogistico = await this.http
      .post<{ token: string }>(
        this.urlvalidatoken,
        {
          name: 'LOGISTICO03',
          password: ' ',
          role: ' ',
        },
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: token,
          }),
        },
      )
      .toPromise();

    localStorage.setItem('uilogistico', JSON.stringify(uilogistico));
    sessionStorage.setItem('uilogistico', JSON.stringify(uilogistico));

    return uilogistico.token;
  }

  private desactivarRefrescoAutomaticoDeToken() {
    if (this.refrescarTokenTimerId !== null) {
      clearTimeout(this.refrescarTokenTimerId);
    }
  }

  async obtenerPrivilegios(
    idusuario: number,
    hdgcodigo: number,
    esacodigo: number,
    cmecodigo: number,
    usuario: string,
    servidor: string,
  ): Promise<void> {
    const privilegios = await this.http
      .post<Privilegios[]>(this.urlprivilegiousuario, {
        idusuario: idusuario,
        hdgcodigo: hdgcodigo,
        esacodigo: esacodigo,
        cmecodigo: cmecodigo,
        usuario: usuario,
        servidor: servidor,
      })
      .toPromise();

    localStorage.setItem('permisoslogistico', JSON.stringify(privilegios));
    sessionStorage.setItem('permisoslogistico', JSON.stringify(privilegios));
  }

  /**
   * @returns
   * El JWT generado al momento del login o `null` si es que no hay un token guardado.
   *
   * > NO usar este metodo para ver si el usuario esta logueado o no, para eso usar `estadoLogin()`.
   */
  authToken(): string | null {
    const uilogistico = localStorage.getItem('uilogistico');

    return uilogistico ? JSON.parse(uilogistico).token : null;
  }

  logout(): void {
    // Eliminar lo relacionado a la autenticacion
    for (const item of this.itemsAutenticacion) {
      sessionStorage.removeItem(item);
      localStorage.removeItem(item);
    }

    // Desactivar el refresco de token
    this.desactivarRefrescoAutomaticoDeToken();

    // Notificar
    this.estadoLogin$.next(false);
  }
}
