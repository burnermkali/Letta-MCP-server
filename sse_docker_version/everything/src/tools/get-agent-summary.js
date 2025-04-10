import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool handler for getting a summary of an agent's configuration
 */
export async function handleGetAgentSummary(server, args) {
    if (!args?.agent_id) {
        return server.createErrorResponse("Missing required argument: agent_id");
    }

    const agentId = args.agent_id;
    const encodedAgentId = encodeURIComponent(agentId);
    const headers = server.getApiHeaders();

    try {
        console.log(`[get_agent_summary] Fetching summary for agent ${agentId}...`);

        // Fetch data from multiple endpoints concurrently
        const [agentStateRes, coreMemoryRes, toolsRes, sourcesRes] = await Promise.allSettled([
            server.api.get(`/agents/${encodedAgentId}`, { headers }),
            server.api.get(`/agents/${encodedAgentId}/core-memory/blocks`, { headers }),
            server.api.get(`/agents/${encodedAgentId}/tools`, { headers }),
            server.api.get(`/agents/${encodedAgentId}/sources`, { headers })
        ]);

        // Process Agent State
        if (agentStateRes.status === 'rejected' || agentStateRes.value.status !== 200) {
            const errorInfo = agentStateRes.reason?.response?.data || agentStateRes.reason?.message || agentStateRes.value?.data || 'Unknown error fetching agent state';
            console.error(`[get_agent_summary] Failed to fetch agent state for ${agentId}:`, errorInfo);
            // If agent doesn't exist, return a specific error
            if (agentStateRes.reason?.response?.status === 404 || agentStateRes.value?.status === 404) {
                 return server.createErrorResponse(`Agent not found: ${agentId}`);
            }
            return server.createErrorResponse(`Failed to fetch agent state: ${JSON.stringify(errorInfo)}`);
        }
        const agentState = agentStateRes.value.data;

        // Process Core Memory (optional, might fail if agent has none)
        let coreMemoryBlocks = [];
        if (coreMemoryRes.status === 'fulfilled' && coreMemoryRes.value.status === 200) {
            coreMemoryBlocks = coreMemoryRes.value.data.map(block => ({ label: block.label, value_snippet: block.value.substring(0, 100) + (block.value.length > 100 ? '...' : '') }));
        } else {
            console.warn(`[get_agent_summary] Could not fetch core memory for ${agentId}:`, coreMemoryRes.reason?.response?.data || coreMemoryRes.reason?.message || 'Non-200 status');
        }

        // Process Tools (optional)
        let attachedTools = [];
        if (toolsRes.status === 'fulfilled' && toolsRes.value.status === 200) {
            attachedTools = toolsRes.value.data.map(tool => ({ id: tool.id, name: tool.name, type: tool.tool_type }));
        } else {
            console.warn(`[get_agent_summary] Could not fetch tools for ${agentId}:`, toolsRes.reason?.response?.data || toolsRes.reason?.message || 'Non-200 status');
        }

        // Process Sources (optional)
        let attachedSources = [];
        if (sourcesRes.status === 'fulfilled' && sourcesRes.value.status === 200) {
            attachedSources = sourcesRes.value.data.map(source => ({ id: source.id, name: source.name }));
        } else {
            console.warn(`[get_agent_summary] Could not fetch sources for ${agentId}:`, sourcesRes.reason?.response?.data || sourcesRes.reason?.message || 'Non-200 status');
        }

        // Construct the summary
        const summary = {
            success: true,
            agent_id: agentState.id,
            name: agentState.name,
            description: agentState.description,
            system_prompt_snippet: agentState.system.substring(0, 200) + (agentState.system.length > 200 ? '...' : ''),
            llm_config: agentState.llm_config?.handle || `${agentState.llm_config?.model_endpoint_type}/${agentState.llm_config?.model}`,
            embedding_config: agentState.embedding_config?.handle || `${agentState.embedding_config?.embedding_endpoint_type}/${agentState.embedding_config?.embedding_model}`,
            core_memory_blocks: coreMemoryBlocks,
            attached_tools_count: attachedTools.length,
            attached_tools: attachedTools,
            attached_sources_count: attachedSources.length,
            attached_sources: attachedSources,
        };

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(summary, null, 2),
            }],
        };

    } catch (error) {
        // Catch any unexpected errors during processing
        console.error(`[get_agent_summary] Unexpected error for agent ${agentId}:`, error);
        return server.createErrorResponse(`Failed to get agent summary: ${error.message}`);
    }
}

/**
 * Tool definition for get_agent_summary
 */
export const getAgentSummaryDefinition = {
    name: 'get_agent_summary',
    description: "Provides a concise summary of an agent's configuration, including core memory snippets and attached tool/source names.",
    inputSchema: {
        type: 'object',
        properties: {
            agent_id: {
                type: 'string',
                description: 'The ID of the agent to summarize.',
            },
        },
        required: ['agent_id'],
    },
};