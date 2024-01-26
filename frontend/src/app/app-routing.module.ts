import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PuedeDesactivarGuard } from './guards/puede-desactivar.guard';
import { TienePermisosGuard } from './guards/tiene-permisos.guard';
import { LoginComponent } from './login/login.component';
import { SesionexpiradaComponent } from './login/sesionexpirada/sesionexpirada.component';
import { AdministracionRolesComponent } from './views/administracion-roles/administracion-roles.component';
import { Autopedido2Component } from './views/autopedido2/autopedido2.component';
import { BodegasComponent } from './views/bodegas/bodegas.component';
import { BuscaritemsOcComponent } from './views/buscaritems-oc/buscaritems-oc.component';
import { BusquedacuentasComponent } from './views/busquedacuentas/busquedacuentas.component';
import { CierrekardexComponent } from './views/cierrekardex/cierrekardex.component';
import { ConsultafraccionamientoComponent } from './views/consultafraccionamiento/consultafraccionamiento.component';
import { ConsultakardexComponent } from './views/consultakardex/consultakardex.component';
import { ConsultalibrocontroladoComponent } from './views/consultalibrocontrolado/consultalibrocontrolado.component';
import { ConsultalotesComponent } from './views/consultalotes/consultalotes.component';
import { ConsultasaldosporbodegasComponent } from './views/consultasaldosporbodegas/consultasaldosporbodegas.component';
import { ConsumopacienteporbodegaComponent } from './views/consumopacienteporbodega/consumopacienteporbodega.component';
import { ControlStockMinimoComponent } from './views/control-stock-minimo/control-stock-minimo.component';
import { CreacionrecetasambulatoriasComponent } from './views/creacionrecetasambulatorias/creacionrecetasambulatorias.component';
import { CreadispensasolicitudpacienteComponent } from './views/creadispensasolicitudpaciente/creadispensasolicitudpaciente.component';
import { DespachoRecetasAmbulatoriaComponent } from './views/despacho-recetas-ambulatoria/despacho-recetas-ambulatoria.component';
import { DespachosolicitudesComponent } from './views/despachosolicitudes/despachosolicitudes.component';
import { DevolucionOcComponent } from './views/devolucion-oc/devolucion-oc.component';
import { DevolucionautopedidoComponent } from './views/devolucionautopedido/devolucionautopedido.component';
import { DevolucionesOcComponent } from './views/devoluciones-oc/devoluciones-oc.component';
import { DevolucionfraccionamientoComponent } from './views/devolucionfraccionamiento/devolucionfraccionamiento.component';
import { DevolucionsolicitudesComponent } from './views/devolucionsolicitudes/devolucionsolicitudes.component';
import { DispensarsolicitudpacienteComponent } from './views/dispensarsolicitudpaciente/dispensarsolicitudpaciente.component';
import { DistribucionOcEspComponent } from './views/distribucion-oc-esp/distribucion-oc-esp.component';
import { ErrorDelServidorComponent } from './views/error-del-servidor/error-del-servidor.component';
import { FraccionamientoproductosComponent } from './views/fraccionamientoproductos/fraccionamientoproductos.component';
import { GenerardevolucionpacienteComponent } from './views/generardevolucionpaciente/generardevolucionpaciente.component';
import { HomeComponent } from './views/home/home.component';
import { InflistaconteoinventarioComponent } from './views/inflistaconteoinventario/inflistaconteoinventario.component';
import { InfpedidoscongastoservicioComponent } from './views/infpedidoscongastoservicio/infpedidoscongastoservicio.component';
import { IngresoOCComponent } from './views/ingreso-oc/ingreso-oc.component';
import { LiberarsolireceComponent } from './views/liberarsolirece/liberarsolirece.component';
import { LibrocontroladoComponent } from './views/librocontrolado/librocontrolado.component';
import { MantencionComponent } from './views/mantencion/mantencion.component';
import { MantencionarticulosComponent } from './views/mantencionarticulos/mantencionarticulos.component';
import { MantenedorProvComponent } from './views/mantenedor-prov/mantenedor-prov.component';
import { MonitorEjecutivoComponent } from './views/monitor-ejecutivo/monitor-ejecutivo.component';
import { NotFoundPAgeComponent } from './views/not-found-page/not-found-page.component';
import { PanelIntegracionCargosComponent } from './views/panel-integracion-cargos/panel-integracion-cargos.component';
import { PanelIntegracionERPComponent } from './views/panel-integracion-erp/panel-integracion-erp.component';
import { PlantillaConsumoComponent } from './views/plantilla-consumo/plantilla-consumo.component';
import { PlantillasprocedimientosComponent } from './views/plantillasprocedimientos/plantillasprocedimientos.component';
import { PlantillassolicitudbodegaComponent } from './views/plantillassolicitudbodega/plantillassolicitudbodega.component';
import { RecepcionOcComponent } from './views/recepcion-oc/recepcion-oc.component';
import { RecepciondevolucionentrebodegasComponent } from './views/recepciondevolucionentrebodegas/recepciondevolucionentrebodegas.component';
import { RecepciondevolucionpacienteComponent } from './views/recepciondevolucionpaciente/recepciondevolucionpaciente.component';
import { RecepcionsolicitudesComponent } from './views/recepcionsolicitudes/recepcionsolicitudes.component';
import { RecetaanuladaComponent } from './views/recetaanulada/recetaanulada.component';
import { RecetasgeneradasComponent } from './views/recetasgeneradas/recetasgeneradas.component';
import { ReportesComponent } from './views/reportes/reportes.component';
import { ReposicionArticulosComponent } from './views/reposicion-articulos/reposicion-articulos.component';
import { ServicioreglasComponent } from './views/servicioreglas/servicioreglas.component';
import { SolicitudConsumoComponent } from './views/solicitud-consumo/solicitud-consumo.component';
import { SolicitudesManualesComponent } from './views/solicitudes-manuales/solicitudes-manuales.component';
import { SolicitudpacienteComponent } from './views/solicitudpaciente/solicitudpaciente.component';
import { VersionIncorrectaComponent } from './views/version-incorrecta/version-incorrecta.component';
import { VersionesComponent } from './views/versiones/versiones.component';

import { PlantillaPrestamosComponent } from './views/prestamos/pages/plantilla-prestamos.component';

import { MantenedorDeParametrosComponent } from './views/mantenedor-de-parametros/mantenedor-de-parametros.component';
import { InftendenciasComponent } from './views/inftendencias/inftendencias.component';

import {GeneraajusteinventarioComponent} from './views/generaajusteinventario/generaajusteinventario.component';
import {IngresoconteomanualComponent} from './views/ingresoconteomanual/ingresoconteomanual.component';
import {InventarioGeneraComponent} from './views/inventario-genera/inventario-genera.component';
import { AperturacierreinventarioComponent } from './views/aperturacierreinventario/aperturacierreinventario.component';
import { BloquearbodegasinventarioComponent } from './views/bloquearbodegasinventario/bloquearbodegasinventario.component';
import { InformeexistenciasvalorizadasComponent } from './views/informeexistenciasvalorizadas/informeexistenciasvalorizadas.component';

const mi_routas: Routes = [
  // RUTAS GENERALES
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'mantencion',
    component: MantencionComponent,
  },
  {
    path: 'error-del-servidor',
    component: ErrorDelServidorComponent,
    canActivate: [AuthGuard],
    canDeactivate: [PuedeDesactivarGuard],
  },
  {
    path: 'version-incorrecta',
    component: VersionIncorrectaComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'expirada',
    component: SesionexpiradaComponent,
  },

  // MENU MONITOR
  {
    path: 'monitorejecutivo',
    component: MonitorEjecutivoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['monitor'] },
  },

  // MENU INVENTARIO
  {
    path: 'aperturacierreinventario',
    component: AperturacierreinventarioComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnaperturacierreinventario'] },
  },
  {
    path: 'bloquearbodegasinventario',
    component: BloquearbodegasinventarioComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnbloquearbodegasinventario'] },
  },
  {
    path: 'informeconteolistainventario',
    component: InflistaconteoinventarioComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btninformelistaconteoinventario'] },
  },
  {
    path: 'inventariogenera',
    component: InventarioGeneraComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btninventariogenera'] },
  },
  {
    path: 'ingresoconteomanual',
    component: IngresoconteomanualComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btningresoconteomanual'] },
  },
  {
    path: 'generaajusteinventario',
    component: GeneraajusteinventarioComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btngeneraajusteinventario'] },
  },
  {
    path: 'informeexistenciasvalorizadas',
    component: InformeexistenciasvalorizadasComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btninformeexistenciasvalorizadas'] },
  },

  // MENU PRODUCTOS
  // { /** @deprecated Se puede eliminar sin problemas. */
  //   path: 'mantencionarticulos/:codigo',
  //   component: MantencionarticulosComponent,
  //   canActivate: [AuthGuard, TienePermisosGuard],
  //   data: { permisos: ['btnmantarticulo'] },
  // },
  {
    path: 'mantencionarticulos',
    component: MantencionarticulosComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnmantarticulo'] },
  },
  // MENU ADMINISTRACION DE COMPRAS
  {
    path: 'ingreso-oc',
    component: IngresoOCComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btningresocompras'] },
  },
  {
    path: 'recepcion-oc',
    component: RecepcionOcComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnrecepcioncompras'] },
  },
  {
    path: 'devolucion-oc',
    component: DevolucionOcComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndevolucioncompras'] },
  },
  {
    path: 'devoluciones-oc/:nota_credito',
    component: DevolucionesOcComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndevolucionesoc'] },
  },
  {
    path: 'devoluciones-oc',
    component: DevolucionesOcComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndevolucionesoc'] },
  },
  {
    path: 'mantenedor-prov',
    component: MantenedorProvComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnmantenedorprov'] },
  },
  {
    path: 'distribucion-oc-esp',
    component: DistribucionOcEspComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndistribucioncompras'] },
  },
  {
    path: 'buscaritems-oc',
    component: BuscaritemsOcComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnbusquedacompras'] },
  },

  // MENU ADMINISTRACION DE BODEGAS
  // { /** @deprecated Se puede eliminar sin problema */
  //   path: 'bodegas/:codigo',
  //   component: BodegasComponent,
  //   canActivate: [AuthGuard, TienePermisosGuard],
  //   data: { permisos: ['btnbodegas'] },
  // },
  {
    path: 'bodegas',
    component: BodegasComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnbodegas'] },
  },
  {
    path: 'plantillasbodegas',
    component: PlantillassolicitudbodegaComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnplantillabod'] },
  },
  {
    path: 'plantillasprocedimientos',
    component: PlantillasprocedimientosComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnplantillaproced'] },
  },
  // Sub menu fraccionamiento
  {
    path: 'fraccionamientoproductos',
    component: FraccionamientoproductosComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnfraccionamiento'] },
  },
  {
    path: 'consultafraccionamiento',
    component: ConsultafraccionamientoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnconsultafraccionamiento'] },
  },
  {
    path: 'devolucionfraccionamiento',
    component: DevolucionfraccionamientoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndevolfraccionamiento'] },
  },
  // Sub menu libro controlado
  {
    path: 'librocontrolado',
    component: LibrocontroladoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btncierre'] },
  },
  {
    path: 'consultalibrocontrolado',
    component: ConsultalibrocontroladoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnconsulta'] },
  },
  // Sub menu Kardex
  {
    path: 'consultadekardex',
    component: ConsultakardexComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnconsultakardex'] },
  },
  {
    path: 'cierrekardex',
    component: CierrekardexComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btncierrekardex'] },
  },
  // { /** NO DEPRECADO. Solo comentado en en `menu.ts` */
  //   path: 'ajustestock',
  //   component: AjustestockComponent,
  //   canActivate: [AuthGuard],
  // },

  // MENU MOVIMIENTOS BODEGAS
  {
    path: 'creasolicitud',
    component: SolicitudesManualesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnadmsol'] },
  },
  {
    path: 'reposicionarticulos',
    component: ReposicionArticulosComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnrepoarticulos'] },
  },
  {
    path: 'despachosolicitudes/:id_solicitud/:retorno_pagina/:id_suministro/:id_tipoproducto/:id_solicita/:fechadesde/:fechahasta/:id_articulo/:desc_articulo',
    component: DespachosolicitudesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndespsol'] },
  },
  {
    path: 'despachosolicitudes/:id_solicitud/:retorno_pagina',
    component: DespachosolicitudesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndespsol'] },
  },
  {
    path: 'despachosolicitudes',
    component: DespachosolicitudesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndespsol', 'monitor'] },
  },
  {
    path: 'recepcionsolicitudes/:id_solicitud',
    component: RecepcionsolicitudesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnrecepsol'] },
  },
  {
    path: 'recepcionsolicitudes',
    component: RecepcionsolicitudesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnrecepsol', 'monitor'] },
  },
  {
    path: 'devolucionsolicitudes',
    component: DevolucionsolicitudesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndevsol'] },
  },
  {
    path: 'recepciondevolucionbodegas',
    component: RecepciondevolucionentrebodegasComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnrecepdevbod'] },
  },
  {
    path: 'controlstockminimo/:id_suministro/:id_tipoproducto/:id_solicita/:fechadesde/:fechahasta/:id_articulo/:desc_articulo',
    component: ControlStockMinimoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnctrlstockmin'] },
  },
  {
    path: 'controlstockminimo',
    component: ControlStockMinimoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnctrlstockmin'] },
  },
  {
    path: 'recepciondevolucionpaciente',
    component: RecepciondevolucionpacienteComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['menudevolpac'] },
  },
  {
    path: 'consultasaldosporbodegas',
    component: ConsultasaldosporbodegasComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['menuconsultasaldobodega'] },
  },
  {
    path: 'consultalotes',
    component: ConsultalotesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['menuconsultalote'] },
  },
  {
    path: 'prestamos',
    component: PlantillaPrestamosComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['menuprestamos'] },
  },
  // MENU PACIENTES
  {
    path: 'solicitudpaciente',
    component: SolicitudpacienteComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnsolpaciente'] },
  },
  {
    path: 'dispensarsolicitudespacientes/:id_solicitud',
    component: DispensarsolicitudpacienteComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndispsolpac'] },
  },
  {
    path: 'dispensarsolicitudespacientes',
    component: DispensarsolicitudpacienteComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndispsolpac', 'monitor'] },
  },
  {
    path: 'creadispensasolicitudpaciente',
    component: CreadispensasolicitudpacienteComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btncreadispsolpac'] },
  },
  {
    path: 'generadevolucionpaciente',
    component: GenerardevolucionpacienteComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btngeneradevolpac'] },
  },
  // { /** NO DEPRECADO. Solo comentado en `menu.ts` */
  //   path: 'devolucionpacientes',
  //   component: DevolucionpacientesComponent,
  //   canActivate: [AuthGuard, TienePermisosGuard],
  //   data: { permisos: ['btnrecepdevolpac'] },
  // },
  {
    path: 'creacionrecetasambulatorias',
    component: CreacionrecetasambulatoriasComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btncreacionrecetas'] },
  },
  {
    path: 'despachorecetasambulatoria/:soliid/:id_reseta/:retorno_pagina',
    component: DespachoRecetasAmbulatoriaComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndesprecetas', 'monitor'] },
  },
  {
    path: 'despachorecetasambulatoria/:soliid/:ambito/:ambito/:retorno_pagina',
    component: DespachoRecetasAmbulatoriaComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndesprecetas', 'monitor'] },
  },
  {
    path: 'despachorecetasambulatoria',
    component: DespachoRecetasAmbulatoriaComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btndesprecetas', 'monitor'] },
  },
  // { /** NO DEPRECADO. Solo comentado en `menu.ts` */
  //   path: 'consultarecetasambulatoria',
  //   component: ConsultarecetaambulatoriaComponent,
  //   canActivate: [AuthGuard, TienePermisosGuard],
  //   data: { permisos: ['btnconsulrecetas'] },
  // },
  {
    path: 'busquedacuentas',
    component: BusquedacuentasComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnbusquedacuentas'] },
  },
  {
    path: 'consumopacienteporbodega',
    component: ConsumopacienteporbodegaComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnconsumopacbodega'] },
  },
  {
    path: 'recetaanulada',
    component: RecetaanuladaComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnSolReceAnulada'] },
  },

  // MENU CONSUMO
  {
    path: 'solicitudconsumo',
    component: SolicitudConsumoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnsolconsumo'] },
  },
  {
    path: 'plantillaconsumo',
    component: PlantillaConsumoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnplantconsumo'] },
  },

  // MENU AUTOPEDIDO
  {
    // FIX: Crear los permisos
    path: 'autopedido',
    component: Autopedido2Component,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnMenuAutopedido'] },
  },
  {
    path: 'devolucionautopedido',
    component: DevolucionautopedidoComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnMenuDevolAutopedido'] },
  },
  // { /** NO DEPRECADO. Solo comentado en `menu.ts` */
  //   path: 'despachocostoservicio',
  //   component: DespachocostoservicioComponent,
  //   canActivate: [AuthGuard, TienePermisosGuard],
  //   data: { permisos: ['btnMenuSolicitudAutopedido'] },
  // },

  // MENU REPORTES
  {
    path: 'reimpresionsolicitudes',
    component: ReportesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnreimpresionsolicitud'] },
  },
  {
    path: 'informeconteolistainventario',
    component: InflistaconteoinventarioComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnlistaconteoinventario'] },
  },
  // { /** NO DEPRECADO. Solo comentado en `menu.ts` */
  //   path: 'informeconsolidadodevoluciones',
  //   component: InfconsolidadoxdevolucionesComponent,
  //   canActivate: [AuthGuard],
  // },
  {
    path: 'inftendencias',
    component: InftendenciasComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnconsumoporbodega'] },
  },
  {
    path: 'infpedidosgastoservicio',
    component: InfpedidoscongastoservicioComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['menugastoservicio'] },
  },
  {
    path: 'recetasgeneradas',
    component: RecetasgeneradasComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['menurecetasgeneradas'] },
  },

  // MENU ADMINISTRADOR ROLES
  {
    path: 'rolesusuarios',
    component: AdministracionRolesComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnusroles'] },
  },

  // MENU INTEGRACION
  {
    path: 'PanelIntegracionERPComponent',
    component: PanelIntegracionERPComponent,
    canDeactivate: [PuedeDesactivarGuard],
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnMenuInterfazErp'] },
  },
  {
    path: 'PanelIntegracionCargosComponent',
    component: PanelIntegracionCargosComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnMenuInterfazCargos'] },
  },

  // MENU CAMBIAR ENLACE
  // { /** NO DEPRECADO. Solo comentado en `menu.ts` */
  //   path: 'cambiaenlacersc',
  //   component: CambiaenlaceRscComponent,
  //   canActivate: [AuthGuard,  TienePermisosGuard],
  //   data: { permisos: ['btncambioenlace'] },
  // },

  // MENU CONFIGURACION
  {
    path: 'liberarsolirece',
    component: LiberarsolireceComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnliberarsolirece'] },
  },
  {
    path: 'servicioreglas',
    component: ServicioreglasComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnservicioreglas'] },
  },
  {
    path: 'mantenedor-parametros',
    component: MantenedorDeParametrosComponent,
    canActivate: [AuthGuard, TienePermisosGuard],
    data: { permisos: ['btnMantenedorParametros'] },
  },

  // MENU ACERCA DE
  {
    path: 'versiones',
    component: VersionesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    component: NotFoundPAgeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(mi_routas)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

////////////////////////////////////////// RUTAS SIN USAR //////////////////////////////////////////
/**
 * @deprecated
 * Todas estas rutas estaban sin usar, pero podrian ser accedidas directamente desde la URL. Quedan
 * comentadas por si acaso, pero se deberian eliminar sin problema al igual que sus componentes.
 */

// { // No aparece en ningun lugar
//   path: 'movimientos',
//   component: MovimientosComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'listadopararealizarinventarios',
//   component: ListadopararealizarinventarioComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'generainventariosistema',
//   component: GenerainventariosistemaComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'ingresoconteomanual',
//   component: IngresoconteomanualComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'generaajusteinventario',
//   component: GeneraajusteinventarioComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'informeexistenciasvalorizado',
//   component: InformeexistenciasvalorizadasComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'devolucionsolicitudespacientes',
//   component: DevolucionsolicitudespacientesComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'ajustevalores',
//   component: AjustevaloresComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'informeajustevalorizados',
//   component: InformeajustesvalorizadosComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'ajustedeprecios',
//   component: InformeajustesdepreciosComponent,
//   canActivate: [AuthGuard],
// },
// { // No aparece en ningun lugar
//   path: 'reportes',
//   component: ReportesComponent,
// },
// { // No aparece en ningun lugar
//   path: 'infconsumoporbodegas',
//   component: InfconsumoporbodegasComponent,
//   canActivate: [AuthGuard],
// },
//////////////////////////////////////// FIN RUTAS SIN USAR ////////////////////////////////////////

//////////////////////////////////////////// MENU NUEVO ////////////////////////////////////////////
/**
 * @deprecated
 * Este menu no se esta ocupando en la aplicacion. Funciona si uno accede a la ruta desde la
 * aplicacion (usando el router de Angular), pero no si uno escribe la URL directamente desde el
 * navegador. Habria que eliminarlo si es que no esta dando problemas.
 */

// {
//   path: 'producto',
//   children: [
//     {
//       path: 'mantencionarticulos',
//       component: MantencionarticulosComponent,
//       canActivate: [AuthGuard],
//     },
//   ],
// },
// {
//   path: 'admbodegas',
//   children: [
//     {
//       path: 'bodegas',
//       component: BodegasComponent,
//       canActivate: [AuthGuard],
//     },
//     // { path: 'plantillas/:in_tipo', component: PlantillassolicitudbodegaComponent, canActivate: [AuthGuard] },
//     {
//       path: 'plantillasprocedimientos',
//       component: PlantillasprocedimientosComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'plantillasbodegas',
//       component: PlantillassolicitudbodegaComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'mainfraccionamiento',
//       children: [
//         {
//           path: 'fraccionamientoproductos',
//           component: FraccionamientoproductosComponent,
//           canActivate: [AuthGuard],
//         },
//         {
//           path: 'consultafraccionamiento',
//           component: ConsultafraccionamientoComponent,
//           canActivate: [AuthGuard],
//         },
//         {
//           path: 'devolucionfraccionamiento',
//           component: DevolucionfraccionamientoComponent,
//           canActivate: [AuthGuard],
//         },
//       ],
//     },

//     {
//       path: 'mainlibrocontrolado',
//       children: [
//         {
//           path: 'librocontrolado',
//           component: LibrocontroladoComponent,
//           canActivate: [AuthGuard],
//         },
//         {
//           path: 'consultalibrocontrolado',
//           component: ConsultalibrocontroladoComponent,
//           canActivate: [AuthGuard],
//         },
//       ],
//     },
//     {
//       path: 'mainkardex',
//       children: [
//         {
//           path: 'cierrekardex',
//           component: CierrekardexComponent,
//           canActivate: [AuthGuard],
//         },
//         {
//           path: 'consultadekardex',
//           component: ConsultakardexComponent,
//           canActivate: [AuthGuard],
//         },
//       ],
//     },
//     {
//       path: 'ajustes',
//       children: [
//         {
//           path: 'ajustestock',
//           component: AjustestockComponent,
//           canActivate: [AuthGuard],
//         },
//       ],
//     },
//   ],
// },
// {
//   path: 'movbodegas',
//   children: [
//     {
//       path: 'creasolicitud',
//       component: SolicitudesManualesComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'reposicionarticulos',
//       component: ReposicionArticulosComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'despachosolicitudes',
//       component: DespachosolicitudesComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'recepcionsolicitudes',
//       component: RecepcionsolicitudesComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'devolucionsolicitudes',
//       component: DevolucionsolicitudesComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'recepciondevolucionbodegas',
//       component: RecepciondevolucionentrebodegasComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'controlstockminimo',
//       component: ControlStockMinimoComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'recepciondevolucionpaciente',
//       component: RecepciondevolucionpacienteComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'consultasaldosporbodegas',
//       component: ConsultasaldosporbodegasComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'consultalotes',
//       component: ConsultalotesComponent,
//       canActivate: [AuthGuard],
//     },
//   ],
// },
// {
//   path: 'movpacientes',
//   children: [
//     {
//       path: 'solicitudpaciente',
//       component: SolicitudpacienteComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'creadispensasolicitudpaciente',
//       component: CreadispensasolicitudpacienteComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'dispensarsolicitudespacientes',
//       component: DispensarsolicitudpacienteComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'generadevolucionpaciente',
//       component: GenerardevolucionpacienteComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'devolucionpacientes',
//       component: DevolucionpacientesComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'despachorecetasambulatoria',
//       component: DespachoRecetasAmbulatoriaComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'consultarecetasambulatoria',
//       component: ConsultarecetaambulatoriaComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'consumopacienteporbodega',
//       component: ConsumopacienteporbodegaComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'recetaanulada',
//       component: RecetaanuladaComponent,
//       canActivate: [AuthGuard],
//     },
//   ],
// },
// {
//   path: 'reportes',
//   children: [
//     {
//       path: 'reimpresionreportes',
//       component: ReportesComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'informeconteolistainventario',
//       component: InflistaconteoinventarioComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'informeconsolidadodevoluciones',
//       component: InfconsolidadoxdevolucionesComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'inftendencias',
//       component: InftendenciasComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'infpedidosgastoservicio',
//       component: InfpedidoscongastoservicioComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'recetasgeneradas',
//       component: RecetasgeneradasComponent,
//       canActivate: [AuthGuard],
//     },
//     // { path: 'infconsumoporbodegas', component: InfconsumoporbodegasComponent, canActivate: [AuthGuard] },
//   ],
// },
// {
//   path: 'consumo',
//   children: [
//     {
//       path: 'solicitudconsumo',
//       component: SolicitudConsumoComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'plantillaconsumo',
//       component: PlantillaConsumoComponent,
//       canActivate: [AuthGuard],
//     },
//   ],
// },
// {
//   path: 'autopedido',
//   component: Autopedido2Component,
//   canActivate: [AuthGuard],
// },
// // { path: 'despachocostoservicio', component: DespachocostoservicioComponent, canActivate: [AuthGuard]},
// {
//   path: 'devolucionautopedido',
//   component: DevolucionautopedidoComponent,
//   canActivate: [AuthGuard],
// },
// {
//   path: 'busquedacuentas',
//   component: BusquedacuentasComponent,
//   canActivate: [AuthGuard],
// },
// {
//   path: 'rolesusuarios',
//   component: AdministracionRolesComponent,
//   canActivate: [AuthGuard],
// },
// {
//   path: 'integracion',
//   children: [
//     {
//       path: 'PanelIntegracionCargosComponent',
//       component: PanelIntegracionCargosComponent,
//       canActivate: [AuthGuard],
//     },
//     {
//       path: 'PanelIntegracionERPComponent',
//       component: PanelIntegracionERPComponent,
//       canActivate: [AuthGuard],
//     },
//   ],
// },
// {
//   path: 'cambiaenlacersc',
//   component: CambiaenlaceRscComponent,
//   canActivate: [AuthGuard],
// },
// // { path: 'configuracion', children: [
// //   { path: 'liberarsolirece', component: LiberarsolireceComponent, canActivate: [AuthGuard] }
// // ]},

// {
//   path: 'configuracion',
//   children: [
//     {
//       path: 'liberarsolirece',
//       component: LiberarsolireceComponent,
//       canActivate: [AuthGuard],
//     },
//     // { path: 'infconsumoporbodegas', component: InfconsumoporbodegasComponent, canActivate: [AuthGuard] },
//   ],
// },
// // { path: 'liberarsolirece', component: LiberarsolireceComponent, },
// {
//   path: 'acercade',
//   children: [
//     {
//       path: 'versiones',
//       component: VersionesComponent,
//       canActivate: [AuthGuard],
//     },
//   ],
// },
////////////////////////////////////////// FIN MENU NUEVO //////////////////////////////////////////
