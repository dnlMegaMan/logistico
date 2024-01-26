#!/bin/bash
#Scripts to start services if not running
#Specify Profile Path Here
Profile=/opt/projects/backend
cd $Profile
ps -ef | grep ./main |grep -v grep >> /opt/projects/backend/respaldo_log/cron_restart.log  2>&1
if [ $? != 0 ]
then
       echo 'entro main '`date +%Y-%m-%d_%H.%M.%S`  >> /opt/projects/backend/respaldo_log/cron_restart.log  2>&1
       .main & >> /opt/projects/backend/respaldo_log/cron_restart.log  2>&1
fi
ps -ef | grep ./token |grep -v grep >> /opt/projects/backend/respaldo_log/cron_restart.log  2>&1
if [ $? != 0 ]
then
       echo 'entro token '`date +%Y-%m-%d_%H.%M.%S`  >> /opt/projects/backend/respaldo_log/cron_restart.log  2>&1
       .token & >> /opt/projects/backend/respaldo_log/cron_restart.log  2>&1
fi
ps -ef | grep ./ordencompra |grep -v grep >> /opt/projects/backend/respaldo_log/cron_restart.log  2>&1
if [ $? != 0 ]
then
       echo 'entro ordencompra '`date +%Y-%m-%d_%H.%M.%S`  >> /opt/projects/backend/respaldo_log/cron_restart.log  2>&1
       .ordencompra & >> /opt/projects/backend/respaldo_log/cron_restart.log  2>&1
fi
