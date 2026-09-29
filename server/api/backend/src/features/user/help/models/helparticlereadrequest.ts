import { registerSanitizedValidators } from 'src/shared/utils/sanitized.registry';
import type { SanitizedValidatorMap } from 'src/shared/types/sanitized.types';
import {
   assertString,
   assertStringArray,
   assertBoolean,
   assertNumber,
   assertUuid,
   assertDate,
   assertEnum,
   assertEnumArray,
   assertNested,
   assertNestedArray,
   assertPlainObject,
   optional,
} from 'src/shared/utils/sanitized.validators';



export interface IHelpArticleReadRequest {
	help_article_id: string;
   language_code?: string;
   
}

/** Registry key for Sanitize.for(HelpArticleReadRequest). Use @Body(Sanitize.for(HelpArticleReadRequest)) input: IHelpArticleReadRequest. */
export class HelpArticleReadRequest {}

const helparticlereadrequestValidators: SanitizedValidatorMap = {
help_article_id: (v) => assertUuid(v, 'help_article_id'),
language_code: (v) => optional(assertString)(v, 'language_code'),

};

registerSanitizedValidators(HelpArticleReadRequest, helparticlereadrequestValidators);