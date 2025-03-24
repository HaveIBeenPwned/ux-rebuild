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

## Email Address Formatting for Gmail

### Why USER_EMAIL_DISPLAY is Important

The `##USER_EMAIL_DISPLAY##` placeholder serves a special purpose in the email template:

1. **Problem**: Gmail automatically converts email addresses to clickable blue links

   - This disrupts the design and makes email addresses stand out with blue color
   - It creates inconsistency with the rest of the white text in the email
   - It can draw attention away from more important action items

2. **Solution**: The `USER_EMAIL_DISPLAY` uses HTML formatting to prevent automatic linking
   - It splits the email address and uses HTML entities to break the pattern
   - It maintains the visual appearance of a standard email address
   - The email displays consistently with the intended styling (white text)

### How It Works

The `test_template.js` script includes a function that formats email addresses:

```javascript
function formatEmailForDisplay(email) {
  // Split the email address with spans to prevent Gmail auto-detection
  const [username, domain] = email.split("@");
  return `<span>${username}</span>&#64;<span>${domain}</span>`;
}
```

This transforms `user@example.com` into `<span>user</span>&#64;<span>example.com</span>`, which:

- Looks identical to the original email address when rendered
- Prevents Gmail from automatically styling it as a link
- Maintains consistent text appearance throughout the email

When implementing this template in your system, ensure that both placeholders are handled appropriately:

- `##USER_EMAIL##` - Use the original email for backend processing (hidden in the template)
- `##USER_EMAIL_DISPLAY##` - Use the formatted version for visible display to users

The template is optimized for both desktop and mobile clients
