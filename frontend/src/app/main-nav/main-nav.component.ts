import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { VERSION } from '@angular/material/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { Menu } from '../models/main-nav/menu';
import { NavItem } from '../nav-item';
import { NavService } from '../nav.service';
import { Permisosusuario } from '../permisos/permisosusuario';
import { hesService } from '../servicios/hes.service';
import { environment } from 'src/environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MainNavComponent implements AfterViewInit {
  @ViewChild('appDrawer', { static: false }) appDrawer: ElementRef;
  public modelopermisos: Permisosusuario = new Permisosusuario();
  version = VERSION;
  public menu: Menu = new Menu();
  public navItems: NavItem[] = [];
  /** var local que esconde menu */
  private visible = false;
  public menuVisible = true;

  // Carga el color de fondo del aplicativo
  colorFondo = {"background-color": environment.URLServiciosRest.color}

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private hes : hesService,
    public router: Router,
    public navService: NavService,
    public translate: TranslateService) {
      if(localStorage.getItem('language')){
        translate.setDefaultLang(localStorage.getItem('language'));
        translate.use(localStorage.getItem('language'));
      }else{
          translate.setDefaultLang(navigator.language);
          translate.use(navigator.language);
          localStorage.setItem('language', navigator.language);
      }
    }

  ngOnInit(): void {
    this.navItems = this.menu.navItems;
    this.menuMonitor();
    this.menuProducto();
    this.menuAdmCompras();
    this.menuAdmbodegas();
    this.menuMovbodegas();
    this.menuMovpacientes();
    this.menuConsumo();
    this.menuAutopedido();
    this.menuReportes();
    this.menuUsrRoles();
    this.menuIntegracion();
    this.menuCambioEnlace();
    this.menuConfiguracion();
    // this.menuServicioReglas();
    this.menuAcercade();
    this.menuInventarios();

    this.hes
      .EmpresaActual()
      .pipe(filter(empresa => empresa != null))
      .subscribe(() => {
        this.modelopermisos = new Permisosusuario();
        this.navItems = new Menu().navItems;
        this.menuMonitor();
        this.menuProducto();
        this.menuAdmCompras();
        this.menuAdmbodegas();
        this.menuMovbodegas();
        this.menuMovpacientes();
        this.menuConsumo();
        this.menuAutopedido();
        this.menuReportes();
        this.menuUsrRoles();
        this.menuIntegracion();
        this.menuCambioEnlace();
        this.menuConfiguracion();
        // this.menuServicioReglas();
        this.menuAcercade();
        this.menuInventarios();
      });
  }

  ngAfterViewInit() {
    this.navService.appDrawer = this.appDrawer;
  }

  menuMonitor() {
    const indMonitor = this.navItems.findIndex((d) => d.route === 'monitorejecutivo');
    if (!this.modelopermisos.monitor) {
      if (indMonitor >= 0) {
        this.navItems.splice(indMonitor, 1);
      }
    }
  }

  menuProducto() {
    const indproducto = this.navItems.findIndex((d) => d.route === 'producto');

    if (!this.modelopermisos.btnproducto) {
      if (indproducto >= 0) {
        this.navItems.splice(indproducto, 1);
      }
    } else {
      const menuProductos = this.navItems[indproducto].children;

      /** Producto > Mantencion de articulos */
      if (!this.modelopermisos.btnmantarticulo) {
        const indiceArticulos = menuProductos.findIndex((d) => d.route === 'mantencionarticulos');
        if (indiceArticulos >= 0) {
          menuProductos.splice(indiceArticulos, 0);
        }
      }

      /** al final verifica si menu no tiene submenu lo elimina */
      if (!menuProductos.length) {
        this.navItems.splice(indproducto, 1);
      }
    }
  }

  menuAdmCompras() {
    const indAdmCompras = this.navItems.findIndex((d) => d.route === 'admcompras');
    if (!this.modelopermisos.btnadmcompras) {
      if (indAdmCompras >= 0) {
        this.navItems.splice(indAdmCompras, 1);
      }
    } else {
      const menuCompras = this.navItems[indAdmCompras].children;

      /** Administracion de Compras > Ingreso de Orden de Compra */
      if (!this.modelopermisos.btningresocompras) {
        const indiceIngreso = menuCompras.findIndex((d) => d.route === 'ingreso-oc');
        if (indiceIngreso >= 0) {
          menuCompras.splice(indiceIngreso, 1);
        }
      }

      /** Administracion de Compras > Recepcion de Orden de Compra */
      if (!this.modelopermisos.btnrecepcioncompras) {
        const indiceRecepcion = menuCompras.findIndex((d) => d.route === 'recepcion-oc');
        if (indiceRecepcion >= 0) {
          menuCompras.splice(indiceRecepcion, 1);
        }
      }

      /** Administracion de Compras > Devolucion de Orden de Compra */
      if (!this.modelopermisos.btndevolucioncompras) {
        const indiceDevolucion = menuCompras.findIndex((d) => d.route === 'devolucion-oc');
        if (indiceDevolucion >= 0) {
          menuCompras.splice(indiceDevolucion, 1);
        }
      }

      /** Administracion de Compras > Devoluciones de Orden de Compra (Notas de credito) */
      if (!this.modelopermisos.btndevolucionesoc) {
        const indiceNotasCredito = menuCompras.findIndex((d) => d.route === 'devoluciones-oc');
        if (indiceNotasCredito >= 0) {
          menuCompras.splice(indiceNotasCredito, 1);
        }
      }

      /** Administracion de Compras > Mantenedor de proveedores */
      if (!this.modelopermisos.btnmantenedorprov) {
        const indiceProveedores = menuCompras.findIndex((d) => d.route === 'mantenedor-prov');
        if (indiceProveedores >= 0) {
          menuCompras.splice(indiceProveedores, 1);
        }
      }

      /** Administracion de Compras > Distribucion de Orden de Compra */
      if (!this.modelopermisos.btndistribucioncompras) {
        const indiceDistribucion = menuCompras.findIndex((d) => d.route === 'distribucion-oc-esp');
        if (indiceDistribucion >= 0) {
          menuCompras.splice(indiceDistribucion, 1);
        }
      }

      /** Administracion de Compras > Busqueda de productos en Orden de Compra */
      if (!this.modelopermisos.btnbusquedacompras) {
        const indiceBusqueda = menuCompras.findIndex((d) => d.route === 'buscaritems-oc');
        if (indiceBusqueda >= 0) {
          menuCompras.splice(indiceBusqueda, 1);
        }
      }

      /** al final verifica si menu no tiene submenu lo elimina */
      if (!menuCompras.length) {
        this.navItems.splice(indAdmCompras, 1);
      }
    }
  }

  menuAdmbodegas() {
    const indiceAdmBodegas = this.navItems.findIndex(d => d.route === 'admbodegas');
    if (!this.modelopermisos.btnadmbodegas) {
      if (indiceAdmBodegas >= 0) {
        this.navItems.splice(indiceAdmBodegas, 1);
      }
    } else {
      const menuBodegas = this.navItems[indiceAdmBodegas].children;

      /** AdmBodegas > Bodegas */
      if (!this.modelopermisos.btnbodegas) {
        /** indice submenus */
        const indbodegas = menuBodegas.findIndex(d => d.route === 'bodegas');
        if (indbodegas >= 0) {
          menuBodegas.splice(indbodegas, 1);
        }
      }

      /** AdmBodegas > Plantilla de Bodega */
      if (!this.modelopermisos.btnplantillabod) {
        const indplantbodegas = menuBodegas.findIndex(d => d.route === 'plantillasbodegas');
        if (indplantbodegas >= 0) {
          menuBodegas.splice(indplantbodegas, 1);
        }
      }

      /** AdmBodegas > Plantilla de Procedimientos */
      if (!this.modelopermisos.btnplantillaproced) {
        const indplantproce = menuBodegas.findIndex(d => d.route === 'plantillasprocedimientos');
        if (indplantproce >= 0) {
          menuBodegas.splice(indplantproce, 1);
        }
      }

      /** AdmBodegas > Fraccionamiento */
      const indiceFraccionamiento = menuBodegas.findIndex(d => d.route === 'admbodegas/mainfraccionamiento');

      if (!this.modelopermisos.btnfraccionamiento) {
        if (indiceFraccionamiento >= 0) {
          menuBodegas.splice(indiceFraccionamiento, 1);
        }
      } else {
        const submenuFraccionamiento = menuBodegas[indiceFraccionamiento].children;

        /** Adm Bodegas > Fraccionamiento > Fraccionamiento */
        if (!this.modelopermisos.btnfraccionamiento) {
          const indfraccio = submenuFraccionamiento.findIndex(d => d.route === 'fraccionamientoproductos');
          if (indfraccio >= 0) {
            submenuFraccionamiento.splice(indfraccio, 1);
          }
        }

        /** Adm Bodegas > Fraccionamiento > Consulta Fraccionamiento */
        if (!this.modelopermisos.btnconsultafraccionamiento) {
          const indfraccio = submenuFraccionamiento.findIndex(d => d.route === 'consultafraccionamiento');
          if (indfraccio >= 0) {
            submenuFraccionamiento.splice(indfraccio, 1);
          }
        }

        /** Adm Bodegas > Fraccionamiento > Devolución Fraccionamiento */
        if (!this.modelopermisos.btndevolfraccionamiento) {
          const inddevolfraccio = submenuFraccionamiento.findIndex(d => d.route === 'devolucionfraccionamiento');
          if (inddevolfraccio >= 0) {
            submenuFraccionamiento.splice(inddevolfraccio, 1);
          }
        }
      }

      /** AdmBodegas > Libro controlado */
      const indlcontrolado = menuBodegas.findIndex(d => d.route === 'admbodegas/mainlibrocontrolado');

      if (!this.modelopermisos.btnlibcontrolado) {
        if (indlcontrolado >= 0) {
          menuBodegas.splice(indlcontrolado, 1);
        }
      } else {
        const submenuLibroControlado = menuBodegas[indlcontrolado].children;

        /** AdmBodegas > Libro Controlado > Cierre */
        if (!this.modelopermisos.btncierre) {
          const indlibcierre = submenuLibroControlado.findIndex(d => d.route === 'librocontrolado');
          if (indlibcierre >= 0) {
            submenuLibroControlado.splice(indlibcierre, 1);
          }
        }

        /** AdmBodegas > Libro Controlado > Consulta */
        if (!this.modelopermisos.btnconsulta) {
          const indiceConsulta = submenuLibroControlado.findIndex(d => d.route === 'consultalibrocontrolado');
          if (indiceConsulta >= 0) {
            submenuLibroControlado.splice(indiceConsulta, 1);
          }
        }
      }

      /** AdmBodegas > Kardex */
      const indiceKardex = menuBodegas.findIndex(d => d.route === 'admbodegas/mainkardex');

      if (!this.modelopermisos.btnkardex) {
        if (indiceKardex >= 0) {
          menuBodegas.splice(indiceKardex, 1);
        }
      } else {
        const submenuKardex = menuBodegas[indiceKardex].children;

        /** AdmBodegas > Kardex > Consulta */
        if (!this.modelopermisos.btnconsultakardex) {
          const indiceConsulta = submenuKardex.findIndex(d => d.route === 'consultadekardex');
          if (indiceConsulta >= 0) {
            submenuKardex.splice(indiceConsulta, 1);
          }
        }

         /** AdmBodegas > Kardex > Cierre */
         if (!this.modelopermisos.btncierrekardex) {
          const indiceCierre = submenuKardex.findIndex(d => d.route === 'cierrekardex');
          if (indiceCierre >= 0) {
            submenuKardex.splice(indiceCierre, 1);
          }
        }
      }

      /** AdmBodegas > Submenu Ajustes */
      const indajustes = menuBodegas.findIndex(d => d.route === 'admbodegas/ajustes');

      /** AdmBodegas > Ajustes */
      if (!this.visible) {
        if (indajustes >= 0) {
          menuBodegas.splice(indajustes, 1);
        }
      }

      /** al final verifica si menu no tiene submenu lo elimina */
      if (!menuBodegas.length) {
        this.navItems.splice(indiceAdmBodegas, 1);
      }
    }
  }

  menuMovbodegas() {
    const indiceMovBodegas = this.navItems.findIndex(d => d.route === 'movbodegas');

    if (!this.modelopermisos.btnmovbodega) {
      if (indiceMovBodegas >= 0) {
        this.navItems.splice(indiceMovBodegas, 1);
      }
    } else {
      const menuMovBodegas = this.navItems[indiceMovBodegas].children;

      /** Movimientos Bodegas > Generar Solicitudes */
      if (!this.modelopermisos.btnadmsol) {
        const indadmsol = menuMovBodegas.findIndex(d => d.route === 'creasolicitud');
        if (indadmsol >= 0) {
          menuMovBodegas.splice(indadmsol, 1);
        }
      }

      /** Movimientos Bodegas > Reposicion Articulo */
      if (!this.modelopermisos.btnrepoarticulos) {
        const indrepart = menuMovBodegas.findIndex(d => d.route === 'reposicionarticulos');
        if (indrepart >= 0) {
          menuMovBodegas.splice(indrepart, 1);
        }
      }

      /** Movimientos Bodegas > Despachar Solicitudes */
      if (!this.modelopermisos.btndespsol) {
        const indbtndespsol = menuMovBodegas.findIndex(d => d.route === 'despachosolicitudes');
        if (indbtndespsol >= 0) {
          menuMovBodegas.splice(indbtndespsol, 1);
        }
      }

      /** Movimientos Bodegas > Recepcion Solicitudes */
      if (!this.modelopermisos.btnrecepsol) {
        const indrecepsol = menuMovBodegas.findIndex(d => d.route === 'recepcionsolicitudes');
        if (indrecepsol >= 0) {
          menuMovBodegas.splice(indrecepsol, 1);
        }
      }

      /** Movimientos Bodegas > Devolucion Solicitudes */
      if (!this.modelopermisos.btndevsol) {
        const indDevsol = menuMovBodegas.findIndex(d => d.route === 'devolucionsolicitudes');
        if (indDevsol >= 0) {
          menuMovBodegas.splice(indDevsol, 1);
        }
      }

      /** Movimientos Bodegas > Recepcion Devolucion entre Bodegas */
      if (!this.modelopermisos.btnrecepdevbod) {
        const indrecepdevbod = menuMovBodegas.findIndex(d => d.route === 'recepciondevolucionbodegas');
        if (indrecepdevbod >= 0) {
          menuMovBodegas.splice(indrecepdevbod, 1);
        }
      }

      /** Movimientos Bodegas > Control Stock Minimo */
      if (!this.modelopermisos.btnctrlstockmin) {
        const indctrlstockmin = menuMovBodegas.findIndex(d => d.route === 'controlstockminimo');
        if (indctrlstockmin >= 0) {
          menuMovBodegas.splice(indctrlstockmin, 1);
        }
      }

      /** Movimientos Bodegas > Recepción Devolución Paciente */
      if (!this.modelopermisos.menudevolpac) {
        const indmenudevolpac = menuMovBodegas.findIndex(d => d.route === 'recepciondevolucionpaciente');
        if (indmenudevolpac >= 0) {
          menuMovBodegas.splice(indmenudevolpac, 1);
        }
      }

      /** Movimientos Bodegas > Consulta de Saldos por Bodega */
      if (!this.modelopermisos.menuconsultasaldobodega) {
        const indconsultasaldobod = menuMovBodegas.findIndex(d => d.route === 'consultasaldosporbodegas');
        if (indconsultasaldobod >= 0) {
          menuMovBodegas.splice(indconsultasaldobod, 1);
        }
      }

      /** Movimientos Bodegas > Consulta De Lotes */
      if (!this.modelopermisos.menuconsultalote) {
        const indmenuconsultalote = menuMovBodegas.findIndex(d => d.route === 'consultalotes');
        if (indmenuconsultalote >= 0) {
          menuMovBodegas.splice(indmenuconsultalote, 1);
        }
      }
      /** Movimientos Bodegas > Prestamos */
      if (!this.modelopermisos.menuprestamos) {
        const indmenuprestamo = menuMovBodegas.findIndex(d => d.route === 'prestamos');
        if (indmenuprestamo >= 0) {
          menuMovBodegas.splice(indmenuprestamo, 1);
        }
      }

      /** al final verifica si menu no tiene submenu lo elimina */
      if (!menuMovBodegas.length) {
        this.navItems.splice(indiceMovBodegas, 1);
      }
    }
  }

  menuMovpacientes() {
    /** indice menu */
    const indiceMovPacientes = this.navItems.findIndex(d => d.route === 'movpacientes');
    if (!this.modelopermisos.btnmovpaciente) {
      if (indiceMovPacientes >= 0) {
        this.navItems.splice(indiceMovPacientes, 1);
      }
    } else {
      const menuMovPacientes = this.navItems[indiceMovPacientes].children;

      /** Movimientos Pacientes > Solicitudes Pacientes */
      if (!this.modelopermisos.btnsolpaciente) {
        /** indice submenus */
        const indsolpaciente = menuMovPacientes.findIndex(d => d.route === 'solicitudpaciente');
        if (indsolpaciente >= 0) {
          menuMovPacientes.splice(indsolpaciente, 1);
        }
      }

      /** Movimientos Pacientes > Despachar Solicitudes */
      if (!this.modelopermisos.btndispsolpac) {
        const indDispsolpac = menuMovPacientes.findIndex(d => d.route === 'dispensarsolicitudespacientes');
        if (indDispsolpac >= 0) {
          menuMovPacientes.splice(indDispsolpac, 1);
        }
      }

      /** Movimientos Pacientes > Crea Dispensa Solicitudes */
      if (!this.modelopermisos.btncreadispsolpac) {
        const indCreaDispsolpac = menuMovPacientes.findIndex(d => d.route === 'creadispensasolicitudpaciente');
        if (indCreaDispsolpac >= 0) {
          menuMovPacientes.splice(indCreaDispsolpac, 1);
        }
      }

      /** Movimientos Pacientes > Genera Devolución */
      if (!this.modelopermisos.btngeneradevolpac) {
        const indDevolsolpac = menuMovPacientes.findIndex(d => d.route === 'generadevolucionpaciente');
        if (indDevolsolpac >= 0) {
          menuMovPacientes.splice(indDevolsolpac, 1);
        }
      }

      /** Movimientos Pacientes > Recepcion Devolucion Pacientes */
      if (!this.modelopermisos.btnrecepdevolpac) {
        const indrecepdevolpac = menuMovPacientes.findIndex(d => d.route === 'devolucionpacientes');
        if (indrecepdevolpac >= 0) {
          menuMovPacientes.splice(indrecepdevolpac, 1);
        }
      }

      /** Movimientos Pacientes > Creación Recetas Ambulatorias*/
      if (!this.modelopermisos.btncreacionrecetas) {
        const indCreacionrecetas = menuMovPacientes.findIndex(d => d.route === 'creacionrecetasambulatorias');
        if (indCreacionrecetas >= 0) {
          menuMovPacientes.splice(indCreacionrecetas, 1);
        }
      }

      /** Movimientos Pacientes > Despacho Recetas */
      if (!this.modelopermisos.btndesprecetas) {
        const indDesprecetas = menuMovPacientes.findIndex(d => d.route === 'despachorecetasambulatoria');
        if (indDesprecetas >= 0) {
          menuMovPacientes.splice(indDesprecetas, 1);
        }
      }

      /** Movimientos Pacientes > Consulta Recetas Programadas */
      if (!this.modelopermisos.btnconsulrecetas) {
        const indconsulrecetas = menuMovPacientes.findIndex(d => d.route === 'consultarecetasambulatoria');
        if (indconsulrecetas >= 0) {
          menuMovPacientes.splice(indconsulrecetas, 1);
        }
      }

      /** Movimientos Pacientes > Busqueda en Cuentas */
      if (!this.modelopermisos.btnbusquedacuentas) {
        const indbusquedacuentas = menuMovPacientes.findIndex(d => d.route === 'busquedacuentas');
        if (indbusquedacuentas >= 0) {
          menuMovPacientes.splice(indbusquedacuentas, 1);
        }
      }

      /** Movimientos Pacientes > Consumo paciente por bodega*/
      if (!this.modelopermisos.btnconsumopacbodega) {
        const indconsumopac = menuMovPacientes.findIndex(d => d.route === 'consumopacienteporbodega');
        if (indconsumopac >= 0) {
          menuMovPacientes.splice(indconsumopac, 1);
        }
      }

      /** Movimientos Pacientes > Recetas Anuladas */
      if (!this.modelopermisos.btnSolReceAnulada) {
        const indSolReceAnulada = menuMovPacientes.findIndex(d => d.route === 'recetaanulada');
        if (indSolReceAnulada >= 0) {
          menuMovPacientes.splice(indSolReceAnulada, 1);
        }
      }

      /** al final verifica si menu no tiene submenu lo elimina */
      if (!menuMovPacientes.length) {
        this.navItems.splice(indiceMovPacientes, 1);
      }
    }
  }

  menuInventarios(){
    const indiceInventarios = this.navItems.findIndex(d => d.route === 'inventarios');

    if (!this.modelopermisos.btnadminventarios) {
      if (indiceInventarios >= 0) {
        this.navItems.splice(indiceInventarios, 1);
      }
    }else{

      const menuInventarios = this.navItems[indiceInventarios].children;

      if(!this.modelopermisos.btnaperturacierreinventario){
        const indaperturacierre = menuInventarios.findIndex(d => d.route === 'aperturacierreinventario');
        if(indaperturacierre >= 0){
          menuInventarios.splice(indaperturacierre, 1);
        }
      }

      if(!this.modelopermisos.btnbloquearbodegasinventario){
        const indbloquearbodegas = menuInventarios.findIndex(d => d.route === 'bloquearbodegasinventario');
        if(indbloquearbodegas >= 0){
          menuInventarios.splice(indbloquearbodegas, 1);
        }
      }

      if(!this.modelopermisos.btninformelistaconteoinventario){
        const indlistaconteo = menuInventarios.findIndex(d => d.route === 'informeconteolistainventario');
        if(indlistaconteo >= 0){
          menuInventarios.splice(indlistaconteo, 1);
        }
      }

      if(!this.modelopermisos.btninventariogenera){
        const indinventariogenera = menuInventarios.findIndex(d => d.route === 'inventariogenera');
        if(indinventariogenera >= 0){
          menuInventarios.splice(indinventariogenera, 1);
        }
      }

      if(!this.modelopermisos.btningresoconteomanual){
        const indingresoconteomanual = menuInventarios.findIndex(d => d.route === 'ingresoconteomanual');
        if(indingresoconteomanual >= 0){
          menuInventarios.splice(indingresoconteomanual, 1);
        }
      }

      if(!this.modelopermisos.btngeneraajusteinventario){
        const indgeneraajusteinventario = menuInventarios.findIndex(d => d.route === 'generaajusteinventario');
        if(indgeneraajusteinventario >= 0){
          menuInventarios.splice(indgeneraajusteinventario, 1);
        }
      }

      if (!this.modelopermisos.btninformeexistenciasvalorizadas) {
        const indinformeexistenciasvalorizadas = menuInventarios.findIndex(d => d.route === 'informeexistenciasvalorizadas');
        if (indinformeexistenciasvalorizadas >= 0) {
          menuInventarios.splice(indinformeexistenciasvalorizadas, 1);
        }
      }
    }
  }

  menuReportes(){
    const indiceReportes = this.navItems.findIndex(d => d.route === 'reportes');

    if (!this.modelopermisos.btnreportes) {
      if (indiceReportes >= 0) {
        this.navItems.splice(indiceReportes, 1);
      }
    } else {
      const menuReportes = this.navItems[indiceReportes].children;

      /** Reportes > Reimpresion Solicitudes */
      if (!this.modelopermisos.btnreimpresionsolicitud) {
        const indreimpsolic = menuReportes.findIndex(d => d.route === 'reimpresionsolicitudes');
        if (indreimpsolic >= 0) {
          menuReportes.splice(indreimpsolic, 1);
        }
      }

      /** Reportes > Lista Conteo Inventario */
      if (!this.modelopermisos.btnlistaconteoinventario) {
        const indlistaconteo = menuReportes.findIndex(d => d.route === 'informeconteolistainventario');
        if (indlistaconteo >= 0) {
          menuReportes.splice(indlistaconteo, 1);
        }
      }

      /** Reportes > Consumo por Bodegas */
      if (!this.modelopermisos.btnconsumoporbodega) {
        const indconsumobodega = menuReportes.findIndex(d => d.route === 'inftendencias');
        if (indconsumobodega >= 0) {
          menuReportes.splice(indconsumobodega, 1);
        }
      }

      /** Reportes > Pedidos con gasto servicio */
      if (!this.modelopermisos.menugastoservicio) {
        const indgastoservicio = menuReportes.findIndex(d => d.route === 'infpedidosgastoservicio');
        if (indgastoservicio >= 0) {
          menuReportes.splice(indgastoservicio, 1);
        }
      }

      /** Reportes > Impresión reporte de Recetas Generadas */
      if (!this.modelopermisos.menurecetasgeneradas) {
        const recetasgeneradas = menuReportes.findIndex(d => d.route === 'recetasgeneradas');
        if (recetasgeneradas >= 0) {
          menuReportes.splice(recetasgeneradas, 1);
        }
      }

      /** al final verifica si menu no tiene submenu lo elimina */
      if (!menuReportes.length) {
        this.navItems.splice(indiceReportes, 1);
      }
    }
  }

  menuConsumo() {
    const indconsumo = this.navItems.findIndex((d) => d.route === 'consumo');

    if (!this.modelopermisos.btnconsumo) {
      if (indconsumo >= 0) {
        this.navItems.splice(indconsumo, 1);
      }
    } else {
      const menuConsumo = this.navItems[indconsumo].children;

      /** Consumo > Solicitud Consumo */
      if (!this.modelopermisos.btnsolconsumo) {
        const indsolconsumo = menuConsumo.findIndex((d) => d.route === 'solicitudconsumo');
        if (indsolconsumo >= 0) {
          menuConsumo.splice(indsolconsumo, 1);
        }
      }

      /** Consumo > Plantilla Consumo */
      if (!this.modelopermisos.btnplantconsumo) {
        const indplantconsumo = menuConsumo.findIndex((d) => d.route === 'plantillaconsumo');
        if (indplantconsumo >= 0) {
          menuConsumo.splice(indplantconsumo, 1);
        }
      }

      /** al final verifica si menu no tiene submenu lo elimina */
      if (!menuConsumo.length) {
        this.navItems.splice(indconsumo, 1);
      }
    }
  }

  menuAutopedido(){
    const indiceAutopedido = this.navItems.findIndex((d) => d.route === 'autopedido');

    if (!this.modelopermisos.btnMenuAutopedido) {
      if (indiceAutopedido >= 0) {
        this.navItems.splice(indiceAutopedido, 1);
      }
    } else {
      const menuAutopedido = this.navItems[indiceAutopedido].children;

      /** Solicitud Autopedido */
      if (!this.modelopermisos.btnMenuAutopedido) {
        const indiceSolicitud = menuAutopedido.findIndex((d) => d.route === 'autopedido');
        if (indiceSolicitud >= 0) {
          menuAutopedido.splice(indiceSolicitud, 1);
        }
      }

      /** Devolucion Autopedido */
      if (!this.modelopermisos.btnMenuDevolAutopedido) {
        const indiceDevolucion = menuAutopedido.findIndex((d) => d.route === 'devolucionautopedido');
        if (indiceDevolucion >= 0) {
          menuAutopedido.splice(indiceDevolucion, 1);
        }
      }
      /** al final verifica si menu no tiene submenu lo elimina */
      if (!menuAutopedido.length) {
        this.navItems.splice(indiceAutopedido, 1);
      }
    }
  }

  // menuBusqctas() {
  //   /** indice menu */
  //   const indbusqctas = this.navItems.findIndex(d => d.route === 'busquedacuentas', 1);
  //   // if (!this.modelopermisos.btnxxxx) { // <- Falta asignar codigo de rol
  //   //   this.navItems.splice(indbusqctas, 1);
  //   // }
  // }

  menuUsrRoles() {
    /** indice menu */
    const indiceRoles = this.navItems.findIndex(d => d.route === 'rolesusuarios');
    if (!this.modelopermisos.btnusroles) {
      if (indiceRoles >= 0) {
        this.navItems.splice(indiceRoles, 1);
      }
    }
  }

  menuIntegracion() {
    /** indice menu */
    const indintegracion = this.navItems.findIndex(d => d.route === 'integracion');
    if (!this.modelopermisos.btnMenuInterfaz) {
      if (indintegracion >= 0) {
        this.navItems.splice(indintegracion, 1);
      }
    } else {
      const menuIntegracion = this.navItems[indintegracion].children;

      /** Integracion > Visor Cargos */
      if (!this.modelopermisos.btnMenuInterfazCargos) {
        const indcargos = menuIntegracion.findIndex(d => d.route === 'PanelIntegracionCargosComponent');
        if (indcargos >= 0) {
          menuIntegracion.splice(indcargos, 1);
        }
      }

      /** Integracion > Visor ERP */
      if (!this.modelopermisos.btnMenuInterfazErp) {
        const inderp = menuIntegracion.findIndex(d => d.route === 'PanelIntegracionERPComponent');
        if (inderp >= 0) {
          menuIntegracion.splice(inderp, 1);
        }
      }

      /** al final verifica si menu no tiene submenu lo elimina */
      if (!menuIntegracion.length) {
        this.navItems.splice(indintegracion, 1);
      }
    }
  }

  menuCambioEnlace() {
    const indCambiaEnlace = this.navItems.findIndex(d => d.route === 'cambiaenlacersc');
    if (!this.modelopermisos.btncambioenlace) {
      if (indCambiaEnlace >= 0) {
        this.navItems.splice(indCambiaEnlace, 1);
      }
    }
  }

  menuConfiguracion() {
    const indconfg = this.navItems.findIndex(d => d.route === 'configuracion', 1);

    if (!this.modelopermisos.btnconfiguracion) {
      if (indconfg >= 0) {
        this.navItems.splice(indconfg, 1);
      }
    } else {
      const menuConfiguracion = this.navItems[indconfg].children;

      /** submenu liberar solicitud receta */
      if (!this.modelopermisos.btnliberarsolirece) {
        const indiceLiberarSolicitud = menuConfiguracion.findIndex(d => d.route === 'liberarsolirece')
        if (indiceLiberarSolicitud >= 0) {
          menuConfiguracion.splice(indiceLiberarSolicitud, 1);
        }
      }

      /** submenu Mantenedor de Reglas */
      if (!this.modelopermisos.btnservicioreglas) {
        const indiceMantenedorReglas = menuConfiguracion.findIndex(d => d.route === 'servicioreglas')
        if (indiceMantenedorReglas >= 0) {
          menuConfiguracion.splice(indiceMantenedorReglas, 1);
        }
      }

      /** Submenu Mantenedor de parametros */
      if (!this.modelopermisos.btnMantenedorParametros) {
        const indiceMantenedorParametros = menuConfiguracion.findIndex(d => d.route === 'mantenedor-parametros')
        if (indiceMantenedorParametros >= 0) {
          menuConfiguracion.splice(indiceMantenedorParametros, 1);
        }
      }

      /** al final verifica si menu no tiene submenu lo elimina */
      if (!this.navItems[indconfg].children.length) {
        this.navItems.splice(indconfg, 1);
      }
    }
  }

  menuAcercade() {
    /** indice menu */
    // const indacercade = this.navItems.findIndex(d => d.route === 'acercade', 1);
    // if (!this.modelopermisos.btnacercade) {
    //   if (indacercade >= 0) {
    //     this.navItems.splice(indacercade, 1);
    //   }
    // } else {
    //   /** Versiones */
    //   if (!this.modelopermisos.btnversiones) {
    //     this.navItems[indacercade].children.shift();
    //   }
    //   /** al final verifica si menu no tiene submenu lo elimina */
    //   if (!this.navItems[indacercade].children.length) {
    //     this.navItems.splice(indacercade, 1);
    //   }
    // }
  }
}
