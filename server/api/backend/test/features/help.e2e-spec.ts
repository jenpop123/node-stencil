import { createTestApp, teardownTestApp, TestContext } from '../setup/test-app';
import {
   seedJurisdiction,
   ensureTestUser,
   authedAgent,
   TEST_JURISDICTION,
   TestAgent,
} from '../setup/test-helpers';
import { expectStrictItemShape, expectStrictListShape, NestedTypeMap } from '../setup/response-shape';
import { EntityRegistry } from 'src/entities/entity.registry';
import { HelpArticle } from 'src/entities/helparticle/helparticle.model';
import { ContentSection } from 'src/entities/contentsection/contentsection.model';
import { ContentSectionKind } from 'src/entities/enums/contentsectionkind';
import { LocalizedText } from 'src/entities/localizedtext/localizedtext.model';
import { LocalizedContent } from 'src/entities/localizedcontent/localizedcontent.model';

import 'src/entities/helparticle/helparticle.sanitized.validators';
import 'src/entities/contentsection/contentsection.sanitized.validators';

const PUBLISHED_ID = '22222222-2222-4222-8222-222222222222';
const UNPUBLISHED_ID = '33333333-3333-4333-8333-333333333333';

const HELP_PUBLIC_NESTED: NestedTypeMap = {
   body: [ContentSection],
};

describe('Help Feature (e2e)', () => {
   let ctx: TestContext;
   let http: TestAgent;

   beforeAll(async () => {
      ctx = await createTestApp();
      await seedJurisdiction(ctx.mongoProvider);
      await ensureTestUser(ctx.app, ctx.mongoProvider);
      http = authedAgent(ctx.app);

      const entities = ctx.app.get(EntityRegistry);
      await entities.helpArticleManager.insert(
         TEST_JURISDICTION,
         new HelpArticle({
            _id: PUBLISHED_ID,
            jurisdiction_id: TEST_JURISDICTION,
            help_article_name: 'Getting started',
            help_article_name_localized: [
               new LocalizedText({ language_code: 'es', text: 'Primeros pasos' }),
            ],
            help_article_slug: 'getting-started',
            sequence: 10,
            published: true,
            body: [
               new ContentSection({
                  section_kind: ContentSectionKind.markdown,
                  markdown: 'Welcome to help.',
                  sequence: 0,
               }),
            ],
            body_localized: [
               new LocalizedContent({
                  language_code: 'es',
                  contents: [
                     new ContentSection({
                        section_kind: ContentSectionKind.markdown,
                        markdown: 'Bienvenido a la ayuda.',
                        sequence: 0,
                     }),
                  ],
               }),
            ],
         }),
      );
      await entities.helpArticleManager.insert(
         TEST_JURISDICTION,
         new HelpArticle({
            _id: UNPUBLISHED_ID,
            jurisdiction_id: TEST_JURISDICTION,
            help_article_name: 'Draft only',
            help_article_slug: 'draft-only',
            sequence: 20,
            published: false,
            body: [
               new ContentSection({
                  section_kind: ContentSectionKind.markdown,
                  markdown: 'Not ready.',
                  sequence: 0,
               }),
            ],
         }),
      );
   }, 120_000);

   afterAll(async () => {
      if (ctx) {
         await teardownTestApp(ctx);
      }
   });

   describe('list', () => {
      it('returns only published directory rows ordered by sequence', async () => {
         const res = await http.post('/api/v1/help/list').send({});

         expect(res.status).toBe(200);
         expect(res.body.success).toBe(true);
         expect(res.body.items).toHaveLength(1);
         expect(res.body.items[0]._id).toBe(PUBLISHED_ID);
         expect(res.body.items[0].help_article_name).toBe('Getting started');
         expect(res.body.items[0].body).toBeUndefined();
         expectStrictListShape(res.body, HelpArticle.Directory);
      });

      it('filters directory rows by keyword', async () => {
         const res = await http.post('/api/v1/help/list').send({ keyword: 'getting' });

         expect(res.status).toBe(200);
         expect(res.body.items).toHaveLength(1);
         expect(res.body.items[0]._id).toBe(PUBLISHED_ID);
      });

      it('returns an empty list when the keyword matches nothing published', async () => {
         const res = await http.post('/api/v1/help/list').send({ keyword: 'draft' });

         expect(res.status).toBe(200);
         expect(res.body.items).toHaveLength(0);
      });
   });

   describe('get', () => {
      it('returns the stored default when no language is requested', async () => {
         const res = await http.post('/api/v1/help/get').send({ help_article_id: PUBLISHED_ID });

         expect(res.status).toBe(200);
         expect(res.body.success).toBe(true);
         expect(res.body.item.help_article_name).toBe('Getting started');
         expect(res.body.item.body[0].markdown).toBe('Welcome to help.');
         expect(res.body.item.help_article_name_localized).toBeUndefined();
         expect(res.body.item.body_localized).toBeUndefined();
         expectStrictItemShape(res.body, HelpArticle.Public, HELP_PUBLIC_NESTED);
      });

      it('writes the matching translation into the default fields', async () => {
         const res = await http
            .post('/api/v1/help/get')
            .send({ help_article_id: PUBLISHED_ID, language_code: 'es' });

         expect(res.status).toBe(200);
         expect(res.body.item.help_article_name).toBe('Primeros pasos');
         expect(res.body.item.body[0].markdown).toBe('Bienvenido a la ayuda.');
         expect(res.body.item.body_localized).toBeUndefined();
      });

      it('keeps the stored default when the language has no translation', async () => {
         const res = await http
            .post('/api/v1/help/get')
            .send({ help_article_id: PUBLISHED_ID, language_code: 'fr' });

         expect(res.status).toBe(200);
         expect(res.body.item.help_article_name).toBe('Getting started');
         expect(res.body.item.body[0].markdown).toBe('Welcome to help.');
      });

      it('leaves the stored document on the default after a translated read', async () => {
         await http
            .post('/api/v1/help/get')
            .send({ help_article_id: PUBLISHED_ID, language_code: 'es' });

         const res = await http.post('/api/v1/help/get').send({ help_article_id: PUBLISHED_ID });

         expect(res.status).toBe(200);
         expect(res.body.item.help_article_name).toBe('Getting started');
         expect(res.body.item.body[0].markdown).toBe('Welcome to help.');
      });

      it('returns 404 for an unpublished article', async () => {
         const res = await http.post('/api/v1/help/get').send({ help_article_id: UNPUBLISHED_ID });

         expect(res.status).toBe(404);
      });

      it('returns 404 for an unknown article', async () => {
         const res = await http
            .post('/api/v1/help/get')
            .send({ help_article_id: '00000000-0000-4000-8000-000000000000' });

         expect(res.status).toBe(404);
      });

      it('rejects properties the request model does not allow', async () => {
         const res = await http
            .post('/api/v1/help/get')
            .send({ help_article_id: PUBLISHED_ID, jurisdiction_id: 'ZZ' });

         expect(res.status).toBe(400);
      });

      it('returns 4xx for an unauthenticated read', async () => {
         const supertest = require('supertest');
         const res = await supertest(ctx.app.getHttpServer())
            .post('/api/v1/help/get')
            .send({ help_article_id: PUBLISHED_ID });

         expect(res.status).toBeGreaterThanOrEqual(400);
         expect(res.status).toBeLessThan(500);
      });

      it('returns 4xx for an unauthenticated list', async () => {
         const supertest = require('supertest');
         const res = await supertest(ctx.app.getHttpServer()).post('/api/v1/help/list').send({});

         expect(res.status).toBeGreaterThanOrEqual(400);
         expect(res.status).toBeLessThan(500);
      });
   });
});
