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
    let listPortCommand = 'chgport';
    let listFileCommand = 'dir';
    let pythonType = '-win';
    const pathSeparator = require('path').sep;
    if (pathSeparator === '/') {
        listPortCommand = 'ls /dev/cu.*';
        listFileCommand = 'ls';
        pythonType = '';
    }
    const portList = await run(listPortCommand);
    const deviceMapper = `${portList}`.split('\n').filter(mapper => mapper.toLowerCase().includes('lab'))[0];
    if (!deviceMapper) {
        return console.log('Device not found');
    }
    const port = deviceMapper.split(' ')[0];
    console.log('Found port ', port);
    const dir = await run(`cd build && ${listFileCommand} && cd ..`);
    const binFileDetail = `${dir}`.split('\n').filter(item => item.includes('.bin'))[0];
    if (!binFileDetail) {
        return console.log('Binary file not found');
    }
    const binFileDetailArr = binFileDetail.split(' ');
    const binFileName = binFileDetailArr[binFileDetailArr.length - 1];
    console.log('Found binary file ', binFileName);
    console.log('Start uploading...');
    const result = await run(`python3${pythonType}${pathSeparator}python3 tools/upload.py --chip esp8266 --port ${port} --baud 115200 --before default_reset --after hard_reset write_flash 0x0 build${pathSeparator}${binFileName}`);
    return console.log(result);
})();
