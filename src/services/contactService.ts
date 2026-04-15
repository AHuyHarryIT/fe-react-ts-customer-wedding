import { api } from './apiClient';
import type { ApiEnvelope } from '@/types/api';

export type CreatePublicInquiryPayload = {
  name: string;
  email: string;
  message: string;
  phone?: string;
  packageInterest?: string;
};

export type PublicInquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  phone: string | null;
  packageInterest: string | null;
  createdAt: string;
  updatedAt: string;
};

type InquiryEnvelope = ApiEnvelope<PublicInquiry>;

type SubmitPublicInquiryResponse = ApiEnvelope<PublicInquiry | InquiryEnvelope>;

const isPublicInquiry = (value: unknown): value is PublicInquiry => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PublicInquiry>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.message === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
};

const normalizeInquiryPayload = (payload: unknown): PublicInquiry => {
  if (isPublicInquiry(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nestedPayload = (payload as InquiryEnvelope).data;

    if (isPublicInquiry(nestedPayload)) {
      return nestedPayload;
    }
  }

  throw new Error('Public inquiry response did not include inquiry data.');
};

export async function submitPublicInquiry(
  payload: CreatePublicInquiryPayload
): Promise<PublicInquiry> {
  const response = await api.post<SubmitPublicInquiryResponse>('/public-inquiries', payload);

  return normalizeInquiryPayload(response.data?.data);
}
