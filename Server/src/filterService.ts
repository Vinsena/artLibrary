import { SpriteInfo } from './model/spriteInfo';

type Filter = (files: any[], filterString: string) => any[];     

export class FilterService {

    private _filters: {[key: string]: Filter} = {
        search: FilterService.byString,
        alpha: FilterService.byAlpha,
        xMin: FilterService.byMinX,
        xMax: FilterService.byMaxX,
        yMin: FilterService.byMinY,
        yMax: FilterService.byMaxY,
        from: FilterService.from,
        count: FilterService.count,
    };

    filter(files: SpriteInfo[], query: any): any[] {
        for (const filter in this._filters) {
            if (this._filters.hasOwnProperty(filter)) {
                let str = query[filter];
                if (str) {
                    str = str.trim();
                }
                files = str ? this._filters[filter](files, str) : files;
            }
        }
        return files;
    }

    private static byString(files: SpriteInfo[], filterString: string): SpriteInfo[] {
        const words = filterString
            .split(/[\s,]+/)
            .map(param => param.toLowerCase().trim())
            .filter(w => w);
            
        const filtered = files.filter(file => words.some(word => FilterService.checkByWord(file, word)));
        return filtered;
    }

    private static checkByWord(file: SpriteInfo, word: string): boolean {
        if (file.name.toLowerCase().includes(word)) 
            return true;
        
        if (file.projectMeta && 
            file.projectMeta.tags && 
            file.projectMeta.tags.some((tag: string) => tag.includes(word))) 
            return true;
        
        return false;
    }

    private static byAlpha(files: SpriteInfo[], filterString: string): SpriteInfo[] {
        filterString = filterString.toLowerCase();
        let flag = ['true', 'yes'].indexOf(filterString) > -1;
        if (!flag) {
            if (['false', 'no'].indexOf(filterString) > -1) {
                flag = false;
            } else {
                return files;
            }
        }

        const filtered = files.filter(file => Boolean(file.meta.hasAlpha) === flag);
        return filtered;
    }

    private static byMinX(sprites: SpriteInfo[], filterString: string): SpriteInfo[] {
        const value = Number.parseInt(filterString);
        if (Number.isNaN(value)) {
            return sprites;
        }
        return sprites.filter(sprite => sprite.meta.width >= value);
    }

    private static byMaxX(sprites: SpriteInfo[], filterString: string): SpriteInfo[] {
        const value = Number.parseInt(filterString);
        if (Number.isNaN(value)) {
            return sprites;
        }
        return sprites.filter(sprite => sprite.meta.width <= value);
    }

    private static byMinY(sprites: SpriteInfo[], filterString: string): SpriteInfo[] {
        const value = Number.parseInt(filterString);
        if (Number.isNaN(value)) {
            return sprites;
        }
        return sprites.filter(sprite => sprite.meta.height >= value);
    }

    private static byMaxY(sprites: SpriteInfo[], filterString: string): SpriteInfo[] {
        const value = Number.parseInt(filterString);
        if (Number.isNaN(value)) {
            return sprites;
        }
        return sprites.filter(sprite => sprite.meta.height <= value);
    }

    private static from(sprites: SpriteInfo[], filterString: string): SpriteInfo[] {
        return sprites.slice(Number.parseInt(filterString));
    }

    private static count(sprites: SpriteInfo[], filterString: string): SpriteInfo[] {
        return sprites.slice(0, Number.parseInt(filterString));
    }
}
