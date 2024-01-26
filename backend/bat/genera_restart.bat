echo "Compilando reiniciador de servicios"
go build .\servicios\restart\restart.go
echo "Bajando servicio"
TASKKILL /IM restart.exe /F 
echo "Levantando reiniciador de servicios"
start restart
