FROM --platform=linux/amd64 nginx
COPY dist/ /usr/share/nginx/html

