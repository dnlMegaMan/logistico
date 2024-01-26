echo "Compilando servicio de mantencion"
go build .\servicios\mantencion\mantencion.go
echo "Bajando servicios"
TASKKILL /IM mantencion.exe /F 
TASKKILL /IM main.exe /F 
TASKKILL /IM token.exe /F 
TASKKILL /IM ordencompra.exe /F 
echo "Levantando servidor de mantencion"
start mantencion

