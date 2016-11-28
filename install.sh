#/bin/sh

if [ $# -ne 3 ]; then
	echo "USE: install.sh <path to install static files> <path to install django> <uid:gid to chown to> "
	exit
fi

echo "cp -r static/* $1/"
cp -r static/* $1
echo "chown -R $3 $1"
chown -R $3 $1

echo "cp -r django/* $2/"
cp -r django/* $2
echo "chown -R $3 $2"
chown -R $3 $2


echo "Remember to add ALLOWED_HOSTS to the django settings"
echo "Remember to change path to images"

