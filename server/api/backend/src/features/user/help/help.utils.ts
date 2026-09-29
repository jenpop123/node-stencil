import { ContentSection } from 'src/entities/contentsection/contentsection.model';
import { HelpArticle } from 'src/entities/helparticle/helparticle.model';

interface HelpArticleLanguageCopy {
   help_article_name?: string;
   body?: ContentSection[];
}

/**
 * Copies one language onto the article's default fields.
 * `help_article_name` keeps the stored string unless `help_article_name_localized` has that language.
 * `body` keeps the stored sections unless `body_localized` has that language.
 * The caller passes a copy; this does not save.
 */
export class HelpUtils {
   static prepareForLanguage(article: HelpArticle, language_code: string): void {
      const translations: Record<string, HelpArticleLanguageCopy> = {};
      if (article.help_article_name_localized) {
         for (const item of article.help_article_name_localized) {
            if (item.language_code) {
               if (!(item.language_code in translations)) {
                  translations[item.language_code] = {};
               }
               translations[item.language_code].help_article_name = item.text;
            }
         }
      }
      if (article.body_localized) {
         for (const item of article.body_localized) {
            if (item.language_code) {
               if (!(item.language_code in translations)) {
                  translations[item.language_code] = {};
               }
               translations[item.language_code].body = item.contents;
            }
         }
      }
      if (language_code in translations) {
         const translation = translations[language_code];
         if (translation.help_article_name) {
            article.help_article_name = translation.help_article_name;
         }
         if (translation.body) {
            article.body = translation.body;
         }
      }
   }
}
