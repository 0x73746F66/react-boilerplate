#!/bin/sh
lsof -i tcp:8080 | awk 'NR!=1 {print $2}' | xargs kill
lsof -i tcp:3000 | awk 'NR!=1 {print $2}' | xargs kill
lsof -i tcp:3001 | awk 'NR!=1 {print $2}' | xargs kill
lsof -i tcp:3002 | awk 'NR!=1 {print $2}' | xargs kill
lsof -i tcp:3003 | awk 'NR!=1 {print $2}' | xargs kill