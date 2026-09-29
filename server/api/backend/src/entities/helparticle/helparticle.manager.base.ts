import { ConflictException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { MongoManagerIsolated } from 'src/shared/managers/mongo-manager.isolated';
import { MongoConnectionProvider } from 'src/shared/mongo/mongo-connection.provider';
import { HelpArticle } from './helparticle.model';
import { QueryFilter, ProjectionFields, SortOrder, UpdateQuery } from 'mongoose';
import type { Document } from 'bson';
import { COLLECTION_NAME, PRIMARY_KEY } from './helparticle.schema';
import { v4 as uuidv4 } from 'uuid';
import { isNullOrWhiteSpace, sanitizeHtml, truncateStart } from 'src/shared/utils/string.utils';
import { SEARCHABLE_DIVIDER } from 'src/shared/mongo';
import { UIException } from 'src/shared/exceptions/friendly-exception';
import { LocalizableString } from 'src/shared/types/i18n/localizable-string';
import { DependencyCoordinator } from '../dependencies/dependency-coordinator';
import { EntityRegistry } from '../entity.registry';
import { DocumentOperation } from '../common/document-operation';
import { ItemResult } from 'src/shared/types/data/item-result';
import { ListResult } from 'src/shared/types/data/list-result';
import { SortInfo } from 'src/shared/types/data/sort-info';
import { MAX_INT_32 } from 'src/shared/constants/int';
import { validate as uuidValidate } from 'uuid';
import { MemoryCache } from 'src/shared/cache/memory-cache';
import { BatchUtils } from 'src/shared/utils';


@Injectable()
export class HelpArticleManagerBase extends MongoManagerIsolated<HelpArticle> {
   protected readonly logger = new Logger(HelpArticleManagerBase.name);

   constructor(connectionProvider: MongoConnectionProvider, entities: EntityRegistry, dependencyCoordinator: DependencyCoordinator, memoryCache: MemoryCache) {
      super(COLLECTION_NAME, PRIMARY_KEY, connectionProvider, entities, dependencyCoordinator, memoryCache);
   }

   async validateExistence(jurisdiction_id:string, _id:string) {
      const found = await this._retrieveIsolated<HelpArticle>(HelpArticle, jurisdiction_id, _id, { _id: 1 });
      
      if (!found) {
         throw new UIException(LocalizableString.General_InvalidReference("HelpArticle"));
      }
   }
   
   
   async anyWithJurisdiction(jurisdiction_id:string | undefined): Promise<boolean>{
      if (!jurisdiction_id){
         return false;
      }
      const filter: QueryFilter<HelpArticle> = {
         jurisdiction_id: jurisdiction_id
      };

      const found = await this._findIsolated<HelpArticle>(HelpArticle, jurisdiction_id, filter, { _id: 1 }, 0, 1, undefined, false);
      return found.items.length > 0;
   }
   

   async getById(jurisdiction_id: string, _id: string): Promise<HelpArticle | undefined> {
      const result = this._retrieveIsolated<HelpArticle>(HelpArticle, jurisdiction_id, _id, HelpArticle.Projection);
      return result;
   }
   
   async getByIdPublic(jurisdiction_id: string, _id:string) : Promise<HelpArticle.Public | undefined> {
      const result = await this._retrieveIsolated<HelpArticle.Public>(HelpArticle.Public, jurisdiction_id, _id, HelpArticle.Public.Projection);
      return result;
   }
   

   async getWithin<TProjection>(
      ctor: new (...args: any[]) => TProjection, 
      projection: ProjectionFields<TProjection>,
      jurisdiction_id: string,
      ids: string[]
   ): Promise<TProjection[]> {
      if (!ids || ids.length === 0) {
         return [];
      }

      const result = BatchUtils.getWithinBuffered(ids, async (ids: string[]): Promise<TProjection[]> => {
         const orFilter = BatchUtils.createOrFilter<HelpArticle>(ids, '_id');
         const filter: QueryFilter<HelpArticle> = {
            jurisdiction_id: jurisdiction_id,
            ...orFilter,
         };

         const result = await this._findIsolated<TProjection>(ctor, jurisdiction_id, filter, projection, 0, MAX_INT_32);
         
         return result.items;
      });
      return result;
      
   }

   
   async getForHelpArticleSlug(jurisdiction_id: string, help_article_slug: string): Promise<HelpArticle | undefined> {
      const filter: QueryFilter<HelpArticle> = { jurisdiction_id: jurisdiction_id, help_article_slug: help_article_slug };
      const result = await this._findOneIsolated<HelpArticle>(HelpArticle, jurisdiction_id, filter, HelpArticle.Projection);
      return result;
   }
   

   async find(
      jurisdiction_id: string, 
      skip: number, 
      take: number,
      keyword?: string,
      order_by?: string, 
      descending: boolean = false,
      published?: boolean
   ): Promise<ListResult<HelpArticle>> {
      return await this.findAs<HelpArticle>(
         HelpArticle,
         HelpArticle.Projection,
         jurisdiction_id, 
         skip, 
         take,
         keyword,
         order_by, 
         descending,
         published
      );
   }
   
   async findDirectory(
      jurisdiction_id: string,
      skip: number, 
      take: number,
      keyword?: string,
      order_by?: string, 
      descending: boolean = false,
      published?: boolean
   ): Promise<ListResult<HelpArticle.Directory>> {
      return await this.findAs<HelpArticle.Directory>(
         HelpArticle.Directory,
         HelpArticle.Directory.Projection,
         jurisdiction_id, 
         skip, 
         take,
         keyword,
         order_by, 
         descending,
         published
      );
   }
   

   protected async findAs<TProjection>(
      ctor: new (...args: any[]) => TProjection, 
      projection: ProjectionFields<TProjection>,
      jurisdiction_id: string, 
      skip: number, 
      take: number,
      keyword?: string,
      order_by?: string, 
      descending: boolean = false,
      published?: boolean
   ): Promise<ListResult<TProjection>> {
      const filter: QueryFilter<HelpArticle> = {
         jurisdiction_id: jurisdiction_id,
      };
      
      if (!isNullOrWhiteSpace(keyword)) {
         // Escape special regex characters to treat them as literals
         const escapedKeyword = keyword!.toLowerCase().replace(/[+*?^${}()|[\]\\]/g, '\\$&');
         filter.searchable = { $regex: escapedKeyword, $options: 'i' };
      }
      
      if(published !== undefined && published !== null) {
         filter.published = published;
      }
      
      const sorts = this.applySafeSort([{ field: order_by, descending}]);

      let result = await this._findIsolated<TProjection>(ctor, jurisdiction_id, filter, projection, skip, take, sorts);
      
      result = await this.postProcessFindAs(result);

      return result;
   }

   
   async insert(jurisdiction_id: string, document: HelpArticle): Promise<HelpArticle> {
      if (jurisdiction_id != document.jurisdiction_id) {
         throw new ConflictException("jurisdiction_id mismatch");
      }
      
      if (!document._id) {
         document._id = uuidv4();
      }
      
      // ID Alias
      document.help_article_id = document._id;
      
      document.created_utc = new Date();
      document.updated_utc = document.created_utc;

      await this.preProcessMutationDocument(document, DocumentOperation.insert);
      await this.preProcessMutationInfoPerspective(document.asInfoPerspective(), DocumentOperation.insert);
      
      await this.preProcessMutationStatusPerspective(document.asStatusPerspective(), DocumentOperation.insert);
      
      await this.preProcessMutationContentPerspective(document.asContentPerspective(), DocumentOperation.insert);
      
      await this.calculateSearchable(document);
      
      await this.sanitize(document);
      
      await this.validate(document);
      
      await this.entities.jurisdictionManager.validateExistence(document.jurisdiction_id);
      await this._insertIsolated(HelpArticle, jurisdiction_id, document);
      
      await this.postProcessMutationDocument(document, DocumentOperation.insert);
      await this.postProcessMutationInfoPerspective(document.asInfoPerspective(), DocumentOperation.insert);
      
      await this.postProcessMutationStatusPerspective(document.asStatusPerspective(), DocumentOperation.insert);
      
      await this.postProcessMutationContentPerspective(document.asContentPerspective(), DocumentOperation.insert);
      

      return document;
   }

   async replace(jurisdiction_id: string, _id: string, document: HelpArticle): Promise<HelpArticle> {
      if (jurisdiction_id != document.jurisdiction_id) {
         throw new ConflictException("jurisdiction_id mismatch");
      }
      
      // ID Alias
      document.help_article_id = document._id;
      
      document.updated_utc = new Date();

      await this.preProcessMutationDocument(document, DocumentOperation.replace);
      await this.preProcessMutationInfoPerspective(document.asInfoPerspective(), DocumentOperation.replace);
      
      await this.preProcessMutationStatusPerspective(document.asStatusPerspective(), DocumentOperation.replace);
      
      await this.preProcessMutationContentPerspective(document.asContentPerspective(), DocumentOperation.replace);
      
      await this.calculateSearchable(document);
      
      await this.sanitize(document);
      
      await this.validate(document);
      
      await this.entities.jurisdictionManager.validateExistence(document.jurisdiction_id);
      
      const unset: string[] | undefined = this.determineRemovableFieldsDocument(document);

      await this._upsertIsolated(HelpArticle, jurisdiction_id, _id, document, unset);
      
      await this.postProcessMutationDocument(document, DocumentOperation.replace);
      await this.postProcessMutationInfoPerspective(document.asInfoPerspective(), DocumentOperation.replace);
      
      await this.postProcessMutationStatusPerspective(document.asStatusPerspective(), DocumentOperation.replace);
      
      await this.postProcessMutationContentPerspective(document.asContentPerspective(), DocumentOperation.replace);
      

      return document;

   }

   

   async delete(document: HelpArticle): Promise<boolean> {
      await this.preProcessMutationDocument(document, DocumentOperation.delete);
      
      // Get Server version
      const actual = await this.getById(document.jurisdiction_id, document._id);
      if (actual == undefined) {
         return true;
      }
      
      const result = await this._deleteIsolated(actual.jurisdiction_id, actual._id);
      if (result) {
         await this.postProcessMutationDocument(actual, DocumentOperation.delete);
      }
      
      return result;
   }
   
   async updateInfoPerspective(perspective: HelpArticle.InfoPerspective){
      const actual = perspective.getActual();

      await this.preProcessMutationInfoPerspective(perspective, DocumentOperation.updatePerspective);
      
      await this.sanitizeInfoPerspective(perspective);
      
      await this.validateInfoPerspective(perspective);
      
      await this.calculateSearchable(actual);
      const filter = { _id: perspective._id };
      const update: UpdateQuery<HelpArticle>  = {
         $set: {
            updated_utc: new Date(),
            searchable: actual.searchable,
            help_article_name: perspective.help_article_name,
            help_article_name_localized: perspective.help_article_name_localized,
            help_article_slug: perspective.help_article_slug,
            sequence: perspective.sequence
         }
      };
      const removableFields = this.determineRemovableFieldsInfoPerspective(perspective);
      if (removableFields) {
         update.$unset = removableFields;
      }

      const result = await this._updatePartialIsolated(perspective.jurisdiction_id, filter, update);
      
      if (result.matchedCount > 0) {
         await this.postProcessMutationInfoPerspective(perspective, DocumentOperation.updatePerspective);
      }
      
      return result.matchedCount > 0;
   }

   protected determineRemovableFieldsInfoPerspective(perspective: HelpArticle.InfoPerspective): Record<string, 1> | undefined {
      if (!perspective){
         return; // sanity
      }

      // Check all nullable perspective fields for unset (handles both primitives and classes)
      const fieldsToRemove:string[] = [];
      
      if (perspective.help_article_name_localized === undefined) {
         fieldsToRemove.push("help_article_name_localized");
      }
      
      if (fieldsToRemove.length > 0) {
         const unset = {} as Record<string, 1>;
         fieldsToRemove.forEach(field => {
            unset[field] = 1;
         });
         return unset;
      }

      return undefined;
   }
   
   async updateStatusPerspective(perspective: HelpArticle.StatusPerspective){
      const actual = perspective.getActual();

      await this.preProcessMutationStatusPerspective(perspective, DocumentOperation.updatePerspective);
      
      await this.sanitizeStatusPerspective(perspective);
      
      await this.validateStatusPerspective(perspective);
      const filter = { _id: perspective._id };
      const update: UpdateQuery<HelpArticle>  = {
         $set: {
            updated_utc: new Date(),
            published: perspective.published
         }
      };
      const removableFields = this.determineRemovableFieldsStatusPerspective(perspective);
      if (removableFields) {
         update.$unset = removableFields;
      }

      const result = await this._updatePartialIsolated(perspective.jurisdiction_id, filter, update);
      
      if (result.matchedCount > 0) {
         await this.postProcessMutationStatusPerspective(perspective, DocumentOperation.updatePerspective);
      }
      
      return result.matchedCount > 0;
   }

   protected determineRemovableFieldsStatusPerspective(perspective: HelpArticle.StatusPerspective): Record<string, 1> | undefined {
      if (!perspective){
         return; // sanity
      }

      // Check all nullable perspective fields for unset (handles both primitives and classes)
      const fieldsToRemove:string[] = [];
      
      
      if (fieldsToRemove.length > 0) {
         const unset = {} as Record<string, 1>;
         fieldsToRemove.forEach(field => {
            unset[field] = 1;
         });
         return unset;
      }

      return undefined;
   }
   
   async updateContentPerspective(perspective: HelpArticle.ContentPerspective){
      const actual = perspective.getActual();

      await this.preProcessMutationContentPerspective(perspective, DocumentOperation.updatePerspective);
      
      await this.sanitizeContentPerspective(perspective);
      
      await this.validateContentPerspective(perspective);
      const filter = { _id: perspective._id };
      const update: UpdateQuery<HelpArticle>  = {
         $set: {
            updated_utc: new Date(),
            body: perspective.body,
            body_localized: perspective.body_localized
         }
      };
      const removableFields = this.determineRemovableFieldsContentPerspective(perspective);
      if (removableFields) {
         update.$unset = removableFields;
      }

      const result = await this._updatePartialIsolated(perspective.jurisdiction_id, filter, update);
      
      if (result.matchedCount > 0) {
         await this.postProcessMutationContentPerspective(perspective, DocumentOperation.updatePerspective);
      }
      
      return result.matchedCount > 0;
   }

   protected determineRemovableFieldsContentPerspective(perspective: HelpArticle.ContentPerspective): Record<string, 1> | undefined {
      if (!perspective){
         return; // sanity
      }

      // Check all nullable perspective fields for unset (handles both primitives and classes)
      const fieldsToRemove:string[] = [];
      
      if (perspective.body === undefined) {
         fieldsToRemove.push("body");
      }
      if (perspective.body_localized === undefined) {
         fieldsToRemove.push("body_localized");
      }
      
      if (fieldsToRemove.length > 0) {
         const unset = {} as Record<string, 1>;
         fieldsToRemove.forEach(field => {
            unset[field] = 1;
         });
         return unset;
      }

      return undefined;
   }
   

   async ensureIndexes(jurisdiction_id: string): Promise<void> {
      const connection = await this.getIsolatedConnection(jurisdiction_id);
      const existing = await connection.db!.listCollections({ name: this.collectionName }).toArray();
      if (existing.length == 0){
         return; // doesn't exist yet
      }
      
      const model = await this.getIsolatedModel(jurisdiction_id);
      const collection = model.db.collection(this.collectionName);
      const indexes = await collection.indexes();

      let match:Document | undefined = undefined;
      
      // default_pkey_routed_v1
      match = indexes.find(x => x.name == 'default_pkey_routed_v1');
      if (!match)
      {
         const options = {
            unique: false,
            name: 'default_pkey_routed_v1'
         };
         const fields = {
            jurisdiction_id: 1,
            _id: 1
         };

         await collection.createIndex(fields, options);
      }
      
      // unique_slug
      match = indexes.find(x => x.name == "unique_slug");
      if (!match)
      {
         const options = {
            unique: true,
            name: 'unique_slug'
         };
         const fields = {
            help_article_slug: 1,
         };
         await collection.createIndex(fields, options);
      }
      
      // by_published_sequence
      match = indexes.find(x => x.name == 'by_published_sequence');
      if (!match)
      {
         const options = {
            unique: false,
            name: 'by_published_sequence'
         };
         const fields = {
            published: 1,
            sequence: 1,
         };
         await collection.createIndex(fields, options);
      }
      
      // default_searchable
      match = indexes.find(x => x.name == "default_searchable_en_v1");
      if (match == null)
      {
         const options = {
            unique: false,
            name: 'default_searchable_en_v1',
            collation: {
               locale: 'en',
               strength: 1    // Case-insensitive, diacritic-insensitive
            }
         };
         const fields = {
            jurisdiction_id: 1,
            searchable: 1,
         };
         await collection.createIndex(fields, options);
      }
      
   }

   protected determineRemovableFieldsDocument(document: HelpArticle): string[] | undefined {
      if (!document){
         return; // sanity
      }
      const fieldsToRemove:string[] = [];
      
      // Check all nullable fields for unset (handles both primitives and classes)
      if (document.help_article_name_localized === undefined) {
         fieldsToRemove.push('help_article_name_localized');
      }
      if (document.body === undefined) {
         fieldsToRemove.push('body');
      }
      if (document.body_localized === undefined) {
         fieldsToRemove.push('body_localized');
      }
      
      return fieldsToRemove;
   }

   /**
    * Only allow sorting by known indexed fields
    */
   protected applySafeSort(sorts:SortInfo[]) : [string, SortOrder][] {
      const result: [string, SortOrder][] = [];

      const allowedFields = ['help_article_name', 'help_article_slug', 'sequence'];
      
      for (const item of sorts) {
         if (!isNullOrWhiteSpace(item.field)) {
            if (allowedFields.includes(item.field!)) {
               result.push([item.field!, item.descending === true ? 'desc' : 'asc']);
            }
         }
      }
      if (result.length === 0) {
         result.push(['sequence', 'asc']);
      }

      return result;
   }

   protected async sanitize(document: HelpArticle) : Promise<void> {
      HelpArticle.sanitize(document);
   }
   
   protected async sanitizeInfoPerspective(perspective:HelpArticle.InfoPerspective) {
      
      perspective.help_article_slug = perspective.help_article_slug?.toLowerCase();
      perspective.help_article_name = sanitizeHtml(perspective.help_article_name, false);
      perspective.help_article_slug = sanitizeHtml(perspective.help_article_slug, false);
   }
   
   protected async sanitizeStatusPerspective(perspective:HelpArticle.StatusPerspective) {
      
   }
   
   protected async sanitizeContentPerspective(perspective:HelpArticle.ContentPerspective) {
      
   }
   

   protected async validate(document: HelpArticle): Promise<void> {
      // Fields
      
      if (!document._id || !uuidValidate(document._id)) {
         throw new UIException(LocalizableString.General_FieldRequired("helparticle._id"));
      }
      
      if (!document.help_article_id || !uuidValidate(document.help_article_id)) {
         throw new UIException(LocalizableString.General_FieldRequired("helparticle.help_article_id"));
      }
      
      if (isNullOrWhiteSpace(document.jurisdiction_id)) {
         throw new UIException(LocalizableString.General_FieldRequired("helparticle.jurisdiction_id"));
      }
      
      if (isNullOrWhiteSpace(document.help_article_name)) {
         throw new UIException(LocalizableString.General_FieldRequired("helparticle.help_article_name"));
      }
      
      if (isNullOrWhiteSpace(document.help_article_slug)) {
         throw new UIException(LocalizableString.General_FieldRequired("helparticle.help_article_slug"));
      }
      
      if (document.jurisdiction_id && document.jurisdiction_id.length > 10) {
         throw new UIException(LocalizableString.General_FieldMaxLength(10, "helparticle.jurisdiction_id"));
      }
      
      if (document.help_article_name && document.help_article_name.length > 200) {
         throw new UIException(LocalizableString.General_FieldMaxLength(200, "helparticle.help_article_name"));
      }
      
      if (document.help_article_slug && document.help_article_slug.length > 80) {
         throw new UIException(LocalizableString.General_FieldMaxLength(80, "helparticle.help_article_slug"));
      }
      
   }

   
   protected async validateInfoPerspective(document: HelpArticle.InfoPerspective): Promise<void> {
      
      if (isNullOrWhiteSpace(document.help_article_name)) {
         throw new UIException(LocalizableString.General_FieldRequired("helparticle.help_article_name"));
      }
      
      if (isNullOrWhiteSpace(document.help_article_slug)) {
         throw new UIException(LocalizableString.General_FieldRequired("helparticle.help_article_slug"));
      }
      
      if (document.help_article_name && document.help_article_name.length > 200) {
         throw new UIException(LocalizableString.General_FieldMaxLength(200, "helparticle.help_article_name"));
      }
      
      if (document.help_article_slug && document.help_article_slug.length > 80) {
         throw new UIException(LocalizableString.General_FieldMaxLength(80, "helparticle.help_article_slug"));
      }
      
   }
   
   protected async validateStatusPerspective(document: HelpArticle.StatusPerspective): Promise<void> {
      
   }
   
   protected async validateContentPerspective(document: HelpArticle.ContentPerspective): Promise<void> {
      
   }
   
   protected async calculateSearchable(document: HelpArticle) : Promise<void> {
      document.searchable = SEARCHABLE_DIVIDER;
      
      if (!isNullOrWhiteSpace(document.help_article_name)) {
         document.searchable += document.help_article_name!.toLowerCase() + SEARCHABLE_DIVIDER;
      }
      if (!isNullOrWhiteSpace(document.help_article_slug)) {
         document.searchable += document.help_article_slug!.toLowerCase() + SEARCHABLE_DIVIDER;
      }
   }
   

   protected async postProcessFindAs<TProjection>(data: ListResult<TProjection>) : Promise<ListResult<TProjection>> {
      return data;
   }
   protected async preProcessMutationDocument(document: HelpArticle, documentOperation: DocumentOperation): Promise<void> {
      // for override customization
   }
   protected async postProcessMutationDocument(document: HelpArticle, documentOperation: DocumentOperation): Promise<void> {
      // for override customization
   }
   
   protected async preProcessMutationInfoPerspective(perspective: HelpArticle.InfoPerspective, documentOperation: DocumentOperation): Promise<void> {
      // for override customization
   }
   protected async postProcessMutationInfoPerspective(perspective: HelpArticle.InfoPerspective, documentOperation: DocumentOperation): Promise<void> {
      // for override customization
   }
   
   protected async preProcessMutationStatusPerspective(perspective: HelpArticle.StatusPerspective, documentOperation: DocumentOperation): Promise<void> {
      // for override customization
   }
   protected async postProcessMutationStatusPerspective(perspective: HelpArticle.StatusPerspective, documentOperation: DocumentOperation): Promise<void> {
      // for override customization
   }
   
   protected async preProcessMutationContentPerspective(perspective: HelpArticle.ContentPerspective, documentOperation: DocumentOperation): Promise<void> {
      // for override customization
   }
   protected async postProcessMutationContentPerspective(perspective: HelpArticle.ContentPerspective, documentOperation: DocumentOperation): Promise<void> {
      // for override customization
   }
   
}