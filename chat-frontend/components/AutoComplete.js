import React, {useCallback, useState} from 'react';
import AutoSuggest from 'react-autosuggest';
import _ from "lodash";
import {userAPI} from "@/utils/api";

export const AutoComplete = (props) => {
    const [touch, setTouch] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [value, setValue] = useState("");
    const [searchUsers, setSearchUsers] = useState([]);

    const getSuggestions = (value, cities) => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        if (inputValue && inputLength > 0) {
            return searchUsers;
        }
        return [];
    };

    const renderSuggestion = suggestion => (
        <div>
            {suggestion.name}
        </div>
    );

    const getSuggestionValue = suggestion => suggestion.name;


    const onSuggestionsFetchRequested = ({value}) => {
        setSuggestions(getSuggestions(value, searchUsers));
    };


    const debounce = (callbackFunction, timer) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => callbackFunction(...args), timer);
        };
    };
    const fetchNameResults = async inputVal => {
        userAPI.search(inputVal).then((users) => {
            setSearchUsers(users);
        })
    }
    const debouncedFetchNameResults = debounce(fetchNameResults, 500);

    const onChange = useCallback((event, {newValue, method}) => {
        setValue(newValue);
        debouncedFetchNameResults(newValue);
    }, []);

    const onBlur = () => {
        setTouch(true);
        if (value === '') {
            console.log("Error");
        }
    };

    const inputProps = {
        placeholder: 'Search for users',
        value,
        onChange,
        onBlur,
        id: props.id
    };

    const onSuggestionSelectedHandler = (event, data) => {
        event.preventDefault();
        props.autoCompleteCallback(data);
        setValue("");
        setSuggestions([]);
    }


    return (
        <div>
            <AutoSuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps}
                onSuggestionSelected={onSuggestionSelectedHandler}
                alwaysRenderSuggestions={true}
            />
        </div>
    );
};
