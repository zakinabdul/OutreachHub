/**
 * Utility functions for handling Kerala phone numbers and click-to-call / click-to-copy
 */

export function extractCallablePhone(rawPhone: string): string | null {
  if (!rawPhone || rawPhone.toLowerCase().includes('not listed')) {
    return null;
  }
  // Strip non-digit and non-plus characters
  const cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (cleaned.length < 7) return null;
  return cleaned;
}

export function isMobileForWhatsApp(rawPhone: string): string | null {
  if (!rawPhone || rawPhone.toLowerCase().includes('not listed')) {
    return null;
  }
  // Indian mobile numbers typically have 10 digits starting with 6, 7, 8, 9
  // +91 484 409 9399 is a landline (Kochi std code 0484)
  const digits = rawPhone.replace(/\D/g, '');
  let mobile10 = '';
  if (digits.length === 12 && digits.startsWith('91')) {
    mobile10 = digits.slice(2);
  } else if (digits.length === 10) {
    mobile10 = digits;
  }

  // Check if starts with 6, 7, 8, or 9
  if (mobile10.length === 10 && /^[6789]/.test(mobile10)) {
    return `91${mobile10}`;
  }
  return null;
}

export async function copyPhoneNumber(phoneText: string): Promise<boolean> {
  const cleanPhone = phoneText.replace(/\s+/g, ' ').trim();
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(cleanPhone);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard writeText failed, falling back', err);
  }

  // Fallback for older browsers or restricted iframe
  try {
    const textArea = document.createElement('textarea');
    textArea.value = cleanPhone;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
