export type CreatePublicInquiryPayload = {
  name: string;
  email: string;
  message: string;
  phone?: string;
  packageInterest?: string;
};

export async function submitPublicInquiry(payload: CreatePublicInquiryPayload) {
  void payload;
  throw new Error('Not implemented');
}
