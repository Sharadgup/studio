// src/components/ui/UserTable.tsx
// Make sure this file is placed in the correct directory to resolve the import:
// '@/components/ui/UserTable' -> means -> src/components/ui/UserTable.tsx

'use client'; // Required for hooks and event handlers in App Router

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Added updateDoc, deleteDoc
import { db } from '@/config/firebase'; // Adjust path to your Firebase config file if needed
import { FaEdit, FaToggleOn, FaToggleOff, FaTrashAlt } from 'react-icons/fa'; // Added FaTrashAlt

// Define the structure of your user data from Firestore
interface UserData {
    id: string; // Firebase document ID (uid)
    profileID: string;
    name: string;
    email: string;
    role: 'admin' | 'employee';
    isActive: boolean; // Use boolean for easier Firestore updates
    skills?: string[];
    createdAt: Date | null; // Store as Date object after conversion
    // Add other fields if necessary, e.g., currentLoad, tasksAssigned
}

const UserTable = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Query the 'users' collection
        const q = query(collection(db, 'users'));

        // Set up the real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersData: UserData[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Construct the UserData object safely
                usersData.push({
                    id: doc.id,
                    profileID: data.profileID || `N/A-${doc.id.substring(0, 4)}`,
                    name: data.name || data.displayName || 'No Name Provided',
                    email: data.email || 'No Email Provided',
                    role: data.role === 'admin' ? 'admin' : 'employee', // Default to employee if role is missing/invalid
                    isActive: data.isActive !== false, // Default to active if isActive is missing or not explicitly false
                    skills: Array.isArray(data.skills) ? data.skills : [],
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null, // Convert Firestore Timestamp to JS Date
                });
            });
            setUsers(usersData.sort((a, b) => (a.createdAt && b.createdAt ? b.createdAt.getTime() - a.createdAt.getTime() : 0))); // Sort by newest first
            setLoading(false);
        }, (err) => {
            console.error("Error fetching users: ", err);
            setError("Failed to load users. Please check console for details.");
            setLoading(false);
        });

        // Cleanup listener when the component unmounts
        return () => unsubscribe();
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Action Handlers ---

    const handleEdit = (userId: string) => {
        console.log("Navigate to Edit page or open modal for user:", userId);
        // Example: router.push(`/admin/users/edit/${userId}`); // Needs Next.js router
        alert(`EDIT action for user ID: ${userId}\n(Implement navigation or modal)`);
    };

    const handleToggleStatus = async (userId: string, currentIsActive: boolean) => {
        console.log("Toggling status for user:", userId, "from isActive:", currentIsActive);
        const userRef = doc(db, 'users', userId); // Corrected: db should be the first argument
        try {
            await updateDoc(userRef, {
                isActive: !currentIsActive // Toggle the boolean value
            });
            console.log("User status updated successfully.");
            // No need to manually update state here, onSnapshot will trigger a re-render
        } catch (error) {
            console.error("Error updating user status:", error);
            alert("Failed to update user status. See console for details.");
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
         if (window.confirm(`Are you sure you want to delete user "${userName}" (ID: ${userId})? This action cannot be undone.`)) {
            console.log("Deleting user:", userId);
             try {
                 // NOTE: Deleting a user document here DOES NOT delete their Firebase Auth account.
                 // You need to use Firebase Admin SDK (in a backend function) for that.
                 // This only deletes the user's profile data from Firestore.
                 const userRef = doc(db, 'users', userId); // Corrected: db should be the first argument
                 await deleteDoc(userRef);
                 console.log("User document deleted successfully from Firestore.");
                 // Data will refresh via onSnapshot
             } catch (error) {
                 console.error("Error deleting user document:", error);
                 alert("Failed to delete user document. See console for details.");
             }
         }
    };


    // --- Render Logic ---

    if (loading) return <div className="text-center p-6">Loading users...</div>;
    if (error) return <div className="text-center p-6 text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 border border-red-400 rounded-md">{error}</div>;

    return (
        <div className="mt-6 overflow-x-auto relative shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profile ID</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Skills</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Joined</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.length === 0 && (
                         <tr>
                             <td colSpan={8} className="text-center py-6 text-gray-500 dark:text-gray-400">No users found.</td>
                        </tr>
                    )}
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ease-in-out">
                            {/* Profile ID */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.profileID}</td>
                            {/* Name */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{user.name}</td>
                            {/* Email */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                            {/* Role */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</td>
                            {/* Status */}
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.isActive
                                     ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                     : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            {/* Skills */}
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                {(user.skills && user.skills.length > 0)
                                    ? (<div className="flex flex-wrap gap-1">
                                        {user.skills.slice(0, 3).map(skill => (
                                          <span key={skill} className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                            {skill}
                                          </span>
                                        ))}
                                        {user.skills.length > 3 && (
                                           <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded">
                                             + {user.skills.length - 3} more
                                           </span>
                                        )}
                                      </div>)
                                    : <span className="text-gray-400 italic text-xs">No skills listed</span>}
                            </td>
                            {/* Date Joined */}
                             <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.createdAt ? user.createdAt.toLocaleDateString() : 'N/A'}
                             </td>
                             {/* Actions */}
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                <button
                                    onClick={() => handleEdit(user.id)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors duration-150 p-1 rounded hover:bg-indigo-100 dark:hover:bg-gray-700"
                                    title="Edit User Details"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                                    className={`${user.isActive ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200'} transition-colors duration-150 p-1 rounded hover:bg-yellow-100 dark:hover:bg-gray-700`}
                                    title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                >
                                    {user.isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16}/>}
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id, user.name)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-150 p-1 rounded hover:bg-red-100 dark:hover:bg-gray-700"
                                    title="Delete User (Document Only)"
                                >
                                    <FaTrashAlt size={14}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;