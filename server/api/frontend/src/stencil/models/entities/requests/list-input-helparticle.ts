import { ListInput } from "@/stencil/models/list-input";

export interface IListInputHelpArticle extends ListInputHelpArticle {
}
/** Obsolete: Will be removed in a future build, Use IListInputHelpArticle */
export interface ListInputHelpArticle extends ListInput {
   published?: boolean;
   
}

export interface IListInputHelpArticleDirectory extends ListInputHelpArticleDirectory {
}
/** Obsolete: Will be removed in a future build, Use IListInputHelpArticleDirectory */
export interface ListInputHelpArticleDirectory extends ListInput {
    
}