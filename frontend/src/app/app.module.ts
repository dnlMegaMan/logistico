import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { LoginComponent } from './login/login.component'
import { NotFoundPAgeComponent } from './views/not-found-page/not-found-page.component'
import { HomeComponent } from './views/home/home.component'
import { MenuprincipalComponent } from './menuprincipal/menuprincipal.component'
import { MantencionarticulosComponent } from './views/mantencionarticulos/mantencionarticulos.component';
import { ReposicionArticulosComponent } from './views/reposicion-articulos/reposicion-articulos.component';
import { MovimientosComponent } from './views/movimientos/movimientos.component';
import { hesService } from './servicios/hes.service';
import { BodegasService } from './servicios/bodegas.service';
import { TipomovimientoService } from './servicios/tipomovimiento.service';
import { MotivocargoService } from './servicios/motivocargo.service';
import { BusquedapacientesComponent } from './views/busquedapacientes/busquedapacientes.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BusquedamovimientosComponent } from './views/busquedamovimientos/busquedamovimientos.component';
import { MovimientosfarmaciaService } from './servicios/movimientosfarmacia.service'
import { PacientesService } from './servicios/pacientes.service';
import { TipodocumentoidentService} from '../app/servicios/tipodocumentoident.service';
import { BusquedaproductosComponent } from './views/busquedaproductos/busquedaproductos.component'
import { BusquedaproductosService } from './servicios/busquedaproductos.service';
import { BusquedaProdDevolComponent } from './views/generardevolucionpaciente/modalbuscaproddevol/busquedaproddevol.component'
import { MovimientoDevolucionComponent } from './views/movimiento-devolucion/movimiento-devolucion.component';
import { DatePipe } from '@angular/common';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxLoadingModule } from 'ngx-loading';

import { SolicitudService } from './servicios/Solicitudes.service';
import { GenerainventariosistemaComponent } from './views/generainventariosistema/generainventariosistema.component';
import { DespachosolicitudesComponent } from './views/despachosolicitudes/despachosolicitudes.component';
import { ListadopararealizarinventarioComponent } from './views/listadopararealizarinventario/listadopararealizarinventario.component';

import { SolicitudesManualesComponent } from '../app/views/solicitudes-manuales/solicitudes-manuales.component';
import { BusquedasolicitudesComponent } from '../app/views/busquedasolicitudes/busquedasolicitudes.component';
import { DevolucionsolicitudesComponent } from './views/devolucionsolicitudes/devolucionsolicitudes.component';
import { UsuarioEstructuraConexionComponent } from './views/usuario-estructura-conexion/usuario-estructura-conexion.component';
import { IngresoconteomanualComponent } from './views/ingresoconteomanual/ingresoconteomanual.component';
import { GeneraajusteinventarioComponent } from './views/generaajusteinventario/generaajusteinventario.component';
import { InformeexistenciasvalorizadasComponent } from './views/informeexistenciasvalorizadas/informeexistenciasvalorizadas.component';
import { BusquedasolicitudpacientesComponent } from './views/busquedasolicitudpacientes/busquedasolicitudpacientes.component';
import { DispensarsolicitudpacienteComponent } from './views/dispensarsolicitudpaciente/dispensarsolicitudpaciente.component';
import { EventosSolicitudComponent } from './views/eventos-solicitud/eventos-solicitud.component';
import { EventosDetallesolicitudComponent } from './views/eventos-detallesolicitud/eventos-detallesolicitud.component';
import { SolicitudpacienteComponent } from './views/solicitudpaciente/solicitudpaciente.component';
import { ModalpacienteComponent } from './views/modalpaciente/modalpaciente.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DevolucionsolicitudespacientesComponent } from './views/devolucionsolicitudespacientes/devolucionsolicitudespacientes.component';
import { RecepcionsolicitudesComponent } from './views/recepcionsolicitudes/recepcionsolicitudes.component';
import { DevolucionpacientesComponent } from './views/devolucionpacientes/devolucionpacientes.component';
import { BusquedamovimientopacienteambulatorioComponent } from './views/busquedamovimientopacienteambulatorio/busquedamovimientopacienteambulatorio.component';
import { RecepcionsolicitudesService } from './servicios/recepcioinsolicitudes.service';
import { DespachoRecetasAmbulatoriaComponent } from './views/despacho-recetas-ambulatoria/despacho-recetas-ambulatoria.component';
import { RecepciondevolucionentrebodegasComponent } from './views/recepciondevolucionentrebodegas/recepciondevolucionentrebodegas.component';
import { BusquedamovimientosbodegasComponent } from './views/busquedamovimientosbodegas/busquedamovimientosbodegas.component';
import { BusquedaSolicitudPacienteAmbulatorioComponent } from './views/busqueda-solicitud-paciente-ambulatorio/busqueda-solicitud-paciente-ambulatorio.component';
import { ConsultakardexComponent } from './views/consultakardex/consultakardex.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AjustestockComponent } from './views/ajustestock/ajustestock.component';
import { AjustevaloresComponent } from './views/ajustevalores/ajustevalores.component';
import { InformeajustesvalorizadosComponent } from './views/informeajustesvalorizados/informeajustesvalorizados.component';
import { InformeajustesdepreciosComponent } from './views/informeajustesdeprecios/informeajustesdeprecios.component';
import { BodegasComponent } from './views/bodegas/bodegas.component';
import { BusquedabodegasComponent } from './views/busquedabodegas/busquedabodegas.component';
import { BusquedabodegasService } from './servicios/busquedabodegas.service';
import { InventariosService } from './servicios/inventarios.service';
import { PlantillassolicitudbodegaComponent } from './views/plantillassolicitudbodega/plantillassolicitudbodega.component';
import { BusquedaplantillasbodegaComponent } from './views/busquedaplantillasbodega/busquedaplantillasbodega.component';
import { MonitorEjecutivoComponent } from './views/monitor-ejecutivo/monitor-ejecutivo.component';
import { FraccionamientoproductosComponent} from './views/fraccionamientoproductos/fraccionamientoproductos.component';
import { BusquedaproductoafraccionarComponent } from './views/busquedaproductoafraccionar/busquedaproductoafraccionar.component';
import { VersionesComponent } from './views/versiones/versiones.component';
import { LibrocontroladoComponent } from './views/librocontrolado/librocontrolado.component';
import { ControlStockMinimoComponent } from './views/control-stock-minimo/control-stock-minimo.component';
import { ConsultalibrocontroladoComponent } from './views/consultalibrocontrolado/consultalibrocontrolado.component';
import { BusquedaServiciosComponent } from './views/busqueda-servicios/busqueda-servicios.component';
import { BusquedaUsuariosComponent } from './views/busqueda-usuarios/busqueda-usuarios.component';
import { ConsultarecetaambulatoriaComponent } from './views/consultarecetaambulatoria/consultarecetaambulatoria.component';


import { SolicitudConsumoComponent } from './views/solicitud-consumo/solicitud-consumo.component';
import { BusquedaSolicitudConsumoComponent } from './views/busqueda-solicitud-consumo/busqueda-solicitud-consumo.component';
import { BusquedaProductosConsumoComponent } from './views/busqueda-productos-consumo/busqueda-productos-consumo.component';
import { clear } from 'console';
import { PlantillaConsumoComponent } from './views/plantilla-consumo/plantilla-consumo.component';
import { BusquedaPlantillaConsumoComponent } from './views/busqueda-plantilla-consumo/busqueda-plantilla-consumo.component';
import { PanelIntegracionERPComponent } from './views/panel-integracion-erp/panel-integracion-erp.component';
import { ListaEsperaRecetasComponent } from './views/lista-espera-recetas/lista-espera-recetas.component';
import { AdministracionRolesComponent } from './views/administracion-roles/administracion-roles.component';
import { BusquedaRolesComponent } from './views/busqueda-roles/busqueda-roles.component';
import { BusquedaCentrosCostosComponent } from './views/busqueda-centros-costos/busqueda-centros-costos.component';
import { NumberonlyDirective } from './directive/numberonly.directive';
import { DespachocostoservicioComponent } from './views/despachocostoservicio/despachocostoservicio.component';
import { CreadispensasolicitudpacienteComponent } from './views/creadispensasolicitudpaciente/creadispensasolicitudpaciente.component';
import { CierrekardexComponent } from './views/cierrekardex/cierrekardex.component';
import { PanelIntegracionCargosComponent } from './views/panel-integracion-cargos/panel-integracion-cargos.component';
import { InterfacesService } from './servicios/interfaces.service';
import { CreasolicitudesService } from './servicios/creasolicitudes.service';
import { DevolucionautopedidoComponent } from './views/devolucionautopedido/devolucionautopedido.component';
import { BusquedacuentasComponent } from './views/busquedacuentas/busquedacuentas.component';
import { CargofarmaciaComponent } from './views/busquedacuentas/cargofarmacia/cargofarmacia.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule} from '@angular/material/menu';
import { ConsultapacienteComponent } from './views/busquedacuentas/consultapaciente/consultapaciente.component';
import { MenuListItemComponent } from './components/menu-list-item/menu-list-item.component';
import { NavService } from './nav.service';
import { ReportesComponent } from './views/reportes/reportes.component';
import { BusquedarecetasComponent } from './views/busquedarecetas/busquedarecetas.component';
import { SesionexpiradaComponent } from './login/sesionexpirada/sesionexpirada.component';
import { ConsultafraccionamientoComponent } from './views/consultafraccionamiento/consultafraccionamiento.component';
import { InflistaconteoinventarioComponent } from './views/inflistaconteoinventario/inflistaconteoinventario.component';
import { InfconsolidadoxdevolucionesComponent } from './views/infconsolidadoxdevoluciones/infconsolidadoxdevoluciones.component';
import { InftendenciasComponent } from './views/inftendencias/inftendencias.component';
import { DevolucionfraccionamientoComponent } from './views/devolucionfraccionamiento/devolucionfraccionamiento.component';
import { GenerardevolucionpacienteComponent } from './views/generardevolucionpaciente/generardevolucionpaciente.component';
import { RecepciondevolucionpacienteComponent } from './views/recepciondevolucionpaciente/recepciondevolucionpaciente.component';
import { ModalsolicitudpacdevueltaComponent } from './views/modalsolicitudpacdevuelta/modalsolicitudpacdevuelta.component';
import { ModalvalidausuariodevolsolicitudComponent } from './views/modalvalidausuariodevolsolicitud/modalvalidausuariodevolsolicitud.component';
import { ConsumopacienteporbodegaComponent } from './views/consumopacienteporbodega/consumopacienteporbodega.component';
import { ModaldetallesolicitudMonitorERPComponent } from './views/modaldetallesolicitud-monitor-erp/modaldetallesolicitud-monitor-erp.component';
import { PlantillasprocedimientosComponent } from './views/plantillasprocedimientos/plantillasprocedimientos.component';
import { CreacionrecetasambulatoriasComponent } from './views/creacionrecetasambulatorias/creacionrecetasambulatorias.component';
import { ModalbusquedaprofesionalComponent } from './views/modalbusquedaprofesional/modalbusquedaprofesional.component';
import { ConsultalotesComponent } from './views/consultalotes/consultalotes.component';
import { ConsultasaldosporbodegasComponent } from './views/consultasaldosporbodegas/consultasaldosporbodegas.component';
import { Autopedido2Component } from './views/autopedido2/autopedido2.component';
import { ModalbusquedalotesComponent } from './views/consultalotes/modalbusquedalotes/modalbusquedalotes.component';
import { CambiaenlaceRscComponent } from './views/cambiaenlace-rsc/cambiaenlace-rsc.component';
import { ModalbusquedadosComponent } from './views/consultalotes/modalbusquedados/modalbusquedados.component';
import { InfpedidoscongastoservicioComponent } from './views/infpedidoscongastoservicio/infpedidoscongastoservicio.component';
import { LiberarsolireceComponent } from './views/liberarsolirece/liberarsolirece.component';
import { ServicioreglasComponent } from './views/servicioreglas/servicioreglas.component';
import { BusquedaservicioreglasComponent } from './views/busquedaservicioreglas/busquedaservicioreglas.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule } from '@angular/material';
import { BusquedarecetasanuladasComponent } from './views/recetaanulada/busquedarecetasanuladas/busquedarecetasanuladas.component';
import { RecetaanuladaComponent } from './views/recetaanulada/recetaanulada.component';
import { RecetasgeneradasComponent } from './views/recetasgeneradas/recetasgeneradas.component';
import {MatTableModule} from '@angular/material/table';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MantencionComponent } from './views/mantencion/mantencion.component';
import { VersionIncorrectaComponent } from './views/version-incorrecta/version-incorrecta.component';
import { MantencionInterceptor } from './interceptors/mantencion.interceptor';
import { ProveedoresService } from './servicios/proveedores.service';
import { ModalBusquedaProductoConLoteComponent } from './views/modal-busqueda-producto-con-lote/modal-busqueda-producto-con-lote.component';
// import { InfconsumoporbodegasComponent } from './views/infconsumoporbodegas/infconsumoporbodegas.component';

import { IngresoOCComponent } from './views/ingreso-oc/ingreso-oc.component';
import { RecepcionOcComponent } from './views/recepcion-oc/recepcion-oc.component';
import { DevolucionOcComponent } from './views/devolucion-oc/devolucion-oc.component';
import { DistribucionOcEspComponent } from './views/distribucion-oc-esp/distribucion-oc-esp.component';
import { BuscaritemsOcComponent } from './views/buscaritems-oc/buscaritems-oc.component';
import { BuscarOcModalComponent } from './views/buscar-oc-modal/buscar-oc-modal.component';
import { OrdenCompraService } from './servicios/ordencompra.service';
import { BuscarOcModalProvComponent } from './views/buscar-oc-modal-prov/buscar-oc-modal-prov.component';
import { BusquedaproductosocmodalComponent } from './views/busquedaproductos-oc-modal/busquedaproductosocmodal.component';
import { ArticulosOcModalComponent } from './views/articulos-oc-modal/articulos-oc-modal.component';
import { DetalleOcModalComponent } from './views/detalle-oc-modal/detalle-oc-modal.component';
import { GuiasModalComponent } from './views/guias-modal/guias-modal.component';
import { BusquedaproveedorocmodalComponent } from './views/busquedaproveedor-oc-modal/busquedaproveedorocmodal.component';
import { DevolucionesOcComponent } from './views/devoluciones-oc/devoluciones-oc.component';
import { MantenedorProvComponent } from './views/mantenedor-prov/mantenedor-prov.component';
import { HistorialDevolucionesComponent } from './views/historialdevoluciones-modal/historialdevoluciones-modal.component';
import { ErrorDelServidorComponent } from './views/error-del-servidor/error-del-servidor.component';
import { RouteReuseStrategy } from '@angular/router';
import { CustomRouteReuseStrategy } from './custom-reuse-strategy';
import { PaginacionBoostrapComponent } from './components/paginacion-boostrap/paginacion-boostrap.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MantenedorDeParametrosComponent } from './views/mantenedor-de-parametros/mantenedor-de-parametros.component';
import {InventarioGeneraComponent} from './views/inventario-genera/inventario-genera.component';
import { PlantillaPrestamosComponent } from './views/prestamos/pages/plantilla-prestamos.component';
import { FieldErrorDisplayComponent } from './views/prestamos/components/field-error-display/field-error-display.component';
import { PrestamosService } from './servicios/prestamos.service';
import { ModalBuscarFarmacosComponent } from './views/prestamos/components/modal-buscar-farmacos/modal-buscar-farmacos.component';
import { ModalBuscarPrestamosComponent } from './views/prestamos/components/modal-buscar-prestamos/modal-buscar-prestamos.component';
import { ModalForzarCierreComponent } from './views/prestamos/components/modal-forzar-cierre/modal-forzar-cierre.component';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { MantencionarticulosChileComponent } from './views/mantencionarticulos/mantencionarticulos-chile/mantencionarticulos-chile.component';
import { MantencionarticulosFormComponent } from './views/mantencionarticulos/mantencionarticulos-form/mantencionarticulos-form.component';
import { AgregarArticulosFormComponent } from './views/mantencionarticulos/mantencionarticulos-form/agregar-articulos-form/agregar-articulos-form.component';
import { ModificarArticulosFormComponent } from './views/mantencionarticulos/mantencionarticulos-form/modificar-articulos-form/modificar-articulos-form.component';
import { AgregarArticulosChileComponent } from './views/mantencionarticulos/mantencionarticulos-chile/agregar-articulos-chile/agregar-articulos-chile.component';
import { ModificarArticulosChileComponent } from './views/mantencionarticulos/mantencionarticulos-chile/modificar-articulos-chile/modificar-articulos-chile.component';
import { AperturacierreinventarioComponent } from './views/aperturacierreinventario/aperturacierreinventario.component';
import { BloquearbodegasinventarioComponent } from './views/bloquearbodegasinventario/bloquearbodegasinventario.component';
import { ModalNuevoMovitoComponent } from './views/generaajusteinventario/modal-nuevo-motivo/modal-nuevo-motivo.component';
import { ModalAutorizaConteoInvenarioComponent } from './views/ingresoconteomanual/modal-autoriza-conteo-inventario/modal-autoriza-conteo-inventario';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotFoundPAgeComponent,
    HomeComponent,
    MenuprincipalComponent,
    MantencionarticulosComponent,
    ReposicionArticulosComponent,
    MovimientosComponent,
    BusquedapacientesComponent,
    BusquedamovimientosComponent,
    BusquedaproductosComponent,
    BusquedaProdDevolComponent,
    MovimientoDevolucionComponent,
    DespachosolicitudesComponent,
    ListadopararealizarinventarioComponent,
    GenerainventariosistemaComponent,
    SolicitudesManualesComponent,
    BusquedasolicitudesComponent,
    DevolucionsolicitudesComponent,
    UsuarioEstructuraConexionComponent,
    IngresoconteomanualComponent,
    GeneraajusteinventarioComponent,
    InformeexistenciasvalorizadasComponent,
    BusquedasolicitudpacientesComponent,
    DispensarsolicitudpacienteComponent,
    IngresoconteomanualComponent,
    GeneraajusteinventarioComponent,
    InformeexistenciasvalorizadasComponent,
    DispensarsolicitudpacienteComponent,
    EventosSolicitudComponent,
    EventosDetallesolicitudComponent,
    SolicitudpacienteComponent,
    ModalpacienteComponent,
    ModalAutorizaConteoInvenarioComponent,
    ModalNuevoMovitoComponent,
    DevolucionsolicitudespacientesComponent,
    RecepcionsolicitudesComponent,
    DevolucionpacientesComponent,
    BusquedamovimientopacienteambulatorioComponent,
    DespachoRecetasAmbulatoriaComponent,
    RecepciondevolucionentrebodegasComponent,
    BusquedamovimientosbodegasComponent,
    BusquedaSolicitudPacienteAmbulatorioComponent,
    NavbarComponent,
    SidebarComponent,
    ConsultakardexComponent,
    AjustestockComponent,
    AjustevaloresComponent,
    InformeajustesvalorizadosComponent,
    InformeajustesdepreciosComponent,
    BodegasComponent,
    BusquedabodegasComponent,
    PlantillassolicitudbodegaComponent,
    BusquedaplantillasbodegaComponent,
    MonitorEjecutivoComponent,
    FraccionamientoproductosComponent,
    BusquedaproductoafraccionarComponent,
    VersionesComponent,
    ControlStockMinimoComponent,
    LibrocontroladoComponent,
    ConsultalibrocontroladoComponent,
    BusquedaServiciosComponent,
    BusquedaUsuariosComponent,
    ConsultarecetaambulatoriaComponent,
    SolicitudConsumoComponent,
    BusquedaSolicitudConsumoComponent,
    BusquedaProductosConsumoComponent,
    PlantillaConsumoComponent,
    BusquedaPlantillaConsumoComponent,
    PanelIntegracionERPComponent,
    ListaEsperaRecetasComponent,
    AdministracionRolesComponent,
    BusquedaRolesComponent,
    BusquedaCentrosCostosComponent,
    NumberonlyDirective,
    DespachocostoservicioComponent,
    CreadispensasolicitudpacienteComponent,
    CierrekardexComponent,
    PanelIntegracionCargosComponent,
    DevolucionautopedidoComponent,
    BusquedacuentasComponent,
    CargofarmaciaComponent,
    MainNavComponent,
    ConsultapacienteComponent,
    MenuListItemComponent,
    ReportesComponent,
    BusquedarecetasComponent,
    SesionexpiradaComponent,
    ConsultafraccionamientoComponent,
    InflistaconteoinventarioComponent,
    AperturacierreinventarioComponent,
    BloquearbodegasinventarioComponent,
    InfconsolidadoxdevolucionesComponent,
    InftendenciasComponent,
    DevolucionfraccionamientoComponent,
    GenerardevolucionpacienteComponent,
    RecepciondevolucionpacienteComponent,
    ModalsolicitudpacdevueltaComponent,
    ModalvalidausuariodevolsolicitudComponent,
    ConsumopacienteporbodegaComponent,
    ModaldetallesolicitudMonitorERPComponent,
    PlantillasprocedimientosComponent,
    CreacionrecetasambulatoriasComponent,
    ModalbusquedaprofesionalComponent,
    ConsultalotesComponent,
    ConsultasaldosporbodegasComponent,
    Autopedido2Component,
    ModalbusquedalotesComponent,
    CambiaenlaceRscComponent,
    ModalbusquedadosComponent,
    DevolucionsolicitudesComponent,
    InfpedidoscongastoservicioComponent,
    LiberarsolireceComponent,
    ServicioreglasComponent,
    BusquedaservicioreglasComponent,
    BusquedarecetasanuladasComponent,
    RecetaanuladaComponent,
    RecetasgeneradasComponent,
    MantencionComponent,
    VersionIncorrectaComponent,
    ModalBusquedaProductoConLoteComponent,
    // InfconsumoporbodegasComponent,

    BuscarOcModalComponent,
    HistorialDevolucionesComponent,
    DetalleOcModalComponent,
    GuiasModalComponent,
    ArticulosOcModalComponent,
    BusquedaproductosocmodalComponent,
    BusquedaproveedorocmodalComponent,
    BuscarOcModalProvComponent,
    BuscarOcModalComponent,
    DetalleOcModalComponent,
    GuiasModalComponent,
    ArticulosOcModalComponent,
    BusquedaproductosocmodalComponent,
    BusquedaproveedorocmodalComponent,
    // --------------------------------------------- ORDEN COMPRA -----------------------------------
    IngresoOCComponent,
    RecepcionOcComponent,
    DevolucionOcComponent,
    DistribucionOcEspComponent,
    BuscaritemsOcComponent,
    DevolucionesOcComponent,
    MantenedorProvComponent,
    HistorialDevolucionesComponent,
    ErrorDelServidorComponent,
    PaginacionBoostrapComponent,
    MantenedorDeParametrosComponent,
    PlantillaPrestamosComponent,
    FieldErrorDisplayComponent,
    ModalBuscarFarmacosComponent,
    ModalBuscarPrestamosComponent,
    ModalForzarCierreComponent,
    MantencionarticulosChileComponent,
    MantencionarticulosFormComponent,
    AgregarArticulosFormComponent,
    ModificarArticulosFormComponent,
    AgregarArticulosChileComponent,
    ModificarArticulosChileComponent,

    InventarioGeneraComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    AlertModule.forRoot(),
    NgbModule,
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BrowserAnimationsModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    TypeaheadModule.forRoot(),
    SweetAlert2Module.forRoot({
      buttonsStyling: false,
      customClass: 'modal-content',
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn btn-danger ml-5',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }),
    NgxLoadingModule.forRoot({}),
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    NgxPaginationModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTableExporterModule,
    MatProgressSpinnerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    hesService,
    BodegasService,
    TipomovimientoService,
    MotivocargoService,
    BsModalService,
    MovimientosfarmaciaService,
    PacientesService,
    TipodocumentoidentService,
    BusquedaproductosService,
    DatePipe,
    BsLocaleService,
    BsDatepickerConfig,
    SolicitudService,
    RecepcionsolicitudesService,
    BusquedabodegasService,
    InventariosService,
    InterfacesService,
    NavService,
    CreasolicitudesService,
    { provide: HTTP_INTERCEPTORS, useClass: MantencionInterceptor, multi: true },
    ProveedoresService,
    OrdenCompraService,
    PrestamosService,
    // INTERCEPTORES: se ejecutaran en el orden en el que se declaran.
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: MantencionInterceptor, multi: true },
    // FIN INTERCEPTORES
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy,
    },
  ],

  bootstrap: [AppComponent],
  entryComponents: [
    BusquedapacientesComponent,
    BusquedamovimientosComponent,
    BusquedaproductosComponent,
    BusquedaProdDevolComponent,
    MovimientoDevolucionComponent,
    BusquedasolicitudesComponent,
    BusquedasolicitudpacientesComponent,
    EventosSolicitudComponent,
    EventosDetallesolicitudComponent,
    ModalpacienteComponent,
    BusquedamovimientopacienteambulatorioComponent,
    BusquedamovimientosbodegasComponent,
    BusquedaSolicitudPacienteAmbulatorioComponent,
    BusquedabodegasComponent,
    BusquedaplantillasbodegaComponent,
    BusquedaplantillasbodegaComponent,
    BusquedaproductoafraccionarComponent,
    BusquedaServiciosComponent,
    BusquedaUsuariosComponent,
    BusquedaSolicitudConsumoComponent,
    BusquedaProductosConsumoComponent,
    BusquedaPlantillaConsumoComponent,
    BusquedaRolesComponent,
    BusquedaCentrosCostosComponent,
    BusquedarecetasComponent,
    CargofarmaciaComponent,
    ConsultapacienteComponent,
    ModalsolicitudpacdevueltaComponent,
    ModalvalidausuariodevolsolicitudComponent,
    ModaldetallesolicitudMonitorERPComponent,
    ModalbusquedaprofesionalComponent,
    ModalbusquedalotesComponent,
    ModalbusquedadosComponent,
    DevolucionsolicitudesComponent,
    BusquedarecetasanuladasComponent,
    BusquedaservicioreglasComponent,
    ModalBusquedaProductoConLoteComponent,

    RecepcionOcComponent,
    BuscarOcModalComponent,
    DetalleOcModalComponent,
    GuiasModalComponent,
    ArticulosOcModalComponent,
    BusquedaproductosocmodalComponent,
    BusquedaproveedorocmodalComponent,
    HistorialDevolucionesComponent,
    ModalBusquedaProductoConLoteComponent,
    PlantillaPrestamosComponent,
    FieldErrorDisplayComponent,
    ModalBuscarFarmacosComponent,
    ModalBuscarPrestamosComponent,
    ModalForzarCierreComponent,
    ModalAutorizaConteoInvenarioComponent,
    ModalNuevoMovitoComponent
  ],
})
export class AppModule { }
