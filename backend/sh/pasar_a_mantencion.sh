echo "Compilando servicio de mantencion"
go build ./servicios/mantencion/mantencion.go

echo "Bajando servicios"
pkill mantencion
pkill main
pkill token
# pkill ordencompra

echo "Levantando servidor de mantencion"
./mantencion &

echo "Validar servidor de mantencion"
ps -ef | grep mantencion