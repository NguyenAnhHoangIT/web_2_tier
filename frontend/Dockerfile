FROM nginx:alpine

# Copy pre-compiled frontend assets from host
COPY dist /usr/share/nginx/html

# Copy proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
