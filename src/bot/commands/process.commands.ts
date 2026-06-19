import { database } from '../../database/database.service.js';
import { feedQueueService } from '../../jobs/index.js';
import { feedIntervalService } from '../../utils/feed-interval.service.js';
import {
  BaseCommandHandler,
  type CommandContext,
  type CommandHandler,
  CommandSchemas,
} from '../handlers/command.handler.js';
import { logger } from '../../utils/logger/logger.service.js';
import { getSafeErrorMessage } from '../../utils/security/error-sanitizer.js';

/**
 * Secret command to reset database (admin only)
 */
export class ResetDatabaseCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new ResetDatabaseCommand();
    return {
      name: 'resetdb',
      aliases: ['resetdatabase'],
      description: 'Reset database (admin only)',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    try {
      // Check if user is admin (you can customize this logic)
      const isAdmin = ctx.from?.id === 123456789; // Replace with your Telegram user ID

      if (!isAdmin) {
        await ctx.reply('❌ **Access Denied**\n\nOnly administrators can use this command.');
        return;
      }

      await ctx.reply('⚠️ **WARNING: Database Reset**\n\n' +
        'This action will:\n' +
        '• Delete ALL feeds\n' +
        '• Delete ALL settings\n' +
        '• Delete ALL statistics\n\n' +
        'Type `/confirmreset` to confirm or `/cancelreset` to cancel.');

      // Store confirmation state (you might want to use Redis for this)
      logger.warn(`Database reset requested by admin user ${ctx.from?.id} in chat ${ctx.chatIdString}`);

    } catch (error) {
      logger.error('Failed to initiate database reset', { error, chatId: ctx.chatIdString });
      await ctx.reply('❌ Error initiating database reset.');
    }
  }
}

/**
 * Confirmation command for database reset
 */
export class ConfirmResetCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new ConfirmResetCommand();
    return {
      name: 'confirmreset',
      aliases: [],
      description: 'Confirm database reset',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    try {
      // Check if user is admin
      const isAdmin = ctx.from?.id === 123456789; // Replace with your Telegram user ID

      if (!isAdmin) {
        await ctx.reply('❌ **Access Denied**\n\nOnly administrators can use this command.');
        return;
      }

      await ctx.reply('🔄 **Resetting database...**\n\n⏳ Please wait, this may take a few seconds...');

      // Reset database
      await database.client.feed.deleteMany({});
      await database.client.chatSettings.deleteMany({});
      await database.client.feedFilter.deleteMany({});
      await database.client.statistic.deleteMany({});
      await database.client.chat.deleteMany({});

      logger.info(`Database reset completed by admin user ${ctx.from?.id}`);

      await ctx.reply('✅ **Database reset successfully!**\n\n' +
        'All data has been deleted:\n' +
        '• Feeds removed\n' +
        '• Settings reset\n' +
        '• Statistics cleared\n\n' +
        'The bot is ready to use again.');

    } catch (error) {
      logger.error('Failed to reset database', { error, chatId: ctx.chatIdString });
      await ctx.reply('❌ Error resetting database.');
    }
  }
}

/**
 * Cancel database reset command
 */
export class CancelResetCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new CancelResetCommand();
    return {
      name: 'cancelreset',
      aliases: [],
      description: 'Cancel database reset',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    await ctx.reply('✅ **Reset cancelled**\n\nNo changes were made to the database.');
  }
}

/**
 * Debug command to check a specific feed immediately
 * This command is for admin/debug purposes
 */
export class DebugFeedCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new DebugFeedCommand();
    return {
      name: 'debugfeed',
      aliases: ['df'],
      description: 'Debug a specific feed by name (force immediate check)',
      handler: async (ctx: CommandContext, args: string[]) => {
        const feedName = args[0];
        if (!feedName) {
          await ctx.reply('❌ Feed name is required. Usage: /debugfeed <feed_name>');
          return;
        }
        await instance.execute(ctx, { feedName });
      },
    };
  }

  async execute(ctx: CommandContext, args: { feedName: string }): Promise<void> {
    try {
      const { FeedService } = await import('../../services/index.js');
      const { feedQueueService } = await import('../../jobs/index.js');

      // Create feed service instance
      const feedService = new FeedService(database.client);

      // Get the feed by name
      const feeds = await feedService.listFeeds(ctx.chatIdString);
      const feed = feeds.find((f: any) => f.name.toLowerCase() === args.feedName.toLowerCase());

      if (!feed) {
        await ctx.reply(`❌ Feed "${args.feedName}" not found. Use /list to see available feeds.`);
        return;
      }

      await ctx.reply(`🔍 **Debug Feed: ${feed.name}**\n\n` +
        `📊 **Current Status:**\n` +
        `• Enabled: ${feed.enabled ? '✅' : '❌'}\n` +
        `• URL: ${feed.rssUrl}\n` +
        `• Interval: ${feed.checkIntervalMinutes} minutes\n` +
        `• Last Check: ${feed.lastCheck ? new Date(feed.lastCheck).toLocaleString() : 'Never'}\n` +
        `• Last Notified: ${feed.lastNotifiedAt ? new Date(feed.lastNotifiedAt).toLocaleString() : 'Never'}\n` +
        `• Last Item ID: ${feed.lastItemId || 'None'}\n\n` +
        `🚀 **Forcing immediate check...**`,
        { parse_mode: 'Markdown' });

      // Force immediate feed check
      await feedQueueService.scheduleFeedCheck({
        feedId: feed.id,
        chatId: feed.chatId,
        feedUrl: feed.rssUrl,
        lastItemId: feed.lastItemId ?? undefined,
      }, 0); // No delay

      await ctx.reply(`✅ Debug check queued for "${feed.name}". Check logs for detailed results.`);

      logger.info(`Debug feed check initiated for feed ${feed.name} (${feed.id}) by user in chat ${ctx.chatIdString}`);
    } catch (error) {
      logger.error('Failed to debug feed:', error);
      await ctx.reply('❌ Failed to debug feed. Please try again.');
    }
  }
}

/**
 * Secret command to process feeds immediately
 * This command is not listed in help and is for admin/debug purposes
 */
export class ProcessFeedsCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new ProcessFeedsCommand();
    return {
      name: 'processar',
      aliases: [],
      description: 'Process all feeds immediately (secret command)',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    try {
      const processingMessage = await ctx.reply('🔄 **Processando feeds perdidos...**\n\n⏳ Verificando itens que o bot perdeu desde que ficou online...');

      // Get all enabled feeds for this chat
      const feeds = await database.client.feed.findMany({
        where: {
          chatId: ctx.chatIdString,
          enabled: true,
        },
        include: {
          filters: true,
        },
      });

      if (feeds.length === 0) {
        await ctx.reply('❌ **Nenhum feed encontrado**\n\nNão há feeds habilitados neste chat.');
        return;
      }

      let processedCount = 0;
      let errorCount = 0;
      let totalNewItems = 0;
      const feedResults: Array<{ name: string, newItems: number, error?: string }> = [];

      // Process each feed immediately and wait for results
      for (const feed of feeds) {
        try {
          logger.info(`Processing feed immediately: ${feed.name} (${feed.id})`);

          // Get current lastItemId to compare later
          const originalLastItemId = feed.lastItemId;

          // Schedule immediate feed check (no delay)
          await feedQueueService.scheduleFeedCheck({
            feedId: feed.id,
            chatId: feed.chatId,
            feedUrl: feed.rssUrl,
            lastItemId: feed.lastItemId ?? undefined,
            failureCount: 0,
          }, 0); // 0 delay = immediate processing

          // Wait a bit for processing to complete
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check if feed was updated (new items found)
          const updatedFeed = await database.client.feed.findUnique({
            where: { id: feed.id },
            select: { lastItemId: true }
          });

          const newItemsCount = updatedFeed?.lastItemId !== originalLastItemId ? 1 : 0;
          totalNewItems += newItemsCount;

          feedResults.push({
            name: feed.name,
            newItems: newItemsCount
          });

          processedCount++;
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`Failed to process feed ${feed.name}:`, error);

          feedResults.push({
            name: feed.name,
            newItems: 0,
            error: errorMessage
          });
        }
      }

      // Update the processing message with results
      let resultMessage = `✅ **Processing Complete!**\n\n`;
      resultMessage += `📊 **Summary:**\n`;
      resultMessage += `• Feeds processed: ${processedCount}/${feeds.length}\n`;
      resultMessage += `• New items found: ${totalNewItems}\n`;
      resultMessage += `• Errors: ${errorCount}\n\n`;

      if (totalNewItems > 0) {
        resultMessage += `🎉 **${totalNewItems} new item(s) found!**\n\n`;
        resultMessage += `📋 **Details by feed:**\n`;

        feedResults.forEach(result => {
          if (result.newItems > 0) {
            resultMessage += `• ✅ **${result.name}**: ${result.newItems} new item(s)\n`;
          } else if (result.error) {
            resultMessage += `• ❌ **${result.name}**: Error\n`;
          } else {
            resultMessage += `• 📭 **${result.name}**: No new items\n`;
          }
        });

        resultMessage += `\n💡 **Note:** Only items published since the bot came online were processed.`;
      } else if (errorCount > 0) {
        resultMessage += `⚠️ **Some feeds had errors**\n\n`;
        resultMessage += `📋 **Details:**\n`;

        feedResults.forEach(result => {
          if (result.error) {
            resultMessage += `• ❌ **${result.name}**: ${result.error}\n`;
          } else {
            resultMessage += `• 📭 **${result.name}**: No new items\n`;
          }
        });

        resultMessage += `\n💡 Check the logs for more details.`;
      } else {
        resultMessage += `📭 **No new items found**\n\n`;
        resultMessage += `📋 **Feed status:**\n`;

        feedResults.forEach(result => {
          resultMessage += `• 📭 **${result.name}**: Up to date\n`;
        });

        resultMessage += `\n💡 All feeds are up to date. Try again later.`;
      }

      // Edit the original message with results
      try {
        await ctx.api.editMessageText(
          ctx.chatId!,
          processingMessage.message_id,
          resultMessage,
          { parse_mode: 'Markdown' }
        );
      } catch (editError) {
        // If edit fails, send new message
        await ctx.reply(resultMessage, { parse_mode: 'Markdown' });
      }

      logger.info(`Manual feed processing completed for chat ${ctx.chatIdString}: ${processedCount}/${feeds.length} feeds processed, ${totalNewItems} new items found`);
    } catch (error) {
      logger.error('Failed to process feeds manually:', error);
      await ctx.reply('❌ **Processing Error**\n\nFailed to process feeds. Please try again later.');
    }
  }
}

/**
 * Secret command to reset lastItemId of a specific feed
 */
export class ResetFeedCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new ResetFeedCommand();
    return {
      name: 'resetfeed',
      aliases: [],
      description: 'Reset lastItemId of a specific feed',
      schema: CommandSchemas.singleString,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext, args: [string]): Promise<void> {
    const [feedName] = args;

    try {
      await ctx.reply(`🔄 **Resetando lastItemId do feed "${feedName}"...**\n\n⏳ Aguarde...`);

      // Find the specific feed
      const feed = await database.client.feed.findFirst({
        where: {
          chatId: ctx.chatIdString,
          name: feedName,
          enabled: true,
        },
        include: {
          filters: true,
        },
      });

      if (!feed) {
        await ctx.reply(`❌ **Feed não encontrado**\n\nO feed "${feedName}" não foi encontrado ou não está habilitado.`);
        return;
      }

      logger.info(`Resetting lastItemId for feed: ${feed.name} (${feed.id})`);

      // Reset lastItemId to null
      await database.client.feed.update({
        where: { id: feed.id },
        data: { lastItemId: null },
      });

      await ctx.reply(`✅ **lastItemId Reset!**\n\n📰 **Feed:** ${feed.name}\n🔗 **URL:** ${feed.rssUrl}\n\n🔄 The next processing will detect all items as new.`);

      logger.info(`Successfully reset lastItemId for feed: ${feed.name} (${feed.id})`);
    } catch (error) {
      logger.error(`Failed to reset lastItemId for feed "${feedName}":`, error);
      await ctx.reply(`❌ **Error resetting lastItemId**\n\nError: ${getSafeErrorMessage(error)}`);
    }
  }
}

/**
 * Secret command to process a specific feed immediately
 */
export class ProcessFeedCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new ProcessFeedCommand();
    return {
      name: 'processarfeed',
      aliases: ['processfeed'],
      description: 'Process specific feed immediately (secret command)',
      schema: CommandSchemas.singleString,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext, args: [string]): Promise<void> {
    const [feedName] = args;

    try {
      const processingMessage = await ctx.reply(`🔄 **Processando feed "${feedName}"...**\n\n⏳ Aguarde, verificando o feed...`);

      // Find the specific feed
      const feed = await database.client.feed.findFirst({
        where: {
          chatId: ctx.chatIdString,
          name: feedName,
          enabled: true,
        },
        include: {
          filters: true,
        },
      });

      if (!feed) {
        await ctx.reply(`❌ **Feed não encontrado**\n\nO feed "${feedName}" não foi encontrado ou não está habilitado.`);
        return;
      }

      logger.info(`Processing specific feed immediately: ${feed.name} (${feed.id})`);

      // Get current lastItemId to compare later
      const originalLastItemId = feed.lastItemId;

      // Schedule immediate feed check
      await feedQueueService.scheduleFeedCheck({
        feedId: feed.id,
        chatId: feed.chatId,
        feedUrl: feed.rssUrl,
        lastItemId: feed.lastItemId ?? undefined,
        failureCount: 0,
      }, 0); // 0 delay = immediate processing

      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if feed was updated (new items found)
      const updatedFeed = await database.client.feed.findUnique({
        where: { id: feed.id },
        select: { lastItemId: true }
      });

      const hasNewItems = updatedFeed?.lastItemId !== originalLastItemId;

      // Update the processing message with results
      let resultMessage = `✅ **Processing Complete!**\n\n`;
      resultMessage += `📰 **Feed:** ${feed.name}\n`;
      resultMessage += `🔗 **URL:** ${feed.rssUrl}\n\n`;

      if (hasNewItems) {
        resultMessage += `🎉 **New item found!**\n\n`;
        resultMessage += `🚀 The new item will be sent shortly!`;
      } else {
        resultMessage += `📭 **No new items found**\n\n`;
        resultMessage += `💡 The feed is up to date. Try again later.`;
      }

      // Edit the original message with results
      try {
        await ctx.api.editMessageText(
          ctx.chatId!,
          processingMessage.message_id,
          resultMessage,
          { parse_mode: 'Markdown' }
        );
      } catch (editError) {
        // If edit fails, send new message
        await ctx.reply(resultMessage, { parse_mode: 'Markdown' });
      }

      logger.info(`Manual feed processing completed for feed ${feed.name} in chat ${ctx.chatIdString}: ${hasNewItems ? 'new items found' : 'no new items'}`);
    } catch (error) {
      logger.error(`Failed to process feed ${feedName}:`, error);
      await ctx.reply('❌ **Processing Error**\n\nFailed to process feed. Please try again later.');
    }
  }
}

/**
 * Reload feeds command - forces re-scheduling of all enabled feeds
 */
export class ReloadFeedsCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new ReloadFeedsCommand();
    return {
      name: 'reload',
      aliases: ['reloadfeeds', 'reagendar'],
      description: 'Force re-scheduling of all enabled feeds',
      schema: CommandSchemas.noArgs,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext): Promise<void> {
    try {
      await ctx.reply('🔄 **Recarregando feeds...**\n\n⏳ Aguarde, isso pode levar alguns segundos...');

      // Get all enabled feeds for this chat
      const feeds = await database.client.feed.findMany({
        where: {
          chatId: ctx.chatIdString,
          enabled: true,
        },
        include: {
          filters: true,
        },
      });

      if (feeds.length === 0) {
        await ctx.reply('❌ **Nenhum feed habilitado**\n\nNão há feeds habilitados neste chat para recarregar.');
        return;
      }

      logger.info(`Starting feed reload for chat ${ctx.chatIdString}: ${feeds.length} feeds`);

      let scheduledCount = 0;
      let errorCount = 0;
      const errors: Array<{ name: string; error: string }> = [];

      // Clear existing jobs for these feeds first
      for (const feed of feeds) {
        try {
          await feedQueueService.removeRecurringFeedCheck(feed.id);
          logger.debug(`Removed existing job for feed ${feed.id}`);
        } catch (error) {
          // Ignore errors when removing non-existent jobs
          logger.debug(`No existing job to remove for feed ${feed.id}`);
        }
      }

      // Schedule all feeds with force=true to bypass duplicate checks
      for (const feed of feeds) {
        try {
          const intervalMinutes = feedIntervalService.getIntervalForUrl(feed.rssUrl);

          await feedQueueService.scheduleRecurringFeedCheck({
            feedId: feed.id,
            chatId: feed.chatId,
            feedUrl: feed.rssUrl,
            lastItemId: feed.lastItemId ?? undefined,
          }, intervalMinutes, true); // force=true to bypass duplicate checks

          scheduledCount++;
          logger.info(`Scheduled feed ${feed.name} (${feed.id}) with ${intervalMinutes}min interval`);
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ name: feed.name, error: errorMessage });
          logger.error(`Failed to schedule feed ${feed.name}:`, error);
        }
      }

      // Build result message
      let message = `✅ **Reload Complete!**\n\n`;
      message += `📊 **Summary:**\n`;
      message += `• Feeds scheduled: ${scheduledCount}/${feeds.length}\n`;
      message += `• Errors: ${errorCount}\n\n`;

      if (scheduledCount > 0) {
        message += `🔄 **Feeds scheduled successfully:**\n`;
        feeds.forEach((feed: any) => {
          if (!errors.find(e => e.name === feed.name)) {
            message += `• ✅ ${feed.name}\n`;
          }
        });

        if (errorCount > 0) {
          message += `\n❌ **Feeds com erro:**\n`;
          errors.forEach(({ name, error }) => {
            message += `• ${name}: ${error}\n`;
          });
        }

        message += `\n💡 Feeds will now be checked periodically.`;
      } else {
        message += `❌ **No feeds were scheduled!**\n\n`;
        message += `**Errors:**\n`;
        errors.forEach(({ name, error }) => {
          message += `• ${name}: ${error}\n`;
        });
        message += `\n💡 Verifique os logs para mais detalhes.`;
      }

      await ctx.reply(message, { parse_mode: 'Markdown' });

      logger.info(`Feed reload completed for chat ${ctx.chatIdString}: ${scheduledCount}/${feeds.length} feeds scheduled`);
    } catch (error) {
      logger.error('Failed to reload feeds:', error);
      await ctx.reply('❌ **Error reloading feeds**\n\nError: ' + getSafeErrorMessage(error));
    }
  }
}

/**
 * Command to trigger an immediate check for a specific feed
 */
export class CheckFeedCommand extends BaseCommandHandler {
  static create(): CommandHandler {
    const instance = new CheckFeedCommand();
    return {
      name: 'check',
      aliases: ['fetch', 'pull'],
      description: 'Trigger an immediate check for a specific feed',
      schema: CommandSchemas.singleString,
      handler: instance.validateAndExecute.bind(instance),
    };
  }

  protected async execute(ctx: CommandContext, args: [string]): Promise<void> {
    const [feedName] = args;
    const chatId = ctx.chatIdString;

    try {
      // 1. Look up the feed
      const feed = await database.client.feed.findFirst({
        where: {
          chatId,
          name: feedName,
        },
      });

      if (!feed) {
        await ctx.reply(`❌ Feed "**${feedName}**" not found in this chat.`, { parse_mode: 'Markdown' });
        return;
      }

      // Snapshot the last check time
      const startCheckTime = feed.lastCheck;

      // 2. Queue the job
      await feedQueueService.scheduleFeedCheck({
        feedId: feed.id,
        chatId: feed.chatId,
        feedUrl: feed.rssUrl,
        lastItemId: feed.lastItemId ?? undefined,
      });

      // 3. Notify user that polling has started
      const statusMessage = await ctx.reply(`⏳ Queued immediate check for "**${feedName}**". Waiting for results...`, { parse_mode: 'Markdown' });
      
      // 4. Poll database for completion (every 2 seconds, max 8 attempts = ~16 seconds)
      const maxAttempts = 8;
      let checkFinished = false;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Re-fetch feed to check lastCheck
        const currentFeed = await database.client.feed.findUnique({
          where: { id: feed.id },
          select: { lastCheck: true },
        });

        if (currentFeed && startCheckTime && currentFeed.lastCheck > startCheckTime) {
          checkFinished = true;
          break;
        } else if (currentFeed && !startCheckTime && currentFeed.lastCheck) {
          // Edge case: never checked before, now has a check time
          checkFinished = true;
          break;
        }
      }

      // 5. Final update
      if (checkFinished) {
        // We don't know exactly how many items were found here (worker handles delivery),
        // but we know the check successfully completed.
        await ctx.api.editMessageText(
          ctx.chatId,
          statusMessage.message_id,
          `✅ **Check complete for "${feedName}"!**\n\nIf any new items were found, they have been delivered to the chat.`,
          { parse_mode: 'Markdown' }
        ).catch(e => logger.warn(`Failed to edit check status message: ${e.message}`));
      } else {
        await ctx.api.editMessageText(
          ctx.chatId,
          statusMessage.message_id,
          `⏱️ **Check for "${feedName}" is taking longer than expected.**\n\nThe job is still queued and will process shortly. New items will arrive once it finishes.`,
          { parse_mode: 'Markdown' }
        ).catch(e => logger.warn(`Failed to edit check status message: ${e.message}`));
      }

    } catch (error) {
      logger.error(`Error checking feed ${feedName}:`, error);
      await ctx.reply('❌ **Error triggering feed check**\n\nError: ' + getSafeErrorMessage(error));
    }
  }
}

