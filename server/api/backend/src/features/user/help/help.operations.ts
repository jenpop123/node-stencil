import { FeatureRequest } from 'src/shared/types/feature-request';
import { ItemResult } from 'src/shared/types/data/item-result';
import { ListResult } from 'src/shared/types/data/list-result';
import { HelpArticle } from 'src/entities/helparticle/helparticle.model';
import { IHelpArticleListRequest } from './models/helparticlelistrequest';
import { IHelpArticleReadRequest } from './models/helparticlereadrequest';

/**
 * Operations of the help feature that are exposed as MCP tools, implemented by
 * HelpController. Members use property form so the compiler rejects an implementation
 * that takes the wider StencilRequest: MCP supplies only a FeatureRequest.
 */
export interface IHelpOperations {
   list: (request: FeatureRequest, input: IHelpArticleListRequest) => Promise<ListResult<HelpArticle.Directory>>;
   get: (request: FeatureRequest, input: IHelpArticleReadRequest) => Promise<ItemResult<HelpArticle.Public>>;
}