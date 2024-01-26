import { Environment } from './environment.types';

export const environment: Environment = {
  production: true,
  URLServiciosRest: {
    fechaVersion: '23.10.18.1',
    fechaVersionGo: '23.10.18.1',
    fechaVersionAngular: '23.10.18.1',
    ambiente: 'TESTING',
    color: 'rgb(109, 175, 175)',
    URLConexion: 'http://10.188.182.77:8091',
    URLValidate: 'http://10.188.182.77:8092', //TOKEN
    URLOrdenCompra: 'http://10.188.182.77:8093', // Orden de Compra
    URLReiniciaServicios: 'http://10.188.182.77:8094', // Reinicia servicios
  },
  privilegios: {
    privilegio: null,
    usuario: null,
    holding: null,
    empresa: null,
    sucursal: null,
  },
};
