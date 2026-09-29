import { LocalizedText } from 'src/entities/localizedtext/localizedtext.model';
import { ContentSection } from 'src/entities/contentsection/contentsection.model';
import { LocalizedContent } from 'src/entities/localizedcontent/localizedcontent.model';
import { sanitizeHtml, truncateStart } from 'src/shared/utils/string.utils';
// ===========================================
// Entity
// ===========================================

export class HelpArticle {
   static Projection = {
      _id: 1,
      help_article_id: 1,
      jurisdiction_id: 1,
      help_article_name: 1,
      help_article_name_localized: 1,
      help_article_slug: 1,
      sequence: 1,
      published: 1,
      body: 1,
      body_localized: 1,
      created_utc: 1,
      updated_utc: 1,
      //searchable: 0, // here for visibility, we actively do not include `searchable`
   
   };

   _id!: string;
   help_article_id!: string;
   jurisdiction_id!: string;
   help_article_name!: string;
   help_article_name_localized?: LocalizedText[];
   help_article_slug!: string;
   sequence!: number;
   published!: boolean;
   body?: ContentSection[];
   body_localized?: LocalizedContent[];
   /**
   * System Field
   */
   created_utc?: Date;
   /**
   * System Field
   */
   updated_utc?: Date;
   
   /**
   * System Field
   */
   searchable?: string;
   

   constructor(data: Partial<HelpArticle>) {
      
      Object.assign(this, data);
   }

   static sanitize(obj: HelpArticle): void {
      if (!obj) return;
      obj.help_article_slug = obj.help_article_slug?.toLowerCase();
      obj.jurisdiction_id = sanitizeHtml(obj.jurisdiction_id, false);
      obj.help_article_name = sanitizeHtml(obj.help_article_name, false);
      obj.help_article_slug = sanitizeHtml(obj.help_article_slug, false);
      obj.help_article_name_localized?.forEach(item => LocalizedText.sanitize(item));
      obj.body?.forEach(item => ContentSection.sanitize(item));
      obj.body_localized?.forEach(item => LocalizedContent.sanitize(item));
   }
   
   
   asInfoPerspective(): HelpArticle.InfoPerspective {
      return new HelpArticle.InfoPerspective(this);
   }
   
   asStatusPerspective(): HelpArticle.StatusPerspective {
      return new HelpArticle.StatusPerspective(this);
   }
   
   asContentPerspective(): HelpArticle.ContentPerspective {
      return new HelpArticle.ContentPerspective(this);
   }
   
   toDirectory(): HelpArticle.Directory {
      return HelpArticle.Directory.fromHelpArticle(this);
   }
   
   toPublic(): HelpArticle.Public {
      return HelpArticle.Public.fromHelpArticle(this);
   }
   

   /** Fills this with allowed fields from partial. Skips primary key, system fields (searchable, created_utc, updated_utc), and calculated fields. */
   fillFromPartial(partial: Partial<HelpArticle>): void {
      
      if (partial.help_article_id !== undefined) {
         this.help_article_id = partial.help_article_id!;
      }
      
      if (partial.jurisdiction_id !== undefined) {
         this.jurisdiction_id = partial.jurisdiction_id!;
      }
      
      if (partial.help_article_name !== undefined) {
         this.help_article_name = partial.help_article_name!;
      }
      
      if (partial.help_article_name_localized !== undefined) {
         this.help_article_name_localized = partial.help_article_name_localized!;
      }
      
      if (partial.help_article_slug !== undefined) {
         this.help_article_slug = partial.help_article_slug!;
      }
      
      if (partial.sequence !== undefined) {
         this.sequence = partial.sequence!;
      }
      
      if (partial.published !== undefined) {
         this.published = partial.published!;
      }
      
      if (partial.body !== undefined) {
         this.body = partial.body!;
      }
      
      if (partial.body_localized !== undefined) {
         this.body_localized = partial.body_localized!;
      }
      
   }
}


export namespace HelpArticle {
   
   // ===========================================
   // Custom Perspectives
   // ===========================================
   
   export class InfoPerspective {
      constructor(private actual: HelpArticle) {}
      /**
      * Only use for routing fields (e.g. workspace_id). Do NOT read non-routing fields from
      * the returned object — that bypasses dependency tracking and change detection.
      */
      getActual(): HelpArticle {
         return this.actual;
      }

      get _id(): string {
         return this.actual._id;
      }

      
      set jurisdiction_id(value: string) { 
         this.actual.jurisdiction_id = value;
      }
      
      get jurisdiction_id() : string {
         return this.actual.jurisdiction_id;
      }
      
      set help_article_name(value: string) { 
         this.actual.help_article_name = value;
      }
      get help_article_name()  {
         return this.actual.help_article_name;
      }
      
      set help_article_name_localized(value: LocalizedText[] | undefined) { 
         this.actual.help_article_name_localized = value;
      }
      get help_article_name_localized() : LocalizedText[] | undefined {
         return this.actual.help_article_name_localized;
      }
      
      set help_article_slug(value: string) { 
         this.actual.help_article_slug = value;
      }
      get help_article_slug()  {
         return this.actual.help_article_slug;
      }
      
      set sequence(value: number) { 
         this.actual.sequence = value;
      }
      get sequence()  {
         return this.actual.sequence;
      }
      
   }
   
   export class StatusPerspective {
      constructor(private actual: HelpArticle) {}
      /**
      * Only use for routing fields (e.g. workspace_id). Do NOT read non-routing fields from
      * the returned object — that bypasses dependency tracking and change detection.
      */
      getActual(): HelpArticle {
         return this.actual;
      }

      get _id(): string {
         return this.actual._id;
      }

      
      set jurisdiction_id(value: string) { 
         this.actual.jurisdiction_id = value;
      }
      
      get jurisdiction_id() : string {
         return this.actual.jurisdiction_id;
      }
      
      set published(value: boolean) { 
         this.actual.published = value;
      }
      get published()  {
         return this.actual.published;
      }
      
   }
   
   export class ContentPerspective {
      constructor(private actual: HelpArticle) {}
      /**
      * Only use for routing fields (e.g. workspace_id). Do NOT read non-routing fields from
      * the returned object — that bypasses dependency tracking and change detection.
      */
      getActual(): HelpArticle {
         return this.actual;
      }

      get _id(): string {
         return this.actual._id;
      }

      
      set jurisdiction_id(value: string) { 
         this.actual.jurisdiction_id = value;
      }
      
      get jurisdiction_id() : string {
         return this.actual.jurisdiction_id;
      }
      
      set body(value: ContentSection[] | undefined) { 
         this.actual.body = value;
      }
      get body() : ContentSection[] | undefined {
         return this.actual.body;
      }
      
      set body_localized(value: LocalizedContent[] | undefined) { 
         this.actual.body_localized = value;
      }
      get body_localized() : LocalizedContent[] | undefined {
         return this.actual.body_localized;
      }
      
   }
   
   // ===========================================
   // Projections
   // ===========================================
   
   export class Directory
   {
      static Projection = {
         _id: 1,
         help_article_id: 1,
         help_article_name: 1,
         help_article_slug: 1,
         sequence: 1,
         
      };

      static fromHelpArticle(data: HelpArticle) : Directory {
         const result = new Directory();
         result._id = data._id;
         result.help_article_id = data.help_article_id;
         result.help_article_name = data.help_article_name;
         result.help_article_slug = data.help_article_slug;
         result.sequence = data.sequence;
         
         return result;
      }
      static copyToHelpArticle(source: HelpArticle.Directory, target: HelpArticle): void {
         //Disallow: target._id = source._id;
         target.help_article_id = source.help_article_id;
         target.help_article_name = source.help_article_name;
         target.help_article_slug = source.help_article_slug;
         target.sequence = source.sequence;
         
      }

      _id!: string;
      help_article_id!: string;
      help_article_name!: string;
      help_article_slug!: string;
      sequence!: number;
      
   }
   
   export class Public
   {
      static Projection = {
         _id: 1,
         jurisdiction_id: 1,
         help_article_id: 1,
         help_article_name: 1,
         help_article_slug: 1,
         sequence: 1,
         body: 1,
         
      };

      static fromHelpArticle(data: HelpArticle) : Public {
         const result = new Public();
         result._id = data._id;
         result.jurisdiction_id = data.jurisdiction_id;
         result.help_article_id = data.help_article_id;
         result.help_article_name = data.help_article_name;
         result.help_article_slug = data.help_article_slug;
         result.sequence = data.sequence;
         result.body = data.body;
         
         return result;
      }
      static copyToHelpArticle(source: HelpArticle.Public, target: HelpArticle): void {
         //Disallow: target._id = source._id;
         //Disallow: target.jurisdiction_id = source.jurisdiction_id;
         target.help_article_id = source.help_article_id;
         target.help_article_name = source.help_article_name;
         target.help_article_slug = source.help_article_slug;
         target.sequence = source.sequence;
         target.body = source.body;
         
      }

      _id!: string;
      jurisdiction_id!: string;
      help_article_id!: string;
      help_article_name!: string;
      help_article_slug!: string;
      sequence!: number;
      body?: ContentSection[];
      
   }
   
}