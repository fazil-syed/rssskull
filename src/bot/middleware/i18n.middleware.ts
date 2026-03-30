import type { Context, NextFunction } from 'grammy';
import { logger } from '../../utils/logger/logger.service.js';

export interface I18nContext extends Context {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: 'en' | 'pt';
}

// Translation messages
const messages = {
  en: {
    // Welcome messages
    'welcome.title': '🤖 Hello! I am RSS Skull Bot.',
    'welcome.help': 'Use /help to see all available commands.',

    // Help messages
    'help.title': '📚 *Available Commands:*',
    'help.feeds': '🔗 *Feed Management:*',
    // 'help.settings': '⚙️ *Settings:*', // Disabled - settings don't affect system
    'help.other': 'ℹ️ *Other:*',
    'help.developer': '👨‍💻 *Developer:* Pablo Murad - https://github.com/runawaydevil',
    'help.reddit_cache': '⚠️ *Note:* Reddit subreddit URLs are normalized to the public `/.rss` feed.',

    // Commands
    'cmd.add': '/add <name> <url> - Add RSS feed',
    'cmd.list': '/list - List all feeds',
    'cmd.remove': '/remove <name> - Remove feed',
    'cmd.enable': '/enable <name> - Enable feed',
    'cmd.disable': '/disable <name> - Disable feed',
    'cmd.discover': '/discover <url> - Discover feeds from website',
    'cmd.status': '/status - Show feed and job status',
    // 'cmd.settings': '/settings - View chat settings', // Disabled - settings don't affect system
    'cmd.filters': '/filters <name> - Manage feed filters',
    'cmd.template': '/template - Preview templates and variables',
    'cmd.ping': '/ping - Verify bot connectivity',
    'cmd.process': '/process - Manually process all feeds',
    'cmd.help': '/help - Show this message',

    // Error messages
    'error.unknown_command': '❌ Unknown command. Use /help to see available commands.',
    'error.invalid_format': '❌ Invalid command format. Please check the syntax.',
    'error.internal': '❌ An internal error occurred. Please try again later.',
    'error.permission_denied': "❌ You don't have permission to use this command.",
    'error.channel_permissions':
      '❌ I need administrator permissions to work properly in this channel.',
    'error.channel_operation':
      '❌ An error occurred while processing your request in this channel.',

    // Help messages for channels
    'help.mention_help': '💡 Mention me with a command to interact in this channel.',
    'help.example_usage': 'Example usage',

    // Status messages
    'status.under_development': '⚠️ Feature under development. Will be implemented soon!',
    'status.processing': '⏳ Processing your request...',
    'status.success': '✅ Operation completed successfully.',

    // Feed messages
    'feed.added': '✅ Feed "{{name}}" added successfully!',
    'feed.removed': '✅ Feed "{{name}}" removed successfully!',
    'feed.enabled': '✅ Feed "{{name}}" enabled successfully!',
    'feed.disabled': '✅ Feed "{{name}}" disabled successfully!',
    'feed.not_found': '❌ Feed "{{name}}" not found.',
    'feed.already_exists': '❌ Feed "{{name}}" already exists.',
    'feed.already_enabled': '⚠️ Feed "{{name}}" is already enabled.',
    'feed.already_disabled': '⚠️ Feed "{{name}}" is already disabled.',
    'feed.list_empty': 'ℹ️ No feeds configured for this chat.',
    'feed.list_title': '📋 *Configured Feeds ({{count}}):*',
    'feed.list_item': '{{status}} {{name}} - {{url}}',
    'feed.validation_error': '❌ {{field}}: {{message}}',
    'feed.invalid_url': '❌ Invalid URL format.',
    'feed.invalid_name': '❌ Feed name must be between 1 and 50 characters.',

    // Settings messages
    'settings.title': '⚙️ *Chat Settings*',
    'settings.language': '🌐 Language: {{language}}',
    'settings.check_interval': '⏰ Check Interval: {{interval}} seconds ({{description}})',
    'settings.max_feeds': '📊 Max Feeds: {{count}}',
    'settings.filters_enabled': '🔍 Filters: {{status}}',
    'settings.message_template': '📝 Message Template: {{template}}',
    'settings.timezone': '🌍 Timezone: {{timezone}}',
    'settings.updated': '✅ Settings updated successfully!',
    'settings.reset': '✅ Settings reset to defaults!',
    'settings.language_updated': '✅ Language changed to {{language}}!',
    'settings.interval_updated': '✅ Check interval updated to {{interval}} seconds!',
    'settings.template_updated': '✅ Message template updated!',
    'settings.template_cleared': '✅ Message template cleared!',
    'settings.validation_error': '❌ {{field}}: {{message}}',
    'settings.help': 'Use: /settings [language|interval|template|reset] [value]',
    'settings.available_languages': '🌐 Available languages: English (en), Português (pt)',
    'settings.available_intervals':
      '⏰ Available intervals: 90s (1.5min), 120s (2min), 180s (3min), 300s (5min), 600s (10min), 900s (15min)',
    'settings.enabled': 'Enabled',
    'settings.disabled': 'Disabled',
    'settings.no_template': 'Default template',

    // Template messages
    'template.help':
      'Template commands:\n• /template preview <text> - Preview a template\n• /template examples - Show template examples\n• /template variables - Show available variables',
    'template.examples_title': '📝 *Template Examples:*',
    'template.variables_title': '🔧 *Available Variables:*',
    'template.variable_item': '• `{{{{name}}}}` - {{description}}',
    'template.example_item': '**{{name}}:** {{description}}\n```\n{{template}}\n```',
    'template.preview_title': '👀 *Template Preview:*',
    'template.preview_result': '```\n{{result}}\n```',

    // Statistics messages
    'stats.title': '📊 *Usage Statistics ({{period}} days)*',
    'stats.no_data': 'ℹ️ No statistics available for this chat yet.',
    'stats.summary':
      '📈 **Summary:**\n• Messages Sent: {{messages}}\n• Feeds Checked: {{checks}}\n• User Actions: {{actions}}',
    'stats.daily_title': '📅 **Daily Activity:**',
    'stats.daily_item': '• {{date}}: {{messages}} messages, {{checks}} checks',
    'stats.top_feeds_title': '🏆 **Top Feeds (by messages):**',
    'stats.top_feed_item': '• {{feedId}}: {{count}} messages',
    'stats.period_7': '7 days',
    'stats.period_30': '30 days',
    'stats.error': '❌ Failed to retrieve statistics: {{error}}',

    // Filter messages
    'filter.help':
      '🔍 *Filter Commands:*\n\n• `/filters list <feed_name>` - List filters for a feed\n• `/filters add <feed_name> <include|exclude> <pattern> [regex]` - Add filter\n• `/filters remove <feed_name> <filter_id>` - Remove filter\n• `/filters clear <feed_name>` - Clear all filters\n• `/filters test <include|exclude> <pattern> <sample_text> [regex]` - Test filter\n• `/filters stats <feed_name>` - Show filter statistics\n\n**Filter Types:**\n• `include` - Only show items matching the pattern\n• `exclude` - Hide items matching the pattern\n\n**Examples:**\n• `/filters add news include "breaking news"`\n• `/filters add tech exclude "advertisement" regex`\n• `/filters test include "\\\\d+" "Price: 123" regex`',
    'filter.unknown_command': '❌ Unknown filter command: {{command}}',
    'filter.list_usage': 'Usage: `/filters list <feed_name>`',
    'filter.add_usage': 'Usage: `/filters add <feed_name> <include|exclude> <pattern> [regex]`',
    'filter.remove_usage': 'Usage: `/filters remove <feed_name> <filter_id_or_index>`',
    'filter.clear_usage': 'Usage: `/filters clear <feed_name>`',
    'filter.test_usage': 'Usage: `/filters test <include|exclude> <pattern> <sample_text> [regex]`',
    'filter.stats_usage': 'Usage: `/filters stats <feed_name>`',
    'filter.list_empty': 'ℹ️ No filters configured for feed "{{feedName}}".',
    'filter.list_title': '🔍 *Filters for "{{feedName}}"*',
    'filter.list_item':
      '{{index}}. {{typeIcon}} {{regexIcon}} **{{type}}**: `{{pattern}}` (ID: {{id}})',
    'filter.stats':
      '📊 **Statistics:** {{total}} total ({{include}} include, {{exclude}} exclude, {{regex}} regex)',
    'filter.detailed_stats':
      '📊 *Filter Statistics for "{{feedName}}"*\n\n• Total Filters: {{total}}/{{max}}\n• Include Filters: {{include}}\n• Exclude Filters: {{exclude}}\n• Regex Filters: {{regex}}\n• Remaining Slots: {{remaining}}',
    'filter.added':
      '✅ {{type}} filter added for "{{feedName}}"!\n\n**Pattern:** `{{pattern}}`\n**Regex:** {{isRegex}}',
    'filter.removed': '✅ Filter removed from "{{feedName}}" successfully!',
    'filter.cleared': '✅ {{message}}',
    'filter.already_exists':
      '❌ A filter with pattern "{{pattern}}" already exists for feed "{{feedName}}".',
    'filter.limit_exceeded': '❌ Maximum {{max}} filters allowed per feed. Current: {{current}}',
    'filter.not_found': '❌ Filter with ID "{{id}}" not found.',
    'filter.invalid_regex': '❌ Invalid regex pattern: "{{pattern}}"',
    'filter.add_error': '❌ Failed to add filter: {{error}}',
    'filter.remove_error': '❌ Failed to remove filter: {{error}}',
    'filter.clear_error': '❌ Failed to clear filters: {{error}}',
    'filter.test_error': '❌ Failed to test filter: {{error}}',
    'filter.stats_error': '❌ Failed to get filter statistics: {{error}}',
    'filter.test_result':
      '🧪 *Filter Test Result*\n\n**Type:** {{type}}\n**Pattern:** `{{pattern}}`\n**Regex:** {{isRegex}}\n**Sample Text:** "{{sampleText}}"\n\n**Result:** {{matchIcon}} {{result}}',
    'filter.regex_yes': 'Yes',
    'filter.regex_no': 'No',
  },
  pt: {
    // Welcome messages
    'welcome.title': '🤖 Olá! Eu sou o RSS Skull Bot.',
    'welcome.help': 'Use /ajuda para ver todos os comandos disponíveis.',

    // Help messages
    'help.title': '📚 *Comandos Disponíveis:*',
    'help.feeds': '🔗 *Gerenciamento de Feeds:*',
    // 'help.settings': '⚙️ *Configurações:*', // Disabled - settings don't affect system
    'help.other': 'ℹ️ *Outros:*',
    'help.developer': '👨‍💻 *Desenvolvedor:* Pablo Murad - https://github.com/runawaydevil',
    'help.reddit_cache': '⚠️ *Nota:* URLs de subreddit do Reddit são normalizadas para o feed público `/.rss`.',

    // Commands
    'cmd.add': '/adicionar <nome> <url> - Adicionar feed RSS',
    'cmd.list': '/listar - Listar todos os feeds',
    'cmd.remove': '/remover <nome> - Remover feed',
    'cmd.enable': '/habilitar <nome> - Habilitar feed',
    'cmd.disable': '/desabilitar <nome> - Desabilitar feed',
    'cmd.discover': '/descobrir <url> - Descobrir feeds de um site',
    'cmd.status': '/status - Mostrar status dos feeds e jobs',
    // 'cmd.settings': '/configuracoes - Ver configurações do chat', // Disabled - settings don't affect system
    'cmd.filters': '/filtros <nome> - Gerenciar filtros do feed',
    'cmd.template': '/template - Ver templates e variáveis',
    'cmd.ping': '/ping - Verificar conectividade do bot',
    'cmd.process': '/processar - Processar manualmente todos os feeds',
    'cmd.help': '/ajuda - Mostrar esta mensagem',

    // Error messages
    'error.unknown_command':
      '❌ Comando desconhecido. Use /ajuda para ver os comandos disponíveis.',
    'error.invalid_format': '❌ Formato de comando inválido. Verifique a sintaxe.',
    'error.internal': '❌ Ocorreu um erro interno. Tente novamente mais tarde.',
    'error.permission_denied': '❌ Você não tem permissão para usar este comando.',
    'error.channel_permissions':
      '❌ Preciso de permissões de administrador para funcionar adequadamente neste canal.',
    'error.channel_operation': '❌ Ocorreu um erro ao processar sua solicitação neste canal.',

    // Help messages for channels
    'help.mention_help': '💡 Me mencione com um comando para interagir neste canal.',
    'help.example_usage': 'Exemplo de uso',

    // Status messages
    'status.under_development': '⚠️ Funcionalidade em desenvolvimento. Será implementada em breve!',
    'status.processing': '⏳ Processando sua solicitação...',
    'status.success': '✅ Operação concluída com sucesso.',

    // Feed messages
    'feed.added': '✅ Feed "{{name}}" adicionado com sucesso!',
    'feed.removed': '✅ Feed "{{name}}" removido com sucesso!',
    'feed.enabled': '✅ Feed "{{name}}" habilitado com sucesso!',
    'feed.disabled': '✅ Feed "{{name}}" desabilitado com sucesso!',
    'feed.not_found': '❌ Feed "{{name}}" não encontrado.',
    'feed.already_exists': '❌ Feed "{{name}}" já existe.',
    'feed.already_enabled': '⚠️ Feed "{{name}}" já está habilitado.',
    'feed.already_disabled': '⚠️ Feed "{{name}}" já está desabilitado.',
    'feed.list_empty': 'ℹ️ Nenhum feed configurado para este chat.',
    'feed.list_title': '📋 *Feeds Configurados ({{count}}):*',
    'feed.list_item': '{{status}} {{name}} - {{url}}',
    'feed.validation_error': '❌ {{field}}: {{message}}',
    'feed.invalid_url': '❌ Formato de URL inválido.',
    'feed.invalid_name': '❌ Nome do feed deve ter entre 1 e 50 caracteres.',

    // Settings messages
    'settings.title': '⚙️ *Configurações do Chat*',
    'settings.language': '🌐 Idioma: {{language}}',
    'settings.check_interval':
      '⏰ Intervalo de Verificação: {{interval}} segundos ({{description}})',
    'settings.max_feeds': '📊 Máximo de Feeds: {{count}}',
    'settings.filters_enabled': '🔍 Filtros: {{status}}',
    'settings.message_template': '📝 Template de Mensagem: {{template}}',
    'settings.timezone': '🌍 Fuso Horário: {{timezone}}',
    'settings.updated': '✅ Configurações atualizadas com sucesso!',
    'settings.reset': '✅ Configurações restauradas para o padrão!',
    'settings.language_updated': '✅ Idioma alterado para {{language}}!',
    'settings.interval_updated':
      '✅ Intervalo de verificação atualizado para {{interval}} segundos!',
    'settings.template_updated': '✅ Template de mensagem atualizado!',
    'settings.template_cleared': '✅ Template de mensagem removido!',
    'settings.validation_error': '❌ {{field}}: {{message}}',
    'settings.help': 'Use: /configuracoes [idioma|intervalo|template|resetar] [valor]',
    'settings.available_languages': '🌐 Idiomas disponíveis: English (en), Português (pt)',
    'settings.available_intervals':
      '⏰ Intervalos disponíveis: 90s (1,5min), 120s (2min), 180s (3min), 300s (5min), 600s (10min), 900s (15min)',
    'settings.enabled': 'Habilitado',
    'settings.disabled': 'Desabilitado',
    'settings.no_template': 'Template padrão',

    // Template messages
    'template.help':
      'Comandos de template:\n• /template preview <texto> - Visualizar um template\n• /template examples - Mostrar exemplos de template\n• /template variables - Mostrar variáveis disponíveis',
    'template.examples_title': '📝 *Exemplos de Template:*',
    'template.variables_title': '🔧 *Variáveis Disponíveis:*',
    'template.variable_item': '• `{{{{name}}}}` - {{description}}',
    'template.example_item': '**{{name}}:** {{description}}\n```\n{{template}}\n```',
    'template.preview_title': '👀 *Visualização do Template:*',
    'template.preview_result': '```\n{{result}}\n```',

    // Statistics messages
    'stats.title': '📊 *Estatísticas de Uso ({{period}} dias)*',
    'stats.no_data': 'ℹ️ Ainda não há estatísticas disponíveis para este chat.',
    'stats.summary':
      '📈 **Resumo:**\n• Mensagens Enviadas: {{messages}}\n• Feeds Verificados: {{checks}}\n• Ações do Usuário: {{actions}}',
    'stats.daily_title': '📅 **Atividade Diária:**',
    'stats.daily_item': '• {{date}}: {{messages}} mensagens, {{checks}} verificações',
    'stats.top_feeds_title': '🏆 **Top Feeds (por mensagens):**',
    'stats.top_feed_item': '• {{feedId}}: {{count}} mensagens',
    'stats.period_7': '7 dias',
    'stats.period_30': '30 dias',
    'stats.error': '❌ Falha ao recuperar estatísticas: {{error}}',

    // Filter messages
    'filter.help':
      '🔍 *Comandos de Filtro:*\n\n• `/filtros listar <nome_feed>` - Listar filtros de um feed\n• `/filtros adicionar <nome_feed> <include|exclude> <padrão> [regex]` - Adicionar filtro\n• `/filtros remover <nome_feed> <id_filtro>` - Remover filtro\n• `/filtros limpar <nome_feed>` - Limpar todos os filtros\n• `/filtros testar <include|exclude> <padrão> <texto_exemplo> [regex]` - Testar filtro\n• `/filtros estatisticas <nome_feed>` - Mostrar estatísticas de filtros\n\n**Tipos de Filtro:**\n• `include` - Mostrar apenas itens que correspondem ao padrão\n• `exclude` - Ocultar itens que correspondem ao padrão\n\n**Exemplos:**\n• `/filtros adicionar noticias include "últimas notícias"`\n• `/filtros adicionar tech exclude "publicidade" regex`\n• `/filtros testar include "\\\\d+" "Preço: 123" regex`',
    'filter.unknown_command': '❌ Comando de filtro desconhecido: {{command}}',
    'filter.list_usage': 'Uso: `/filtros listar <nome_feed>`',
    'filter.add_usage': 'Uso: `/filtros adicionar <nome_feed> <include|exclude> <padrão> [regex]`',
    'filter.remove_usage': 'Uso: `/filtros remover <nome_feed> <id_filtro_ou_indice>`',
    'filter.clear_usage': 'Uso: `/filtros limpar <nome_feed>`',
    'filter.test_usage':
      'Uso: `/filtros testar <include|exclude> <padrão> <texto_exemplo> [regex]`',
    'filter.stats_usage': 'Uso: `/filtros estatisticas <nome_feed>`',
    'filter.list_empty': 'ℹ️ Nenhum filtro configurado para o feed "{{feedName}}".',
    'filter.list_title': '🔍 *Filtros para "{{feedName}}"*',
    'filter.list_item':
      '{{index}}. {{typeIcon}} {{regexIcon}} **{{type}}**: `{{pattern}}` (ID: {{id}})',
    'filter.stats':
      '📊 **Estatísticas:** {{total}} total ({{include}} incluir, {{exclude}} excluir, {{regex}} regex)',
    'filter.detailed_stats':
      '📊 *Estatísticas de Filtros para "{{feedName}}"*\n\n• Total de Filtros: {{total}}/{{max}}\n• Filtros de Inclusão: {{include}}\n• Filtros de Exclusão: {{exclude}}\n• Filtros Regex: {{regex}}\n• Slots Restantes: {{remaining}}',
    'filter.added':
      '✅ Filtro {{type}} adicionado para "{{feedName}}"!\n\n**Padrão:** `{{pattern}}`\n**Regex:** {{isRegex}}',
    'filter.removed': '✅ Filtro removido de "{{feedName}}" com sucesso!',
    'filter.cleared': '✅ {{message}}',
    'filter.already_exists':
      '❌ Um filtro com o padrão "{{pattern}}" já existe para o feed "{{feedName}}".',
    'filter.limit_exceeded': '❌ Máximo de {{max}} filtros permitidos por feed. Atual: {{current}}',
    'filter.not_found': '❌ Filtro com ID "{{id}}" não encontrado.',
    'filter.invalid_regex': '❌ Padrão regex inválido: "{{pattern}}"',
    'filter.add_error': '❌ Falha ao adicionar filtro: {{error}}',
    'filter.remove_error': '❌ Falha ao remover filtro: {{error}}',
    'filter.clear_error': '❌ Falha ao limpar filtros: {{error}}',
    'filter.test_error': '❌ Falha ao testar filtro: {{error}}',
    'filter.stats_error': '❌ Falha ao obter estatísticas de filtros: {{error}}',
    'filter.test_result':
      '🧪 *Resultado do Teste de Filtro*\n\n**Tipo:** {{type}}\n**Padrão:** `{{pattern}}`\n**Regex:** {{isRegex}}\n**Texto de Exemplo:** "{{sampleText}}"\n\n**Resultado:** {{matchIcon}} {{result}}',
    'filter.regex_yes': 'Sim',
    'filter.regex_no': 'Não',
  },
} as const;

/**
 * Internationalization middleware that provides translation functions
 */
export function i18nMiddleware() {
  return async (ctx: Context, next: NextFunction) => {
    try {
      // Always use English - remove Portuguese support
      let language: 'en' | 'pt' = 'en';

      // Create translation function
      const t = (key: string, params?: Record<string, string | number>): string => {
        const message = messages[language][key as keyof (typeof messages)['en']] || key;

        if (!params) return message;

        // Simple parameter substitution
        return Object.entries(params).reduce(
          (text: string, [param, value]) => text.replace(`{{${param}}}`, String(value)),
          message
        );
      };

      // Extend context with i18n functionality
      Object.assign(ctx, {
        t,
        language,
      } as Partial<I18nContext>);

      logger.debug('I18n middleware processed', {
        chatId: ctx.chat?.id,
        userId: ctx.from?.id,
        detectedLanguage: language,
        userLanguageCode: ctx.from?.language_code,
      });

      await next();
    } catch (error) {
      logger.error('I18n middleware error:', error);
      throw error;
    }
  };
}
