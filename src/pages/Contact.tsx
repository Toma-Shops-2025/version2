import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>Back</Button>
      <div className="flex items-center gap-4 mb-6">
        <img 
          src="/tomabot-avatar.png" 
          alt="TomaBot AI Assistant" 
          className="w-16 h-16 rounded-full border-2 border-blue-200 shadow-lg"
        />
        <div>
          <h1 className="text-3xl font-bold">📞 Contact Us</h1>
          <p className="text-gray-600">Meet TomaBot, your AI assistant! 👋</p>
        </div>
      </div>
      <p className="mb-4">Have questions or need help? TomaBot and our support team are here 24/7.</p>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <img 
            src="/tomabot-avatar.png" 
            alt="TomaBot" 
            className="w-8 h-8 rounded-full"
          />
          <b className="text-blue-800">TomaBot AI Assistant</b>
        </div>
        <p className="text-sm text-blue-700 mb-2">💬 Chat with me anytime using the chat bubble in the bottom right corner!</p>
        <div className="text-sm">
          <b>TomaShops™ Support</b><br />
          <span>📧 Email: <a href="mailto:support@tomashops.com" className="text-blue-600 underline">support@tomashops.com</a></span><br />
          <span>📞 Phone: 954-TOMASHOPS<br /><small>(954) 866-2746</small></span>
        </div>
      </div>
      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-2">Contact Form:</h2>
      {submitted ? (
        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded text-green-800 font-semibold">Thank you for contacting us! We'll get back to you soon.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name:</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required autoComplete="name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Email:</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required autoComplete="email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Message:</label>
            <textarea name="message" value={form.message} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={4} required autoComplete="off" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Submit</button>
        </form>
      )}
    </div>
  );
};

export default Contact; 