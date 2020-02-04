import * as fs from 'fs';
import { promisify } from 'util';

export class SpriteMetaService {
    async getSpriteMeta(fullPath: string): Promise<{}> { 
        if (await promisify(fs.exists)(fullPath + '.json')) {
            const buffer = await promisify(fs.readFile)(fullPath + '.json');
            try {
                return JSON.parse(buffer.toString('utf8'));
            } catch (e) {
                console.log("Upload error:" + e);
                return null;
            }
        }
        return null;
    }

    async saveSpriteMeta(fullPath: string, spriteMeta: {}, fullOverride: boolean = false) {
        if (!fullOverride) {
            const meta =  this.getSpriteMeta(fullPath);
            if(meta) {
                spriteMeta = Object.assign(meta, spriteMeta);
            }
        }
        console.log(spriteMeta);
        return promisify(fs.writeFile)(fullPath + '.json', JSON.stringify(spriteMeta));
    }
}
