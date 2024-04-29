import { Low } from 'lowdb'
import fs from 'fs';
import { JSONFile } from 'lowdb/node'

const dbPath = 'db/demoDownloadHistory.json';

export const doesFileAlreadyExist = (filePath?: string) => {
	return fs.existsSync( filePath ?? "" );
}

if( !doesFileAlreadyExist(dbPath) ) {
    fs.writeFileSync(dbPath, JSON.stringify([]))
;}

export const demoHistoryDB = new Low<any>(new JSONFile(dbPath), []);
await demoHistoryDB.read();

//console.info( "DB CHECK", demoHistoryDB.data );
//demoHistoryDB.data.data.push({ test: "this is a trial app"});
//demoHistoryDB.write();
//console.info( demoHistoryDB.data );