# minio-lab
Fiddling with the minio server and client

# usage

```bash
export MINIO_ACCESS_KEY=...
export MINIO_SECRET_KEY=...
```

### server

http
```bash
$ docker run --rm -p 9000:9000 -e MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY \
-e MINIO_SECRET_KEY=$MINIO_SECRET_KEY -v `pwd`/data/tmp:/data \
-u `id -u` --name minio minio/minio server /data
```

https
```bash
# generate certs. requires go 1.13
$ go run cert.go -ca --host <host>
# rename
$ mv -iv cert.pem certs/public.crt
$ mv -iv key.pem certs/private.key
# run as current user w ssl
$ docker run --rm -p 9000:9000 -e MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY \
-e MINIO_SECRET_KEY=$MINIO_SECRET_KEY -u `id -u` -v `pwd`/certs/localhost:/.minio/certs:ro \
-v `pwd`/data/tmp:/data --name minio minio/minio:RELEASE.2020-09-23T19-18-30Z server /data
```

### client
- HOST - defaults to localhost
- PORT - defaults to 9000
- BUCKET - defaults to test
- SSL - defaults to false
- FILEPATH
- FILENAME

```bash
$ node upload.js
```

Or use the [mc client](https://docs.min.io/docs/minio-client-complete-guide.html) to manage objects. Use `--insecure` to bypass self-signed cert errors or copy `certs/public.crt` to `.mc/certs/CAs`. By the same token, use the `-k` flag for curl.

### distributed mode - single tenant

```bash
# run 4 nodes w 4 disks per node
$ docker-compose -f docker/distr-mode-single-tenant.yml up
```

disaster recovery test
- stop node 4
- upload object to node 1
- expect object to be written to node 3 - PASS
- expect all living nodes to log connection errors - PASS
- restart node 4
- expect object to be written to node 4 - PASS
- expect connection errors to stop - PASS

### distributed mode - multi-tenant

```bash
# 4 nodes per tenant w 1 disk per node
# ephemeral storage
# both tenants share keys
# no nodes exposed to host
# proxy to tenant1 on port 9051
# proxy to tenant2 on port 9052
$ docker-compose -f docker/distr-mode-multi-tenant.yml up
```

note: a nicely added benefit of using the proxy is the accesslog contains the REST api end points :)

### cluster and load balancer
note: We're running the lb (sidekick) as a stand-alone container here, which makes it a bottleneck. The recommended way is a pod sidecar.

```bash
$ docker-compose -f docker/distr-mode-lb.yml up
# lb prometheus endpoint https://github.com/minio/sidekick/blob/master/metrics.md
$ curl localhost:8080/.prometheus/metrics
# lb terminal gui
$ docker exec -it <container> "/sidekick" -a :8989 --health-path=/minio/health/ready http://minio{1...4}:9000
# note: status works but not calls as they do not pass this listening port
```

### cluster, load balancer and multi-zone
Server 1 and 2 is zone A, server 3 and 4 is zone B. This time we're running sidekick outside docker-compose to be able to access the terminal gui properly.

```bash
$ docker-compose -f docker/distr-mode-lb-multi-zone.yml up
```

```bash
# use space char to declare multiple sites and comma for the same site
$ docker run --rm -it -p 8080:8080 --network docker_default -e MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY \
-e MINIO_SECRET_KEY=$MINIO_SECRET_KEY --name lb minio/sidekick:v0.5.1 \
--health-path=/minio/health/ready http://minio{1...2}:9000 http://minio{3...4}:9000
```

### single server on tls and lb

```bash
# server
$ docker run --rm -p 9000:9000 --network docker_default -e MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY \
-e MINIO_SECRET_KEY=$MINIO_SECRET_KEY -u `id -u` -v `pwd`/certs/localhost:/.minio/certs:ro \
-v `pwd`/data/tmp:/data --name minio minio/minio server /data
# lb with insecure flag set
$ docker run --rm -it -p 8080:8080 --network docker_default -e MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY \
-e MINIO_SECRET_KEY=$MINIO_SECRET_KEY --name lb minio/sidekick:v0.5.1 \
--health-path=/minio/health/ready --insecure https://minio:9000
```

note: We must add the insecure flag to lb for self-signed certs. No need to add the flag to mc. It's ok to use the insecure flag even if minio is not running on tls.

### cluster and tls

distributed mode + multiple drives requires O_DIRECT which is not supported on mac os. So we're using FS mode (single drive) here. Remember to create certs for all servers (described above) and also copy each servers public.crt into certs/CAs on all other servers. I also copied the certs dir to /tmp to make it work with vagrant, but that is not necessary.

```bash
$ docker-compose -f docker/distr-mode-tls.yml up
```

# todos
- [x] server and client
- [x] tls
- [ ] [compression](https://docs.min.io/docs/minio-compression-guide.html)
- [x] upload base64 src
- [x] distributed setup
- [x] multi-tenancy (+load balancer)
- [x] try sharing disks between nodes
- [ ] store from stream
- [x] don't run as root
- [x] persistent storage
- [ ] concurrent io fetching objects
- [ ] add/remove nodes
- [ ] try traefik as lb https://docs.min.io/docs/how-to-run-multiple-minio-servers-with-traef-k.html
- [x] try sidekick as lb
- [x] multi-zone
- [x] cluster on tls
- [ ] sidekick cache https://github.com/minio/sidekick#high-performance-s3-cache

# license
MIT
