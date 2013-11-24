DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
perl -i -ple 's!root.*!root /www/dipei;! if `uname` =~ /linux/i' lepei.conf 
perl -i -ple 's!(?:user|group)\s*=\s*\K\w+!www!g if `uname` =~ /linux/i' etc/php-fpm.conf
sudo pkill -f nginx
sudo pkill -f php-fpm
sudo pkill -f mongod
sudo nginx -c `pwd`/lepei.conf &
sudo php-fpm -c etc --fpm-config etc/php-fpm.conf&
sudo nginx -V
sudo mongod --config "$DIR/mongod.conf"&
