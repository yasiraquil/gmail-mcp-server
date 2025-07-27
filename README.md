# Gmail MCP Server
A custom MCP server for sending emails through Gmail.

## Features
- Send custom emails
- Send professional introduction emails
- Gmail configuration validation
- Support for both App Password and OAuth2 authentication
- HTML and text email support

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Gmail Authentication

#### Option A: App Password (Recommended for simplicity)

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security > 2-Step Verification (must be enabled)
3. Go to Security > 2-Step Verification > App passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Update your `.env` file:
   ```
   GMAIL_USER = example@example.com
   GMAIL_AUTH_METHOD=app_password
   GMAIL_APP_PASSWORD=your_16_character_password_here
   ```

#### Option B: OAuth2 (More secure, requires Google Cloud setup)

1. Create a project in Google Cloud Console
2. Enable Gmail API
3. Create OAuth2 credentials
4. Get refresh token
5. Update `.env` with OAuth2 credentials

### 3. Test the Server
```bash
npm start
```

### 4. Add to Claude MCP Config

Add this to your Claude MCP configuration file:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "node",
      "args": ["/Users/user/Desktop/gmail-mcp/index.js"],
      "cwd": "/Users/user/Desktop/gmail-mcp"
    }
  }
}
```
## Usage Examples

Once configured in Claude:

```
"Send an introduction email to yasiraqui211@gmail.com"
"Check if my Gmail configuration is working"
"Send an email to someone@example.com with subject 'Hello' and body 'Test message'"
```
