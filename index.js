#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables with absolute path
dotenv.config({ path: '/Users/yasir/Desktop/gmail-mcp-server/.env' });

// Debug: Log environment variables
// console.error('Debug - GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'Not set');
// console.error('Debug - GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');

class GmailMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'gmail-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'send_email',
            description: 'Send an email using Gmail',
            inputSchema: {
              type: 'object',
              properties: {
                to: { type: 'string', description: 'Recipient email address' },
                subject: { type: 'string', description: 'Email subject' },
                body: { type: 'string', description: 'Email body content' },
                html: { type: 'boolean', description: 'Whether the body is HTML', default: false },
              },
              required: ['to', 'subject', 'body'],
            },
          },
          {
            name: 'send_introduction_email',
            description: 'Send a professional introduction email',
            inputSchema: {
              type: 'object',
              properties: {
                to: { type: 'string', description: 'Recipient email address' },
                name: { type: 'string', description: 'Your name', default: 'Yasir Aquil' },
                customMessage: { type: 'string', description: 'Custom message to include' },
              },
              required: ['to'],
            },
          },
          {
            name: 'check_gmail_config',
            description: 'Check if Gmail configuration is properly set up',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'send_email':
            return await this.sendEmail(args);
          case 'send_introduction_email':
            return await this.sendIntroductionEmail(args);
          case 'check_gmail_config':
            return await this.checkGmailConfig();
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Error executing ${name}: ${error.message}`);
      }
    });
  }

  async createTransporter() {
    console.error('Creating transporter with user:', process.env.GMAIL_USER);
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendEmail(args) {
    const { to, subject, body, html = false } = args;

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Gmail configuration not found. Please check your .env file.');
    }

    const transporter = await this.createTransporter();
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      [html ? 'html' : 'text']: body,
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      content: [
        {
          type: 'text',
          text: `Email sent successfully! Message ID: ${result.messageId}`,
        },
      ],
    };
  }

  async sendIntroductionEmail(args) {
    const { to, name = 'Yasir Aquil', customMessage = '' } = args;

    const subject = `Introduction - ${name}`;
    
    const body = `Dear Recipient,

I hope this email finds you well. I'm writing to introduce myself - I'm ${name}, and I wanted to reach out to connect with you.

${customMessage ? customMessage + '\n\n' : ''}I'm a software engineer with experience in various programming technologies including JavaScript, React, and web development. I'm always interested in discussing potential opportunities for collaboration or simply connecting professionally.

Thank you for your time, and I look forward to hearing from you.

Best regards,
${name}
${process.env.GMAIL_USER}`;

    return await this.sendEmail({ to, subject, body });
  }

  async checkGmailConfig() {
    console.error('checkGmailConfig - GMAIL_USER:', process.env.GMAIL_USER);
    console.error('checkGmailConfig - GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '[HIDDEN]' : 'undefined');
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return {
        content: [
          {
            type: 'text',
            text: `Missing environment variables: GMAIL_USER or GMAIL_APP_PASSWORD\n\nPlease check your .env file configuration.`,
          },
        ],
      };
    }

    try {
      const transporter = await this.createTransporter();
      await transporter.verify();
      
      return {
        content: [
          {
            type: 'text',
            text: `Gmail configuration is valid!\nEmail: ${process.env.GMAIL_USER}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Gmail configuration error: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Gmail MCP Server running on stdio');
  }
}

// Start the server
const server = new GmailMCPServer();
server.run().catch(console.error);
