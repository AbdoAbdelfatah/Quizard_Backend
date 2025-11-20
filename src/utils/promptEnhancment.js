// Utility for building an enhanced prompt with educator/session context before sending to the agent
const safeValue = (value) => (value ?? '').toString();

export function buildEnhancedPrompt(userMessage, context = {}) {
  const message = safeValue(userMessage);
  const {
    selectedModules = [],
    groupId = '',
    groupName = '',
    educatorName = '',
    sessionId = '',
    conversationHistory = [],
    timestamp = new Date().toISOString()
  } = context || {};

  const hasContext =
    sessionId ||
    (Array.isArray(selectedModules) && selectedModules.length > 0) ||
    safeValue(groupId) ||
    safeValue(groupName) ||
    safeValue(educatorName) ||
    (Array.isArray(conversationHistory) && conversationHistory.length > 0);

  // If no contextual info is provided, keep the original message untouched
  if (!hasContext) {
    return message;
  }

  let enhancedPrompt = '';

  enhancedPrompt += `<prompt_context>
<session_info>
  <sessionId>${safeValue(sessionId)}</sessionId>
  <educator_name>${safeValue(educatorName)}</educator_name>
  <group_id>${safeValue(groupId)}</group_id>
  <group_name>${safeValue(groupName)}</group_name>
  <timestamp>${safeValue(timestamp)}</timestamp>
</session_info>

<selected_modules>
`;

  if (Array.isArray(selectedModules)) {
    selectedModules.forEach((module) => {
      const moduleId = safeValue(module?.id ?? module?.module_id);
      const moduleName = safeValue(module?.name ?? module?.module_name);
      enhancedPrompt += `  <module>
    <module_id>${moduleId}</module_id>
    <module_name>${moduleName}</module_name>
  </module>
`;
    });
  }

  enhancedPrompt += `</selected_modules>

<agent_instructions>
- Role: Quiz-generation assistant for educators (analyze materials, gather requirements, generate/validate quizzes, post announcements).
- Security: NEVER expose IDs (sessionId, module_id, material_id, group_id, quiz_id, question_id, announcement_id, user IDs).
- Authentication: sessionId is REQUIRED on every tool call; do not ask the educator for it. If missing, respond with the provided error messages.
- Workflow: Parse context → fetch materials per module → gather all quiz requirements → generate questions → validate → preview → wait for explicit approval → submit quiz → post announcement.
- Tools: Always pass sessionId; parse JSON; check success; handle failures with educator-friendly messages only.
- Scope: Stay within provided materials; do not invent content; balance coverage across selected modules.
</agent_instructions>
</prompt_context>

`;

  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    enhancedPrompt += `<conversation_history>
`;
    conversationHistory.forEach((msg) => {
      const role = safeValue(msg?.role || 'user');
      const content = safeValue(msg?.content ?? msg?.text);
      enhancedPrompt += `<message role="${role}">${content}</message>
`;
    });
    enhancedPrompt += `</conversation_history>

`;
  }

  enhancedPrompt += `<user_message>
${message}
</user_message>`;

  return enhancedPrompt;
}

export default {
  buildEnhancedPrompt
};
