import { useEffect, useState } from 'react';
import { SingleValue } from 'react-select';
import { cloneDeep, isEqual } from 'lodash';
import classNames from 'classnames';
import Select from '@/components/ui/Select';
import { useAppDispatch } from '@/store/rootStore';
import { IHelpArticleOption } from '@/stencil/models/entities/helparticle';
import { ListInputHelpArticle } from '@/stencil/models/entities/requests/list-input-helparticle';
import { helparticleEndpoints, useGetHelpArticlesQuery } from '@/stencil/endpoints/entities/helpArticleApi';
import { RoutedInput } from '@/stencil/models/routed-input';

type HelpArticlePickerProps = {
   jurisdiction_id: string;
   className?: string;
   id?: string;
   value?: string;
   value_display?: string;
   readOnly?: boolean;
   loadOnDisplay?: boolean;
   placeholder?: string;
   required?: boolean;
   onChange?: (value: string) => void;
   onSelected?: (value: IHelpArticleOption) => void;

};
const defaultQueryInput: ListInputHelpArticle = {
   skip: 0,
   take: 50,
   order_by: 'help_article_name',
   keyword: '',
};

function HelpArticlePicker(props: HelpArticlePickerProps) {
   const dispatch = useAppDispatch();
   const { className, id, loadOnDisplay = false, onChange, placeholder = 'Please Select', readOnly = false, required = false, jurisdiction_id } = props;
   const [value, setValue] = useState<IHelpArticleOption | undefined>();
   const [requiresFocus, setRequiresFocus] = useState<boolean>(() => !loadOnDisplay);
   const [inputValue, setInputValue] = useState<string>('');
   const [lookedUpValue, setLookedUpValue] = useState<string>();
   const [allowLocalSearch, setAllowLocalSearch] = useState<boolean>(false);
   const [queryInput, setQueryInput] = useState<RoutedInput<ListInputHelpArticle>>({
      jurisdiction_id: jurisdiction_id,
      input: {
         ...defaultQueryInput,
         keyword: inputValue,
      }
   });

   let helparticles = useGetHelpArticlesQuery(queryInput, { refetchOnMountOrArgChange: true, skip: readOnly || requiresFocus });

   useEffect(() => {
      if (props.value == value?._id) {
         //value is the same, no need to update
         return;
      }
      if (props.value !== undefined) {
         if (typeof props.value === 'string') {
            if (props.value.length > 0){
               setValue({ _id: props.value, help_article_name: props.value_display ?? props.value });
               if (props.value) {
                  if (!lookedUpValue || props.value_display !== lookedUpValue) {
                     setLookedUpValue(props.value);
                     fetchHelpArticle(props.value);
                  }
               }
            }
         } else {
            setValue(props.value);
         }
      }
   }, [props.value]);

   useEffect(() => {
      const stepping = helparticles?.data?.stepping;
      if (stepping && !stepping.more) {
         if (isEqual(defaultQueryInput, queryInput)) {
            setAllowLocalSearch(true);
         }
      }
   }, [helparticles?.isLoading, helparticles?.data?.stepping]);

   const fetchHelpArticle = (_id: string) => {
      const promise = dispatch(
         helparticleEndpoints.getHelpArticle.initiate({
            jurisdiction_id : jurisdiction_id,
            input:  _id  
         }));

      promise.then(
         item => {
            if (item?.data?.item) {
               if (item.data.item._id == value?._id || item.data.item._id == props.value) {
                  setValue(item.data.item);
               }
            }
            promise.unsubscribe();
         },
         error => {
            promise.unsubscribe();
         }
      );
   };

   const onFocus = () => {
      if (requiresFocus) {
         setRequiresFocus(false);
      }
   };

   const handleInputChange = (newValue: string) => {
      setInputValue(newValue);
      if (!allowLocalSearch) {
         const newQuery = cloneDeep(queryInput);
         newQuery.input.keyword = newValue;
         setQueryInput(newQuery);
      }
      return newValue;
   };

   const handleChange = (selected: SingleValue<IHelpArticleOption>) => {
      setValue(selected ?? undefined);
      if (onChange) {
         onChange(selected ? selected._id : '');
         setInputValue('');
      }
   };

   return (
      <Select
         value={value}
         onFocus={onFocus}
         onChange={handleChange}
         onInputChange={handleInputChange}
         isLoading={helparticles.isLoading}
         isMulti={false}
         isClearable={true}
         id={id}
         required={required}
         getOptionLabel={option => option.help_article_name}
         getOptionValue={option => option._id}
         isDisabled={readOnly}
         placeholder={placeholder}
         noOptionsMessage={({ inputValue }) => (inputValue ? `No items matching: ${inputValue}` : 'No items found')}
         options={helparticles?.data?.items ? helparticles.data.items : []}
         className={classNames(className)}
      />
   );
}

export default HelpArticlePicker;