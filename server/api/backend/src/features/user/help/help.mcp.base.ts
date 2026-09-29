import { JsonSchema, McpFeatureTool, McpResultKind, McpSchemaMode } from 'src/shared/mcp/mcp.types';
import { listOutputSchema, objectSchema, schemaProperty } from 'src/shared/mcp/mcp.schema';
import * as schemas from 'src/features/mcp.schemas';
import { IHelpOperations } from './help.operations';
import { IHelpArticleListRequest, HelpArticleListRequest } from './models/helparticlelistrequest';
import { IHelpArticleReadRequest, HelpArticleReadRequest } from './models/helparticlereadrequest';

function featureSchema_HelpArticleListRequest(mode: McpSchemaMode): JsonSchema {
   return objectSchema(mode, {
      keyword: schemaProperty(mode, { type: 'string', title: 'Keyword', description: 'Optional search text matched against published help article names and slugs.' }, true),
   }, []);
}

function featureSchema_HelpArticleReadRequest(mode: McpSchemaMode): JsonSchema {
   return objectSchema(mode, {
      help_article_id: schemaProperty(mode, { type: 'string', format: 'uuid', title: 'Help Article', description: 'Id of the published help article to read.' }, false),
      language_code: schemaProperty(mode, { type: 'string', title: 'Language', description: 'Language code. A matching translation replaces the default name and body. Otherwise those stored defaults are returned.' }, true),
   }, ['help_article_id']);
}

export const HELP_MCP_TOOLS: McpFeatureTool<IHelpOperations>[] = [
   {
      definition: {
         name: 'help_list_articles',
         title: 'List help articles',
         description: 'List published help articles in the signed-in user\'s jurisdiction. Optional keyword filters the directory. Returns directory rows (id, name, slug, sequence), not article bodies.',
         inputSchema: featureSchema_HelpArticleListRequest(McpSchemaMode.input),
         outputSchema: listOutputSchema(schemas.itemSchema_HelpArticle_Directory(McpSchemaMode.output)),
         annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
         },
      },
      requestModel: HelpArticleListRequest,
      resultKind: McpResultKind.list,
      invoke: (operations, request, input) => operations.list(request, input as IHelpArticleListRequest),
   },
   {
      definition: {
         name: 'help_get_article',
         title: 'Get help article',
         description: 'Read one published help article by id. Optional language_code copies a matching translation onto the default name and body. Unpublished or unknown ids are not found. Returns the public article, not translation arrays.',
         inputSchema: featureSchema_HelpArticleReadRequest(McpSchemaMode.input),
         outputSchema: schemas.itemSchema_HelpArticle_Public(McpSchemaMode.output),
         annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
         },
      },
      requestModel: HelpArticleReadRequest,
      resultKind: McpResultKind.item,
      invoke: (operations, request, input) => operations.get(request, input as IHelpArticleReadRequest),
   },
];