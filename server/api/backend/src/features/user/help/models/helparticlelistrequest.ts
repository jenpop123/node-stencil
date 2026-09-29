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



export interface IHelpArticleListRequest {
	keyword?: string;
   
}

/** Registry key for Sanitize.for(HelpArticleListRequest). Use @Body(Sanitize.for(HelpArticleListRequest)) input: IHelpArticleListRequest. */
export class HelpArticleListRequest {}

const helparticlelistrequestValidators: SanitizedValidatorMap = {
keyword: (v) => optional(assertString)(v, 'keyword'),

};

registerSanitizedValidators(HelpArticleListRequest, helparticlelistrequestValidators);