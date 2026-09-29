import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors, NotFoundException } from '@nestjs/common';
import { HelpArticle } from './helparticle.model';
import { HelpArticleManager } from './helparticle.manager';
import { ListResult } from 'src/shared/types/data/list-result';
import { ItemResult } from 'src/shared/types/data/item-result';
import { ActionResult } from 'src/shared/types/data/action-result';
import { AuthGuard, Permission } from 'src/shared/access-control/auth.guard';
import { AppPermissions } from 'src/shared/constants/permissions';
import { OptionalIntPipe, Sanitize } from 'src/shared/utils';
import { OptionalBoolPipe } from 'src/shared/utils/optional-bool.pipe';
import './helparticle.sanitized.validators';


@Controller('admin/:jurisdiction_id/helparticle')
@UseGuards(AuthGuard)
export class HelpArticleControllerBase {
   constructor(protected readonly manager: HelpArticleManager, ) {}

   @Get('find')
   @Permission(AppPermissions.Admin.HelpArticle.Read)
   async find(
      @Param('jurisdiction_id') jurisdiction_id: string,
      @Query('skip', OptionalIntPipe) skip: number = 0,
      @Query('take', OptionalIntPipe) take: number = 10,
      @Query('order_by') order_by?: string,
      @Query('descending', OptionalBoolPipe) descending: boolean = false,
      @Query('keyword') keyword?: string,
      @Query('published', OptionalBoolPipe ) published?: boolean
   ): Promise<ListResult<HelpArticle>> {
      const result:ListResult<HelpArticle> = await this.manager.find(jurisdiction_id, skip, take, keyword, order_by, descending, published);
      
      return result;
   }

   @Get(':_id')
   @Permission(AppPermissions.Admin.HelpArticle.Read)
   async get(@Param('jurisdiction_id') jurisdiction_id: string, @Param('_id') _id: string): Promise<ItemResult<HelpArticle>> {
      const data = await this.manager.getById(jurisdiction_id, _id);
      const result: ItemResult<HelpArticle> = {
         success: true,
         item: data,
      };
      
      return result;
   }

   @Post()
   @Permission(AppPermissions.Admin.HelpArticle.Write)
   async create(@Param('jurisdiction_id') jurisdiction_id: string, @Body(Sanitize.for(HelpArticle)) input: HelpArticle): Promise<ItemResult<HelpArticle>> {
      const data = await this.manager.insert(jurisdiction_id, input);
      const result: ItemResult<HelpArticle> = {
         success: true,
         item: data,
      };
      
      return result;
   }

   @Put(':_id')
   @Permission(AppPermissions.Admin.HelpArticle.Write)
   async update(@Param('jurisdiction_id') jurisdiction_id: string, @Param('_id') _id: string, @Body(Sanitize.for(HelpArticle)) input: HelpArticle): Promise<ItemResult<HelpArticle>> {
      const existing = await this.manager.getById(jurisdiction_id, _id);
      if (!existing) {
         throw new NotFoundException();
      }
      existing.fillFromPartial(input);
      const data = await this.manager.replace(jurisdiction_id, _id, existing);
      const result: ItemResult<HelpArticle> = {
         success: true,
         item: data,
      };
      
      return result;
   }

   @Delete(':_id')
   @Permission(AppPermissions.Admin.HelpArticle.Write)
   async delete(@Param('jurisdiction_id') jurisdiction_id: string, @Param('_id') _id: string): Promise<ActionResult> {
      const data = await this.manager.getById(jurisdiction_id, _id);
      if (data){
         await this.manager.delete(data);
      }
      const result: ActionResult = {
         success: true
      };
      return result;
   }

   
}