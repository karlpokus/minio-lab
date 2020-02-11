const Minio = require('minio');

module.exports = new Minio.Client({
	endPoint: '127.0.0.1',
	port: 9000,
	useSSL: false,
	accessKey: 'abcd1234',
  secretKey: 'fghi7890'
});
