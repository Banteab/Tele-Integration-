import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SUPPORTED_LANGUAGE_CODES } from './config/languages';
import { mergeDeep } from './i18n/mergeDeep';
import extraEn from './i18n/extras/en';
import extraAm from './i18n/extras/am';
import extraOm from './i18n/extras/om';
import extraTi from './i18n/extras/ti';
import extraSo from './i18n/extras/so';
import ti from './i18n/ti';
import so from './i18n/so';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        myTickets: 'My Tickets',
        cancelTicket: 'Cancel Ticket',
        contact: 'Contact Us'
      },
      hero: {
        title: 'Journey with Elegance',
        subtitle: 'Experience the most comfortable and luxurious bus travel across Ethiopia. Book your tickets online instantly.',
        oneWay: 'One Way',
        leavingFrom: 'Leaving From',
        goingTo: 'Going To',
        selectCity: 'Select City',
        dateOfJourney: 'Date of Journey',
        searchBuses: 'Search Buses',
        fillRequired: 'Please fill in all required fields (From, To, Date).',
        cities: {
          'addis-ababa': 'Addis Ababa',
          'hawassa': 'Hawassa',
          'bahir-dar': 'Bahir Dar',
          'dire-dawa': 'Dire Dawa',
          'adama': 'Adama',
          'mekelle': 'Mekelle',
          'gondar': 'Gondar',
          'jimma': 'Jimma'
        }
      },
      features: {
        badge: 'Why Choose Us',
        title: 'Premium Travel Experience',
        subtitle: 'We provide top-notch facilities to make your journey comfortable, safe, and memorable.',
        items: {
          luxury: {
            name: 'Luxury AC Coach',
            desc: 'Travel in comfort with our state-of-the-art air-conditioned coaches.'
          },
          seat: {
            name: 'Medicated Seat',
            desc: 'Ergonomically designed medicated seats for a pain-free journey.'
          },
          online: {
            name: 'Online Ticket',
            desc: 'Book your tickets online from anywhere, anytime with ease.'
          },
          driver: {
            name: 'Experience Driver',
            desc: 'Highly trained and experienced drivers ensuring your safety.'
          },
          wifi: {
            name: 'Free Wifi',
            desc: 'Stay connected throughout your journey with complimentary high-speed WiFi.'
          },
          cctv: {
            name: 'CCTV Monitoring',
            desc: '24/7 CCTV surveillance inside the coach for enhanced security.'
          },
          usb: {
            name: 'USB Charging Port',
            desc: 'Keep your devices powered up with individual USB charging ports.'
          },
          support: {
            name: 'Call Center Support',
            desc: 'Dedicated customer support team available round the clock.'
          }
        }
      },
      routes: {
        title: 'Popular Routes',
        subtitle: 'Explore our most frequently traveled routes across Ethiopia.',
        from: 'From',
        to: 'to',
        addisAbaba: 'Addis Ababa',
        hawassa: 'Hawassa',
        bahirDar: 'Bahir Dar',
        direDawa: 'Dire Dawa',
        adama: 'Adama',
        mekelle: 'Mekelle',
        gondar: 'Gondar',
        jimma: 'Jimma'
      },
      booking: {
        steps: {
          search: 'Search',
          seats: 'Seats',
          passenger: 'Passenger',
          payment: 'Payment',
          success: 'Success'
        },
        searchError: 'No buses available',
        noResults: 'No buses available',
        noSeats: 'No seats',
        loadingSeats: 'Loading seat layout...',
        seatsAvailable: 'seats available',
        viewSeats: 'View Seats',
        selectSeats: 'Select Your Seats',
        legend: {
          available: 'Available',
          selected: 'Selected',
          booked: 'Booked'
        },
        front: 'Front',
        selectSeatsToContinue: 'Please select at least one seat to continue.',
        selectedSeats: 'Selected Seats',
        pricePerSeat: 'Price per Seat',
        totalFare: 'Total Fare',
        continueToDetails: 'Continue to Details',
        seatLimitTitle: 'Seat Limit Reached',
        seatLimitMessage: 'You can only select up to 4 seats per booking.',
        close: 'Close',
        seat: 'Seat',
        summary: 'Booking Summary',
        total: 'Total Amount',
        continue: 'Continue',
        back: 'Back',
        passengerDetails: 'Passenger Details',
        name: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
        age: 'Age',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        confirm: 'Confirm & Pay',
        paymentMethod: 'Payment Method',
        telebirr: 'Telebirr',
        cbeBirr: 'CBE Birr',
        orderSummary: 'Order Summary',
        ticketPrice: 'Ticket Price',
        serviceFee: 'Service Fee',
        congratulations: 'Congratulations!',
        bookingSuccess: 'Your booking has been confirmed successfully.',
        ticketId: 'Ticket ID',
        departure: 'Departure',
        downloadTicket: 'Download Ticket',
        backToHome: 'Back to Home'
      },
      passenger: {
        title: 'Passenger Details',
        subtitle: 'Please enter the details of the passengers traveling.',
        contactInfo: 'Contact Information',
        email: 'Email Address',
        phone: 'Phone Number',
        passenger: 'Passenger',
        fullName: 'Full Name',
        gender: 'Gender',
        genderOptions: {
          male: 'Male',
          female: 'Female',
          other: 'Other'
        },
        age: 'Age',
        proceedToPayment: 'Proceed to Payment',
        errors: {
          emailRequired: 'Email is required',
          emailInvalid: 'Please enter a valid email address',
          phoneRequired: 'Phone number is required',
          phoneInvalid: 'Please enter a valid Ethiopian phone number (09... or 07...)',
          nameRequired: 'Name is required',
          nameMin: 'Name must be at least 3 characters',
          ageRequired: 'Age is required',
          ageRange: 'Age must be between 1 and 120',
          fixErrors: 'Please fix the errors in the form before proceeding.'
        }
      },
      payment: {
        title: 'Payment',
        subtitle: 'Choose your preferred payment method and complete the booking.',
        selectMethod: 'Select Payment Method',
        methods: {
          telebirr: 'Telebirr',
          cbebirr: 'CBE Birr',
          card: 'Credit / Debit Card'
        },
        secureMessage: 'Your payment is secured with industry-standard encryption.',
        orderSummary: 'Order Summary',
        processing: 'Processing Payment...',
        pay: 'Pay Now',
        ticketCreated: 'Ticket created successfully!',
        redirectingToCheckout: 'Redirecting to payment checkout...',
        successMessage: 'Payment successful! Your ticket is ready.',
        paymentSuccessful: 'Payment successful!',
        paymentFailed: 'Payment cancelled or failed',
        paymentTimeout: 'Payment confirmation timed out',
        sessionExpired: 'Payment session expired',
        waitingForPayment: 'Processing payment...',
        summary: {
          contact: 'Contact Person',
          bus: 'Bus Operator',
          seats: 'Seats',
          price: 'Ticket Price',
          fee: 'Service Fee',
          total: 'Total Amount'
        }
      },
      auth: {
        login: 'Login',
        register: 'Register',
        loginSuccess: 'Login successful!',
        registerSuccess: 'Registration successful!',
        phoneNumber: 'Phone Number',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        noAccount: "Don't have an account?",
        haveAccount: 'Already have an account?',
        loginRequired: 'Please enter both phone number and password',
        signup: {
          success: 'Account created successfully!'
        }
      },
      ticketHistory: {
        title: 'My Tickets',
        subtitle: 'View your bookings',
        loadError: 'Failed to load ticket history',
        noTickets: 'No tickets yet'
      },
      ticketSuccess: {
        title: 'Booking Successful!',
        subtitle: 'Your ticket has been confirmed. A copy has been sent to {{email}}.',
        details: {
          pnr: 'PNR / Ticket ID',
          operator: 'Bus Operator',
          contact: 'Passenger Name',
          seats: 'Selected Seats',
          departure: 'Departure Time',
          total: 'Total Amount'
        },
        download: 'Download Ticket',
        backHome: 'Back to Home'
      },
      cancel: {
        title: 'Cancel Ticket',
        subtitle: 'Request a refund for your booked ticket',
        ticketId: 'Ticket ID / PNR',
        phone: 'Phone Number',
        search: 'Search Ticket',
        policy: 'Cancellation Policy',
        policy1: 'Cancellations made 24 hours before departure: 90% refund',
        policy2: 'Cancellations made 12-24 hours before departure: 50% refund',
        policy3: 'Cancellations made less than 12 hours before departure: No refund',
        confirm: 'Confirm Cancellation',
        success: 'Ticket cancelled successfully. Refund will be processed within 3-5 business days.'
      },
      footer: {
        desc: 'Making your journey comfortable, safe, and memorable with our premium bus services across Ethiopia.',
        quickLinks: 'Quick Links',
        contact: 'Contact Info',
        payment: 'Payment Methods'
      }
    }
  },
  am: {
    translation: {
      nav: {
        home: 'መነሻ',
        myTickets: 'ትኬቶቼ',
        cancelTicket: 'ትኬት ሰርዝ',
        contact: 'ያግኙን'
      },
      hero: {
        title: 'በክብር ይጓዙ',
        subtitle: 'በኢትዮጵያ ውስጥ በጣም ምቹ እና የቅንጦት የአውቶቡስ ጉዞን ይለማመዱ። ትኬቶችን ወዲያውኑ በመስመር ላይ ያስይዙ።',
        oneWay: 'አንድ መንገድ',
        leavingFrom: 'መነሻ',
        goingTo: 'መድረሻ',
        selectCity: 'ከተማ ይምረጡ',
        dateOfJourney: 'የጉዞ ቀን',
        searchBuses: 'አውቶቡሶችን ይፈልጉ',
        fillRequired: 'እባክዎ ሁሉንም አስፈላጊ መስኮችን ይሙሉ (ከ፣ ወደ፣ ቀን)።',
        cities: {
          'addis-ababa': 'አዲስ አበባ',
          'hawassa': 'ሀዋሳ',
          'bahir-dar': 'ባህር ዳር',
          'dire-dawa': 'ድሬዳዋ',
          'adama': 'አዳማ',
          'mekelle': 'መቀሌ',
          'gondar': 'ጎንደር',
          'jimma': 'ጅማ'
        }
      },
      features: {
        badge: 'ለምን እኛን ይመርጣሉ',
        title: 'ፕሪሚየም የጉዞ ልምድ',
        subtitle: 'ጉዞዎን ምቹ፣ ደህንነቱ የተጠበቀ እና የማይረሳ ለማድረግ ከፍተኛ ደረጃ ያላቸውን አገልግሎቶች እናቀርባለን።',
        items: {
          luxury: {
            name: 'የቅንጦት ኤሲ አውቶቡስ',
            desc: 'በዘመናዊ የአየር ማቀዝቀዣ አውቶቡሶቻችን በምቾት ይጓዙ።'
          },
          seat: {
            name: 'ምቹ ወንበር',
            desc: 'ከህመም ነጻ የሆነ ጉዞ ለማድረግ በergonomically የተነደፉ ወንበሮች።'
          },
          online: {
            name: 'የመስመር ላይ ትኬት',
            desc: 'ትኬቶችን በማንኛውም ቦታ፣ በማንኛውም ጊዜ በቀላሉ በመስመር ላይ ያስይዙ።'
          },
          driver: {
            name: 'ልምድ ያለው ሹፌር',
            desc: 'ደህንነትዎን የሚያረጋግጡ ከፍተኛ የሰለጠኑ እና ልምድ ያላቸው አሽከርካሪዎች።'
          },
          wifi: {
            name: 'ነጻ ዋይፋይ',
            desc: 'በጉዞዎ ጊዜ ሁሉ በነጻ ከፍተኛ ፍጥነት ባለው ዋይፋይ እንደተገናኙ ይቆዩ።'
          },
          cctv: {
            name: 'የሲሲቲቪ ክትትል',
            desc: 'ለተሻሻለ ደህንነት በአውቶቡሱ ውስጥ የ24/7 የሲሲቲቪ ክትትል።'
          },
          usb: {
            name: 'የዩኤስቢ ቻርጅ ወደብ',
            desc: 'መሳሪያዎችዎን በግል የዩኤስቢ ቻርጅ ወደቦች ቻርጅ ያድርጉ።'
          },
          support: {
            name: 'የጥሪ ማእከል ድጋፍ',
            desc: 'የወሰነ የደንበኛ ድጋፍ ቡድን በሰዓት ይገኛል።'
          }
        }
      },
      routes: {
        title: 'ታዋቂ መስመሮች',
        subtitle: 'በኢትዮጵያ ውስጥ በብዛት የሚጓዙባቸውን መስመሮቻችንን ያስሱ።',
        from: 'ከ',
        to: 'ወደ',
        addisAbaba: 'አዲስ አበባ',
        hawassa: 'ሀዋሳ',
        bahirDar: 'ባህር ዳር',
        direDawa: 'ድሬዳዋ',
        adama: 'አዳማ',
        mekelle: 'መቀሌ',
        gondar: 'ጎንደር',
        jimma: 'ጅማ'
      },
      booking: {
        steps: {
          search: 'ፍለጋ',
          seats: 'ወንበሮች',
          passenger: 'ተጓዥ',
          payment: 'ክፍያ',
          success: 'ተሳክቷል'
        },
        searchError: 'ምንም አውቶቡስ አይገኙም',
        noResults: 'ምንም አውቶቡስ አይገኙም',
        noSeats: 'ወንበር የለም',
        loadingSeats: 'የወንበር አቀማመጥ በመጫን ላይ...',
        seatsAvailable: 'ወንበሮች አሉ።',
        viewSeats: 'ወንበሮችን ይመልከቱ',
        selectSeats: 'ወንበርዎን ይምረጡ',
        legend: {
          available: 'ክፍት',
          selected: 'የተመረጠ',
          booked: 'የተያዘ'
        },
        front: 'ፊት',
        selectSeatsToContinue: 'እባክዎ ለመቀጠል ቢያንስ አንድ ወንበር ይምረጡ።',
        selectedSeats: 'የተመረጡ ወንበሮች',
        pricePerSeat: 'የአንድ ወንበር ዋጋ',
        totalFare: 'ጠቅላላ ክፍያ',
        continueToDetails: 'ወደ ዝርዝር መረጃ ይቀጥሉ',
        seatLimitTitle: 'የወንበር ገደብ ደርሷል',
        seatLimitMessage: 'በአንድ ጊዜ እስከ 4 ወንበሮችን ብቻ መምረጥ ይችላሉ።',
        close: 'ዝጋ',
        seat: 'ወንበር',
        summary: 'የቦታ ማስያዣ ማጠቃለያ',
        total: 'ጠቅላላ ክፍያ',
        continue: 'ቀጥል',
        back: 'ተመለስ',
        passengerDetails: 'የተጓዥ መረጃ',
        name: 'ሙሉ ስም',
        email: 'ኢሜይል',
        phone: 'ስልክ ቁጥር',
        age: 'እድሜ',
        gender: 'ጾታ',
        male: 'ወንድ',
        female: 'ሴት',
        other: 'ሌላ',
        confirm: 'አረጋግጥ እና ክፈል',
        paymentMethod: 'የክፍያ ዘዴ',
        telebirr: 'ቴሌብር',
        cbeBirr: 'ሲቢኢ ብር',
        orderSummary: 'የትዕዛዝ ማጠቃለያ',
        ticketPrice: 'የትኬት ዋጋ',
        serviceFee: 'የአገልግሎት ክፍያ',
        congratulations: 'እንኳን ደስ አለዎት!',
        bookingSuccess: 'ቦታ ማስያዝዎ በተሳካ ሁኔታ ተረጋግጧል።',
        ticketId: 'የትኬት መታወቂያ',
        departure: 'መነሻ',
        downloadTicket: 'ትኬት ያውርዱ',
        backToHome: 'ወደ መነሻ ይመለሱ'
      },
      passenger: {
        title: 'የተጓዥ መረጃ',
        subtitle: 'እባክዎ የሚጓዙትን ተጓዦች ዝርዝር ያስገቡ።',
        contactInfo: 'የእውቂያ መረጃ',
        email: 'ኢሜይል አድራሻ',
        phone: 'ስልክ ቁጥር',
        passenger: 'ተጓዥ',
        fullName: 'ሙሉ ስም',
        gender: 'ጾታ',
        genderOptions: {
          male: 'ወንድ',
          female: 'ሴት',
          other: 'ሌላ'
        },
        age: 'እድሜ',
        proceedToPayment: 'ወደ ክፍያ ይቀጥሉ',
        errors: {
          emailRequired: 'ኢሜይል ያስፈልጋል',
          emailInvalid: 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ',
          phoneRequired: 'ስልክ ቁጥር ያስፈልጋል',
          phoneInvalid: 'እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (09... ወይም 07...)',
          nameRequired: 'ስም ያስፈልጋል',
          nameMin: 'ስም ቢያንስ 3 ፊደላት መሆን አለበት',
          ageRequired: 'እድሜ ያስፈልጋል',
          ageRange: 'እድሜ በ1 እና 120 መካከል መሆን አለበት',
          fixErrors: 'እባክዎን ከመቀጠልዎ በፊት በቅጹ ላይ ያሉትን ስህተቶች ያስተካክሉ።'
        }
      },
      payment: {
        title: 'ክፍያ',
        subtitle: 'የሚመርጡትን የክፍያ ዘዴ ይምረጡ እና ቦታ ማስያዝዎን ያጠናቅቁ።',
        selectMethod: 'የክፍያ ዘዴ ይምረጡ',
        methods: {
          telebirr: 'ቴሌብር',
          cbebirr: 'ሲቢኢ ብር',
          card: 'ክሬዲት / ዴቢት ካርድ'
        },
        secureMessage: 'ክፍያዎ በኢንዱስትሪ ደረጃ ምስጠራ የተጠበቀ ነው።',
        orderSummary: 'የትዕዛዝ ማጠቃለያ',
        processing: 'ክፍያ በመከናወን ላይ ነው...',
        pay: 'አሁን ይክፈሉ',
        ticketCreated: 'ትኬት በተሳካ ሁኔታ ተፈጠረ!',
        redirectingToCheckout: 'ወደ ክፍያ ገጽ በመምራት ላይ ነው...',
        successMessage: 'ክፍያው ተሳክቷል! ትኬትዎ ዝግጁ ነው።',
        paymentSuccessful: 'ክፍያው ተሳክቷል!',
        paymentFailed: 'ክፍያ ተሰርዟል ወይም አልተሳካም',
        paymentTimeout: 'የክፍያ ማረጋገጫ ጊዜ አልፏል',
        sessionExpired: 'የክፍያ ክፍለ ጊዜ አልፏል',
        waitingForPayment: 'ክፍያ በመከናወን ላይ...',
        summary: {
          contact: 'ተጠሪ ሰው',
          bus: 'አውቶቡስ ኦፕሬተር',
          seats: 'ወንበሮች',
          price: 'የትኬት ዋጋ',
          fee: 'የአገልግሎት ክፍያ',
          total: 'ጠቅላላ ክፍያ'
        }
      },
      auth: {
        login: 'ግባ',
        register: 'ተመዝገብ',
        loginSuccess: 'በተሳካ ሁኔታ ገብተዋል!',
        registerSuccess: 'ምዝገባው ተሳክቷል!',
        phoneNumber: 'ስልክ ቁጥር',
        password: 'የይለፍ ቃል',
        confirmPassword: 'የይለፍ ቃል አረጋግጥ',
        noAccount: 'መለያ የለዎትም?',
        haveAccount: 'መለያ አለዎት?',
        loginRequired: 'እባክዎ ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ',
        signup: {
          success: 'መለያ በተሳካ ሁኔታ ተፈጥሯል!'
        }
      },
      ticketHistory: {
        title: 'ትኬቶቼ',
        subtitle: 'ቦታ ማስያዞችን ይመልከቱ',
        loadError: 'የትኬት ታሪክ መጫን አልተሳካም',
        noTickets: 'እስካሁን ትኬት የለም'
      },
      ticketSuccess: {
        title: 'ቦታ ማስያዝ ተሳክቷል!',
        subtitle: 'ትኬትዎ ተረጋግጧል። ቅጂው ወደ {{email}} ተልኳል።',
        details: {
          pnr: 'PNR / የትኬት መታወቂያ',
          operator: 'አውቶቡስ ኦፕሬተር',
          contact: 'የተጓዥ ስም',
          seats: 'የተመረጡ ወንበሮች',
          departure: 'የመነሻ ሰዓት',
          total: 'ጠቅላላ ክፍያ'
        },
        download: 'ትኬት ያውርዱ',
        backHome: 'ወደ መነሻ ይመለሱ'
      },
      cancel: {
        title: 'ትኬት ሰርዝ',
        subtitle: 'ለተያዘው ትኬትዎ የገንዘብ ተመላሽ ይጠይቁ',
        ticketId: 'የትኬት መታወቂያ / PNR',
        phone: 'ስልክ ቁጥር',
        search: 'ትኬት ፈልግ',
        policy: 'የስረዛ ፖሊሲ',
        policy1: 'ከመነሻው 24 ሰዓት በፊት ከተሰረዘ፡ 90% ተመላሽ',
        policy2: 'ከመነሻው ከ12-24 ሰዓት በፊት ከተሰረዘ፡ 50% ተመላሽ',
        policy3: 'ከመነሻው ከ12 ሰዓት ባነሰ ጊዜ ውስጥ ከተሰረዘ፡ ተመላሽ የለውም',
        confirm: 'ስረዛውን አረጋግጥ',
        success: 'ትኬቱ በተሳካ ሁኔታ ተሰርዟል። ተመላሽ ገንዘቡ በ3-5 የስራ ቀናት ውስጥ ይከናወናል።'
      },
      footer: {
        desc: 'በኢትዮጵያ ውስጥ ባሉ የላቀ የአውቶቡስ አገልግሎቶቻችን ጉዞዎን ምቹ፣ ደህንነቱ የተጠበቀ እና የማይረሳ ማድረግ።',
        quickLinks: 'ፈጣን አገናኞች',
        contact: 'የእውቂያ መረጃ',
        payment: 'የክፍያ ዘዴዎች'
      }
    }
  },
  om: {
    translation: {
      nav: {
        home: 'Mana',
        myTickets: 'Tikkeettii Koo',
        cancelTicket: 'Tikkeettii Haqi',
        contact: 'Nu Quunnamaa'
      },
      hero: {
        title: 'Kabajaan Imalaa',
        subtitle: 'Itoophiyaa keessatti imala konkolaataa baasii hunda caalaa mijataa fi qananii ta\'e dhandhamaa. Tikkeettii keessan battalumatti onlaayiniin qabadhaa.',
        oneWay: 'Karaa Tokko',
        leavingFrom: 'Bakka Ka\'umsaa',
        goingTo: 'Bakka Ga\'umsaa',
        selectCity: 'Magaalaa Filadhu',
        dateOfJourney: 'Guyyaa Imalaa',
        searchBuses: 'Baasii Barbaadi',
        fillRequired: 'Maaloo bakka barbaachisu hunda guutaa (Irraa, Gara, Guyyaa).',
        cities: {
          'addis-ababa': 'Finfinnee',
          'hawassa': 'Hawaasaa',
          'bahir-dar': 'Baahir Daar',
          'dire-dawa': 'Dirree Dhawaa',
          'adama': 'Adaamaa',
          'mekelle': 'Maqalee',
          'gondar': 'Gondar',
          'jimma': 'Jimmaa'
        }
      },
      features: {
        badge: 'Maaliif Nu Filattu',
        title: 'Muuxannoo Imalaa Olaanaa',
        subtitle: 'Imala keessan mijataa, nagaa fi kan hin irraanfatamne gochuuf tajaajiloota sadarkaa olaanaa qaban dhiyeessina.',
        items: {
          luxury: {
            name: 'Baasii AC Qananii',
            desc: 'Konkolaattota baasii qilleensa qabbaneessu ammayyaa keenyaan qananiin imalaa.'
          },
          seat: {
            name: 'Teessoo Mijataa',
            desc: 'Imala dhukkubbii irraa bilisa ta\'eef teessoowwan ergonomically dizaayini godhaman.'
          },
          online: {
            name: 'Tikkeettii Onlaayinii',
            desc: 'Tikkeettii keessan bakka kamittuu, yeroo kamittuu salphaatti onlaayiniin qabadhaa.'
          },
          driver: {
            name: 'Konkolaachisaa Muuxannoo Qabu',
            desc: 'Konkolaachistoota leenjii olaanaa qabanii fi muuxannoo qaban kan nageenya keessan mirkaneessan.'
          },
          wifi: {
            name: 'Waaay-faayii Bilisaa',
            desc: 'Imala keessan guutuu waaay-faayii saffisa olaanaa bilisaan walitti hidhamanii turaa.'
          },
          cctv: {
            name: 'Hordoffii CCTV',
            desc: 'Nageenya fooyya\'eef baasii keessatti hordoffii CCTV 24/7.'
          },
          usb: {
            name: 'Bakka Chaarjii USB',
            desc: 'Meeshaalee keessan bakka chaarjii USB dhuunfaatiin chaarjii godhadhaa.'
          },
          support: {
            name: 'Deeggarsa Wiirtuu Bilbilaa',
            desc: 'Garee deeggarsa maamiltootaa yeroo hunda jiru.'
          }
        }
      },
      routes: {
        title: 'Sararaalee Beekamoo',
        subtitle: 'Sararaalee Itoophiyaa keessatti baay\'ee imalaman keenya daawwadhaa.',
        from: 'Irraa',
        to: 'gara',
        addisAbaba: 'Finfinnee',
        hawassa: 'Hawaasaa',
        bahirDar: 'Baahir Daar',
        direDawa: 'Dirree Dhawaa',
        adama: 'Adaamaa',
        mekelle: 'Maqalee',
        gondar: 'Gondar',
        jimma: 'Jimmaa'
      },
      booking: {
        steps: {
          search: 'Barbaadi',
          seats: 'Teessoo',
          passenger: 'Imaltuu',
          payment: 'Kaffaltii',
          success: 'Milkaa\'e'
        },
        searchError: 'Baasiin hin jiru',
        noResults: 'Baasiin hin jiru',
        noSeats: 'Teessoon hin jiru',
        loadingSeats: 'Teessoo fe\'amaa jira...',
        seatsAvailable: 'teessoowwan jiru',
        viewSeats: 'Teessoowwan Ilaali',
        selectSeats: 'Teessoo Keessan Filadhaa',
        legend: {
          available: 'Kan Jiru',
          selected: 'Kan Filatame',
          booked: 'Kan Qabame'
        },
        front: 'Fuuldura',
        selectSeatsToContinue: 'Maaloo itti fufuuf yoo xiqqaate teessoo tokko filadhaa.',
        selectedSeats: 'Teessoowwan Filataman',
        pricePerSeat: 'Gatii Teessoo Tokkoo',
        totalFare: 'Waliigala Kaffaltii',
        continueToDetails: 'Gara Odeeffannootti Itti Fufi',
        seatLimitTitle: 'Daangaan Teessoo Ga\'eera',
        seatLimitMessage: 'Yeroo tokkotti hanga teessoowwan 4 qofa filachuu dandeessu.',
        close: 'Cufi',
        seat: 'Teessoo',
        summary: 'Guduunfaa Qabannaa',
        total: 'Waliigala Kaffaltii',
        continue: 'Itti Fufi',
        back: 'Duubatti',
        passengerDetails: 'Oduu Imaltuu',
        name: 'Maqaa Guutuu',
        email: 'Iimeelii',
        phone: 'Lakkoofsa Bilbilaa',
        age: 'Umrii',
        gender: 'Kornayaa',
        male: 'Dhiira',
        female: 'Dhalaa',
        other: 'Kan biraa',
        confirm: 'Mirkaneessi & Kaffali',
        paymentMethod: 'Mala Kaffaltii',
        telebirr: 'Telebirr',
        cbeBirr: 'CBE Birr',
        orderSummary: 'Guduunfaa Ajajaa',
        ticketPrice: 'Gatii Tikkeettii',
        serviceFee: 'Kaffaltii Tajaajilaa',
        congratulations: 'Baga Gammanne!',
        bookingSuccess: 'Qabannaan keessan milkaa\'inaan mirkanaa\'eera.',
        ticketId: 'ID Tikkeettii',
        departure: 'Ka\'umsa',
        downloadTicket: 'Tikkeettii Buufadhu',
        backToHome: 'Gara Fuula Duraatti Deebi\'i'
      },
      passenger: {
        title: 'Oduu Imaltuu',
        subtitle: 'Maaloo odeeffannoo imaltoota imalanii galchaa.',
        contactInfo: 'Odeeffannoo Quunnamtii',
        email: 'Teessoo Iimeelii',
        phone: 'Lakkoofsa Bilbilaa',
        passenger: 'Imaltuu',
        fullName: 'Maqaa Guutuu',
        gender: 'Kornayaa',
        genderOptions: {
          male: 'Dhiira',
          female: 'Dhalaa',
          other: 'Kan biraa'
        },
        age: 'Umrii',
        proceedToPayment: 'Gara Kaffaltiitti Itti Fufi',
        errors: {
          emailRequired: 'Iimeeliin barbaachisaadha',
          emailInvalid: 'Maaloo teessoo iimeelii sirrii galchaa',
          phoneRequired: 'Lakkoofsi bilbilaa barbaachisaadha',
          phoneInvalid: 'Maaloo lakkoofsa bilbilaa Itoophiyaa sirrii galchaa (09... ykn 07...)',
          nameRequired: 'Maqaan barbaachisaadha',
          nameMin: 'Maqaan yoo xiqqaate qubeewwan 3 ta\'uu qaba',
          ageRequired: 'Umriin barbaachisaadha',
          ageRange: 'Umriin 1 fi 120 gidduu ta\'uu qaba',
          fixErrors: 'Maaloo itti fufuun dura dogoggora unka keessaa jiru sirreessi.'
        }
      },
      payment: {
        title: 'Kaffaltii',
        subtitle: 'Mala kaffaltii filattan filachuun qabannaa keessan xumuraa.',
        selectMethod: 'Mala Kaffaltii Filadhu',
        methods: {
          telebirr: 'Telebirr',
          cbebirr: 'CBE Birr',
          card: 'Kaardii Kireeditii / Deebitii'
        },
        secureMessage: 'Kaffaltiin keessan icciitii sadarkaa indastiriitiin eegumsa qaba.',
        orderSummary: 'Guduunfaa Ajajaa',
        processing: 'Kaffaltiin hojjetamaa jira...',
        pay: 'Amma Kaffali',
        ticketCreated: 'Tikkeettiin milkaa\'inaan uumameera!',
        redirectingToCheckout: 'Gara fuula kaffaltiiitti geessitamaa jira...',
        successMessage: "Kaffaltii milkaa'eera! Tikkeettiin keessan qophaa'eera.",
        paymentSuccessful: "Kaffaltii milkaa'eera!",
        paymentFailed: 'Kaffaltiin haqame ykn hin milkoofne',
        paymentTimeout: 'Mirkaneessi kaffaltii yeroon isaa darbeera',
        sessionExpired: 'Yeroo kaffaltii darbeera',
        waitingForPayment: 'Kaffaltiin hojjetamaa jira...',
        summary: {
          contact: 'Nama Quunnamtii',
          bus: 'Opreetara Baasii',
          seats: 'Teessoowwan',
          price: 'Gatii Tikkeettii',
          fee: 'Kaffaltii Tajaajilaa',
          total: 'Waliigala Kaffaltii'
        }
      },
      auth: {
        login: 'Seeni',
        register: 'Galmaa\'i',
        loginSuccess: 'Milkaa\'inaan seenan!',
        registerSuccess: 'Galmeen milkaa\'eera!',
        phoneNumber: 'Lakkoofsa Bilbilaa',
        password: 'Jecha Iccitii',
        confirmPassword: 'Jecha Iccitii Mirkaneessi',
        noAccount: 'Herrega hin qabduu?',
        haveAccount: 'Herrega qabdaa?',
        loginRequired: 'Maaloo lakkoofsa bilbilaa fi jecha iccitii galchaa',
        signup: {
          success: 'Herregni milkaa\'inaan uumameera!'
        }
      },
      ticketHistory: {
        title: 'Tikkeettii Koo',
        subtitle: 'Qabannaa keessan ilaalaa',
        loadError: 'Seenaa tikkeettii fe\'uu hin dandeenye',
        noTickets: 'Ammaaf tikkeettiin hin jiru'
      },
      ticketSuccess: {
        title: 'Qabannaan Milkaa\'eera!',
        subtitle: 'Tikkeettiin keessan mirkanaa\'eera. Koppiin isaa gara {{email}} ergameera.',
        details: {
          pnr: 'PNR / ID Tikkeettii',
          operator: 'Opreetara Baasii',
          contact: 'Maqaa Imaltuu',
          seats: 'Teessoowwan Filataman',
          departure: 'Yeroo Ka\'umsaa',
          total: 'Waliigala Kaffaltii'
        },
        download: 'Tikkeettii Buufadhu',
        backHome: 'Gara Fuula Duraatti Deebi\'i'
      },
      cancel: {
        title: 'Tikkeettii Haqi',
        subtitle: 'Tikkeettii qabattan irraa maallaqa deebisiisuu gaafadhaa',
        ticketId: 'ID Tikkeettii / PNR',
        phone: 'Lakkoofsa Bilbilaa',
        search: 'Tikkeettii Barbaadi',
        policy: 'Imaammata Haqinsa',
        policy1: 'Sa\'aatii 24 dura yoo haqame: 90% deebi\'a',
        policy2: 'Sa\'aatii 12-24 dura yoo haqame: 50% deebi\'a',
        policy3: 'Sa\'aatii 12 gadi yoo haqame: Maallaqni hin deebi\'u',
        confirm: 'Haqinsa Mirkaneessi',
        success: 'Tikkeettiin milkaa\'inaan haqameera. Maallaqni guyyoota hojii 3-5 keessatti deebi\'a.'
      },
      footer: {
        desc: 'Tajaajila konkolaataa keenya sadarkaa olaanaa ta\'een imala keessan mijataa, nagaa fi kan hin irraanfatamne gochuu.',
        quickLinks: 'Geessituuwwan Saffisaa',
        contact: 'Oduu Quunnamtii',
        payment: 'Malleen Kaffaltii'
      }
    }
  },
  ti: {
    translation: ti
  },
  so: {
    translation: so
  }
};

const extrasByLang: Record<string, Record<string, unknown>> = {
  en: extraEn,
  am: extraAm,
  om: extraOm,
  ti: extraTi,
  so: extraSo,
};

for (const [lang, extra] of Object.entries(extrasByLang)) {
  if (resources[lang as keyof typeof resources]) {
    resources[lang as keyof typeof resources].translation = mergeDeep(
      resources[lang as keyof typeof resources].translation as Record<string, unknown>,
      extra,
    );
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    pluralSeparator: '_',
  });

export default i18n;
