import apiService from '@/stencil/apiService';
import { IHelpArticle} from '@/stencil/models/entities/helparticle';
import { ItemResult, ItemResultMeta } from '@/stencil/models/item-result';
import { ActionResult } from '@/stencil/models/action-result';
import { ListInput } from '@/stencil/models/list-input';
import { ListInputHelpArticle } from '@/stencil/models/entities/requests/list-input-helparticle';
import { ListResult, ListResultMeta } from '@/stencil/models/list-result';
import { RoutedInput, RoutedNoInput } from '@/stencil/models/routed-input';
import { IHelpArticle_Directory } from '@/stencil/models/entities/helparticle';
import { IHelpArticle_Public } from '@/stencil/models/entities/helparticle';

export const addTagTypes = ['helparticle', 'helparticles'] as const;

const HelpArticlesApi = apiService
   .enhanceEndpoints({
      addTagTypes,
   })
   .injectEndpoints({
      endpoints: build => ({
         getHelpArticles: build.query<ListResult<IHelpArticle>, RoutedInput<ListInputHelpArticle>>({
            query: params => ({ 
               url: `admin/${params.jurisdiction_id}/helparticle/find`,
               method: 'GET',
               params: params.input
            }),
            providesTags: ['helparticles']
         }),
         getHelpArticlesDirectory: build.query<ListResult<IHelpArticle_Directory>, RoutedInput<ListInputHelpArticle>>({
            query: params => ({
               url: `admin/${params.jurisdiction_id}/helparticle/search/directory`,
               method: 'POST',
               data: params.input
            }),
            providesTags: ['helparticles'],
         }),
			getHelpArticle: build.query<ItemResult<IHelpArticle>, RoutedInput<string>>({
				query: params => ({ 
					url: `admin/${params.jurisdiction_id}/helparticle/${params.input}`,
					method: 'GET'
				}),
				providesTags: ['helparticle']
			}),
			getHelpArticlePublic: build.query<ItemResult<IHelpArticle_Public>, RoutedInput<string>>({
				query: (params) => ({ 
					url: `admin/${params.jurisdiction_id}/helparticle/${params.input}/public`,
          			method: 'GET',
				}),
				providesTags: ['helparticle']
			}),
			deleteHelpArticle: build.mutation<ActionResult, RoutedInput<string>>({
				query: (params) => ({
					url: `admin/${params.jurisdiction_id}/helparticle/${params.input}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['helparticle', 'helparticles']
			}),
			createHelpArticle: build.mutation<ItemResult<IHelpArticle>, IHelpArticle>({
				query: (helparticle) => {
					return {
						url: `admin/${helparticle.jurisdiction_id}/helparticle`,
						method: 'POST',
						data: helparticle
					};
				},
				invalidatesTags: ['helparticle', 'helparticles']
			}),replaceHelpArticle: build.mutation<ItemResult<IHelpArticle>, IHelpArticle>({
				query: (helparticle) => ({
					url: `admin/${helparticle.jurisdiction_id}/helparticle/${helparticle._id}`,
					method: 'PUT',
					data: helparticle
				}),
				invalidatesTags: ['helparticle','helparticles']
			})
		}),
		overrideExisting: false
	});

export default HelpArticlesApi;

export const {
	useGetHelpArticlesQuery,
	useGetHelpArticlesDirectoryQuery,
	useGetHelpArticlePublicQuery,
	useGetHelpArticleQuery,
	useDeleteHelpArticleMutation,
	useCreateHelpArticleMutation,useReplaceHelpArticleMutation,
	endpoints: helparticleEndpoints
} = HelpArticlesApi;

export type HelpArticlesApiType = {
	[HelpArticlesApi.reducerPath]: ReturnType<typeof HelpArticlesApi.reducer>;
};