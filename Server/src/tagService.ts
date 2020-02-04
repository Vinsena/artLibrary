export class TagService {

    private _categoriesCache: string[] = [];
    private _tagsCache: string[] = ["Background", "Foreground", "Progress", "Frame", "Border", "Line"];


    public getTags() {
        return this._tagsCache;
    }

    public getCategories() {
        return this._categoriesCache;
    }

    public updateTagsCache(spritesList: any[]) {
        const tags = spritesList
            .filter(s => s.projectMeta && s.projectMeta.tags)
            .map(s => s.projectMeta.tags)
            .reduce((a, b) => a.concat(b), []);

        this.addTags(tags);
    }

    public addTags(tags: string[]) {
        this._tagsCache = this._tagsCache.concat(tags);
        // leave unique tags only
        // TODO: Optimize it
        this._tagsCache = Array.from(new Set<string>(this._tagsCache));
    }

    public updateCategoriesCache(spritesList: any[]) {
        const categories = spritesList
            .filter(s => s.projectMeta && s.projectMeta.category)
            .map(s => s.projectMeta.category);

        this.addCategories(categories);
    }

    public addCategories(categories: string[]) {
        this._categoriesCache = this._categoriesCache.concat(categories);
        // leave unique tags only
        // TODO: Optimize it
        this._categoriesCache = Array.from(new Set<string>(this._categoriesCache));
    }
}
