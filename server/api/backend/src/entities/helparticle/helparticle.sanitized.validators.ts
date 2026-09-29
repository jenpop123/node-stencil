import { registerSanitizedValidators } from 'src/shared/utils/sanitized.registry';
import type { SanitizedValidatorMap } from 'src/shared/types/sanitized.types';
import { HelpArticle } from './helparticle.model';
import {
   assertString,
   assertStringArray,
   assertBoolean,
   assertNumber,
   assertUuid,
   assertDate,
   assertEnum,
   assertEnumArray,
   assertPlainObject,
   assertNested,
   assertNestedArray,
   optional,
} from 'src/shared/utils/sanitized.validators';

import { LocalizedText } from '../localizedtext/localizedtext.model';
import '../localizedtext/localizedtext.sanitized.validators';
import { ContentSection } from '../contentsection/contentsection.model';
import '../contentsection/contentsection.sanitized.validators';
import { LocalizedContent } from '../localizedcontent/localizedcontent.model';
import '../localizedcontent/localizedcontent.sanitized.validators';


const helparticleValidators: SanitizedValidatorMap = {
_id: (v) => optional(assertUuid)(v, '_id'),
help_article_id: (v) => assertUuid(v, 'help_article_id'),
jurisdiction_id: (v) => assertString(v, 'jurisdiction_id'),
help_article_name: (v) => assertString(v, 'help_article_name'),
help_article_name_localized: (v) => optional(assertNestedArray(LocalizedText))(v, 'help_article_name_localized'),
help_article_slug: (v) => assertString(v, 'help_article_slug'),
sequence: (v) => assertNumber(v, 'sequence'),
published: (v) => assertBoolean(v, 'published'),
body: (v) => optional(assertNestedArray(ContentSection))(v, 'body'),
body_localized: (v) => optional(assertNestedArray(LocalizedContent))(v, 'body_localized'),

};

registerSanitizedValidators(HelpArticle, helparticleValidators);


const helparticledirectoryValidators: SanitizedValidatorMap = {
_id: (v) => optional(assertUuid)(v, '_id'),
help_article_id: (v) => assertUuid(v, 'help_article_id'),
help_article_name: (v) => assertString(v, 'help_article_name'),
help_article_slug: (v) => assertString(v, 'help_article_slug'),
sequence: (v) => assertNumber(v, 'sequence'),

};

registerSanitizedValidators(HelpArticle.Directory, helparticledirectoryValidators);


const helparticlepublicValidators: SanitizedValidatorMap = {
_id: (v) => optional(assertUuid)(v, '_id'),
jurisdiction_id: (v) => assertString(v, 'jurisdiction_id'),
help_article_id: (v) => assertUuid(v, 'help_article_id'),
help_article_name: (v) => assertString(v, 'help_article_name'),
help_article_slug: (v) => assertString(v, 'help_article_slug'),
sequence: (v) => assertNumber(v, 'sequence'),
body: (v) => optional(assertNestedArray(ContentSection))(v, 'body'),

};

registerSanitizedValidators(HelpArticle.Public, helparticlepublicValidators);