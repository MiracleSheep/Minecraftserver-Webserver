docker rm votting_server
docker run -d --name votting_server -p 5500:5500 -v $HOME:/HOME minecraftserver-webserver
