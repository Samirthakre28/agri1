import { useContext } from 'react';
import { AuthContext } from '../App';

/**
 * Custom hook to access AuthContext securely.
 * This pattern avoids repeating 'useContext(AuthContext)' throughout the app.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
