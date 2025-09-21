import React from 'react';
import Header from '../Components/Header';

function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD58E 100%)', // White to Soft Peach gradient
      }}
    >
      <Header />
    </div>
  );
}

export default Home;