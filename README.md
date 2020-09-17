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
-e MINIO_SECRET_KEY=$MINIO_SECRET_KEY -u `id -u` -v `pwd`/certs:/.minio/certs:ro \
-v `pwd`/data/tmp:/data --name minio minio/minio server /data
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

Or use the [mc client](https://docs.min.io/docs/minio-client-complete-guide.html) to manage objects. Use `--insecure` to bypass self-signed cert errors or copy `certs/public.crt` to `.mc/certs/CAs`.

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
- [ ] sidekick cache https://github.com/minio/sidekick#high-performance-s3-cache

# license
MIT
