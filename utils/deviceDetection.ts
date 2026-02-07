export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type OperatingSystem = 'ios' | 'android' | 'macos' | 'windows' | 'unknown';
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export class DeviceDetector {
  deviceType: DeviceType = 'desktop';
  operatingSystem: OperatingSystem = 'unknown';
  screenWidth: number = 0;
  screenHeight: number = 0;
  pixelRatio: number = 1;
  orientation: 'portrait' | 'landscape' = 'portrait';
  screenSize: ScreenSize = 'lg';
  connectionType: string = 'unknown';
  saveData: boolean = false;

  constructor() {
    this.init();
  }

  init() {
    this.detectDevice();
    this.detectOS();
    this.detectScreen();
    this.detectConnection();
    this.applyDetectionClasses();
    this.setupResizeListener();
  }

  detectDevice() {
    const ua = navigator.userAgent;
    const width = window.innerWidth;
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
      this.deviceType = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      this.deviceType = 'mobile';
    } else if (width < 768) {
      this.deviceType = 'mobile';
    } else if (width < 1024) {
      this.deviceType = 'tablet';
    } else {
      this.deviceType = 'desktop';
    }
    return this.deviceType;
  }

  detectOS() {
    const ua = navigator.userAgent;
    // Check for iOS including newer iPads
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
      this.operatingSystem = 'ios';
    } else if (/Android/.test(ua)) {
      this.operatingSystem = 'android';
    } else if (/Macintosh/.test(ua)) {
      this.operatingSystem = 'macos';
    } else if (/Windows/.test(ua)) {
      this.operatingSystem = 'windows';
    } else {
      this.operatingSystem = 'unknown';
    }
    return this.operatingSystem;
  }

  detectScreen() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    if (this.screenWidth < 576) this.screenSize = 'xs';
    else if (this.screenWidth < 768) this.screenSize = 'sm';
    else if (this.screenWidth < 992) this.screenSize = 'md';
    else if (this.screenWidth < 1200) this.screenSize = 'lg';
    else this.screenSize = 'xl';

    return {
      width: this.screenWidth,
      height: this.screenHeight,
      size: this.screenSize,
      pixelRatio: this.pixelRatio,
      orientation: this.orientation
    };
  }

  detectConnection() {
    if ('connection' in (navigator as any)) {
      const conn = (navigator as any).connection;
      this.connectionType = conn.effectiveType || 'unknown';
      this.saveData = conn.saveData || false;
    } else {
      this.connectionType = 'unknown';
      this.saveData = false;
    }
    
    return {
      type: this.connectionType,
      saveData: this.saveData
    };
  }

  applyDetectionClasses() {
    const body = document.body;
    
    // Clear previous detection classes to avoid duplication on resize
    const classesToRemove = Array.from(body.classList).filter(c => 
      c.startsWith('device-') || c.startsWith('os-') || c.startsWith('screen-') || 
      c.startsWith('orientation-') || c.startsWith('connection-') || c === 'retina-display'
    );
    classesToRemove.forEach(c => body.classList.remove(c));

    // Add device classes without affecting existing classes
    body.classList.add(`device-${this.deviceType}`);
    body.classList.add(`os-${this.operatingSystem}`);
    body.classList.add(`screen-${this.screenSize}`);
    body.classList.add(`orientation-${this.orientation}`);
    
    // Add connection class if slow
    if (this.connectionType === 'slow-2g' || this.connectionType === '2g') {
      body.classList.add('connection-slow');
    } else if (this.connectionType === '4g' || this.connectionType === 'wifi') {
      body.classList.add('connection-fast');
    }
    
    // Add retina class for high DPI screens
    if (this.pixelRatio >= 2) {
      body.classList.add('retina-display');
    }
  }

  setupResizeListener() {
    let resizeTimeout: any;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.detectScreen();
        this.applyDetectionClasses();
      }, 250);
    });
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.detectScreen();
        this.applyDetectionClasses();
      }, 100);
    });
  }

  getSummary() {
    return {
      device: this.deviceType,
      os: this.operatingSystem,
      screen: {
        width: this.screenWidth,
        height: this.screenHeight,
        size: this.screenSize,
        orientation: this.orientation
      },
      display: {
        pixelRatio: this.pixelRatio,
        isRetina: this.pixelRatio >= 2
      },
      connection: {
        type: this.connectionType,
        saveData: this.saveData
      },
      timestamp: new Date().toISOString()
    };
  }
}