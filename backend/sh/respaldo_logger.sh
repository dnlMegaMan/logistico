#!/bin/bash
echo "respaldando log's `date +%Y-%m-%d_%H:%M:%S`"
cd /opt/projects/backend/
cp main.log /opt/projects/backend/respaldo_log/main.log`date +%Y-%m-%d_%H.%M.%S` && > main.log
cp token.log /opt/projects/backend/respaldo_log/token.log`date +%Y-%m-%d_%H.%M.%S` && > token.log
cp restart.log /opt/projects/backend/respaldo_log/restart.log`date +%Y-%m-%d_%H.%M.%S` && > restart.log
cp BDConnection.log /opt/projects/backend/respaldo_log/BDConnection.log`date +%Y-%m-%d_%H.%M.%S` && > BDConnection.log
cp loggerXML.log /opt/projects/backend/respaldo_log/xml/loggerXML.log`date +%Y-%m-%d_%H.%M.%S` && > loggerXML.log
