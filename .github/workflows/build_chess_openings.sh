#!/bin/bash

set -euo pipefail

cd frontend/public/eco
pip3 install chess
make
