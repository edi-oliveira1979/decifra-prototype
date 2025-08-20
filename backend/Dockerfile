# Usa uma imagem base leve e oficial do Go
FROM golang:1.24-alpine  

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos que gerenciam nossas dependências
COPY go.mod ./
COPY go.sum ./

# Baixa todas as dependências do nosso projeto
RUN go mod download

# Copia todo o resto do nosso código para dentro do contêiner
COPY . .

# Compila nossa aplicação Go, criando um executável otimizado
RUN go build -o /decifra-server .

# Expõe a porta 8080, que é a porta que nosso servidor Gin usa
EXPOSE 8080

# O comando que será executado quando o contêiner iniciar
CMD [ "/decifra-server" ]