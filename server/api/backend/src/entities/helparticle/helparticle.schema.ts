import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { ModelAnnotations } from 'src/shared/utils/model-annotations';
import mongooseLeanGetters from 'mongoose-lean-getters';
import { uuidAutoConversionPlugin } from 'src/shared/mongo/uuid-auto-conversion.plugin';
import { LocalizedText } from 'src/entities/localizedtext/localizedtext.schema';
import { ContentSection } from 'src/entities/contentsection/contentsection.schema';
import { LocalizedContent } from 'src/entities/localizedcontent/localizedcontent.schema';


export const COLLECTION_NAME = 'HelpArticle';
export const PRIMARY_KEY = '_id';

export namespace HelpArticle {

   
   // ===========================================
   // Projection: HelpArticle.Directory
   // ===========================================
   @Schema()
   export class DirectoryDocument {
      
      @Prop({
         ...ModelAnnotations.uuid,
         required: true,
      })
      _id: string;
      
      @Prop({
         ...ModelAnnotations.uuid,
         required: true,
      })
      help_article_id: string;
      
      @Prop({
         type: String,
         required: true,
      })
      help_article_name: string;
      
      @Prop({
         type: String,
         required: true,
      })
      help_article_slug: string;
      
      @Prop({
         type: Number,
         required: true,
      })
      sequence: number;
      
   }

   export const DirectorySchema = SchemaFactory.createForClass(DirectoryDocument);
   DirectorySchema.plugin(mongooseLeanGetters);
   DirectorySchema.plugin(uuidAutoConversionPlugin);
   
   // ===========================================
   // Projection: HelpArticle.Public
   // ===========================================
   @Schema()
   export class PublicDocument {
      
      @Prop({
         ...ModelAnnotations.uuid,
         required: true,
      })
      _id: string;
      
      @Prop({
         type: String,
         required: true,
      })
      jurisdiction_id: string;
      
      @Prop({
         ...ModelAnnotations.uuid,
         required: true,
      })
      help_article_id: string;
      
      @Prop({
         type: String,
         required: true,
      })
      help_article_name: string;
      
      @Prop({
         type: String,
         required: true,
      })
      help_article_slug: string;
      
      @Prop({
         type: Number,
         required: true,
      })
      sequence: number;
      
      @Prop({
         type: [ContentSection.ContentSectionSchema],
         required: false,
      })
      body: ContentSection.ContentSectionDocument;
      
   }

   export const PublicSchema = SchemaFactory.createForClass(PublicDocument);
   PublicSchema.plugin(mongooseLeanGetters);
   PublicSchema.plugin(uuidAutoConversionPlugin);
   
   
   // ===========================================
   // Entity: HelpArticle
   // ===========================================

   @Schema({ ...ModelAnnotations.document })
   export class HelpArticleDocument {
      @Prop({
         type: String,
         required: false,
      })
      _id: string;
      
      @Prop({
         ...ModelAnnotations.uuid,
         required: true,
      })
      help_article_id: string;
      
      @Prop({
         type: String,
         required: true,
      })
      jurisdiction_id: string;
      
      @Prop({
         type: String,
         required: true,
      })
      help_article_name: string;
      
      @Prop({
         type: [LocalizedText.LocalizedTextSchema],
         required: false,
      })
      help_article_name_localized: LocalizedText.LocalizedTextDocument[];
      
      @Prop({
         type: String,
         required: true,
      })
      help_article_slug: string;
      
      @Prop({
         type: Number,
         required: true,
      })
      sequence: number;
      
      @Prop({
         type: Boolean,
         required: true,
      })
      published: boolean;
      
      @Prop({
         type: [ContentSection.ContentSectionSchema],
         required: false,
      })
      body: ContentSection.ContentSectionDocument[];
      
      @Prop({
         type: [LocalizedContent.LocalizedContentSchema],
         required: false,
      })
      body_localized: LocalizedContent.LocalizedContentDocument[];
      
      @Prop({
         type: Date,
         required: true,
      })
      created_utc: Date;
      
      @Prop({
         type: Date,
         required: true,
      })
      updated_utc: Date;
      
      @Prop({
         type: String,
         required: true,
      })
      searchable?: string;
      
   }
  
   export const HelpArticleSchema = SchemaFactory.createForClass(HelpArticleDocument);
   HelpArticleSchema.plugin(uuidAutoConversionPlugin);
   HelpArticleSchema.plugin(mongooseLeanGetters);

   

}