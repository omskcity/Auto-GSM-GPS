#!/bin/sh

mvn dependency:build-classpath -Dmdep.outputFile=cp.txt
cp=$(cat cp.txt);
nohup java -cp "./target/runner-1.0.jar:$cp" ModuleRunner auth navisetGT20 clientServer &