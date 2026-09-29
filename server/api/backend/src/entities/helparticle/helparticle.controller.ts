import { HelpArticle } from './helparticle.model';
import { HelpArticleManager } from './helparticle.manager';
import { HelpArticleControllerBase } from './helparticle.controller.base';

//NOTE: Codegen will create, but not alter this file.

export class HelpArticleController extends HelpArticleControllerBase  {
   constructor(manager: HelpArticleManager) {
      super(manager);
   }
   // Custom Endpoints here
}