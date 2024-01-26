package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"

	controller "sonda.com/logistico/Modulos/controller"
	controlleroc "sonda.com/logistico/Modulos/ordencompracontroller"
	logs "sonda.com/logistico/logging"
	mdw "sonda.com/logistico/middleware"
)

func main() {
	// CARGAR VARIABLES DE ENTORNO
	err := godotenv.Load()
	if err != nil {
		log.Fatal("No puede cargar variables de entorno", err.Error())
	}

	// CONFIGURAR LOGS
	logs.InicializarLoggers(logs.OrdenCompraLogger, logs.BDConnectionLogger)
	tipoLogger := logs.OrdenCompraLogger
	logger := logs.ObtenerLogger(tipoLogger)

	// DEFINIR SERVICIOS OC
	http.HandleFunc("/", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controller.EchoString))))
	http.HandleFunc("/listamediopago", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaMedioPago))))
	http.HandleFunc("/listatipodocumento", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaTipoDocumento))))
	http.HandleFunc("/listaproveedor", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaProveedor))))
	http.HandleFunc("/buscarultimaoc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscarUltimaOc))))
	http.HandleFunc("/buscarultimarecep", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscarUltimaRecep))))
	http.HandleFunc("/buscaroc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscarOc))))
	http.HandleFunc("/generaroc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.GrabarOrdenCompra))))
	http.HandleFunc("/buscarocdet", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscarOcDet))))
	http.HandleFunc("/listaestadooc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaEstadoOc))))
	http.HandleFunc("/listamotivodevolucion", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaMotivoDevolucion))))
	http.HandleFunc("/listaciudad", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaCiudad))))
	http.HandleFunc("/listacomuna", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaComuna))))
	http.HandleFunc("/listapais", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaPais))))
	http.HandleFunc("/listaregion", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaRegion))))
	http.HandleFunc("/buscarocfiltro", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscarOcFiltro))))
	http.HandleFunc("/grabarrecepcionoc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.GrabarRecepcionOc))))
	http.HandleFunc("/buscaregistroart", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscaRegistroArticulo))))
	http.HandleFunc("/emitiroc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.EmitirOc))))
	http.HandleFunc("/anularoc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.AnularOc))))
	http.HandleFunc("/revertiroc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.RevertirOc))))
	http.HandleFunc("/modificarordencompra", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ModificarOrdenCompra))))
	http.HandleFunc("/cerraroc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.CerrarOc))))
	http.HandleFunc("/grabarordencompra", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.GrabarOrdenCompra))))
	http.HandleFunc("/buscarguiafiltro", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscarGuiaFiltro))))
	http.HandleFunc("/grabardevolucionoc", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.GrabarDevolucionOc))))
	http.HandleFunc("/buscaproveedorfiltro", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscarProveedorFiltro))))
	http.HandleFunc("/buscarnotafiltro", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscarNotaFiltro))))
	http.HandleFunc("/asociarmeinprov", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.AsociarMeinProv))))
	http.HandleFunc("/listarmeinbodega", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListarMeinBodega))))
	http.HandleFunc("/historialdevoluciones", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.HistorialDevoluciones))))
	http.HandleFunc("/buscadetallearticulosprov", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.BuscaDetalleArticulosProv))))

	/** Parametros Pedido Sugerido*/
	http.HandleFunc("/listapedidosugerido", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaPedidoSugerido))))
	http.HandleFunc("/guardapedidosugerido", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.GuardaPedidoSugerido))))
	http.HandleFunc("/listaprogramacionguiapedido", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.ListaProgramacionGuiaPedido))))
	http.HandleFunc("/guardarprogramacionguiapedido", mdw.PanicRecovery(tipoLogger, mdw.Preflight(mdw.Autenticacion(controlleroc.GuardarProgramacionGuiaPedido))))

	// LEVANTAR SERVIDOR
	msgInicioServicios := "Inicio de ordencompra.go en http://localhost:8093"
	log.Println(msgInicioServicios)
	logger.Info(logs.InformacionLog{Mensaje: msgInicioServicios})

	log.Fatal(http.ListenAndServe(":8093", nil))
}
