import { ListInput } from 'src/shared/types/requests/list-input';


export interface ListInputHelpArticle extends ListInput {
   published?: boolean;
   
}

export interface ListInputHelpArticleDirectory extends ListInput {
   
}