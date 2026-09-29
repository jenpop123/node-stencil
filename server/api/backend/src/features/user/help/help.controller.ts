import { Body, Controller, ForbiddenException, HttpCode, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { AuthGuard } from 'src/shared/access-control/auth.guard';
import { RateLimit } from 'src/shared/access-control/rate-limit.decorator';
import { RateLimitGuard } from 'src/shared/access-control/rate-limit.guard';
import { EntityRegistry } from 'src/entities/entity.registry';
import { HelpArticle } from 'src/entities/helparticle/helparticle.model';
import { ItemResult } from 'src/shared/types/data/item-result';
import { ListResult } from 'src/shared/types/data/list-result';
import { FeatureRequest } from 'src/shared/types/feature-request';
import { Sanitize } from 'src/shared/utils/sanitized';
import { isNullOrWhiteSpace } from 'src/shared/utils';
import { IHelpArticleListRequest, HelpArticleListRequest } from './models/helparticlelistrequest';
import { IHelpArticleReadRequest, HelpArticleReadRequest } from './models/helparticlereadrequest';
import { IHelpOperations } from './help.operations';
import { HelpUtils } from './help.utils';

@Controller('v1/help')
export class HelpController implements IHelpOperations {
   constructor(private readonly entities: EntityRegistry) {}

   @RateLimit({ points: 60, duration: 60 })
   @UseGuards(AuthGuard, RateLimitGuard)
   @Post('list')
   @HttpCode(200)
   async list(
      @Req() request: FeatureRequest,
      @Body(Sanitize.for(HelpArticleListRequest)) input: IHelpArticleListRequest,
   ): Promise<ListResult<HelpArticle.Directory>> {
      if (!request.account) {
         throw new ForbiddenException();
      }
      const jurisdiction_id = request.account.jurisdiction_id;
      return this.entities.helpArticleManager.findDirectory(
         jurisdiction_id,
         0,
         100,
         input.keyword,
         'sequence',
         false,
         true,
      );
   }

   @RateLimit({ points: 60, duration: 60 })
   @UseGuards(AuthGuard, RateLimitGuard)
   @Post('get')
   @HttpCode(200)
   async get(
      @Req() request: FeatureRequest,
      @Body(Sanitize.for(HelpArticleReadRequest)) input: IHelpArticleReadRequest,
   ): Promise<ItemResult<HelpArticle.Public>> {
      if (!request.account) {
         throw new ForbiddenException();
      }
      const jurisdiction_id = request.account.jurisdiction_id;
      const stored = await this.entities.helpArticleManager.getById(jurisdiction_id, input.help_article_id);
      if (!stored || !stored.published) {
         throw new NotFoundException();
      }
      const article = cloneDeep(stored);
      if (input.language_code && !isNullOrWhiteSpace(input.language_code)) {
         HelpUtils.prepareForLanguage(article, input.language_code);
      }
      const result: ItemResult<HelpArticle.Public> = {
         success: true,
         item: article.toPublic(),
      };
      return result;
   }
}
