import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative py-20 bg-black">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 text-white">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-8">
              <div className="relative w-18 h-18 mr-1">
                <Image
                  src="/logoVector.png"
                  alt="Euro Hotel Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="relative w-24 h-14 mr-3 mt-[15px]">
                <Image
                  src="/logoText.png"
                  alt="EURO LOGO"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-8 text-lg font-light">
              Where comfort meets exceptional hospitality in the heart of Hyderabad. 
              Experience modern amenities and warm service designed for your convenience.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-6">
              <a href="https://www.facebook.com/share/1UUej1x93z/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-yellow-400/10">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/eurohotel_hospitality?igsh=MXJsaGFoeXF2bWN5Mg==" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-yellow-400/10">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.69.073 4.949.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-yellow-400">Explore</h3>
            <ul className="space-y-4">
              {/* <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors font-light">City Tours</a></li> */}
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors font-light">Comfort Suites</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors font-light">Fine Dining</a></li>
              {/* <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors font-light">Spa & Wellness</a></li> */}
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors font-light">Events</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-yellow-400">Contact</h3>
            <div className="space-y-4 text-gray-300 font-light">
              <div>
                <p className="font-medium text-white mb-1">Address</p>
                <p>Opp post office Mumbai highway<br />Rudraram village Patancheru Mandal<br />Sangareddy Dist Telangana 502329</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Reservations</p>
                <p>+91 77299 00091</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Email</p>
                <p>reservation@eurohotel.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p className="font-light">&copy; 2026 Euro Hotel. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-yellow-400 transition-colors font-light">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-yellow-400 transition-colors font-light">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
