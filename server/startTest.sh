sudo mkdir -p /data/logs/nginx
sudo pkill -f nginx php-fpm
sudo nginx -c `pwd`/test.conf &
sudo php-fpm &
sudo nginx -V
