#/bin/sh

if [ $# -ne 2 ]; then
	echo "USE: install.sh <path to install static files> <path to install django>"
	exit
fi

echo "cp -r static/* $1/"
cp -r static/* $1

echo "cp -r django/* $2/"
cp -r django/* $2:
