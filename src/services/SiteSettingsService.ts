import { API_URL } from '../constants';
import { apiService } from './api';
import type { CtaSection, DecorsSection, HeroSection, I18nText, SiteSettings, StrengthsSection } from '../models';

export type UpdateSiteSettingsPayload = {
  hero?: Partial<HeroSection>;
  strengthsSection?: Partial<StrengthsSection>;
  decorsSection?: Partial<DecorsSection>;
  cta?: Partial<CtaSection>;
};

type PickedImage = { uri: string; name: string; type: string };

class SiteSettingsService {
  async get(): Promise<SiteSettings> {
    return apiService.get<SiteSettings>('/api/site-settings');
  }

  async update(payload: UpdateSiteSettingsPayload): Promise<SiteSettings> {
    return apiService.patch<SiteSettings>('/api/site-settings', payload);
  }

  async setHeroMainImage(image: PickedImage): Promise<SiteSettings> {
    return this.uploadImage('/api/site-settings/hero/main-image', image);
  }

  async setHeroAccentImage(image: PickedImage): Promise<SiteSettings> {
    return this.uploadImage('/api/site-settings/hero/accent-image', image);
  }

  async addStrength(text: I18nText): Promise<SiteSettings> {
    return apiService.post<SiteSettings>('/api/site-settings/strengths', { text });
  }

  async updateStrength(itemId: string, text: I18nText): Promise<SiteSettings> {
    return apiService.patch<SiteSettings>(`/api/site-settings/strengths/${itemId}`, { text });
  }

  async removeStrength(itemId: string): Promise<SiteSettings> {
    return apiService.delete<SiteSettings>(`/api/site-settings/strengths/${itemId}`);
  }

  async addDecor(title: I18nText): Promise<SiteSettings> {
    return apiService.post<SiteSettings>('/api/site-settings/decors', { title });
  }

  async updateDecor(itemId: string, title: I18nText): Promise<SiteSettings> {
    return apiService.patch<SiteSettings>(`/api/site-settings/decors/${itemId}`, { title });
  }

  async removeDecor(itemId: string): Promise<SiteSettings> {
    return apiService.delete<SiteSettings>(`/api/site-settings/decors/${itemId}`);
  }

  async setDecorImage(itemId: string, image: PickedImage): Promise<SiteSettings> {
    return this.uploadImage(`/api/site-settings/decors/${itemId}/image`, image);
  }

  private async uploadImage(url: string, image: PickedImage): Promise<SiteSettings> {
    const formData = new FormData();
    formData.append('image', { uri: image.uri, name: image.name, type: image.type } as unknown as Blob);
    return apiService.post<SiteSettings>(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  }

  /** Prefixes a relative image path returned by the API with the API base URL. */
  resolveImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

export const siteSettingsService = new SiteSettingsService();
