// from chat for now, will edit later

import React, { useState } from 'react';

function AddCollaborator() {
    const [username, setUsername] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to handle username input change
    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    // Function to search users by username
    const searchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/search-users?username=${username}`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    // Function to handle adding a collaborator
    const addCollaborator = async (userId) => {
        try {
            const response = await fetch('/api/add-collaborator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });
            const result = await response.json();
            alert(`Collaborator added: ${result.username}`);
        } catch (error) {
            console.error('Error adding collaborator:', error);
        }
    };

    return (
        <div>
            <h1>Add Collaborator</h1>
            <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter username"
            />
            <button onClick={searchUsers} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
            </button>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.username}
                        <button onClick={() => addCollaborator(user.id)}>Add</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AddCollaborator;
