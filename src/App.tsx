import { Menu, X, Phone, Mail, MapPin, Paintbrush, Package, Wallpaper, Hammer, Calendar, Star, ChevronLeft, ChevronRight, Upload, FileImage, Home, Info } from 'lucide-react';
import { useState, useRef } from 'react';
import { AnimatedTabs } from './components/ui/animated-tabs';
import { ScrollLegend } from './components/ui/scroll-legend';
import InteractiveSelector from './components/ui/interactive-selector';
import { supabase } from './lib/supabase';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{file: File, preview: string | null}[]>([]);

  const totalSlides = 5;

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const nextIndex = (currentSlide + 1) % totalSlides;
    setCurrentSlide(nextIndex);
    setTimeout(() => setIsAnimating(false), 100);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    setCurrentSlide(prevIndex);
    setTimeout(() => setIsAnimating(false), 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);

      const newPreviews = newFiles.map(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFilePreviews(prev => {
              const index = prev.findIndex(p => p.file === file);
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = { file, preview: reader.result as string };
                return updated;
              }
              return [...prev, { file, preview: reader.result as string }];
            });
          };
          reader.readAsDataURL(file);
          return { file, preview: null };
        } else if (file.type.startsWith('video/')) {
          return { file, preview: URL.createObjectURL(file) };
        } else {
          return { file, preview: null };
        }
      });

      setFilePreviews(prev => [...prev, ...newPreviews]);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    setFormMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const firstName = formData.get('firstName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const message = formData.get('message') as string;

    const digitsOnly = phoneNumber.replace(/\D/g, '');

    if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
      setFormStatus('error');
      setFormMessage('Please enter a valid 10-digit phone number or 11-digit number with country code.');
      setTimeout(() => {
        setFormStatus('idle');
        setFormMessage('');
      }, 5000);
      return;
    }

    if (digitsOnly.length === 11 && !phoneNumber.includes('+')) {
      setFormStatus('error');
      setFormMessage('11-digit phone numbers must include a + for the country code.');
      setTimeout(() => {
        setFormStatus('idle');
        setFormMessage('');
      }, 5000);
      return;
    }

    try {
      const attachments = [];

      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('form-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('form-attachments')
          .getPublicUrl(filePath);

        attachments.push({
          url: publicUrl,
          name: file.name,
          type: file.type
        });
      }

      const { error } = await supabase
        .from('form_submissions')
        .insert([
          {
            first_name: firstName,
            phone_number: phoneNumber,
            message: message,
            attachments: attachments
          }
        ]);

      if (error) {
        throw error;
      }

      setFormStatus('success');
      setFormMessage('Thank you! Your message has been sent successfully.');

      if (form) {
        form.reset();
      }
      setSelectedFiles([]);
      setFilePreviews([]);

      setTimeout(() => {
        setFormStatus('idle');
        setFormMessage('');
      }, 5000);
    } catch (error) {
      setFormStatus('error');
      setFormMessage('Sorry, there was an error sending your message. Please try again.');
      console.error('Error submitting form:', error);

      setTimeout(() => {
        setFormStatus('idle');
        setFormMessage('');
      }, 5000);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide();
    }
    if (touchEndX.current - touchStartX.current > 50) {
      prevSlide();
    }
  };

  const services = [
    {
      icon: Paintbrush,
      title: 'Painting',
      description: 'Professional interior and exterior painting services with premium quality finishes that transform your space.'
    },
    {
      icon: Package,
      title: 'Cabinet Transformations',
      description: 'Breathe new life into your kitchen and bathroom cabinets with expert refinishing and color updates.'
    },
    {
      icon: Hammer,
      title: 'Wood Finishing',
      description: 'Custom wood staining, sealing, and finishing services to enhance and protect your woodwork.'
    },
    {
      icon: Wallpaper,
      title: 'Wallpaper',
      description: 'Professional wallpaper installation and removal services to create stunning accent walls and complete room makeovers.'
    }
  ];

  const legendItems = [
    { id: "home", name: "Home", icon: <Home className="w-4 h-4" /> },
    { id: "services", name: "Services", icon: <Paintbrush className="w-4 h-4" /> },
    { id: "about", name: "About", icon: <Info className="w-4 h-4" /> },
    { id: "contact", name: "Contact", icon: <Mail className="w-4 h-4" /> },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    scrollToSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <ScrollLegend items={legendItems} />

      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img src="/Images/Karmatic Painting Logo.svg" alt="Karmatic Painting" className="h-20" />
            </div>

            <div className="hidden md:flex space-x-8">
              <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="text-gray-700 hover:text-gray-900 transition-colors">Home</a>
              <a href="#services" onClick={(e) => handleNavClick(e, 'services')} className="text-gray-700 hover:text-gray-900 transition-colors">Services</a>
              <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="text-gray-700 hover:text-gray-900 transition-colors">About</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
            </div>

            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#home" className="block text-gray-700 hover:text-gray-900 transition-colors" onClick={(e) => handleNavClick(e, 'home')}>Home</a>
              <a href="#services" className="block text-gray-700 hover:text-gray-900 transition-colors" onClick={(e) => handleNavClick(e, 'services')}>Services</a>
              <a href="#about" className="block text-gray-700 hover:text-gray-900 transition-colors" onClick={(e) => handleNavClick(e, 'about')}>About</a>
              <a href="#contact" className="block text-gray-700 hover:text-gray-900 transition-colors" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
            </div>
          </div>
        )}
      </header>

      <main className="overflow-x-hidden">
        <section id="home" className="pt-32 pb-20 px-4 bg-gray-50 overflow-x-hidden overflow-y-visible w-full">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-3 md:gap-12 items-center w-full">
              <div className="w-full px-2 md:px-0">
                <div className="bg-blue-100 text-[#1d4ed8] px-3 py-2 rounded-full text-xs sm:text-sm font-medium mb-6 max-w-full text-center md:text-left mx-auto md:mx-0 w-fit">
                  Servicing Calgary & Surrounding Areas
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold text-gray-900 mb-8 md:mb-12 w-full leading-tight break-words text-center md:text-left">
                  Professional Painting<br className="hidden md:block" /> Services Done Right
                </h1>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                  <a
                    href="#contact"
                    className="relative flex items-center justify-center bg-[#1d4ed8] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg w-full sm:w-auto"
                  >
                    <Phone className="absolute left-4 sm:static w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 sm:mr-2" />
                    <div className="text-center md:text-left">
                      <div className="text-base sm:text-sm font-bold">Call Now</div>
                      <div className="text-[10px] sm:text-xs opacity-90">(403) 542-7553</div>
                    </div>
                  </a>
                  <a
                    href="#contact"
                    onClick={(e) => handleNavClick(e, 'contact')}
                    className="relative flex items-center justify-center bg-[#1C325C] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#152747] transition-all shadow-lg w-full sm:w-auto"
                  >
                    <Calendar className="absolute left-4 sm:static w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 sm:mr-2" />
                    <div className="text-center md:text-left">
                      <div className="text-base sm:text-sm font-bold">Schedule Service</div>
                      <div className="text-[10px] sm:text-xs opacity-90">Talk To Me</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="relative w-full max-w-full overflow-hidden px-0">
                <div
                  className="w-full flex items-center justify-center mb-2 sm:mb-0"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <InteractiveSelector
                    activeIndex={currentSlide}
                    onActiveIndexChange={setCurrentSlide}
                  />
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-2 sm:gap-4 mt-8">
              <button
                onClick={prevSlide}
                disabled={isAnimating}
                className="flex items-center gap-1 sm:gap-2 bg-[#1d4ed8] hover:bg-blue-700 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base text-white shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                onClick={nextSlide}
                disabled={isAnimating}
                className="flex items-center gap-1 sm:gap-2 bg-[#1d4ed8] hover:bg-blue-700 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base text-white shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-6 sm:mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimating) {
                      setCurrentSlide(index);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-[#1d4ed8] w-8' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1C325C] via-[#1e3a6a] to-[#1C325C] w-full">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Services</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Comprehensive painting and finishing solutions tailored to your needs
              </p>
            </div>

            <div className="flex justify-center w-full">
              <AnimatedTabs
                tabs={services.map((service, index) => ({
                  id: `service-${index}`,
                  label: service.title,
                  content: (
                    <div className="flex flex-col gap-4 w-full h-full">
                      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8 w-full">
                        {index === 0 ? (
                          <div className="rounded-lg overflow-hidden w-full max-w-xs aspect-square md:w-64 md:h-64 md:aspect-auto flex-shrink-0 mx-auto md:mx-0 bg-[#D4C5B0]">
                            <img
                              src="/Services Images/Paint Can.png"
                              alt="Painting"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : index === 1 ? (
                          <div className="rounded-lg overflow-hidden w-full max-w-xs aspect-square md:w-64 md:h-64 md:aspect-auto flex-shrink-0 mx-auto md:mx-0 bg-[#D4C5B0]">
                            <img
                              src="/Services Images/Cabinet.png"
                              alt="Cabinet Transformations"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : index === 2 ? (
                          <div className="rounded-lg overflow-hidden w-full max-w-xs aspect-square md:w-64 md:h-64 md:aspect-auto flex-shrink-0 mx-auto md:mx-0 bg-[#D4C5B0]">
                            <img
                              src="/Services Images/Wood Finishing.png"
                              alt="Wood Finishing"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : index === 3 ? (
                          <div className="rounded-lg overflow-hidden w-full max-w-xs aspect-square md:w-64 md:h-64 md:aspect-auto flex-shrink-0 mx-auto md:mx-0 bg-[#D4C5B0]">
                            <img
                              src="/Services Images/Wallpaper.png"
                              alt="Wallpaper"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-[#1d4ed8] rounded-lg flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                            <service.icon className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <div className="flex flex-col gap-2 flex-1 w-full">
                          <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                          <p className="text-gray-200 leading-relaxed">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  ),
                }))}
                className="max-w-3xl"
              />
            </div>
          </div>
        </section>

        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white w-full">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center w-full">
              <div className="w-full">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Karmatic Painting?</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  My name is Kevin, and I have been painting for 46 years. When you hire me, it is just me in your home, doing the work myself and making sure it is done properly.
                </p>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  I care about the details and only use products I trust. Every wall, cabinet, piece of wood and roll of wallpaper gets the same care I would want in my own home.
                </p>
                <ul className="space-y-4 w-full">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-[#1d4ed8] rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Licensed and insured</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-[#1d4ed8] rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">46 years of hands-on experience</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-[#1d4ed8] rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">High quality products and clean finishes</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-[#1d4ed8] rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Careful prep and attention to detail</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-[#1d4ed8] rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Clear pricing and communication</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-[#1d4ed8] rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">I am not finished until you are happy</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#1d4ed8] rounded-2xl p-8 md:p-12 text-white w-full">
                <h3 className="text-3xl font-bold mb-6">My Promise to You</h3>
                <p className="text-lg leading-relaxed mb-6 text-gray-100">
                  My promise is simple. I will not rush your project or leave something I know could look better. You get my full attention from the first visit to the final coat of paint.
                </p>
                <p className="text-lg leading-relaxed mb-6 text-gray-100">
                  Whether you need painting, cabinet transformations, wood finishing or wallpaper, I want you to be proud every time you walk into the room.
                </p>
                <p className="text-lg leading-relaxed text-gray-100">
                  Your home matters to me, and I will give you results you feel good about inviting people over to see.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 w-full">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-16 w-full">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get In Touch</h2>
              <p className="text-xl text-gray-600 max-w-2xl md:max-w-3xl mx-auto">
                Ready to transform your space? Contact me today to see if we are a good fit.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-16 w-full">
              <div className="bg-white rounded-2xl border border-[#1d4ed8]/30 shadow-[0_0_20px_rgba(29,78,216,0.15)] p-6 md:p-8 w-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Send Me a Message of What You Need Done
                </h3>
                <form className="space-y-6" onSubmit={handleFormSubmit}>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none transition-all"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none transition-all"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      What You Need Done
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Tell us about your project..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attachments (Optional)
                    </label>
                    <div className="space-y-3">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-1 text-sm text-gray-600">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">Images, videos, or documents</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                          accept="image/*,video/*,.pdf,.doc,.docx"
                          multiple
                        />
                      </label>

                      {filePreviews.length > 0 && (
                        <div className="space-y-2">
                          {filePreviews.map((item, index) => (
                            <div key={index} className="border-2 border-gray-300 rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                {item.preview && item.file.type.startsWith('image/') ? (
                                  <img src={item.preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                                ) : item.preview && item.file.type.startsWith('video/') ? (
                                  <video src={item.preview} className="w-16 h-16 object-cover rounded" />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                    <FileImage className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                                  <p className="text-xs text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(index)}
                                  className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {formMessage && (
                    <div className={`p-4 rounded-lg ${formStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {formMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full bg-[#1d4ed8] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#1e40af] transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto w-full">
              <a href="tel:+14035427553" className="text-center p-3 md:p-6 lg:p-8 md:bg-gray-50 md:rounded-xl md:hover:shadow-lg transition-all hover:scale-105 block cursor-pointer w-full">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#1d4ed8] rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <Phone className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Phone</h3>
                <p className="text-[0.65rem] md:text-base text-gray-600 whitespace-nowrap">(403) 542-7553</p>
              </a>

              <a href="mailto:karmaticpainting@gmail.com" className="flex flex-col items-center text-center p-3 md:p-6 lg:p-8 md:bg-gray-50 md:rounded-xl md:hover:shadow-lg transition-all hover:scale-105 cursor-pointer w-full">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#1d4ed8] rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <Mail className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Email</h3>
                <p className="text-[0.65rem] md:text-base text-gray-600 text-center">karmaticpainting@gmail.com</p>
              </a>

              <div className="text-center p-3 md:p-6 lg:p-8 md:bg-gray-50 md:rounded-xl md:hover:shadow-lg transition-all hover:scale-105 cursor-default w-full">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#1d4ed8] rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <MapPin className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Location</h3>
                <p className="text-[0.65rem] md:text-base text-gray-600">
                  <span className="md:inline block">Calgary &</span>{' '}
                  <span className="md:inline block">Surrounding Areas</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-br from-[#1C325C] via-[#1e3a6a] to-[#1C325C] text-white py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto text-center w-full">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/Images/Karmatic Painting Logo.svg" alt="Karmatic Painting" className="h-20 md:h-16 max-w-full" />
          </div>
          <p className="text-gray-300 mb-4">
            Professional Painting & Finishing Services
          </p>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Karmatic Painting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
