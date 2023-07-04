FROM --platform=linux/amd64 node:19-alpine
# FROM --platform=linux/amd64 node:19

WORKDIR /

# RUN apt-get update
# RUN apt-get install -y ffmpeg

RUN apk update
RUN apk add ffmpeg git curl
RUN rm -rf /var/cache/apk/*
# Install dependencies based on the preferred package manager
COPY . ./
ENV NODE_ENV production

# This works but is ~5 min slower than just copying node_modules
# if you use it, you need to add node_modules to the .dockerignore file
# RUN yarn install --production=true

# see size using
# docker images

# see size by layer using
# docker history --human --format "{{.CreatedBy}}: {{.Size}}" <image>

EXPOSE 80

ENV PORT 80
ENV HOST 0.0.0.0

CMD ["yarn", "start"]