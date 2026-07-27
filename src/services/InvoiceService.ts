import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../constants';
import { apiService } from './api';
import { tokenStorage } from './tokenStorage';
import { QueryBuilder } from './QueryBuilder';
import { Invoice, PaginationResponse } from '../models';

class InvoiceService {
  async getAll(params: { page?: number; limit?: number; search?: string } = {}): Promise<PaginationResponse<Invoice>> {
    const url = QueryBuilder.generateURL('/api/invoices')
      .setQueryParam('page', params.page)
      .setQueryParam('limit', params.limit)
      .setQueryParam('search', params.search)
      .build();
    return apiService.get<PaginationResponse<Invoice>>(url);
  }

  async getById(id: string): Promise<Invoice> {
    return apiService.get<Invoice>(`/api/invoices/${id}`);
  }

  /**
   * The backend has no `?order=` filter on GET /api/invoices, so looking up "the invoice for
   * this order" (when the viewer isn't the one who just confirmed it, e.g. re-opening an
   * already-confirmed order later) means paging through the invoice list client-side and
   * matching on the (possibly populated) `order` field. Fine at this app's scale; would need
   * a dedicated backend filter if the invoice volume grows large.
   */
  async findByOrderId(orderId: string): Promise<Invoice | null> {
    const result = await this.getAll({ limit: 200 });
    const match = result.docs.find((invoice) => {
      const orderRef = invoice.order as unknown;
      if (typeof orderRef === 'string') return orderRef === orderId;
      if (orderRef && typeof orderRef === 'object' && '_id' in orderRef) {
        return (orderRef as { _id: string })._id === orderId;
      }
      return false;
    });
    return match ?? null;
  }

  /**
   * Downloads the invoice PDF to local storage (with the Bearer auth header attached)
   * and returns the local file URI, ready to be shared via expo-sharing.
   *
   * Uses expo-file-system's SDK 57 File/Directory API (the pre-57 `downloadAsync`/
   * `cacheDirectory` free functions were removed in favor of `File.downloadFileAsync`).
   */
  async downloadPdf(id: string, fileName: string): Promise<string> {
    const token = await tokenStorage.getAccessToken();
    const destination = new File(Paths.cache, fileName);
    if (destination.exists) {
      destination.delete();
    }

    const file = await File.downloadFileAsync(`${API_URL}/api/invoices/${id}/pdf`, new Directory(Paths.cache), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      idempotent: true,
    });

    // downloadFileAsync names the file from response headers; rename to our chosen fileName.
    if (file.name !== fileName) {
      const renamed = new File(Paths.cache, fileName);
      if (renamed.exists) renamed.delete();
      await file.move(renamed);
    }
    return file.uri;
  }

  async sharePdf(localUri: string): Promise<void> {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      throw new Error('Sharing is not available on this device');
    }
    await Sharing.shareAsync(localUri, { mimeType: 'application/pdf' });
  }
}

export const invoiceService = new InvoiceService();
