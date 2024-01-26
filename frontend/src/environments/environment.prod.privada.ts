import { Environment } from './environment.types';

export const environment: Environment = {
  production: true,
  URLServiciosRest: {
    fechaVersion: '23.10.18.1',
    fechaVersionGo: '23.10.18.1',
    fechaVersionAngular: '23.10.18.1',
    ambiente: 'PRODUCCION',
    color: 'rgb(109, 175, 175)',
    URLConexion: 'http://10.188.185.10:8091',
    URLValidate: 'http://10.188.185.10:8092', //TOKEN
    URLOrdenCompra: 'http://10.188.185.10:8093', // Orden de Compra
    URLReiniciaServicios: 'http://10.188.185.10:8094', // Reinicia servicios
  },
  privilegios: {
    privilegio: null,
    usuario: null,
    holding: null,
    empresa: null,
    sucursal: null,
  },
};
