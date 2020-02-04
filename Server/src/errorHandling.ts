import * as express from 'express'; 
import { Request, Response, NextFunction } from 'express';

export class ErrorHandling {

    handle(app: express.Express) {
        app.use(this.logErrors);
        app.use(this.authError);
        app.use(this.clientErrorHandler);
        app.use(this.errorHandler);
    }

    private logErrors(err: any, req: Request, res: Response, next: NextFunction) {
      next(err);
    }
      
    private authError(err: any, req: Request, res: Response, next: NextFunction) {
      if (err.name === 'UnauthorizedError') {
        res.status(401).send({error: 'wrong token or no token at all'});
        return;
      }
      next(err);
    }
      
    private clientErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
      if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' });
      } else {
        next(err);
      }
    }
      
    private errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
      res.status(500);
      console.log(err);
      res.send({ error: err });
    }
}
