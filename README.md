## What is it?

This code creates and runs twitter stream that writes data to amazon kinesis.

It is possible to run it on amazon ECS with [this docker image](https://hub.docker.com/r/getriax/twitter-kinesis/)

## How to use?

    $ cp env.example .env
    
 complete the enviroment variables with proper values.
 
    $ yarn install
    $ yarn start
    
## Creating docker image
  
    docker build -t [user]/[repo]:[tag]
    docker push [user]/[repo]:[tag]
    
## Testing

    $ yarn test
