# minio-lab
Fiddling with the minio server and client

# usage

```bash
export MINIO_ACCESS_KEY=...
export MINIO_SECRET_KEY=...
```

server
```bash
$ docker run -p 9000:9000 -e MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY \
-e MINIO_SECRET_KEY=$MINIO_SECRET_KEY -v `pwd`/data:/data \
--name minio minio/minio server /data
```

client
- HOST - defaults to localhost
- BUCKET - defaults to test
- FILEPATH
- FILENAME
- SSL bool - optional

```bash
$ node upload.js
```

tls
```bash
# requires go 1.13
$ go run cert.go -ca --host host
# rename
$ mv -iv cert.pem certs/public.crt
$ mv -iv key.pem certs/private.key
# run as root w ssl
$ docker run --rm -p 9000:9000 -e MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY \
-e MINIO_SECRET_KEY=$MINIO_SECRET_KEY -v `pwd`/certs:/root/.minio/certs \
--name minio minio/minio server /data
```

# todos
- [x] server and client
- [x] tls
- [ ] [compression](https://docs.min.io/docs/minio-compression-guide.html)
- [ ] upload base64 src
- [ ] distributed setup
- [ ] multi-tenancy
- [ ] store from stream
- [ ] don't run as root
- [x] persistent storage

# license
MIT
