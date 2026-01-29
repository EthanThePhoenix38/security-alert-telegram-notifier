import * as core from '@actions/core';
import axios from 'axios';

async function run(): Promise<void> {
    try {
        const token = core.getInput('telegram-token', { required: true });
        const chatId = core.getInput('telegram-chat-id', { required: true });
        const message = core.getInput('message') || 'Security alert detected!';
        const disableNotification = core.getInput('disable-notification') === 'true';
        const parseMode = core.getInput('parse-mode') || 'Markdown';
        const disableWebPreview = core.getInput('disable-web-preview') === 'true';

        // Validate inputs
        if (!token || !chatId) {
            throw new Error('Telegram Token and Chat ID are required.');
        }

        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        // Construct payload
        const payload = {
            chat_id: chatId,
            text: message,
            parse_mode: parseMode,
            disable_notification: disableNotification,
            disable_web_page_preview: disableWebPreview
        };

        core.debug(`Sending message to chat ${chatId}`);

        const response = await axios.post(url, payload);

        if (response.data && response.data.ok) {
            core.info('Message sent successfully!');
            core.setOutput('message-id', response.data.result.message_id);
            core.setOutput('success', 'true');
        } else {
            throw new Error(`Telegram API Error: ${JSON.stringify(response.data)}`);
        }

    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(`Action failed with error: ${error.message}`);
        } else {
            core.setFailed('Action failed with an unknown error');
        }
    }
}

run();
