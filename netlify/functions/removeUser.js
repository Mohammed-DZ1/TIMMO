const usersDatabase = [];  // Temporary in-memory database (replace with actual DB in production)

exports.handler = async (event) => {
    try {
        const { userId } = JSON.parse(event.body);
        const userIndex = usersDatabase.findIndex((user) => user.id === userId);

        if (userIndex !== -1) {
            usersDatabase.splice(userIndex, 1);
            console.log('User removed:', userId);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'User removed successfully' }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' }),
            };
        }
    } catch (error) {
        console.error('Error removing user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error removing user' }),
        };
    }
};