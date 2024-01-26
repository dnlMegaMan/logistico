import { Environment } from './environment.types';

export const environment: Environment = {
  production: true,
  URLServiciosRest: {
    fechaVersion: 'PRODUCTO-QA',
    fechaVersionGo: '23.10.18.1',
    fechaVersionAngular: '23.10.18.1',
    ambiente: 'TESTING_CLOUD',
    color: 'rgb(6, 88, 250)',
    URLConexion: 'http://152.70.143.61:8091',
    URLValidate: 'http://152.70.143.61:8092', //TOKEN
    URLOrdenCompra: 'http://152.70.143.61:8093', // Orden de Compra
    URLReiniciaServicios: 'http://152.70.143.61:8094', // Reinicia servicios
  },
  privilegios: {
    privilegio: null,
    usuario: null,
    holding: null,
    empresa: null,
    sucursal: null,
  },
};
