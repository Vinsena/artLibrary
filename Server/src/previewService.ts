import { SpriteInfo } from './model/spriteInfo';
import * as fs from 'fs';
import * as path from 'path';
import { OutputInfo } from 'sharp';
import * as  sharp from 'sharp';
import { promisify } from 'util';
import del from 'del';


export class PreviewService {

  public previewWidth: number = process.env.PreviewWidth ? Number.parseInt(process.env.PreviewWidth) : 256;
  public previewHeight: number = process.env.PreviewHeight ? Number.parseInt(process.env.PreviewHeight) : 256;
  public compressionLevel: number = process.env.PreviewCompressionLevel ? Number.parseInt(process.env.PreviewCompressionLevel) : 9;
  public quality: number = process.env.PreviewQuality ? Number.parseInt(process.env.PreviewQuality) : 80; // TODO: Add png quality supporting. Requires precompiled libimagequant for libvips


  private _previews: string[];

  constructor(private _originalsPath: string, private _previewsPath: string) {
    
  }

  public async updatePreviews(sprites: SpriteInfo[], meesingOnly: boolean) {
    if (!this._previews) {
      await this.init(meesingOnly);
    }

    if (meesingOnly) {
      sprites = sprites.filter(sprite => !this._previews.includes(sprite.name));
    }

    await this.createPreviews(sprites);
  }

  private async init(missingOnly: boolean) {
    const exists = await promisify(fs.exists)(this._previewsPath);
    if (exists && !missingOnly) {
      await del(this._previewsPath);
    }

    if (!exists || !missingOnly) {
      await promisify(fs.mkdir)(this._previewsPath, {recursive: true});
    }

    const files = await promisify(fs.readdir)(this._previewsPath);
    console.log(`got preview files: ${files.length} items`);
    this._previews = files;
  }

  private async createPreviews(sprites: SpriteInfo[]) {
    const promises: Promise<OutputInfo>[] = [];
    sprites.forEach(sprite => {
      const inputPath = path.join(this._originalsPath, sprite.path);
      const outputPath = path.join(this._previewsPath, sprite.name);
      const image = sharp(inputPath);
      const preview = image.resize(this.previewWidth, this.previewHeight, {fit: 'inside', withoutEnlargement: true});

      const promise = preview
        .toFormat(sprite.meta.format, {quality: this.quality, compressionLevel: this.compressionLevel})
        .toFile(outputPath);
      
      promise.catch((error: any) => {
        console.log(`Error: ${sprite.name}: ${error}`);
      });

      promises.push(promise);
    });

    const promiseResult = await Promise.all(promises).catch(error => console.log(error));
    console.log(`created ${sprites.length} previews`);
    return promiseResult;
  }
}
