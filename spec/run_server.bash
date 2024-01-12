#!/bin/bash

pipx ensurepath
source /root/.profile
pm2-runtime /app/bin/www --name epivar -i 8
