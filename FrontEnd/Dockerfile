# Estágio de Build
FROM node:20-alpine AS build
WORKDIR /app

# Instala as dependências
COPY package*.json ./
RUN npm install

# Copia o código e gera o build de produção
COPY . .
RUN npm run build

# Estágio de Produção com Nginx
FROM nginx:alpine

# Copia o build do Angular (ajuste o caminho se necessário)
# No Angular 17+, o caminho costuma ser dist/<projeto>/browser
COPY --from=build /app/dist/sistema-de-gestao-financeira/browser /usr/share/nginx/html

# Copia a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
