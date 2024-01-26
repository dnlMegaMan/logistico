import { NavItem } from '../../nav-item';

export class Menu{

    constructor(){}

  navItems: NavItem[] = [
    /** menu Monitor */
    {
      displayName: 'key.title.menu.monitor',
      iconName: 'keyboard_arrow_right',
      route: 'monitorejecutivo'
    },
    /** menu Productos */
    {
      displayName: 'key.productos',
      iconName: 'keyboard_arrow_right',
      route: 'producto',
      children: [
        {
          displayName: 'key.mantencion.articulos',
          iconName: 'keyboard_arrow_right',
          route: 'mantencionarticulos'
        }]
    },

    {
      displayName: 'key.title.administacion.inventario',
      iconName: 'keyboard_arrow_right',
      route: 'inventarios',
      children: [
        {
          displayName: 'key.title.gestion.periodo.inventario',
          iconName: 'keyboard_arrow_right',
          route: 'aperturacierreinventario',
        },
        {
          displayName: 'key.title.inventario.bloquear.bodegas',
          iconName: 'keyboard_arrow_right',
          route: 'bloquearbodegasinventario',
        },
        {
          displayName: 'key.inventarios.listado',
          iconName: 'keyboard_arrow_right',
          route: 'informeconteolistainventario',
        },
        {
          displayName: 'key.genera.inventario.sistema',
          iconName: 'keyboard_arrow_right',
          route: 'inventariogenera',
        },
        {
          displayName: 'key.ingreso.conteo.manual',
          iconName: 'keyboard_arrow_right',
          route: 'ingresoconteomanual',
        },
        {
          displayName: 'key.genera.ajuste.inventario',
          iconName: 'keyboard_arrow_right',
          route: 'generaajusteinventario',
        },
        {
          displayName: 'key.title.informe.existencias.valorizadas',
          iconName: 'keyboard_arrow_right',
          route: 'informeexistenciasvalorizadas',
        },
      ],
    },

    /** menu Adm.OC */
    {
      displayName: 'key.title.administracion.compras',
      iconName: 'keyboard_arrow_right',
      route: 'admcompras',
      children: [
        {
          displayName: 'key.title.ingreso.orden.compra',
          iconName: 'keyboard_arrow_right',
          route: 'ingreso-oc',
        },
        {
          displayName: 'key.title.recepcion.orden.compra',
          iconName: 'keyboard_arrow_right',
          route: 'recepcion-oc',
        },
        {
          displayName: 'key.title.devolucion.orden.compra',
          iconName: 'keyboard_arrow_right',
          route: 'devolucion-oc',
        },
        {
          displayName: 'key.title.consulta.notas.credito',
          iconName: 'keyboard_arrow_right',
          route: 'devoluciones-oc',
        },
        {
          displayName: 'key.title.mantenedor.proveedores',
          iconName: 'keyboard_arrow_right',
          route: 'mantenedor-prov',
        },
        {
          displayName: 'key.title.distribucion.compras.especiales',
          iconName: 'keyboard_arrow_right',
          route: 'distribucion-oc-esp',
        },
        {
          displayName: 'key.title.busqueda.productos',
          iconName: 'keyboard_arrow_right',
          route: 'buscaritems-oc',
        },
      ],
    },

    /** menu Adm.Bodegas */

    {
      displayName: 'key.title.administracion.bodegas',
      iconName: 'keyboard_arrow_right',
      route: 'admbodegas',
      children: [
        {
          displayName: 'key.title.bodegas',
          iconName: 'keyboard_arrow_right',
          route: 'bodegas',
        },
        {
          displayName: 'key.title.administrador.plantillas.bodegas',
          iconName: 'keyboard_arrow_right',
          route: 'plantillasbodegas',
        },
        {
          displayName: 'key.title.administrador.plantillas.procedimientos',
          iconName: 'keyboard_arrow_right',
          route: 'plantillasprocedimientos',
        },

        {
          displayName: 'key.title.fraccionamiento',
          iconName: 'keyboard_arrow_right',
          route: 'admbodegas/mainfraccionamiento',
          children: [
            {
              displayName: 'key.title.fraccionamiento.productos',
              iconName: 'keyboard_arrow_right',
              route: 'fraccionamientoproductos',
            },
            {
              displayName: 'key.title.consulta.fraccionamiento',
              iconName: 'keyboard_arrow_right',
              route: 'consultafraccionamiento',
            },
            {
              displayName: 'key.title.devolucion.fraccionamiento',
              iconName: 'keyboard_arrow_right',
              route: 'devolucionfraccionamiento',
            },
          ]
        },


        {
          displayName: 'key.title.libro.controlado',
          iconName: 'keyboard_arrow_right',
          route: 'admbodegas/mainlibrocontrolado',
          children: [
            {
              displayName: 'key.title.cierre.libro.medicamentos.controlados',
              iconName: 'keyboard_arrow_right',
              route: 'librocontrolado'
            },
            {
              displayName: 'key.title.consulta.libro.controlado',
              iconName: 'keyboard_arrow_right',
              route: 'consultalibrocontrolado'
            }
          ]
        },
        {
          displayName: 'key.title.kardex',
          iconName: 'keyboard_arrow_right',
          route: 'admbodegas/mainkardex',
          children: [
            {
              displayName: 'key.cierre.kardex',
              iconName: 'keyboard_arrow_right',
              route: 'cierrekardex'
            },
            {
              displayName: 'key.consulta.kardex',
              iconName: 'keyboard_arrow_right',
              route: 'consultadekardex'
            }
          ]
        },
        // {
        //   displayName: 'Ajustes',
        //   iconName: 'keyboard_arrow_right',
        //   route: 'admbodegas/ajustes',
        //   children: [
        //     {
        //       displayName: 'Ajuste Stock',
        //       iconName: 'keyboard_arrow_right',
        //       route: 'ajustestock'
        //     }
        //   ]
        // },
      ],
    },
    /** menu Mov.Bodegas */
    {
      displayName: 'key.movimientos.bodegas',
      iconName: 'keyboard_arrow_right',
      route: 'movbodegas',
      children: [
        {
          displayName: 'key.title.generar.solicitudes',
          iconName: 'keyboard_arrow_right',
          route: 'creasolicitud'
        },
        {
          displayName: 'key.despachar.solicitudes',
          iconName: 'keyboard_arrow_right',
          route: 'despachosolicitudes'
        },
        {
          displayName: 'key.recepcion.solicitudes',
          iconName: 'keyboard_arrow_right',
          route: 'recepcionsolicitudes'
        },
        {
          displayName: 'key.devolucion.solicitudes',
          iconName: 'keyboard_arrow_right',
          route: 'devolucionsolicitudes'
        },
        {
          displayName: 'key.recepcion.devolucion.bodegas',
          iconName: 'keyboard_arrow_right',
          route: 'recepciondevolucionbodegas'
        },
        {
          displayName: 'key.reposicion.articulos',
          iconName: 'keyboard_arrow_right',
          route: 'reposicionarticulos'
        },
        {
          displayName: 'key.title.control.stock.minimo',
          iconName: 'keyboard_arrow_right',
          route: 'controlstockminimo'
        },
        {
          displayName: 'key.recepcion.devolucion.pacientes',
          iconName: 'keyboard_arrow_right',
          route: 'recepciondevolucionpaciente'
        },
        {
          displayName: 'key.title.consulta.saldos.bodegas',
          iconName: 'keyboard_arrow_right',
          route: 'consultasaldosporbodegas'
        },
        {
          displayName: 'key.title.consulta.lotes.productos',
          iconName: 'keyboard_arrow_right',
          route: 'consultalotes'
        },
        {
          displayName: 'key.title.prestamos',
          iconName: 'keyboard_arrow_right',
          route: 'prestamos'
        },
      ]
    },
    /** menu Mov.Pacientes */
    {
      displayName: 'key.pacientes',
      iconName: 'keyboard_arrow_right',
      route: 'movpacientes',
      children: [
        {
          displayName: 'key.title.solicitud.pacientes',
          iconName: 'keyboard_arrow_right',
          route: 'solicitudpaciente'
        },
        {
          displayName: 'key.dispensacion.solicitud.pacientes',
          iconName: 'keyboard_arrow_right',
          route: 'dispensarsolicitudespacientes'
        },
        {
          displayName: 'key.title.crea.dispensa.solicitud.pacientes',
          iconName: 'keyboard_arrow_right',
          route: 'creadispensasolicitudpaciente'
        },
        {
          displayName: 'key.generar.devolucion',
          iconName: 'keyboard_arrow_right',
          route: 'generadevolucionpaciente'
        },
        // {
        //   displayName: 'Recepcionar Devolución',
        //   iconName: 'keyboard_arrow_right',
        //   route: 'devolucionpacientes'
        // },
        {
          displayName: 'key.title.creacion.recetas.ambulatorias',
          iconName: 'keyboard_arrow_right',
          route: 'creacionrecetasambulatorias'
        },
        {
          displayName: 'key.despacho.recetas',
          iconName: 'keyboard_arrow_right',
          route: 'despachorecetasambulatoria'
        },
        // {
        //   displayName: 'Consulta Recetas Programada',
        //   iconName: 'keyboard_arrow_right',
        //   route: 'consultarecetasambulatoria'
        // },
        /** menu Busq. Cuentas */
        {
          displayName: 'key.title.busqueda.cuentas',
          iconName: 'keyboard_arrow_right',
          route: 'busquedacuentas'
        },
        {
          displayName: 'key.title.consumo.pacientes.bodega',
          iconName: 'keyboard_arrow_right',
          route: 'consumopacienteporbodega'
        },
        {
          displayName: 'key.recetas.anuladas',
          iconName: 'keyboard_arrow_right',
          route: 'recetaanulada'
        },
      ]
    },


    /** menu Consumo */
    {
      displayName: 'key.consumo',
      iconName: 'keyboard_arrow_right',
      route: 'consumo',
      children: [
        {
          displayName: 'key.title.generar.solicitudes.consumo',
          iconName: 'keyboard_arrow_right',
          route: 'solicitudconsumo'
        },
        {
          displayName: 'key.title.administrador.plantillas.consumo',
          iconName: 'keyboard_arrow_right',
          route: 'plantillaconsumo'
        }
      ]
    },
    /** menu Autopedido */
    {
      displayName: 'key.autopedido',
      iconName: 'keyboard_arrow_right',
      route: 'autopedido',
      children: [
        {
          displayName: 'key.title.solicitud.autopedido',
          iconName: 'keyboard_arrow_right',
          route: 'autopedido'
        },
        {
          displayName: 'key.title.devolucion.autopedido',
          iconName: 'keyboard_arrow_right',
          route: 'devolucionautopedido'
        }
      ]
    },


    /** Menú Reportes */
    {
      displayName: 'key.reportes',
      iconName: 'keyboard_arrow_right',
      route: 'reportes',
      children: [
        {
          displayName: 'key.title.reimpresion.solicitudes',
          iconName: 'keyboard_arrow_right',
          route: 'reimpresionsolicitudes'
        },
        {
          displayName: 'key.title.informe.lista.conteo.inventario',
          iconName: 'keyboard_arrow_right',
          route: 'informeconteolistainventario'
        },
        // {
        //   displayName: 'Consolidado por Devoluciones',
        //   iconName: 'keyboard_arrow_right',
        //   route: 'informeconsolidadodevoluciones'
        // },
        {
          displayName: 'key.consumo.bodega',
          iconName: 'keyboard_arrow_right',
          route: 'inftendencias'
        },
        {
          displayName: 'key.title.informe.consumo.autopedido',
          iconName: 'keyboard_arrow_right',
          route: 'infpedidosgastoservicio'
        },
        {
          displayName: 'key.title.informe.recetas.generadas',
          iconName: 'keyboard_arrow_right',
          route: 'recetasgeneradas'
        }
      ]
    },

    /** menu Usr. Roles */
    {
      displayName: 'key.title.administrador.roles.usuarios',
      iconName: 'keyboard_arrow_right',
      route: 'rolesusuarios'
    },
    /** menu Integracion */
    {
      displayName: 'key.integracion',
      iconName: 'keyboard_arrow_right',
      route: 'integracion',
      children: [
        {
          displayName: 'key.title.monitor.interfaz.cargos',
          iconName: 'keyboard_arrow_right',
          route: 'PanelIntegracionCargosComponent'
        },
        {
          displayName: 'titulo.monitor.interfaz.movimientos.erp',
          iconName: 'keyboard_arrow_right',
          route: 'PanelIntegracionERPComponent'
        }
      ]
    },
    /** Cambia Enlace */
    // {
    //   displayName: 'Cambia Enlace Rsc',
    //   iconName: 'keyboard_arrow_right',
    //   route: 'cambiaenlacersc'
    // },
    /** Configuracion */
    {
      displayName: 'key.configuracion',
      iconName: 'keyboard_arrow_right',
      route: 'configuracion',
      children: [
        {
          displayName: 'key.title.liberar.solicitudes.recetas',
          iconName: 'keyboard_arrow_right',
          route: 'liberarsolirece'
        },
        /** Servicio Reglas */
        {
          displayName: 'key.title.mantenedor.reglas',
          iconName: 'keyboard_arrow_right',
          route: 'servicioreglas'
        },
        {
          displayName: 'key.title.mantenedor.parametros',
          iconName: 'keyboard_arrow_right',
          route: 'mantenedor-parametros'
        },
      ]
    },
    /** menu Acerca de */
    {
      displayName: 'key.acerca.de',
      iconName: 'keyboard_arrow_right',
      route: 'acercade',
      children: [
        {
          displayName: 'key.versiones',
          iconName: 'keyboard_arrow_right',
          route: 'versiones'
        }]
    },
  ];

}
