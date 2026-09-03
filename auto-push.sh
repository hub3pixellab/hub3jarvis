#!/bin/bash
cd "/Users/diogozachioliveira/projetos/hub3jarvis/hub3-jarvis"
git add .
git commit -m "Auto-push: $(date '+%d/%m/%Y %H:%M') - Hub3 v4.2"
git push origin main
