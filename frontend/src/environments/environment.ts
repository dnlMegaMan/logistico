import { Environment } from './environment.types';

export const environment: Environment = {
  production: false,
  URLServiciosRest: {
    fechaVersion: 'DESARROLLO',
    fechaVersionGo: '23.10.18.1',
    fechaVersionAngular: '23.10.18.1',
    ambiente: 'DESARROLLO',
    // fechaVersionGo: '23.08.25.3',
    // fechaVersionAngular: '23.08.25.3',
    // ambiente: 'PRODUCCION',
    color: 'rgb(6, 88, 250)',
    URLConexion: 'http://localhost:8091', // logistico
    URLValidate: 'http://localhost:8092', //TOKEN
    URLOrdenCompra: 'http://localhost:8093', // Orden de Compra
    URLReiniciaServicios: 'http://localhost:8094', // Reinicia servicios
  },
  privilegios: {
    privilegio: null,
    usuario: null,
    holding: null,
    empresa: null,
    sucursal: null,
  },
};
