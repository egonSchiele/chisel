FROM --platform=linux/amd64 node:19
RUN apt-get update -y && apt-get install -y vim

WORKDIR /

# Install dependencies based on the preferred package manager
COPY . ./
ENV NODE_ENV production
#RUN yarn

EXPOSE 80

ENV PORT 80
ENV HOST 0.0.0.0
CMD ["node", "server.js"]