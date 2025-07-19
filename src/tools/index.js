// Agent-related imports
import { handleListAgents, listAgentsToolDefinition } from './agents/list-agents.js';
import { handlePromptAgent, promptAgentToolDefinition } from './agents/prompt-agent.js';
import { handleListAgentTools, listAgentToolsDefinition } from './agents/list-agent-tools.js';
import { handleCreateAgent, createAgentToolDefinition } from './agents/create-agent.js';
import { handleRetrieveAgent, retrieveAgentDefinition } from './agents/retrieve-agent.js';
import { handleModifyAgent, modifyAgentDefinition } from './agents/modify-agent.js';
import { handleDeleteAgent, deleteAgentDefinition } from './agents/delete-agent.js';
import { handleExportAgent, exportAgentDefinition } from './agents/export-agent.js';
import { handleImportAgent, importAgentDefinition } from './agents/import-agent.js';
import { handleCloneAgent, cloneAgentDefinition } from './agents/clone-agent.js';
import { handleGetAgentSummary, getAgentSummaryDefinition } from './agents/get-agent-summary.js';
import { handleBulkDeleteAgents, bulkDeleteAgentsDefinition } from './agents/bulk-delete-agents.js';

// Memory-related imports
import {
    handleListMemoryBlocks,
    listMemoryBlocksToolDefinition,
} from './memory/list-memory-blocks.js';
import {
    handleReadMemoryBlock,
    readMemoryBlockToolDefinition,
} from './memory/read-memory-block.js';
import {
    handleUpdateMemoryBlock,
    updateMemoryBlockToolDefinition,
} from './memory/update-memory-block.js';
import {
    handleAttachMemoryBlock,
    attachMemoryBlockToolDefinition,
} from './memory/attach-memory-block.js';
import {
    handleCreateMemoryBlock,
    createMemoryBlockToolDefinition,
} from './memory/create-memory-block.js';

// Passage-related imports
import { handleListPassages, listPassagesDefinition } from './passages/list-passages.js';
import { handleCreatePassage, createPassageDefinition } from './passages/create-passage.js';
import { handleModifyPassage, modifyPassageDefinition } from './passages/modify-passage.js';
import { handleDeletePassage, deletePassageDefinition } from './passages/delete-passage.js';

// Tool-related imports
import { handleAttachTool, attachToolToolDefinition } from './tools/attach-tool.js';
import {
    handleBulkAttachToolToAgents,
    bulkAttachToolDefinition,
} from './tools/bulk-attach-tool.js';
import { handleUploadTool, uploadToolToolDefinition } from './tools/upload-tool.js';

// MCP-related imports
import {
    handleListMcpToolsByServer,
    listMcpToolsByServerDefinition,
} from './mcp/list-mcp-tools-by-server.js';
import { handleListMcpServers, listMcpServersDefinition } from './mcp/list-mcp-servers.js';
import {
    handleAddMcpToolToLetta,
    addMcpToolToLettaDefinition,
} from './mcp/add-mcp-tool-to-letta.js';

// Model-related imports
import { handleListLlmModels, listLlmModelsDefinition } from './models/list-llm-models.js';
import {
    handleListEmbeddingModels,
    listEmbeddingModelsDefinition,
} from './models/list-embedding-models.js';
// Removed import for add-mcp-tool-to-letta.js
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Register all tool handlers with the server
 * @param {Object} server - The LettaServer instance (should likely be typed more specifically if possible)
 */
export function registerToolHandlers(server) {
    // Register tool definitions
    server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            // Original Tools
            listAgentsToolDefinition,
            promptAgentToolDefinition,
            listAgentToolsDefinition,
            createAgentToolDefinition,
            attachToolToolDefinition, // Enhanced version
            listMemoryBlocksToolDefinition,
            readMemoryBlockToolDefinition,
            updateMemoryBlockToolDefinition,
            attachMemoryBlockToolDefinition,
            createMemoryBlockToolDefinition,
            uploadToolToolDefinition,
            // Added Tools
            listMcpToolsByServerDefinition,
            listMcpServersDefinition,
            retrieveAgentDefinition,
            modifyAgentDefinition,
            deleteAgentDefinition,
            listLlmModelsDefinition,
            listEmbeddingModelsDefinition,
            listPassagesDefinition,
            createPassageDefinition,
            modifyPassageDefinition,
            deletePassageDefinition,
            exportAgentDefinition,
            importAgentDefinition,
            cloneAgentDefinition,
            bulkAttachToolDefinition,
            getAgentSummaryDefinition,
            bulkDeleteAgentsDefinition,
            addMcpToolToLettaDefinition,
        ],
    }));

    // Register tool call handler
    server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        switch (request.params.name) {
        // Original Tools
        case 'list_agents':
            return handleListAgents(server, request.params.arguments);
        case 'prompt_agent':
            return handlePromptAgent(server, request.params.arguments);
        case 'list_agent_tools':
            return handleListAgentTools(server, request.params.arguments);
        case 'create_agent':
            return handleCreateAgent(server, request.params.arguments);
        case 'attach_tool': // Enhanced version
            return handleAttachTool(server, request.params.arguments);
        case 'list_memory_blocks':
            return handleListMemoryBlocks(server, request.params.arguments);
        case 'read_memory_block':
            return handleReadMemoryBlock(server, request.params.arguments);
        case 'update_memory_block':
            return handleUpdateMemoryBlock(server, request.params.arguments);
        case 'attach_memory_block':
            return handleAttachMemoryBlock(server, request.params.arguments);
        case 'create_memory_block':
            return handleCreateMemoryBlock(server, request.params.arguments);
        case 'upload_tool':
            return handleUploadTool(server, request.params.arguments);
            // Added Tools
        case 'list_mcp_tools_by_server':
            return handleListMcpToolsByServer(server, request.params.arguments);
        case 'list_mcp_servers':
            return handleListMcpServers(server, request.params.arguments);
        case 'retrieve_agent':
            return handleRetrieveAgent(server, request.params.arguments);
        case 'modify_agent':
            return handleModifyAgent(server, request.params.arguments);
        case 'delete_agent':
            return handleDeleteAgent(server, request.params.arguments);
        case 'list_llm_models':
            return handleListLlmModels(server, request.params.arguments);
        case 'list_embedding_models':
            return handleListEmbeddingModels(server, request.params.arguments);
        case 'list_passages':
            return handleListPassages(server, request.params.arguments);
        case 'create_passage':
            return handleCreatePassage(server, request.params.arguments);
        case 'modify_passage':
            return handleModifyPassage(server, request.params.arguments);
        case 'delete_passage':
            return handleDeletePassage(server, request.params.arguments);
        case 'export_agent':
            return handleExportAgent(server, request.params.arguments);
        case 'import_agent':
            return handleImportAgent(server, request.params.arguments);
        case 'clone_agent':
            return handleCloneAgent(server, request.params.arguments);
        case 'bulk_attach_tool_to_agents':
            return handleBulkAttachToolToAgents(server, request.params.arguments);
        case 'get_agent_summary':
            return handleGetAgentSummary(server, request.params.arguments);
        case 'bulk_delete_agents':
            return handleBulkDeleteAgents(server, request.params.arguments);
        case 'add_mcp_tool_to_letta':
            return handleAddMcpToolToLetta(server, request.params.arguments);
        default:
            throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${request.params.name}`,
            );
        }
    });
}

// Export all tool definitions
export const toolDefinitions = [
    listAgentsToolDefinition,
    promptAgentToolDefinition,
    listAgentToolsDefinition,
    createAgentToolDefinition,
    attachToolToolDefinition, // Enhanced version
    listMemoryBlocksToolDefinition,
    readMemoryBlockToolDefinition,
    updateMemoryBlockToolDefinition,
    attachMemoryBlockToolDefinition,
    createMemoryBlockToolDefinition,
    uploadToolToolDefinition,
    listMcpToolsByServerDefinition,
    listMcpServersDefinition,
    retrieveAgentDefinition,
    modifyAgentDefinition,
    deleteAgentDefinition,
    listLlmModelsDefinition,
    listEmbeddingModelsDefinition,
    listPassagesDefinition,
    createPassageDefinition,
    modifyPassageDefinition,
    deletePassageDefinition,
    exportAgentDefinition,
    importAgentDefinition,
    cloneAgentDefinition,
    bulkAttachToolDefinition,
    getAgentSummaryDefinition,
    bulkDeleteAgentsDefinition,
    addMcpToolToLettaDefinition,
];

// Export all tool handlers
export const toolHandlers = {
    handleListAgents,
    handlePromptAgent,
    handleListAgentTools,
    handleCreateAgent,
    handleAttachTool, // Enhanced version
    handleListMemoryBlocks,
    handleReadMemoryBlock,
    handleUpdateMemoryBlock,
    handleAttachMemoryBlock,
    handleCreateMemoryBlock,
    handleUploadTool,
    handleListMcpToolsByServer,
    handleListMcpServers,
    handleRetrieveAgent,
    handleModifyAgent,
    handleDeleteAgent,
    handleListLlmModels,
    handleListEmbeddingModels,
    handleListPassages,
    handleCreatePassage,
    handleModifyPassage,
    handleDeletePassage,
    handleExportAgent,
    handleImportAgent,
    handleCloneAgent,
    handleBulkAttachToolToAgents,
    handleGetAgentSummary,
    handleBulkDeleteAgents,
    handleAddMcpToolToLetta,
};
