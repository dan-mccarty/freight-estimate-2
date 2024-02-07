# LOGIN 
ssh root@170.64.141.132

# password
!X7t4ie3bj

# update
apt update && apt upgrade

# create new linux user
adduser dan

# password
dmfu

# add user to sudo group
usermod -aG sudo dan

# change user
su - dan




# install node
# https://github.com/nodesource/distributions
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

# check node & npm installed
node --version
npm --version

# make and move to apps dir
mkdir apps
cd apps




# ---- make sure project pushed to github ---- 

# download project
git clone https://github.com/dan-mccarty/freight-estimate-2.git

# create and update .env file
touch .env
nano .env
cp ./.env ./freight-estimate-2/.env

# move to project
cd freight-estimate-2

# install dependancies
npm install

# update allowed host 
nano backend/config/allowedOrigins.js 

    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://dpa.tools',
    'http://www.dpa.tools',
    'https://dpa.tools',
    'https://www.dpa.tools',




# move to frontend
cd frontend

# install dependancies
npm install

# update PRODUCTION=true ... or does this not need to be done due to proxy redirect??
nano src/functions/constants.js

# build frontend app
npm run build




# install process manager
cd ..
sudo npm i -g pm2

# run app as process
pm2 start backend/server.js

# list running processes
pm2 ls




# --- if wanting to stop the process ---
# pm2 stop server



# enable firewall
sudo ufw enable

# allow
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# install nginx
sudo apt install nginx


# configure nginx
sudo nano /etc/nginx/sites-available/default

# ---- when adding domain name ----
server_name dpa.tools www.dpa.tools;

location / {
    proxy_pass http://localhost:3000; # or whichever port
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}


# restart nginx
sudo service nginx restart

# check nginx config file
sudo nginx -t



# ---- adding SSL ----
# DNS settings
# https://docs.digitalocean.com/products/networking/dns/how-to/manage-records/



# ---- adding SSL ----
# https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04

# install snap
sudo snap install core; sudo snap refresh core

# remove old version of certbot
sudo apt remove certbot

# install certbot
sudo snap install --classic certbot

# link the certbot command from the snap install directory
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# check current settings
sudo ufw status

# allow HTTPS traffic
sudo ufw allow 'Nginx Full'

# delete redundant HTTP profile -- THIS DID NOT WORK
sudo ufw delete allow 'Nginx HTTP'

# check for changes
sudo ufw status

# create certificate
sudo certbot --nginx -d dpa.tools -d www.dpa.tools  