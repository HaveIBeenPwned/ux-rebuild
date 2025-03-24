# HIBP Email Breach Notification Template

This directory contains the HTML email template for the "Have I Been Pwned" service used to notify users when their email address is found in a data breach.

## Testing the Email Template

### 1. Using the test_template.js Script

The included `test_template.js` Node.js script makes it easy to test the template:

```bash
# Run the script
node test_template.js
```

This will generate a sample `output.html` file with all placeholders replaced with test data

You can modify the sample breach data in the script to test with different content.

### 2. Testing with Putsmail

To test how the email will render in various email clients:

1. Generate the sample email using the test script
2. Visit [Putsmail](https://putsmail.com/) (a free email testing tool)
3. Copy the content from the generated `output.html` file
4. Paste it into Putsmail's HTML editor
5. Send test emails to yourself at various email providers (Gmail, Outlook, etc.)
6. Check both desktop and mobile rendering

## Placeholder Variables

When implementing this template, replace these placeholders with actual data:

| Placeholder              | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| `##USER_EMAIL##`         | The recipient's email address (hidden for backend systems) |
| `##USER_EMAIL_DISPLAY##` | Formatted version of the email (Gmail-friendly)            |
| `##BREACH_NAME##`        | Name of the breached service/company                       |
| `##BREACH_DATE##`        | Date when the breach occurred                              |
| `##BREACH_ACCOUNTS##`    | Number of accounts affected                                |
| `##COMPROMISED_DATA##`   | Types of compromised data (emails, passwords, etc.)        |
| `##BREACH_DESCRIPTION##` | Description of the breach                                  |
| `##BREACH_NAME_SLUG##`   | URL-friendly version of the breach name for links          |

The template is optimized for both desktop and mobile clients
