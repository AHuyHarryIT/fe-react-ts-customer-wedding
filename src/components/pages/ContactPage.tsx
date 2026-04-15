import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { submitPublicInquiry } from '@/services/contactService';

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  packageInterest: string;
  message: string;
};

type SubmissionState = 'idle' | 'submitting' | 'success' | 'failure';

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  packageInterest: '',
  message: '',
};

export function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');

  const nameId = 'contact-name';
  const emailId = 'contact-email';
  const phoneId = 'contact-phone';
  const packageInterestId = 'contact-package-interest';
  const messageId = 'contact-message';

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (submissionState !== 'submitting') {
      setSubmissionState('idle');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submissionState === 'submitting') {
      return;
    }

    setSubmissionState('submitting');

    try {
      await submitPublicInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        phone: formData.phone.trim() || undefined,
        packageInterest: formData.packageInterest || undefined,
      });

      setSubmissionState('success');
      setFormData(initialFormData);
      toast.success('Inquiry sent successfully.');
    } catch {
      setSubmissionState('failure');
      toast.error("We couldn't send your inquiry. Please try again.");
    }
  };

  const submitLabel =
    submissionState === 'submitting'
      ? 'Sending...'
      : submissionState === 'failure'
        ? 'Try Again'
        : 'Send Message';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">Get In Touch</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? Share your wedding details and our studio team will follow up with
            package guidance and availability.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-rose-100 rounded-full">
                  <Phone className="size-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Phone</h3>
                  <p className="text-gray-600">+84 (555) 123-4567</p>
                  <p className="text-sm text-gray-500 mt-1">Mon-Fri 9am-6pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-rose-100 rounded-full">
                  <Mail className="size-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Email</h3>
                  <p className="text-gray-600">studiohamy@gmail.com</p>
                  <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-rose-100 rounded-full">
                  <MapPin className="size-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Studio</h3>
                  <p className="text-gray-600">123 Wedding Lane</p>
                  <p className="text-gray-600">Love City, CA 90210</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-100 rounded-full">
                  <Clock className="size-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Office Hours</h3>
                  <p className="text-gray-600">Monday - Friday</p>
                  <p className="text-gray-600">9:00 AM - 6:00 PM</p>
                  <p className="text-gray-600 mt-2">Saturday</p>
                  <p className="text-gray-600">10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="aspect-square bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="size-12 text-rose-400 mx-auto mb-2" />
                  <p className="text-gray-600">Map View</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-serif text-gray-800 mb-2">Send Us a Message</h2>
              <p className="text-sm text-gray-600 mb-6">
                We review every inquiry and follow up within 24 hours.
              </p>

              {submissionState === 'success' && (
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                  Thanks for reaching out! We will follow up within 24 hours.
                </div>
              )}

              {submissionState === 'failure' && (
                <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                  <p className="font-medium">We couldn't send your inquiry right now.</p>
                  <p className="text-sm">Please try again in a moment.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor={nameId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Your Name *
                    </label>
                    <input
                      id={nameId}
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      placeholder="John & Jane Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={emailId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      id={emailId}
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor={phoneId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id={phoneId}
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      placeholder="+84 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={packageInterestId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Package Interest
                    </label>
                    <select
                      id={packageInterestId}
                      name="packageInterest"
                      value={formData.packageInterest}
                      onChange={(e) => updateField('packageInterest', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="">Select a package</option>
                      <option value="Essential">Essential</option>
                      <option value="Premium">Premium</option>
                      <option value="Destination">Destination</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={messageId}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id={messageId}
                    name="message"
                    required
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                    placeholder="Tell us about your wedding plans, questions, or how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submissionState === 'submitting'}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Send className="size-5" />
                  {submitLabel}
                </button>
              </form>
            </div>

            <div className="mt-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8">
              <h3 className="text-xl font-medium text-gray-800 mb-4">Quick Answers</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">When should I book?</h4>
                  <p className="text-sm text-gray-600">
                    We recommend booking 9-12 months in advance, especially for peak wedding season
                    (May-October).
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Do you travel for weddings?</h4>
                  <p className="text-sm text-gray-600">
                    Yes! We offer destination wedding packages and love to travel. Contact us for
                    details.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">
                    How long until I receive my photos?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Your fully edited gallery will be ready within 4-6 weeks after your wedding day.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
