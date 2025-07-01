import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">📞 Contact Us</h1>
      <p className="mb-2">Have questions or need help? We're here 24/7.</p>
      <div className="mb-4">
        <b>TomaShops™ Support</b><br />
        <span>📧 Email: <a href="mailto:support@tomashops.com" className="text-blue-600 underline">support@tomashops.com</a></span><br />
        <span>📞 Phone: 954-TOMASHOPS<br /><small>(954) 866-2746</small></span>
      </div>
      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-2">Contact Form:</h2>
      {submitted ? (
        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded text-green-800 font-semibold">Thank you for contacting us! We'll get back to you soon.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name:</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Email:</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Message:</label>
            <textarea name="message" value={form.message} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={4} required />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Submit</button>
        </form>
      )}
    </div>
  );
};

export default Contact; 