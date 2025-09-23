import React from 'react';

const Contact = () => {

  const inputBase = 'mt-1 w-full rounded-lg border focus:outline-none transition';

  return (
    <section id="contact" className="py-16 sm:py-20" style={{ background: 'linear-gradient(to bottom, #FFD58E, white)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#54413C' }}>Contact Us</h2>
            <p className="mt-4" style={{ color: '#333333' }}>We’d love to hear from you. Reach out with questions or to schedule a visit.</p>
            <div className="mt-6 space-y-3" style={{ color: '#54413C' }}>
              <p><span className="font-semibold">Phone:</span> (555) 123-4567</p>
              <p><span className="font-semibold">Email:</span> hello@pawcare.com</p>
              <p><span className="font-semibold">Address:</span> 123 Pet Lane, Happy Town</p>
              <p><span className="font-semibold">Hours:</span> Mon–Sat: 9am–6pm</p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <form className="rounded-2xl border p-6 shadow-sm" style={{ borderColor: '#FFD58E', backgroundColor: 'white' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium" style={{ color: '#54413C' }}>Full name</label>
                  <input
                    name="name"
                    type="text"
                    className={`${inputBase}`}
                    style={{ borderColor: '#FFD58E', padding: '0.5rem 0.75rem', color: '#54413C' }}
                  />
                  <p className={`mt-1 text-xs`} style={{ color: '#333333' }}></p>
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: '#54413C' }}>Email address</label>
                  <input
                    name="email"
                    type="email"
                    className={`${inputBase}`}
                    style={{ borderColor: '#FFD58E', padding: '0.5rem 0.75rem', color: '#54413C' }}
                  />
                  <p className={`mt-1 text-xs`} style={{ color: '#333333' }}></p>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium" style={{ color: '#54413C' }}>Message</label>
                <textarea
                  name="message"
                  rows="5"
                  className={`${inputBase}`}
                  style={{ borderColor: '#FFD58E', padding: '0.5rem 0.75rem', color: '#54413C' }}
                ></textarea>
                <div className="mt-1 flex items-center justify-between">
                  <p className={`text-xs`} style={{ color: '#333333' }}></p>
                  <span className="text-xs" style={{ color: '#333333' }}></span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#333333' }}>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full ring-1" style={{ backgroundColor: '#FFD58E', color: '#54413C', borderColor: '#54413C' }}>
                    ✓
                  </span>
                  We typically respond within 1 business day.
                </div>
                <button
                  type="submit"
                  className="rounded-full px-6 py-3 text-white shadow-md transition"
                  style={{ backgroundColor: '#54413C', boxShadow: '0 4px 6px -1px rgba(84, 65, 60, 0.1), 0 2px 4px -1px rgba(84, 65, 60, 0.06)' }}
                >
                  Send message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;