const Minio = require('minio');
const {
	MINIO_ACCESS_KEY,
	MINIO_SECRET_KEY,
	SSL,
	HOST = 'localhost',
	PORT = "9000"
} = process.env;

if (SSL == 'true') {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // ignore invalid self-signed certs
}

module.exports = new Minio.Client({
	endPoint: HOST,
	port: parseInt(PORT, 10),
	useSSL: (SSL == 'true'),
	accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
});
