import { forwardRef, Module } from '@nestjs/common';
import { registerSchema } from 'src/shared/managers/schema-registry';
import { SchemaFactory } from '@nestjs/mongoose';
import { MongoModule } from 'src/shared/mongo/mongo.module';
import { HelpArticleController } from './helparticle.controller';
import { HelpArticleManager } from './helparticle.manager';
import { COLLECTION_NAME, HelpArticle } from './helparticle.schema';
import { EntitiesModule } from 'src/entities/entity.module';

@Module({
   imports: [MongoModule, forwardRef(() => EntitiesModule)],
   controllers: [HelpArticleController],
   providers: [
      HelpArticleManager,
      {
         provide: 'HelpArticleManager', // For dynamic resolution
         useClass: HelpArticleManager,
      },
   ],
   exports: [
      HelpArticleManager,
      {
         provide: 'HelpArticleManager', // For dynamic resolution
         useClass: HelpArticleManager,
      },
   ]
})
export class HelpArticleModule {
   constructor() {
      registerSchema({
         name: COLLECTION_NAME,
         schema: HelpArticle.HelpArticleSchema,
      });
   }
}