## How to build

`npm run build`

## How to develop

`npm run watch`

## How to deploy and run on Docker

```
docker build -t osm-gui:latest .
docker run -d -p 127.0.0.1:3000:3000 osm-gui
```

## How to setup Nginx reverse proxy to the running container

Edit `/etc/nginx/sites-available/<config-file>`:

```
server {
    listen 80;
    server_name <(sub)domain-name>;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

}
```

Enable site:

```
sudo ln -s /etc/nginx/sites-available/<config-file> /etc/nginx/sites-enabled/<config-file>
sudo service nginx configtest
sudo service nginx reload
```
