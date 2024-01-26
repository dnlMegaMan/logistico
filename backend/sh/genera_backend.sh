echo "Buscar Actualizaciones"
go mod tidy

echo "compilando golang"
go build ./servicios/main/main.go
go build ./servicios/token/token.go
# go build ./servicios/ordencompra/ordencompra.go
go build ./servicios/restart/restart.go
echo "bajando servicio"
pkill main
pkill token
# pkill ordencompra
pkill restart 
echo "subiendo servicios"
./main &
./token &
# ./ordencompra&
./restart &
echo "validar procesos"
ps -ef | grep main
ps -ef | grep token
# ps -ef | grep ordencompra
ps -ef | grep restart
