const { exec } = require('child_process');

function run(command) {
    return new Promise((resolve, reject) => {
        exec(`${command}`, (error, stdout, stderr) => {
            if (error) {
                return reject(error.message);
            }
            if (stderr) {
                return reject(stderr);
            }
            return resolve(stdout);
        });
    });
}

(async function main() {
    console.log('Getting port...');
    const chgport = await run('chgport');
    const deviceMapper = `${chgport}`.split('\n').filter(mapper => mapper.includes('Silab'))[0];
    if (!deviceMapper) {
        return console.log('Device not found');
    }
    const port = deviceMapper.split(' ')[0];
    console.log('Found port ', port);
    const dir = await run('cd build && dir && cd ..');
    const binFileDetail = `${dir}`.split('\n').filter(item => item.includes('.bin'))[0];
    if (!binFileDetail) {
        return console.log('Binary file not found');
    }
    const binFileDetailArr = binFileDetail.split(' ');
    const binFileName = binFileDetailArr[binFileDetailArr.length - 1];
    console.log('Found binary file ', binFileName);
    console.log('Start uploading...');
    const result = await run(`python3\\python3 tools/upload.py --chip esp8266 --port ${port} --baud 115200 --before default_reset --after hard_reset write_flash 0x0 build\\${binFileName}`);
    return console.log(result);
})();
