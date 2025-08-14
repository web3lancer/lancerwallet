import Header from './components/landing/Header';
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import Footer from './components/landing/Footer';

export default function Landing() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
