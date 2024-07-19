import fs, { promises as fsPromises } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import { NodeSSH } from "node-ssh";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const publish = async () => {
    const extendedStats = fs.readdirSync(`${__dirname}/compiledStats`);
    
    const ssh = new NodeSSH();
    try {
        const sshClient = await ssh.connect({
            host: 'tonysanti.com',   
            port: 22,
            username: 'analytikill',
            privateKeyPath: `${__dirname}/keys/id_rsa`,
            passphrase: 'tacotree'
        });

        console.info(sshClient);
    } catch (error) {
        console.error(error);
    }

    const result = await ssh.putFile(`${__dirname}/compiledStats/extendedStats.json`, `/home/dev/csc-stat-api/cachedExtendedStats/extendedStats.json`);

    console.info(result);
}

publish();