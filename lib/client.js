const Minio = require('minio');
const {
	MINIO_ACCESS_KEY,
	MINIO_SECRET_KEY,
	SSL,
	HOST = 'localhost'
} = process.env;

module.exports = new Minio.Client({
	endPoint: HOST,
	port: 9000,
	useSSL: (SSL == 'true'),
	accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
});
