const usersDatabase = [];  // Temporary in-memory database (replace with actual DB in production)

exports.handler = async (event) => {
    try {
        const newUser = JSON.parse(event.body);
        const existingUserIndex = usersDatabase.findIndex((user) => user.id === newUser.id);

        if (existingUserIndex !== -1) {
            // Update existing user
            usersDatabase[existingUserIndex] = newUser;
            console.log('User updated:', newUser);
        } else {
            // Add new user
            usersDatabase.push(newUser);
            console.log('New user added:', newUser);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User added/updated successfully' }),
        };
    } catch (error) {
        console.error('Error adding/updating user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error adding/updating user' }),
        };
    }
};