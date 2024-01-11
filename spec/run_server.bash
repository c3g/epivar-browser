#!/bin/bash

export HOME=/app

npm install -g pm2
pipx ensurepath
source $HOME/.profile
pm2-runtime /app/bin/www --name epivar -i 0
