sudo postconf -e 'mydestination=loopei.com,mail.loopei.com'
sudo postconf -e 'home_mailbox = /data/mail/'
sudo postconf -e 'smtpd_sasl_type = dovecot' 
sudo postconf -e 'smtpd_sasl_path = private/auth-client' 
sudo postconf -e 'smtpd_sasl_local_domain =' 
sudo postconf -e 'smtpd_sasl_security_options = noanonymous' 
sudo postconf -e 'broken_sasl_auth_clients = yes' 
sudo postconf -e 'smtpd_sasl_auth_enable = yes' 
sudo postconf -e 'smtpd_recipient_restrictions = permit_sasl_authenticated,permit_mynetworks,reject_unauth_destination' 
sudo postconf -e 'inet_interfaces = all' 
