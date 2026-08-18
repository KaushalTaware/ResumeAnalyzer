import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";


export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const {
        user,
        setUser,
        loading,
        setLoading
    } = context;


    // ─────────────────────────────────────
    // Login
    // ─────────────────────────────────────

    const handleLogin = async ({ email, password }) => {

        setLoading(true);

        try {

            const data = await login({
                email,
                password
            });

            setUser(data.user);

            return data;

        } catch (err) {

            console.error("Error logging in:", err);

            throw err;

        } finally {

            setLoading(false);

        }
    };


    // ─────────────────────────────────────
    // Register
    // ─────────────────────────────────────

    const handleRegister = async ({ name, email, password }) => {

        setLoading(true);

        try {

            const data = await register({
                name,
                email,
                password
            });

            setUser(data.user);

            return data;

        } catch (err) {

            console.error("Error registering user:", err);

            throw err;

        } finally {

            setLoading(false);

        }
    };


    // ─────────────────────────────────────
    // Logout
    // ─────────────────────────────────────

    const handleLogout = async () => {

        setLoading(true);

        try {

            await logout();

            // Clear user from React state
            setUser(null);

        } catch (err) {

            console.error("Error logging out:", err);

            throw err;

        } finally {

            setLoading(false);

        }
    };


    // ─────────────────────────────────────
    // Get Current User
    // ─────────────────────────────────────

    useEffect(() => {

        const getAndSetUser = async () => {

            try {

                const data = await getMe();

                setUser(data.user);

            } catch (err) {

                // 401 simply means the user is not logged in.
                // This is normal and should not be logged as an error.

                if (err.response?.status === 401) {

                    setUser(null);

                } else {

                    console.error(
                        "Error fetching user data:",
                        err
                    );

                    setUser(null);

                }

            } finally {

                setLoading(false);

            }
        };

        getAndSetUser();

    }, []);


    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout
    };
};