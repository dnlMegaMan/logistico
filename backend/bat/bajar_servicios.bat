echo "bajando servicio"
pkill main
pkill token
echo "validar procesos bajados"
ps -ef | grep main
ps -ef | grep token

