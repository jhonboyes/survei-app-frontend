import React from 'react';
import { useState} from 'react';
import { loginAdmin } from '../api/admin.jsx';

const useLoginAdminHooks = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const login = async (username, password) => {
            setLoading(true);
            setError('');
            try {
                const response = await loginAdmin({username, password});
                const adminData = response.data.adminData[0];
                console.log(response)
                const {role} = adminData;
                localStorage.setItem('role', role);
                localStorage.setItem('username', username);
                return { success: true };
            } catch (error) {
                setError(error.response.data.message);
                return { success: false, message: error.response.data.message };
            }
        
        }

    return { error, loading, login }
}

export default useLoginAdminHooks;
