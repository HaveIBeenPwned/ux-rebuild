import { showReturnNotification } from "./dashboard_utils";

export function setupNotificationToggle() {
  const notificationsSwitch = document.getHtmlElementById<HTMLInputElement>("notificationsSwitch");
  const notificationStatus = document.getHtmlElementById<HTMLElement>("notificationStatus");
  const saveButton = document.getHtmlElementById<HTMLButtonElement>("saveNotificationPreferences");
  const notificationBadge = document.querySelector<HTMLElement>('a[href="#notifications"] .badge');
  const notificationEmail = document.getHtmlElementById<HTMLInputElement>("notificationEmail");
  const digestEmailCheck = document.getHtmlElementById<HTMLInputElement>("digestEmailCheck");

  // Initial form state
  let initialEmail = "";
  let initialDigestSetting = false;

  if (notificationEmail) {
    initialEmail = notificationEmail.value;
  }

  if (digestEmailCheck) {
    initialDigestSetting = digestEmailCheck.checked;
  }

  if (notificationsSwitch && notificationStatus && saveButton) {
    // When the switch is toggled
    notificationsSwitch.addEventListener("change", function () {
      if (this.checked) {
        notificationStatus.textContent = "On";
        notificationStatus.classList.remove("text-danger");
        notificationStatus.classList.add("text-success");
        enableSaveButton();
      } else {
        notificationStatus.textContent = "Off";
        notificationStatus.classList.remove("text-success");
        notificationStatus.classList.add("text-danger");
        enableSaveButton();
      }
    });

    // When the email is changed
    if (notificationEmail) {
      notificationEmail.addEventListener("input", () => {
        enableSaveButton();
      });
    }

    // When the digest setting is changed
    if (digestEmailCheck) {
      digestEmailCheck.addEventListener("change", () => {
        enableSaveButton();
      });
    }

    // When the save button is clicked
    saveButton.addEventListener("click", () => {
      // Here you would typically save the preferences to the server
      // For this demo, we'll just update the UI

      if (notificationsSwitch.checked) {
        if (notificationBadge) {
          notificationBadge.textContent = "On";
          notificationBadge.classList.remove("bg-danger");
          notificationBadge.classList.add("bg-success");
        }

        // Show a success message
        showReturnNotification("success", "Notifications enabled successfully.");
      } else {
        if (notificationBadge) {
          notificationBadge.textContent = "Off";
          notificationBadge.classList.remove("bg-success");
          notificationBadge.classList.add("bg-danger");
        }

        // Show a success message
        showReturnNotification("success", "Notifications disabled successfully.");
      }

      // Update the initial values
      if (notificationEmail) {
        initialEmail = notificationEmail.value;
      }

      if (digestEmailCheck) {
        initialDigestSetting = digestEmailCheck.checked;
      }

      // Disable the save button
      saveButton.setAttribute("disabled", "disabled");
    });
  }

  // Helper function to enable the save button
  function enableSaveButton() {
    if (saveButton) {
      const emailChanged = notificationEmail && notificationEmail.value !== initialEmail;
      const digestChanged = digestEmailCheck && digestEmailCheck.checked !== initialDigestSetting;

      if (emailChanged || digestChanged) {
        saveButton.removeAttribute("disabled");
      }
    }
  }
}
