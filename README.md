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
-e MINIO_SECRET_KEY=$MINIO_SECRET_KEY -v `pwd`/data:/data \
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
-v `pwd`/data:/data --name minio minio/minio server /data
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
# run 4 nodes w 4 disks
$ docker-compose up
```

disaster recovery test
- stop node 4
- upload object to node 1
- expect object to be written to node 3 - PASS
- expect all living nodes to log connection errors - PASS
- restart node 4
- expect object to be written to node 4 - PASS
- expect connection errors to stop - PASS

# todos
- [x] server and client
- [x] tls
- [ ] [compression](https://docs.min.io/docs/minio-compression-guide.html)
- [x] upload base64 src
- [x] distributed setup
- [ ] multi-tenancy (+load balancer)
- [ ] try sharing disks between nodes
- [ ] store from stream
- [x] don't run as root
- [x] persistent storage

# license
MIT
