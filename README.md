dchan-client
-----
Official client for the [dchan.network](https://dchan.network) decentralized imageboard.

* <2 mb build size
* IPFS hostable
* Built with [React](https://reactjs.org/)
* Powered by [The Graph](https://thegraph.com)

# Docker
Required:
- [`docker`](https://docs.docker.com/engine/install/#server) 
- [`docker-compose`](https://docs.docker.com/compose/install/)

## Start development
- `./bin/docker_setup.sh` (only 1st time)
- `./bin/docker_dev.sh`
  - `./bin/yarn_start.sh`

## Serve production build
- `./bin/docker_release.sh`
- `http://localhost:8080`

# Links
- Official website: https://dchan.network/
- Source: https://github.com/dchan-network/dchan-client
- More: https://github.com/dchan-network/
