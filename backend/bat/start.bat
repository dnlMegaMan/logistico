echo "bajando servicio"
TASKKILL /IM main.exe /F 
@REM TASKKILL /IM token.exe /F 
@REM TASKKILL /IM template.exe /F 
echo "subiendo servicios"
start main 
@REM start token
@REM start template  
