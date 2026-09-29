import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import _ from 'lodash';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import HelpArticle, { IHelpArticle } from '@/stencil/models/entities/helparticle';
import { useDeleteHelpArticleMutation, useCreateHelpArticleMutation, useReplaceHelpArticleMutation, useGetHelpArticleQuery } from '@/stencil/endpoints/entities/helpArticleApi';
import { closeModal, openModal } from '@/components/ui/Dialog/modalSlice';
import { useAppDispatch } from '@/store/rootStore';
import { Button, Checkbox, DatePicker, Dialog, Form, FormItem, Input } from '@/components/ui';
import NullableCheckbox from '@/views/super/common/NullableCheckbox';

import JurisdictionPicker from '@/views/super/pickers/JurisdictionPicker';
import LocalizedText from '@/stencil/models/entities/localizedtext';
import LocalizedTextEditor, { localizedTextSchema } from '../localizedtext/LocalizedTextEditor';
import LocalizedTextListEditor from '../localizedtext/LocalizedTextListEditor';

import ContentSection from '@/stencil/models/entities/contentsection';
import ContentSectionEditor, { contentSectionSchema } from '../contentsection/ContentSectionEditor';
import ContentSectionListEditor from '../contentsection/ContentSectionListEditor';

import LocalizedContent from '@/stencil/models/entities/localizedcontent';
import LocalizedContentEditor, { localizedContentSchema } from '../localizedcontent/LocalizedContentEditor';
import LocalizedContentListEditor from '../localizedcontent/LocalizedContentListEditor';

import classNames from '@/utils/classNames';
import moment from 'moment';
import StencilUtils from '@/utils/stencilUtils';
import { TbEdit, TbPlus } from 'react-icons/tb';

import Alert from '@/components/shared/Alert';
import NestedEditor from '../NestedEditor';
import { PiX } from 'react-icons/pi';


type FormType = {
   _id?: IHelpArticle["_id"];
   help_article_id: IHelpArticle["help_article_id"];
   jurisdiction_id: IHelpArticle["jurisdiction_id"];
   help_article_name: IHelpArticle["help_article_name"];
   help_article_name_localized?: IHelpArticle["help_article_name_localized"];
   help_article_slug: IHelpArticle["help_article_slug"];
   sequence: IHelpArticle["sequence"];
   published: IHelpArticle["published"];
   body?: IHelpArticle["body"];
   body_localized?: IHelpArticle["body_localized"];
   
};

const schema = z.object({
   _id: z.string().optional(),
   help_article_id: z.string(),
   jurisdiction_id: z.string().max(10, 'Cannot be more than 10 characters.'),
   help_article_name: z.string().max(200, 'Cannot be more than 200 characters.'),
   help_article_name_localized: z.array(localizedTextSchema).optional(),
   help_article_slug: z.string().max(80, 'Cannot be more than 80 characters.'),
   sequence: z.number(),
   published: z.boolean(),
   body: z.array(contentSectionSchema).optional(),
   body_localized: z.array(localizedContentSchema).optional()
});

type HelpArticleEditorProps = {
	className?: string;
   is_create: boolean;
   onDelete?: (helparticle: IHelpArticle) => void;
   onCreate?: (helparticle: IHelpArticle) => void;
   jurisdiction_id: string;
   
   _id?: string;
};


function HelpArticleEditor(props: HelpArticleEditorProps) {
	const dispatch = useAppDispatch();
	const { className, _id, is_create, jurisdiction_id, onCreate, onDelete } = props;
	const [openDialog, setOpenDialog] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [targetHelpArticleId, setTargetHelpArticleId] = useState<string>();
	const [original, setOriginal] = useState<IHelpArticle>();

   const defaultValues: FormType = {
		jurisdiction_id: jurisdiction_id,
		help_article_id: '',
		help_article_name: '',
		help_article_name_localized: undefined,
		help_article_slug: '',
		sequence: 0,
		published: false,
		body: undefined,
		body_localized: undefined,
		
	};
	const formMethods = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema) as any
	});
   const { handleSubmit, formState, control, reset, setValue, trigger } = formMethods;
	const [createHelpArticle] = useCreateHelpArticleMutation();
	const [replaceHelpArticle] = useReplaceHelpArticleMutation();
	const [deleteHelpArticle] = useDeleteHelpArticleMutation();

	const { isValid, dirtyFields, errors } = formState;

	const { t } = useTranslation();
   
   const helparticleQueryInput = {
      jurisdiction_id: jurisdiction_id!,
		input: _id!
	};
   
   
	let helparticle = useGetHelpArticleQuery(helparticleQueryInput, { refetchOnMountOrArgChange: true, skip: !openDialog || !_id });

   useEffect(() => {
      if (!_id) {
         if (!targetHelpArticleId){
            setTargetHelpArticleId(uuidv4());
         }
      } else {
         setTargetHelpArticleId(_id);
      }
   }, [_id]);

   useEffect(() => {
      if (openDialog && helparticle?.data?.item) {
         reset(helparticle.data.item);
         setOriginal(helparticle.data.item);
      }
   }, [openDialog, helparticle]);

	function handleOpenDialog() {
		setOpenDialog(true);
	}

	function handleCloseDialog() {
		setOpenDialog(false);
	}

	function handleDiscard() {
		clearForm();
		setOpenDialog(false);
	}

   function clearForm(){
      reset(defaultValues);
      if (!_id){
         setTargetHelpArticleId(uuidv4());
      }
   }
	const confirmDelete = () => {
		dispatch(
			openModal({
				children: (
					<Alert
                  type='danger'
						onCancel={async () => {
							dispatch(closeModal());
						}}
						onConfirm={async () => {
							dispatch(closeModal());
							performDelete()
						}}
						children="Are you sure you want to delete this HelpArticle?"
						confirmText='Yes, Delete'
						/>
				)
			})
		);
	};

	function performDelete() {
      const deleteInstance = helparticle.data?.item;
      if (!deleteInstance){
         return;
      }
		setSubmitting(true);
		deleteHelpArticle({ jurisdiction_id: jurisdiction_id!, input: deleteInstance._id!})
			.unwrap()
			.then((resp) => {
				setSubmitting(false);
				if (!resp.success) {
					showError(resp.message || 'Error deleting data.');
				} else {
					handleCloseDialog();
               clearForm();
               if (onDelete) {
                  onDelete(deleteInstance);
               }
				}
			})
			.catch((ex) => {
				setSubmitting(false);
				const message = StencilUtils.getApiErrorMessage(ex, "Error deleting data.");
				showError(message);
			});
	}

   

	function onSubmit(data: FormType) {
      
      

      const apiData = { ...data };
    	const updatedHelpArticle = HelpArticle(apiData);
		setSubmitting(true);

      let promise = is_create ? createHelpArticle(updatedHelpArticle) : replaceHelpArticle(updatedHelpArticle);
		promise
			.unwrap()
			.then((resp) => {
				setSubmitting(false);
				if (!resp.success) {
					showError(resp.message || 'Error saving data.');
				} else {
					setOpenDialog(false);
               clearForm();
               if (is_create && onCreate && resp.item) {
                  onCreate(resp.item);
               }
				}
			})
			.catch((ex) => {
				setSubmitting(false);
				const message = StencilUtils.getApiErrorMessage(ex, "Error saving data.");
				showError(message);
			});
	}

	function showError(message: string) {
		dispatch(
			openModal({
				children: (
					<Alert
                  type='danger'
						onCancel={async () => {
							dispatch(closeModal());
						}}
                  onConfirm={async () => {
                     dispatch(closeModal());
                  }}
						children={message}
						confirmText='Okay'
                  confirmOnly={true}
					/>
				)
			})
		);
	}

	return (
		<div className={classNames('', className)}>
         {
            is_create ? 
            <Button 
               variant="solid"
               type="button"
               color="primary"
               icon={<TbPlus className="text-xl" /> } onClick={handleOpenDialog} >
               Create
            </Button>
            :
            <Button 
               variant="default"
               type="button"
               size="xs"
               icon={<TbEdit /> } onClick={handleOpenDialog} >
               Edit
            </Button>
         }
			<Dialog
				isOpen={openDialog}
				onClose={handleCloseDialog}
            width={800}
			>
            <Dialog.Header>
               <h4 className="mb-4">
                  {is_create ? 'Create' : 'Edit'} Help Article
               </h4>
				</Dialog.Header>
            <FormProvider {...formMethods}>
               <Form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col"
               >
                  <Dialog.Body scrollable={true}>
                     <div className='p-2 sm:p-0' >
                        
                        
                        <FormItem
                           label="Help Article Id"
                           invalid={Boolean(errors.help_article_id)}
                           errorMessage={errors.help_article_id?.message}
                        >
                           
                           <Controller
                              name="help_article_id"
                              control={control}
                              render={({ field }) => (
                                 <Input
                                    {...field}
                                    className="mb-2"
                                    id="help_article_id"
                                    required
                                 />
                              )}
                           />
                           
                        </FormItem>
                        
                     
                        <FormItem
                           label="Help Article Name"
                           invalid={Boolean(errors.help_article_name)}
                           errorMessage={errors.help_article_name?.message}
                        >
                           
                           <Controller
                              name="help_article_name"
                              control={control}
                              render={({ field }) => (
                                 <Input
                                    {...field}
                                    className="mb-2"
                                    id="help_article_name"
                                    required
                                 />
                              )}
                           />
                           
                        </FormItem>
                        
                     
                        <FormItem
                           label="Help Article Name Localized"
                           invalid={Boolean(errors.help_article_name_localized)}
                           errorMessage={errors.help_article_name_localized?.message}
                        >
                           
                              <LocalizedTextListEditor
                                 name="help_article_name_localized"
                                 className="mb-4"
                              />
                           
                        </FormItem>
                        
                     
                        <FormItem
                           label="Help Article Slug"
                           invalid={Boolean(errors.help_article_slug)}
                           errorMessage={errors.help_article_slug?.message}
                        >
                           
                           <Controller
                              name="help_article_slug"
                              control={control}
                              render={({ field }) => (
                                 <Input
                                    {...field}
                                    className="mb-2"
                                    id="help_article_slug"
                                    required
                                 />
                              )}
                           />
                           
                        </FormItem>
                        
                     
                        <FormItem
                           label="Sequence"
                           invalid={Boolean(errors.sequence)}
                           errorMessage={errors.sequence?.message}
                        >
                           
                           <Controller
                              name="sequence"
                              control={control}
                              render={({ field }) => (
                                 <Input
                                    {...field}
                                    className="mb-2"
                                    onChange={e => field.onChange(Number(e.target.value))}
                                    type="number"
                                    id="sequence"
                                    required
                                 />
                              
                              )}
                           />
                           
                        </FormItem>
                        
                     
                        <FormItem
                           label="Published"
                           invalid={Boolean(errors.published)}
                           errorMessage={errors.published?.message}
                        >
                           
                           <Controller
                              name="published"
                              control={control}
                              render={({ field }) => (
                                 <Checkbox 
                                    {...field}
                                    
                                    checked={field.value}
                                 />
                              )}
                           />
                           
                        </FormItem>
                        
                     
                        <FormItem
                           label="Body"
                           invalid={Boolean(errors.body)}
                           errorMessage={errors.body?.message}
                        >
                           
                              <ContentSectionListEditor
                                 name="body"
                                 className="mb-4"
                              />
                           
                        </FormItem>
                        
                     
                        <FormItem
                           label="Body Localized"
                           invalid={Boolean(errors.body_localized)}
                           errorMessage={errors.body_localized?.message}
                        >
                           
                              <LocalizedContentListEditor
                                 name="body_localized"
                                 className="mb-4"
                              />
                           
                        </FormItem>
                        
                     
                     </div>
                  </Dialog.Body>
               
                  <Dialog.Footer>
                     <div className="flex flex-row justify-end space-x-2">
                        <div className="">
                           <Button
                              variant="default"
                              color="default"
                              type="button"
                              onClick={handleDiscard}
                           >
                              Cancel
                           </Button>
                           {
                              !is_create &&original && original._id &&
                              <Button
                                 variant="plain"
                                 color="error"
                                 className="ml-8"
                                 type="button"
                                 onClick={confirmDelete}
                                 disabled={submitting}
                              >
                                 Delete
                              </Button>
                           }
                        </div>

                        <div className="flex-1">
                        </div>

                        <div className="flex flex-row items-center space-x-8">
                           <Button
                              variant="solid"
                              color="primary"
                              type="submit"
                              disabled={helparticle.isLoading || !isValid || submitting}
                           >
                              {is_create ? 'Create' : 'Update'}
                           </Button>
                        </div>
                     </div>

                  </Dialog.Footer>
               </Form>
            </FormProvider>
			</Dialog>
		</div>
	);
}

export default HelpArticleEditor;