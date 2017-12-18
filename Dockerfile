# FROM node:latest

# # Create app directory
# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app

# # Install app dependencies
# COPY package.json /usr/src/app/
# RUN npm install

# # Bundle app source
# COPY . /usr/src/app

# EXPOSE 8080

FROM node:8.9.1

ADD . /usr/src/app

WORKDIR /usr/src/app/

RUN npm install
