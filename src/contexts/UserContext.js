
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [userDetails, setUserDetails] = useState({ name: '', birthdate: '', birthtime: '', birthplace: '' });
    const [results, setResults] = useState({});  // You can store results of calculations here

    // Example function to update results based on new data
    const updateResults = newResults => {
        setResults(prevResults => ({ ...prevResults, ...newResults }));
    };

    return (
        <UserContext.Provider value={{ userDetails, setUserDetails, results, updateResults }}>
            {children}
        </UserContext.Provider>
    );
};
