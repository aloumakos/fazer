FROM node:17-alpine as builder
EXPOSE 80
WORKDIR /build
COPY frontend .
RUN npm install
RUN npm run build

FROM nginx:latest

#RUN mkdir -p /var/www/html
COPY --from=builder /build/dist /usr/share/nginx/html
COPY misc/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

RUN nginx -t
RUN service nginx restart