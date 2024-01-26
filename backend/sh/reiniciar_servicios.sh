#!/bin/bash

echo "bajando servicio"
pkill main
pkill token
# pkill ordencompra

echo "subiendo servicios"
./main &
./token &
#./ordencompra

echo "validar procesos"
ps -ef | grep main
ps -ef | grep token
# ps -ef | grep ordencompra

