cd /var/www/html
mv  logistico  logistico`date +%Y-%m-%d_%H.%M.%S`
mv  logisticopublica  logisticopublica`date +%Y-%m-%d_%H.%M.%S`
cd /home/admcli/logistico/frontend
\cp -rf logistico* /var/www/html
 
cd /opt/projects
tar cf RespaldoBackend`date +%Y-%m-%d_%H.%M.%S`.tar backend/
\rm -rf backend

cd /home/admcli/logistico
 \cp -rf backend /opt/projects/

cd /opt/projects/backend/sh
\cp -rf *.sh /opt/projects/backend

cd /opt/projects/backend 
chmod 777 *.sh
./genera_backend.sh

