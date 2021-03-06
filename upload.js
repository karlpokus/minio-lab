/*
	creates a minio client and a bucket named test and uploads an image to it
*/

const { BUCKET = 'test', FILEPATH, FILENAME } = process.env;
const client = require('./lib/client');

const listBuckets = async () => {
	const buckets = await client.listBuckets();
	console.log('buckets :', buckets);
};

(async () => {
	try {
		const bucket = BUCKET;
		const region = 'uppsala';
		const fpath = FILEPATH;
		const fname = FILENAME;
		const meta = {
			'Content-Type': 'application/octet-stream',
			'Badass-level': 1000
    }

		await listBuckets();

		if (!await client.bucketExists('test')) {
			console.log(`bucket ${ bucket } does not exist. Creating it now.`);
			await client.makeBucket(bucket, region);
			console.log(`bucket ${ bucket } created`);
			await listBuckets();
		}

		const etag = await client.fPutObject(bucket, fname, fpath, meta);
		console.log(`object ${ fname } created in ${ bucket } with etag ${ etag }`);

		await listBuckets();

	} catch(err) {
		console.error(err);
	}
})();
