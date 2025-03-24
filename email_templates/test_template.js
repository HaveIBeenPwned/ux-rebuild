/**
 * Test script for the breach notification email template
 * This script demonstrates how to fill in the template placeholders with actual data
 *
 * How to use:
 * 1. Install Node.js if not already installed
 * 2. Run this script: `node test_template.js`
 * 3. It will create a filled-in version of the email template in output.html
 */

const fs = require("fs");
const path = require("path");

// Path to the email template
const templatePath = path.join(__dirname, "breach_notification.html");

// Format email to prevent Gmail auto-linking
function formatEmailForDisplay(email) {
  // Split the email address with spans to prevent Gmail auto-detection
  const [username, domain] = email.split("@");
  return `<span>${username}</span>&#64;<span>${domain}</span>`;
}

// Sample breach data (for testing purposes)
const breachData = {
  USER_EMAIL: "user@example.com",
  USER_EMAIL_DISPLAY: formatEmailForDisplay("user@example.com"),
  BREACH_NAME: "LinkedIn",
  BREACH_DATE: "June 5, 2012",
  BREACH_ACCOUNTS: "164 million",
  COMPROMISED_DATA:
    "Email addresses, Passwords (SHA1 hashes without salt), User names",
  BREACH_DESCRIPTION:
    "In 2012, LinkedIn suffered a data breach that exposed the stored credentials of 164 million users. The passwords were stored as SHA1 hashes without salt, making them easily crackable. The data remained out of sight until being offered for sale on a dark market site 4 years later.",
  BREACH_NAME_SLUG: "linkedin",
};

// Read the template file
try {
  let templateContent = fs.readFileSync(templatePath, "utf8");

  // Replace all placeholders with the actual data
  Object.keys(breachData).forEach((key) => {
    const placeholder = new RegExp(`##${key}##`, "g");
    templateContent = templateContent.replace(placeholder, breachData[key]);
  });

  // Write the processed template to an output file
  const outputPath = path.join(__dirname, "output.html");
  fs.writeFileSync(outputPath, templateContent);

  console.log(`Success! View the filled template at: ${outputPath}`);
} catch (error) {
  console.error("Error processing the template:", error);
}
