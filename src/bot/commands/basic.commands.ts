import {
  BaseCommandHandler,
  type CommandContext,
  type CommandHandler,
  CommandSchemas,
} from '../handlers/command.handler.js';
import { logger } from '../../utils/logger/logger.service.js';

/**
 * Start command handler
 */
export class StartCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new StartCommand();
    return {
      name: 'start',
      aliases: ['iniciar'],
      description: 'Start the bot and show welcome message',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    try {
      // Get chat information
      if (!ctx.chat) {
        throw new Error('Chat information not available');
      }

      const chatId = ctx.chat.id.toString();
      const chatType = ctx.chat.type;
      const chatTitle = 'title' in ctx.chat ? ctx.chat.title : null;

      // Import database service
      const { DatabaseService } = await import('../../database/database.service.js');

      // Initialize database
      const database = new DatabaseService();
      await database.connect();

      // Register or update chat directly with Prisma
      await database.client.chat.upsert({
        where: { id: chatId },
        update: {
          type: chatType,
          title: chatTitle,
          updatedAt: new Date(),
        },
        create: {
          id: chatId,
          type: chatType,
          title: chatTitle,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create default settings if they don't exist
      await database.client.chatSettings.upsert({
        where: { chatId },
        update: {},
        create: {
          chatId,
          language: ctx.language || 'en',
          checkInterval: 300,
          maxFeeds: 50,
          enableFilters: true,
          timezone: 'UTC',
        },
      });

      logger.info(`Chat registered successfully: ${chatId} (${chatType}) - ${chatTitle || 'No title'}`);

      const welcomeMessage = `${ctx.t('welcome.title')}\n\n${ctx.t('welcome.help')}`;
      await ctx.reply(welcomeMessage);
    } catch (error) {
      logger.error('Failed to register chat in start command:', error);
      const welcomeMessage = `${ctx.t('welcome.title')}\n\n${ctx.t('welcome.help')}`;
      await ctx.reply(welcomeMessage);
    }
  }
}

/**
 * Help command handler
 */
export class HelpCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new HelpCommand();
    return {
      name: 'help',
      aliases: ['ajuda'],
      description: 'Show available commands',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    const helpMessage = `${ctx.t('help.title')}

${ctx.t('help.feeds')}
${ctx.t('cmd.add')}
${ctx.t('cmd.list')}
${ctx.t('cmd.remove')}
${ctx.t('cmd.enable')}
${ctx.t('cmd.disable')}
${ctx.t('cmd.discover')}
${ctx.t('cmd.status')}
${ctx.t('cmd.filters')}

${ctx.t('help.other')}
${ctx.t('cmd.template')}
${ctx.t('cmd.stats')}
${ctx.t('cmd.ping')}
${ctx.t('cmd.help')}

${ctx.t('help.developer')}`;

    await ctx.reply(helpMessage, { parse_mode: 'Markdown', link_preview_options: { is_disabled: false } });
  }
}

/**
 * Secret ping command for testing bot functionality
 */
export class PingCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new PingCommand();
    return {
      name: 'ping',
      aliases: [],
      description: 'Secret ping command for testing',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    try {
      await ctx.reply('PONG!!!');
      logger.info('Ping command executed successfully', {
        chatId: ctx.chatIdString,
        userId: ctx.userId,
        chatType: ctx.chat?.type,
      });
    } catch (error) {
      logger.error('Error in ping command:', error);
      await ctx.reply('❌ Internal error while executing command.');
    }
  }
}


/**
 * Secret reset command to clear all feeds and data
 */
export class ResetCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new ResetCommand();
    return {
      name: 'reset',
      aliases: [],
      description: 'Secret reset command to clear all feeds',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    try {
      await ctx.reply('⚠️ **WARNING: Resetting ALL database data...**\n\n🔄 This includes:\n• All feeds from all chats\n• All filters\n• All settings\n• All statistics\n\n⏳ Processing...');

      // Import database service
      const { DatabaseService } = await import('../../database/database.service.js');
      const database = new DatabaseService();
      await database.connect();
      
      logger.info('FULL DATABASE RESET command starting', {
        chatId: ctx.chatIdString,
        userId: ctx.userId,
        chatType: ctx.chat?.type,
      });

      // Get counts before deletion for logging
      const totalFeeds = await database.client.feed.count();
      const totalFilters = await database.client.feedFilter.count();
      const totalSettings = await database.client.chatSettings.count();
      const totalStats = await database.client.statistic.count();
      
      logger.info('Database contents before FULL reset', {
        totalFeeds,
        totalFilters,
        totalSettings,
        totalStats,
      });

      // Delete ALL filters first (foreign key constraint)
      const deletedFilters = await database.client.feedFilter.deleteMany({});

      // Delete ALL feeds
      const deletedFeeds = await database.client.feed.deleteMany({});

      // Delete ALL chat settings
      const deletedSettings = await database.client.chatSettings.deleteMany({});

      // Delete ALL statistics
      const deletedStats = await database.client.statistic.deleteMany({});

      // Clear all job queues to remove orphaned jobs
      try {
        const { feedQueueService } = await import('../../jobs/feed-queue.service.js');
        await feedQueueService.clearAllQueues();
      } catch (error) {
        logger.error('Failed to clear job queues:', error);
        // Don't fail the entire reset if queue clearing fails
      }

      await database.disconnect();

      logger.info('FULL DATABASE RESET executed successfully', {
        chatId: ctx.chatIdString,
        userId: ctx.userId,
        chatType: ctx.chat?.type,
        deletedFeeds: deletedFeeds.count,
        deletedFilters: deletedFilters.count,
        deletedSettings: deletedSettings.count,
        deletedStats: deletedStats.count,
      });

      await ctx.reply(`✅ **Full Reset Completed!**\n\n📊 **Data removed from entire database:**\n• ${deletedFeeds.count} feeds\n• ${deletedFilters.count} filters\n• ${deletedSettings.count} settings\n• ${deletedStats.count} statistics\n\n🗑️ Database completely cleaned!\n🔄 Job queues cleared to prevent orphaned jobs`);
    } catch (error) {
      logger.error('Error in FULL DATABASE RESET command:', error);
      await ctx.reply('❌ Internal error while executing full reset.');
    }
  }
}

/**
 * Secret command to list and remove problematic feeds
 */
export class FixFeedsCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new FixFeedsCommand();
    return {
      name: 'fixfeeds',
      aliases: [],
      description: 'Secret command to fix problematic feeds',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    try {
      await ctx.reply('🔍 Checking problematic feeds...');

      // Import database service
      const { DatabaseService } = await import('../../database/database.service.js');
      const database = new DatabaseService();
      await database.connect();

      // Get chat ID
      const chatId = ctx.chatIdString;

      // Find problematic feeds
      const problematicFeeds = await database.client.feed.findMany({
        where: {
          chatId,
          OR: [
            { rssUrl: { contains: 'reddit.com.br' } },
            { url: { contains: 'reddit.com.br' } },
          ],
        },
      });

      if (problematicFeeds.length === 0) {
        await ctx.reply('✅ No problematic feeds found!');
        await database.disconnect();
        return;
      }

      // Delete problematic feeds
      const deletedFeeds = await database.client.feed.deleteMany({
        where: {
          chatId,
          OR: [
            { rssUrl: { contains: 'reddit.com.br' } },
            { url: { contains: 'reddit.com.br' } },
          ],
        },
      });

      // Delete associated filters
      const deletedFilters = await database.client.feedFilter.deleteMany({
        where: {
          feed: {
            chatId,
            OR: [
              { rssUrl: { contains: 'reddit.com.br' } },
              { url: { contains: 'reddit.com.br' } },
            ],
          },
        },
      });

      await database.disconnect();

      logger.info('Fix feeds command executed successfully', {
        chatId,
        userId: ctx.userId,
        chatType: ctx.chat?.type,
        deletedFeeds: deletedFeeds.count,
        deletedFilters: deletedFilters.count,
      });

      await ctx.reply(`✅ Problematic feeds removed!\n\n📊 Data removed:\n• ${deletedFeeds.count} feeds\n• ${deletedFilters.count} filters\n\n🔗 Removed feeds:\n${problematicFeeds.map((f: any) => `• ${f.name} (${f.rssUrl})`).join('\n')}`);
    } catch (error) {
      logger.error('Error in fixfeeds command:', error);
      await ctx.reply('❌ Internal error while executing command.');
    }
  }
}

/**
 * Command to reset circuit breakers for problematic domains
 */
export class ResetCircuitBreakerCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new ResetCircuitBreakerCommand();
    return {
      name: 'resetcircuit',
      aliases: [],
      description: 'Reset circuit breakers for problematic domains',
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext, args: string[]): Promise<void> {
    try {
      if (args.length === 0) {
        await ctx.reply('⚠️ **Reset Circuit Breaker**\n\n📝 **Uso:** `/resetcircuit <domínio>`\n\n🔧 **Exemplo:** `/resetcircuit escatologiafilmes.com`\n\n💡 **Nota:** Use apenas se o site voltou a funcionar normalmente.');
        return;
      }

      const domain = args[0]?.toLowerCase();
      
      if (!domain) {
        await ctx.reply('❌ Domínio não fornecido.');
        return;
      }
      
      // Import circuit breaker service
      const { circuitBreakerService } = await import('../../utils/circuit-breaker.service.js');
      
      // Check current state
      const currentState = circuitBreakerService.getState(domain);
      
      if (!currentState || currentState.state === 'CLOSED') {
        await ctx.reply(`✅ **Circuit Breaker Status**\n\n🌐 **Domínio:** ${domain}\n🔓 **Estado:** CLOSED (funcionando normalmente)\n\n💡 Não é necessário resetar.`);
        return;
      }

      // Reset the circuit breaker
      circuitBreakerService.reset(domain);
      
      logger.info('Circuit breaker manually reset via bot command', {
        domain,
        chatId: ctx.chatIdString,
        userId: ctx.userId,
        previousState: currentState.state,
      });

      await ctx.reply(`✅ **Circuit Breaker Reset!**\n\n🌐 **Domain:** ${domain}\n🔄 **Previous state:** ${currentState.state}\n🔓 **New state:** CLOSED\n\n⚡ The system will now attempt to access the site again.\n\n⚠️ **Note:** If the site still has issues, the circuit breaker will be activated again automatically.`);
      
    } catch (error) {
      logger.error('Error in reset circuit breaker command:', error);
      await ctx.reply('❌ Internal error while resetting circuit breaker.');
    }
  }
}

/**
 * Command to show circuit breaker statistics
 */
export class CircuitBreakerStatsCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new CircuitBreakerStatsCommand();
    return {
      name: 'circuitstats',
      aliases: [],
      description: 'Show circuit breaker statistics',
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    try {
      // Import circuit breaker service
      const { circuitBreakerService } = await import('../../utils/circuit-breaker.service.js');
      
      const stats = circuitBreakerService.getStats();
      
      if (Object.keys(stats).length === 0) {
        await ctx.reply('✅ **Circuit Breaker Status**\n\n🔓 Todos os circuit breakers estão CLOSED (funcionando normalmente).');
        return;
      }

      let message = '📊 **Circuit Breaker Statistics**\n\n';
      
      for (const [domain, stat] of Object.entries(stats)) {
        const state = stat.state;
        const emoji = state === 'OPEN' ? '🔴' : state === 'HALF_OPEN' ? '🟡' : '🟢';
        
        message += `${emoji} **${domain}**\n`;
        message += `   Estado: ${state}\n`;
        message += `   Falhas: ${stat.failureCount}\n`;
        
        if (stat.nextAttemptTime) {
          const nextAttempt = new Date(stat.nextAttemptTime);
          message += `   Próxima tentativa: ${nextAttempt.toLocaleString('pt-BR')}\n`;
        }
        
        message += '\n';
      }

      message += '💡 **Estados:**\n';
      message += '🟢 CLOSED = Funcionando\n';
      message += '🟡 HALF_OPEN = Testando\n';
      message += '🔴 OPEN = Bloqueado\n\n';
      message += '🔧 Use `/resetcircuit <domínio>` para resetar manualmente.';

      await ctx.reply(message);
      
    } catch (error) {
      logger.error('Error in circuit breaker stats command:', error);
      await ctx.reply('❌ Internal error while retrieving statistics.');
    }
  }
}

