import { useState, useEffect } from 'react';
import { Paintbrush, Palette, Sparkles, Home, Brush } from 'lucide-react';

interface Option {
  title: string;
  description: string;
  image: string;
  icon: JSX.Element;
}

interface InteractiveSelectorProps {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

const InteractiveSelector = ({ activeIndex, onActiveIndexChange }: InteractiveSelectorProps) => {
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);

  const options: Option[] = [
    {
      title: "Interior Painting",
      description: "Transform your living spaces",
      image: "/Gallery/img_0145.png",
      icon: <Paintbrush size={24} className="text-white" />
    },
    {
      title: "Cabinet Refinishing",
      description: "Stunning kitchen makeovers",
      image: "/Gallery/img_0153.png",
      icon: <Palette size={24} className="text-white" />
    },
    {
      title: "Exterior Painting",
      description: "Boost your curb appeal",
      image: "/Gallery/img_0160.png",
      icon: <Home size={24} className="text-white" />
    },
    {
      title: "Wood Finishing",
      description: "Premium wood treatments",
      image: "/Gallery/img_7704.png",
      icon: <Brush size={24} className="text-white" />
    },
    {
      title: "Specialty Finishes",
      description: "Unique decorative touches",
      image: "/Gallery/img_7870.png",
      icon: <Sparkles size={24} className="text-white" />
    }
  ];

  const handleOptionClick = (index: number) => {
    if (index !== activeIndex) {
      onActiveIndexChange(index);
    }
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 180 * i);
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      {/* Options Container */}
      <div className="hidden md:flex w-full max-w-[900px] h-[400px] mx-auto items-stretch overflow-hidden relative">
        {options.map((option, index) => (
          <div
            key={index}
            className={`
              option relative flex flex-col justify-end overflow-hidden transition-all duration-700 ease-in-out
              ${activeIndex === index ? 'active' : ''}
            `}
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: activeIndex === index ? 'auto 100%' : 'auto 120%',
              backgroundPosition: 'center',
              backfaceVisibility: 'hidden',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(-60px)',
              minWidth: '60px',
              minHeight: '100px',
              margin: 0,
              borderRadius: 0,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: activeIndex === index ? '#1d4ed8' : '#292929',
              cursor: 'pointer',
              backgroundColor: '#18181b',
              boxShadow: activeIndex === index
                ? '0 20px 60px rgba(29,78,216,0.30)'
                : '0 10px 30px rgba(0,0,0,0.30)',
              flex: activeIndex === index ? '7 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              overflow: 'hidden',
              willChange: 'flex-grow, box-shadow, background-size, background-position'
            }}
            onClick={() => handleOptionClick(index)}
          >
            {/* Shadow effect */}
            <div
              className="shadow absolute left-0 right-0 pointer-events-none transition-all duration-700 ease-in-out"
              style={{
                bottom: activeIndex === index ? '0' : '-40px',
                height: '120px',
                boxShadow: activeIndex === index
                  ? 'inset 0 -120px 120px -120px #000, inset 0 -120px 120px -80px #000'
                  : 'inset 0 -120px 0px -120px #000, inset 0 -120px 0px -80px #000'
              }}
            ></div>

            {/* Label with icon and info */}
            <div className="label absolute left-0 right-0 bottom-5 flex items-center justify-start h-12 z-2 pointer-events-none px-4 gap-3 w-full">
              <div className="icon min-w-[44px] max-w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[rgba(32,32,32,0.85)] backdrop-blur-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.18)] border-2 border-[#444] flex-shrink-0 flex-grow-0 transition-all duration-200">
                {option.icon}
              </div>
              <div className="info text-white whitespace-pre relative">
                <div
                  className="main font-bold text-lg transition-all duration-700 ease-in-out"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.title}
                </div>
                <div
                  className="sub text-base text-gray-300 transition-all duration-700 ease-in-out"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View - Single Image Display */}
      <div className="md:hidden w-full max-w-[500px] mx-auto px-4">
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-2xl">
          <img
            src={options[activeIndex].image}
            alt={options[activeIndex].title}
            className="w-full h-full object-cover"
          />
          {/* Shadow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="min-w-[44px] max-w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[rgba(32,32,32,0.85)] backdrop-blur-[10px] border-2 border-[#444]">
                {options[activeIndex].icon}
              </div>
              <div>
                <h3 className="font-bold text-xl">{options[activeIndex].title}</h3>
                <p className="text-gray-200 text-sm">{options[activeIndex].description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-60px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default InteractiveSelector;
