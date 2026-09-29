import apiService from '@/stencil/apiService';
import { ItemResult, ItemResultMeta } from '@/stencil/models/item-result';
import { ActionResult } from '@/stencil/models/action-result';
import { ListInput } from '@/stencil/models/list-input';
import { ListResult, ListResultMeta } from '@/stencil/models/list-result';
import { RoutedInput, RoutedNoInput } from '@/stencil/models/routed-input';


import { IHelpArticleListRequest } from '@/stencil/models/features/user/help/helparticlelistrequest';

import { IHelpArticleReadRequest } from '@/stencil/models/features/user/help/helparticlereadrequest';

import { IHelpArticle_Directory } from '@/stencil/models/entities/helparticle';

import { IHelpArticle_Public } from '@/stencil/models/entities/helparticle';

export const addTagTypes = [] as const;

const helpApi = apiService
   .enhanceEndpoints({
      addTagTypes,
   })
   .injectEndpoints({
      endpoints: build => ({
         list: build.query<ListResult<IHelpArticle_Directory>, IHelpArticleListRequest>({
            query: (params: IHelpArticleListRequest) => ({
               url: `v1/help/list`,
               method: 'POST',
               data: params
            }),
            providesTags: []
         }),
         get: build.query<ItemResult<IHelpArticle_Public>, IHelpArticleReadRequest>({
            query: (params: IHelpArticleReadRequest) => ({
               url: `v1/help/get`,
               method: 'POST',
               data: params
            }),
            providesTags: []
         }),
         
		}),
		overrideExisting: false
	});

export default helpApi;

export const {
	useListQuery,
	useGetQuery,
	endpoints: helpEndpoints
} = helpApi;


export type helpApiType = {
	[helpApi.reducerPath]: ReturnType<typeof helpApi.reducer>;
};