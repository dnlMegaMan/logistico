echo "bajando servicio"
TASKKILL /IM main.exe /F 
TASKKILL /IM token.exe /F 
TASKKILL /IM ordencompra.exe /F 
TASKKILL /IM mantencion.exe /F 
echo "subiendo servicios"
start main 
start token 
start ordencompra 
