# WhatsApp Message Sending Flow

## Overview
Message sending uses Kapso SDK with polling-based status tracking (no webhooks required).

## Files

### 1. Core SDK Integration
**`src/lib/kapso.ts`**
- Sends messages: `sendTextMessage()`, `sendTemplateMessage()`, `sendImageMessage()`, `sendDocumentMessage()`, `sendButtonMessage()`
- Queries status: `queryMessageStatus()` - polls Kapso API for message status updates

### 2. Database Schema
**`src/db/schema/whatsapp.ts`**
- `whatsappMessage` - stores sent messages with status
- `whatsappMessageStatus` - audit log of status changes

### 3. Notification System
**`src/lib/notifications/send-digest.ts`**
- Sends batch messages to opted-in users
- Stores `whatsappMessageId` returned by Kapso for tracking

**`src/lib/notifications/poll-message-status.ts`**
- Polls Kapso API for message status updates
- Updates database when status changes (sent → delivered → read)

### 4. API Routes
**`src/app/api/cron/recopilation/route.ts`**
- Cron job (3 AM UTC) to send daily digests

**`src/app/api/cron/poll-messages/route.ts`**
- Cron job to poll message status updates from Kapso API

### 5. User Actions
**`src/app/actions/update-phone.ts`**
- Updates user phone number and WhatsApp opt-in preference

## Flow

1. **Cron trigger** → `recopilation/route.ts` runs at 3 AM
2. **Send messages** → `send-digest.ts` sends to opted-in users via Kapso
3. **Store ID** → `whatsappMessageId` saved in database
4. **Poll status** → Separate cron job calls `poll-message-status.ts` periodically
5. **Update DB** → Status changes (delivered, read, failed) written to database

## Configuration

Only requires Kapso credentials (no Meta webhook setup):
- `KAPSO_API_KEY`
- `KAPSO_PHONE_NUMBER_ID`
