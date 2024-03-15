const axios = require('axios').default;
const fs = require('fs');
const unzipper = require('unzipper');

const config = { headers: { Authorization: `Bearer ${process.env.PLAYCANVAS_API_KEY}` } };
const resultPath = `${__dirname}/../www`;
const zipPath = `${__dirname}/Template.zip`;

async function createJob() {
  const response = await axios.post('https://playcanvas.com/api/apps/download', {
    project_id: 1066646,
    name: 'Sweet Ninja',
    scenes: [1728378],
    target: 'web'
  }, config);

  return response.data.id;
}

async function getDownloadUrl(jobId) {
  while (true) {
    const response = await axios.get(`https://playcanvas.com/api/jobs/${jobId}`, config);

    if (response.data.status === 'complete') {
      return response.data.data.download_url;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function downloadFile(downloadUrl, path) {
  const writer = fs.createWriteStream(path);
  const response = await axios.get(downloadUrl, { responseType: 'stream' });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function unzipFile(inputPath, outputPath) {
  const reader = fs.createReadStream(inputPath);

  reader.pipe(unzipper.Extract({ path: outputPath }));

  return new Promise((resolve, reject) => {
    reader.on('end', resolve);
    reader.on('error', reject);
  });
}

async function main() {
  console.log('try to create job');
  const jobId = await createJob();
  console.log('job created, id:', jobId);

  console.log('try to get download url');
  const downloadUrl = await getDownloadUrl(jobId);
  console.log('download url:', downloadUrl);

  console.log('downloading file');
  await downloadFile(downloadUrl, zipPath);
  console.log('file downloaded');

  console.log('clear www');
  fs.rmdirSync(resultPath, { recursive: true });
  console.log('www cleared');

  console.log('unzip start');
  await unzipFile(zipPath, resultPath);
  console.log('unziped');

  console.log('delete zip');
  fs.unlinkSync(zipPath);
  console.log('zip deleted');
}

main();
