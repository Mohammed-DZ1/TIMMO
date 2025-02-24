const usersDatabase = [
    {
        id: "1",
        name: "Super Admin",
        email: "superadmin@example.com",
        role: "Super Admin",
        permissions: {
            sidebarLinks: {
                dashboard: true,
                properties: true,
                clients: true,
                agents: true,
                settings: true,
            },
            buttons: {
                addUser: true,
                deleteUser: true,
                addProperty: true,
                deleteProperty: true,
            },
            forms: {
                clientForm: true,
                agentForm: true,
                propertyForm: true,
                settingsForm: true,
            }
        }
    }
];

exports.handler = async () => {
    try {
        return {
            statusCode: 200,
            body: JSON.stringify(usersDatabase),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching users' }),
        };
    }
};