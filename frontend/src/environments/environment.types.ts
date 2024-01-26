export interface Environment {
  production: boolean;
  URLServiciosRest: {
    fechaVersion: string;
    fechaVersionGo: string;
    fechaVersionAngular: string;
    ambiente: string;
    color: string;
    URLConexion: string;
    URLValidate: string;
    URLOrdenCompra: string;
    URLReiniciaServicios: string;
  },
  privilegios: {
    privilegio: any,
    usuario: any,
    holding: any,
    empresa: any,
    sucursal: any,
  },
}