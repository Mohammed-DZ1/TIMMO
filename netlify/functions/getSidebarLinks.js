const linksDatabase = {
    "Super Admin": [
        { path: "/", label: "Dashboard", icon: "FaHome" },
        { path: "/properties", label: "Properties", icon: "FaBuilding" },
        { path: "/clients", label: "Clients", icon: "FaUsers" },
        { path: "/agents", label: "Agents", icon: "FaUserTie" },
        { path: "/settings", label: "Settings", icon: "FaCogs" }
    ],
    "Admin": [
        { path: "/", label: "Dashboard", icon: "FaHome" },
        { path: "/properties", label: "Properties", icon: "FaBuilding" },
        { path: "/clients", label: "Clients", icon: "FaUsers" },
        { path: "/agents", label: "Agents", icon: "FaUserTie" }
    ],
    "Agent": [
        { path: "/", label: "Dashboard", icon: "FaHome" },
        { path: "/properties", label: "Properties", icon: "FaBuilding" }
    ]
};

exports.handler = async (event) => {
    console.log('DEBUG: Incoming Request:', event);

    try {
        let role, action, updatedLinks;

        // Handle GET requests (fetch sidebar links)
        if (event.httpMethod === "GET") {
            role = event.queryStringParameters?.role;
        } 
        
        // Handle POST requests (update sidebar links)
        else if (event.httpMethod === "POST" && event.body) {
            try {
                const parsedBody = JSON.parse(event.body);
                role = parsedBody.role;
                action = parsedBody.action;
                updatedLinks = parsedBody.updatedLinks;
            } catch (jsonError) {
                console.error('DEBUG: JSON Parsing Error:', jsonError);
                return {
                    statusCode: 400,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                    body: JSON.stringify({ message: 'Invalid JSON input.', error: jsonError.message })
                };
            }
        }

        // Validate role input
        if (!role || !linksDatabase[role]) {
            console.warn('DEBUG: Invalid or missing role.');
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Invalid or missing role parameter.' })
            };
        }

        // Handle updating sidebar links if action is "update"
        if (event.httpMethod === "POST" && action === 'update') {
            if (!updatedLinks || !Array.isArray(updatedLinks)) {
                return {
                    statusCode: 400,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                    body: JSON.stringify({ message: 'Invalid or missing updated links.' })
                };
            }

            console.log('DEBUG: Updating links for role:', role);
            linksDatabase[role] = updatedLinks;

            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Links updated successfully.' })
            };
        }

        // Default: Return sidebar links for the requested role
        console.log('DEBUG: Fetching links for role:', role);
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ links: linksDatabase[role] || [] }) // Ensure response is always an array
        };

    } catch (error) {
        console.error('DEBUG: Unexpected Error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                message: 'Failed to handle sidebar links.',
                error: error.message
            })
        };
    }
};
