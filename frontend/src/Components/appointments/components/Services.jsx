import React from 'react';

const services = [
  {
    title: 'Pet Checkups',
    description: 'Comprehensive wellness exams and preventative care for all pets.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 17.25 19.5H6.75A2.25 2.25 0 0 1 4.5 17.25V6.75A2.25 2.25 0 0 1 6.75 4.5z" />
      </svg>
    ),
  },
  {
    title: 'Surgery',
    description: 'Safe, modern surgical procedures with compassionate aftercare.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M4.5 3.75a.75.75 0 0 1 1.06 0l9.44 9.44a3 3 0 0 1 0 4.24l-2.69 2.69a3 3 0 0 1-4.24 0L2.81 12.38a.75.75 0 0 1 0-1.06l1.69-1.69 2.47 2.47a.75.75 0 0 0 1.06-1.06L5.56 8.56l3.19-3.19a.75.75 0 0 0 0-1.06L5.56 1.12 4.5 2.18 3.44 1.12l-1.06 1.06L4.5 3.75z" />
      </svg>
    ),
  },
  {
    title: 'Grooming',
    description: 'Keep coats shiny and paws tidy with gentle grooming services.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M6 12h12m-9 5.25h6" />
      </svg>
    ),
  },
  {
    title: 'Vaccinations',
    description: 'Up-to-date vaccines to protect against common pet illnesses.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M18.364 5.636a1.5 1.5 0 0 0-2.121 0l-1.061 1.061-1.414-1.414 1.06-1.06a3 3 0 1 1 4.243 4.243l-7.78 7.78a4.5 4.5 0 0 1-3.182 1.318H6v-2.091c0-1.193.474-2.338 1.318-3.182l7.78-7.78z" />
      </svg>
    ),
  },
];

const Services = () => {
  return (
    <section id="services" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#54413C' }}>Our Services</h2>
          <p className="mt-3" style={{ color: '#333333' }}>Everything your pet needs under one roof.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
              style={{
                borderColor: '#FFD58E',
                background: 'linear-gradient(to bottom, #FFD58E, white)',
              }}
            >
              <div
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                style={{
                  backgroundColor: 'white',
                  color: '#54413C',
                }}
              >
                {s.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold" style={{ color: '#54413C' }}>{s.title}</h3>
              <p className="mt-2 text-sm" style={{ color: '#333333' }}>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;