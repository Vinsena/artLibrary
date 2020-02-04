import * as express from 'express';
import * as path from 'path';
import {Request, RequestHandler, Response} from 'express';

import {FilterService} from './filterService';
import {SpriteService} from './spriteService';
import {SpriteMetaService} from './spriteMetaService';
import {PreviewService} from './previewService';
import {SpriteInfo} from './model/spriteInfo';
import {AccessService} from './accessService';
import {TagService} from './tagService';


export class Routing {

    private _tagService: TagService;
    private _previewService: PreviewService;
    private _spriteService: SpriteService;
    private _filterService: FilterService;
    private _accessService: AccessService;

    constructor(private _app: express.Express) {
    }

    public async init() {

        this.createServices(this._app);
        await this.initData();
        this.processEndpoints(this._app);

        // Start listening
        const port = process.env.PORT || 3000;
        this._app.listen(port, () => {
            console.log(`Listening on port ${port}!`);
        });
    }

    private createServices(app: express.Express) {
        // Get config
        const artPath = process.env.ART_PATH || 'public/art';
        const previewPath = process.env.PREVIEW_PATH || 'public/preview';
        const fullArtPath = path.join(__dirname, artPath);
        const fullPreviewPath = path.join(__dirname, previewPath);
        const projectMetaService = new SpriteMetaService();
        const enableGoogleAuth = !!process.env.ENABLE_GOOGLE_AUTH || true;

        // Create services
        this._tagService = new TagService();
        this._spriteService = new SpriteService(fullArtPath, projectMetaService);
        this._previewService = new PreviewService(fullArtPath, fullPreviewPath);
        this._filterService = new FilterService();
        this._accessService = new AccessService(app, enableGoogleAuth);
    }

    private async initData() {
        const spritesList = await this._spriteService.getSpritesPaths();
        console.log(`got files list: ${spritesList.length} files`);

        this._tagService.updateTagsCache(spritesList);
        this._tagService.updateCategoriesCache(spritesList);
        await this._previewService.updatePreviews(spritesList, true);
    }

    private processEndpoints(app: express.Express) {

        app.get('/config', (req: Request, res: Response) => res.send(this._accessService.getAuthConfig()));

        app.get('/tags', [this._accessService.authorize(), (req: Request, res: Response) => {
            res.send({
                tags: this._tagService.getTags(),
                categories: this._tagService.getCategories()
            });
        }] as RequestHandler[]);

        app.get('/search', [this._accessService.authorize(), async (req: Request, res: Response) => {
            const spritesList = await this._spriteService.getSpritesPaths();
            const filtered = req.query ? this._filterService.filter(spritesList, req.query) : spritesList;
            res.send(filtered);
        }] as RequestHandler[]);

        app.post('/upload', [this._accessService.authorize(), async (req: Request, res: Response) => {
            if (!req.files || !req.files['file']) {
                console.log('No file');
                res.status(503).send({error: 'No file'});
                return;
            }

            const file = req.files['file'];
            console.log(req.body);
            const sprite = [await this._spriteService.saveSprite(file, JSON.parse(req.body['tags']))];
            console.log(sprite);
            await this._previewService.updatePreviews(sprite, false);
            this._tagService.updateTagsCache(sprite);
            this._tagService.updateCategoriesCache(sprite);
        }] as RequestHandler[]);

        app.use('/art', [this._accessService.authorize(), express.static(path.join(__dirname, 'public/art/'))] as RequestHandler[]);
        app.use('/preview', [this._accessService.authorize(), express.static(path.join(__dirname, 'public/preview/'))] as RequestHandler[]);
        app.use(express.static(path.join(__dirname, 'public/client/')));
        app.get('/*', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'public/client/index.html'));
        });
    }
}
