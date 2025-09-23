import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import state from '../store/state';
import { message } from 'antd';

const Hero = () => {
    const navigate = useNavigate();
    const snap = useSnapshot(state);

    const handleBookAppointment = () => {
        if (!snap.currentUser) {
            message.warning('Please login to book an appointment');
            navigate('/login');
            return;
        }
        // If user is logged in, scroll to the availability section
        const availabilitySection = document.getElementById('availability');
        if (availabilitySection) {
            availabilitySection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="home" className="relative overflow-hidden" style={{
            background: 'linear-gradient(to bottom, #FFD58E, white, white)'
        }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1" style={{
                            backgroundColor: '#FFD58E',
                            color: '#54413C',
                            borderColor: '#FFD58E'
                        }}>
                            <span>Trusted Veterinary Care</span>
                        </div>
                        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: '#54413C' }}>
                            Caring for your pets with love and expertise
                        </h1>
                        <p className="mt-4 max-w-xl" style={{ color: '#333333' }}>
                            Book appointments, explore services, and keep your furry friends happy and healthy with our dedicated veterinary team.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={handleBookAppointment}
                                className="rounded-full px-6 py-3 text-white shadow-lg transition cursor-pointer" 
                                style={{
                                    backgroundColor: '#54413C',
                                    boxShadow: '0 4px 6px -1px rgba(84, 65, 60, 0.1), 0 2px 4px -1px rgba(84, 65, 60, 0.06)'
                                }}
                            >
                                Book Appointment
                            </button>
                            <a href="#services" className="rounded-full px-6 py-3 ring-1 transition" style={{
                                backgroundColor: 'white',
                                color: '#54413C',
                                borderColor: '#FFD58E'
                            }}>
                                Explore Services
                            </a>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative mx-auto w-full max-w-xl">
                            <div className="aspect-[4/3] rounded-3xl p-2 shadow-xl ring-1" style={{
                                backgroundColor: 'white',
                                boxShadow: '0 4px 10px rgba(84, 65, 60, 0.2)',
                                borderColor: '#FFD58E'
                            }}>
                                <div className="grid h-full w-full grid-cols-3 gap-2">
                                    <div className="col-span-2 rounded-2xl bg-[url('https://images.pexels.com/photos/32054246/pexels-photo-32054246.jpeg')] bg-cover bg-center" />
                                    <div className="rounded-2xl bg-[url('https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
                                    <div className="rounded-2xl bg-[url('https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
                                    <div className="col-span-2 rounded-2xl bg-[url('https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;