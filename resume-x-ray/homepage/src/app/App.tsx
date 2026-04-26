import { ImageWithFallback } from './components/figma/ImageWithFallback';
import cvImg1 from '../imports/Modern_Graphic_Design_Resume_Template_for_Creative.jpg';
import cvImg2 from '../imports/modern-cv-template.jpg';

export default function App() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#546B41] via-[#99AD7A] to-[#DCCCAC] overflow-hidden flex items-center justify-center">
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <div className="text-center">
          <h1 className="text-[25vw] md:text-[22vw] font-light text-[#FFF8EC]/25 tracking-wider leading-[0.85]">
            RESUME
          </h1>
          <h1 className="text-[25vw] md:text-[22vw] font-light text-[#FFF8EC]/25 tracking-wider leading-[0.85]">
            X-RAY
          </h1>
        </div>
      </div>

      {/* Floating tilted images */}
      <div className="absolute top-[15%] md:top-[10%] left-[-10%] md:left-[15%] w-64 md:w-96 h-[22rem] md:h-[32rem] floating-1 z-10">
        <ImageWithFallback
          src={(cvImg1 as any).src || cvImg1}
          alt="Attractive CV Design"
          className="w-full h-full object-cover rounded-2xl shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-500"
        />
      </div>

      <div className="absolute bottom-[15%] md:top-[18%] right-[-10%] md:right-[15%] w-64 md:w-96 h-[22rem] md:h-[32rem] floating-2 z-10">
        <ImageWithFallback
          src={(cvImg2 as any).src || cvImg2}
          alt="Modern CV Template Package"
          className="w-full h-full object-cover rounded-2xl shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500"
        />
      </div>

      {/* Action buttons container */}
      <div className="absolute bottom-8 md:bottom-12 left-0 right-0 px-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 z-20">
        {/* Login button */}
        <button className="w-full md:w-auto px-12 md:px-8 py-3 bg-[#FFF8EC] text-[#546B41] font-semibold rounded-full hover:bg-[#DCCCAC] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 order-2 md:order-1">
          Login
        </button>
        
        {/* Sign Up button */}
        <button className="w-full md:w-auto px-12 md:px-8 py-3 bg-[#546B41] text-[#FFF8EC] font-semibold rounded-full hover:bg-[#99AD7A] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 order-1 md:order-2">
          Sign Up
        </button>
      </div>

      <style>{`
        @keyframes float-1 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes float-2 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(20px) translateX(-10px);
          }
        }

        .floating-1 {
          animation: float-1 6s ease-in-out infinite;
        }

        .floating-2 {
          animation: float-2 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}