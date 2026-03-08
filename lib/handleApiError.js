/**
 * Parse API error response and return a user-friendly message.
 * Handles 403 ownership errors from the backend constraint.
 */
export async function parseApiError(response) {
  if (response.status === 403) {
    // Try to parse detail from body
    try {
      const text = await response.text();
      // Backend wraps the message: {"error":"{\"detail\":\"Request forbidden...\"}}
      // or plain {"detail": "..."}
      let detail = '';
      try {
        const outer = JSON.parse(text);
        if (outer.error) {
          const inner = JSON.parse(outer.error);
          detail = inner.detail || '';
        } else {
          detail = outer.detail || '';
        }
      } catch {
        detail = text;
      }

      if (
        detail.toLowerCase().includes('forbidden') ||
        detail.toLowerCase().includes('authorization will not help')
      ) {
        return 'Anda tidak memiliki izin untuk mengubah atau menghapus konten ini. Hanya pemilik konten atau superuser yang dapat melakukan tindakan ini.';
      }
    } catch {
      // ignore parse errors
    }
    return 'Akses ditolak (403). Anda tidak memiliki izin untuk tindakan ini.';
  }

  if (response.status === 401) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }

  // Generic error
  try {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data.message || data.detail || `Gagal (${response.status})`;
    } catch {
      return text || `Gagal (${response.status})`;
    }
  } catch {
    return `Gagal (${response.status})`;
  }
}
