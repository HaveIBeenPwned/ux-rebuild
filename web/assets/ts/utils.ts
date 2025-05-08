// This file contains utility functions for the web application.

import { Popover, Tooltip } from "bootstrap";

// Utility function to asynchronously wait for a specified number of milliseconds
export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function initializePopovers() {
  // Initialize all popovers
  const popoverTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
  [...popoverTriggerList].map((popoverTriggerEl) => new Popover(popoverTriggerEl));

  // Initialize all tooltips
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  [...tooltipTriggerList].map((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
}

// Extend the global Element and Document interfaces to include custom query methods
declare global {
  export interface Element {
    queryHtmlElements<T extends globalThis.Element>(selector: string): T[];
  }

  export interface Document {
    queryHtmlElements<T extends globalThis.Element>(selector: string): T[];
    getHtmlElementById<T extends HTMLElement>(id: string): T | null;
  }
}

Document.prototype.getHtmlElementById = function getHtmlElementById<T extends HTMLElement>(id: string): T | null {
  const element = document.getElementById(id);
  if (!element) {
    return null;
  }
  return element as T;
};

Document.prototype.queryHtmlElements = function queryHtmlElements<T extends globalThis.Element>(selector: string): T[] {
  const elements = document.querySelectorAll<T>(selector);
  return elements ? (Array.from(elements) as T[]) : [];
};

Element.prototype.queryHtmlElements = function queryHtmlElements<T extends globalThis.Element>(selector: string): T[] {
  const elements = this.querySelectorAll<T>(selector);
  return elements ? (Array.from(elements) as T[]) : [];
};
