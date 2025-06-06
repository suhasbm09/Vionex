import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full px-4 pb-6 mt-20">
      <div className="mx-auto max-w-full text-center glass rounded-2xl shadow-xl py-6 px-10 border border-white/10 backdrop-blur-md bg-gradient-to-br from-white/5 via-white/10 to-white/5">
        <p className="text-base text-white/80 tracking-wide">
          © {new Date().getFullYear()}{' '}
          <span className="text-white font-bold">Vionex</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
