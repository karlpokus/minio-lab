# minio-lab
Fiddling with the minio server and client

# usage
gui http://127.0.0.1:9000/minio/

```bash
# server
$ docker run --rm -p 9000:9000 -e MINIO_ACCESS_KEY=abcd1234 -e MINIO_SECRET_KEY=fghi7890 --name minio minio/minio server /data
# client
$ node upload.js
```

# todos
- [x] server and client
- [ ] ssl
- [ ] [compression](https://docs.min.io/docs/minio-compression-guide.html)
- [ ] upload base64 src
- [ ] distributed setup
- [ ] multi-tenancy

# license
MIT
