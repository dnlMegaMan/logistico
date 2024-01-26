import { Environment } from './environment.types';

export const environment: Environment = {
  production: true,
  URLServiciosRest: {
    fechaVersion: 'PRODUCTO',
    fechaVersionGo: '23.10.18.1',
    fechaVersionAngular: '23.10.18.1',
    ambiente: 'DESARROLLO',
    color: 'rgb(6, 88, 250)',
    URLConexion: 'http://10.153.106.88:8091',
    URLValidate: 'http://10.153.106.88:8092', //TOKEN
    URLOrdenCompra: 'http://10.153.106.88:8093', // Orden de Compra
    URLReiniciaServicios: 'http://10.153.106.88:8094', // Reinicia servicios
  },
  privilegios: {
    privilegio: null,
    usuario: null,
    holding: null,
    empresa: null,
    sucursal: null,
  },
};
