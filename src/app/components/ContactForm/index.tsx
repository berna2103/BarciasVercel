// src/app/components/ContactForm/index.tsx

'use client'
import React, { useState, useEffect } from 'react'
import { Send, CheckCircle, Loader2, X } from 'lucide-react';
// REMOVED: ReCAPTCHA import

// 1. Define the specific structure of the localization dictionary (dict.contact)
interface ContactDictionary {
  headline: string;
  subHeadline: string;
  form_name_label: string;
  form_business_name_label: string; // <--- NEW FIELD
  form_email_label: string;
  form_phone_label: string;
  form_type_label: string;
  form_select_default: string;
  form_type_plumbing: string;
  form_type_electrician: string;
  form_type_landscaping: string;
  form_type_junk: string;
  form_type_construction: string;
  form_type_other: string;
  submit_button: string;
  success_message: string;
  error_message: string;
  form_description_label: string;
  modal_title: string;
  modal_close_button: string;
  validation_email_error: string;
  validation_phone_error: string;
}

// 2. Define the component's props interface
interface ContactFormProps {
  dict: {
    contact: ContactDictionary;
  }; 
}

// Regular expressions for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

// 3. Apply the interface to the functional component
const ContactForm: React.FC<ContactFormProps> = ({ dict }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    businessName: '', // <--- NEW STATE
    email: '',
    phnumber: '',
    serviceType: '',
    description: ''
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showError, setShowError] = useState(false);
  const [loader, setLoader] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  
  // Validation state
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);


  const validateEmail = (email: string) => {
    if (email.trim() === '') return null;
    if (!emailRegex.test(email)) {
      return dict.contact.validation_email_error;
    }
    return null;
  };

  const validatePhone = (phone: string) => {
    if (phone.trim() === '') return null;
    if (!phoneRegex.test(phone)) {
      return dict.contact.validation_phone_error;
    }
    return null;
  };


  useEffect(() => {
    // 1. Check if all required fields are filled (basic check)
    const allRequiredFilled = [
      formData.firstname,
      formData.businessName, // <--- CHECK NEW FIELD
      formData.email,
      formData.phnumber,
      formData.serviceType,
      formData.description, // <--- Check description as required
    ].every((value) => value.trim() !== '');

    // 2. Perform format validation checks
    const emailFormatError = validateEmail(formData.email);
    const phoneFormatError = validatePhone(formData.phnumber);

    // Update validation error states
    setEmailError(emailFormatError);
    setPhoneError(phoneFormatError);
    
    // 3. Set overall form validity
    const isFormatValid = !emailFormatError && !phoneFormatError;
    
    setIsFormValid(allRequiredFilled && isFormatValid);
  }, [formData, dict]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // --- PHONE NUMBER MASKING LOGIC ---
    if (name === 'phnumber') {
      // 1. Strip all non-digit characters
      const digits = value.replace(/\D/g, '');
      
      // 2. Limit to 10 digits
      const limitedDigits = digits.substring(0, 10);
      
      // 3. Apply the formatting: (XXX) XXX-XXXX
      let formattedValue = limitedDigits;
      if (limitedDigits.length > 6) {
        formattedValue = `(${limitedDigits.substring(0, 3)}) ${limitedDigits.substring(3, 6)}-${limitedDigits.substring(6, 10)}`;
      } else if (limitedDigits.length > 3) {
        formattedValue = `(${limitedDigits.substring(0, 3)}) ${limitedDigits.substring(3, 6)}`;
      } else if (limitedDigits.length > 0) {
        formattedValue = `(${limitedDigits.substring(0, 3)}`;
      }
      
      // Update state with the formatted value
      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedValue,
      }));
      
    } else {
      // Handle all other fields
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
    
    setShowError(false);
  }

  const resetForm = () => {
    setFormData({
      firstname: '',
      businessName: '', // <--- CLEAR NEW FIELD
      email: '',
      phnumber: '',
      serviceType: '',
      description: ''
    });
    // Reset errors explicitly
    setEmailError(null);
    setPhoneError(null);
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Re-check validation just before submission
    if (!isFormValid) {
        // Trigger visual errors if needed, but the button should be disabled
        return;
    }

    setLoader(true);
    setShowSuccessModal(false);
    setShowError(false);
    
    try {
      const response = await fetch('/api/send/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: formData.firstname,
          BusinessName: formData.businessName, // <--- INCLUDE NEW FIELD IN PAYLOAD
          Email: formData.email,
          PhoneNo: formData.phnumber.replace(/\D/g, ''), // Send digits only for backend consistency
          ServiceType: formData.serviceType,
          Description: formData.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        resetForm();
      } else {
        console.error('Error sending email:', data.message || 'Unknown error');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setLoader(false);
    }
  };

  // Success Modal Component
  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 m-4 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckCircle size={24} />
            {dict.contact.modal_title}
          </h3>
          <button 
            onClick={() => setShowSuccessModal(false)} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
          {dict.contact.success_message}
        </p>
        <button
          onClick={() => setShowSuccessModal(false)}
          className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          {dict.contact.modal_close_button}
        </button>
      </div>
    </div>
  );

  return (
    <section id='contact' className='scroll-mt-12 bg-gray-50 dark:bg-gray-900 py-16'>
      <div className='max-w-4xl mx-auto px-4'>
        {showSuccessModal && <SuccessModal />}
        
        <div className='relative'>
          <h2 className='mb-3 text-3xl font-bold text-center text-gray-800 dark:text-white'>{dict.contact.headline}</h2>
          <p className='text-lg font-normal max-w-lg mx-auto my-6 text-center text-primary dark:text-primary/80'>
            {dict.contact.subHeadline}
          </p>
          <div className='relative p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700'>
            
            {/* Error Notification Banner */}
            {showError && (
                <div 
                    className={`absolute -top-10 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity duration-300 flex items-center gap-2 shadow-lg bg-red-500 text-white`
                    }>
                    <span className="flex items-center gap-2"><Send size={18} className="rotate-180" /> {dict.contact.error_message}</span>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-x-6 -mx-3'>
              
              {/* NAME FIELD (Updated to span 1 column) */}
              <div className='w-full px-3'>
                <div className='my-2.5'>
                  <label htmlFor='fname' className='pb-2 inline-block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {dict.contact.form_name_label}
                  </label>
                  <input
                    id='fname'
                    type='text'
                    name='firstname'
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder='John Doe'
                    required
                    className='w-full text-base px-4 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2.5 transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none'
                  />
                </div>
              </div>
              
              {/* BUSINESS NAME FIELD (NEW FIELD, spans 1 column) */}
              <div className='w-full px-3'>
                <div className='my-2.5'>
                  <label htmlFor='bname' className='pb-2 inline-block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {dict.contact.form_business_name_label}
                  </label>
                  <input
                    id='bname'
                    type='text'
                    name='businessName'
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder='Doe Plumbing & HVAC'
                    required
                    className='w-full text-base px-4 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2.5 transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none'
                  />
                </div>
              </div>

              {/* EMAIL FIELD */}
              <div className='w-full px-3'>
                <div className='my-2.5'>
                  <label htmlFor='email' className='pb-2 inline-block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {dict.contact.form_email_label}
                  </label>
                  <input
                    id='email'
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='john.doe@example.com'
                    required
                    className={`w-full text-base px-4 rounded-lg border py-2.5 transition-all duration-300 focus:ring-1 focus:outline-none 
                      ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white'}`
                    }
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>
              </div>

              {/* PHONE FIELD */}
              <div className='w-full px-3'>
                <div className='my-2.5'>
                  <label htmlFor='Phnumber' className='pb-2 inline-block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {dict.contact.form_phone_label}
                  </label>
                  <input
                    id='Phnumber'
                    type='tel'
                    name='phnumber'
                    placeholder='(123) 456-7890'
                    value={formData.phnumber}
                    onChange={handleChange}
                    required
                    className={`w-full text-base px-4 py-2.5 rounded-lg border transition-all duration-300 focus:ring-1 focus:outline-none 
                      ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white'}`
                    }
                  />
                  {/* Note: phoneError will only show if the user manually breaks the format, which is hard due to masking */}
                  {phoneError && formData.phnumber.length > 0 && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>
              </div>

              {/* SERVICE TYPE DROPDOWN */}
              <div className='md:col-span-2 px-3'>
                <div className='my-2.5 relative'>
                  <label htmlFor='serviceType' className='pb-2 inline-block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {dict.contact.form_type_label}
                  </label>
                  <select
                      id='serviceType'
                      name='serviceType'
                      value={formData.serviceType}
                      onChange={handleChange}
                      required
                      className='w-full text-base px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none pr-10'
                  >
                      <option value="" disabled>{dict.contact.form_select_default}</option>
                      <option value="Plumbing/HVAC">{dict.contact.form_type_plumbing}</option>
                      <option value="Electrician">{dict.contact.form_type_electrician}</option>
                      <option value="Landscaping/Lawn Care">{dict.contact.form_type_landscaping}</option>
                      <option value="Junk Removal">{dict.contact.form_type_junk}</option>
                      <option value="Construction Subcontractor">{dict.contact.form_type_construction}</option>
                      <option value="Other Trade Service">{dict.contact.form_type_other}</option>
                  </select>
                  {/* Custom arrow for select dropdown */}
                  <div className="pointer-events-none absolute inset-y-0 right-3 top-9 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* GENERAL INQUIRY TEXTAREA (REQUIRED) */}
              <div className='md:col-span-2 px-3'>
                <div className='my-2.5'>
                  <label htmlFor='description' className='pb-2 inline-block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {dict.contact.form_description_label}
                  </label>
                  <textarea
                    id='description'
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    placeholder='Describe your specific request or project details here (optional).'
                    rows={4}
                    required={true}
                    className='w-full text-base px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y'
                  />
                </div>
              </div>
              
              {/* SUBMIT BUTTON */}
              <div className='md:col-span-2 mt-6 mb-2.5 w-full px-3'>
                <button
                  type='submit'
                  disabled={!isFormValid || loader}
                  className={`w-full inline-flex justify-center items-center gap-2 leading-none px-6 text-lg font-semibold py-3.5 rounded-lg shadow-lg transition-all duration-300 
                    ${
                      !isFormValid || loader
                        ? 'bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90'
                    }`}>
                  {loader ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {dict.contact.submit_button}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactForm