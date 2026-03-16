import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar, MapPin, User, MessageSquare, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface BookingFlowPageProps {
  packageData?: any;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

export function BookingFlowPage({ packageData, onNavigate, onBack }: BookingFlowPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    selectedPackage: packageData?.name || '',
    weddingDate: '',
    weddingLocation: '',
    brideName: '',
    groomName: '',
    email: '',
    phone: '',
    guestCount: '',
    additionalNotes: ''
  });

  const steps = [
    { number: 1, title: 'Select Package', icon: '📦' },
    { number: 2, title: 'Wedding Details', icon: '💒' },
    { number: 3, title: 'Your Information', icon: '👥' },
    { number: 4, title: 'Additional Info', icon: '📝' },
    { number: 5, title: 'Review & Confirm', icon: '✅' }
  ];

  const packages = [
    'Essential - $2,499',
    'Premium Photography - $3,999',
    'Premium Video - $4,499',
    'Luxury Package - $5,999',
    'Destination Wedding - $7,999'
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSuccess(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
            <CheckCircle className="size-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-serif text-gray-800 mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your booking! We've received your request and will contact you within 24 hours to confirm your wedding date and finalize the details.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            A confirmation email has been sent to {formData.email}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-medium"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-8 transition-colors"
        >
          <ChevronLeft className="size-5" />
          Back
        </button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="size-5" />
                    ) : (
                      <span className="text-lg">{step.icon}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 mt-2 text-center hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      currentStep > step.number ? 'bg-rose-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Step 1: Select Package */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-gray-800 mb-4">Select Your Package</h2>
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <label
                    key={pkg}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-400 transition-all"
                  >
                    <input
                      type="radio"
                      name="package"
                      value={pkg}
                      checked={formData.selectedPackage === pkg}
                      onChange={(e) =>
                        setFormData({ ...formData, selectedPackage: e.target.value })
                      }
                      className="size-4 text-rose-500"
                    />
                    <span className="ml-3 text-gray-700">{pkg}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Wedding Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-gray-800 mb-4">Wedding Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="size-4 text-rose-400" />
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="size-4 text-rose-400" />
                  Wedding Location
                </label>
                <input
                  type="text"
                  value={formData.weddingLocation}
                  onChange={(e) => setFormData({ ...formData, weddingLocation: e.target.value })}
                  placeholder="Venue name and city"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Guest Count
                </label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                  placeholder="Number of guests"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          )}

          {/* Step 3: Your Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-gray-800 mb-4">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bride's Name
                  </label>
                  <input
                    type="text"
                    value={formData.brideName}
                    onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groom's Name
                  </label>
                  <input
                    type="text"
                    value={formData.groomName}
                    onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-gray-800 mb-4">Additional Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="size-4 text-rose-400" />
                  Special Requests or Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  rows={6}
                  placeholder="Tell us about your vision, special moments you want captured, or any specific requirements..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-gray-800 mb-4">Review Your Booking</h2>
              <div className="space-y-4">
                <div className="bg-rose-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Package</h3>
                  <p className="text-gray-700">{formData.selectedPackage}</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Wedding Details</h3>
                  <p className="text-gray-700">Date: {formData.weddingDate}</p>
                  <p className="text-gray-700">Location: {formData.weddingLocation}</p>
                  <p className="text-gray-700">Guests: {formData.guestCount}</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Contact Information</h3>
                  <p className="text-gray-700">
                    {formData.brideName} & {formData.groomName}
                  </p>
                  <p className="text-gray-700">{formData.email}</p>
                  <p className="text-gray-700">{formData.phone}</p>
                </div>
                {formData.additionalNotes && (
                  <div className="bg-rose-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-2">Additional Notes</h3>
                    <p className="text-gray-700">{formData.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
            )}
            <button
              onClick={currentStep === 5 ? handleSubmit : handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-medium"
            >
              {currentStep === 5 ? 'Confirm Booking' : 'Next'}
              {currentStep < 5 && <ChevronRight className="size-4" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
