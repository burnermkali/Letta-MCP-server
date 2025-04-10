/**
 * Tool handler for retrieving the state of a specific agent
 */
export async function handleRetrieveAgent(server, args) {
    if (!args?.agent_id) {
        return server.createErrorResponse("Missing required argument: agent_id");
    }

    try {
        const headers = server.getApiHeaders();
        const agentId = encodeURIComponent(args.agent_id);

        // Use the specific endpoint from the OpenAPI spec
        const response = await server.api.get(`/agents/${agentId}`, { headers });
        const agentState = response.data; // Assuming response.data is the AgentState object

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    agent: agentState
                }, null, 2),
            }],
        };
    } catch (error) {
        // Handle potential 404 if agent not found, or other API errors
        if (error.response && error.response.status === 404) {
             return server.createErrorResponse(`Agent not found: ${args.agent_id}`);
        }
        return server.createErrorResponse(error);
    }
}

/**
 * Tool definition for retrieve_agent
 */
export const retrieveAgentDefinition = {
    name: 'retrieve_agent',
    description: 'Get the state of a specific agent by ID',
    inputSchema: {
        type: 'object',
        properties: {
            agent_id: {
                type: 'string',
                description: 'The ID of the agent to retrieve',
            },
        },
        required: ['agent_id'],
    },
};