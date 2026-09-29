import _ from 'lodash';
import { PartialDeep } from 'type-fest';

import { ILocalizedText } from './localizedtext';

import { IContentSection } from './contentsection';

import { ILocalizedContent } from './localizedcontent';

export interface IHelpArticleOption {
  _id: string;
  help_article_name: string;
}

export interface IHelpArticle extends IHelpArticleOption  {
  help_article_id: string;
  jurisdiction_id: string;
  help_article_name_localized?: ILocalizedText[];
  help_article_slug: string;
  sequence: number;
  published: boolean;
  body?: IContentSection[];
  body_localized?: ILocalizedContent[];
  updated_utc?: Date,
  created_utc?: Date
}

export interface IHelpArticle_Directory {
   _id: string;
   help_article_id: string;
   help_article_name: string;
   help_article_slug: string;
   sequence: number;
   
   updated_utc?: Date
}

export interface IHelpArticle_Public {
   _id: string;
   jurisdiction_id: string;
   help_article_id: string;
   help_article_name: string;
   help_article_slug: string;
   sequence: number;
   body?: IContentSection[];
   
   updated_utc?: Date
}


function HelpArticle(updates?: PartialDeep<IHelpArticle>, original?: PartialDeep<IHelpArticle>): IHelpArticle {
	updates = updates || {};
	original = original || {};

	return _.defaults(updates, original, {
    _id: undefined!,
    help_article_id: undefined!,
    jurisdiction_id: '',
    help_article_name: '',
    help_article_name_localized: undefined!,
    help_article_slug: '',
    sequence: 0,
    published: false,
    body: undefined!,
    body_localized: undefined!,
    
    created_utc: undefined,
    updated_utc: undefined
	});
}

export default HelpArticle;